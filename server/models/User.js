const mongoose = require('mongoose');

const ROLES = ['admin', 'member'];

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    /** platform-level role — admin can poke into any project's member list-ish; we mainly use project role */
    role: { type: String, enum: ROLES, default: 'member' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
