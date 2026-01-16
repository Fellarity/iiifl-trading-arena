const express = require('express');
const portfolioController = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/search', portfolioController.searchAssets);

module.exports = router;
