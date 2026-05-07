const taskService = require('../services/taskService');

async function list(req, res, next) {
  try {
    const tasks = await taskService.listTasks(req.project);
    res.json({ ok: true, tasks });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const task = await taskService.createTask(req.project, req.userId, req.body || {});
    res.status(201).json({ ok: true, task });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const task = await taskService.updateTask(
      req.project,
      req.params.taskId,
      req.body || {},
      req.projectRole,
      req.userId
    );
    res.json({ ok: true, task });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update };
