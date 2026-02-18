/*
  User Story #19: Summary before confirmation
  TODOs for colleague:
  - Show summary screen (date, time, service type, maybe address) before final confirmation.
  - On confirm, call booking API; on success, show BookingSuccess with Booking Reference ID from response.
  - This component may be shown conditionally (e.g. after user clicks "Book Now" and before confirm).
*/
function BookingSummary() {
  return (
    <section className="booking-summary">
      <h2>Booking summary</h2>
      <div className="booking-summary-placeholder">
        <p>Summary (date, time, service type) and Confirm button will go here.</p>
      </div>
    </section>
  );
}

export default BookingSummary;
