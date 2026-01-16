const express = require('express');
const Joi = require('joi');
const authController = require('../controllers/authController');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  full_name: Joi.string().required(),
  phone_number: Joi.string().pattern(/^[0-9]+$/).length(10)
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

module.exports = router;
