const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../config/db');
const { createNotification } = require('./notificationController');

// Initialize Razorpay
// For production, use process.env.RAZORPAY_KEY_ID
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_1234567890',
});

exports.createOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt: "order_rcptid_" + Date.now(),
    };

    const order = await instance.orders.create(options);
    
    res.status(200).json({
        status: 'success',
        data: order
    });
  } catch (err) {
    console.error("Razorpay Order Error:", err);
    res.status(500).json({ status: 'error', message: 'Payment initiation failed' });
  }
};

exports.verifyPayment = async (req, res, next) => {
  const client = await db.getClient();
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
    const userId = req.user.id;

    // Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret_1234567890')
        .update(body.toString())
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ status: 'fail', message: 'Invalid Signature' });
    }

    await client.query('BEGIN');

    // 1. Add Balance
    const walletRes = await client.query('SELECT id FROM wallets WHERE user_id = $1', [userId]);
    const walletId = walletRes.rows[0].id;

    await client.query(
        'UPDATE wallets SET balance = balance + $1 WHERE id = $2',
        [amount, walletId]
    );

    // 2. Log Transaction
    await client.query(
        `INSERT INTO transactions (user_id, wallet_id, type, total_amount, status) 
         VALUES ($1, $2, 'DEPOSIT', $3, 'COMPLETED')`,
        [userId, walletId, amount]
    );

    await createNotification(userId, 'Funds Added', `Deposited ₹${amount} via Razorpay`);

    await client.query('COMMIT');

    res.status(200).json({ status: 'success', message: 'Payment verified and funds added' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Payment Verify Error:", err);
    res.status(500).json({ status: 'error', message: 'Payment verification failed' });
  } finally {
    client.release();
  }
};
