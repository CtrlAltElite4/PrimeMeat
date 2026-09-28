import {
  FaEnvelope, FaFacebook, FaTwitterSquare, FaLinkedin, FaWhatsapp,
  FaLocationArrow, FaPhoneAlt,
} from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__col">
          <p className="site-footer__logo">[Logo]</p>
          <p className="site-footer__tagline">Making meat purchasing simple and affordable</p>
          <a href="/contact" className="site-footer__contact">
            <FaEnvelope aria-hidden="true" /> Contact Us
          </a>
          <h2 className="site-footer__heading site-footer__heading--socials">Socials</h2>
          <div className="site-footer__socials">
            <a href="#" aria-label="Facebook"><FaFacebook /></a>
            <a href="#" aria-label="Twitter"><FaTwitterSquare /></a>
            <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
            <a href="#" aria-label="WhatsApp"><FaWhatsapp /></a>
          </div>
        </div>

        <div className="site-footer__col site-footer__col--divided">
          <h2 className="site-footer__heading">Explore</h2>
          <ul>
            <li><a href="/shop">Shop</a></li>
            <li><a href="/cutsheet-builder">Cutsheet Builder</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/account">Account</a></li>
            <li><a href="/cart">Cart</a></li>
          </ul>
        </div>

        <div className="site-footer__col site-footer__col--divided">
          <h2 className="site-footer__heading">Support</h2>
          <ul>
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/contact">Contact Us</a></li>
            <li className="site-footer__icon-row"><FaLocationArrow aria-hidden="true" /> [Business address]</li>
            <li className="site-footer__icon-row">
              <FaEnvelope aria-hidden="true" /> <a href="mailto:syrolgroup@gmail.com">syrolgroup@gmail.com</a>
            </li>
            <li className="site-footer__icon-row">
              <FaPhoneAlt aria-hidden="true" /> <a href="tel:+806783445">+80 678 3445</a>
            </li>
          </ul>
        </div>

        <div className="site-footer__col site-footer__col--divided">
          <h2 className="site-footer__heading">Policies</h2>
          <ul>
            <li><a href="/terms">Terms &amp; Conditions</a></li>
            <li><a href="/privacy">Privacy policy</a></li>
            <li><a href="/refunds">Refund policy</a></li>
            <li><a href="/delivery">Delivery Policy</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
