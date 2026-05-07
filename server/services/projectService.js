const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const projectRepo = require('../repositories/projectRepository');
const logger = require('../utils/logger');

async function createProject(actorId, payload) {
  const { name, description } = payload;
  if (!name?.trim()) {
    const err = new Error('Name required');
    err.status = 400;
    err.expose = true;
    throw err;
  }

  const doc = await Project.create({
    name: name.trim(),
    description: (description || '').trim(),
    createdBy: actorId,
    members: [{ user: actorId, role: 'admin' }],
  });

  const populated = await Project.findById(doc._id).populate('members.user', 'email name').lean();

  logger.info(`Project created: ${populated.name} (${doc._id}) by ${actorId}`);
  return populated;
}

async function listProjects(actorId, userRole) {
  const filter =
    userRole === 'admin' ? {} : { 'members.user': actorId };
  return Project.find(filter).sort({ updatedAt: -1 }).populate('members.user', 'email name').lean();
}

async function addMember(projectDoc, { email, role }) {
  const normalized = email?.trim()?.toLowerCase();
  const buddy = await User.findOne({ email: normalized }).select('_id email name').lean();
  if (!buddy) {
    const err = new Error('User not found for that email');
    err.status = 404;
    err.expose = true;
    throw err;
  }

  const dup = projectDoc.members.some((m) => String(m.user) === String(buddy._id));
  if (dup) {
    const err = new Error('Already a member');
    err.status = 409;
    err.expose = true;
    throw err;
  }

  projectDoc.members.push({ user: buddy._id, role: role === 'admin' ? 'admin' : 'member' });
  await projectRepo.save(projectDoc);

  logger.info(`Member added to project ${projectDoc._id}: ${buddy.email}`);

  return Project.findById(projectDoc._id).populate('members.user', 'email name').lean();
}

async function removeMember(projectDoc, targetUserId) {
  projectDoc.members = projectDoc.members.filter((m) => String(m.user) !== String(targetUserId));

  if (projectDoc.members.length === 0) {
    await deleteProject(projectDoc._id);
    return null;
  }

  await projectRepo.save(projectDoc);
  logger.info(`Member removed from project ${projectDoc._id}`);
  return Project.findById(projectDoc._id).populate('members.user', 'email name').lean();
}

async function deleteProject(projectId) {
  await Task.deleteMany({ project: projectId });
  await projectRepo.deleteById(projectId);
  logger.warn(`Project deleted: ${projectId}`);
}

module.exports = { createProject, listProjects, addMember, removeMember, deleteProject };
