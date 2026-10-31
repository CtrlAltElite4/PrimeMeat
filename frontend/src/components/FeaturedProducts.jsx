import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import api from "../api";

import "../styles/Home.css";

function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const categories = [
          "beef-carcasses",
          "beef-products",
          "mutton-products",
          "lamb-products",
        ];

        const responses = await Promise.all(
          categories.map((category) =>
            api.get(
              `/api/products?filter=${encodeURIComponent(category)}&per_page=1`,
            ),
          ),
        );

        setProducts(
          responses.map((response) => response.data.data?.[0]).filter(Boolean),
        );
      } catch (error) {
        console.error("Featured products error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <section className="featured-products">
      <div className="featured-products-header">
        <h2 className="featured-products-title">Featured Products</h2>

        <p className="featured-products-description">
          Discover quality beef, mutton and lamb products selected for you.
        </p>
      </div>

      <div className="featured-products-grid">
        {loading ? (
          <p className="featured-products-message">Loading products...</p>
        ) : products.length > 0 ? (
          products.map((product) => {
            const grade = product.grade || product.variants?.[0]?.grade;
            const image = product.image;

            return (
              <article className="featured-product-card" key={product.id}>
                <Link
                  to={`/products/${product.id}`}
                  className="featured-product-image-link"
                  aria-label={`View ${product.name}`}
                >
                  <div className="featured-product-image-container">
                    <img
                      className="featured-product-image"
                      src={image || "/images/hero-meat.jpg"}
                      alt={product.name}
                    />

                    {grade && (
                      <div className="f-grade-stamp">
                        <span className="f-grade-letter">{grade}</span>
                        <span className="f-grade-label">GRADE</span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="featured-product-content">
                  <Link
                    to={`/products/${product.id}`}
                    className="featured-product-name-link"
                  >
                    <h3 className="featured-product-name">{product.name}</h3>
                  </Link>

                  {grade && (
                    <div className="featured-product-grade">
                      <span>Grade</span>
                      <strong>{grade}</strong>
                    </div>
                  )}

                  <p className="featured-product-description">
                    {product.description || "Quality meat from PrimeMeat."}
                  </p>

                  <div className="featured-product-price">
                    {product.product_type === "carcass" &&
                    product.variants?.length
                      ? `From R${Math.min(
                          ...product.variants
                            .filter((variant) => variant.is_active)
                            .map((variant) => Number(variant.price)),
                        ).toLocaleString("en-ZA")}`
                      : `R${Number(product.price || 0).toLocaleString("en-ZA", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`}
                  </div>

                  <NavLink
                    className="featured-product-button"
                    to={`/products/${product.id}`}
                  >
                    View Product
                  </NavLink>
                </div>
              </article>
            );
          })
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
