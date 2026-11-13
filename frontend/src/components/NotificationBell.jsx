
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import api from "../api";
import "../styles/Navbar.css";

function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const bellRef = useRef(null);

  // Retrieve notifications from Laravel
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/api/notifications");

      setNotifications(data.notifications || []);
      setError("");
    } catch (err) {
      console.error("Failed to retrieve notifications:", err);
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch notifications when a customer logs in.
  // Refresh every 30 seconds.
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [user?.id, fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Open or close notification dropdown
  const toggleNotifications = () => {
    const nextState = !isOpen;

    setIsOpen(nextState);

    if (nextState) {
      fetchNotifications();
    }
  };

  // Delete an individual notification
  const removeNotification = async (id) => {
    try {
      setDeletingId(id);

      await api.delete(`/api/notifications/${id}`);

      setNotifications((previous) =>
        previous.filter((notification) => notification.id !== id)
      );
    } catch (err) {
      console.error("Failed to remove notification:", err);
      setError("Unable to remove notification.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    return new Date(timestamp).toLocaleString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) return null;

  return (
    <div className="notification-wrapper" ref={bellRef}>
      <button
        type="button"
        className="navbar-action notification-bell"
        aria-label="Notifications"
        aria-expanded={isOpen}
        onClick={toggleNotifications}
      >
        <Bell className="navbar-action-icon" />

        {notifications.length > 0 && (
          <span className="notification-dot"></span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          {loading && notifications.length === 0 ? (
            <p className="notification-message">Loading notifications...</p>
          ) : error && notifications.length === 0 ? (
            <p className="notification-message">{error}</p>
          ) : notifications.length === 0 ? (
            <p className="notification-message">
              You don't have any notifications yet.
            </p>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => (
                <div
                  className="notification-item"
                  key={notification.id}
                >
                  <div className="notification-content">
                    <h4>{notification.subject}</h4>

                    {notification.lines?.map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}

                    <span className="notification-timestamp">
                      {formatTimestamp(notification.created_at)}
                    </span>

                    {notification.buttonText && notification.path && (
                      <NavLink
                        to={notification.path}
                        className="notification-action"
                        onClick={() => setIsOpen(false)}
                      >
                        {notification.buttonText}
                      </NavLink>
                    )}
                  </div>

                  <button
                    type="button"
                    className="notification-remove"
                    aria-label="Remove notification"
                    disabled={deletingId === notification.id}
                    onClick={() => removeNotification(notification.id)}
                  >
                    <X size={17} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
