/*
  User Story #19: Success message and Booking Reference ID
  TODOs for colleague:
  - Display after successful booking; show success message and Booking Reference ID from API response.
  - This component may be shown conditionally (e.g. when booking state is "success" and ref ID is set).
  - Use placeholder ID for now until API is wired.
*/
function BookingSuccess() {
  return (
    <section className="booking-success">
      <h2>Booking confirmed</h2>
      <div className="booking-success-placeholder">
        <p>Success message and Booking Reference ID will appear here after confirmation.</p>
        <p className="ref-id">Reference ID: —</p>
      </div>
    </section>
  );
}

export default BookingSuccess;
