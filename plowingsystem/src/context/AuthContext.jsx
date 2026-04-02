import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

function readStoredUser() {
  try {
    const s = localStorage.getItem('user');
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

/** Restore role from JWT when user JSON is missing (e.g. older sessions). */
function userFromToken(t) {
  if (!t) return null;
  try {
    const part = t.split('.')[1];
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '==='.slice((base64.length + 3) % 4);
    const payload = JSON.parse(atob(padded));
    if (payload.role) return { role: payload.role };
  } catch {
    /* ignore */
  }
  return null;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => readStoredUser() || userFromToken(localStorage.getItem('token')));

  useEffect(() => {
    if (!token) return;
    if (user?.email) return;

    const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, [token, user]);

  const login = (newToken, userObj) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    if (userObj) {
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);
    } else {
      setUser(userFromToken(newToken));
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
