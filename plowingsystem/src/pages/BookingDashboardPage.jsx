import AvailabilityView from '../components/booking/AvailabilityView';
import BookingRequestForm from '../components/booking/BookingRequestForm';
import BookingSummary from '../components/booking/BookingSummary';
import BookingSuccess from '../components/booking/BookingSuccess';

/**
 * Property owner dashboard: hosts availability (#21) and booking flow (#19).
 * Minimal shell; colleagues wire steps and state as needed.
 */
function BookingDashboardPage() {
  return (
    <div className="booking-dashboard">
      <h1>Booking Dashboard</h1>
      <AvailabilityView />
      <BookingRequestForm />
      <BookingSummary />
      <BookingSuccess />
    </div>
  );
}

export default BookingDashboardPage;
