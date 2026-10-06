import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import api from "../api";

import ProductDetail from "../components/ProductDetail";

import "../styles/ProductDetail.css";

function ProductDetailPage({ onCartUpdated }) {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/api/products/${id}`);

        setProduct(response.data);
      } catch (err) {
        console.error("Error loading product:", err);
        setError("Unable to load this product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <section className="product-detail-status">
        <p>Loading product...</p>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="product-detail-status">
        <p>{error || "Product not found."}</p>
      </section>
    );
  }

  return <ProductDetail product={product} onCartUpdated={onCartUpdated} />;
}

export default ProductDetailPage;
