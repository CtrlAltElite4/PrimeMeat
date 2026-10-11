import { useState } from "react";
import { Link } from "react-router-dom";
import { Scale } from "lucide-react";

import api from "../api";

function ProductCard({ product, onCartUpdated }) {
  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);

      await api.post("/api/cart/items", {
        product_id: product.id,
        quantity: 1,
        cut_type: "traditional",
        selected_quarter: null,
        selections: [],
      });

      await onCartUpdated();
    } catch (error) {
      console.error("Failed to add product to cart:", error);

      if (error.response?.status === 401) {
        alert("Please log in to add items to your cart.");
      } else {
        alert(
          error.response?.data?.message ||
            "Unable to add this product to your cart.",
        );
      }
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

  return (
    <article className="product-card">
      <Link
        to={`/products/${product.id}`}
        className="product-card-image-link"
        aria-label={`View ${product.name}`}
      >
        <div className="product-card-image-container">
          {productWeight && (
            <div className="product-card-weight">
              <Scale className="product-card-weight-icon" />
              <span>{productWeight}</span>
            </div>
          )}
          <img
            className="product-card-image"
            src={productImage}
            alt={product.name}
          />
          <div className="p-grade-stamp">
            <span className="p-grade-letter">{product.grade}</span>
            <span className="p-grade-label">GRADE</span>
          </div>
        </div>
      </Link>

      <div className="product-card-content">
        <Link to={`/products/${product.id}`} className="product-card-name-link">
          <h3 className="product-card-name">{product.name}</h3>
        </Link>

        <p className="product-card-grade">Grade {product.grade}</p>

        <p className="product-card-description">{product.description}</p>

        <div className="product-card-price">
          R{Number(product.price).toLocaleString("en-ZA")}
        </div>

        <div className="product-card-actions">
          <Link
            to={`/products/${product.id}`}
            className="product-card-view-button"
          >
            View Product
          </Link>

          <button
            className="product-card-cart-button"
            type="button"
            onClick={handleAddToCart}
            disabled={addingToCart}
          >
            {addingToCart ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
