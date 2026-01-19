const express = require('express');
const ordersController = require('../controllers/ordersController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', ordersController.getOrders);
router.post('/', ordersController.placeOrder);
router.put('/:id/cancel', ordersController.cancelOrder);

module.exports = router;
