/*
  User Story #19: Summary before confirmation
*/
function BookingSummary({ selectedDate, selectedSlot, serviceType, onBack, onConfirm }) {
  return (
    <section className="booking-summary">
      <h2>Booking summary</h2>
      <div style={{ display: 'grid', gap: 10, maxWidth: 520 }}>
        <div>
          <strong>Date:</strong> {selectedDate}
        </div>
        <div>
          <strong>Time:</strong> {selectedSlot ? selectedSlot.time : '—'}
        </div>
        <div>
          <strong>Service type:</strong> {serviceType}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={onBack}>
            Back
          </button>
          <button type="button" onClick={onConfirm}>
            Confirm booking
          </button>
        </div>
      </div>
    </section>
  );
}

export default BookingSummary;
