import { useState } from 'react';
import api from '../api';
import { Modal } from './ui';

const ANSWER_MAX = 5000;

/** Add or edit one FAQ. Pass `faq` to edit; leave it out to add. */
export default function FaqFormModal({ faq, onClose, onSaved }) {
  const editing = Boolean(faq);
  const [form, setForm] = useState({ question: faq?.question ?? '', answer: faq?.answer ?? '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const update = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((errs) => ({ ...errs, [name]: undefined, form: undefined }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const { data } = editing
        ? await api.put(`/api/admin/faqs/${faq.id}`, form)
        : await api.post('/api/admin/faqs', form);
      onSaved(data, editing);
    } catch (err) {
      const fieldErrors = err.response?.data?.errors;
      setErrors(fieldErrors
        ? Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, v[0]]))
        : { form: 'Couldn\'t save this FAQ. Try again.' });
      setSaving(false);
    }
  };

  return (
    <Modal title={editing ? 'Edit FAQ' : 'Add FAQ'} onClose={onClose} width={620}>
      <form className="adm-form" onSubmit={save} noValidate>
        <label className="adm-field">
          <span>Question</span>
          <input name="question" value={form.question} onChange={update} maxLength={255}
                 placeholder="e.g. Do you deliver to Limpopo?" className={errors.question ? 'has-error' : ''} />
          {errors.question && <small className="adm-field__error">{errors.question}</small>}
        </label>

        <label className="adm-field">
          <span>Answer</span>
          <textarea name="answer" value={form.answer} onChange={update} rows={7} maxLength={ANSWER_MAX}
                    placeholder="The answer the chatbot should give." className={errors.answer ? 'has-error' : ''} />
          {errors.answer && <small className="adm-field__error">{errors.answer}</small>}
        </label>
        <p className="adm-form__hint">
          {form.answer.length} / {ANSWER_MAX} characters. The chatbot uses this straight away, so keep it accurate.
        </p>

        {errors.form && <p className="adm-alert" role="alert">{errors.form}</p>}

        <div className="adm-form__actions">
          <button type="button" className="adm-btn adm-btn--outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="adm-btn" disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Add FAQ'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
