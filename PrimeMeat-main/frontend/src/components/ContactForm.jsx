import ContactSuccess from '../assets/ContactSucImage3.png';
import {useState} from 'react';
import '../css/ContactPage.css'
import '../css/AboutPage.css'

function ContactForm(){
const [submit, setSubmit] = useState({
fName: '',
lName: '',
email: '',
message: ''
});

const [status, setStatus] = useState('');

const handleChange = (e)=> {
    setSubmit({ ...submit, [e.target.name]: e.target.value}); 
};

const handleSubmit = async (e) => {
e.preventDefault();
setStatus('Sending');


try {
            const response = await fetch('http://localhost:8000/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submit)
            });

            const result = await response.json();
if(result.success){
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

<form className = "ContactInputs" onSubmit = {handleSubmit}>
    <label>
<input type ="text" 
name ="fName"
className ="ContactFName" 
placeholder ="First Name" 
value ={submit.fName}
onChange = {handleChange}
required />
</label>

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

<label>
<input type ="email"
name ="email" 
className ="ContactEmail" 
placeholder ="Email" 
value ={submit.email}
onChange ={handleChange}
required />
</label>

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

}
    export default ContactForm;