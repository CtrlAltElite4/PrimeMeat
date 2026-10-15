import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { USER_TYPE_LABELS, formatDate, formatRand, initials } from './format';
import StatusPill from './StatusPill';
import { Modal } from './ui';

export default function UserModal({ userId, onClose }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/admin/users/${userId}`)
      .then(({ data }) => setUser(data))
      .catch(() => setError('Couldn\'t load this user.'));
  }, [userId]);

  return (
    <Modal title="User details" onClose={onClose} width={480}>
      {error && <p className="adm-alert" role="alert">{error}</p>}
      {!user && !error && <p className="adm-modal__loading">Loading…</p>}

      {user && (
        <>
          <div className="adm-profile">
            <span className="adm-avatar adm-avatar--lg">{initials(user.name)}</span>
            <div>
              <p className="adm-profile__name">{user.name}</p>
              <p className="adm-profile__email">{user.email}</p>
            </div>
          </div>

          <dl className="adm-modal__meta">
            <div><dt>Type</dt><dd>{USER_TYPE_LABELS[user.type]}</dd></div>
            <div><dt>Status</dt><dd><StatusPill status={user.status} /></dd></div>
            <div><dt>Joined</dt><dd>{user.joined ? formatDate(user.joined) : '–'}</dd></div>
            <div><dt>Suspended since</dt><dd>{user.suspended_at ? formatDate(user.suspended_at) : '–'}</dd></div>
            <div><dt>Orders</dt><dd>{user.orders_count}</dd></div>
            <div><dt>Total spent</dt><dd>{formatRand(user.total_spent)}</dd></div>
            <div><dt>Last order</dt><dd>{user.last_order_date ?? '–'}</dd></div>
          </dl>

          {user.orders_count > 0 && (
            <Link className="adm-view" to={`/admin/orders?search=${encodeURIComponent(user.name)}`} onClick={onClose}>
              See their orders
            </Link>
          )}
        </>
      )}
    </Modal>
  );
}
