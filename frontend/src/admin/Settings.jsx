import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FiAlertTriangle, FiBell, FiCreditCard, FiEye, FiEyeOff, FiShield, FiShoppingCart, FiUser, FiUserPlus,
} from 'react-icons/fi';
import api from '../api';
import { initials } from './format';
import { PageHeader } from './ui';

const TABS = [
  { key: 'profile', label: 'Profile', icon: FiUser },
  { key: 'notifications', label: 'Notification', icon: FiBell },
  { key: 'security', label: 'Security', icon: FiShield },
];

// Settings > Notification: the two groups of email alerts
const NOTIFICATION_GROUPS = [
  {
    title: 'Email notifications',
    hint: 'Choose which email notifications you would like to receive.',
    items: [
      { key: 'new_orders', icon: FiShoppingCart, label: 'New orders', text: 'Get notified when an order is placed' },
      { key: 'payment_updates', icon: FiCreditCard, label: 'Payment updates', text: 'Receive updates on payment status' },
      { key: 'new_users', icon: FiUserPlus, label: 'New user registrations', text: 'Get notified when a user joins' },
    ],
  },
  {
    title: 'System and stock alerts',
    hint: 'Receive important system notifications and stock alerts.',
    items: [
      { key: 'system_alerts', icon: FiShield, label: 'System alerts', text: 'Get important account and security notifications' },
      { key: 'stock_alerts', icon: FiAlertTriangle, label: 'Stock alerts', text: 'Get notified when stock is low' },
    ],
  },
];

const firstErrors = (err, fallback) => {
  const fieldErrors = err.response?.data?.errors;
  return fieldErrors
    ? Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, v[0]]))
    : { form: err.response?.status === 429 ? 'Too many attempts. Wait a minute and try again.' : fallback };
};

function Field({ label, name, value, onChange, error, ...props }) {
  return (
    <label className="adm-field">
      <span>{label}</span>
      <input name={name} value={value} onChange={onChange} className={error ? 'has-error' : ''} {...props} />
      {error && <small className="adm-field__error">{error}</small>}
    </label>
  );
}

function PasswordField({ label, name, value, onChange, error, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <label className="adm-field">
      <span>{label}</span>
      <span className="adm-pw">
        <input type={show ? 'text' : 'password'} name={name} value={value} onChange={onChange}
               className={error ? 'has-error' : ''} autoComplete={autoComplete} />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
          {show ? <FiEyeOff /> : <FiEye />}
        </button>
      </span>
      {error && <small className="adm-field__error">{error}</small>}
    </label>
  );
}

function ProfileTab({ user, updateUser }) {
  const [first, ...rest] = (user.name ?? '').split(' ');
  const original = { first_name: first ?? '', last_name: rest.join(' '), email: user.email ?? '', phone: user.phone ?? '' };
  const [form, setForm] = useState({ ...original, current_password: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const emailChanged = form.email.trim().toLowerCase() !== original.email.toLowerCase();
  const dirty = ['first_name', 'last_name', 'email', 'phone'].some((k) => form[k] !== original[k]);

  const update = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((errs) => ({ ...errs, [name]: undefined, form: undefined }));
    setSaved(false);
  };

  const cancel = () => { setForm({ ...original, current_password: '' }); setErrors({}); setSaved(false); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const { current_password: pw, ...fields } = form;
      const { data } = await api.put('/api/profile', emailChanged ? { ...fields, current_password: pw } : fields);
      updateUser(data);
      setForm({ first_name: form.first_name.trim(), last_name: form.last_name.trim(), email: data.email, phone: data.phone ?? '', current_password: '' });
      setSaved(true);
    } catch (err) {
      setErrors(firstErrors(err, 'Couldn\'t save your profile. Try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="adm-settings__panel" onSubmit={save} noValidate>
      <h2 className="adm-settings__title">Profile Settings</h2>

      <div className="adm-profile">
        <span className="adm-avatar adm-avatar--lg">{initials(user.name)}</span>
        <div>
          <p className="adm-profile__name">{user.name}</p>
          <p className="adm-profile__email">{user.email}</p>
        </div>
      </div>

      <div className="adm-grid2 adm-grid2--roomy">
        <Field label="First name" name="first_name" value={form.first_name} onChange={update} error={errors.first_name} autoComplete="given-name" />
        <Field label="Last name" name="last_name" value={form.last_name} onChange={update} error={errors.last_name} autoComplete="family-name" />
        <Field label="Email" name="email" type="email" value={form.email} onChange={update} error={errors.email} autoComplete="email" />
        <Field label="Phone number" name="phone" type="tel" value={form.phone} onChange={update} error={errors.phone}
               autoComplete="tel" placeholder="+27 82 123 4567" />
        {emailChanged && (
          <PasswordField label="Current password (needed to change email)" name="current_password"
                         value={form.current_password} onChange={update} error={errors.current_password}
                         autoComplete="current-password" />
        )}
      </div>

      {errors.form && <p className="adm-alert" role="alert">{errors.form}</p>}
      {saved && <p className="adm-notice" role="status">Profile saved.</p>}

      <div className="adm-settings__actions">
        <button type="submit" className="adm-btn" disabled={saving || !dirty}>{saving ? 'Saving…' : 'Save changes'}</button>
        <button type="button" className="adm-btn adm-btn--outline" onClick={cancel} disabled={!dirty}>Cancel</button>
      </div>
    </form>
  );
}

function SecurityTab() {
  const EMPTY = { current_password: '', password: '', password_confirmation: '' };
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((errs) => ({ ...errs, [name]: undefined, form: undefined }));
    setSaved(false);
  };

  const save = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: 'Passwords don\'t match.' });
      return;
    }
    setSaving(true);
    setErrors({});
    try {
      await api.put('/api/profile/password', form);
      setForm(EMPTY);
      setSaved(true);
    } catch (err) {
      setErrors(firstErrors(err, 'Couldn\'t change your password. Try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="adm-settings__panel" onSubmit={save} noValidate>
      <h2 className="adm-settings__title">Security</h2>
      <p className="adm-form__hint">Change the password you use to log in.</p>

      <div className="adm-settings__narrow">
        <PasswordField label="Current password" name="current_password" value={form.current_password}
                       onChange={update} error={errors.current_password} autoComplete="current-password" />
        <PasswordField label="New password" name="password" value={form.password}
                       onChange={update} error={errors.password} autoComplete="new-password" />
        <PasswordField label="Confirm new password" name="password_confirmation" value={form.password_confirmation}
                       onChange={update} error={errors.password_confirmation} autoComplete="new-password" />
        <p className="adm-form__hint">At least 8 characters, with letters and numbers.</p>
      </div>

      {errors.form && <p className="adm-alert" role="alert">{errors.form}</p>}
      {saved && <p className="adm-notice" role="status">Password changed.</p>}

      <div className="adm-settings__actions">
        <button type="submit" className="adm-btn"
                disabled={saving || !form.current_password || !form.password || !form.password_confirmation}>
          {saving ? 'Saving…' : 'Change password'}
        </button>
      </div>
    </form>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label}
            className={`adm-switch${checked ? ' is-on' : ''}`} onClick={() => onChange(!checked)}>
      <span className="adm-switch__knob" />
    </button>
  );
}

