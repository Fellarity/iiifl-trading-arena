const db = require('../config/db');

exports.getAlerts = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT a.*, s.symbol, s.name 
       FROM alerts a 
       JOIN assets s ON a.asset_id = s.id 
       WHERE a.user_id = $1 
       ORDER BY a.created_at DESC`,
      [req.user.id]
    );
    res.status(200).json({ status: 'success', data: { alerts: result.rows } });
  } catch (err) {
    next(err);
  }
};

exports.createAlert = async (req, res, next) => {
  try {
    const { assetId, targetPrice, condition } = req.body;
    const result = await db.query(
      `INSERT INTO alerts (user_id, asset_id, target_price, condition) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, assetId, targetPrice, condition || 'GREATER']
    );
    res.status(201).json({ status: 'success', data: { alert: result.rows[0] } });
  } catch (err) {
    next(err);
  }
};

exports.deleteAlert = async (req, res, next) => {
    try {
        const { id } = req.params;
        await db.query(`DELETE FROM alerts WHERE id = $1 AND user_id = $2`, [id, req.user.id]);
        res.status(200).json({ status: 'success', message: 'Alert deleted' });
    } catch (err) {
        next(err);
    }
};
