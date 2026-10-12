import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import api from "./api";

import Home from "./pages/Home";
import Products from "./pages/Products";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import Cart from "./pages/Cart";
import GroupOrders from "./pages/GroupOrders";
import GroupOrderCheckout from "./pages/GroupOrderCheckout";
import SupportPage from "./pages/SupportPage";
import ArticlePage from "./components/ArticlePage";
import AccountPage from "./pages/AccountPage";
import Checkout from "./pages/Checkout";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import AuthPage from "./components/AuthPage";
import PageTransitionLoader from "./components/PageTransitionLoader";
import ScrollToTop from "./components/ScrollToTop";
import BackToTop from "./components/BackToTop";
import ScrollReveal from "./components/ScrollReveal";

import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import Orders from "./admin/Orders";
import Payments from "./admin/Payments";
import Users from "./admin/Users";
import AdminProducts from "./admin/Products";
import Settings from "./admin/Settings";
import ComingSoon from "./admin/ComingSoon";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const isAccountPage = location.pathname.startsWith("/account");
  // Restore an existing session on page load
  useEffect(() => {
    api
      .get("/api/user")
      .then(({ data }) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

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
    if (!checking) {
      fetchCartCount();
    }
  }, [user, checking]);

  // After login/register: admins go straight to the admin panel
  const handleAuth = (data) => {
    setUser(data);

    if (data.is_admin) {
      navigate("/admin");
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/logout");
      setUser(null);
      setCartCount(0);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (checking) {
    return null;
  }

  const site = (
    <div className="page-container">
      <ScrollToTop />
      <BackToTop />
      <PageTransitionLoader />

      {!isAccountPage && (
        <Navbar user={user} onLogout={logout} cartCount={cartCount} />
      )}

      <main className="main-content">
        <ScrollReveal />
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

          <Route path="/contactpage" element={<ContactPage />} />

          <Route path="/support" element={<SupportPage />} />

          <Route path="/article/:id" element={<ArticlePage />} />

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

                  {user.is_admin && (
                    <p>
                      <Link to="/admin">Open the admin panel</Link>
                    </p>
                  )}

                  <button type="button" onClick={logout}>
                    Logout
                  </button>
                </section>
              ) : (
                <AuthPage onAuth={handleAuth} />
              )
            }
          />
          <Route
            path="/account/addresses/new"
            element={
              user ? (
                <AccountPage
                  user={user}
                  onUserUpdate={setUser}
                  onLogout={logout}
                  initialSection="addresses"
                  openAddAddress
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route path="/checkout" element={<Checkout />} />
          <Route
            path="/account"
            element={
              user ? (
                user.is_admin ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <AccountPage
                    user={user}
                    onUserUpdate={setUser}
                    onLogout={logout}
                  />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </main>

      <Chatbot />
      <Footer />
    </div>
  );

  // The admin panel has its own top bar and sidebar.
  let admin = (
    <AdminLayout user={user} onLogout={logout} onUserUpdate={setUser} />
  );

  if (!user) {
    admin = <Navigate to="/login" replace />;
  } else if (!user.is_admin) {
    admin = <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route path="/admin" element={admin}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<Orders />} />
        <Route path="payments" element={<Payments />} />
        <Route path="users" element={<Users />} />
        <Route
          path="chatbot"
          element={<ComingSoon title="Chatbot content" />}
        />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="/*" element={site} />
    </Routes>
  );
}

export default App;
