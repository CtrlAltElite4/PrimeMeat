import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiCheck, FiClock, FiEdit2, FiEye, FiShoppingCart } from 'react-icons/fi';
import { BsShop } from 'react-icons/bs';
import api from '../api';
import { FULFILLMENT_LABELS, ORDER_STATUS_LABELS, formatDate, formatNumber, formatRand } from './format';
import StatusPill from './StatusPill';
import OrderModal from './OrderModal';
import ChangeStatusModal from './ChangeStatusModal';
import { FilterSelect, MiniStat, PageHeader, Pagination, SearchBox } from './ui';

const STATUS_OPTIONS = Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label }));

export default function Orders() {
  // Filters live in the URL (e.g. /admin/orders?status=pending), so the bell icon can link here pre-filtered
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? '';
  const search = params.get('search') ?? '';
  const page = Number(params.get('page') ?? 1);

  const [stats, setStats] = useState(null);
  const [result, setResult] = useState(null); // Laravel paginator: { data, total, last_page, ... }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewing, setViewing] = useState(null);   // order id
  const [changing, setChanging] = useState(null); // order object

  const setFilter = useCallback((key, value) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value); else next.delete(key);
      if (key !== 'page') next.delete('page'); // new filter -> back to page 1
      return next;
    });
  }, [setParams]);

  const onSearch = useCallback((value) => setFilter('search', value), [setFilter]);

  const loadStats = useCallback(() => {
    api.get('/api/admin/orders/stats').then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/admin/orders', {
        params: { search: search || undefined, status: status || undefined, page },
      });
      setResult(data);
    } catch {
      setError('Couldn\'t load orders. Check that Laravel is running.');
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadOrders(); }, [loadOrders]);

  // After a status change: update that row in place and refresh the cards
  const handleSaved = (updated) => {
    setResult((r) => ({ ...r, data: r.data.map((o) => (o.id === updated.id ? updated : o)) }));
    setChanging(null);
    loadStats();
  };

  const orders = result?.data ?? [];

  return (
    <>
      <PageHeader title="Orders" subtitle="Manage orders by viewing and changing status" />

      <section className="adm-minis" aria-label="Order figures">
        <MiniStat icon={FiShoppingCart} label="Total orders" value={stats && formatNumber(stats.total)} />
        <MiniStat icon={FiClock} label="Processing" value={stats && formatNumber(stats.processing)} note="Right now" />
        <MiniStat icon={BsShop} label="Ready for collection" value={stats && formatNumber(stats.ready_for_collection)} note="Right now" />
        <MiniStat icon={FiCheck} label="Completed" value={stats && formatNumber(stats.completed_last_7_days)} note="Last 7 days" />
      </section>

      <div className="adm-toolbar">
        <SearchBox placeholder="Search by order ID or customer" initial={search} onSearch={onSearch} />
        <FilterSelect label="All statuses" value={status} options={STATUS_OPTIONS}
                      onChange={(v) => setFilter('status', v)} />
      </div>

      {error && (
        <div className="adm-alert" role="alert">
          {error} <button type="button" onClick={loadOrders}>Try again</button>
        </div>
      )}

      <section className="adm-card adm-card--flush">
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">Order ID</th>
                <th scope="col">Customer</th>
                <th scope="col">Date</th>
                <th scope="col">Total</th>
                <th scope="col">Fulfillment Type</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && !result && (
                <tr><td colSpan="7" className="adm-table__empty">Loading orders…</td></tr>
              )}
              {result && orders.length === 0 && (
                <tr><td colSpan="7" className="adm-table__empty">No orders match.</td></tr>
              )}
              {orders.map((order) => (
                <tr key={order.id} className={loading ? 'is-stale' : ''}>
                  <td>#{order.order_number}</td>
                  <td>{order.customer}</td>
                  <td>{formatDate(order.date)}</td>
                  <td>{formatRand(order.total)}</td>
                  <td>{FULFILLMENT_LABELS[order.fulfillment_type] ?? order.fulfillment_type}</td>
                  <td><StatusPill status={order.status} /></td>
                  <td>
                    <div className="adm-actions">
                      <button type="button" className="adm-view adm-view--muted" onClick={() => setViewing(order.id)}
                              aria-label={`View order ${order.order_number}`}>
                        <FiEye aria-hidden="true" /> View
                      </button>
                      <button type="button" className="adm-view" onClick={() => setChanging(order)}
                              aria-label={`Change status of order ${order.order_number}`}>
                        <FiEdit2 aria-hidden="true" /> Change Status
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {result && (
          <Pagination page={result.current_page} lastPage={result.last_page} shown={orders.length}
                      total={result.total} noun="orders" onPage={(p) => setFilter('page', String(p))} />
        )}
      </section>

      {viewing && <OrderModal orderId={viewing} onClose={() => setViewing(null)} />}
      {changing && <ChangeStatusModal order={changing} onClose={() => setChanging(null)} onSaved={handleSaved} />}
    </>
  );
}
