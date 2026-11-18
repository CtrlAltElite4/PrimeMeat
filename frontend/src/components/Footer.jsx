//import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-column">
          <img className="footer-logo" src="/images/logo.png" alt="PrimeMeat" />

          <p className="footer-tagline">
            Making meat purchasing simple and affordable
          </p>

          <NavLink to="/contact" className="footer-button">
            Contact Us
          </NavLink>
        </div>

        <div className="footer-column">
          <h4>Explore</h4>

          <ul>
            <li>
              <NavLink to="/products">Shop</NavLink>
            </li>

            <li>
              <NavLink to="/about">About</NavLink>
            </li>

            <li>
              <NavLink to="/login">Account</NavLink>
            </li>

            <li>
              <NavLink to="/cart">Cart</NavLink>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Support</h4>

          <ul>
            <li>
              <NavLink to="/support">FAQ</NavLink>
            </li>

            <li>
              <NavLink to="/contact">Contact Us</NavLink>
            </li>

            <li>
              <a href="mailto:Moloto@syrol.co.za">Moloto@syrol.co.za</a>
            </li>

            <li>
              <a href="tel:+27834488404">+27 83 448 8404</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
