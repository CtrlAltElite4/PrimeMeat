import { useCallback, useEffect, useState } from 'react';
import { FiArrowDown, FiArrowUp, FiBox, FiShoppingCart, FiUsers } from 'react-icons/fi';
import { PiCoins } from 'react-icons/pi';
import api from '../api';
import { formatDate, formatNumber, formatRand, formatRandShort } from './format';
import StatusPill from './StatusPill';
import OrderModal from './OrderModal';

const CARDS = [
  { key: 'orders', label: 'Total Orders', icon: FiShoppingCart, format: formatNumber },
  { key: 'users', label: 'Total Users', icon: FiUsers, format: formatNumber },
  { key: 'revenue', label: 'Total Revenue', icon: PiCoins, format: formatRandShort },
  { key: 'products', label: 'Total Products', icon: FiBox, format: formatNumber },
];

function Change({ value }) {
  if (value === null || value === undefined) {
    return <p className="adm-stat__change adm-stat__change--flat">No earlier data</p>;
  }
  const up = value >= 0;
  const Arrow = up ? FiArrowUp : FiArrowDown;
  return (
    <p className={`adm-stat__change adm-stat__change--${value === 0 ? 'flat' : up ? 'up' : 'down'}`}>
      <Arrow aria-hidden="true" /> {up ? '+' : ''}{value}%
    </p>
  );
}

function StatCard({ label, icon: Icon, stat, format, periodDays }) {
  return (
    <article className="adm-stat">
      <span className="adm-stat__icon"><Icon aria-hidden="true" /></span>
      <h2 className="adm-stat__label">{label}</h2>
      <p className="adm-stat__value">{stat ? format(stat.value) : '–'}</p>
      {stat && <Change value={stat.change} />}
      <p className="adm-stat__period">Last {periodDays} days</p>
    </article>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewing, setViewing] = useState(null); // order id shown in the modal

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, ordersRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/orders/recent'),
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data);
    } catch (err) {
      const status = err.response?.status;
      setError(status === 403
        ? 'Your account doesn\'t have admin access.'
        : 'Couldn\'t load the dashboard. Check that Laravel is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <h1 className="adm-heading">Dashboard</h1>
      <p className="adm-subheading">Overview of platform activity</p>

      {error && (
        <div className="adm-alert" role="alert">
          {error} <button type="button" onClick={load}>Try again</button>
        </div>
      )}

      <section className={`adm-stats${loading ? ' adm-stats--loading' : ''}`} aria-label="Key figures">
        {CARDS.map((card) => (
          <StatCard key={card.key} {...card} stat={stats?.[card.key]} periodDays={stats?.period_days ?? 7} />
        ))}
      </section>

      <section className="adm-card">
        <h2 className="adm-card__title">Recent Orders</h2>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">Order ID</th>
                <th scope="col">Customer</th>
                <th scope="col">Date</th>
                <th scope="col">Total</th>
                <th scope="col">Status</th>
                <th scope="col" className="adm-table__action">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan="6" className="adm-table__empty">Loading orders…</td></tr>
              )}
              {!loading && orders.length === 0 && (
                <tr><td colSpan="6" className="adm-table__empty">No orders yet.</td></tr>
              )}
              {!loading && orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.order_number}</td>
                  <td>{order.customer}</td>
                  <td>{formatDate(order.date)}</td>
                  <td>{formatRand(order.total)}</td>
                  <td><StatusPill status={order.status} /></td>
                  <td className="adm-table__action">
                    <button type="button" className="adm-view" onClick={() => setViewing(order.id)}
                            aria-label={`View order ${order.order_number}`}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {viewing && <OrderModal orderId={viewing} onClose={() => setViewing(null)} />}
    </>
  );
}
