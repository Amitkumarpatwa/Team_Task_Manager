import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { api } from '../api';

export function LoginPage() {
  const { login, token } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  if (token) return <Navigate to="/" replace />;

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      if (mode === 'signup') {
        const res = await api.signup({ email, password, name });
        login({ token: res.token, user: res.user });
      } else {
        const res = await api.login({ email, password });
        login({ token: res.token, user: res.user });
      }
      nav('/', { replace: true });
    } catch (e2) {
      setErr(e2.message || 'Nope');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card narrow">
      <h1>{mode === 'login' ? 'Log in' : 'Sign up'}</h1>
      <form onSubmit={submit} className="stack">
        {mode === 'signup' && (
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
        )}
        <label>
          Email
          <input autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {err && <div className="error">{err}</div>}
        <button className="btn" disabled={busy} type="submit">
          {busy ? '…' : mode === 'login' ? 'Enter' : 'Create account'}
        </button>
      </form>
      <button
        className="btn link"
        type="button"
        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
      >
        {mode === 'login' ? 'Need an account?' : 'Have an account?'}
      </button>
    </div>
  );
}
