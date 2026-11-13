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
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

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
    `R${Number(price || 0).toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Resolve the selected carcass variant returned by the cart API.
  const getItemVariant = (item) =>
    item.product_variant || item.productVariant || null;

  // Use the selected variant price for carcasses and product price otherwise.
  const getItemUnitPrice = (item) => {
    const variant = getItemVariant(item);

    return Number(variant?.price ?? item.price ?? item.product?.price ?? 0);
  };

  const getItemTotal = (item) => getItemUnitPrice(item) * Number(item.quantity);

  const getItemGrade = (item) => {
    const variant = getItemVariant(item);

    return variant?.grade ?? item.grade ?? item.product?.grade ?? null;
  };

  const getItemWeight = (item) => {
    const variant = getItemVariant(item);

    if (variant?.weight_min_kg == null || variant?.weight_max_kg == null) {
      return null;
    }

    return `${variant.weight_min_kg}–${variant.weight_max_kg} kg`;
  };

  // Use the backend's stock and availability checks before enabling payment.
  const getAvailableStock = (item) => {
    if (item.available_stock == null) {
      return null;
    }

    return Math.max(0, Number(item.available_stock));
  };

  const isItemUnavailable = (item) => {
    const availableStock = getAvailableStock(item);

    return (
      item.is_available === false ||
      (availableStock !== null && availableStock < Number(item.quantity))
    );
  };

  const items = cart?.items || [];

  const subtotal = cart
    ? items.reduce((total, item) => total + getItemTotal(item), 0) +
      Number(cart.group_order?.price || 0)
    : 0;

  const hasUnavailableItems = items.some(isItemUnavailable);

  const hasDeliveryAddress = Boolean(
    deliveryAddress.addressLine1?.trim() &&
    deliveryAddress.city?.trim() &&
    deliveryAddress.province?.trim() &&
    deliveryAddress.postalCode?.trim(),
  );

  const canPay =
    !paying &&
    !hasUnavailableItems &&
    (deliveryMethod !== "delivery" || hasDeliveryAddress);

  // Laravel calculates and signs the payment amount from database records.
  const startPayment = async () => {
    if (hasUnavailableItems) {
      setPayError(
        "Some products are unavailable or have insufficient stock. Return to your cart to resolve this.",
      );
      return;
    }

    if (deliveryMethod === "delivery" && !hasDeliveryAddress) {
      setPayError(
        "Please return to your cart and select a complete delivery address.",
      );
      return;
    }

    setPaying(true);
    setPayError("");

    try {
      const { data } = await api.post("/api/checkout/payfast", {
        fulfillment_type: deliveryMethod,
        address_line_1: deliveryAddress.addressLine1,
        address_line_2: deliveryAddress.addressLine2,
        city: deliveryAddress.city,
        province: deliveryAddress.province,
        postal_code: deliveryAddress.postalCode,
        instructions: deliveryAddress.instructions,
      });

      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.url;

      Object.entries(data.fields).forEach(([name, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (requestError) {
      const fieldErrors = requestError.response?.data?.errors;

      setPayError(
        (fieldErrors && Object.values(fieldErrors)[0]?.[0]) ||
          requestError.response?.data?.message ||
          "Couldn't start the payment. Please try again.",
      );

      setPaying(false);
    }
  };

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
        <p>Check your products and receiving details before payment.</p>
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

            const product = item.product;
            const isBeefCarcass = product?.category === "Beef Carcasses";
            const grade = getItemGrade(item);
            const weight = getItemWeight(item);
            const unavailable = isItemUnavailable(item);
            const availableStock = getAvailableStock(item);

            return (
              <article className="group-order-checkout-member" key={item.id}>
                <div>
                  <strong>{product.name}</strong>

                  {isBeefCarcass && (
                    <>
                      {grade && <span>Grade {grade}</span>}

                      {weight && <span>Weight: {weight}</span>}
                    </>
                  )}

                  {!isBeefCarcass && <span>{product.category}</span>}

                  <span>Unit price: {formatPrice(getItemUnitPrice(item))}</span>
                  <span>Quantity: {item.quantity}</span>

                  {isBeefCarcass && item.selected_quarter && (
                    <span>
                      Quarter:{" "}
                      {item.selected_quarter === "front"
                        ? "Front Quarter"
                        : "Hind Quarter"}
                    </span>
                  )}

                  {unavailable && (
                    <p
                      className="group-order-checkout-instructions"
                      role="alert"
                    >
                      {availableStock !== null && availableStock > 0
                        ? `Only ${availableStock} available. Return to your cart to reduce the quantity.`
                        : "This product is unavailable. Return to your cart to remove it or resolve the issue."}
                    </p>
                  )}

                  {isBeefCarcass && cuts.length > 0 && (
                    <div className="group-order-checkout-address">
                      <strong>Selected cuts</strong>
                      <ul>
                        {cuts.map((cut, index) => (
                          <li key={`${cut}-${index}`}>{cut}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {isBeefCarcass && remainingMeat.length > 0 && (
                    <div className="group-order-checkout-address">
                      <strong>Remaining meat preferences</strong>
                      <ul>
                        {remainingMeat.map((preference) => (
                          <li key={preference}>{preference}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {isBeefCarcass && item.special_instructions && (
                    <div className="group-order-checkout-instructions">
                      <span>Special instructions</span>
                      <p>{item.special_instructions}</p>
                    </div>
                  )}
                </div>

                <strong>{formatPrice(getItemTotal(item))}</strong>
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

              <strong>{formatPrice(cart.group_order.price)}</strong>
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
            hasDeliveryAddress ? (
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
              <div className="group-order-checkout-address">
                <p>
                  A complete delivery address is required before payment. Return
                  to your cart and select a saved address.
                </p>

                <Link to="/cart">Return to Cart</Link>
              </div>
            )
          ) : (
            <p className="group-order-checkout-collection">
              You have selected collection for your order.
            </p>
          )}
        </div>

        <div className="group-order-checkout-summary">
          <div>
            <span>Order total</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>

          {hasUnavailableItems && (
            <p role="alert">
              Some items are unavailable or have insufficient stock. Resolve
              this in your cart before paying.
            </p>
          )}

          <button
            type="button"
            className="group-order-checkout-payment"
            onClick={startPayment}
            disabled={!canPay}
          >
            {paying ? "Taking you to PayFast…" : "Pay with PayFast"}
          </button>

          <p className="group-order-checkout-secure">
            You'll be taken to PayFast to pay securely. PrimeMeat never sees
            your card details.
          </p>

          {payError && (
            <p role="alert" className="group-order-checkout-instructions">
              {payError}
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
