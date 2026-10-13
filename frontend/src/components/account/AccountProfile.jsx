import { useEffect, useState } from "react";

import api from "../../api";

function AccountProfile({ user, onUserUpdate }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    current_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!user) {
      return;
    }

    const nameParts = (user.name || "").trim().split(/\s+/);

    setForm({
      first_name: user.first_name || nameParts[0] || "",
      last_name: user.last_name || nameParts.slice(1).join(" ") || "",
      email: user.email || "",
      phone: user.phone || "",
      current_password: "",
    });
  }, [user]);

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
      const emailChanged =
        form.email.trim().toLowerCase() !==
        (user?.email || "").trim().toLowerCase();

      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
      };

      if (emailChanged) {
        payload.current_password = form.current_password;
      }

      const { data } = await api.put("/api/profile", payload);

      if (onUserUpdate) {
        onUserUpdate(data);
      }

      setForm((previous) => ({
        ...previous,
        current_password: "",
      }));

      setMessage("Your profile has been updated successfully.");
    } catch (error) {
      console.error("Failed to update profile:", error);

      if (error.response?.status === 422) {
        setValidationErrors(error.response.data.errors || {});

        setError(
          error.response.data.message ||
            "Please check the information you entered.",
        );
      } else {
        setError(
          error.response?.data?.message || "Unable to update your profile.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const emailChanged =
    form.email.trim().toLowerCase() !==
    (user?.email || "").trim().toLowerCase();

  return (
    <section className="account-section">
      <div className="account-section-header">
        <h1>Profile</h1>
        <p>Manage your personal information.</p>
      </div>

      {message && <p className="account-success-message">{message}</p>}

      {error && <p className="account-error-message">{error}</p>}

      <form className="account-profile-form" onSubmit={handleSubmit}>
        <div className="account-form-field">
          <label htmlFor="first_name">First Name</label>

          <input
            id="first_name"
            name="first_name"
            type="text"
            value={form.first_name}
            onChange={handleChange}
            required
          />

          {validationErrors.first_name && (
            <p>{validationErrors.first_name[0]}</p>
          )}
        </div>

        <div className="account-form-field">
          <label htmlFor="last_name">Last Name</label>

          <input
            id="last_name"
            name="last_name"
            type="text"
            value={form.last_name}
            onChange={handleChange}
            required
          />

          {validationErrors.last_name && <p>{validationErrors.last_name[0]}</p>}
        </div>

        <div className="account-form-field">
          <label htmlFor="email">Email</label>

          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          {validationErrors.email && <p>{validationErrors.email[0]}</p>}
        </div>

        <div className="account-form-field">
          <label htmlFor="phone">Phone Number</label>

          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="+27 82 123 4567"
          />

          {validationErrors.phone && <p>{validationErrors.phone[0]}</p>}
        </div>

        {emailChanged && (
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

            <small>
              Your current password is required when changing your email
              address.
            </small>
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </section>
  );
}

export default AccountProfile;
