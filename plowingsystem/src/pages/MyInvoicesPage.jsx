import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

function formatMoney(amount, currency) {
  const c = currency || 'CAD';
  try {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: c }).format(amount);
  } catch {
    return `${amount} ${c}`;
  }
}

function buildInvoiceDownloadText(inv) {
  const due = inv.dueDate ? new Date(inv.dueDate).toLocaleString() : '—';
  const paid = inv.paidAt ? new Date(inv.paidAt).toLocaleString() : '—';
  return [
    'PLOWING SERVICE — INVOICE',
    '================================',
    `Invoice reference: ${inv.invoiceRef}`,
    `Booking reference: ${inv.bookingRefId}`,
    `Amount: ${inv.amount} ${inv.currency || 'CAD'}`,
    `Status: ${inv.status}`,
    `Due: ${due}`,
    inv.status === 'paid' ? `Paid at: ${paid}` : '',
    '',
    'Thank you for your business.',
    ''
  ]
    .filter(Boolean)
    .join('\n');
}

function downloadInvoiceFile(inv) {
  const blob = new Blob([buildInvoiceDownloadText(inv)], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${inv.invoiceRef.replace(/[^a-z0-9-_]/gi, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function MyInvoicesPage() {
  const { token } = useAuth();
  const API_BASE = useMemo(() => process.env.REACT_APP_API_URL || 'http://localhost:5000', []);

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const load = useCallback(async () => {
    if (!token) {
      setInvoices([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/invoices/my`, {
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
  }, [API_BASE, token]);

  useEffect(() => {
    load();
  }, [load]);

  const selected = useMemo(
    () => invoices.find((i) => String(i._id) === String(selectedId)) || null,
    [invoices, selectedId]
  );

  if (!token) {
    return (
      <div className="my-invoices-page">
        <h1>My invoices</h1>
        <p>Please log in to view your invoices.</p>
      </div>
    );
  }

  return (
    <div className="my-invoices-page">
      <h1>My invoices</h1>
      <p style={{ opacity: 0.85, maxWidth: 560 }}>
        Invoices appear after a job is marked complete. You can download a plain-text copy for your records.
      </p>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="button" onClick={() => load()} style={{ marginTop: 8 }}>
        Refresh
      </button>

      {loading ? (
        <p style={{ marginTop: 16 }}>Loading…</p>
      ) : invoices.length === 0 ? (
        <p style={{ marginTop: 16, color: '#666' }}>No invoices yet.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gap: 16,
            marginTop: 20,
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))'
          }}
        >
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
            {invoices.map((inv) => (
              <li key={inv._id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(inv._id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: 12,
                    borderRadius: 10,
                    border: `1px solid ${String(selectedId) === String(inv._id) ? '#2563eb' : '#e2e8f0'}`,
                    background: String(selectedId) === String(inv._id) ? '#eff6ff' : '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 800 }}>{inv.invoiceRef}</div>
                  <div style={{ fontSize: 13 }}>
                    {formatMoney(inv.amount, inv.currency)} ·{' '}
                    <strong>{inv.status === 'paid' ? 'Paid' : 'Unpaid'}</strong>
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Booking {inv.bookingRefId}</div>
                </button>
              </li>
            ))}
          </ul>

          <div
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: 16,
              background: '#fafafa',
              minHeight: 200
            }}
          >
            {selected ? (
              <>
                <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Invoice detail</h2>
                <dl style={{ display: 'grid', gap: 6, fontSize: 14 }}>
                  <div>
                    <dt style={{ fontWeight: 600 }}>Reference</dt>
                    <dd style={{ margin: 0 }}>{selected.invoiceRef}</dd>
                  </div>
                  <div>
                    <dt style={{ fontWeight: 600 }}>Booking</dt>
                    <dd style={{ margin: 0 }}>{selected.bookingRefId}</dd>
                  </div>
                  <div>
                    <dt style={{ fontWeight: 600 }}>Amount</dt>
                    <dd style={{ margin: 0 }}>{formatMoney(selected.amount, selected.currency)}</dd>
                  </div>
                  <div>
                    <dt style={{ fontWeight: 600 }}>Status</dt>
                    <dd style={{ margin: 0 }}>{selected.status}</dd>
                  </div>
                  {selected.dueDate && (
                    <div>
                      <dt style={{ fontWeight: 600 }}>Due</dt>
                      <dd style={{ margin: 0 }}>{new Date(selected.dueDate).toLocaleString()}</dd>
                    </div>
                  )}
                  {selected.paidAt && (
                    <div>
                      <dt style={{ fontWeight: 600 }}>Paid</dt>
                      <dd style={{ margin: 0 }}>{new Date(selected.paidAt).toLocaleString()}</dd>
                    </div>
                  )}
                </dl>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
                  <button type="button" onClick={() => downloadInvoiceFile(selected)}>
                    Download (.txt)
                  </button>
                  <button type="button" onClick={() => window.print()}>
                    Print / Save as PDF
                  </button>
                </div>
                <pre
                  className="invoice-print-block"
                  style={{ display: 'none', whiteSpace: 'pre-wrap' }}
                  aria-hidden
                >
                  {buildInvoiceDownloadText(selected)}
                </pre>
              </>
            ) : (
              <p style={{ color: '#64748b' }}>Select an invoice to view details and download.</p>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media print {
          .my-invoices-page button,
          .my-invoices-page ul,
          .my-invoices-page > h1,
          .my-invoices-page > p,
          .my-invoices-page > p[style],
          .my-invoices-page h2,
          .my-invoices-page dl {
            display: none !important;
          }
          .my-invoices-page .invoice-print-block {
            display: block !important;
            font-size: 14px !important;
            margin-top: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default MyInvoicesPage;
