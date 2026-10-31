import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import "../styles/ProductListing.css";

function ProductListing({
  products,
  pagination,
  loading,
  onProductsFetch,
  onCartUpdated,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchParams] = useSearchParams();

  const filter = searchParams.get("filter");
  const search = searchParams.get("search")?.toLowerCase().trim() || "";

  const [category, setCategory] = useState("all");
  const [grade, setGrade] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 0]);
  const [priceFilterActive, setPriceFilterActive] = useState(false);
  const [sort, setSort] = useState("none");

  const minimumPrice = pagination.minimumPrice || 0;
  const maximumPrice = pagination.maximumPrice || 0;

  useEffect(() => {
    setPriceRange([minimumPrice, maximumPrice]);
    setPriceFilterActive(false);
  }, [minimumPrice, maximumPrice]);

  const fetchWithFilters = ({
    newCategory = category,
    newGrade = grade,
    newPriceRange = priceRange,
    newPriceFilterActive = priceFilterActive,
    newSort = sort,
    page = 1,
    perPage = pagination.perPage,
  } = {}) => {
    onProductsFetch({
      page,
      perPage,
      category: newCategory,
      grade: newGrade,
      minPrice: newPriceFilterActive ? newPriceRange[0] : "",
      maxPrice: newPriceFilterActive ? newPriceRange[1] : "",
      sort: newSort,
    });
  };

  const handleCategoryChange = (value) => {
    setCategory(value);

    fetchWithFilters({
      newCategory: value,
      page: 1,
    });
  };

  const handleGradeChange = (value) => {
    setGrade(value);

    fetchWithFilters({
      newGrade: value,
      page: 1,
    });
  };

  const handleMinimumPriceChange = (event) => {
    const value = Number(event.target.value);

    setPriceRange((previousRange) => [
      Math.min(value, previousRange[1]),
      previousRange[1],
    ]);

    setPriceFilterActive(true);
  };

  const handleMaximumPriceChange = (event) => {
    const value = Number(event.target.value);

    setPriceRange((previousRange) => [
      previousRange[0],
      Math.max(value, previousRange[0]),
    ]);

    setPriceFilterActive(true);
  };

  const applyPriceFilter = () => {
    fetchWithFilters({
      newPriceRange: priceRange,
      newPriceFilterActive: true,
      page: 1,
    });
  };

  const resetFilters = () => {
    setCategory("all");
    setGrade("all");
    setPriceRange([minimumPrice, maximumPrice]);
    setPriceFilterActive(false);
    setSort("none");

    onProductsFetch({
      page: 1,
      perPage: pagination.perPage,
      category: "all",
      grade: "all",
      minPrice: "",
      maxPrice: "",
      sort: "none",
    });
  };

  const handlePageChange = (page) => {
    if (
      page < 1 ||
      page > pagination.lastPage ||
      page === pagination.currentPage
    ) {
      return;
    }

    fetchWithFilters({
      page,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handlePerPageChange = (event) => {
    const perPage = Number(event.target.value);

    fetchWithFilters({
      page: 1,
      perPage,
    });
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
      <div
        className={`product-filter-overlay ${
          filtersOpen ? "product-filter-overlay-open" : ""
        }`}
        onClick={() => setFiltersOpen(false)}
      />

      <aside
        className={`product-filter-sidebar ${
          filtersOpen ? "product-filter-sidebar-open" : ""
        }`}
      >
        <div className="product-filter-sidebar-header">
          <h3>Filters</h3>

          <button
            className="product-filter-close"
            type="button"
            onClick={() => setFiltersOpen(false)}
            aria-label="Close filters"
          >
            ×
          </button>
        </div>

        <div className="product-filter-sidebar-content">
          <div className="product-filter-group">
            <h4>Category</h4>

            {[
              ["all", "All"],
              ["full carcass", "Full Carcass"],
              ["half carcass", "Half Carcass"],
              ["quarter carcass", "Quarter Carcass"],
            ].map(([value, label]) => (
              <label className="product-filter-option" key={value}>
                <input
                  type="radio"
                  name="category"
                  checked={category === value}
                  onChange={() => handleCategoryChange(value)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>

          <div className="product-filter-group">
            <h4>Beef Grade</h4>

            {[
              ["all", "All"],
              ["a", "A"],
              ["ab", "AB"],
              ["b", "B"],
              ["c", "C"],
            ].map(([value, label]) => (
              <label className="product-filter-option" key={value}>
                <input
                  type="radio"
                  name="grade"
                  checked={grade === value}
                  onChange={() => handleGradeChange(value)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>

          <div className="product-filter-group">
            <h4>Price</h4>

            <div className="product-price-values">
              <span>R{priceRange[0].toLocaleString()}</span>
              <span>R{priceRange[1].toLocaleString()}</span>
            </div>

            <div className="product-price-slider">
              <input
                className="product-price-range"
                type="range"
                min={minimumPrice}
                max={maximumPrice}
                value={priceRange[0]}
                onChange={handleMinimumPriceChange}
                onMouseUp={applyPriceFilter}
                onTouchEnd={applyPriceFilter}
              />

              <input
                className="product-price-range"
                type="range"
                min={minimumPrice}
                max={maximumPrice}
                value={priceRange[1]}
                onChange={handleMaximumPriceChange}
                onMouseUp={applyPriceFilter}
                onTouchEnd={applyPriceFilter}
              />
            </div>

            <div className="product-price-limits">
              <span>R{minimumPrice.toLocaleString()}</span>
              <span>R{maximumPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="product-filter-group">
            <h4>Sort By</h4>

            {[
              ["none", "Default"],
              ["price-low-high", "Price: Low to High"],
              ["price-high-low", "Price: High to Low"],
            ].map(([value, label]) => (
              <label className="product-filter-option" key={value}>
                <input
                  type="radio"
                  name="sort"
                  checked={sort === value}
                  onChange={() => {
                    setSort(value);

                    fetchWithFilters({
                      newSort: value,
                      page: 1,
                    });
                  }}
                />

                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="product-filter-sidebar-footer">
          <button
            className="product-filter-clear-button"
            type="button"
            onClick={resetFilters}
          >
            Clear All
          </button>

          <button
            className="product-filter-done-button"
            type="button"
            onClick={() => setFiltersOpen(false)}
          >
            Done
          </button>
        </div>
      </aside>

      <div className="product-listing-header">
        <button
          className="product-filter-open-button"
          type="button"
          onClick={() => setFiltersOpen(true)}
        >
          Filters
        </button>

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
