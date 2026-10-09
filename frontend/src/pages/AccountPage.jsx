import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiBell,
  FiChevronDown,
  FiClipboard,
  FiHome,
  FiLock,
  FiLogOut,
  FiMapPin,
  FiMenu,
  FiUser,
} from "react-icons/fi";

import AccountSidebar from "../components/account/AccountSidebar";
import AccountDashboard from "../components/account/AccountDashboard";
import AccountOrders from "../components/account/AccountOrders";
import AccountProfile from "../components/account/AccountProfile";
import AccountAddresses from "../components/account/AccountAddresses";
import AccountSecurity from "../components/account/AccountSecurity";
import "../styles/account/Account.css";

function AccountPage({
  user,
  onUserUpdate,
  onLogout,
  initialSection = "dashboard",
  openAddAddress = false,
}) {
  const [activeSection, setActiveSection] = useState(initialSection);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case "orders":
        return <AccountOrders />;

      case "profile":
        return <AccountProfile user={user} onUserUpdate={onUserUpdate} />;

      case "addresses":
        return <AccountAddresses openAddAddress={openAddAddress} />;

      case "security":
        return <AccountSecurity />;

      case "notifications":
        return (
          <section className="account-section">
            <div className="account-section-header">
              <h1>Notifications</h1>
              <p>Manage your account notifications.</p>
            </div>
          </section>
        );

      case "dashboard":
      default:
        return <AccountDashboard onSectionChange={handleSectionChange} />;
    }
  };

  return (
    <div className="account-page">
      {/* Top navbar */}
      <header className="account-top">
        <button
          type="button"
          className="account-top__burger"
          aria-label="Open account menu"
          aria-expanded={sidebarOpen}
          onClick={() => setSidebarOpen((open) => !open)}
        >
          <FiMenu />
        </button>

        <Link to="/" className="account-top__logo"></Link>

        <p className="account-top__title">My Account</p>

        <div className="account-top__right">
          <button
            type="button"
            className="account-top__bell"
            aria-label="Notifications"
            onClick={() => handleSectionChange("notifications")}
          >
            <FiBell />
          </button>

          <div className="account-user">
            <button
              type="button"
              className="account-user__btn"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="account-user__avatar">
                <FiUser />
              </span>

              <span className="account-user__name">{user?.name}</span>

              <FiChevronDown />
            </button>

            {menuOpen && (
              <div className="account-user__menu" role="menu">
                <Link to="/" role="menuitem" onClick={() => setMenuOpen(false)}>
                  View shop
                </Link>

                {onLogout && (
                  <button type="button" role="menuitem" onClick={onLogout}>
                    <FiLogOut />
                    Sign out
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Account body */}
      <div className="account-body">
        <AccountSidebar
          user={user}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          sidebarOpen={sidebarOpen}
        />

        {sidebarOpen && (
          <button
            type="button"
            className="account-scrim"
            aria-label="Close account menu"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="account-main">{renderSection()}</main>
      </div>
    </div>
  );
}

export default AccountPage;
