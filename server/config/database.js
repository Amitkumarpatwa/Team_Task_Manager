const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function connectDb() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not set');

  mongoose.connection.on('error', (err) => {
    logger.error('Mongo connection error', { message: err.message });
  });

  await mongoose.connect(uri);
  logger.info('Connected to MongoDB');
}

module.exports = { connectDb };
