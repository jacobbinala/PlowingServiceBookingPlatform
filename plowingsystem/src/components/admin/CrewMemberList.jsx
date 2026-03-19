import { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function CrewMemberList({ refreshKey }) {
  const [crew, setCrew] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revokeMessage, setRevokeMessage] = useState(null);

  const fetchCrew = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/crew`);
      if (!res.ok) throw new Error('Failed to load crew');
      const data = await res.json();
      setCrew(data);
    } catch (err) {
      setError(err.message);
      setCrew([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrew();
  }, [refreshKey]);

  const handleRevoke = async (id) => {
    setRevokeMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/crew/${id}/deactivate`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to revoke access');
      setRevokeMessage('Access revoked.');
      fetchCrew();
    } catch (err) {
      setRevokeMessage(err.message || 'Failed to revoke access');
    }
  };

  if (loading && crew.length === 0) return <section className="crew-member-list"><p>Loading crew…</p></section>;
  if (error) return <section className="crew-member-list"><p className="form-message error">{error}</p></section>;

  return (
    <section className="crew-member-list">
      <h2>Crew members</h2>
      {revokeMessage && <p className="form-message success">{revokeMessage}</p>}
      <table className="crew-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {crew.length === 0 ? (
            <tr>
              <td colSpan={5}>No crew members yet. Add one above.</td>
            </tr>
          ) : (
            crew.map((member) => (
              <tr key={member.id}>
                <td>{member.name}</td>
                <td>{member.email}</td>
                <td>{member.role}</td>
                <td>{member.active ? 'Active' : 'Inactive'}</td>
                <td>
                  {member.active && (
                    <button
                      type="button"
                      className="revoke-btn"
                      onClick={() => handleRevoke(member.id)}
                    >
                      Revoke access
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}

export default CrewMemberList;
