import { useEffect, useMemo, useState } from 'react';
import CreateCrewMemberForm from '../components/admin/CreateCrewMemberForm';
import CrewMemberList from '../components/admin/CrewMemberList';
import { useAuth } from '../context/AuthContext';

function AdminCrewPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { token } = useAuth();
  const API_BASE = useMemo(() => process.env.REACT_APP_API_URL || 'http://localhost:5001', []);

  const [activeJobs, setActiveJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState('');

  const fetchActiveJobs = async () => {
    if (!token) return;
    setJobsLoading(true);
    setJobsError('');
    try {
      const res = await fetch(`${API_BASE}/api/bookings/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load active job tickets');
      setActiveJobs(data.bookings || []);
    } catch (e) {
      setJobsError(e.message || 'Failed to load active job tickets');
      setActiveJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, token]);

  const patchStatus = async (bookingId, newStatus) => {
    if (!token) return;
    setJobsError('');
    const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update status');
  };

  const badgeStyle = (status) => {
    switch (status) {
      case 'pending':
        return { bg: '#fef3c7', border: '#f59e0b', color: '#92400e', label: 'Pending' };
      case 'confirmed':
        return { bg: '#dbeafe', border: '#3b82f6', color: '#1d4ed8', label: 'Confirmed' };
      case 'en_route':
        return { bg: '#ffedd5', border: '#f97316', color: '#9a3412', label: 'En Route' };
      default:
        return { bg: '#dc2626', border: '#b91c1c', color: '#7f1d1d', label: status };
    }
  };

  return (
    <div className="admin-crew-page">
      <h1>Crew management</h1>
      <CreateCrewMemberForm onSuccess={() => setRefreshKey((k) => k + 1)} />
      <CrewMemberList refreshKey={refreshKey} />

      <section style={{ marginTop: 24 }}>
        <h2>Active Job Tickets</h2>
        {jobsError && <p style={{ color: 'red' }}>{jobsError}</p>}
        {jobsLoading ? (
          <p>Loading…</p>
        ) : activeJobs.length === 0 ? (
          <p>No active jobs right now.</p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {activeJobs.map((job) => {
              const m = badgeStyle(job.status);
              return (
                <div
                  key={job._id}
                  style={{
                    border: `1px solid ${m.border}`,
                    background: m.bg,
                    borderRadius: 12,
                    padding: 12
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 900 }}>{m.label}</div>
                      <div style={{ fontSize: 12, opacity: 0.9 }}>
                        Ref: <span style={{ fontWeight: 800 }}>{job.bookingRefId}</span>
                      </div>
                      <div style={{ fontSize: 12 }}>
                        {job.serviceLabel || job.serviceType} · {job.date} · {job.time}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {job.status !== 'en_route' && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await patchStatus(job._id, 'en_route');
                              await fetchActiveJobs();
                            } catch (e) {
                              setJobsError(e.message || 'Failed to mark En Route');
                            }
                          }}
                        >
                          Mark En Route
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await patchStatus(job._id, 'completed');
                            await fetchActiveJobs();
                          } catch (e) {
                            setJobsError(e.message || 'Failed to complete job');
                          }
                        }}
                      >
                        Complete Job
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminCrewPage;
