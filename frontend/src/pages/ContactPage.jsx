import "../css/ContactPage.css";
import "../css/AboutPage.css";
import EmailImage from "../assets/EmailImage.jpg";
//import SocialMediaImage from '../assets/OnlineMedia.png'
import PhoneImage from "../assets/PhoneImage.jpg";
import WhatsAppImage from "../assets/WhatsAppFinalImage.jpg";
//import Navbar from './AboutPage';
import ContactForm from "../components/ContactForm.jsx";


function ContactPage() {
  return (
    <>
      <section className="AboutHeroFinal">
        <h1 className="AboutHeroTitle">Contact Us</h1>

        <p className="AboutHeroPhrase" id="ContactPhrase">
          Come visit us, or contact us with any enquiries
        </p>
      </section>

      <section className="Map-Contact" id="MapLo">
        <div className="MapBack">
          <h1 className="MapTitle">Store Location</h1>
          <div className="StoreMap">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3218.898383225604!2d29.204229575308624!3d-23.674807376224727!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ec710e945c54451%3A0xb1805b6434b3cc94!2sMoletji%2C%200709!5e0!3m2!1sen!2sza!4v1792445005166!5m2!1sen!2sza" 
              height="300"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            ></iframe>
          </div>

          <h3 class="StoreDays" id="StoreDetails">
            <span className="Bolder">Days:</span> Mon-Fri
          </h3>
          <h3 class="StoreHours" id="StoreDetails">
            <span className="Bolder">Hours:</span> 08:00-17:00
          </h3>
          <h3 class="StoreAddress" id="StoreDetails">
            <span className="Bolder">Location:</span>  Moletši Mošate Village, 
            Polokwane, Limpopo, 0709
          </h3>
        </div>

        <ContactForm />
      </section>

      <section className="Contacted">
        <div className="WhatsAppBox">
          <img src={WhatsAppImage} className="WApp" />
          <h3 className=" ContactTitle">WhatsApp us</h3>
          <p className="ContactDetails"> +27 83 448 8404</p>
        </div>

        <div className="WhatsAppBox">
          <img src={PhoneImage} className="WApp" id="PApp" />
          <h3 className=" ContactTitle">Phone us</h3>
          <p className="ContactDetails" id="PhoneContact">
          +27 83 448 8404
          </p>
        </div>

        <div className="WhatsAppBox">
          <img src={EmailImage} className="WApp" id="EApp" />
          <h3 className=" ContactTitle" id="ETitle">
            Email us
          </h3>
          <p className="ContactDetails" id="EmailContact">
            Moloto@syrol.co.za
          </p>
        </div>
      </section>

      {/*
     <div className = "Mid">
<p className ="Hero" id="Footer">Footer</p>
    </div>

    */}
    </>
  );
}

export default ContactPage;
