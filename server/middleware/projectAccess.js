const Project = require('../models/Project');

function ApiError(status, msg, expose) {
  const e = new Error(msg);
  e.status = status;
  e.expose = expose;
  return e;
}

function memberRecord(project, userId) {
  return project.members.find((m) => String(m.user) === String(userId));
}

async function loadProject(req, res, next) {
  const { projectId } = req.params;
  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ ok: false, error: 'Project not found' });

    const me = memberRecord(project, req.userId);
    if (!me && req.user?.role !== 'admin') {
      return res.status(403).json({ ok: false, error: 'Not a member of this project' });
    }

    req.project = project;
    req.projectRole = req.user?.role === 'admin' ? 'admin' : me.role;
    next();
  } catch (err) {
    next(err);
  }
}

async function requireProjectAdmin(req, res, next) {
  const isPlatformAdmin = req.user?.role === 'admin';
  const isProjectAdmin = req.projectRole === 'admin';
  if (!isPlatformAdmin && !isProjectAdmin) {
    return res.status(403).json({ ok: false, error: 'Admins only' });
  }
  next();
}

module.exports = { loadProject, requireProjectAdmin, ApiError };
