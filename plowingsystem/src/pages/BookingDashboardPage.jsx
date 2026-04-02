import AvailabilityView from '../components/booking/AvailabilityView';
import BookingRequestForm from '../components/booking/BookingRequestForm';
import BookingSummary from '../components/booking/BookingSummary';
import BookingSuccess from '../components/booking/BookingSuccess';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Property owner dashboard: hosts availability (#21) and booking flow (#19).
 * Minimal shell; colleagues wire steps and state as needed.
 */
function BookingDashboardPage() {
  const { token } = useAuth();
  const apiBase = useMemo(() => process.env.REACT_APP_API_URL || 'http://localhost:5001', []);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [serviceType, setServiceType] = useState('driveway');

  const [step, setStep] = useState('request'); // request | summary | success
  const [bookingRefId, setBookingRefId] = useState(null);
  const [error, setError] = useState('');
  const [myBookings, setMyBookings] = useState([]);
  const [myBookingsError, setMyBookingsError] = useState('');
  const [myBookingsLoading, setMyBookingsLoading] = useState(false);

  const selectedSlot = useMemo(
    () => slots.find((s) => String(s._id) === String(selectedSlotId)) || null,
    [slots, selectedSlotId]
  );

  useEffect(() => {
    // If slots exist and nothing is selected, auto-select the first available one.
    if (selectedSlotId) return;
    const firstAvailable = (slots || []).find((s) => !(s.isFullyBooked || s.bookedCount >= s.capacity));
    if (firstAvailable) setSelectedSlotId(firstAvailable._id);
  }, [slots, selectedSlotId]);

  useEffect(() => {
    let cancelled = false;
    async function loadMyBookings() {
      if (!token) return;
      setMyBookingsLoading(true);
      setMyBookingsError('');
      try {
        const res = await fetch(`${apiBase}/api/bookings/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load requests');
        if (!cancelled) setMyBookings(data.bookings || []);
      } catch (e) {
        if (!cancelled) setMyBookingsError(e.message || 'Failed to load requests');
      } finally {
        if (!cancelled) setMyBookingsLoading(false);
      }
    }
    loadMyBookings();
    return () => {
      cancelled = true;
    };
  }, [apiBase, token]);

  const activeBookings = useMemo(() => {
    return (myBookings || []).filter((b) => ['pending', 'confirmed', 'en_route'].includes(b.status));
  }, [myBookings]);

  return (
    <div className="booking-dashboard">
      <h1>Booking Dashboard</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <section style={{ marginBottom: 16 }}>
        <h2 style={{ margin: '8px 0 6px' }}>My Active Requests</h2>
        {myBookingsError && <p style={{ color: 'red' }}>{myBookingsError}</p>}
        {myBookingsLoading ? (
          <p style={{ color: '#666' }}>Loading…</p>
        ) : activeBookings.length === 0 ? (
          <p style={{ color: '#666' }}>No active requests.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {activeBookings.slice(0, 5).map((b) => {
              const badge = (status) => {
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
              const m = badge(b.status);
              return (
                <div
                  key={b._id || b.bookingRefId}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: `1px solid ${m.border}`,
                    background: m.bg,
                    color: m.color
                  }}
                >
                  <div style={{ fontWeight: 800 }}>{m.label}</div>
                  <div style={{ fontSize: 12 }}>
                    {b.date} · {b.time}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <AvailabilityView
        apiBase={apiBase}
        selectedDate={selectedDate}
        onSelectedDateChange={(d) => {
          setSelectedDate(d);
          setSelectedSlotId(null);
          setError('');
        }}
        slots={slots}
        onSlotsChange={setSlots}
        selectedSlotId={selectedSlotId}
        onSelectSlot={(id) => {
          setSelectedSlotId(id);
          setError('');
        }}
      />

      {step === 'request' && (
        <BookingRequestForm
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
          serviceType={serviceType}
          onServiceTypeChange={setServiceType}
          onBookNow={() => {
            setError('');
            if (!selectedSlot) return setError('Please select an available time slot first.');
            setStep('summary');
          }}
        />
      )}

      {step === 'summary' && (
        <BookingSummary
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
          serviceType={serviceType}
          onBack={() => setStep('request')}
          onConfirm={async () => {
            setError('');
            if (!token) return setError('Please log in to confirm your booking.');
            if (!selectedSlot) return setError('Please select an available time slot first.');

            const res = await fetch(`${apiBase}/api/bookings`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                slotId: selectedSlot._id,
                serviceType
              })
            });
            const data = await res.json();
            if (!res.ok) return setError(data.message || 'Booking failed. Please try again.');

            setBookingRefId(data.bookingRefId);
            setStep('success');
          }}
        />
      )}

      {step === 'success' && (
        <BookingSuccess
          bookingRefId={bookingRefId}
          onBookAnother={() => {
            setBookingRefId(null);
            setSelectedSlotId(null);
            setStep('request');
          }}
        />
      )}
    </div>
  );
}

export default BookingDashboardPage;
