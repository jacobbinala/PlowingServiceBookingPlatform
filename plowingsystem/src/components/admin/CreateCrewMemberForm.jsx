import { useState } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function CreateCrewMemberForm({ onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [message, setMessage] = useState(null);
  const [tempPassword, setTempPassword] = useState(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setTempPassword(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/crew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setIsError(true);
        setMessage(data.message || 'Failed to create crew member');
        return;
      }
      setIsError(false);
      setMessage(data.message || 'Crew member created successfully');
      setTempPassword(data.tempPassword);
      setName('');
      setEmail('');
      setRole('');
      if (typeof onSuccess === 'function') onSuccess();
    } catch (err) {
      setIsError(true);
      setMessage(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="create-crew-form">
      <h2>Add crew member</h2>
      {message && (
        <p className={isError ? 'form-message error' : 'form-message success'}>{message}</p>
      )}
      {tempPassword && (
        <div className="temp-password-box">
          <p><strong>Temporary password:</strong></p>
          <p className="temp-password">{tempPassword}</p>
          <p className="temp-password-note">Share this password with the crew member. They should change it after first login.</p>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <label>
          Name <input type="text" name="name" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Email <input type="email" name="email" placeholder="crew@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Role
          <select name="role" value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="">Select role</option>
            <option value="Driver">Driver</option>
            <option value="Admin">Admin</option>
          </select>
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create crew member'}</button>
      </form>
    </section>
  );
}

export default CreateCrewMemberForm;
