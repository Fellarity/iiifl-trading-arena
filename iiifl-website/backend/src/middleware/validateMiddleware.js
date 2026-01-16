const AppError = require('../utils/appError');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const msg = error.details.map((el) => el.message).join(',');
      return next(new AppError(msg, 400));
    }
    next();
  };
};

module.exports = validate;
