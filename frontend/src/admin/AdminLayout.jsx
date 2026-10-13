import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  FiBell, FiBox, FiChevronDown, FiCreditCard, FiHome, FiLogOut, FiMenu,
  FiMessageCircle, FiSettings, FiShoppingCart, FiUser, FiUsers, FiHelpCircle
} from 'react-icons/fi';
import api from '../api';
import './admin.css';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: FiHome, end: true },
  { to: '/admin/products', label: 'Products', icon: FiBox },
  { to: '/admin/orders', label: 'Orders', icon: FiShoppingCart },
  { to: '/admin/payments', label: 'Payments log', icon: FiCreditCard },
  { to: '/admin/users', label: 'Users', icon: FiUsers },
  { to:  '/admin/helpfaqs', label: 'Help Center', icon: FiHelpCircle},
  { to: '/admin/chatbot', label: 'Chatbot content', icon: FiMessageCircle },
  { to: '/admin/settings', label: 'Settings', icon: FiSettings },
  
];

export default function AdminLayout({ user: initialUser, onLogout, onUserUpdate }) {
  // Local copy so the name in the top bar updates right after editing your profile in Settings
  const [user, setUser] = useState(initialUser);
  useEffect(() => { setUser(initialUser); }, [initialUser]);
  const updateUser = useCallback((u) => { setUser(u); onUserUpdate?.(u); }, [onUserUpdate]);

  const [navOpen, setNavOpen] = useState(false);   // sidebar on small screens
  const [menuOpen, setMenuOpen] = useState(false); // account dropdown
  const [pending, setPending] = useState(0);       // pending orders for the bell
  const menuRef = useRef(null);

  useEffect(() => {
    api.get('/api/admin/orders/pending-count')
      .then(({ data }) => setPending(data.count))
      .catch(() => setPending(0));
  }, []);

  // Close the account menu when clicking anywhere else
  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  return (
    <div className="adm">
      <header className="adm-top">
        <button type="button" className="adm-top__burger" aria-label="Open menu"
                aria-expanded={navOpen} onClick={() => setNavOpen((o) => !o)}>
          <FiMenu />
        </button>
        <Link to="/" className="adm-top__logo">[Logo]</Link>
        <p className="adm-top__title">Admin Panel</p>

        <div className="adm-top__right">
          <Link to="/admin/orders?status=pending" className="adm-top__bell"
                aria-label={pending ? `${pending} pending orders` : 'No pending orders'}
                title={pending ? `${pending} pending orders` : 'No pending orders'}>
            <FiBell />
            {pending > 0 && <span className="adm-top__dot" />}
          </Link>

          <div className="adm-account" ref={menuRef}>
            <button type="button" className="adm-account__btn" aria-haspopup="menu"
                    aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}>
              <span className="adm-account__avatar"><FiUser aria-hidden="true" /></span>
              <span className="adm-account__name">{user.name}</span>
              <FiChevronDown aria-hidden="true" />
            </button>
            {menuOpen && (
              <div className="adm-account__menu" role="menu">
                <Link to="/" role="menuitem">View shop</Link>
                <button type="button" role="menuitem" onClick={onLogout}>
                  <FiLogOut aria-hidden="true" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="adm-body">
        <aside className={`adm-side${navOpen ? ' adm-side--open' : ''}`}>
          <p className="adm-side__title">Admin</p>
          <nav aria-label="Admin">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} onClick={() => setNavOpen(false)}
                       className={({ isActive }) => `adm-side__link${isActive ? ' adm-side__link--active' : ''}`}>
                <Icon aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        {navOpen && <div className="adm-scrim" onClick={() => setNavOpen(false)} />}

        <main className="adm-main">
          <Outlet context={{ user, updateUser }} />
        </main>
      </div>
    </div>
  );
}
