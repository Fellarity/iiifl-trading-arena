const db = require('../config/db');
const AppError = require('../utils/appError');
const yahooFinanceModule = require('yahoo-finance2');

// Fallback: Use default export, or the module itself, or instantiate if needed
let yahooFinance = yahooFinanceModule.default || yahooFinanceModule;

// Fix for "Call const yahooFinance = new YahooFinance() first" error
if (typeof yahooFinance === 'function' || (yahooFinance.prototype && yahooFinance.prototype.quote)) {
    try {
        yahooFinance = new yahooFinance();
    } catch (e) {
        // If it fails (e.g. it wasn't a constructor), keep original
    }
}

exports.getPortfolio = async (req, res, next) => {
  try {
    // Get Cash Balance
    const walletRes = await db.query(
      'SELECT balance, currency FROM wallets WHERE user_id = $1',
      [req.user.id]
    );
    
    // Get Holdings
    const holdingsRes = await db.query(
      `SELECT i.asset_id, a.symbol, a.name, i.quantity, i.average_buy_price 
       FROM investments i 
       JOIN assets a ON i.asset_id = a.id 
       WHERE i.user_id = $1 AND i.quantity > 0`,
      [req.user.id]
    );

    let holdings = holdingsRes.rows;
    let totalInvested = 0;
    let currentPortfolioValue = 0;

    // Fetch Live Prices if holdings exist
    if (holdings.length > 0) {
        const symbols = holdings.map(h => h.symbol.endsWith('.NS') ? h.symbol : `${h.symbol}.NS`);
        try {
            const quotes = await yahooFinance.quote(symbols);
            // Create a map for fast lookup
            // If single result, quote returns object, if multiple array. Normalize to array.
            const quotesArray = Array.isArray(quotes) ? quotes : [quotes];
            const priceMap = {};
            quotesArray.forEach(q => {
                priceMap[q.symbol.replace('.NS', '')] = q.regularMarketPrice;
            });

            holdings = holdings.map(h => {
                let livePrice = Number(priceMap[h.symbol] || h.average_buy_price || 0);
                
                // DEMO ONLY: Add artificial volatility (+/- 1.5%) so P&L moves
                const volatility = (Math.random() * 0.03) - 0.015; 
                livePrice = livePrice * (1 + volatility);

                const quantity = Number(h.quantity || 0);
                const avgPrice = Number(h.average_buy_price || 0);

                const investedVal = quantity * avgPrice;
                const currentVal = quantity * livePrice;
                
                totalInvested += investedVal;
                currentPortfolioValue += currentVal;

                let pnl = currentVal - investedVal;
                let pnl_percent = 0;
                
                if (investedVal > 0) {
                    pnl_percent = (pnl / investedVal) * 100;
                }

                return {
                    ...h,
                    live_price: livePrice,
                    total_value: currentVal,
                    invested_value: investedVal,
                    pnl: pnl,
                    pnl_percent: pnl_percent
                };
            });

        } catch (err) {
            console.error("Live Price Fetch Failed:", err);
            // Fallback to avg price
            holdings = holdings.map(h => {
                 const val = Number(h.quantity) * Number(h.average_buy_price);
                 totalInvested += val;
                 currentPortfolioValue += val;
                 return { ...h, live_price: h.average_buy_price, total_value: val, invested_value: val, pnl: 0, pnl_percent: 0 };
            });
        }
    }

    const cashBalance = Number(walletRes.rows[0]?.balance || 0);

    const portfolio = {
      cash: walletRes.rows[0] || { balance: 0, currency: 'INR' },
      holdings: holdings,
      summary: {
          total_invested: totalInvested,
          current_value: currentPortfolioValue,
          total_portfolio_value: currentPortfolioValue + cashBalance,
          day_gain: 0 // TODO: Calculate if we had previous close
      }
    };

    res.status(200).json({
      status: 'success',
      data: portfolio,
    });
  } catch (err) {
    next(err);
  }
};

