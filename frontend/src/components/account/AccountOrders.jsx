import { useCallback, useEffect, useState } from "react";

import api from "../../api";

function AccountOrders({ initialOrderId }) {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchOrderId, setSearchOrderId] = useState("");
  const ordersPerPage = 12;
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const filteredOrders = orders.filter((order) =>
    order.order_number
      ?.toLowerCase()
      .includes(searchOrderId.trim().toLowerCase()),
  );
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage,
  );
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
  const viewOrder = useCallback(async (orderId) => {
    try {
      setDetailsLoading(true);
      setError("");

      const { data } = await api.get(`/api/orders/${orderId}`);

      setSelectedOrder(data.order);
    } catch (error) {
      console.error("Failed to load order:", error);

      setError(error.response?.data?.message || "Unable to load the order.");
    } finally {
      setDetailsLoading(false);
    }
  }, []);
  useEffect(() => {
    if (initialOrderId) {
      viewOrder(initialOrderId);
    }
  }, [initialOrderId, viewOrder]);
  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

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

  const getTrackingSteps = (order) => {
    if (order.status === "cancelled") {
      return [
        {
          status: "pending",
          label: "Order Paid",
        },
        {
          status: "cancelled",
          label: "Cancelled",
        },
      ];
    }

    if (order.fulfillment_type === "collection") {
      return [
        {
          status: "pending",
          label: "Order Paid",
        },
        {
          status: "processing",
          label: "Processing",
        },
        {
          status: "ready_for_collection",
          label: "Ready for Collection",
        },
        {
          status: "collected",
          label: "Collected",
        },
      ];
    }

    return [
      {
        status: "pending",
        label: "Order Paid",
      },
      {
        status: "processing",
        label: "Processing",
      },
      {
        status: "out_for_delivery",
        label: "Out for Delivery",
      },
      {
        status: "delivered",
        label: "Delivered",
      },
    ];
  };

  const getStepIndex = (order) => {
    const steps = getTrackingSteps(order);

    if (order.status === "cancelled") {
      return 1;
    }

    const index = steps.findIndex((step) => step.status === order.status);

    return index >= 0 ? index : 0;
  };
  if (loading) {
    return (
      <section className="account-section">
        <h1>Orders</h1>
        <p>Loading your orders...</p>
      </section>
    );
  }

  if (selectedOrder) {
    const steps = getTrackingSteps(selectedOrder);
    const currentStep = getStepIndex(selectedOrder);

    return (
      <section className="account-section">
        <button type="button" onClick={closeOrderDetails}>
          Back to Orders
        </button>

        <div className="account-section-header">
          <h1>Order {selectedOrder.order_number}</h1>

          <p>Placed on {formatDate(selectedOrder.created_at)}</p>
        </div>

        <div className="account-order-tracking">
          <h2>Track Your Order</h2>

          <div className="account-tracking-steps">
            {steps.map((step, index) => (
              <div
                key={step.status}
                className={
                  step.status === "cancelled"
                    ? "account-tracking-step account-tracking-step--cancelled"
                    : index <= currentStep
                      ? "account-tracking-step account-tracking-step--active"
                      : "account-tracking-step"
                }
              >
                <div className="account-tracking-step-marker">
                  {step.status === "cancelled" ? "×" : index + 1}
                </div>

                <span>{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="account-order-information">
          <h2>Order Information</h2>

          <p>
            <strong>Status:</strong>{" "}
            <span
              className={`account-status account-status--${selectedOrder.status}`}
            >
              {formatStatus(selectedOrder.status)}
            </span>
          </p>

          <p>
            <strong>Fulfillment:</strong>{" "}
            {selectedOrder.fulfillment_type === "collection"
              ? "Collection"
              : "Delivery"}
          </p>

          <p>
            <strong>Total:</strong> {formatAmount(selectedOrder.total)}
          </p>
        </div>

        <div className="account-order-items">
          <h2>Items</h2>

          {selectedOrder.items?.length ? (
            <div>
              {selectedOrder.items.map((item) => (
                <div key={item.id}>
                  <p>
                    <strong>{item.product_name}</strong>
                  </p>

                  <p>Grade: {item.grade || "-"}</p>

                  <p>Quantity: {item.quantity}</p>

                  <p>Price: {formatAmount(item.price)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No items found.</p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="account-section">
      <div className="account-section-header">
        <h1>Orders</h1>
        <p>View and track your orders.</p>
      </div>

      <div className="account-orders-search">
        <input
          type="text"
          value={searchOrderId}
          onChange={(event) => {
            setSearchOrderId(event.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search by order ID..."
          aria-label="Search orders by order ID"
        />
      </div>

      {error && <p>{error}</p>}

      {orders.length === 0 ? (
        <div className="account-empty-state">
          <p>You have not placed any orders yet.</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="account-empty-state">
          <p>No orders found matching "{searchOrderId}".</p>
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
              {paginatedOrders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.order_number}</td>

                  <td>{formatDate(order.created_at)}</td>

                  <td>{formatAmount(order.total)}</td>

                  <td>
                    <span
                      className={`account-status account-status--${order.status}`}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      onClick={() => viewOrder(order.id)}
                      disabled={detailsLoading}
                    >
                      {detailsLoading ? "Loading..." : "View Details"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="account-pagination">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => page - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                &lt;
              </button>

              <span>
                {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((page) => page + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default AccountOrders;
