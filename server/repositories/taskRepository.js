const Task = require('../models/Task');

function listForProject(projectId) {
  return Task.find({ project: projectId }).sort({ updatedAt: -1 }).populate('assignee createdBy', 'email name').lean();
}

async function createTask(doc) {
  const t = await Task.create(doc);
  return Task.findById(t._id).populate('assignee createdBy', 'email name').lean();
}

async function findTaskInProject(taskId, projectId) {
  return Task.findOne({ _id: taskId, project: projectId }).populate('assignee createdBy', 'email name').lean();
}

async function patchTask(taskId, projectId, patch) {
  return Task.findOneAndUpdate({ _id: taskId, project: projectId }, patch, { new: true })
    .populate('assignee createdBy', 'email name')
    .lean();
}

module.exports = { listForProject, createTask, findTaskInProject, patchTask };
