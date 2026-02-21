import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '', password: '', phone: '', street: '', city: '', postalCode: ''
  });
  const [error, setError] = useState('');

  const validate = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Invalid email format';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.postalCode.trim().length < 3) return 'Invalid postal code';
    return null;
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) return setError(validationError);
    try {
      const res = await fetch('http://localhost:5002/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message);
      navigate('/login');
    } catch (err) {
      setError('Server error, please try again');
    }
  };

  return (
    <div className="auth-page">
      <h1>Create account</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
        <label>Email<input type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required /></label>
        <label>Password<input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required /></label>
        <label>Phone<input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 234 567 8900" /></label>
        <fieldset className="address-fields">
          <legend>Service address</legend>
          <label>Street<input type="text" name="street" value={form.street} onChange={handleChange} placeholder="123 Main St" /></label>
          <label>City<input type="text" name="city" value={form.city} onChange={handleChange} placeholder="City" /></label>
          <label>Postal code<input type="text" name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="A1A 1A1" /></label>
        </fieldset>
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  );
}

export default RegisterPage;
