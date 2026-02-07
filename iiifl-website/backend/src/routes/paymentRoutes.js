const express = require('express');
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.post('/order', paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);

module.exports = router;
