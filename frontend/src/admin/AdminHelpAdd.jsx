import {useState} from 'react';
import api from '../api';
import '../css/AdminFaq.css';

function AdminHelpAdd({onCreated}){
const [category, setCategory] =useState('');
const [title, setTitle] =useState('');
const [answer, setAnswer] =useState('');
const [keywords, setKeywords] =useState('');
const [message, setMessage] = useState('');
const [saving, setSaving] = useState(false);

const helpFaqAdd = async () =>{
    setSaving(true);
    setMessage('');

    try{
    const {data} = await api.post(`/api/admin/helpfaqs`, {
            category,
            title,
            answer,
            keywords: keywords
            .split(',')
            .map((keyword)=> keyword
            .trim())
            .filter(Boolean),
        });
        setMessage('Created!');
        setCategory('');
        setTitle('');
        setAnswer('');
        setKeywords('');
        setMessage('Added!');
        onCreated?.(data);
    } catch(error){
        setMessage('Could Not Add')
        
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
onClick ={helpFaqAdd}
disabled = {saving}
>
{saving ? 'Adding...' : 'Add FAQ Changes'}
</button>
<p>{message}</p>
</section>
</>)
}


export default AdminHelpAdd;