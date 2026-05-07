import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';

export function ProjectPage() {
  const { projectId } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [title, setTitle] = useState('');
  const [err, setErr] = useState('');

  const myRole = useMemo(() => {
    if (!project || !user) return 'member';
    const row = project.members?.find((m) => String(m.user?._id || m.user) === String(user.id));
    if (user.role === 'admin' && !row) return 'admin';
    return row?.role || 'member';
  }, [project, user]);

  async function load() {
    const list = await api.projectsList();
    const p = list.projects.find((x) => x._id === projectId);
    setProject(p || null);
    const t = await api.tasksList(projectId);
    setTasks(t.tasks);
  }

  useEffect(() => {
    load().catch((e) => setErr(e.message));
  }, [projectId]);

  async function invite(e) {
    e.preventDefault();
    setErr('');
    await api.membersAdd(projectId, { email: inviteEmail, role: inviteRole });
    setInviteEmail('');
    await load();
  }

  async function addTask(e) {
    e.preventDefault();
    setErr('');
    if (!title.trim()) return;
    await api.taskCreate(projectId, { title });
    setTitle('');
    await load();
  }

  async function patchTask(task, patch) {
    setErr('');
    await api.taskUpdate(projectId, task._id, patch);
    await load();
  }

  async function leave() {
    await api.leaveProject(projectId);
    nav('/', { replace: true });
  }

  async function dumpProject() {
    if (!confirm('Delete project and all tasks?')) return;
    await api.deleteProject(projectId);
    nav('/', { replace: true });
  }

  if (!project) {
    return (
      <div className="card">
        <p>{err || 'Loading…'}</p>
      </div>
    );
  }

  return (
    <div className="grid">
      <section className="card span2">
        <div className="row spread">
          <div>
            <h2>{project.name}</h2>
            <p className="muted">{project.description}</p>
          </div>
          <div className="stack end">
            <span className={`pill role-${myRole}`}>you: {myRole}</span>
            <button className="btn ghost" type="button" onClick={leave}>
              Leave
            </button>
            {myRole === 'admin' && (
              <button className="btn danger" type="button" onClick={dumpProject}>
                Delete project
              </button>
            )}
          </div>
        </div>
      </section>

      {myRole === 'admin' && (
        <section className="card">
          <h3>Add member</h3>
          <form onSubmit={invite} className="stack">
            <label>
              Email
              <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            </label>
            <label>
              Role
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                <option value="member">member</option>
                <option value="admin">admin</option>
              </select>
            </label>
            {err && <div className="error">{err}</div>}
            <button className="btn" type="submit">
              Invite
            </button>
          </form>

          <h4 className="mt">Members</h4>
          <ul className="list tight">
            {project.members?.map((m) => {
              const u = m.user;
              const id = u?._id || u;
              return (
                <li key={id} className="row spread">
                  <span>{u?.email || id}</span>
                  <span className="muted">{m.role}</span>
                  {myRole === 'admin' && String(id) !== String(user.id) && (
                    <button
                      className="btn link"
                      type="button"
                      onClick={() =>
                        api.kickMember(projectId, id).then(load).catch((e2) => setErr(e2.message))
                      }
                    >
                      remove
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className={myRole === 'admin' ? 'card' : 'card span2'}>
        <h3>Tasks</h3>
        {myRole === 'admin' && (
          <form onSubmit={addTask} className="row">
            <input
              placeholder="Something that needs doing"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button className="btn" type="submit">
              Add
            </button>
          </form>
        )}

        {!tasks?.length ? (
          <p className="muted">Quiet in here.</p>
        ) : (
          <ul className="list">
            {tasks.map((t) => {
              const isAssignedToMe =
                String(t.assignee?._id || '') === String(user?.id);
              const canChangeStatus = myRole === 'admin' || isAssignedToMe;

              return (
                <li key={t._id} className={`task status-${t.status.replace('_', '-')}`}>
                  <div>
                    <div className="title">{t.title}</div>
                    <div className="muted">
                      assigned: {t.assignee?.email || '—'} · status:{' '}
                      {canChangeStatus ? (
                        <select value={t.status} onChange={(e) => patchTask(t, { status: e.target.value })}>
                          <option value="todo">todo</option>
                          <option value="in_progress">in progress</option>
                          <option value="done">done</option>
                        </select>
                      ) : (
                        <span>{t.status.replace('_', ' ')}</span>
                      )}
                    </div>
                  </div>
                  {myRole === 'admin' && (
                    <div className="stack">
                      <label className="small">
                        assign
                        <select
                          value={t.assignee?._id || ''}
                          onChange={(e) =>
                            patchTask(t, {
                              assignee: e.target.value ? e.target.value : null,
                            })
                          }
                        >
                          <option value="">nobody</option>
                          {(project.members || []).map((m) => {
                            const u = m.user;
                            const id = u?._id || u;
                            return (
                              <option key={id} value={id}>
                                {u?.email}
                              </option>
                            );
                          })}
                        </select>
                      </label>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
