import { useState } from 'react';
import api from '../api';
import { FULFILLMENT_LABELS, STATUS_LABELS } from './format';
import { Modal } from './ui';

/** Lets the admin pick a new status. Only statuses that fit the order's fulfillment type are offered. */
export default function ChangeStatusModal({ order, onClose, onSaved }) {
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data } = await api.patch(`/api/admin/orders/${order.id}/status`, { status });
      onSaved(data);
    } catch (err) {
      setError(err.response?.data?.errors?.status?.[0] ?? 'Couldn\'t update the status. Try again.');
      setSaving(false);
    }
  };

  return (
    <Modal title={`Change status: #${order.order_number}`} onClose={onClose} width={420}>
      <form onSubmit={save} className="adm-form">
        <p className="adm-form__hint">
          {FULFILLMENT_LABELS[order.fulfillment_type]} order for {order.customer}
        </p>

        <fieldset className="adm-radios">
          <legend>New status</legend>
          {order.allowed_statuses.map((s) => (
            <label key={s} className={status === s ? 'is-checked' : ''}>
              <input type="radio" name="status" value={s} checked={status === s} onChange={() => setStatus(s)} />
              {STATUS_LABELS[s] ?? s}
            </label>
          ))}
        </fieldset>

        {error && <p className="adm-alert" role="alert">{error}</p>}

        <div className="adm-form__actions">
          <button type="button" className="adm-btn adm-btn--outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="adm-btn" disabled={saving || status === order.status}>
            {saving ? 'Saving…' : 'Save status'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
