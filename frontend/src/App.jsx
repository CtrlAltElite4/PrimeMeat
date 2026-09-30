import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import api from "./api";

import Home from "./pages/Home";
import Products from "./pages/Products";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";

import AuthPage from "./components/AuthPage";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  // Restore an existing session on page load
  useEffect(() => {
    api
      .get("/api/user")
      .then(({ data }) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  const logout = async () => {
    try {
      await api.post("/api/logout");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (checking) {
    return null;
  }

  return (
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