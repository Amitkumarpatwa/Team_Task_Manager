const express = require('express');
const authController = require('../controllers/authController');
const projectController = require('../controllers/projectController');
const taskController = require('../controllers/taskController');
const dashboardController = require('../controllers/dashboardController');
const { authenticate, attachUser } = require('../middleware/authenticate');
const { loadProject, requireProjectAdmin } = require('../middleware/projectAccess');

const router = express.Router();

router.get('/health', (_req, res) => res.json({ ok: true }));

router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);

router.use(authenticate, attachUser);

router.get('/dashboard/stats', dashboardController.stats);

router.post('/projects', projectController.create);
router.get('/projects', projectController.listMine);

router.post('/projects/:projectId/members', loadProject, requireProjectAdmin, projectController.addMember);
router.delete('/projects/:projectId/members/me', loadProject, projectController.removeSelf);
router.delete(
  '/projects/:projectId/members/:userId',
  loadProject,
  requireProjectAdmin,
  projectController.removeMember
);
router.delete('/projects/:projectId', loadProject, requireProjectAdmin, projectController.destroy);

router.get('/projects/:projectId/tasks', loadProject, taskController.list);
router.post('/projects/:projectId/tasks', loadProject, requireProjectAdmin, taskController.create);
router.patch('/projects/:projectId/tasks/:taskId', loadProject, taskController.update);

module.exports = router;
