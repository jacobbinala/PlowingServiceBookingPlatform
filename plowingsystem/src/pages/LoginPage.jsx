import { Link } from 'react-router-dom';

/*
  User Story #22: Login / Logout
  TODOs for colleague:
  - Implement login with registered email/password (call auth API, store token/session in state or context).
  - On success, redirect to Booking Dashboard (e.g. navigate('/dashboard')) for property owner.
  - Wire "Forgot Password" below to forgot-password flow (dedicated route or modal).
  - Wire "Log Out" in Layout/Header to terminate session and redirect (see components/layout/Header.jsx).
*/
function LoginPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: call login API with email/password; on success redirect to /dashboard
  };

  return (
    <div className="auth-page">
      <h1>Log in</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Email
          <input type="email" name="email" placeholder="your@email.com" required />
        </label>
        <label>
          Password
          <input type="password" name="password" placeholder="••••••••" required />
        </label>
        <button type="submit">Log in</button>
        <p className="forgot-password">
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
      </form>
      <p>
        Don&apos;t have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

export default LoginPage;
