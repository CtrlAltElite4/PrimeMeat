import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import "../styles/FeaturedProducts.css";

function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const [fullResponse, halfResponse, quarterResponse] = await Promise.all(
          [
            fetch(
              "http://127.0.0.1:8000/api/products?category=full%20carcass&per_page=1",
            ),
            fetch(
              "http://127.0.0.1:8000/api/products?category=half%20carcass&per_page=1",
            ),
            fetch(
              "http://127.0.0.1:8000/api/products?category=quarter%20carcass&per_page=1",
            ),
          ],
        );

        if (!fullResponse.ok || !halfResponse.ok || !quarterResponse.ok) {
          throw new Error("Failed to fetch featured products.");
        }

        const fullData = await fullResponse.json();
        const halfData = await halfResponse.json();
        const quarterData = await quarterResponse.json();

        setProducts(
          [fullData.data[0], halfData.data[0], quarterData.data[0]].filter(
            Boolean,
          ),
        );

        setLoading(false);
      } catch (error) {
        console.error("Featured products error:", error);
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
          Premium butcher selected products you shouldn't miss.
        </p>
      </div>

      <div className="featured-products-grid">
        {loading ? (
          <p className="featured-products-message">Loading products...</p>
        ) : (
          <>
            {products.map((product) => (
              <article className="featured-product-card" key={product.id}>
                <Link
                  to={`/products/${product.id}`}
                  className="featured-product-image-link"
                  aria-label={`View ${product.name}`}
                >
                  <div className="featured-product-image-container">
                    <img
                      className="featured-product-image"
                      src={
                        product.name.toLowerCase().includes("full")
                          ? "/images/full-carcasss.png"
                          : product.name.toLowerCase().includes("half")
                            ? "/images/half-carcasss.png"
                            : "/images/quarter-carcasss.png"
                      }
                      alt={product.name}
                    />
                    <div className="f-grade-stamp">
                      <span className="f-grade-letter">{product.grade}</span>
                      <span className="f-grade-label">GRADE</span>
                    </div>
                  </div>
                </Link>

                <div className="featured-product-content">
                  <Link
                    to={`/products/${product.id}`}
                    className="featured-product-name-link"
                  >
                    <h3 className="featured-product-name">{product.name}</h3>
                  </Link>

                  <div className="featured-product-grade">
                    <span>Grade</span>
                    <strong>{product.grade}</strong>
                  </div>

                  <p className="featured-product-description">
                    {product.description}
                  </p>

                  <div className="featured-product-price">R{product.price}</div>

                  <NavLink
                    className="featured-product-button"
                    to={`/products/${product.id}`}
                  >
                    View Product
                  </NavLink>
                </div>
              </article>
            ))}

            <article className="featured-product-card featured-group-order-card">
              <div className="featured-product-image-container">
                <img
                  className="featured-product-image"
                  src="/images/group-order.jpg"
                  alt="Group Orders"
                />
              </div>

              <div className="featured-product-content">
                <h3 className="featured-product-name">Group Orders</h3>

                <p className="featured-product-description">
                  Buy beef together with your group and have the meat divided as
                  evenly as possible among the members.
                </p>

                <div className="featured-group-order-info">2–8 People</div>

                <NavLink className="featured-product-button" to="/group-orders">
                  Shop Group Orders
                </NavLink>
              </div>
            </article>
          </>
        )}

        {!loading && products.length === 0 && (
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
