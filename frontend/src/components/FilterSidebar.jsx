import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

const FilterSidebar = forwardRef(function FilterSidebar(
  { pagination, onProductsFetch },
  ref,
) {
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  useImperativeHandle(ref, () => ({
    fetchWithFilters,
  }));

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

    onProductsFetch({
      page: 1,
      perPage: pagination.perPage,
      category: "all",
      grade: "all",
      minPrice: "",
      maxPrice: "",
    });
  };

  return (
    <>
      <button
        className="product-filter-open-button"
        type="button"
        onClick={() => setFiltersOpen(true)}
      >
        Filters
      </button>

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
            <h4>Grade</h4>

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
    </>
  );
});

export default FilterSidebar;
