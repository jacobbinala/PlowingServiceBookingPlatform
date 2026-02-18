/*
  User Story #19: Submit booking request
  TODOs for colleague:
  - "Book Now" should submit selected date, time, and service type (and any required IDs) to booking API.
  - Integrate with AvailabilityView so user picks a slot, then this form or a "Book Now" button sends the selection.
  - After submit, show BookingSummary step before final confirmation; on confirm, call booking API.
*/
function BookingRequestForm() {
  const handleBookNow = (e) => {
    e.preventDefault();
    // TODO: collect date, time, service type from state/context; show summary step or call API
  };

  return (
    <section className="booking-request-form">
      <h2>Book a slot</h2>
      <form onSubmit={handleBookNow}>
        <label>
          Date <input type="date" name="date" />
        </label>
        <label>
          Time <input type="time" name="time" />
        </label>
        <label>
          Service type
          <select name="serviceType">
            <option value="driveway">Driveway</option>
            <option value="walkway">Walkway</option>
            <option value="full">Full property</option>
          </select>
        </label>
        <button type="submit">Book Now</button>
      </form>
    </section>
  );
}

export default BookingRequestForm;
