import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api";
import "../styles/GroupOrderCheckout.css";

function GroupOrderCheckout() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [groupOrder, setGroupOrder] = useState(null);
  const [pricePerPerson, setPricePerPerson] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGroupOrder = async () => {
      try {
        const { data } = await api.get(`/api/group-orders/${id}`);

        setGroupOrder(data.group_order);
        setPricePerPerson(data.price_per_person);
        setTotalPrice(data.total_price);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Unable to load the group order.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGroupOrder();
  }, [id]);

  if (loading) {
    return (
      <main className="group-order-checkout-page">
        <div className="group-order-checkout-loading">
          <p>Loading your group order...</p>
        </div>
      </main>
    );
  }

  if (error || !groupOrder) {
    return (
      <main className="group-order-checkout-page">
        <div className="group-order-checkout-error">
          <h1>Unable to load group order</h1>

          <p>{error || "The group order could not be found."}</p>

          <button type="button" onClick={() => navigate("/group-orders")}>
            Back to Group Orders
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="group-order-checkout-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/group-orders">Group Orders</Link>
        <span>/</span>
        <span>Checkout</span>
      </nav>

      <section className="group-order-checkout-header">
        <span>GROUP ORDER CHECKOUT</span>

        <h1>Review your group order</h1>

        <p>Check your order details before continuing to payment.</p>
      </section>

      <section className="group-order-checkout-content">
        <div className="group-order-checkout-card">
          <div className="group-order-checkout-card-heading">
            <div>
              <span>ORDER</span>

              <h2>Full Carcass</h2>
            </div>

            <strong>{groupOrder.weight_range} kg</strong>
          </div>

          <div className="group-order-checkout-details">
            <div>
              <span>Group size</span>

              <strong>{groupOrder.number_of_people} people</strong>
            </div>

            <div>
              <span>Price per person</span>

              <strong>
                R
                {Number(pricePerPerson).toLocaleString("en-ZA", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </div>

            <div>
              <span>Ground beef</span>

              <strong>{groupOrder.include_ground_beef ? "Yes" : "No"}</strong>
            </div>

            <div>
              <span>Receiving method</span>

              <strong>
                {groupOrder.delivery_method === "delivery"
                  ? "Delivery"
                  : "Collection"}
              </strong>
            </div>
          </div>
        </div>

        <div className="group-order-checkout-card">
          <div className="group-order-checkout-card-heading">
            <div>
              <span>GROUP MEMBERS</span>

              <h2>Members</h2>
            </div>
          </div>

          <div className="group-order-checkout-members">
            {groupOrder.members.map((member, index) => (
              <div className="group-order-checkout-member" key={member.id}>
                <div>
                  <strong>{member.name || `Person ${index + 1}`}</strong>

                  <span>{member.email}</span>

                  <span>{member.phone}</span>
                </div>

                {groupOrder.delivery_member_id === member.id && (
                  <span className="group-order-checkout-recipient">
                    Delivery recipient
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {groupOrder.delivery_method === "delivery" && (
          <div className="group-order-checkout-card">
            <div className="group-order-checkout-card-heading">
              <div>
                <span>DELIVERY</span>

                <h2>Delivery address</h2>
              </div>
            </div>

            <div className="group-order-checkout-address">
              <p>{groupOrder.address_line_1}</p>

              {groupOrder.address_line_2 && <p>{groupOrder.address_line_2}</p>}

              <p>
                {groupOrder.city}, {groupOrder.province}
              </p>

              <p>{groupOrder.postal_code}</p>

              {groupOrder.delivery_instructions && (
                <div className="group-order-checkout-instructions">
                  <span>Delivery instructions</span>

                  <p>{groupOrder.delivery_instructions}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {groupOrder.delivery_method === "collection" && (
          <div className="group-order-checkout-card">
            <div className="group-order-checkout-card-heading">
              <div>
                <span>COLLECTION</span>

                <h2>Collection</h2>
              </div>
            </div>

            <p className="group-order-checkout-collection">
              You have selected collection for this group order.
            </p>
          </div>
        )}

        <div className="group-order-checkout-summary">
          <div>
            <span>Group order total</span>

            <strong>
              R
              {Number(totalPrice).toLocaleString("en-ZA", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </strong>
          </div>

          <button type="button" className="group-order-checkout-payment">
            Continue to Payment
          </button>
        </div>
      </section>
    </main>
  );
}

export default GroupOrderCheckout;
