import {useState} from 'react';
import api from '../api';
import '../css/AdminFaq.css';

function AdminHelpEdit({faq, onUpdated}){
const [category, setCategory] =useState(faq.category);
const [title, setTitle] =useState(faq.title);
const [answer, setAnswer] =useState(faq.hanswer);
const [keywords, setKeywords] =useState((faq.keywords || []).join(','));
const [message, setMessage] = useState('');
const [saving, setSaving] = useState(false);

const helpFaqSave = async () =>{
    setSaving(true);
    setMessage('');

    try{
    const {data} = await api.put(`/api/admin/helpfaqs/${faq.id}`, {
            category,
            title,
            answer,
            keywords: keywords
            .split(',')
            .map((keyword)=> keyword
            .trim())
            .filter(Boolean),
        });
        setMessage('Saved!');
        onUpdated?.(data);
      
    } catch(error){
        setMessage('Could Not Save')
        
        if (error.response?.status === 422) {
      console.error('Validation errors:', error.response.data.errors);
    } else if (error.response?.status === 401) {
      console.error('Not logged in — session cookie missing or expired.');
    } else if (error.response?.status === 403) {
      console.error('Logged in, but not an admin.');
    } else {
      console.error(error);
    }
} finally {
    setSaving(false);
}
};

return (
<>
<section className = "AdminFAQ">
<label>Category:</label>
<input value = {category}
onChange = {(e)=>setCategory(e.target.value)}
/>

<label>Question:</label>
<input value = {title}
onChange = {(e)=>setTitle(e.target.value)}
/>

<label>Answer:</label>
<textarea value = {answer}
onChange = {(e)=>setAnswer(e.target.value)}
/>

<label>Keywords:</label>
<input value = {keywords}
onChange = {(e)=>setKeywords(e.target.value)}
/>

<button type ="button"
onClick ={helpFaqSave}
disabled = {saving}
>
{saving ? 'Saving...' : 'Save Changes'}
</button>
<p>{message}</p>
</section>
</>)
}


export default AdminHelpEdit;