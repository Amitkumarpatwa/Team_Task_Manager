const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  const origin = process.env.CLIENT_ORIGIN || true;
  app.use(cors({ origin }));
  app.use(express.json({ limit: '1mb' }));
  app.use(requestLogger);

  app.use('/api', routes);

  // one-box production: serve CRA/Vite build from ../client/dist
  if (process.env.SERVE_STATIC === '1' || process.env.NODE_ENV === 'production') {
    const clientDir = path.join(__dirname, '..', 'client', 'dist');
    app.use(express.static(clientDir));
    app.get(/^\/(?!api).*/, (_req, res) => {
      res.sendFile(path.join(clientDir, 'index.html'));
    });
  }

  app.use(errorHandler);
  return app;
}

module.exports = createApp;
