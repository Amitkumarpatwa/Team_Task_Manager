const Project = require('../models/Project');
const Task = require('../models/Task');

async function statsForUser(userId, userRole) {
  const projectFilter = userRole === 'admin' ? {} : { 'members.user': userId };
  const projects = await Project.find(projectFilter).select('_id').lean();
  const ids = projects.map((p) => p._id);

  if (ids.length === 0) {
    return {
      projectCount: 0,
      taskCount: 0,
      byStatus: { todo: 0, in_progress: 0, done: 0 },
      myOpenTasks: 0,
    };
  }

  const projectCount = ids.length;

  const agg = await Task.aggregate([
    { $match: { project: { $in: ids } } },
    {
      $group: {
        _id: '$status',
        n: { $sum: 1 },
      },
    },
  ]);

  const byStatus = { todo: 0, in_progress: 0, done: 0 };
  let taskCount = 0;
  for (const row of agg) {
    byStatus[row._id] = row.n;
    taskCount += row.n;
  }

  const myOpenTasks = await Task.countDocuments({
    project: { $in: ids },
    assignee: userId,
    status: { $ne: 'done' },
  });

  return { projectCount, taskCount, byStatus, myOpenTasks };
}

module.exports = { statsForUser };
