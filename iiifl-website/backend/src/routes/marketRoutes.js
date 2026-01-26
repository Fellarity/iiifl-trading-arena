const express = require('express');
const marketController = require('../controllers/marketController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all market routes
router.use(protect);

router.get('/indices', marketController.getIndices);
router.get('/quote/:symbol', marketController.getQuote);
router.get('/history/:symbol', marketController.getHistory);
router.get('/news/:symbol', marketController.getNews);
router.get('/watchlist', marketController.getWatchlist);
router.post('/watchlist', marketController.addToWatchlist);
router.delete('/watchlist/:id', marketController.removeFromWatchlist);
router.get('/movers', marketController.getMovers);

module.exports = router;