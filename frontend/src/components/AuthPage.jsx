import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import api from "../api";
import "./AuthPage.css";

const EMPTY = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  password_confirmation: "",
  remember: false,
};

const HERO = {
  register: {
    title: "Create an account",
    text: "Sign up to create orders and manage your profile.",
  },
  login: {
    title: "Welcome back",
    text: "Log in to place orders and manage your profile.",
  },
};

function Field({ icon: Icon, error, children }) {
  return (
    <div className="field">
      <div className={`field__box${error ? " field__box--error" : ""}`}>
        <Icon className="field__icon" aria-hidden="true" />
        {children}
      </div>
      {error && <p className="field__error">{error}</p>}
    </div>
  );
}

function PasswordField({
  name,
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <Field icon={FaLock} error={error}>
      <input
        type={visible ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        aria-label={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
      />

      <button
        type="button"
        className="field__toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <FaEyeSlash /> : <FaEye />}
      </button>
    </Field>
  );
}

export default function AuthPage({ onAuth }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState("register");
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  const update = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((errs) => ({
      ...errs,
      [name]: undefined,
    }));
  };

  const switchMode = (next) => {
    setMode(next);
    setErrors({});
    setFormError("");

    setForm((f) => ({
      ...f,
      password: "",
      password_confirmation: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setFormError("");

    if (isRegister && form.password !== form.password_confirmation) {
      setErrors({
        password_confirmation: "Passwords don't match.",
      });
      return;
    }

    const payload = isRegister
      ? {
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          password: form.password,
          password_confirmation: form.password_confirmation,
        }
      : {
          email: form.email,
          password: form.password,
          remember: form.remember,
        };

    setLoading(true);

    try {
      await api.get("/sanctum/csrf-cookie");

      const { data } = await api.post(`/api/${mode}`, payload);

      onAuth(data);

      navigate("/");
    } catch (err) {
      const status = err.response?.status;

      if (status === 422) {
        const fieldErrors = err.response.data.errors || {};

        setErrors(
          Object.fromEntries(
            Object.entries(fieldErrors).map(([key, messages]) => [
              key,
              messages[0],
            ]),
          ),
        );
      } else if (status === 429) {
        setFormError(
          "Too many attempts. Wait a minute, then try again.",
        );
      } else {
        setFormError(
          "Can't reach the server. Check that Laravel is running.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="auth-hero">
        <div className="auth-hero__panel">
          <h1 className="auth-hero__title">{HERO[mode].title}</h1>
          <p className="auth-hero__text">{HERO[mode].text}</p>
        </div>
      </section>

      <section className="auth">
        <div
          className="auth__tabs"
          role="tablist"
          aria-label="Account"
        >
          <button
            type="button"
            role="tab"
            aria-selected={isRegister}
            className={`auth__tab${
              isRegister ? " auth__tab--active" : ""
            }`}
            onClick={() => switchMode("register")}
          >
            Sign Up
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={!isRegister}
            className={`auth__tab${
              !isRegister ? " auth__tab--active" : ""
            }`}
            onClick={() => switchMode("login")}
          >
            Login
          </button>
        </div>

        <form
          className="auth__form"
          onSubmit={handleSubmit}
          noValidate
        >
          {formError && (
            <p className="auth__alert" role="alert">
              {formError}
            </p>
          )}

          {isRegister && (
            <div className="auth__row">
              <Field
                icon={FaUserCircle}
                error={errors.first_name}
              >
                <input
                  name="first_name"
                  placeholder="First Name"
                  aria-label="First name"
                  value={form.first_name}
                  onChange={update}
                  autoComplete="given-name"
                />
              </Field>

              <Field
                icon={FaUserCircle}
                error={errors.last_name}
              >
                <input
                  name="last_name"
                  placeholder="Last Name"
                  aria-label="Last name"
                  value={form.last_name}
                  onChange={update}
                  autoComplete="family-name"
                />
              </Field>
            </div>
          )}

          <Field icon={FaEnvelope} error={errors.email}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              aria-label="Email"
              value={form.email}
              onChange={update}
              autoComplete="email"
            />
          </Field>

          <PasswordField
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={update}
            error={errors.password}
            autoComplete={
              isRegister ? "new-password" : "current-password"
            }
          />

          {isRegister ? (
            <PasswordField
              name="password_confirmation"
              placeholder="Confirm password"
              value={form.password_confirmation}
              onChange={update}
              error={errors.password_confirmation}
              autoComplete="new-password"
            />
          ) : (
            <label className="auth__remember">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={update}
              />
              Keep me signed in
            </label>
          )}

          <button
            type="submit"
            className="auth__submit"
            disabled={loading}
          >
            {loading
              ? isRegister
                ? "Registering…"
                : "Logging in…"
              : isRegister
                ? "Register"
                : "Login"}
          </button>
        </form>
      </section>
    </>
  );
}