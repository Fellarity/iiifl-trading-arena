const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes restricted to Admin
router.use(protect);
router.use(restrictTo('admin'));

router.get('/users', adminController.getAllUsers);
router.patch('/users/:userId', adminController.blockUser);

module.exports = router;
