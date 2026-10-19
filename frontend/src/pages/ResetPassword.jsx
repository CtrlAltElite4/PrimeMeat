import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

import api from "../api";
import "../components/AuthPage.css";

/**
 * Step 2 of "forgot password": opened from the link in the email
 * (/reset-password?token=...&email=...). The customer chooses a new password.
 */
export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const email = params.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [done, setDone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setFormError("");

    if (password !== confirmation) {
      setErrors({ password_confirmation: "Passwords don't match." });
      return;
    }

    setLoading(true);

    try {
      await api.get("/sanctum/csrf-cookie");
      const { data } = await api.post("/api/reset-password", {
        token,
        email,
        password,
        password_confirmation: confirmation,
      });
      setDone(data.message);
    } catch (err) {
      const status = err.response?.status;

      if (status === 422) {
        const fieldErrors = err.response.data.errors || {};
        // Token/email problems mean the link itself is bad, so show them at the top
        if (fieldErrors.email || fieldErrors.token) {
          setFormError((fieldErrors.email || fieldErrors.token)[0]);
        }
        setErrors({
          password: fieldErrors.password?.[0],
          password_confirmation: fieldErrors.password_confirmation?.[0],
        });
      } else if (status === 429) {
        setFormError("Too many attempts. Wait a minute, then try again.");
      } else {
        setFormError("Can't reach the server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Opened without the details from the email
  if (!token || !email) {
    return (
      <section className="auth">
        <div className="auth__form">
          <p className="auth__alert" role="alert">
            This reset link is incomplete. Please use the link from your email, or request a new one.
          </p>
          <Link to="/forgot-password" className="auth__submit" style={linkButton}>
            Request a new link
          </Link>
        </div>
      </section>
    );
  }

  const passwordField = (name, placeholder, value, setValue) => (
    <div className="field">
      <div className={`field__box${errors[name] ? " field__box--error" : ""}`}>
        <FaLock className="field__icon" aria-hidden="true" />
        <input
          type={visible ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          aria-label={placeholder}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setErrors((errs) => ({ ...errs, [name]: undefined }));
          }}
          autoComplete="new-password"
        />
        <button
          type="button"
          className="field__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {errors[name] && <p className="field__error">{errors[name]}</p>}
    </div>
  );

  return (
    <>
      <section className="auth-hero">
        <div className="auth-hero__panel">
          <h1 className="auth-hero__title">Choose a new password</h1>
          <p className="auth-hero__text">For {email}</p>
        </div>
      </section>

      <section className="auth">
        {done ? (
          <div className="auth__form">
            <p role="status" style={successStyle}>
              {done}
            </p>
            <Link to="/login" state={{ mode: "login" }} className="auth__submit" style={linkButton}>
              Log in
            </Link>
          </div>
        ) : (
          <form className="auth__form" onSubmit={handleSubmit} noValidate>
            {formError && (
              <p className="auth__alert" role="alert">
                {formError}{" "}
                <Link to="/forgot-password">Request a new link</Link>
              </p>
            )}

            {passwordField("password", "New password", password, setPassword)}
            {passwordField("password_confirmation", "Confirm new password", confirmation, setConfirmation)}

            <p style={{ margin: 0, fontSize: "0.9rem" }}>
              At least 8 characters, with letters and numbers.
            </p>

            <button type="submit" className="auth__submit" disabled={loading}>
              {loading ? "Saving…" : "Reset password"}
            </button>
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
