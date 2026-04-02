import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

function AdminInvoicesPage() {
  const { token } = useAuth();
  const API_BASE = useMemo(() => process.env.REACT_APP_API_URL || 'http://localhost:5000', []);

  const [filter, setFilter] = useState('unpaid');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const q = filter ? `?status=${encodeURIComponent(filter)}` : '';
      const res = await fetch(`${API_BASE}/api/invoices${q}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load invoices');
      setInvoices(data.invoices || []);
    } catch (e) {
      setError(e.message || 'Failed to load');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, token, filter]);

  useEffect(() => {
    load();
  }, [load]);

  const markPaid = async (id) => {
    const res = await fetch(`${API_BASE}/api/invoices/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'paid' })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update');
  };

  return (
    <div className="admin-invoices-page">
      <h1>Invoices</h1>
      <p style={{ opacity: 0.85, maxWidth: 640 }}>
        Invoices are created automatically when a job is marked <strong>completed</strong>. Mark an invoice as paid when
        payment is received.
      </p>

      <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <label>
          Show:{' '}
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="">All</option>
          </select>
        </label>
        <button type="button" onClick={() => load()}>
          Refresh
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : invoices.length === 0 ? (
        <div style={{ marginTop: 16, padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <p style={{ margin: '0 0 8px' }}>No invoices match this filter.</p>
          <p style={{ margin: 0, fontSize: 14, color: '#475569' }}>
            Invoices are created when an admin marks a job <strong>completed</strong> on the{' '}
            <strong>Crew</strong> page (active job → Complete job). Then return here — unpaid invoices show a{' '}
            <strong>Mark as paid</strong> button.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
          {invoices.map((inv) => {
            const owner = inv.userId;
            const email = owner?.email || '—';
            const paid = inv.status === 'paid';
            const canMarkPaid = !paid;
            return (
              <div
                key={inv._id}
                style={{
                  border: `1px solid ${paid ? '#22c55e' : '#94a3b8'}`,
                  background: paid ? '#f0fdf4' : '#f8fafc',
                  borderRadius: 12,
                  padding: 14
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{inv.invoiceRef}</div>
                    <div style={{ fontSize: 13 }}>
                      Booking: {inv.bookingRefId} · {inv.amount} {inv.currency}
                    </div>
                    <div style={{ fontSize: 13 }}>Customer: {email}</div>
                    <div style={{ fontSize: 12, opacity: 0.85 }}>
                      Status: <strong>{inv.status || 'unpaid'}</strong>
                      {inv.paidAt && ` · Paid ${new Date(inv.paidAt).toLocaleString()}`}
                    </div>
                  </div>
                  {canMarkPaid && (
                    <button
                      type="button"
                      style={{
                        padding: '8px 14px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        borderRadius: 8,
                        border: '1px solid #2563eb',
                        background: '#2563eb',
                        color: '#fff',
                        whiteSpace: 'nowrap'
                      }}
                      onClick={async () => {
                        try {
                          await markPaid(inv._id);
                          await load();
                        } catch (e) {
                          setError(e.message);
                        }
                      }}
                    >
                      Mark as paid
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminInvoicesPage;
