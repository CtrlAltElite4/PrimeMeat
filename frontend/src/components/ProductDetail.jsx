import { useCallback, useEffect, useState } from "react";
import { NavLink, useNavigate, useSearchParams, Link } from "react-router-dom";
import CartToast from "./CartToast";
import { Scale } from "lucide-react";
import api from "../api";
import productImage from "../utils/productImage";
import CutPreference from "./CutPreference";
import CustomCutSheet from "./CustomCutSheet";
import CutSelectionSummary from "./CutSelectionSummary";

function ProductDetail({ product, onCartUpdated }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get the cart item being edited from the URL.
  const editCartItemId = searchParams.get("editCartItem");
  const isEditMode = Boolean(editCartItemId);

  // Store the selected cutting method.
  const [cutType, setCutType] = useState("traditional");

  // Control whether the custom cut sheet is visible.
  const [customSheetOpen, setCustomSheetOpen] = useState(false);

  // Store the selected cut keys.
  const [selectedCuts, setSelectedCuts] = useState([]);

  // Store the selected quarter for quarter carcasses.
  const [selectedQuarter, setSelectedQuarter] = useState(null);

  // Store the formatted cut selections sent to the backend.
  const [cutSelections, setCutSelections] = useState([]);

  // Store the requested product quantity.
  const [quantity, setQuantity] = useState(1);

  // Track whether the cart item is being loaded.
  const [loadingCartItem, setLoadingCartItem] = useState(isEditMode);

  // Track whether the cart item is being saved.
  const [savingCartItem, setSavingCartItem] = useState(false);

  // Store cart success and error messages.
  const [cartMessage, setCartMessage] = useState("");

  // "success" shows a green pop-up, anything else a red one
  const [cartMessageType, setCartMessageType] = useState("error");
  const closeCartMessage = useCallback(() => setCartMessage(""), []);

  // Store the selected preferences for remaining meat.
  const [remainingMeatPreferences, setRemainingMeatPreferences] = useState([
    "butcher_choice",
  ]);

  // Store any additional preparation instructions.
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Load the existing cart item when editing.
  useEffect(() => {
    if (!isEditMode) {
      setLoadingCartItem(false);
      return;
    }

    const loadCartItem = async () => {
      try {
        setLoadingCartItem(true);
        setCartMessage("");

        const { data } = await api.get("/api/cart");

        const cartItem = data.cart?.items?.find(
          (item) => String(item.id) === String(editCartItemId),
        );

        if (!cartItem) {
          setCartMessage("The cart item could not be found.");
          return;
        }

        if (
          Number(cartItem.product_id || cartItem.product?.id) !==
          Number(product.id)
        ) {
          setCartMessage("This cart item does not belong to this product.");
          return;
        }

        setQuantity(Number(cartItem.quantity) || 1);
        setCutType(cartItem.cut_type || "traditional");

        if (cartItem.cut_type === "custom") {
          setCustomSheetOpen(true);
          setSelectedQuarter(cartItem.selected_quarter || null);

          const restoredCuts = (cartItem.cut_selections || [])
            .map((selection) => {
              const cutName = selection.cut_option?.name;

              if (!cutName) {
                return null;
              }

              return `${selection.side}-${selection.quarter}-${cutName}`;
            })
            .filter(Boolean);

          setSelectedCuts(restoredCuts);

          setCutSelections(
            (cartItem.cut_selections || []).map((selection) => ({
              cut_option_id: selection.cut_option_id,
              side: selection.side,
              quarter: selection.quarter,
            })),
          );

          setRemainingMeatPreferences(
            Array.isArray(cartItem.remaining_meat_preferences)
              ? cartItem.remaining_meat_preferences
              : ["butcher_choice"],
          );

          setSpecialInstructions(cartItem.special_instructions || "");
        } else {
          setCustomSheetOpen(false);
          setSelectedCuts([]);
          setSelectedQuarter(null);
          setCutSelections([]);
          setRemainingMeatPreferences(["butcher_choice"]);
          setSpecialInstructions("");
        }
      } catch (error) {
        console.error("Failed to load cart item:", error);

        setCartMessage(
          error.response?.data?.message ||
            "Unable to load the cart item for editing.",
        );
      } finally {
        setLoadingCartItem(false);
      }
    };

    loadCartItem();
  }, [editCartItemId, isEditMode, product.id]);

  // Update the cutting method and reset custom selections when needed.
  const handleCutTypeChange = (type) => {
    setCutType(type);
    setCartMessage("");

    if (type === "traditional") {
      setCustomSheetOpen(false);
      setSelectedCuts([]);
      setSelectedQuarter(null);
      setCutSelections([]);
      setRemainingMeatPreferences(["butcher_choice"]);
      setSpecialInstructions("");
    }
  };
  // in_stock comes from the server; older responses without it count as in stock
  const inStock = product.in_stock !== false;
  const maxQuantity = Number(product.stock) > 0 ? Number(product.stock) : undefined;

  const weightMatch = product.description?.match(/(\d+(?:\.\d+)?)\s*kg/i);
  const productWeight = weightMatch ? `${weightMatch[1]} kg` : null;
  // Update the formatted selections received from the custom cut sheet.
  const handleSelectionsChange = useCallback((selections) => {
    setCutSelections(selections);
  }, []);

  // Validate and save the product configuration.
  const handleSubmit = async () => {
    setCartMessage("");
    setCartMessageType("error");

    if (cutType === "custom") {
      const productName = product.name.toLowerCase();
      const isQuarter = productName.includes("quarter");

      if (isQuarter && !selectedQuarter) {
        setCartMessage("Please select a front or hind quarter.");
        return;
      }

      if (cutSelections.length === 0) {
        setCartMessage("Please select at least one cut.");
        return;
      }
    }

    try {
      setSavingCartItem(true);

      const cartData = {
        product_id: product.id,
        quantity,
        cut_type: cutType,
        selected_quarter: cutType === "custom" ? selectedQuarter : null,
        selections: cutType === "custom" ? cutSelections : [],
        remaining_meat_preferences:
          cutType === "custom" ? remainingMeatPreferences : null,
        special_instructions:
          cutType === "custom" ? specialInstructions.trim() || null : null,
      };

      if (isEditMode) {
        await api.put(`/api/cart/items/${editCartItemId}`, cartData);

        await onCartUpdated();

        navigate("/cart");
        return;
      }

      await api.post("/api/cart/items", cartData);

      await onCartUpdated();

      setCartMessageType("success");
      setCartMessage("Product added to cart.");
    } catch (error) {
      console.error("Save cart item error:", error);

      const message =
        error.response?.data?.message ||
        "Unable to save the product to your cart.";

      setCartMessage(message);
    } finally {
      setSavingCartItem(false);
    }
  };

  if (loadingCartItem) {
    return (
      <main className="product-detail-page">
        <div className="product-detail-loading">Loading your cart item...</div>
      </main>
    );
  }

  return (
    <main className="product-detail-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/products">Shop</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>
      <section className="product-detail">
        <div className="product-detail-image-container">
          {productWeight && (
            <div className="product-card-weight-d">
              <Scale className="product-card-weight-icon" />
              <span>{productWeight}</span>
            </div>
          )}
          <img
            className="product-detail-image"
            src={productImage(product)}
            alt={product.name}
          />
          <div className="grade-stamp">
            <span className="grade-letter">{product.grade}</span>
            <span className="grade-label">GRADE</span>
          </div>
        </div>

        <div className="product-detail-info">
          <span className="product-detail-category">{product.name}</span>

          <h1>Grade {product.grade}</h1>

          <p className="product-detail-description">{product.description}</p>

          <div className="product-detail-price">
            R{Number(product.price).toLocaleString("en-ZA")}
          </div>

          {!inStock && (
            <p className="product-detail-cart-message" role="status">
              Out of stock. This product can't be ordered right now.
            </p>
          )}

          <div className="product-detail-quantity">
            <label htmlFor="product-quantity">Quantity</label>

            <input
              id="product-quantity"
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              disabled={!inStock}
              onChange={(event) => setQuantity(Number(event.target.value))}
            />
          </div>
        </div>
      </section>

      <CutPreference
        cutType={cutType}
        onCutTypeChange={handleCutTypeChange}
        customSheetOpen={customSheetOpen}
        onToggleCustomSheet={() => setCustomSheetOpen((current) => !current)}
      />

      {cutType === "custom" && customSheetOpen && (
        <CustomCutSheet
          productName={product.name}
          selectedCuts={selectedCuts}
          setSelectedCuts={setSelectedCuts}
          selectedQuarter={selectedQuarter}
          setSelectedQuarter={setSelectedQuarter}
          onSelectionsChange={handleSelectionsChange}
          remainingMeatPreferences={remainingMeatPreferences}
          setRemainingMeatPreferences={setRemainingMeatPreferences}
          specialInstructions={specialInstructions}
          setSpecialInstructions={setSpecialInstructions}
        />
      )}

      {cutType === "custom" && customSheetOpen && (
        <CutSelectionSummary selectedCuts={selectedCuts} />
      )}

      {cartMessage && (
        <CartToast
          message={cartMessage}
          type={cartMessageType}
          onClose={closeCartMessage}
        />
      )}

      <section className="product-detail-actions">
        <NavLink
          to={isEditMode ? "/cart" : "/products"}
          className="product-detail-back"
        >
          {isEditMode ? "Back to Cart" : "Back to Products"}
        </NavLink>

        <button
          type="button"
          className="product-detail-cart"
          onClick={handleSubmit}
          disabled={savingCartItem || !inStock}
        >
          {!inStock
            ? "Out of Stock"
            : savingCartItem
            ? isEditMode
              ? "Saving..."
              : "Adding..."
            : isEditMode
              ? "Save Changes"
              : "Add to Cart"}
        </button>
      </section>
    </main>
  );
}

export default ProductDetail;
