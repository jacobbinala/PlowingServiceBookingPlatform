/*
  User Story #19: Submit booking request
*/
function BookingRequestForm({ selectedDate, selectedSlot, serviceType, onServiceTypeChange, onBookNow }) {
  return (
    <section className="booking-request-form">
      <h2>Book a slot</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onBookNow();
        }}
      >
        <div style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
          <div>
            <strong>Selected date:</strong> {selectedDate}
          </div>
          <div>
            <strong>Selected time:</strong> {selectedSlot ? selectedSlot.time : '—'}
          </div>
        <label>
          Service type
          <select name="serviceType" value={serviceType} onChange={(e) => onServiceTypeChange(e.target.value)}>
            <option value="driveway">Driveway</option>
            <option value="walkway">Walkway</option>
            <option value="full">Full property</option>
          </select>
        </label>
        <button type="submit">Book Now</button>
        </div>
      </form>
    </section>
  );
}

export default BookingRequestForm;
