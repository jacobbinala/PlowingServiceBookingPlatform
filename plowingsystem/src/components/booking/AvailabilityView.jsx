/*
  User Story #21: View available plowing slots
*/
import { useEffect, useMemo, useRef, useState } from 'react';

function AvailabilityView({
  apiBase,
  selectedDate,
  onSelectedDateChange,
  slots,
  onSlotsChange,
  selectedSlotId,
  onSelectSlot
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const eventSourceRef = useRef(null);
  const [monthSummary, setMonthSummary] = useState({});

  const [viewMonth, setViewMonth] = useState(() => {
    const d = selectedDate ? new Date(`${selectedDate}T00:00:00`) : new Date();
    if (Number.isNaN(d.getTime())) return new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  useEffect(() => {
    const d = selectedDate ? new Date(`${selectedDate}T00:00:00`) : null;
    if (!d || Number.isNaN(d.getTime())) return;
    setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [selectedDate]);

  const sortedSlots = useMemo(() => {
    return [...(slots || [])].sort((a, b) => String(a.time).localeCompare(String(b.time)));
  }, [slots]);

  const calendarDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();

    const firstOfMonth = new Date(year, month, 1);
    const startDay = firstOfMonth.getDay(); // 0=Sun
    const gridStart = new Date(year, month, 1 - startDay);

    const days = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      days.push({
        date: d,
        iso,
        inMonth: d.getMonth() === month,
        isToday: iso === new Date().toISOString().slice(0, 10),
        isSelected: iso === selectedDate
      });
    }
    return days;
  }, [viewMonth, selectedDate]);

  useEffect(() => {
    let cancelled = false;
    async function loadMonth() {
      try {
        const year = viewMonth.getFullYear();
        const month = viewMonth.getMonth() + 1; // 1-12
        const res = await fetch(`${apiBase}/api/bookings/slots/month?year=${year}&month=${month}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load month availability');
        if (!cancelled) setMonthSummary(data.dates || {});
      } catch (e) {
        if (!cancelled) setMonthSummary({});
      }
    }
    loadMonth();
    return () => {
      cancelled = true;
    };
  }, [apiBase, viewMonth]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${apiBase}/api/bookings/slots?date=${encodeURIComponent(selectedDate)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load slots');
        if (!cancelled) onSlotsChange(data);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load slots');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (selectedDate) load();
    return () => {
      cancelled = true;
    };
  }, [apiBase, selectedDate, onSlotsChange]);

  useEffect(() => {
    // Realtime updates via SSE. When any booking happens, we refetch for the current date.
    if (!selectedDate) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const es = new EventSource(`${apiBase}/api/bookings/slots/stream?date=${encodeURIComponent(selectedDate)}`);
    eventSourceRef.current = es;

    es.addEventListener('availability', (evt) => {
      try {
        const payload = JSON.parse(evt.data);
        if (payload?.date !== selectedDate) return;

        // If server pushes full slot list, apply it. Otherwise, refetch current date.
        if (Array.isArray(payload?.slots)) onSlotsChange(payload.slots);
        else {
          fetch(`${apiBase}/api/bookings/slots?date=${encodeURIComponent(selectedDate)}`)
            .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
            .then(({ ok, d }) => {
              if (ok && Array.isArray(d)) onSlotsChange(d);
            })
            .catch(() => {});
        }
      } catch (e) {
        // ignore malformed events
      }
    });

    es.addEventListener('error', () => {
      // Browser will retry automatically; keep UI stable
    });

    return () => {
      es.close();
      if (eventSourceRef.current === es) eventSourceRef.current = null;
    };
  }, [apiBase, selectedDate, onSlotsChange]);

  const legendItem = (label, color) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 12, height: 12, borderRadius: 3, background: color, display: 'inline-block' }} />
      <span>{label}</span>
    </span>
  );

  return (
    <section className="availability-view">
      <h2>Available plowing slots</h2>
      <div style={{ display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
            >
              Prev
            </button>
            <div style={{ fontWeight: 800 }}>
              {viewMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
            </div>
            <button
              type="button"
              onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
            >
              Next
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <strong>Selected date:</strong> {selectedDate}
            </div>
            {loading && <span>Loading…</span>}
          </div>
        </div>

        <div
          role="grid"
          aria-label="Calendar"
          style={{
            maxWidth: 420,
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: 12,
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              background: 'rgba(0,0,0,0.03)',
              borderBottom: '1px solid rgba(0,0,0,0.12)'
            }}
          >
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} style={{ padding: '10px 8px', fontWeight: 700, fontSize: 12, color: '#333' }}>
                {d}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {calendarDays.map((day) => (
              <button
                key={day.iso}
                type="button"
                onClick={() => onSelectedDateChange(day.iso)}
                style={{
                  height: 44,
                  padding: '6px 6px',
                  border: 'none',
                  borderRight: '1px solid rgba(0,0,0,0.08)',
                  borderBottom: '1px solid rgba(0,0,0,0.08)',
                  background: day.isSelected ? '#e7f0ff' : '#fff',
                  cursor: 'pointer',
                  opacity: day.inMonth ? 1 : 0.45,
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: day.isToday ? 900 : 700, color: '#111', fontSize: 12 }}>
                    {day.date.getDate()}
                  </span>
                  {day.isToday && (
                    <span style={{ fontSize: 10, color: '#1f6feb', fontWeight: 800 }}>Today</span>
                  )}
                </div>
                <div style={{ marginTop: 4, display: 'flex', justifyContent: 'flex-end' }}>
                  {typeof monthSummary?.[day.iso]?.isFullyBooked === 'boolean' && (
                    <span
                      title={monthSummary[day.iso].isFullyBooked ? 'Fully booked' : 'Available'}
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: monthSummary[day.iso].isFullyBooked ? '#dc2626' : '#16a34a',
                        display: 'inline-block'
                      }}
                    />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginTop: 10 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
          {legendItem('Available', '#16a34a')}
          {legendItem('Fully booked', '#dc2626')}
          {legendItem('Selected', '#1f6feb')}
        </div>

        {sortedSlots.length === 0 ? (
          <p>No slots found for this date.</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: 10
            }}
          >
            {sortedSlots.map((slot) => {
              const isSelected = String(selectedSlotId) === String(slot._id);
              const isFull = Boolean(slot.isFullyBooked) || slot.bookedCount >= slot.capacity;
              const baseColor = isFull ? '#dc2626' : '#16a34a';
              const background = isSelected ? '#e7f0ff' : baseColor;
              return (
                <button
                  key={slot._id}
                  type="button"
                  onClick={() => onSelectSlot(slot._id)}
                  disabled={isFull}
                  title={isFull ? 'Fully booked' : 'Available'}
                  style={{
                    padding: '12px 10px',
                    borderRadius: 10,
                    border: isSelected ? '2px solid #1f6feb' : '1px solid rgba(0,0,0,0.15)',
                    background,
                    color: isSelected ? '#0b1b3a' : '#fff',
                    cursor: isFull ? 'not-allowed' : 'pointer',
                    opacity: isFull ? 0.75 : 1,
                    display: 'grid',
                    gap: 6,
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontWeight: 800 }}>{slot.time}</div>
                  <div style={{ fontSize: 12, opacity: 0.95 }}>
                    {slot.bookedCount}/{slot.capacity} booked
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default AvailabilityView;
