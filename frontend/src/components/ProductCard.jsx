import { NavLink } from "react-router-dom";

function ProductCard({ product }) {
  return (
    <article className="product-card">
      <div className="product-card-image-container">
        <img
          className="product-card-image"
          src={product.image}
          alt={product.name}
        />
      </div>

      <div className="product-card-content">
        <h3 className="product-card-name">{product.name}</h3>

        <div className="product-card-grade">
          <span className="product-card-grade-label">Grade</span>

          <span className="product-card-grade-value">{product.grade}</span>
        </div>

        <p className="product-card-description">{product.description}</p>

        <div className="product-card-price">
          <span className="product-card-price-value">R{product.price}</span>
        </div>

        <div className="product-card-actions">
          <NavLink
            className="product-card-view-button"
            to={`/products/${product.id}`}
          >
            View Product
          </NavLink>

          <button className="product-card-cart-button" type="button">
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
