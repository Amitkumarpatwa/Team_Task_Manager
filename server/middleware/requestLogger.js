const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const ms = Date.now() - start;
    logger.info(`${method} ${originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });

  next();
}

module.exports = requestLogger;
