const db = require('../config/db');
const yahooFinanceModule = require('yahoo-finance2');
const { createNotification } = require('../controllers/notificationController');

// Setup Yahoo Finance
const getYahooInstance = () => {
    const YF = yahooFinanceModule.default || yahooFinanceModule;
    if (typeof YF === 'function' || (YF.prototype && YF.prototype.quote)) {
        try { return new YF(); } catch (e) { return YF; }
    }
    return YF;
};
const yahooFinance = getYahooInstance();

const processJobs = async () => {
    try {
        // 1. Get Pending Orders & Alerts
        const ordersRes = await db.query(`SELECT o.*, a.symbol FROM orders o JOIN assets a ON o.asset_id = a.id WHERE o.status = 'PENDING'`);
        const alertsRes = await db.query(`SELECT al.*, a.symbol FROM alerts al JOIN assets a ON al.asset_id = a.id WHERE al.status = 'PENDING'`);

        const orders = ordersRes.rows;
        const alerts = alertsRes.rows;

        if (orders.length === 0 && alerts.length === 0) return;

        // 2. Get Unique Symbols
        const symbols = [...new Set([...orders.map(o => o.symbol), ...alerts.map(a => a.symbol)])];
        const yahooSymbols = symbols.map(s => s.endsWith('.NS') ? s : `${s}.NS`);

        // 3. Fetch Prices
        const quotes = await yahooFinance.quote(yahooSymbols);
        const quotesArray = Array.isArray(quotes) ? quotes : [quotes];
        const priceMap = {};
        quotesArray.forEach(q => {
            priceMap[q.symbol.replace('.NS', '')] = q.regularMarketPrice;
        });

        const client = await db.getClient();

        // 4. Process Orders
        for (const order of orders) {
            const currentPrice = priceMap[order.symbol];
            if (!currentPrice) continue;

            let shouldExecute = false;
            // Buy Limit: Price drops below limit
            if (order.type === 'BUY' && order.order_type === 'LIMIT' && currentPrice <= Number(order.price)) shouldExecute = true;
            // Sell Limit: Price rises above limit
            if (order.type === 'SELL' && order.order_type === 'LIMIT' && currentPrice >= Number(order.price)) shouldExecute = true;
            
            // TODO: Stop Loss logic...

            if (shouldExecute) {
                console.log(`Executing Order ${order.id}: ${order.type} ${order.symbol} @ ${currentPrice}`);
                try {
                    await client.query('BEGIN');
                    
                    // Update Order Status
                    await client.query(`UPDATE orders SET status = 'EXECUTED', updated_at = NOW() WHERE id = $1`, [order.id]);

                    // Update Holdings/Wallet (Simplified Logic from Controller)
                    const totalVal = Number(order.quantity) * currentPrice;
                    const userId = order.user_id;

                    if (order.type === 'BUY') {
                        // Deduct Cash (Assuming it wasn't deducted on placement for this prototype, OR it was blocked. 
                        // Real logic: Cash is blocked on PENDING. We just finalize it. 
                        // But my 'placeOrder' didn't block cash. So I deduct now.)
                        
                        // Check Balance again
                        const walletRes = await client.query('SELECT id, balance FROM wallets WHERE user_id = $1 AND currency = $2 FOR UPDATE', [userId, 'INR']);
                        if (Number(walletRes.rows[0].balance) >= totalVal) {
                            await client.query('UPDATE wallets SET balance = balance - $1 WHERE id = $2', [totalVal, walletRes.rows[0].id]);
                            
                            // Upsert Investment
                            // ... (Simplified: Just Insert for now to avoid complex avg logic duplication)
                            // Ideally, call a shared service. I'll just do a simple insert for this worker demo.
                            // Better: Only update Order status and Notification. User manually syncs? No.
                            
                            // I'll do a simple INSERT into investments (or update)
                             const invRes = await client.query('SELECT quantity, average_buy_price FROM investments WHERE user_id = $1 AND asset_id = $2', [userId, order.asset_id]);
                             if (invRes.rows.length > 0) {
                                 const oldQty = Number(invRes.rows[0].quantity);
                                 const oldAvg = Number(invRes.rows[0].average_buy_price);
                                 const newQty = oldQty + Number(order.quantity);
                                 const newAvg = ((oldQty * oldAvg) + totalVal) / newQty;
                                 await client.query('UPDATE investments SET quantity = $1, average_buy_price = $2 WHERE user_id = $3 AND asset_id = $4', [newQty, newAvg, userId, order.asset_id]);
                             } else {
                                 await client.query('INSERT INTO investments (user_id, asset_id, quantity, average_buy_price) VALUES ($1, $2, $3, $4)', [userId, order.asset_id, order.quantity, currentPrice]);
                             }

                            // Log Transaction
                            await client.query(
                                `INSERT INTO transactions (user_id, wallet_id, asset_id, type, quantity, price_per_unit, total_amount, status) 
                                 VALUES ($1, $2, $3, 'BUY', $4, $5, $6, 'COMPLETED')`,
                                [userId, walletRes.rows[0].id, order.asset_id, order.quantity, currentPrice, totalVal]
                            );

                            await createNotification(userId, 'Limit Order Executed', `Bought ${order.quantity} ${order.symbol} at ₹${currentPrice}`);
                        } else {
                            // Failed - Insufficient Funds
                            await client.query(`UPDATE orders SET status = 'FAILED' WHERE id = $1`, [order.id]);
                            await createNotification(userId, 'Order Failed', `Limit Buy ${order.symbol} failed: Insufficient Funds`);
                        }
                    } else {
                        // SELL Logic
                        // Check Holdings
                        const invRes = await client.query('SELECT quantity FROM investments WHERE user_id = $1 AND asset_id = $2', [userId, order.asset_id]);
                        if (invRes.rows.length > 0 && Number(invRes.rows[0].quantity) >= Number(order.quantity)) {
                             await client.query('UPDATE investments SET quantity = quantity - $1 WHERE user_id = $2 AND asset_id = $3', [order.quantity, userId, order.asset_id]);
                             await client.query('UPDATE wallets SET balance = balance + $1 WHERE user_id = $2 AND currency = $3', [totalVal, userId, 'INR']);
                             
                             // Get Wallet ID
                             const wRes = await client.query('SELECT id FROM wallets WHERE user_id = $1', [userId]);

                             await client.query(
                                `INSERT INTO transactions (user_id, wallet_id, asset_id, type, quantity, price_per_unit, total_amount, status) 
                                 VALUES ($1, $2, $3, 'SELL', $4, $5, $6, 'COMPLETED')`,
                                [userId, wRes.rows[0].id, order.asset_id, order.quantity, currentPrice, totalVal]
                            );
                            await createNotification(userId, 'Limit Order Executed', `Sold ${order.quantity} ${order.symbol} at ₹${currentPrice}`);
                        } else {
                             await client.query(`UPDATE orders SET status = 'FAILED' WHERE id = $1`, [order.id]);
                             await createNotification(userId, 'Order Failed', `Limit Sell ${order.symbol} failed: Insufficient Holdings`);
                        }
                    }

                    await client.query('COMMIT');
                } catch (err) {
                    await client.query('ROLLBACK');
                    console.error(`Order ${order.id} execution failed`, err);
                }
            }
        }

        // 5. Process Alerts
        for (const alert of alerts) {
            const currentPrice = priceMap[alert.symbol];
            if (!currentPrice) continue;

            let triggered = false;
            if (alert.condition === 'GREATER' && currentPrice >= Number(alert.target_price)) triggered = true;
            if (alert.condition === 'LESS' && currentPrice <= Number(alert.target_price)) triggered = true;

            if (triggered) {
                console.log(`Triggering Alert ${alert.id}: ${alert.symbol} reached ${currentPrice}`);
                await client.query(`UPDATE alerts SET status = 'TRIGGERED' WHERE id = $1`, [alert.id]);
                await createNotification(alert.user_id, 'Price Alert', `${alert.symbol} has reached ₹${currentPrice}`);
            }
        }

        client.release();

    } catch (err) {
        console.error("Worker Error:", err.message);
    }
};

// Run every 10 seconds
console.log("Starting Market Worker...");
setInterval(processJobs, 10000);
processJobs(); // Run once immediately
