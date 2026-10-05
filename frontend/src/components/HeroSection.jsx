import { NavLink } from "react-router-dom";
import "../styles/HeroSection.css";

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-overlay">
        <div className="hero-content">
          <div className="hero-heading">
            <span className="hero-small-text">BEST</span>

            <h1 className="hero-title">QUALITY MEAT</h1>

            <span className="hero-small-text">DELIVERED</span>
          </div>

          <p className="hero-description">
            We offer the best meats delivered where you are. Shop with us today,
            <br />
            for that excellent service.
          </p>

          <NavLink className="hero-button" to="/products">
            Shop Now
          </NavLink>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
