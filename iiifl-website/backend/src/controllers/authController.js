const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.register = async (req, res, next) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const { email, password, full_name, phone_number } = req.body;

    // Check if user exists
    const userCheck = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return next(new AppError('Email already registered', 400));
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Get default role (trader) - assuming ID 2 is trader, need to ensure seeds
    // Better: Select role id by name
    const roleRes = await client.query("SELECT id FROM roles WHERE name = 'trader'");
    const roleId = roleRes.rows[0]?.id || 1; // Fallback

    // Insert User
    const newUserRes = await client.query(
      `INSERT INTO users (email, password_hash, full_name, phone_number, role_id) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name`,
      [email, passwordHash, full_name, phone_number, roleId]
    );
    const newUser = newUserRes.rows[0];

    // Create default Wallet (INR)
    await client.query(
      `INSERT INTO wallets (user_id, currency, balance) VALUES ($1, 'INR', 0.00)`,
      [newUser.id]
    );

    await client.query('COMMIT');

    const token = signToken(newUser.id);

    res.status(201).json({
      status: 'success',
      token,
      data: { user: newUser },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const result = await db.query(
      `SELECT u.id, u.email, u.full_name, u.password_hash, r.name as role 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.email = $1`,
      [email]
    );
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    const token = signToken(user.id);

    // Log Audit
    await db.query(
        `INSERT INTO audit_logs (user_id, action, ip_address, user_agent) VALUES ($1, 'LOGIN_SUCCESS', $2, $3)`,
        [user.id, req.ip, req.headers['user-agent']]
    );

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        }
      }
    });
  } catch (err) {
    next(err);
  }
};
