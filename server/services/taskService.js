const taskRepo = require('../repositories/taskRepository');
const User = require('../models/User');
const logger = require('../utils/logger');

const STATUSES = ['todo', 'in_progress', 'done'];

async function ensureAssigneeMember(projectMembers, assigneeId) {
  const hit = projectMembers.some((m) => String(m.user._id ?? m.user) === String(assigneeId));
  if (!hit) {
    const err = new Error('Assignee must be a project member');
    err.status = 400;
    err.expose = true;
    throw err;
  }
}

async function listTasks(projectDoc) {
  return taskRepo.listForProject(projectDoc._id);
}

async function createTask(projectDoc, actorId, body) {
  const title = body.title?.trim();
  if (!title) {
    const err = new Error('Title required');
    err.status = 400;
    err.expose = true;
    throw err;
  }

  let assignee = null;
  if (body.assignee) {
    const u = await User.findById(body.assignee).select('_id');
    if (!u) {
      const err = new Error('Assignee user not found');
      err.status = 400;
      err.expose = true;
      throw err;
    }
    await ensureAssigneeMember(projectDoc.members, body.assignee);
    assignee = u._id;
  }

  const task = await taskRepo.createTask({
    project: projectDoc._id,
    title,
    description: (body.description || '').trim(),
    status: STATUSES.includes(body.status) ? body.status : 'todo',
    assignee,
    createdBy: actorId,
  });

  logger.info(`Task created ${task._id} on project ${projectDoc._id}`);
  return task;
}

async function updateTask(projectDoc, taskId, body, actorRole, actorId) {
  const isAdmin = actorRole === 'admin';

  // ── Member guard: can only update status on tasks assigned to them ──
  if (!isAdmin) {
    // Members may NOT touch title, description, or assignee
    if (body.title !== undefined || body.description !== undefined || body.assignee !== undefined) {
      const err = new Error('Members can only update task status');
      err.status = 403;
      err.expose = true;
      throw err;
    }

    // Verify the task exists and is assigned to this member
    const existing = await taskRepo.findTaskInProject(taskId, projectDoc._id);
    if (!existing) {
      const err = new Error('Task not found');
      err.status = 404;
      err.expose = true;
      throw err;
    }

    const assigneeId = existing.assignee?._id || existing.assignee;
    if (String(assigneeId) !== String(actorId)) {
      const err = new Error('You can only update tasks assigned to you');
      err.status = 403;
      err.expose = true;
      throw err;
    }
  }

  const patch = {};
  if (body.title !== undefined) {
    const t = body.title?.trim();
    if (!t) {
      const err = new Error('Title cannot be empty');
      err.status = 400;
      err.expose = true;
      throw err;
    }
    patch.title = t;
  }
  if (body.description !== undefined) patch.description = (body.description || '').trim();
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) {
      const err = new Error('Bad status');
      err.status = 400;
      err.expose = true;
      throw err;
    }
    patch.status = body.status;
  }
  if (body.assignee !== undefined) {
    if (body.assignee === null || body.assignee === '') {
      patch.assignee = null;
    } else {
      const u = await User.findById(body.assignee).select('_id');
      if (!u) {
        const err = new Error('Assignee user not found');
        err.status = 400;
        err.expose = true;
        throw err;
      }
      await ensureAssigneeMember(projectDoc.members, body.assignee);
      patch.assignee = u._id;
    }
  }

  const updated = await taskRepo.patchTask(taskId, projectDoc._id, patch);
  if (!updated) {
    const err = new Error('Task not found');
    err.status = 404;
    err.expose = true;
    throw err;
  }

  logger.info(`Task updated ${taskId}`);
  return updated;
}

module.exports = { listTasks, createTask, updateTask };
