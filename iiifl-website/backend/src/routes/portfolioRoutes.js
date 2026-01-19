const express = require('express');
const Joi = require('joi');
const portfolioController = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

const tradeSchema = Joi.object({
    assetId: Joi.string().uuid().required(),
    quantity: Joi.number().positive().required(),
    price: Joi.number().positive().required() // Mocking price input from client for now
});

router.get('/', portfolioController.getPortfolio);
router.get('/positions', portfolioController.getPositions);
router.get('/transactions', portfolioController.getTransactions);
router.get('/performance', portfolioController.getPerformance);
router.post('/buy', validate(tradeSchema), portfolioController.buyAsset);
router.post('/sell', validate(tradeSchema), portfolioController.sellAsset);
router.post('/deposit', portfolioController.deposit);
router.post('/withdraw', portfolioController.withdraw);

module.exports = router;
