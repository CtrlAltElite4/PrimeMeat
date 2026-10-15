import { useEffect, useState } from 'react';
import api from '../api';
import { STATUS_LABELS, formatDate, formatRand } from './format';
import StatusPill from './StatusPill';
import { Modal } from './ui';

const time = (iso) => (iso ? `${formatDate(iso)} ${iso.slice(11, 16)}` : '–');

export default function PaymentModal({ paymentId, onClose, onViewOrder }) {
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/admin/payments/${paymentId}`)
      .then(({ data }) => setPayment(data))
      .catch(() => setError('Couldn\'t load this payment.'));
  }, [paymentId]);

  return (
    <Modal title={payment ? `Payment ${payment.payment_number}` : 'Payment details'} onClose={onClose} width={480}>
      {error && <p className="adm-alert" role="alert">{error}</p>}
      {!payment && !error && <p className="adm-modal__loading">Loading…</p>}

      {payment && (
        <>
          <dl className="adm-modal__meta">
            <div><dt>Amount</dt><dd><strong>{formatRand(payment.amount)}</strong></dd></div>
            <div><dt>Status</dt><dd><StatusPill status={payment.status} /></dd></div>
            <div><dt>Customer</dt><dd>{payment.customer}</dd></div>
            <div><dt>Email</dt><dd>{payment.customer_email ?? '–'}</dd></div>
            <div><dt>Created</dt><dd>{time(payment.created_at)}</dd></div>
            <div><dt>Paid</dt><dd>{time(payment.paid_at)}</dd></div>
            <div><dt>Method</dt><dd>{payment.method ? payment.method.toUpperCase() : '–'}</dd></div>
            <div><dt>Gateway reference</dt><dd>{payment.provider_reference ?? '–'}</dd></div>
          </dl>

          <div className="adm-linkbox">
            <div>
              <p className="adm-linkbox__label">Order #{payment.order_number}</p>
              <p className="adm-linkbox__sub">
                {formatRand(payment.order_total)} · {STATUS_LABELS[payment.order_status] ?? payment.order_status}
              </p>
            </div>
            <button type="button" className="adm-view" onClick={() => onViewOrder(payment.order_id)}>
              View order
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
