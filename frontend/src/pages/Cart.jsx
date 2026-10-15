import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AddressForm from "../components/AddressForm";
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
  // Update the quantity of a cart item. The server needs the item's cut
  // details as well, so they're sent back unchanged.
  const updateQuantity = async (item, quantity) => {
    if (quantity < 1) {
      return;
    }

    try {
      setErrorMessage("");

      await api.put(`/api/cart/items/${item.id}`, {
        quantity,
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

  // Remove an item from the cart.
  const removeItem = async (itemId) => {
    try {
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
  const removeGroupOrder = async () => {
    try {
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
      .map((selection) => {
        const cut = selection.cut_option?.name;

        if (!cut) {
          return null;
        }

        return cut;
      })
      .filter(Boolean);
  };

  // Split cuts into columns with a maximum number of items.
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

  // Calculate the total for one cart item.
  const getItemTotal = (item) => {
    return Number(item.product.price) * Number(item.quantity);
  };

  // Calculate the cart subtotal.
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

  // Items that sold out (or were switched off) after being added to the cart
  const hasUnavailableItems = (cart?.items || []).some(
    (item) => item.is_available === false,
  );

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

          <p>Review your selected carcasses before checkout.</p>
        </div>

        {errorMessage && <div className="cart-message">{errorMessage}</div>}

        <div className="cart-layout">
          <section className="cart-items">
            {cart.group_order && (
              <article className="cart-item cart-group-order">
                <div className="cart-item-details">
                  <span className="cart-item-name">Group Order</span>

                  <h2>Full Carcass</h2>

                  <p className="cart-item-price">
                    R{Number(cart.group_order.price).toLocaleString("en-ZA")}
                  </p>

                  <div className="cart-item-cut-type">
                    <strong>Preparation:</strong> Traditional
                  </div>

                  <div className="cart-item-quarter">
                    <strong>Weight Range:</strong>{" "}
                    {cart.group_order.weight_range.replace("-", "–")} kg
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
                  R{Number(cart.group_order.price).toLocaleString("en-ZA")}
                </div>
              </article>
            )}

            {(cart.items || []).map((item) => {
              const cuts = getItemCuts(item);
              const cutColumns = splitIntoColumns(cuts);
              const remainingMeat = getRemainingMeatLabels(
                item.remaining_meat_preferences,
              );

              return (
                <article key={item.id} className="cart-item">
                  <Link
                    to={`/products/${item.product.id}?editCartItem=${item.id}`}
                    className="cart-item-product-link"
                  >
                    <div className="cart-item-image">
                      <img src={productImage(item.product)} alt={item.product.name} />
                    </div>

                    <div className="cart-item-details">
                      <span className="cart-item-name">
                        {item.product.name}
                      </span>

                      <h2>Grade {item.product.grade}</h2>

                      <p className="cart-item-price">
                        R{Number(item.product.price).toLocaleString("en-ZA")}
                      </p>

                      {item.is_available === false && (
                        <p className="cart-message" role="alert">
                          {item.available_stock > 0
                            ? `Only ${item.available_stock} left in stock. Reduce the quantity to continue.`
                            : "This product is now out of stock. Remove it to continue."}
                        </p>
                      )}

                      <div className="cart-item-cut-type">
                        <strong>Preparation:</strong>{" "}
                        {item.cut_type === "custom"
                          ? "Custom Cuts"
                          : "Traditional"}
                      </div>

                      {item.selected_quarter && (
                        <div className="cart-item-quarter">
                          <strong>Quarter:</strong>{" "}
                          {item.selected_quarter === "front"
                            ? "Front Quarter"
                            : "Hind Quarter"}
                        </div>
                      )}

                      {cuts.length > 0 && (
                        <div className="cart-item-cuts">
                          <strong>Selected Cuts:</strong>

                          <div className="cart-item-cuts-columns">
                            {cutColumns.map((column, columnIndex) => (
                              <ul key={columnIndex}>
                                {column.map((cut, index) => (
                                  <li key={index}>{cut}</li>
                                ))}
                              </ul>
                            ))}
                          </div>
                        </div>
                      )}

                      {remainingMeat.length > 0 && (
                        <div className="cart-item-preferences">
                          <strong>Remaining Meat:</strong>

                          <ul>
                            {remainingMeat.map((preference) => (
                              <li key={preference}>{preference}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {item.special_instructions && (
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
                          Number(item.quantity) >= Number(item.available_stock ?? Infinity)
                        }
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
                    R{getItemTotal(item).toLocaleString("en-ZA")}
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

              <strong>R{getCartTotal().toLocaleString("en-ZA")}</strong>
            </div>

            <div className="cart-summary-total">
              <span>Total</span>

              <strong>R{getCartTotal().toLocaleString("en-ZA")}</strong>
            </div>

            {hasUnavailableItems && (
              <p className="cart-message" role="alert">
                Some items in your cart are out of stock. Update them before
                checking out.
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
