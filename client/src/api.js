const base = import.meta.env.VITE_API_BASE || '';

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const body = options.body;

  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
    options.body = JSON.stringify(body);
  }

  const token = localStorage.getItem('token');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${base}${path}`, { ...options, headers });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(text || 'Bad JSON');
  }

  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  return data;
}

export const api = {
  signup(body) {
    return request('/api/auth/signup', { method: 'POST', body });
  },
  login(body) {
    return request('/api/auth/login', { method: 'POST', body });
  },
  dashboard() {
    return request('/api/dashboard/stats');
  },
  projectsList() {
    return request('/api/projects');
  },
  projectCreate(body) {
    return request('/api/projects', { method: 'POST', body });
  },
  membersAdd(projectId, body) {
    return request(`/api/projects/${projectId}/members`, { method: 'POST', body });
  },
  leaveProject(projectId) {
    return request(`/api/projects/${projectId}/members/me`, { method: 'DELETE' });
  },
  kickMember(projectId, userId) {
    return request(`/api/projects/${projectId}/members/${userId}`, { method: 'DELETE' });
  },
  deleteProject(projectId) {
    return request(`/api/projects/${projectId}`, { method: 'DELETE' });
  },
  tasksList(projectId) {
    return request(`/api/projects/${projectId}/tasks`);
  },
  taskCreate(projectId, body) {
    return request(`/api/projects/${projectId}/tasks`, { method: 'POST', body });
  },
  taskUpdate(projectId, taskId, body) {
    return request(`/api/projects/${projectId}/tasks/${taskId}`, { method: 'PATCH', body });
  },
};
