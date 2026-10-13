import {
  Bell,
  ClipboardList,
  Lock,
  MapPin,
  User,
  UserRound,
} from "lucide-react";

function AccountSidebar({ user, activeSection, onSectionChange, sidebarOpen }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: UserRound },
    { id: "orders", label: "Orders", icon: ClipboardList },
    { id: "profile", label: "Profile", icon: User },
    { id: "addresses", label: "Saved Addresses", icon: MapPin },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <aside
      className={
        sidebarOpen
          ? "account-sidebar account-sidebar--open"
          : "account-sidebar"
      }
    >
      <div className="account-sidebar-user">
        <h2>{user?.name}</h2>
        <p>{user?.email}</p>
      </div>

      <nav className="account-sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              className={
                activeSection === item.id
                  ? "account-sidebar-link account-sidebar-link--active"
                  : "account-sidebar-link"
              }
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="account-sidebar-icon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default AccountSidebar;
