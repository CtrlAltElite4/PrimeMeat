import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api";
import productImage from "../utils/productImage";
import "../styles/Cart.css";

function Cart({ onCartUpdated }) {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [deliveryAddress, setDeliveryAddress] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    province: "",
    postalCode: "",
    instructions: "",
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Load the current user's cart.
  const fetchCart = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const { data } = await api.get("/api/cart");

      setCart(data.cart);
    } catch (error) {
      console.error("Failed to load cart:", error);

      setErrorMessage(
        error.response?.data?.message || "Unable to load your cart.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();

    const fetchSavedAddresses = async () => {
      try {
        const { data } = await api.get("/api/addresses");
        const addresses = data.addresses || [];

        setSavedAddresses(addresses);

        const defaultAddress = addresses.find((address) => address.is_default);

        if (defaultAddress) {
          setSelectedAddressId(String(defaultAddress.id));

          setDeliveryAddress((current) => ({
            ...current,
            addressLine1: defaultAddress.address_line_1 || "",
            addressLine2: defaultAddress.address_line_2 || "",
            city: defaultAddress.city || "",
            province: defaultAddress.province || "",
            postalCode: defaultAddress.postal_code || "",
          }));
        }
      } catch (error) {
        console.error("Failed to load saved addresses:", error);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchSavedAddresses();
  }, []);

  // Keep the selected saved address in sync with checkout details.
  const handleSavedAddressChange = (event) => {
    const addressId = event.target.value;

    setSelectedAddressId(addressId);

    if (!addressId) {
      setDeliveryAddress((current) => ({
        ...current,
        addressLine1: "",
        addressLine2: "",
        city: "",
        province: "",
        postalCode: "",
      }));

      return;
    }

    const selectedAddress = savedAddresses.find(
      (address) => String(address.id) === addressId,
    );

    if (!selectedAddress) {
      return;
    }

    setDeliveryAddress((current) => ({
      ...current,
      addressLine1: selectedAddress.address_line_1 || "",
      addressLine2: selectedAddress.address_line_2 || "",
      city: selectedAddress.city || "",
      province: selectedAddress.province || "",
      postalCode: selectedAddress.postal_code || "",
    }));
  };

  // Return the selected carcass variant when one exists.
  const getItemVariant = (item) =>
    item.product_variant || item.productVariant || null;

  // Resolve prices using the selected variant for carcasses.
  const getItemUnitPrice = (item) => {
    const variant = getItemVariant(item);

    return Number(variant?.price ?? item.price ?? item.product?.price ?? 0);
  };

  // Format South African currency consistently.
  const formatPrice = (price) =>
    `R${Number(price).toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const getItemTotal = (item) => getItemUnitPrice(item) * Number(item.quantity);

  // Resolve optional grade information from the selected variant.
  const getItemGrade = (item) => {
    const variant = getItemVariant(item);

    return variant?.grade ?? item.grade ?? item.product?.grade ?? null;
  };

  // Display the weight range selected for a carcass.
  const getItemWeight = (item) => {
    const variant = getItemVariant(item);

    if (variant?.weight_min_kg == null || variant?.weight_max_kg == null) {
      return null;
    }

    return `${variant.weight_min_kg}–${variant.weight_max_kg} kg`;
  };

  // Use the stock value supplied by the backend.
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

  // Update quantity without losing the selected variant or cut details.
  const updateQuantity = async (item, quantity) => {
    if (quantity < 1) {
      return;
    }

    const availableStock = getAvailableStock(item);

    if (availableStock !== null && quantity > availableStock) {
      setErrorMessage(
        `Only ${availableStock} of this item are currently available.`,
      );
      return;
    }

    try {
      setErrorMessage("");

      await api.put(`/api/cart/items/${item.id}`, {
        quantity,
        product_variant_id:
          item.product_variant_id ??
          item.product_variant?.id ??
          item.productVariant?.id ??
          null,
        cut_type: item.cut_type,
        selected_quarter: item.selected_quarter,
        selections: (item.cut_selections || []).map((selection) => ({
          cut_option_id: selection.cut_option_id,
          side: selection.side,
          quarter: selection.quarter,
        })),
        remaining_meat_preferences: item.remaining_meat_preferences,
        special_instructions: item.special_instructions,
      });

      await fetchCart();
      await onCartUpdated();
    } catch (error) {
      console.error("Failed to update quantity:", error);

      setErrorMessage(
        error.response?.data?.message || "Unable to update the cart.",
      );
    }
  };

  // Remove an individual cart item.
  const removeItem = async (itemId) => {
    try {
      setErrorMessage("");

      await api.delete(`/api/cart/items/${itemId}`);

      await fetchCart();
      await onCartUpdated();
    } catch (error) {
      console.error("Failed to remove item:", error);

      setErrorMessage(
        error.response?.data?.message || "Unable to remove the item.",
      );
    }
  };

  // Remove the group order.
  const removeGroupOrder = async () => {
    try {
      setErrorMessage("");

      await api.delete("/api/group-orders");

      await fetchCart();
      await onCartUpdated();
    } catch (error) {
      console.error("Failed to remove group order:", error);

      setErrorMessage(
        error.response?.data?.message || "Unable to remove the group order.",
      );
    }
  };

  // Get the selected custom cuts for a cart item.
  const getItemCuts = (item) => {
    if (item.cut_type !== "custom" || !item.cut_selections) {
      return [];
    }

    return item.cut_selections
      .map((selection) => selection.cut_option?.name)
      .filter(Boolean);
  };

  // Split cuts into columns for easier reading.
  const splitIntoColumns = (items, itemsPerColumn = 5) => {
    const columns = [];

    for (let i = 0; i < items.length; i += itemsPerColumn) {
      columns.push(items.slice(i, i + itemsPerColumn));
    }

    return columns;
  };

  // Convert remaining meat preference codes into display labels.
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

    return preferences.map((preference) => labels[preference]).filter(Boolean);
  };

  // Calculate the cart subtotal using variant-aware item prices.
  const getCartTotal = () => {
    if (!cart) {
      return 0;
    }

    const productTotal = (cart.items || []).reduce(
      (total, item) => total + getItemTotal(item),
      0,
    );

    const groupOrderTotal = cart.group_order
      ? Number(cart.group_order.price)
      : 0;

    return productTotal + groupOrderTotal;
  };

  const hasItems = (cart?.items?.length || 0) > 0 || Boolean(cart?.group_order);

  // Prevent checkout if any item is unavailable or has insufficient stock.
  const hasUnavailableItems = (cart?.items || []).some(isItemUnavailable);

  if (loading) {
    return (
      <main className="cart-page">
        <div className="cart-loading">Loading your cart...</div>
      </main>
    );
  }

  if (errorMessage && !cart) {
    return (
      <main className="cart-page">
        <div className="cart-error">
          <p>{errorMessage}</p>

          <button type="button" onClick={fetchCart}>
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (!hasItems) {
    return (
      <main className="cart-page">
        <section className="cart-empty">
          <h1>Your Cart</h1>

          <p>Your cart is currently empty.</p>

          <Link to="/products" className="cart-empty-button">
            Browse Products
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-container">
        <div className="cart-heading">
          <h1>Your Cart</h1>

          <p>Review your selected products before checkout.</p>
        </div>

        {errorMessage && (
          <div className="cart-message" role="alert">
            {errorMessage}
          </div>
        )}

        <div className="cart-layout">
          <section className="cart-items">
            {cart.group_order && (
              <article className="cart-item cart-group-order">
                <div className="cart-item-details">
                  <span className="cart-item-name">Group Order</span>

                  <h2>Full Carcass</h2>

                  <p className="cart-item-price">
                    {formatPrice(cart.group_order.price)}
                  </p>

                  <div className="cart-item-quarter">
                    <strong>Weight Range:</strong>{" "}
                    {String(cart.group_order.weight_range || "").replace(
                      "-",
                      "–",
                    )}{" "}
                    kg
                  </div>

                  <div className="cart-item-quarter">
                    <strong>Group Size:</strong>{" "}
                    {cart.group_order.number_of_people} people
                  </div>

                  {cart.group_order.delivery_member && (
                    <div className="cart-item-quarter">
                      <strong>Delivery Recipient:</strong>{" "}
                      {cart.group_order.delivery_member.name}
                    </div>
                  )}

                  <div className="cart-item-instructions">
                    <strong>Delivery Address:</strong>

                    <p>
                      {cart.group_order.address_line_1}
                      {cart.group_order.address_line_2 && (
                        <>
                          <br />
                          {cart.group_order.address_line_2}
                        </>
                      )}
                      <br />
                      {cart.group_order.city}, {cart.group_order.province}
                      <br />
                      {cart.group_order.postal_code}
                    </p>
                  </div>

                  {cart.group_order.delivery_instructions && (
                    <div className="cart-item-instructions">
                      <strong>Delivery Instructions:</strong>

                      <p>{cart.group_order.delivery_instructions}</p>
                    </div>
                  )}
                </div>

                <div className="cart-item-controls">
                  <button
                    type="button"
                    className="cart-remove"
                    onClick={removeGroupOrder}
                  >
                    Remove
                  </button>
                </div>

                <div className="cart-item-total">
                  {formatPrice(cart.group_order.price)}
                </div>
              </article>
            )}

            {(cart.items || []).map((item) => {
              const cuts = getItemCuts(item);
              const cutColumns = splitIntoColumns(cuts);
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
                <article key={item.id} className="cart-item">
                  <Link
                    to={`/products/${product.id}?editCartItem=${item.id}`}
                    className="cart-item-product-link"
                  >
                    <div className="cart-item-image">
                      <img src={productImage(product)} alt={product.name} />
                    </div>

                    <div className="cart-item-details">
                      <span className="cart-item-name">{product.name}</span>

                      {isBeefCarcass ? (
                        <>
                          {grade && <h2>Grade {grade}</h2>}

                          {weight && (
                            <div className="cart-item-quarter">
                              <strong>Weight:</strong> {weight}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="cart-item-quarter">
                          <span>{product.category}</span>
                        </div>
                      )}

                      <p className="cart-item-price">
                        {formatPrice(getItemUnitPrice(item))} each
                      </p>

                      {unavailable && (
                        <p className="cart-message" role="alert">
                          {availableStock !== null && availableStock > 0
                            ? `Only ${availableStock} available. Reduce the quantity to continue.`
                            : "This item is currently unavailable. Remove it or contact us before checkout."}
                        </p>
                      )}

                      {isBeefCarcass && item.selected_quarter && (
                        <div className="cart-item-quarter">
                          <strong>Quarter:</strong>{" "}
                          {item.selected_quarter === "front"
                            ? "Front Quarter"
                            : "Hind Quarter"}
                        </div>
                      )}
                      {isBeefCarcass && cuts.length > 0 && (
                        <div className="cart-item-cuts">
                          <strong>Selected Cuts:</strong>

                          <div className="cart-item-cuts-columns">
                            {cutColumns.map((column, columnIndex) => (
                              <ul key={columnIndex}>
                                {column.map((cut, index) => (
                                  <li key={`${cut}-${index}`}>{cut}</li>
                                ))}
                              </ul>
                            ))}
                          </div>
                        </div>
                      )}

                      {isBeefCarcass && remainingMeat.length > 0 && (
                        <div className="cart-item-preferences">
                          <strong>Remaining Meat:</strong>

                          <ul>
                            {remainingMeat.map((preference) => (
                              <li key={preference}>{preference}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {isBeefCarcass && item.special_instructions && (
                        <div className="cart-item-instructions">
                          <strong>Special Instructions:</strong>

                          <p>{item.special_instructions}</p>
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="cart-item-controls">
                    <div className="cart-quantity">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item, Number(item.quantity) - 1)
                        }
                        disabled={Number(item.quantity) <= 1}
                        aria-label={`Decrease quantity of ${product.name}`}
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item, Number(item.quantity) + 1)
                        }
                        disabled={
                          availableStock !== null &&
                          Number(item.quantity) >= availableStock
                        }
                        aria-label={`Increase quantity of ${product.name}`}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="cart-remove"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="cart-item-total">
                    {formatPrice(getItemTotal(item))}
                  </div>
                </article>
              );
            })}
          </section>

          <section className="cart-delivery">
            <div className="cart-delivery-heading">
              <span>Delivery</span>

              <h2>How would you like to receive your order?</h2>
            </div>

            <div className="cart-delivery-options">
              <button
                type="button"
                className={`cart-delivery-option ${
                  deliveryMethod === "delivery"
                    ? "cart-delivery-option--selected"
                    : ""
                }`}
                onClick={() => setDeliveryMethod("delivery")}
              >
                <strong>Delivery</strong>

                <span>Have your order delivered to you.</span>
              </button>

              <button
                type="button"
                className={`cart-delivery-option ${
                  deliveryMethod === "collection"
                    ? "cart-delivery-option--selected"
                    : ""
                }`}
                onClick={() => setDeliveryMethod("collection")}
              >
                <strong>Collection</strong>

                <span>Collect your order from our location.</span>
              </button>
            </div>

            {deliveryMethod === "delivery" && (
              <div className="cart-delivery-address">
                <h3>Delivery Address</h3>

                {loadingAddresses ? (
                  <p>Loading saved addresses...</p>
                ) : savedAddresses.length > 0 ? (
                  <>
                    <div className="cart-saved-address">
                      <label htmlFor="cart-saved-address">
                        Select Delivery Address
                      </label>

                      <select
                        id="cart-saved-address"
                        value={selectedAddressId}
                        onChange={handleSavedAddressChange}
                      >
                        <option value="">Select a saved address</option>

                        {savedAddresses.map((address) => (
                          <option key={address.id} value={address.id}>
                            {address.label || "Saved Address"}
                            {address.is_default ? " — Default" : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Link
                      to="/account/addresses/new"
                      className="cart-add-address-button"
                    >
                      Add New Address
                    </Link>
                  </>
                ) : (
                  <div className="cart-no-address">
                    <p>You do not have any saved delivery addresses.</p>

                    <Link
                      to="/account/addresses/new"
                      className="cart-add-address-button"
                    >
                      Add Address
                    </Link>
                  </div>
                )}
              </div>
            )}
          </section>

          <aside className="cart-summary">
            <h2>Order Summary</h2>

            <div className="cart-summary-row">
              <span>Subtotal</span>
              <strong>{formatPrice(getCartTotal())}</strong>
            </div>

            <div className="cart-summary-total">
              <span>Total</span>
              <strong>{formatPrice(getCartTotal())}</strong>
            </div>

            {hasUnavailableItems && (
              <p className="cart-message" role="alert">
                Some items in your cart are unavailable or have insufficient
                stock. Update their quantities or remove them before checkout.
              </p>
            )}

            <button
              type="button"
              className="cart-checkout-button"
              disabled={hasUnavailableItems}
              onClick={() =>
                navigate("/checkout", {
                  state: {
                    deliveryMethod,
                    deliveryAddress,
                  },
                })
              }
            >
              Proceed to Checkout
            </button>

            <Link to="/products" className="cart-continue-button">
              Continue Shopping
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Cart;
