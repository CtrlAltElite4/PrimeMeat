import { useState } from 'react';
import api from '../api';
import { Modal } from './ui';

const EMPTY = { name: '', email: '', password: '', type: 'customer' };

export default function AddUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const update = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((errs) => ({ ...errs, [name]: undefined }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const { data } = await api.post('/api/admin/users', form);
      onCreated(data);
    } catch (err) {
      const fieldErrors = err.response?.data?.errors;
      setErrors(fieldErrors
        ? Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, v[0]]))
        : { form: 'Couldn\'t create the user. Try again.' });
      setSaving(false);
    }
  };

  const field = (name, label, props = {}) => (
    <label className="adm-field">
      <span>{label}</span>
      <input name={name} value={form[name]} onChange={update} className={errors[name] ? 'has-error' : ''} {...props} />
      {errors[name] && <small className="adm-field__error">{errors[name]}</small>}
    </label>
  );

  return (
    <Modal title="Add user" onClose={onClose} width={460}>
      <form className="adm-form" onSubmit={save} noValidate>
        {field('name', 'Full name', { autoComplete: 'off' })}
        {field('email', 'Email', { type: 'email', autoComplete: 'off' })}
        {field('password', 'Starting password', { type: 'text', autoComplete: 'new-password' })}
        <p className="adm-form__hint">At least 8 characters with letters and numbers. Share it with the person so they can log in.</p>

        <label className="adm-field">
          <span>Type</span>
          <select name="type" value={form.type} onChange={update}>
            <option value="customer">Customer</option>
            <option value="admin">Admin (full access to this panel)</option>
          </select>
        </label>

        {errors.form && <p className="adm-alert" role="alert">{errors.form}</p>}

        <div className="adm-form__actions">
          <button type="button" className="adm-btn adm-btn--outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="adm-btn" disabled={saving}>{saving ? 'Adding…' : 'Add user'}</button>
        </div>
      </form>
    </Modal>
  );
}
