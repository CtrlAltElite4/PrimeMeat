import { FaSearch, FaUserCircle, FaShoppingCart, FaRegQuestionCircle } from 'react-icons/fa';

export default function Header({ user, onLogout }) {
  return (
    <header className="site-header">
      <a href="/" className="site-header__logo">[Logo]</a>

      <nav className="site-header__nav" aria-label="Main">
        <a href="/shop">Shop</a>
        <a href="/cutsheet-builder">Cutsheet Builder</a>
        <a href="/about">About</a>
        <a href="/faq" className="site-header__faq">
          <FaRegQuestionCircle aria-hidden="true" /> FAQ
        </a>
      </nav>

      <div className="site-header__actions">
        <button type="button" className="pill pill--outline">
          <FaSearch aria-hidden="true" /> <span>Search</span>
        </button>

        {user ? (
          <button type="button" className="pill pill--outline" onClick={onLogout}>
            <FaUserCircle aria-hidden="true" /> <span>Sign out</span>
          </button>
        ) : (
          <a href="/account" className="pill pill--outline">
            <FaUserCircle aria-hidden="true" /> <span>Account</span>
          </a>
        )}

        <a href="/cart" className="pill pill--solid">
          <FaShoppingCart aria-hidden="true" /> <span>Cart</span>
        </a>
      </div>
    </header>
  );
}
