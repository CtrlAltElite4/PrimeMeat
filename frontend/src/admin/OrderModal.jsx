import { useEffect, useState } from 'react';
import api from '../api';
import { FULFILLMENT_LABELS, formatDate, formatRand } from './format';
import StatusPill from './StatusPill';
import { Modal } from './ui';

const PREFERENCE_LABELS = {
  steaks: 'Steaks',
  stew: 'Stew',
  mince: 'Mince',
  butcher_choice: "Butcher's choice",
};

/** "12 Main Rd, Unit 4, Polokwane, Limpopo, 0700" */
const formatAddress = (a) =>
  a
    ? [a.address_line_1, a.address_line_2, a.city, a.province, a.postal_code].filter(Boolean).join(', ')
    : '';

/** Everything the butcher needs for one product: grade, weight and the cut sheet. */
function ItemDetails({ item }) {
  const sides = Object.entries(item.cut_selections ?? {});
  const prefs = item.remaining_meat_preferences ?? [];
  const isCustom = item.cut_type === 'custom';

  return (
    <article className="adm-order-item">
      <header className="adm-order-item__head">
        <div>
          <strong>{item.product_name}</strong>
          <span className="adm-order-item__sub">
            {[item.grade && `Grade ${item.grade}`, item.weight_range, `Qty ${item.quantity}`]
              .filter(Boolean)
              .join(' · ')}
          </span>
        </div>
        <span>{formatRand(item.line_total)}</span>
      </header>

      {item.cut_type && (
        <dl className="adm-order-item__facts">
          <div>
            <dt>Cut type</dt>
            <dd>{isCustom ? 'Custom cut sheet' : 'Traditional cuts'}</dd>
          </div>
          {item.selected_quarter && (
            <div>
              <dt>Quarter</dt>
              <dd>{item.selected_quarter === 'front' ? 'Front quarter' : 'Hind quarter'}</dd>
            </div>
          )}
          {isCustom && (
            <div>
              <dt>Remaining meat</dt>
              <dd>{prefs.length ? prefs.map((p) => PREFERENCE_LABELS[p] ?? p).join(', ') : '–'}</dd>
            </div>
          )}
        </dl>
      )}

      {sides.length > 0 && (
        <div className="adm-order-item__cuts">
          {sides.map(([label, cuts]) => (
            <div key={label}>
              <h4>{label}</h4>
              <ul>
                {cuts.map((cut) => (
                  <li key={cut}>{cut}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {item.special_instructions && (
        <p className="adm-order-item__note">
          <strong>Special instructions:</strong> {item.special_instructions}
        </p>
      )}
    </article>
  );
}

export default function OrderModal({ orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/admin/orders/${orderId}`)
      .then(({ data }) => setOrder(data))
      .catch(() => setError('Couldn\'t load this order.'));
  }, [orderId]);

  const group = order?.group_order;
  const address = order?.delivery ?? group?.address;

  return (
    <Modal
      title={order ? `Order #${order.order_number}` : 'Order details'}
      onClose={onClose}
      width={820}
    >
      {error && <p className="adm-alert" role="alert">{error}</p>}
      {!order && !error && <p className="adm-modal__loading">Loading…</p>}

      {order && (
        <div className="adm-order-details">
          <dl className="adm-modal__meta">
            <div><dt>Customer</dt><dd>{order.customer}</dd></div>
            <div><dt>Date</dt><dd>{formatDate(order.created_at)}</dd></div>
            <div><dt>Email</dt><dd>{order.customer_email ?? '–'}</dd></div>
            <div><dt>Phone</dt><dd>{order.customer_phone ?? '–'}</dd></div>
            <div><dt>Fulfillment</dt><dd>{FULFILLMENT_LABELS[order.fulfillment_type] ?? order.fulfillment_type}</dd></div>
            <div><dt>Status</dt><dd><StatusPill status={order.status} /></dd></div>
            {address ? (
              <div className="adm-modal__meta-full">
                <dt>Delivery address</dt>
                <dd>{formatAddress(address)}</dd>
                {address.instructions && (
                  <dd className="adm-modal__meta-note">Instructions: {address.instructions}</dd>
                )}
              </div>
            ) : (
              order.fulfillment_type === 'collection' && (
                <div className="adm-modal__meta-full">
                  <dt>Collection</dt>
                  <dd>Customer collects from the store</dd>
                </div>
              )
            )}
          </dl>

          {group && (
            <section className="adm-order-group">
              <h3>Group order</h3>
              <p>
                {group.weight_range} kg · {group.number_of_people} people
                {group.include_ground_beef ? ' · with ground beef' : ''}
                {group.delivery_member && group.delivery_method !== 'collection'
                  ? ` · delivered to ${group.delivery_member}`
                  : ''}
              </p>
              <ul>
                {group.members.map((m) => (
                  <li key={`${m.email}-${m.name}`}>
                    {m.name} · {m.phone} · {m.email}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <h3 className="adm-order-details__heading">Items to prepare</h3>
          {order.items.map((item) => (
            <ItemDetails key={item.id} item={item} />
          ))}

          <dl className="adm-order-totals">
            {order.delivery_fee > 0 && (
              <div><dt>Delivery fee</dt><dd>{formatRand(order.delivery_fee)}</dd></div>
            )}
            <div><dt>Order total</dt><dd>{formatRand(order.total)}</dd></div>
          </dl>

          <div className="adm-order-details__actions">
            <button type="button" className="adm-btn adm-btn--outline" onClick={() => window.print()}>
              Print
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