exports.buyAsset = async (req, res, next) => {
  const client = await db.getClient();
  try {
    const { assetId, quantity, price } = req.body; // In real app, price comes from server/market, not body!
    const userId = req.user.id;
    const totalCost = Number(quantity) * Number(price);

    await client.query('BEGIN');

    // 1. Check Balance & Lock Row
    const walletRes = await client.query(
      'SELECT id, balance FROM wallets WHERE user_id = $1 AND currency = $2 FOR UPDATE',
      [userId, 'INR']
    );
    
    if (walletRes.rows.length === 0) throw new AppError('Wallet not found', 404);
    
    const wallet = walletRes.rows[0];
    if (Number(wallet.balance) < totalCost) {
      throw new AppError('Insufficient funds', 400);
    }

    // 2. Deduct Cash
    await client.query(
      'UPDATE wallets SET balance = balance - $1 WHERE id = $2',
      [totalCost, wallet.id]
    );

    // 3. Upsert Investment (Add Quantity, Recalculate Avg Price)
    // Complex logic: NewAvg = ((OldQty * OldAvg) + (NewQty * NewPrice)) / (OldQty + NewQty)
    const invRes = await client.query(
      'SELECT quantity, average_buy_price FROM investments WHERE user_id = $1 AND asset_id = $2',
      [userId, assetId]
    );

    if (invRes.rows.length > 0) {
      const oldQty = Number(invRes.rows[0].quantity);
      const oldAvg = Number(invRes.rows[0].average_buy_price);
      const newQty = oldQty + Number(quantity);
      const newAvg = ((oldQty * oldAvg) + totalCost) / newQty;

      await client.query(
        'UPDATE investments SET quantity = $1, average_buy_price = $2, updated_at = NOW() WHERE user_id = $3 AND asset_id = $4',
        [newQty, newAvg, userId, assetId]
      );
    } else {
      await client.query(
        'INSERT INTO investments (user_id, asset_id, quantity, average_buy_price) VALUES ($1, $2, $3, $4)',
        [userId, assetId, quantity, price]
      );
    }

    // 4. Log Transaction
    await client.query(
      `INSERT INTO transactions (user_id, wallet_id, asset_id, type, quantity, price_per_unit, total_amount, status) 
       VALUES ($1, $2, $3, 'BUY', $4, $5, $6, 'COMPLETED')`,
      [userId, wallet.id, assetId, quantity, price, totalCost]
    );

    await client.query('COMMIT');

    res.status(200).json({ status: 'success', message: 'Buy order executed' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

exports.sellAsset = async (req, res, next) => {
    const client = await db.getClient();
    try {
      const { assetId, quantity, price } = req.body;
      const userId = req.user.id;
      const totalProceeds = Number(quantity) * Number(price);
  
      await client.query('BEGIN');
  
      // 1. Check Holdings
      const invRes = await client.query(
        'SELECT quantity FROM investments WHERE user_id = $1 AND asset_id = $2 FOR UPDATE',
        [userId, assetId]
      );
  
      if (invRes.rows.length === 0 || Number(invRes.rows[0].quantity) < Number(quantity)) {
        throw new AppError('Insufficient holdings', 400);
      }
  
      // 2. Update Investment
      const newQty = Number(invRes.rows[0].quantity) - Number(quantity);
      await client.query(
        'UPDATE investments SET quantity = $1, updated_at = NOW() WHERE user_id = $2 AND asset_id = $3',
        [newQty, userId, assetId]
      );
  
      // 3. Add Cash
      await client.query(
        'UPDATE wallets SET balance = balance + $1 WHERE user_id = $2 AND currency = $3',
        [totalProceeds, userId, 'INR']
      );

      // Get Wallet ID for transaction log
      const walletRes = await client.query('SELECT id FROM wallets WHERE user_id = $1 AND currency = $2', [userId, 'INR']);
  
      // 4. Log Transaction
      await client.query(
        `INSERT INTO transactions (user_id, wallet_id, asset_id, type, quantity, price_per_unit, total_amount, status) 
         VALUES ($1, $2, $3, 'SELL', $4, $5, $6, 'COMPLETED')`,
        [userId, walletRes.rows[0].id, assetId, quantity, price, totalProceeds]
      );
  
      await client.query('COMMIT');
  
      res.status(200).json({ status: 'success', message: 'Sell order executed' });
    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
  };

exports.getTransactions = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT t.id, a.symbol as stock, t.type, t.quantity as qty, t.price_per_unit as price, 
              t.executed_at as date, t.status 
       FROM transactions t
       JOIN assets a ON t.asset_id = a.id
       WHERE t.user_id = $1
       ORDER BY t.executed_at DESC
       LIMIT 10`,
      [req.user.id]
    );

    res.status(200).json({
      status: 'success',
      data: { transactions: result.rows },
    });
  } catch (err) {
    next(err);
  }
};

exports.getPerformance = async (req, res, next) => {
  // Mocking performance data for the chart
  // In a real app, this would query the 'portfolio_snapshots' table
  const mockData = [
    { name: "Jan", value: 10000 },
    { name: "Feb", value: 12500 },
    { name: "Mar", value: 11000 },
    { name: "Apr", value: 14000 },
    { name: "May", value: 13500 },
    { name: "Jun", value: 16000 },
    { name: "Jul", value: 18500 },
  ];
  
  res.status(200).json({
    status: 'success',
    data: { chart: mockData },
  });
};

exports.searchAssets = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(200).json({ status: 'success', data: { assets: [] } });

    const result = await db.query(
      `SELECT id, symbol, name, type, exchange FROM assets 
       WHERE symbol ILIKE $1 OR name ILIKE $1 
       LIMIT 10`,
      [`%${query}%`]
    );

    res.status(200).json({
      status: 'success',
      data: { assets: result.rows },
    });
  } catch (err) {
    next(err);
  }
};
