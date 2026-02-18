import { Link } from 'react-router-dom';

/*
  User Story #23: Property Owner registration
  TODOs for colleague:
  - Add form state and validation (email format, password strength, phone, address format).
  - Validate address format before submit (e.g. regex or a small validation util for street, city, postal code).
  - Call registration API on submit; on success, backend sends "Welcome" email – then redirect (e.g. to /login or /dashboard).
*/
function RegisterPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: validate all fields and address format; call register API; on success redirect
  };

  return (
    <div className="auth-page">
      <h1>Create account</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Email
          <input type="email" name="email" placeholder="your@email.com" required />
        </label>
        <label>
          Password
          <input type="password" name="password" placeholder="••••••••" required />
        </label>
        <label>
          Phone
          <input type="tel" name="phone" placeholder="+1 234 567 8900" />
        </label>
        <fieldset className="address-fields">
          <legend>Service address</legend>
          <label>
            Street
            <input type="text" name="street" placeholder="123 Main St" />
          </label>
          <label>
            City
            <input type="text" name="city" placeholder="City" />
          </label>
          <label>
            Postal code
            <input type="text" name="postalCode" placeholder="A1A 1A1" />
          </label>
        </fieldset>
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}

export default RegisterPage;