function NotificationTab() {
  const [saved, setSaved] = useState(null); // what's stored on the server
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(false);

  useEffect(() => {
    api.get('/api/admin/notification-preferences')
      .then(({ data }) => { setSaved(data); setForm(data); })
      .catch(() => setError('Couldn\'t load your notification settings.'));
  }, []);

  const dirty = form && saved && Object.keys(form).some((k) => form[k] !== saved[k]);

  const toggle = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setNotice(false);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data } = await api.put('/api/admin/notification-preferences', form);
      setSaved(data);
      setForm(data);
      setNotice(true);
    } catch {
      setError('Couldn\'t save your notification settings. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="adm-settings__panel" onSubmit={save}>
      <h2 className="adm-settings__title">Notification Settings</h2>

      {!form && !error && <p className="adm-form__hint">Loading…</p>}

      {form && NOTIFICATION_GROUPS.map((group) => (
        <section key={group.title} className="adm-notif">
          <h3 className="adm-notif__title">{group.title}</h3>
          <p className="adm-form__hint">{group.hint}</p>

          <ul className="adm-notif__list">
            {group.items.map(({ key, icon: Icon, label, text }) => (
              <li key={key} className="adm-notif__row">
                <span className="adm-notif__icon" aria-hidden="true"><Icon /></span>
                <span className="adm-notif__text">
                  <strong>{label}</strong>
                  <span>{text}</span>
                </span>
                <Toggle checked={form[key]} onChange={(v) => toggle(key, v)} label={label} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      {error && <p className="adm-alert" role="alert">{error}</p>}
      {notice && <p className="adm-notice" role="status">Notification settings saved.</p>}

      {form && (
        <div className="adm-settings__actions adm-settings__actions--end">
          <button type="submit" className="adm-btn" disabled={saving || !dirty}>{saving ? 'Saving…' : 'Save changes'}</button>
          <button type="button" className="adm-btn adm-btn--outline" disabled={!dirty}
                  onClick={() => { setForm(saved); setNotice(false); }}>Cancel</button>
        </div>
      )}
    </form>
  );
}

export default function Settings() {
  const { user, updateUser } = useOutletContext();
  const [tab, setTab] = useState('profile');

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage admin panel profile, preferences and configuration." />

      <section className="adm-settings">
        <nav className="adm-settings__tabs" aria-label="Settings sections">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} type="button" onClick={() => setTab(key)}
                    className={`adm-settings__tab${tab === key ? ' is-active' : ''}`}
                    aria-current={tab === key ? 'page' : undefined}>
              <Icon aria-hidden="true" /> {label}
            </button>
          ))}
        </nav>

        {tab === 'profile' && <ProfileTab key={user.id} user={user} updateUser={updateUser} />}
        {tab === 'notifications' && <NotificationTab />}
        {tab === 'security' && <SecurityTab />}
      </section>
    </>
  );
}
