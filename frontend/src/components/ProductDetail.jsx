import { useCallback, useEffect, useState } from "react";
import { NavLink, useNavigate, useSearchParams, Link } from "react-router-dom";
import CartToast from "./CartToast";
import { Scale } from "lucide-react";
import api from "../api";
import productImage from "../utils/productImage";
import CutPreference from "./CutPreference";
import CustomCutSheet from "./CustomCutSheet";
import CutSelectionSummary from "./CutSelectionSummary";
const getVariantWeight = (variant) => {
  if (variant.weight_min_kg == null || variant.weight_max_kg == null) {
    return "";
  }

  return `${variant.weight_min_kg}-${variant.weight_max_kg}`;
};

const formatVariantWeight = (variant) => {
  if (variant.weight_min_kg == null || variant.weight_max_kg == null) {
    return "Weight not specified";
  }

  return `${variant.weight_min_kg}–${variant.weight_max_kg} kg`;
};
function ProductDetail({ product, onCartUpdated }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const editCartItemId = searchParams.get("editCartItem");
  const isEditMode = Boolean(editCartItemId);
  const isBeefCarcass = product.category === "Beef Carcasses";
  const isCarcass = product.product_type === "carcass";

  const [cutType, setCutType] = useState("traditional");
  const [customSheetOpen, setCustomSheetOpen] = useState(false);
  const [selectedCuts, setSelectedCuts] = useState([]);
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  const [cutSelections, setCutSelections] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loadingCartItem, setLoadingCartItem] = useState(isEditMode);
  const [savingCartItem, setSavingCartItem] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [cartMessageType, setCartMessageType] = useState("error");
  const [remainingMeatPreferences, setRemainingMeatPreferences] = useState([
    "butcher_choice",
  ]);
  const [specialInstructions, setSpecialInstructions] = useState("");

  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [editingVariantDetails, setEditingVariantDetails] = useState(null);

  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedWeight, setSelectedWeight] = useState("");

  const closeCartMessage = useCallback(() => setCartMessage(""), []);

  const variants = Array.isArray(product.variants) ? product.variants : [];
  const variantOptions = [...variants];

  // Preserve a saved variant in the selector even if it is no longer in the product's active variant list.
  if (
    editingVariantDetails &&
    !variantOptions.some(
      (variant) => Number(variant.id) === Number(editingVariantDetails.id),
    )
  ) {
    variantOptions.push(editingVariantDetails);
  }

  const selectedVariant = isCarcass
    ? variantOptions.find(
        (variant) => Number(variant.id) === Number(selectedVariantId),
      ) || null
    : null;
  const availableVariants = variantOptions.filter(
    (variant) =>
      variant.is_active !== false &&
      variant.in_stock !== false &&
      Number(variant.stock) > 0,
  );

  const availableGrades = ["A", "AB", "B", "C"].filter((grade) =>
    availableVariants.some(
      (variant) =>
        String(variant.grade).toUpperCase() === grade &&
        (!selectedWeight || getVariantWeight(variant) === selectedWeight),
    ),
  );

  const availableWeights = [
    ...new Set(
      availableVariants
        .filter(
          (variant) =>
            !selectedGrade ||
            String(variant.grade).toUpperCase() === selectedGrade,
        )
        .map(getVariantWeight)
        .filter(Boolean),
    ),
  ].sort((a, b) => {
    const [aMin] = a.split("-").map(Number);
    const [bMin] = b.split("-").map(Number);
    return aMin - bMin;
  });
  const variantStock = Number(selectedVariant?.stock);
  const variantInStock =
    selectedVariant !== null &&
    selectedVariant.is_active !== false &&
    selectedVariant.in_stock !== false &&
    variantStock > 0;

  const inStock = isCarcass ? variantInStock : product.in_stock !== false;

  const availableStock = isCarcass
    ? variantInStock
      ? variantStock
      : 0
    : Number(product.stock);

  const maxQuantity = availableStock > 0 ? availableStock : undefined;

  const displayedPrice = isCarcass ? selectedVariant?.price : product.price;

  const displayedGrade = isCarcass ? selectedVariant?.grade : product.grade;

  const variantWeight =
    selectedVariant?.weight_min_kg != null &&
    selectedVariant?.weight_max_kg != null
      ? `${selectedVariant.weight_min_kg}–${selectedVariant.weight_max_kg} kg`
      : null;

  const weightMatch = product.description?.match(/(\d+(?:\.\d+)?)\s*kg/i);
  const productWeight = weightMatch ? `${weightMatch[1]} kg` : null;

  // Choose an available variant for a new carcass order.
  useEffect(() => {
    if (isEditMode || !isCarcass) {
      return;
    }

    const availableVariant = variants.find(
      (variant) =>
        variant.is_active !== false &&
        variant.in_stock !== false &&
        Number(variant.stock) > 0,
    );

    const firstActiveVariant = variants.find(
      (variant) => variant.is_active !== false,
    );

    const defaultVariant = availableVariant || firstActiveVariant;

    setSelectedVariantId(defaultVariant ? String(defaultVariant.id) : "");
    setSelectedGrade(
      defaultVariant?.grade ? String(defaultVariant.grade).toUpperCase() : "",
    );
    setSelectedWeight(defaultVariant ? getVariantWeight(defaultVariant) : "");
    setEditingVariantDetails(null);
  }, [
    product.id,
    product.product_type,
    product.variants,
    isCarcass,
    isEditMode,
  ]);

  // Restore the exact variant and other settings when editing a cart item.
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

        const savedVariant =
          cartItem.product_variant || cartItem.productVariant || null;

        const savedVariantId =
          cartItem.product_variant_id ?? savedVariant?.id ?? null;

        if (savedVariantId != null) {
          const variantToRestore =
            savedVariant ||
            variantOptions.find(
              (variant) => Number(variant.id) === Number(savedVariantId),
            );

          setSelectedVariantId(String(savedVariantId));
          setEditingVariantDetails(variantToRestore);

          setSelectedGrade(
            variantToRestore?.grade
              ? String(variantToRestore.grade).toUpperCase()
              : "",
          );

          setSelectedWeight(
            variantToRestore ? getVariantWeight(variantToRestore) : "",
          );
        }

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
  }, [editCartItemId, isEditMode, product.id, variantOptions]);

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

  const handleSelectionsChange = useCallback((selections) => {
    setCutSelections(selections);
  }, []);

  const handleVariantChange = (event) => {
    setSelectedVariantId(event.target.value);
    setQuantity(1);
    setCartMessage("");
  };
  const handleGradeChange = (grade) => {
    setSelectedGrade(grade);
    setCartMessage("");
    setQuantity(1);

    const matchingVariant = availableVariants.find(
      (variant) =>
        String(variant.grade).toUpperCase() === grade &&
        (!selectedWeight || getVariantWeight(variant) === selectedWeight),
    );

    if (matchingVariant) {
      setSelectedWeight(getVariantWeight(matchingVariant));
      setSelectedVariantId(String(matchingVariant.id));
    } else {
      setSelectedWeight("");
      setSelectedVariantId("");
    }
  };

  const handleWeightChange = (event) => {
    const weight = event.target.value;

    setSelectedWeight(weight);
    setCartMessage("");
    setQuantity(1);

    const matchingVariant = availableVariants.find(
      (variant) =>
        getVariantWeight(variant) === weight &&
        (!selectedGrade ||
          String(variant.grade).toUpperCase() === selectedGrade),
    );

    if (matchingVariant) {
      setSelectedGrade(String(matchingVariant.grade).toUpperCase());
      setSelectedVariantId(String(matchingVariant.id));
    } else {
      setSelectedGrade("");
      setSelectedVariantId("");
    }
  };
  const handleSubmit = async () => {
    setCartMessage("");
    setCartMessageType("error");

    if (isCarcass && !selectedVariant) {
      setCartMessage("Please select a carcass variant.");
      return;
    }

    if (isCarcass && !variantInStock) {
      setCartMessage("This variant is out of stock.");
      return;
    }

    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
      setCartMessage("Please enter a valid quantity.");
      return;
    }

    if (maxQuantity !== undefined && Number(quantity) > maxQuantity) {
      setCartMessage(`Only ${maxQuantity} available for this selection.`);
      return;
    }

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
        product_variant_id: isCarcass ? selectedVariant.id : null,
        quantity: Number(quantity),
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
          {(variantWeight || productWeight) && (
            <div className="product-card-weight-d">
              <Scale className="product-card-weight-icon" />
              <span>
                {isCarcass ? variantWeight || "Weight varies" : productWeight}
              </span>
            </div>
          )}

          <img
            className="product-detail-image"
            src={productImage(product)}
            alt={product.name}
          />

          {displayedGrade && (
            <div className="grade-stamp">
              <span className="grade-letter">{displayedGrade}</span>
              <span className="grade-label">GRADE</span>
            </div>
          )}
        </div>

        <div className="product-detail-info">
          <span className="product-detail-category">{product.name}</span>

          <h1>
            {isCarcass && displayedGrade
              ? `Grade ${displayedGrade}`
              : product.name}
          </h1>

          <p className="product-detail-description">{product.description}</p>

          {isBeefCarcass && (
            <div className="product-detail-variant">
              <div className="product-grade-selection">
                <label>Select Grade</label>

                <div className="product-grade-options">
                  {["A", "AB", "B", "C"].map((grade) => {
                    const isAvailable = availableGrades.includes(grade);

                    return (
                      <button
                        key={grade}
                        type="button"
                        className={`product-grade-option ${
                          selectedGrade === grade
                            ? "product-grade-option--selected"
                            : ""
                        }`}
                        disabled={!isAvailable}
                        onClick={() => handleGradeChange(grade)}
                      >
                        {grade}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="product-weight-selection">
                <label htmlFor="product-weight">Select Weight</label>

                <select
                  id="product-weight"
                  value={selectedWeight}
                  onChange={handleWeightChange}
                  disabled={availableWeights.length === 0}
                >
                  <option value="">
                    {availableWeights.length === 0
                      ? "No weights available"
                      : "Select a weight range"}
                  </option>

                  {availableWeights.map((weight) => (
                    <option key={weight} value={weight}>
                      {weight.replace("-", "–")} kg
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {isCarcass && !isBeefCarcass && (
            <div className="product-weight-selection">
              <label htmlFor="product-variant">Select Weight</label>

              <select
                id="product-variant"
                value={selectedVariantId}
                onChange={handleVariantChange}
                disabled={variantOptions.length === 0}
              >
                <option value="" disabled>
                  {variantOptions.length === 0
                    ? "No weights available"
                    : "Select a weight range"}
                </option>

                {variantOptions.map((variant) => {
                  const available =
                    variant.is_active !== false &&
                    variant.in_stock !== false &&
                    Number(variant.stock) > 0;

                  const weight =
                    variant.weight_min_kg != null &&
                    variant.weight_max_kg != null
                      ? `${variant.weight_min_kg}–${variant.weight_max_kg} kg`
                      : "Weight not specified";

                  return (
                    <option
                      key={variant.id}
                      value={String(variant.id)}
                      disabled={!available}
                    >
                      {`${weight}${available ? "" : " (Out of stock)"}`}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <div className="product-detail-price">
            {displayedPrice != null
              ? `R${Number(displayedPrice).toLocaleString("en-ZA", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "Price unavailable"}
          </div>

          {!inStock && (
            <p className="product-detail-cart-message" role="status">
              Out of stock. This selection can't be ordered right now.
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
      {isBeefCarcass && (
        <>
          <CutPreference
            cutType={cutType}
            onCutTypeChange={handleCutTypeChange}
            customSheetOpen={customSheetOpen}
            onToggleCustomSheet={() =>
              setCustomSheetOpen((current) => !current)
            }
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
        </>
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
          disabled={
            savingCartItem || !inStock || (isCarcass && !selectedVariant)
          }
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
