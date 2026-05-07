const dashboardService = require('../services/dashboardService');

async function stats(req, res, next) {
  try {
    const stats = await dashboardService.statsForUser(req.userId, req.user.role);
    res.json({ ok: true, stats });
  } catch (err) {
    next(err);
  }
}

module.exports = { stats };
