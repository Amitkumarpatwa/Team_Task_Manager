const User = require('../models/User');

async function findByEmail(email) {
  return User.findOne({ email }).lean();
}

async function findById(id) {
  return User.findById(id).lean();
}

async function createUser(payload) {
  const u = await User.create(payload);
  return u.toObject();
}

module.exports = { findByEmail, findById, createUser };
