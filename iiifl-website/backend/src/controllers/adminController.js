const db = require('../config/db');
const AppError = require('../utils/appError');

exports.getAllUsers = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, email, full_name, is_active, created_at FROM users ORDER BY created_at DESC'
    );

    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: { users: result.rows },
    });
  } catch (err) {
    next(err);
  }
};

exports.blockUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { active } = req.body; // true or false

    const result = await db.query(
      'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, is_active',
      [active, userId]
    );

    if (result.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { user: result.rows[0] },
    });
  } catch (err) {
    next(err);
  }
};
