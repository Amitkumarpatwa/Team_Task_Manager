const authService = require('../services/authService');

function bad(msg) {
  const e = new Error(msg);
  e.status = 400;
  e.expose = true;
  return e;
}

async function signup(req, res, next) {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password || !name) throw bad('email, password, name required');
    if (typeof password !== 'string' || password.length < 6) throw bad('password too short');

    const out = await authService.signup({ email, password, name });
    res.status(201).json({ ok: true, ...out });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) throw bad('email and password required');

    const out = await authService.login({ email, password });
    res.json({ ok: true, ...out });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login };
