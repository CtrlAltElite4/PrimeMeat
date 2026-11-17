import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

// Pop-up shown at the top of the screen, so it isn't mistaken for part of the cut sheet.
// Green for "added to cart" (closes itself after 5 seconds), red for problems (stays until closed).
export default function CartToast({ message, type, onClose }) {
  const success = type === "success";

  useEffect(() => {
    if (!success) return undefined;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [success, message, onClose]);

  // Rendered straight into <body> so page animations (which can move "fixed"
  // elements) can't push it out of view.
  return createPortal(
    <div
      role={success ? "status" : "alert"}
      style={{
        position: "fixed",
        top: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 2000,
        width: "min(92vw, 520px)",
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 20px",
        borderRadius: 12,
        background: success ? "#1f7a3a" : "#b42318",
        color: "#fff",
        fontSize: "1.1rem",
        fontWeight: 700,
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.25)",
      }}
    >
      <span aria-hidden="true" style={{ fontSize: "1.4rem" }}>
        {success ? "\u2713" : "!"}
      </span>
      <span style={{ flex: 1 }}>{message}</span>
      {success && (
        <Link to="/cart" style={{ color: "#fff", textDecoration: "underline", whiteSpace: "nowrap" }}>
          View cart
        </Link>
      )}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close message"
        style={{ background: "none", border: 0, color: "#fff", fontSize: "1.5rem", cursor: "pointer", lineHeight: 1 }}
      >
        &times;
      </button>
    </div>,
    document.body,
  );
}
