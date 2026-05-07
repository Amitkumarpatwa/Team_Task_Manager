const projectService = require('../services/projectService');
const logger = require('../utils/logger');

async function create(req, res, next) {
  try {
    const project = await projectService.createProject(req.userId, req.body || {});
    res.status(201).json({ ok: true, project });
  } catch (err) {
    next(err);
  }
}

async function listMine(req, res, next) {
  try {
    const projects = await projectService.listProjects(req.userId, req.user.role);
    res.json({ ok: true, projects });
  } catch (err) {
    next(err);
  }
}

async function removeSelf(req, res, next) {
  try {
    const updated = await projectService.removeMember(req.project, req.userId);
    res.json({ ok: true, project: updated, gone: updated == null });
  } catch (err) {
    next(err);
  }
}

async function addMember(req, res, next) {
  try {
    const project = await projectService.addMember(req.project, req.body || {});
    res.json({ ok: true, project });
  } catch (err) {
    next(err);
  }
}

async function removeMember(req, res, next) {
  try {
    const { userId } = req.params;
    if (String(userId) === String(req.userId)) return res.status(400).json({ ok: false, error: 'Use leave endpoint' });

    const updated = await projectService.removeMember(req.project, userId);
    logger.info(`User ${req.userId} kicked ${userId} from project ${req.project._id}`);
    res.json({ ok: true, project: updated, gone: updated == null });
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    await projectService.deleteProject(req.project._id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, listMine, addMember, removeMember, removeSelf, destroy };
