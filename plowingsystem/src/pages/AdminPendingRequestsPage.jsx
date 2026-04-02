import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

function AdminPendingRequestsPage() {
  const { token } = useAuth();
  const API_BASE = useMemo(() => process.env.REACT_APP_API_URL || 'http://localhost:5000', []);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/bookings/pending-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load requests');
      setBookings(data.bookings || []);
    } catch (e) {
      setError(e.message || 'Failed to load');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, token]);

  useEffect(() => {
    load();
  }, [load]);

  const postAction = async (id, path) => {
    const res = await fetch(`${API_BASE}/api/bookings/${id}/${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Action failed');
  };

  return (
    <div className="admin-pending-page">
      <h1>Incoming booking requests</h1>
      <p style={{ opacity: 0.85, maxWidth: 640 }}>
        New customer bookings start as <strong>pending</strong>. Approve to confirm the slot, or reject to cancel and
        release the time slot.
      </p>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : bookings.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          {bookings.map((job) => (
            <div
              key={job._id}
              style={{
                border: '1px solid #f59e0b',
                background: '#fffbeb',
                borderRadius: 12,
                padding: 14
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{job.serviceLabel || job.serviceType}</div>
                  <div style={{ fontSize: 13 }}>
                    Ref: <strong>{job.bookingRefId}</strong> · {job.date} · {job.time}
                  </div>
                  {job.userId?.email && (
                    <div style={{ fontSize: 13, marginTop: 6 }}>
                      Customer: {job.userId.email}
                      {job.userId.address?.street && (
                        <>
                          <br />
                          {job.userId.address.street}, {job.userId.address.city} {job.userId.address.postalCode}
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await postAction(job._id, 'approve');
                        await load();
                      } catch (e) {
                        setError(e.message);
                      }
                    }}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await postAction(job._id, 'reject');
                        await load();
                      } catch (e) {
                        setError(e.message);
                      }
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminPendingRequestsPage;
