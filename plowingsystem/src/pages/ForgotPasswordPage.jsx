import { Link } from 'react-router-dom';

/*
  User Story #22: Forgot Password
  TODO for colleague: Wire this to forgot-password flow (e.g. submit email, call API, show "check your email" message).
*/
function ForgotPasswordPage() {
  return (
    <div className="auth-page">
      <h1>Forgot password</h1>
      <p>Enter your email to receive a reset link.</p>
      <form className="auth-form">
        <label>
          Email <input type="email" name="email" placeholder="your@email.com" />
        </label>
        <button type="submit">Send reset link</button>
      </form>
      <p>
        <Link to="/login">Back to login</Link>
      </p>
    </div>
  );
}

export default ForgotPasswordPage;
