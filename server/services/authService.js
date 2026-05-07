const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepo = require('../repositories/userRepository');
const logger = require('../utils/logger');

async function signup({ email, password, name }) {
  const normalized = email?.trim()?.toLowerCase();
  const existing = await userRepo.findByEmail(normalized);
  if (existing) {
    const err = new Error('Email taken');
    err.status = 409;
    err.expose = true;
    throw err;
  }

  const UserModel = require('../models/User');
  const usersCount = await UserModel.countDocuments();
  const seedRole = usersCount === 0 ? 'admin' : 'member';

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userRepo.createUser({
    email: normalized,
    passwordHash,
    name: name.trim(),
    role: seedRole,
  });

  logger.info(`User signup: ${user.email}`);
  const token = signToken(user._id.toString(), user.role);
  const safeUser = {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
  return { user: safeUser, token };
}

async function login({ email, password }) {
  const normalized = email?.trim()?.toLowerCase();
  const user = await userRepo.findByEmail(normalized);
  if (!user?.passwordHash) {
    const err = new Error('Bad credentials');
    err.status = 401;
    err.expose = true;
    throw err;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const err = new Error('Bad credentials');
    err.status = 401;
    err.expose = true;
    throw err;
  }

  logger.info(`User login: ${user.email}`);
  const safe = {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
  const token = signToken(safe.id.toString(), safe.role);
  return { user: safe, token };
}

function signToken(sub, role) {
  return jwt.sign({ sub, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

module.exports = { signup, login };
