import ContactSuccess from '../assets/ContactSucImage3.png';
import {useState} from 'react';
import '../css/ContactPage.css'
import '../css/AboutPage.css'
import api from '../api';
//import { FaUserCircle, FaEnvelope,} from "react-icons/fa";

/*
function Field({ icon: Icon, error, children }) {
  return (
    <div className="field">
      <div className={`field__box${error ? " field__box--error" : ""}`}>
        <Icon className="field__icon" aria-hidden="true" />
        {children}
      </div>
      {error && <p className="field__error">{error}</p>}
    </div>
  );
}
  */

function ContactForm(){
const [submit, setSubmit] = useState({
fName: '',
lName: '',
email: '',
message: ''
});

const [status, setStatus] = useState('');
const [errors, setErrors] = useState({names: '', email: '', message: ''});

const handleChange = (e)=> {
    const {name, value} = e.target;
    setSubmit({ ...submit, [name]:value}); 


const errorKey = name ==="fName" || name === "lName" ? "names" : name;
setErrors((prev) => ({...prev, [errorKey]: ''}));
};

const validate = () => {
    const newErrors = {names: '', email: '', message: ''};

     if (!submit.fName.trim() || !submit.lName.trim()) {
      newErrors.names = 'Please enter both your first and last name.';
    }

    if (!submit.email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^\S+@\S+\.\S+$/.test(submit.email)) {
      newErrors.email = 'Please enter a valid email, like name@example.com.';
    }

    if (submit.message.trim().length < 10) {
      newErrors.message = 'Please write a message of at least 10 characters.';
    }

    setErrors(newErrors);
    return !newErrors.names && !newErrors.email && !newErrors.message;
  };


const handleSubmit = async (e) => {
e.preventDefault();
setStatus('');

if (!validate()) return;
setStatus('Sending');


try {
    
    await api.get('/sanctum/csrf-cookie');
    const { data: result } = await api.post('/api/contact', submit);

    if (result.success) {
        setStatus('sent');
        setSubmit({ fName: '', lName: '', email: '', message: '' });
    } else {
        setStatus('error');
    }
        } catch
         {
            setStatus('error');
        }
    };
    
    
    return(
        <>
    <div className ="ContactBox">
<h1 className ="ContactBoxTitle" >Message Us</h1>

<form className = "ContactInputs" onSubmit = {handleSubmit} noValidate>
   

<input type ="text" 
name ="fName"
className ="ContactFName" 
placeholder ="First Name" 
value ={submit.fName}
onChange = {handleChange}
required />



<label>
<input type ="text" 
name ="lName"
className ="ContactLName" 
placeholder ="Last Name" 
value ={submit.lName}
onChange ={handleChange}
required
/>
</label>

{errors.names && <p className = "FieldError">{errors.names}</p>}

<label>
<input type ="email"
name ="email" 
className ="ContactEmail" 
placeholder ="Email" 
value ={submit.email}
onChange ={handleChange}
required />
</label>

{errors.email && <p className="FieldError">{errors.email}</p>}

<label>
<textarea
className ="ContactMessage" 
name ="message"
placeholder ="Message" 
value ={submit.message}
onChange ={handleChange} 
required
/>
</label>

 {errors.message && <p className="FieldError">{errors.message}</p>}

<label>
<button type ="submit" className ="SubmitMessage">Submit Message</button>
{status === 'sent' && <div className ="SuccessFul">
    <img src ={ContactSuccess} className ="SuccessImage" />
    <p className ="Sent">Message Sent!</p>
    <p className ="SuccessParagraph1">Your message has been sent.</p>
    <p className ="SuccessParagraph2">We'll be in touch soon.</p>
    </div>}
{status === 'error' && <p className ="Error">Message could not be sent</p>}
</label>
</form>
</div>
   </>
    );


};
    export default ContactForm;