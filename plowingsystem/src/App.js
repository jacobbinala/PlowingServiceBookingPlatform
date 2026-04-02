import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookingDashboardPage from './pages/BookingDashboardPage';
import AdminCrewPage from './pages/AdminCrewPage';
import AdminPendingRequestsPage from './pages/AdminPendingRequestsPage';
import AdminInvoicesPage from './pages/AdminInvoicesPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import PropertyManagerProfile from './pages/PropertyManagerProfile';
import ViewRequestStatus from './pages/ViewRequestStatus';
import ConfirmationNotification from './components/booking/ConfirmationNotification';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<BookingDashboardPage />} />
            <Route path="/admin/crew" element={<AdminCrewPage />} />
            <Route path="/admin/requests" element={<AdminPendingRequestsPage />} />
            <Route path="/admin/invoices" element={<AdminInvoicesPage />} />
            {/* Sprint 2 - new routes */}
            <Route path="/profile/properties" element={<PropertyManagerProfile />} />
            <Route path="/dashboard/status" element={<ViewRequestStatus />} />
            <Route path="/booking/confirmation" element={<ConfirmationNotification />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
