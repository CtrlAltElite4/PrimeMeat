import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Search, User, ShoppingCart, Menu, X } from "lucide-react";
import SearchBar from "./SearchBar";
import "../styles/Navbar.css";

function Navbar({ user, onLogout, cartCount }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-background" aria-hidden="true"></div>

        <div className="navbar-left">
          <ul className="navbar-links">
            <li className="navbar-link-item">
              <NavLink className="navbar-link" to="/" end>
                Home
              </NavLink>
            </li>

            <li className="navbar-link-item">
              <NavLink className="navbar-link" to="/products">
                Shop
              </NavLink>
            </li>

            <li className="navbar-link-item">
              <NavLink className="navbar-link" to="/about">
                About
              </NavLink>
            </li>

            <li className="navbar-link-item">
              <NavLink className="navbar-link" to="/contact">
                Contact
              </NavLink>
            </li>
          </ul>
        </div>

        <div className="navbar-brand">
          <NavLink className="navbar-logo-link" to="/">
            <div className="navbar-logo-container">
              <img
                className="navbar-logo"
                src="/images/logo.png"
                alt="PrimeMeat Logo"
              />
            </div>
          </NavLink>
        </div>

        <div className="navbar-right">
          <div className="navbar-actions">
            <button
              className="navbar-action navbar-search"
              type="button"
              aria-label="Search"
              onClick={toggleSearch}
            >
              <Search className="navbar-action-icon" />
              <span className="navbar-action-label">Search</span>
            </button>
            {user ? (
              <NavLink
                className="navbar-action navbar-account"
                to="/account"
                aria-label="Account"
              >
                <User className="navbar-action-icon" />
                <span className="navbar-action-label">Account</span>
              </NavLink>
            ) : (
              <NavLink to="/login" className="navbar-action navbar-login">
                Login
              </NavLink>
            )}

            <NavLink
              className="navbar-action navbar-cart"
              to="/cart"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="navbar-action-icon" />
              <span className="navbar-action-label">Cart</span>
              {cartCount > 0 && (
                <span className="navbar-cart-count">{cartCount}</span>
              )}
            </NavLink>
            {user && (
              <div className="navbar-user">
                <span className="navbar-user-name">{user.name}</span>

                <button
                  type="button"
                  className="navbar-logout"
                  onClick={onLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          className="navbar-mobile-menu-button"
          type="button"
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <X className="navbar-menu-icon" />
          ) : (
            <Menu className="navbar-menu-icon" />
          )}
        </button>
      </div>

      {searchOpen && <SearchBar />}

      {menuOpen && (
        <div className="navbar-mobile-panel">
          {user && (
            <div className="navbar-user">
              <span className="navbar-user-name">{user.name}</span>

              <button
                type="button"
                className="navbar-logout"
                onClick={onLogout}
              >
                Logout
              </button>
            </div>
          )}

          <div className="navbar-mobile-links">
            <NavLink
              className="navbar-mobile-link"
              to="/"
              end
              onClick={() => setMenuOpen(false)}
            >
              Home
            </NavLink>

            <NavLink
              className="navbar-mobile-link"
              to="/products"
              onClick={() => setMenuOpen(false)}
            >
              Shop
            </NavLink>

            <NavLink
              className="navbar-mobile-link"
              to="/about"
              onClick={() => setMenuOpen(false)}
            >
              About
            </NavLink>

            <NavLink
              className="navbar-mobile-link"
              to="/contact"
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </NavLink>
          </div>

          <div className="navbar-mobile-actions">
            <button
              className="navbar-mobile-action"
              type="button"
              onClick={toggleSearch}
            >
              <Search />
              <span>Search</span>
            </button>

            <NavLink
              className="navbar-mobile-action"
              to={user ? "/account" : "/login"}
              aria-label="Account"
              onClick={() => setMenuOpen(false)}
            >
              <User />
              <span>Account</span>
            </NavLink>

            <NavLink
              className="navbar-mobile-action"
              to="/cart"
              onClick={() => setMenuOpen(false)}
            >
              <ShoppingCart />
              <span>Cart</span>

              {cartCount > 0 && (
                <span className="navbar-cart-count">{cartCount}</span>
              )}
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
