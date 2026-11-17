import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiClock, FiEdit2, FiEdit3, FiMessageCircle, FiPlus, FiPlusCircle, FiTrash2 } from 'react-icons/fi';
import api from '../api';
import { formatDate, formatNumber } from './format';
import FaqFormModal from './FaqFormModal';
import { ConfirmModal, MiniStat, PageHeader, Pagination, SearchBox } from './ui';

/** Admin > Chatbot content: the FAQs the Butcher chatbot answers from. */
export default function ChatbotContent() {
  const [params, setParams] = useSearchParams();
  const search = params.get('search') ?? '';
  const page = Number(params.get('page') ?? 1);

  const [stats, setStats] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState(null);   // faq object, or {} for a new one
  const [deleting, setDeleting] = useState(null); // faq object

  const setFilter = useCallback((key, value) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value); else next.delete(key);
      if (key !== 'page') next.delete('page');
      return next;
    });
  }, [setParams]);

  const onSearch = useCallback((value) => setFilter('search', value), [setFilter]);

  const loadStats = useCallback(() => {
    api.get('/api/admin/faqs/stats').then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  const loadFaqs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/admin/faqs', { params: { search: search || undefined, page } });
      setResult(data);
    } catch {
      setError('Couldn\'t load the chatbot FAQs. Check that Laravel is running.');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadFaqs(); }, [loadFaqs]);

  const handleSaved = (faq, wasEdit) => {
    setEditing(null);
    setNotice(wasEdit ? 'FAQ updated. The chatbot will use the new answer straight away.' : 'FAQ added. The chatbot can now answer it.');
    loadFaqs();
    loadStats();
  };

  const confirmDelete = async () => {
    await api.delete(`/api/admin/faqs/${deleting.id}`);
    setNotice('FAQ deleted. The chatbot will no longer use it.');
    setDeleting(null);
    loadFaqs();
    loadStats();
  };

  const faqs = result?.data ?? [];

  return (
    <>
      <PageHeader
        title="Chatbot content"
        subtitle="Manage the questions and answers the Butcher chatbot uses to help customers"
        action={(
          <button type="button" className="adm-btn adm-btn--big" onClick={() => { setNotice(''); setEditing({}); }}>
            <FiPlus aria-hidden="true" /> Add FAQ
          </button>
        )}
      />

      <section className="adm-minis" aria-label="Chatbot figures">
        <MiniStat icon={FiMessageCircle} label="Total FAQs" value={stats && formatNumber(stats.total)} note="Used by the chatbot" />
        <MiniStat icon={FiPlusCircle} label="Added" value={stats && formatNumber(stats.added_last_7_days)} note="In the last 7 days" />
        <MiniStat icon={FiEdit3} label="Updated" value={stats && formatNumber(stats.updated_last_7_days)} note="In the last 7 days" />
        <MiniStat icon={FiClock} label="Last change" value={stats && (stats.last_change ? formatDate(stats.last_change) : '–')} />
      </section>

      <div className="adm-toolbar">
        <SearchBox placeholder="Search questions and answers…" initial={search} onSearch={onSearch} />
      </div>

      {notice && <p className="adm-notice" role="status">{notice}</p>}
      {error && (
        <div className="adm-alert" role="alert">
          {error} <button type="button" onClick={loadFaqs}>Try again</button>
        </div>
      )}

      <section className="adm-card adm-card--flush">
        <div className="adm-table-wrap">
          <table className="adm-table adm-table--wrap adm-faqs">
            <thead>
              <tr>
                <th scope="col">Question</th>
                <th scope="col">Answer</th>
                <th scope="col">Last Updated</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && !result && (
                <tr><td colSpan="4" className="adm-table__empty">Loading FAQs…</td></tr>
              )}
              {result && faqs.length === 0 && (
                <tr>
                  <td colSpan="4" className="adm-table__empty">
                    {search ? 'No FAQs match.' : 'No FAQs yet. Add one so the chatbot has something to answer from.'}
                  </td>
                </tr>
              )}
              {faqs.map((f) => (
                <tr key={f.id} className={loading ? 'is-stale' : ''}>
                  <td className="adm-faqs__q">{f.question}</td>
                  <td><span className="adm-faqs__a">{f.answer}</span></td>
                  <td>{f.updated ? formatDate(f.updated) : '–'}</td>
                  <td>
                    <div className="adm-actions">
                      <button type="button" className="adm-view" onClick={() => { setNotice(''); setEditing(f); }}
                              aria-label={`Edit FAQ: ${f.question}`}>
                        <FiEdit2 aria-hidden="true" /> Edit
                      </button>
                      <button type="button" className="adm-icon-btn" onClick={() => setDeleting(f)}
                              aria-label={`Delete FAQ: ${f.question}`} title="Delete">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {result && (
          <Pagination page={result.current_page} lastPage={result.last_page} shown={faqs.length}
                      total={result.total} noun="FAQs" onPage={(p) => setFilter('page', String(p))} />
        )}
      </section>

      {editing && (
        <FaqFormModal faq={editing.id ? editing : null} onClose={() => setEditing(null)} onSaved={handleSaved} />
      )}
      {deleting && (
        <ConfirmModal
          title="Delete FAQ?"
          message={`"${deleting.question}" will be removed and the chatbot will stop using it. This can't be undone.`}
          confirmLabel="Delete FAQ"
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
