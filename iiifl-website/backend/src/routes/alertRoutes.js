const express = require('express');
const alertController = require('../controllers/alertController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', alertController.getAlerts);
router.post('/', alertController.createAlert);
router.delete('/:id', alertController.deleteAlert);

module.exports = router;
