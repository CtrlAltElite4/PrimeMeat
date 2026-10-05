import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";

import api from "./api";

import Home from "./pages/Home";
import Products from "./pages/Products";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";

import AuthPage from "./components/AuthPage";

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
  const navigate = useNavigate();

  // Restore an existing session on page load
  useEffect(() => {
    api
      .get("/api/user")
      .then(({ data }) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  // After login/register: admins go straight to the admin panel
  const handleAuth = (data) => {
    setUser(data);
    if (data.is_admin) navigate("/admin");
  };

  const logout = async () => {
    try {
      await api.post("/api/logout");
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (checking) {
    return null;
  }

  // The shop: Navbar, page, Chatbot, Footer (unchanged from before)
  const site = (
    <div className="page-container">
      <Navbar />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/products" element={<Products />} />

          <Route path="/about" element={<AboutPage />} />

          <Route path="/contact" element={<ContactPage />} />

          <Route
            path="/login"
            element={
              user ? (
                <section className="auth auth--done">
                  <p>
                    Signed in as <strong>{user.name}</strong> (
                    {user.email})
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
        </Routes>
      </main>

      <Chatbot />

      <Footer />
    </div>
  );

  // The admin panel has its own top bar and sidebar, so it sits outside the shop layout.
  // Hiding it here is only for convenience; Laravel's 'admin' middleware is the real protection.
  let admin = <AdminLayout user={user} onLogout={logout} onUserUpdate={setUser}/>;
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
        <Route path="chatbot" element={<ComingSoon title="Chatbot content" />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="/*" element={site} />
    </Routes>
  );
}

export default App;