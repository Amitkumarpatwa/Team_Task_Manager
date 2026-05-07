import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from './auth';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { ProjectPage } from './pages/ProjectPage';

function Private({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="app">
      <header className="top">
        <button className="linkish logo" onClick={() => nav('/')}>
          <span className="logo-icon">▲</span> Team Tasks
        </button>
        {user && (
          <div className="top-right">
            <span className="muted">{user.email}</span>
            <span className={`pill role-${user.role}`}>{user.role}</span>
            <button className="btn ghost" type="button" onClick={() => logout()}>
              Log out
            </button>
          </div>
        )}
      </header>

      <main className="main">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <Private>
                <HomePage />
              </Private>
            }
          />
          <Route
            path="/projects/:projectId"
            element={
              <Private>
                <ProjectPage />
              </Private>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
