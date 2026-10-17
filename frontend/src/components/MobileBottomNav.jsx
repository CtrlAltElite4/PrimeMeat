import { NavLink } from "react-router-dom";
import { House, ShoppingBag, ShoppingCart, UserRound } from "lucide-react";
import "../styles/MobileBottomNav.css";

const navItems = [
  { label: "Home", path: "/", icon: House, end: true },
  { label: "Shop", path: "/products", icon: ShoppingBag },
  { label: "Cart", path: "/cart", icon: ShoppingCart },
  { label: "Account", path: "/account", icon: UserRound },
];

export default function MobileBottomNav({ cartCount = 0 }) {
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {navItems.map(({ label, path, icon: Icon, end }) => (
        <NavLink
          key={label}
          to={path}
          end={end}
          className={({ isActive }) =>
            `mobile-bottom-nav__link${isActive ? " active" : ""}`
          }
          aria-label={label}
          title={label}
        >
          <span className="mobile-bottom-nav__icon">
            <Icon size={23} strokeWidth={1.8} aria-hidden="true" />

            {label === "Cart" && cartCount > 0 && (
              <span className="mobile-bottom-nav__cart-count">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </span>

          <span className="mobile-bottom-nav__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
