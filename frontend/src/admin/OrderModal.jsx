import { useEffect, useState } from 'react';
import api from '../api';
import { FULFILLMENT_LABELS, formatDate, formatRand } from './format';
import StatusPill from './StatusPill';
import { Modal } from './ui';

export default function OrderModal({ orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/admin/orders/${orderId}`)
      .then(({ data }) => setOrder(data))
      .catch(() => setError('Couldn\'t load this order.'));
  }, [orderId]);

  return (
    <Modal title={order ? `Order #${order.order_number}` : 'Order details'} onClose={onClose}>
      {error && <p className="adm-alert" role="alert">{error}</p>}
      {!order && !error && <p className="adm-modal__loading">Loading…</p>}

      {order && (
        <>
          <dl className="adm-modal__meta">
            <div><dt>Customer</dt><dd>{order.customer}</dd></div>
            <div><dt>Email</dt><dd>{order.customer_email ?? '–'}</dd></div>
            <div><dt>Date</dt><dd>{formatDate(order.created_at)}</dd></div>
            <div><dt>Fulfillment</dt><dd>{FULFILLMENT_LABELS[order.fulfillment_type] ?? order.fulfillment_type}</dd></div>
            <div><dt>Status</dt><dd><StatusPill status={order.status} /></dd></div>
          </dl>

          <table className="adm-table adm-table--compact">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Qty</th>
                <th scope="col">Price</th>
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.product_name}</td>
                  <td>{item.quantity}</td>
                  <td>{formatRand(item.unit_price)}</td>
                  <td>{formatRand(item.line_total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" colSpan="3">Order total</th>
                <td>{formatRand(order.total)}</td>
              </tr>
            </tfoot>
          </table>
        </>
      )}
    </Modal>
  );
}
