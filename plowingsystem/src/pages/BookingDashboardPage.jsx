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
  const apiBase = useMemo(() => process.env.REACT_APP_API_URL || 'http://localhost:5000', []);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [serviceType, setServiceType] = useState('driveway');

  const [step, setStep] = useState('request'); // request | summary | success
  const [bookingRefId, setBookingRefId] = useState(null);
  const [error, setError] = useState('');

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

  return (
    <div className="booking-dashboard">
      <h1>Booking Dashboard</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

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
