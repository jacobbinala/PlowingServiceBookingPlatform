import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message);
      login(data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Server error, please try again');
    }
  };

  return (
    <div className="auth-page">
      <h1>Log in</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
        <label>Email<input type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required /></label>
        <label>Password<input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required /></label>
        <button type="submit">Log in</button>
        <p className="forgot-password"><Link to="/forgot-password">Forgot Password?</Link></p>
      </form>
      <p>Don&apos;t have an account? <Link to="/register">Register</Link></p>
    </div>
  );
}

export default LoginPage;
