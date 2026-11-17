import { useState } from "react";
import api from "../../api";

function AccountSecurity() {
  const [form, setForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");

    setValidationErrors((previous) => ({
      ...previous,
      [name]: undefined,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");
    setValidationErrors({});

    try {
      await api.put("/api/profile/password", form);

      setForm({
        current_password: "",
        password: "",
        password_confirmation: "",
      });

      setMessage("Your password has been changed successfully.");
    } catch (error) {
      console.error("Failed to update password:", error);

      if (error.response?.status === 422) {
        setValidationErrors(error.response.data.errors || {});

        setError(
          error.response.data.message ||
            "Please check the information you entered.",
        );
      } else {
        setError(
          error.response?.data?.message || "Unable to change your password.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="account-section">
      <div className="account-section-header">
        <h1>Security</h1>
        <p>Manage your account password.</p>
      </div>

      {message && <p className="account-success-message">{message}</p>}

      {error && <p className="account-error-message">{error}</p>}

      <div className="account-security-section">
        <h2>Change Password</h2>

        <form className="account-security-form" onSubmit={handleSubmit}>
          <div className="account-form-field">
            <label htmlFor="current_password">Current Password</label>

            <input
              id="current_password"
              name="current_password"
              type="password"
              value={form.current_password}
              onChange={handleChange}
              required
            />

            {validationErrors.current_password && (
              <p>{validationErrors.current_password[0]}</p>
            )}
          </div>

          <div className="account-form-field">
            <label htmlFor="password">New Password</label>

            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />

            {validationErrors.password && <p>{validationErrors.password[0]}</p>}

            <small>
              Password must be at least 8 characters and contain letters and
              numbers.
            </small>
          </div>

          <div className="account-form-field">
            <label htmlFor="password_confirmation">Confirm New Password</label>

            <input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              value={form.password_confirmation}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default AccountSecurity;
