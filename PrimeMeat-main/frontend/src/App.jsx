import { useEffect, useState } from "react";
import { Routes, Route, useNavigation } from "react-router-dom";

import api from "./api";

import Home from "./pages/Home";
import Products from "./pages/Products";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import Cart from "./pages/Cart";
import GroupOrders from "./pages/GroupOrders";
import GroupOrderCheckout from "./pages/GroupOrderCheckout";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import AuthPage from "./components/AuthPage";
import PageTransitionLoader from "./components/PageTransitionLoader";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    if (!user) {
      setCartCount(0);
      return;
    }

    try {
      const { data } = await api.get("/api/cart");

      const productQuantity = data.cart.items.reduce(
        (total, item) => total + Number(item.quantity),
        0,
      );

      const groupOrderQuantity = data.cart.group_order ? 1 : 0;

      setCartCount(productQuantity + groupOrderQuantity);
    } catch (error) {
      console.error("Failed to load cart:", error);
      setCartCount(0);
    }
  };

  useEffect(() => {
    api
      .get("/api/user")
      .then(({ data }) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (!checking) {
      fetchCartCount();
    }
  }, [user, checking]);

  const logout = async () => {
    try {
      await api.post("/api/logout");
      setUser(null);
      setCartCount(0);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (checking) {
    return null;
  }

  return (
    <div className="page-container">
      <PageTransitionLoader />
      <Navbar user={user} onLogout={logout} cartCount={cartCount} />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/products"
            element={<Products onCartUpdated={fetchCartCount} />}
          />

          <Route
            path="/products/:id"
            element={<ProductDetailPage onCartUpdated={fetchCartCount} />}
          />

          <Route path="/about" element={<AboutPage />} />

          <Route path="/contact" element={<ContactPage />} />

          <Route path="/group-orders" element={<GroupOrders />} />
          <Route
            path="/group-orders/checkout/:id"
            element={<GroupOrderCheckout />}
          />
          <Route
            path="/cart"
            element={<Cart onCartUpdated={fetchCartCount} />}
          />
          <Route
            path="/login"
            element={
              user ? (
                <section className="auth auth--done">
                  <p>
                    Signed in as <strong>{user.name}</strong> ({user.email})
                  </p>

                  <button type="button" onClick={logout}>
                    Logout
                  </button>
                </section>
              ) : (
                <AuthPage onAuth={setUser} />
              )
            }
          />
        </Routes>
      </main>

      <Chatbot />
      <Footer />
    </div>
  );
}

export default App;
