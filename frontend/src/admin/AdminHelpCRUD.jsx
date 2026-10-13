import {useState} from 'react';
import api from '../api';
import '../css/AdminFaq.css';

function AdminHelpCRUD({faq, onUpdated, onDeleted, onStartEdit, onCancelEdit, isEditing, isNew =false})
{
const [category, setCategory] =useState(faq.category);
const [title, setTitle] =useState(faq.title);
const [answer, setAnswer] =useState(faq.answer);
const [keywords, setKeywords] =useState((faq.keywords || []).join(','));
//const [message, setMessage] = useState('');
const [saving, setSaving] = useState(false);
const [deleting, setDeleting] = useState(false);

const helpFaqSave = async () =>{
    setSaving(true);

    try{
            const payload = {
            category,
            title,
            answer,
            keywords: keywords
            .split(',')
            .map((keyword)=> keyword
            .trim())
            .filter(Boolean),
        };

        const { data } =isNew ? await api.post('/api/admin/helpfaqs', payload)
        : await api.put(`/api/admin/helpfaqs/${faq.id}`, payload);

        onUpdated?.(data);
      
    } catch(error){
        
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
};
}



const helpFaqDelete = async () =>{
    if(!window.confirm(`Delete FAQ "${faq.title}"`))
      return;

      setDeleting(true);
    try{
     await api.delete(`/api/admin/helpfaqs/${faq.id}`);
     
        onDeleted?.(faq.id);
      
    } catch(error){
        
        if (error.response?.status === 401) {
      console.error('Not logged in — session expired.');
    } else if (error.response?.status === 403) {
      console.error('You are not an admin.');
    } else {
      alert('Could Not Delete')
      console.error(error);
    }
} finally {
    setDeleting(false);
}
};

if(isEditing){

return (
<>
<li className = "admin-faq row admin-faq-row--editing">
<section className = "AdminFAQ">
<label>Category:
<input value = {category}
onChange = {(e)=>setCategory(e.target.value)}
disabled = {isNew}
/>
</label>

<label>Question:
<input value = {title}
onChange = {(e)=>setTitle(e.target.value)}
/>
</label>

<label>Answer:
<textarea value = {answer}
onChange = {(e)=>setAnswer(e.target.value)}
row={3}
/>
</label>

<label>Keywords:
<input value = {keywords}
onChange = {(e)=>setKeywords(e.target.value)}
/>
</label>

<button type ="button"
onClick ={helpFaqSave}
disabled = {saving}
>
{saving ? 'Saving...' : 'Save'}
</button>

<button type ="button"
onClick ={onCancelEdit}
disabled = {saving}
>
Cancel
</button>
</section>
</li>
</>
)
}

return(
<>
<li className = "AdminFaqRow">
<div className ="RowContent">
<div className ="RowTitle">{faq.title}</div>
</div>
<div className ="CRUDOPS">
  <button type ="button"
  onClick = {onStartEdit}
  >
  Edit
  </button>
<button type ="button"
  onClick = {helpFaqDelete}
  >
  {deleting ? '...' : 'Delete'}
  </button>

</div>
</li>
</>)

}

export default AdminHelpCRUD;
