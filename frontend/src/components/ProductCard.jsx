import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Scale } from "lucide-react";
import api from "../api";
import CartToast from "./CartToast";

function ProductCard({ product, onCartUpdated }) {
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const closeMessage = useCallback(() => setMessage(""), []);

  const isCarcass = product.product_type === "carcass";

  const variants = Array.isArray(product.variants)
    ? product.variants.filter((variant) => variant.is_active !== false)
    : [];

  const availableVariants = variants.filter(
    (variant) => variant.in_stock !== false && Number(variant.stock) > 0,
  );

  const prices = (isCarcass ? availableVariants : [])
    .map((variant) => Number(variant.price))
    .filter(Number.isFinite);

  const minimumPrice = prices.length
    ? Math.min(...prices)
    : Number(product.price);
  const maximumPrice = prices.length
    ? Math.max(...prices)
    : Number(product.price);

  const grades = [
    ...new Set(
      availableVariants.map((variant) => variant.grade).filter(Boolean),
    ),
  ];

  const weightRanges = [
    ...new Set(
      availableVariants
        .filter(
          (variant) =>
            variant.weight_min_kg != null && variant.weight_max_kg != null,
        )
        .map(
          (variant) => `${variant.weight_min_kg}–${variant.weight_max_kg} kg`,
        ),
    ),
  ];

  const inStock = isCarcass
    ? availableVariants.length > 0
    : product.in_stock !== false;

  const formatPrice = (price) =>
    `R${Number(price).toLocaleString("en-ZA", {
      maximumFractionDigits: 2,
    })}`;

  const handleAddToCart = async () => {
    if (isCarcass) {
      return;
    }

    try {
      setAddingToCart(true);
      setMessage("");

      await api.post("/api/cart/items", {
        product_id: product.id,
        quantity: 1,
        cut_type: "traditional",
        selected_quarter: null,
        selections: [],
      });

      await onCartUpdated();

      setMessageType("success");
      setMessage(`${product.name} added to cart.`);
    } catch (error) {
      console.error("Failed to add product to cart:", error);

      setMessageType("error");
      setMessage(
        error.response?.status === 401
          ? "Please log in to add items to your cart."
          : error.response?.data?.message ||
              "Unable to add this product to your cart.",
      );
    } finally {
      setAddingToCart(false);
    }
  };

  const productImage = product.name.toLowerCase().includes("full")
    ? "/images/full-carcasss.png"
    : product.name.toLowerCase().includes("half")
      ? "/images/half-carcasss.png"
      : product.name.toLowerCase().includes("quarter")
        ? "/images/quarter-carcasss.png"
        : product.image;

  const weightMatch = product.description?.match(/(\d+(?:\.\d+)?)\s*kg/i);

  const productWeight = weightMatch ? `${weightMatch[1]} kg` : null;

  const displayPrice = isCarcass
    ? prices.length
      ? minimumPrice === maximumPrice
        ? formatPrice(minimumPrice)
        : `${formatPrice(minimumPrice)} – ${formatPrice(maximumPrice)}`
      : "Price unavailable"
    : product.price != null
      ? formatPrice(product.price)
      : "Price unavailable";

  return (
    <article className="product-card">
      {message && (
        <CartToast
          message={message}
          type={messageType}
          onClose={closeMessage}
        />
      )}

      <Link
        to={`/products/${product.id}`}
        className="product-card-image-link"
        aria-label={`View ${product.name}`}
      >
        <div className="product-card-image-container">
          {(isCarcass ? weightRanges.length > 0 : productWeight) && (
            <div className="product-card-weight">
              <Scale className="product-card-weight-icon" />
              <span>
                {isCarcass
                  ? weightRanges.length === 1
                    ? weightRanges[0]
                    : `${weightRanges.length} weight options`
                  : productWeight}
              </span>
            </div>
          )}

          <img
            className="product-card-image"
            src={productImage}
            alt={product.name}
          />

          {!isCarcass && product.grade && (
            <div className="p-grade-stamp">
              <span className="p-grade-letter">{product.grade}</span>
              <span className="p-grade-label">GRADE</span>
            </div>
          )}
        </div>
      </Link>

      <div className="product-card-content">
        <Link to={`/products/${product.id}`} className="product-card-name-link">
          <h3 className="product-card-name">{product.name}</h3>
        </Link>

        {isCarcass ? (
          <p className="product-card-grade">
            {grades.length > 0
              ? `Grades ${grades.join(", ")}`
              : "Select your preferred option"}
          </p>
        ) : product.grade ? (
          <p className="product-card-grade">Grade {product.grade}</p>
        ) : null}

        <p className="product-card-description">{product.description}</p>

        <div className="product-card-price">{displayPrice}</div>

        {!inStock && (
          <p className="product-card-stock" role="status">
            Out of stock
          </p>
        )}

        <div className="product-card-actions">
          <Link
            to={`/products/${product.id}`}
            className="product-card-view-button"
          >
            View Product
          </Link>

          {isCarcass ? (
            <Link
              to={`/products/${product.id}`}
              className="product-card-cart-button"
              aria-label={`Select Preference for ${product.name}`}
            >
              {inStock ? "Select Preference" : "View Product"}
            </Link>
          ) : (
            <button
              className="product-card-cart-button"
              type="button"
              onClick={handleAddToCart}
              disabled={addingToCart || !inStock}
            >
              {!inStock
                ? "Out of Stock"
                : addingToCart
                  ? "Adding..."
                  : "Add to Cart"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
