import { useEffect, useState } from "react";
import { ClipboardList, Clock, CheckCircle } from "lucide-react";
import api from "../../api";

function AccountDashboard({ onSectionChange }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setError("");

        const { data } = await api.get("/api/orders");

        setOrders(data.orders || []);
      } catch (error) {
        console.error("Failed to load orders:", error);

        setError(
          error.response?.data?.message || "Unable to load your orders.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === "pending",
  ).length;

  const completedOrders = orders.filter((order) =>
    ["collected", "delivered"].includes(order.status),
  ).length;

  const recentOrders = orders.slice(0, 5);

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount) => {
    return `R${Number(amount || 0).toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatStatus = (status) => {
    if (!status) {
      return "-";
    }

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  if (loading) {
    return (
      <section className="account-section">
        <h1>Dashboard</h1>
        <p>Loading your orders...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="account-section">
        <h1>Dashboard</h1>
        <p>{error}</p>
      </section>
    );
  }

  return (
    <section className="account-section">
      <div className="account-section-header">
        <h1>Dashboard</h1>
        <p>View your recent orders and account activity.</p>
      </div>

      <div className="account-statistics">
        <div className="account-stat-card">
          <div className="account-icon">
            <ClipboardList />
          </div>

          <span>Total Orders</span>
          <strong>{totalOrders}</strong>
        </div>

        <div className="account-stat-card">
          <div className="account-icon">
            <Clock />
          </div>

          <span>Pending Orders</span>
          <strong>{pendingOrders}</strong>
        </div>

        <div className="account-stat-card">
          <div className="account-icon">
            <CheckCircle />
          </div>

          <span>Delivered/Collected</span>
          <strong>{completedOrders}</strong>
        </div>
      </div>
      <div className="account-orders">
        <div className="account-orders-header">
          <h2>Recent Orders</h2>

          {orders.length > 5 && (
            <button type="button" onClick={() => onSectionChange("orders")}>
              View All
            </button>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="account-empty-state">
            <p>You have not placed any orders yet.</p>
          </div>
        ) : (
          <div className="account-orders-table-wrapper">
            <table className="account-orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.order_number}</td>

                    <td>{formatDate(order.created_at)}</td>

                    <td>{formatAmount(order.total_amount)}</td>

                    <td>{formatStatus(order.status)}</td>

                    <td>
                      <button
                        type="button"
                        onClick={() => onSectionChange("orders")}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default AccountDashboard;
