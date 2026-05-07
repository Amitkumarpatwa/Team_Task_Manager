const logger = require('../utils/logger');

function errorHandler(err, req, res, _next) {
  if (err.name === 'CastError') {
    return res.status(400).json({ ok: false, error: 'Bad id' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ ok: false, error: 'Duplicate value' });
  }

  const status = err.status || err.statusCode || 500;
  const body =
    err.expose === true ? { ok: false, error: err.message } : { ok: false, error: 'Something went wrong' };

  if (status >= 500) {
    logger.error(err.message || 'Unknown error');
    logger.error(err.stack);
  } else {
    logger.warn(err.message || 'client error');
  }

  res.status(status).json(body);
}

module.exports = errorHandler;
