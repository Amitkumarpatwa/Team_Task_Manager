require('dotenv').config();
const createApp = require('./app');
const { connectDb } = require('./config/database');
const logger = require('./utils/logger');

async function main() {
  if (!process.env.JWT_SECRET) {
    logger.error('JWT_SECRET missing — refusing to boot');
    process.exit(1);
  }

  await connectDb();

  const app = createApp();
  const port = Number(process.env.PORT) || 4000;
  app.listen(port, () => {
    logger.info(`API listening on ${port}`);
  });
}

main().catch((err) => {
  logger.error(err.stack || err.message);
  process.exit(1);
});
