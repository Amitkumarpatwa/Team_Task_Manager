const Project = require('../models/Project');

function byId(projectId) {
  return Project.findById(projectId);
}

async function projectsForUser(userId) {
  return Project.find({ 'members.user': userId })
    .sort({ updatedAt: -1 })
    .populate('members.user', 'email name')
    .lean();
}

async function save(projectDoc) {
  return projectDoc.save();
}

async function deleteById(projectId) {
  return Project.findByIdAndDelete(projectId);
}

module.exports = { byId, projectsForUser, save, deleteById };
