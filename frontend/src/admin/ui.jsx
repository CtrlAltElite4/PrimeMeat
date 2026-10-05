// Small building blocks shared by the admin pages
import { useEffect, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiSearch, FiX } from 'react-icons/fi';

/** Page title + subtitle, with optional button on the right */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="adm-pagehead">
      <div>
        <h1 className="adm-heading">{title}</h1>
        <p className="adm-subheading">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

/** Compact stat card used on the Orders, Payments, Products and Users pages */
export function MiniStat({ icon: Icon, label, value, note }) {
  return (
    <article className="adm-mini">
      <span className="adm-mini__icon"><Icon aria-hidden="true" /></span>
      <div>
        <h2 className="adm-mini__label">{label}</h2>
        <p className="adm-mini__value">{value ?? '–'}</p>
        {note && <p className="adm-mini__note">{note}</p>}
      </div>
    </article>
  );
}

/**
 * Search box that waits until the user stops typing before calling onSearch.
 * It only reports a search when the typed text actually changes. (Before, it re-sent
 * the same search whenever the page re-rendered, which reset the pagination to page 1.)
 */
export function SearchBox({ placeholder, onSearch, initial = '' }) {
  const [value, setValue] = useState(initial);
  const lastSent = useRef(initial.trim());
  const callback = useRef(onSearch);

  useEffect(() => { callback.current = onSearch; }, [onSearch]);

  useEffect(() => {
    const text = value.trim();
    if (text === lastSent.current) return undefined;
    const timer = setTimeout(() => {
      lastSent.current = text;
      callback.current(text);
    }, 350);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <label className="adm-search">
      <FiSearch aria-hidden="true" />
      <input type="search" value={value} placeholder={placeholder} aria-label={placeholder}
             onChange={(e) => setValue(e.target.value)} />
    </label>
  );
}

/** Dropdown filter; options = [{ value, label }] */
export function FilterSelect({ label, value, options, onChange }) {
  return (
    <select className="adm-select" value={value} aria-label={label} onChange={(e) => onChange(e.target.value)}>
      <option value="">{label}</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

/** "Showing 10 of 268 orders" + page buttons (1 2 3 … 12) */
export function Pagination({ page, lastPage, shown, total, noun, onPage }) {
  const pages = [];
  for (let p = 1; p <= lastPage; p += 1) {
    if (p === 1 || p === lastPage || Math.abs(p - page) <= 1) pages.push(p);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }

  return (
    <div className="adm-pager">
      <p>Showing {shown} of {total} {noun}</p>
      {lastPage > 1 && (
        <nav aria-label="Pages">
          <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page">
            <FiChevronLeft />
          </button>
          {pages.map((p, i) => (p === '…'
            ? <span key={`gap-${i}`}>…</span>
            : (
              <button key={p} type="button" onClick={() => onPage(p)}
                      className={p === page ? 'is-current' : ''} aria-current={p === page ? 'page' : undefined}>
                {p}
              </button>
            )))}
          <button type="button" onClick={() => onPage(page + 1)} disabled={page >= lastPage} aria-label="Next page">
            <FiChevronRight />
          </button>
        </nav>
      )}
    </div>
  );
}

/** Popup dialog: closes on Escape, the X button, or clicking outside */
export function Modal({ title, onClose, children, width = 560 }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="adm-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="adm-modal__box" style={{ maxWidth: width }} role="dialog" aria-modal="true" aria-label={title}>
        <header className="adm-modal__head">
          <h2>{title}</h2>
          <button type="button" ref={closeRef} className="adm-modal__close" onClick={onClose} aria-label="Close">
            <FiX />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

/** "Are you sure?" dialog for destructive actions */
export function ConfirmModal({ title, message, confirmLabel, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const confirm = async () => {
    setBusy(true);
    setError('');
    try {
      await onConfirm();
    } catch (err) {
      setError(err.response?.data?.message ?? 'That didn\'t work. Try again.');
      setBusy(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose} width={420}>
      <div className="adm-form">
        <p className="adm-form__text">{message}</p>
        {error && <p className="adm-alert" role="alert">{error}</p>}
        <div className="adm-form__actions">
          <button type="button" className="adm-btn adm-btn--outline" onClick={onClose}>Cancel</button>
          <button type="button" className="adm-btn" onClick={confirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
