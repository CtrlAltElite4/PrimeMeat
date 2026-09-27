import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import ProductCard from "./ProductCard";
import "../styles/FeaturedProducts.css";

function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch products.");
        }

        return response.json();
      })
      .then((data) => {
        setProducts(data.slice(0, 4));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Featured products error:", error);
        setLoading(false);
      });
  }, []);

  return (
    <section className="featured-products">
      <div className="featured-products-header">
        <h2 className="featured-products-title">Featured Products</h2>

        <p className="featured-products-description">
          Premium butcher selected products you shouldn't miss.
        </p>
      </div>

      <div className="featured-products-grid">
        {loading ? (
          <p className="featured-products-message">Loading products...</p>
        ) : products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p className="featured-products-message">
            No featured products available.
          </p>
        )}
      </div>

      <div className="featured-products-button-container">
        <NavLink className="featured-products-button" to="/products">
          View All Products
        </NavLink>
      </div>
    </section>
  );
}

export default FeaturedProducts;
