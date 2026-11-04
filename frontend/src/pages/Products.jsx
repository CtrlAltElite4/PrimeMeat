import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import api from "../api";
import ProductListing from "../components/ProductListing";
const categoryFilters = {
  "beef-carcasses": "Beef Carcasses",
  "beef-products": "Beef Products",
  "mutton-products": "Mutton Products",
  "lamb-products": "Lamb Products",
};
function Products({ onCartUpdated }) {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 12,
    total: 0,
    minimumPrice: 0,
    maximumPrice: 0,
    categories: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();

  const filter = searchParams.get("filter") || "";
  const selectedCategory = categoryFilters[filter] || "all";
  const search = searchParams.get("search") || "";
  const urlSort = searchParams.get("sort") || "none";

  const fetchProducts = useCallback(
    async ({
      page = 1,
      perPage = 12,
      category = selectedCategory,
      minPrice = "",
      maxPrice = "",
      sort = urlSort,
    } = {}) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: String(page),
          per_page: String(perPage),
        });

        if (search) params.set("search", search);
        if (category !== "all") params.set("category", category);
        if (minPrice !== "") params.set("min_price", String(minPrice));
        if (maxPrice !== "") params.set("max_price", String(maxPrice));
        if (sort !== "none") params.set("sort", sort);

        const { data } = await api.get(`/api/products?${params.toString()}`);

        setProducts(data.data || []);

        setPagination({
          currentPage: Number(data.current_page || 1),
          lastPage: Number(data.last_page || 1),
          perPage: Number(data.per_page || perPage),
          total: Number(data.total || 0),
          minimumPrice: Number(data.minimum_price || 0),
          maximumPrice: Number(data.maximum_price || 0),
          categories: data.categories || [],
        });
      } catch (requestError) {
        console.error("Product fetch error:", requestError);

        setError(
          requestError.response?.data?.message ||
            "Unable to load products. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    [filter, search, urlSort],
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (error) {
    return (
      <section className="product-listing">
        <p className="product-listing-error">{error}</p>

        <button type="button" onClick={() => fetchProducts()}>
          Try Again
        </button>
      </section>
    );
  }

  return (
    <ProductListing
      products={products}
      pagination={pagination}
      loading={loading}
      onProductsFetch={fetchProducts}
      onCartUpdated={onCartUpdated}
    />
  );
}

export default Products;
