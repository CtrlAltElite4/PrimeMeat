import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import ProductListing from "../components/ProductListing";

function Products({ onCartUpdated }) {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 12,
    total: 0,
    minimumPrice: 0,
    maximumPrice: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams] = useSearchParams();

  const filter = searchParams.get("filter") || "";
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "none";

  const fetchProducts = async ({
    page = 1,
    perPage = 12,
    category = "all",
    grade = "all",
    minPrice = "",
    maxPrice = "",
    sort = "none",
  } = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      params.set("page", page);
      params.set("per_page", perPage);

      if (filter) {
        params.set("filter", filter);
      }

      if (search) {
        params.set("search", search);
      }

      if (category !== "all") {
        params.set("category", category);
      }

      if (grade !== "all") {
        params.set("grade", grade);
      }

      if (minPrice !== "") {
        params.set("min_price", minPrice);
      }

      if (maxPrice !== "") {
        params.set("max_price", maxPrice);
      }
      if (sort !== "none") {
        params.set("sort", sort);
      }
      const response = await fetch(
        `http://127.0.0.1:8000/api/products?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products.");
      }

      const data = await response.json();

      console.log("Products API response:", data);

      setProducts(data.data);

      setPagination({
        currentPage: data.current_page,
        lastPage: data.last_page,
        perPage: data.per_page,
        total: data.total,
        minimumPrice: data.minimum_price,
        maximumPrice: data.maximum_price,
      });
    } catch (error) {
      console.error("Product fetch error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filter, search]);

  if (error) {
    return (
      <section className="product-listing">
        <p className="product-listing-error">{error}</p>
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
