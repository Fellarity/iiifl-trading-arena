const db = require('../config/db');

exports.getNotifications = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [req.user.id]
    );
    res.status(200).json({ status: 'success', data: { notifications: result.rows } });
  } catch (err) {
    next(err);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    await db.query(
      `UPDATE notifications SET is_read = TRUE WHERE user_id = $1`,
      [req.user.id]
    );
    res.status(200).json({ status: 'success', message: 'All marked as read' });
  } catch (err) {
    next(err);
  }
};

// Internal Helper to trigger notif
exports.createNotification = async (userId, title, message) => {
    try {
        await db.query(
            `INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)`,
            [userId, title, message]
        );
    } catch (e) {
        console.error("Failed to create notification", e);
    }
};
