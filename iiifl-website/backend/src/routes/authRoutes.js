const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/2fa/validate', protect, authController.validate2FA); // Protect with tempToken

router.post('/2fa/setup', protect, authController.setup2FA);
router.post('/2fa/verify', protect, authController.verify2FA);

module.exports = router;
