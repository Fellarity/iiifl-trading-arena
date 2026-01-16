const jwt = require('jsonwebtoken');
const db = require('../config/db');
const AppError = require('../utils/appError');

const protect = async (req, res, next) => {
  try {
    // 1) Get token and check of it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }

    // 2) Verification token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const result = await db.query(
      `SELECT u.id, u.email, u.role_id, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = $1 AND u.is_active = TRUE`,
      [decoded.id]
    );

    const currentUser = result.rows[0];
    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist.',
          401
        )
      );
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (err) {
    return next(new AppError('Invalid or expired token', 401));
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles param is an array ['admin', 'trader']
    if (!roles.includes(req.user.role_name)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

module.exports = { protect, restrictTo };
