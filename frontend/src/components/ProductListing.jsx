import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "./ProductCard";
import "../styles/ProductListing.css";

function ProductListing() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchParams] = useSearchParams();

  const filter = searchParams.get("filter");
  const search = searchParams.get("search")?.toLowerCase().trim() || "";

  const [category, setCategory] = useState("all");
  const [grade, setGrade] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 0]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch products.");
        }

        return response.json();
      })
      .then((data) => {
        setProducts(data);

        const activeProducts = data.filter(
          (product) => product.is_active === true,
        );

        if (activeProducts.length > 0) {
          const activePrices = activeProducts.map((product) =>
            Number(product.price),
          );

          const minimumPrice = Math.min(...activePrices);
          const maximumPrice = Math.max(...activePrices);

          setPriceRange([minimumPrice, maximumPrice]);
        }

        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const activeProducts = products.filter(
    (product) => product.is_active === true,
  );

  const activePrices = activeProducts.map((product) => Number(product.price));

  const minimumPrice = activePrices.length > 0 ? Math.min(...activePrices) : 0;

  const maximumPrice = activePrices.length > 0 ? Math.max(...activePrices) : 0;

  const handleMinimumPriceChange = (event) => {
    const value = Number(event.target.value);

    setPriceRange((previousRange) => [
      Math.min(value, previousRange[1]),
      previousRange[1],
    ]);
  };

  const handleMaximumPriceChange = (event) => {
    const value = Number(event.target.value);

    setPriceRange((previousRange) => [
      previousRange[0],
      Math.max(value, previousRange[0]),
    ]);
  };

  const resetFilters = () => {
    setCategory("all");
    setGrade("all");
    setPriceRange([minimumPrice, maximumPrice]);
  };

  const filteredProducts = products.filter((product) => {
    let matchesFilter = true;
    let matchesSearch = true;
    let matchesCategory = true;
    let matchesGrade = true;
    let matchesPrice = true;

    const productName = product.name?.toLowerCase() || "";
    const productGrade = product.grade?.toLowerCase() || "";
    const productDescription = product.description?.toLowerCase() || "";
    const productPrice = Number(product.price);

    if (filter === "full-carcass") {
      matchesFilter = productName === "full carcass";
    }

    if (filter === "half-carcass") {
      matchesFilter = productName === "half carcass";
    }

    if (filter === "quarter-carcass") {
      matchesFilter = productName === "quarter carcass";
    }

    if (filter === "group-orders") {
      matchesFilter = false;
    }

    if (search) {
      matchesSearch =
        productName.includes(search) ||
        productGrade.includes(search) ||
        productDescription.includes(search);
    }

    if (category !== "all") {
      matchesCategory = productName === category;
    }

    if (grade !== "all") {
      matchesGrade = productGrade === grade;
    }

    matchesPrice =
      productPrice >= priceRange[0] && productPrice <= priceRange[1];

    return (
      matchesFilter &&
      matchesSearch &&
      matchesCategory &&
      matchesGrade &&
      matchesPrice &&
      product.is_active === true
    );
  });

  if (loading) {
    return (
      <section className="product-listing">
        <p className="product-listing-loading">Loading products...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="product-listing">
        <p className="product-listing-error">{error}</p>
      </section>
    );
  }

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

            <label className="product-filter-option">
              <input
                type="radio"
                name="category"
                checked={category === "all"}
                onChange={() => setCategory("all")}
              />
              <span>All</span>
            </label>

            <label className="product-filter-option">
              <input
                type="radio"
                name="category"
                checked={category === "full carcass"}
                onChange={() => setCategory("full carcass")}
              />
              <span>Full Carcass</span>
            </label>

            <label className="product-filter-option">
              <input
                type="radio"
                name="category"
                checked={category === "half carcass"}
                onChange={() => setCategory("half carcass")}
              />
              <span>Half Carcass</span>
            </label>

            <label className="product-filter-option">
              <input
                type="radio"
                name="category"
                checked={category === "quarter carcass"}
                onChange={() => setCategory("quarter carcass")}
              />
              <span>Quarter Carcass</span>
            </label>
          </div>

          <div className="product-filter-group">
            <h4>Grade</h4>

            <label className="product-filter-option">
              <input
                type="radio"
                name="grade"
                checked={grade === "all"}
                onChange={() => setGrade("all")}
              />
              <span>All</span>
            </label>

            <label className="product-filter-option">
              <input
                type="radio"
                name="grade"
                checked={grade === "a"}
                onChange={() => setGrade("a")}
              />
              <span>A</span>
            </label>

            <label className="product-filter-option">
              <input
                type="radio"
                name="grade"
                checked={grade === "ab"}
                onChange={() => setGrade("ab")}
              />
              <span>AB</span>
            </label>

            <label className="product-filter-option">
              <input
                type="radio"
                name="grade"
                checked={grade === "b"}
                onChange={() => setGrade("b")}
              />
              <span>B</span>
            </label>

            <label className="product-filter-option">
              <input
                type="radio"
                name="grade"
                checked={grade === "c"}
                onChange={() => setGrade("c")}
              />
              <span>C</span>
            </label>
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
              />

              <input
                className="product-price-range"
                type="range"
                min={minimumPrice}
                max={maximumPrice}
                value={priceRange[1]}
                onChange={handleMaximumPriceChange}
              />
            </div>

            <div className="product-price-limits">
              <span>R{minimumPrice.toLocaleString()}</span>
              <span>R{maximumPrice.toLocaleString()}</span>
            </div>
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
        <div className="product-listing-title-container">
          <h2 className="product-listing-title">Our Products</h2>

          <p className="product-listing-description">
            Choose from our quality bulk beef carcass options.
          </p>
        </div>

        <button
          className="product-filter-open-button"
          type="button"
          onClick={() => setFiltersOpen(true)}
        >
          Filters
        </button>
      </div>

      <div className="product-listing-summary">
        <p className="product-listing-count">
          {filteredProducts.length} products
        </p>
      </div>

      <div className="product-listing-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="product-listing-empty">
            <p className="product-listing-empty-message">
              No products available.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductListing;
