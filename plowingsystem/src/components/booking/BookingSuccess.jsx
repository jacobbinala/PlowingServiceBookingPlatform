/*
  User Story #19: Success message and Booking Reference ID
*/
function BookingSuccess({ bookingRefId, onBookAnother }) {
  return (
    <section className="booking-success">
      <h2>Booking confirmed</h2>
      <div style={{ display: 'grid', gap: 10, maxWidth: 520 }}>
        <p>Your booking request was successfully submitted.</p>
        <p className="ref-id">
          <strong>Booking Reference ID:</strong> {bookingRefId || '—'}
        </p>
        <button type="button" onClick={onBookAnother}>
          Book another slot
        </button>
      </div>
    </section>
  );
}

export default BookingSuccess;
