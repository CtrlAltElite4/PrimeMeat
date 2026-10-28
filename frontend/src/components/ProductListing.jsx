import { useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import FilterSidebar from "./FilterSidebar";
import "../styles/ProductListing.css";

function ProductListing({
  products,
  pagination,
  loading,
  onProductsFetch,
  onCartUpdated,
}) {

  const [searchParams] = useSearchParams();

  
  const filter = searchParams.get("filter");
  const search = searchParams.get("search")?.toLowerCase().trim() || "";


  const filterSidebarRef = useRef(null);


  const handlePageChange = (page) => {
    if (
      page < 1 ||
      page > pagination.lastPage ||
      page === pagination.currentPage
    ) {
      return;
    }

    filterSidebarRef.current.fetchProducts({page});
    
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handlePerPageChange = (event) => {
    const perPage = Number(event.target.value);
    filterSidebarRef.current.fetchProducts({page: 1, perPage});
  };

  const getPageNumbers = () => {
    const pages = [];

    for (let page = 1; page <= pagination.lastPage; page += 1) {
      if (
        page === 1 ||
        page === pagination.lastPage ||
        Math.abs(page - pagination.currentPage) <= 1
      ) {
        pages.push(page);
      } else if (
        page === pagination.currentPage - 2 ||
        page === pagination.currentPage + 2
      ) {
        pages.push("...");
      }
    }

    return pages.filter(
      (page, index) => page !== "..." || pages[index - 1] !== "...",
    );
  };

  return (
     <section className="product-listing">
      <div className="product-listing-header">
        <FilterSidebar
          ref={filterSidebarRef}
          pagination={pagination}
          onProductsFetch={onProductsFetch}
        />

        <div className="product-listing-title-container">
          <h2 className="product-listing-title">Our Products</h2>

          <p className="product-listing-description">
            Choose from our quality bulk beef carcass options.
          </p>
        </div>
      </div>

      <div className="group-orders-promo">
        <div className="group-orders-promo-content">
          <span className="group-orders-promo-label">BUYING TOGETHER?</span>

          <h3>Good meat is better shared.</h3>

          <p>
            Share a beef carcass with family or friends and divide the
            traditional cuts among your group.
          </p>

          <Link to="/group-orders" className="group-orders-promo-button">
            Explore Group Orders
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      <div className="product-listing-summary">
        <p className="product-listing-count">{pagination.total} products</p>
      </div>

      {loading ? (
        <div className="product-listing-loading">
          <p>Loading products...</p>
        </div>
      ) : (
        <>
          <div className="product-listing-grid">
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onCartUpdated={onCartUpdated}
                />
              ))
            ) : (
              <div className="product-listing-empty">
                <p className="product-listing-empty-message">
                  No products available.
                </p>
              </div>
            )}
          </div>

          {pagination.lastPage > 1 && (
            <div className="products-pagination-container">
              <div className="products-per-page">
                <label
                  className="products-per-page-label"
                  htmlFor="products-per-page"
                >
                  Products per page
                </label>

                <select
                  id="products-per-page"
                  className="products-per-page-select"
                  value={pagination.perPage}
                  onChange={handlePerPageChange}
                >
                  <option value="8">8</option>
                  <option value="12">12</option>
                  <option value="16">16</option>
                  <option value="24">24</option>
                </select>
              </div>

              <div className="products-pagination">
                <button
                  className="products-pagination-button"
                  type="button"
                  disabled={pagination.currentPage === 1}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                  Previous
                </button>

                {getPageNumbers().map((page, index) =>
                  page === "..." ? (
                    <span
                      className="products-pagination-ellipsis"
                      key={`ellipsis-${index}`}
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      className={`products-pagination-button ${
                        page === pagination.currentPage ? "active" : ""
                      }`}
                      type="button"
                      key={page}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  className="products-pagination-button"
                  type="button"
                  disabled={pagination.currentPage === pagination.lastPage}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default ProductListing;
