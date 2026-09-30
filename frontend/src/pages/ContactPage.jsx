import '../css/ContactPage.css'
import '../css/AboutPage.css'
import EmailImage from '../assets/EmailImage.png';
//import SocialMediaImage from '../assets/OnlineMedia.png'
import PhoneImage from '../assets/PhoneImage.png'
import WhatsAppImage from '../assets/WhatsAppFinalImage.jpg';
//import Navbar from './AboutPage';
import ContactForm from '../components/ContactForm.jsx'



function ContactPage(){
   
return (
<>


    <section className ="AboutHeroFinal">

<h1 className ="AboutHeroTitle">Contact Us</h1>
  
    <p className ="AboutHeroPhrase" id ="ContactPhrase" >Come visit us, or contact us with any enquiries
        </p>
    
    </section>

     <section className ="Map-Contact" id ="MapLo">
    <div className ="MapBack">
    <h1 className ="MapTitle">Store Location</h1>
<div className = "StoreMap">
    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14359.694567077231!2d28.126758455152828!3d-25.871990436521003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e95617664507743%3A0x5d4a89161a6a3e5d!2sMall%40Reds%20Shopping%20Centre!5e0!3m2!1sen!2sza!4v1790245629412!5m2!1sen!2sza" 
    width="400" 
    height="300" 
    style={{border:0}} 
    allowfullscreen="" 
    loading="lazy" 
    referrerpolicy="strict-origin-when-cross-origin">
    </iframe>
    </div>

    <h3 class ="StoreDays" id ="StoreDetails"><span className ="Bolder">Days:</span>  Mon-Fri</h3>
    <h3 class ="StoreHours" id ="StoreDetails"><span className ="Bolder">Hours:</span>  08:00-17:00</h3>
    <h3 class ="StoreAddress" id ="StoreDetails"><span className ="Bolder">Location:</span>   Cnr Hendrik Verwoerd Drive &, Rooihuiskraal Rd, Rooihuiskraal Ext 15, Centurion, 0157</h3>
   </div> 

<ContactForm />
   
    </section>

 
<section className ="Contacted">
<div className ="WhatsAppBox">
<img src = {WhatsAppImage} className ="WApp" />
<h3 className =" ContactTitle">WhatsApp us</h3>
<p className ="ContactDetails">078-557-9056</p>
</div>

<div className ="WhatsAppBox">
<img src = {PhoneImage} className ="WApp" id ="PApp" />
<h3 className =" ContactTitle">Phone us</h3>
<p className ="ContactDetails" id="PhoneContact" >078-557-9056</p>
</div>

<div className ="WhatsAppBox">
<img src = {EmailImage} className ="WApp" id ="EApp" />
<h3 className =" ContactTitle" id ="ETitle">Email us</h3>
<p className ="ContactDetails" id ="EmailContact">thabangd.letsoalo@gmail.com</p>
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


export default ContactPage