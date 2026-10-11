import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiCheck, FiClock, FiCreditCard, FiEye, FiX } from 'react-icons/fi';
import api from '../api';
import { PAYMENT_STATUS_LABELS, formatDate, formatNumber, formatRand } from './format';
import StatusPill from './StatusPill';
import PaymentModal from './PaymentModal';
import OrderModal from './OrderModal';
import { FilterSelect, MiniStat, PageHeader, Pagination, SearchBox } from './ui';

const STATUS_OPTIONS = Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => ({ value, label }));

export default function Payments() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? '';
  const search = params.get('search') ?? '';
  const page = Number(params.get('page') ?? 1);

  const [stats, setStats] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewing, setViewing] = useState(null);      // payment id
  const [viewingOrder, setViewingOrder] = useState(null); // order id

  const setFilter = useCallback((key, value) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value); else next.delete(key);
      if (key !== 'page') next.delete('page');
      return next;
    });
  }, [setParams]);

  const onSearch = useCallback((value) => setFilter('search', value), [setFilter]);

  useEffect(() => {
    api.get('/api/admin/payments/stats').then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/admin/payments', {
        params: { search: search || undefined, status: status || undefined, page },
      });
      setResult(data);
    } catch {
      setError('Couldn\'t load payments. Check that Laravel is running.');
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => { loadPayments(); }, [loadPayments]);

  const payments = result?.data ?? [];

  return (
    <>
      <PageHeader title="Payments" subtitle="View payments made by customers." />

      <section className="adm-minis" aria-label="Payment figures">
        <MiniStat icon={FiCreditCard} label="Total payments" value={stats && formatNumber(stats.total)} />
        <MiniStat icon={FiCheck} label="Successful" value={stats && formatNumber(stats.successful_last_7_days)} note="Last 7 days" />
        <MiniStat icon={FiClock} label="Pending" value={stats && formatNumber(stats.pending)} note="Right now" />
        <MiniStat icon={FiX} label="Failed" value={stats && formatNumber(stats.failed_last_7_days)} note="Last 7 days" />
      </section>

      <div className="adm-toolbar">
        <SearchBox placeholder="Search by payment ID or order ID…" initial={search} onSearch={onSearch} />
        <FilterSelect label="All statuses" value={status} options={STATUS_OPTIONS}
                      onChange={(v) => setFilter('status', v)} />
      </div>

      {error && (
        <div className="adm-alert" role="alert">
          {error} <button type="button" onClick={loadPayments}>Try again</button>
        </div>
      )}

      <section className="adm-card adm-card--flush">
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">Payment ID</th>
                <th scope="col">Order ID</th>
                <th scope="col">Customer</th>
                <th scope="col">Date</th>
                <th scope="col">Total</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && !result && (
                <tr><td colSpan="7" className="adm-table__empty">Loading payments…</td></tr>
              )}
              {result && payments.length === 0 && (
                <tr><td colSpan="7" className="adm-table__empty">No payments match.</td></tr>
              )}
              {payments.map((p) => (
                <tr key={p.id} className={loading ? 'is-stale' : ''}>
                  <td>{p.payment_number}</td>
                  <td>#{p.order_number}</td>
                  <td>{p.customer}</td>
                  <td>{formatDate(p.date)}</td>
                  <td>{formatRand(p.amount)}</td>
                  <td><StatusPill status={p.status} /></td>
                  <td>
                    <button type="button" className="adm-view adm-view--muted" onClick={() => setViewing(p.id)}
                            aria-label={`View payment ${p.payment_number}`}>
                      <FiEye aria-hidden="true" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {result && (
          <Pagination page={result.current_page} lastPage={result.last_page} shown={payments.length}
                      total={result.total} noun="payments" onPage={(p) => setFilter('page', String(p))} />
        )}
      </section>

      {viewing && (
        <PaymentModal paymentId={viewing} onClose={() => setViewing(null)}
                      onViewOrder={(orderId) => { setViewing(null); setViewingOrder(orderId); }} />
      )}
      {viewingOrder && <OrderModal orderId={viewingOrder} onClose={() => setViewingOrder(null)} />}
    </>
  );
}
