import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import api from "../api";
import "../styles/GroupOrderCheckout.css";

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const deliveryMethod = location.state?.deliveryMethod || "delivery";

  const deliveryAddress = location.state?.deliveryAddress || {
    addressLine1: "",
    addressLine2: "",
    city: "",
    province: "",
    postalCode: "",
    instructions: "",
  };

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { data } = await api.get("/api/cart");
        setCart(data.cart);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Unable to load your order.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const getItemTotal = (item) =>
    Number(item.product.price) * Number(item.quantity);

  const subtotal = cart
    ? (cart.items || []).reduce(
        (total, item) => total + getItemTotal(item),
        0,
      ) + Number(cart.group_order?.price || 0)
    : 0;

  const getItemCuts = (item) => {
    if (item.cut_type !== "custom" || !item.cut_selections) {
      return [];
    }

    return item.cut_selections
      .map((selection) => selection.cut_option?.name)
      .filter(Boolean);
  };

  const getRemainingMeatLabels = (preferences) => {
    if (!Array.isArray(preferences)) {
      return [];
    }

    const labels = {
      steaks: "Standard steaks where possible",
      stew: "Stew meat",
      mince: "Mince / Ground Beef",
      butcher_choice: "Butcher's Choice",
    };

    return preferences.map((item) => labels[item]).filter(Boolean);
  };

  if (loading) {
    return (
      <main className="group-order-checkout-page">
        <div className="group-order-checkout-loading">
          <p>Loading your order...</p>
        </div>
      </main>
    );
  }

  if (error || !cart) {
    return (
      <main className="group-order-checkout-page">
        <div className="group-order-checkout-error">
          <h1>Unable to load your order</h1>
          <p>{error || "Your cart could not be found."}</p>

          <button type="button" onClick={() => navigate("/cart")}>
            Return to Cart
          </button>
        </div>
      </main>
    );
  }

  const items = cart.items || [];

  if (items.length === 0 && !cart.group_order) {
    return (
      <main className="group-order-checkout-page">
        <div className="group-order-checkout-error">
          <h1>Your cart is empty</h1>
          <p>Add products to your cart before checking out.</p>

          <Link to="/products">Browse Products</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="group-order-checkout-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/cart">Cart</Link>
        <span>/</span>
        <span>Checkout</span>
      </nav>

      <section className="group-order-checkout-header">
        <span>CHECKOUT</span>
        <h1>Review your order</h1>
        <p>Check your order details before continuing to payment.</p>
      </section>

      <section className="group-order-checkout-content">
        <div className="group-order-checkout-card">
          <div className="group-order-checkout-card-heading">
            <div>
              <span>ORDER DETAILS</span>
              <h2>Your Products</h2>
            </div>

            <strong>
              {items.length + (cart.group_order ? 1 : 0)}{" "}
              {items.length + (cart.group_order ? 1 : 0) === 1
                ? "item"
                : "items"}
            </strong>
          </div>

          {items.map((item) => {
            const cuts = getItemCuts(item);
            const remainingMeat = getRemainingMeatLabels(
              item.remaining_meat_preferences,
            );

            return (
              <article className="group-order-checkout-member" key={item.id}>
                <div>
                  <strong>{item.product.name}</strong>

                  <span>Grade {item.product.grade}</span>

                  <span>Quantity: {item.quantity}</span>

                  <span>
                    Preparation:{" "}
                    {item.cut_type === "custom" ? "Custom Cuts" : "Traditional"}
                  </span>

                  {item.selected_quarter && (
                    <span>
                      Quarter:{" "}
                      {item.selected_quarter === "front"
                        ? "Front Quarter"
                        : "Hind Quarter"}
                    </span>
                  )}

                  {cuts.length > 0 && (
                    <div className="group-order-checkout-address">
                      <strong>Selected cuts</strong>
                      <ul>
                        {cuts.map((cut, index) => (
                          <li key={`${cut}-${index}`}>{cut}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {remainingMeat.length > 0 && (
                    <div className="group-order-checkout-address">
                      <strong>Remaining meat preferences</strong>
                      <ul>
                        {remainingMeat.map((preference) => (
                          <li key={preference}>{preference}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.special_instructions && (
                    <div className="group-order-checkout-instructions">
                      <span>Special instructions</span>
                      <p>{item.special_instructions}</p>
                    </div>
                  )}
                </div>

                <strong>R{formatPrice(getItemTotal(item))}</strong>
              </article>
            );
          })}

          {cart.group_order && (
            <article className="group-order-checkout-member">
              <div>
                <strong>Group Order — Full Carcass</strong>
                <span>Weight: {cart.group_order.weight_range} kg</span>
                <span>
                  Group size: {cart.group_order.number_of_people} people
                </span>
              </div>

              <strong>R{formatPrice(cart.group_order.price)}</strong>
            </article>
          )}
        </div>

        <div className="group-order-checkout-card">
          <div className="group-order-checkout-card-heading">
            <div>
              <span>RECEIVING METHOD</span>
              <h2>
                {deliveryMethod === "delivery" ? "Delivery" : "Collection"}
              </h2>
            </div>
          </div>

          {deliveryMethod === "delivery" ? (
            <>
              {deliveryAddress.addressLine1 ? (
                <div className="group-order-checkout-address">
                  <p>{deliveryAddress.addressLine1}</p>

                  {deliveryAddress.addressLine2 && (
                    <p>{deliveryAddress.addressLine2}</p>
                  )}

                  <p>
                    {deliveryAddress.city}
                    {deliveryAddress.province
                      ? `, ${deliveryAddress.province}`
                      : ""}
                  </p>

                  <p>{deliveryAddress.postalCode}</p>

                  {deliveryAddress.instructions && (
                    <div className="group-order-checkout-instructions">
                      <span>Delivery instructions</span>
                      <p>{deliveryAddress.instructions}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p>
                  No delivery address was provided. Return to your cart and
                  select or enter your delivery address.
                </p>
              )}
            </>
          ) : (
            <p className="group-order-checkout-collection">
              You have selected collection for your order.
            </p>
          )}
        </div>

        <div className="group-order-checkout-summary">
          <div>
            <span>Order total</span>
            <strong>R{formatPrice(subtotal)}</strong>
          </div>

          <button
            type="button"
            className="group-order-checkout-payment"
            onClick={() =>
              setError(
                "Payment has not been connected yet. Your order has not been submitted.",
              )
            }
          >
            Continue to Payment
          </button>

          {error && (
            <p role="alert" className="group-order-checkout-error">
              {error}
            </p>
          )}

          <button
            type="button"
            className="group-order-checkout-return"
            onClick={() => navigate("/cart")}
          >
            Return to Cart
          </button>
        </div>
      </section>
    </main>
  );
}

export default Checkout;
