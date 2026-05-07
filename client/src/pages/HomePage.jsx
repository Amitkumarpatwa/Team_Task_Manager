import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';

export function HomePage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [err, setErr] = useState('');

  async function refresh() {
    const [s, p] = await Promise.all([api.dashboard(), api.projectsList()]);
    setStats(s.stats);
    setProjects(p.projects);
  }

  useEffect(() => {
    refresh().catch((e) => setErr(e.message));
  }, []);

  async function createProject(e) {
    e.preventDefault();
    setErr('');
    if (!name.trim()) return;
    await api.projectCreate({ name, description: desc });
    setName('');
    setDesc('');
    await refresh();
  }

  return (
    <div className="grid">
      <section className="card">
        <h2>Hey {user?.name}</h2>
        <p className="muted">Quick stats from projects you can see.</p>
        {!stats ? (
          <p>Loading…</p>
        ) : (
          <div className="stats">
            <div>
              <div className="big">{stats.projectCount}</div>
              <div className="muted">projects</div>
            </div>
            <div>
              <div className="big">{stats.taskCount}</div>
              <div className="muted">tasks</div>
            </div>
            <div>
              <div className="big">{stats.myOpenTasks}</div>
              <div className="muted">mine open</div>
            </div>
          </div>
        )}
      </section>

      <section className="card">
        <h3>New project</h3>
        <form onSubmit={createProject} className="stack">
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Description
            <input value={desc} onChange={(e) => setDesc(e.target.value)} />
          </label>
          {err && <div className="error">{err}</div>}
          <button className="btn" type="submit">
            Create
          </button>
        </form>
      </section>

      <section className="card span2">
        <h3>Projects</h3>
        {projects.length === 0 ? (
          <p className="muted">Nothing yet — spin one up.</p>
        ) : (
          <ul className="list">
            {projects.map((p) => (
              <li key={p._id}>
                <button className="rowbtn" type="button" onClick={() => nav(`/projects/${p._id}`)}>
                  <div>
                    <div className="title">{p.name}</div>
                    <div className="muted">{p.description}</div>
                  </div>
                  <div className="muted">{p.members?.length || 0} people</div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
