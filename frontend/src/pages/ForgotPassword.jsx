import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa";

import api from "../api";
import "../components/AuthPage.css";

/** Step 1 of "forgot password": the customer enters their email and gets a reset link. */
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSent("");

    if (!email.trim()) {
      setError("Enter the email address you use to log in.");
      return;
    }

    setLoading(true);

    try {
      await api.get("/sanctum/csrf-cookie");
      const { data } = await api.post("/api/forgot-password", { email: email.trim() });
      setSent(data.message);
    } catch (err) {
      const status = err.response?.status;

      if (status === 422) {
        setError(err.response.data.errors?.email?.[0] || "Enter a valid email address.");
      } else if (status === 429) {
        setError("Too many attempts. Wait a minute, then try again.");
      } else {
        setError("Can't reach the server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="auth-hero">
        <div className="auth-hero__panel">
          <h1 className="auth-hero__title">Forgot your password?</h1>
          <p className="auth-hero__text">
            Enter your email and we'll send you a link to choose a new one.
          </p>
        </div>
      </section>

      <section className="auth">
        {sent ? (
          <div className="auth__form">
            <p role="status" style={successStyle}>
              {sent}
            </p>
            <p style={{ margin: 0 }}>The link expires in 60 minutes.</p>
            <Link to="/login" state={{ mode: "login" }} className="auth__submit" style={linkButton}>
              Back to login
            </Link>
          </div>
        ) : (
          <form className="auth__form" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <div className={`field__box${error ? " field__box--error" : ""}`}>
                <FaEnvelope className="field__icon" aria-hidden="true" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  aria-label="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  autoComplete="email"
                />
              </div>
              {error && <p className="field__error">{error}</p>}
            </div>

            <button type="submit" className="auth__submit" disabled={loading}>
              {loading ? "Sending…" : "Send reset link"}
            </button>

            <p style={{ margin: 0, textAlign: "center" }}>
              Remembered it? <Link to="/login" state={{ mode: "login" }}>Back to login</Link>
            </p>
          </form>
        )}
      </section>
    </>
  );
}

const successStyle = {
  margin: 0,
  padding: "14px 16px",
  borderRadius: 10,
  background: "#e8f5ec",
  color: "#1f7a3a",
  fontWeight: 600,
};

const linkButton = { display: "block", textAlign: "center", textDecoration: "none" };
