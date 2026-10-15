import { useCallback, useEffect, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { FiCheck, FiEye, FiPause, FiPlus, FiRotateCcw, FiTrash2, FiUserPlus, FiUsers } from 'react-icons/fi';
import api from '../api';
import { USER_STATUS_LABELS, USER_TYPE_LABELS, formatDate, formatNumber, initials } from './format';
import StatusPill from './StatusPill';
import UserModal from './UserModal';
import AddUserModal from './AddUserModal';
import { ConfirmModal, FilterSelect, MiniStat, PageHeader, Pagination, SearchBox } from './ui';

const toOptions = (labels) => Object.entries(labels).map(([value, label]) => ({ value, label }));

export default function Users() {
  const { user: me } = useOutletContext();
  const [params, setParams] = useSearchParams();
  const type = params.get('type') ?? '';
  const status = params.get('status') ?? '';
  const search = params.get('search') ?? '';
  const page = Number(params.get('page') ?? 1);

  const [stats, setStats] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [viewing, setViewing] = useState(null);   // user id
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(null); // user object

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
    api.get('/api/admin/users/stats').then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/admin/users', {
        params: { search: search || undefined, type: type || undefined, status: status || undefined, page },
      });
      setResult(data);
    } catch {
      setError('Couldn\'t load users. Check that Laravel is running.');
    } finally {
      setLoading(false);
    }
  }, [search, type, status, page]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadUsers(); }, [loadUsers]);

  const replaceRow = (updated) => {
    setResult((r) => ({ ...r, data: r.data.map((u) => (u.id === updated.id ? updated : u)) }));
  };

  // Suspend or restore straight away (both are easy to undo)
  const toggleSuspend = async (u) => {
    setBusyId(u.id);
    setNotice('');
    try {
      const action = u.status === 'suspended' ? 'restore' : 'suspend';
      const { data } = await api.patch(`/api/admin/users/${u.id}/${action}`);
      replaceRow(data);
      setNotice(action === 'suspend' ? `${u.name} is suspended and can't log in.` : `${u.name} can log in again.`);
      loadStats();
    } catch (err) {
      setNotice(err.response?.data?.message ?? 'That didn\'t work. Try again.');
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    await api.delete(`/api/admin/users/${deleting.id}`);
    setNotice(`${deleting.name} was deleted. Their past orders are kept.`);
    setDeleting(null);
    loadUsers();
    loadStats();
  };

  const handleCreated = (created) => {
    setAdding(false);
    setNotice(`${created.name} was added.`);
    loadUsers();
    loadStats();
  };

  const users = result?.data ?? [];

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Manage user accounts by viewing, adding, suspending and removing accounts"
        action={(
          <button type="button" className="adm-btn adm-btn--big" onClick={() => setAdding(true)}>
            <FiPlus aria-hidden="true" /> Add User
          </button>
        )}
      />

      <section className="adm-minis" aria-label="User figures">
        <MiniStat icon={FiUsers} label="Total users" value={stats && formatNumber(stats.total)} note="Registered users" />
        <MiniStat icon={FiCheck} label="Active" value={stats && formatNumber(stats.active)} note="Can access the platform" />
        <MiniStat icon={FiPause} label="Suspended" value={stats && formatNumber(stats.suspended)} note="Temporarily disabled" />
        <MiniStat icon={FiUserPlus} label="New users" value={stats && formatNumber(stats.new_last_7_days)} note="Joined in the last 7 days" />
      </section>

      <div className="adm-toolbar">
        <SearchBox placeholder="Search users by name or email…" initial={search} onSearch={onSearch} />
        <FilterSelect label="All types" value={type} options={toOptions(USER_TYPE_LABELS)} onChange={(v) => setFilter('type', v)} />
        <FilterSelect label="All statuses" value={status} options={toOptions(USER_STATUS_LABELS)} onChange={(v) => setFilter('status', v)} />
      </div>

      {notice && <p className="adm-notice" role="status">{notice}</p>}
      {error && (
        <div className="adm-alert" role="alert">
          {error} <button type="button" onClick={loadUsers}>Try again</button>
        </div>
      )}

      <section className="adm-card adm-card--flush">
        <div className="adm-table-wrap">
          <table className="adm-table adm-table--wrap">
            <thead>
              <tr>
                <th scope="col">User</th>
                <th scope="col">Email</th>
                <th scope="col">Date Joined</th>
                <th scope="col">Type</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && !result && (
                <tr><td colSpan="6" className="adm-table__empty">Loading users…</td></tr>
              )}
              {result && users.length === 0 && (
                <tr><td colSpan="6" className="adm-table__empty">No users match.</td></tr>
              )}
              {users.map((u) => {
                const isMe = me?.id === u.id;
                const suspended = u.status === 'suspended';
                return (
                  <tr key={u.id} className={loading ? 'is-stale' : ''}>
                    <td>
                      <span className="adm-usercell">
                        <span className="adm-avatar">{initials(u.name)}</span>
                        {u.name}{isMe && <small className="adm-you">You</small>}
                      </span>
                    </td>
                    <td>{u.email}</td>
                    <td>{u.joined ? formatDate(u.joined) : '–'}</td>
                    <td>{USER_TYPE_LABELS[u.type]}</td>
                    <td><StatusPill status={u.status} /></td>
                    <td>
                      <div className="adm-actions">
                        <button type="button" className="adm-view adm-view--muted" onClick={() => setViewing(u.id)}
                                aria-label={`View ${u.name}`}>
                          <FiEye aria-hidden="true" /> View
                        </button>
                        {!isMe && (
                          <>
                            <button type="button" className={`adm-view adm-view--toggle${suspended ? ' adm-view--muted' : ''}`}
                                    onClick={() => toggleSuspend(u)} disabled={busyId === u.id}
                                    aria-label={`${suspended ? 'Restore' : 'Suspend'} ${u.name}`}>
                              {suspended
                                ? <><FiRotateCcw aria-hidden="true" /> Restore</>
                                : <><FiPause aria-hidden="true" /> Suspend</>}
                            </button>
                            <button type="button" className="adm-icon-btn" onClick={() => setDeleting(u)}
                                    aria-label={`Delete ${u.name}`} title="Delete">
                              <FiTrash2 />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {result && (
          <Pagination page={result.current_page} lastPage={result.last_page} shown={users.length}
                      total={result.total} noun="users" onPage={(p) => setFilter('page', String(p))} />
        )}
      </section>

      {viewing && <UserModal userId={viewing} onClose={() => setViewing(null)} />}
      {adding && <AddUserModal onClose={() => setAdding(false)} onCreated={handleCreated} />}
      {deleting && (
        <ConfirmModal
          title="Delete user?"
          message={`${deleting.name}'s account will be permanently deleted and they won't be able to log in. Their past orders are kept, shown as "Deleted customer". If you might want them back, suspend instead.`}
          confirmLabel="Delete user"
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
