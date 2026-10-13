import { useState } from 'react';
import AdminHelpCRUD from './AdminHelpCRUD';
import '../css/AdminFaq.css';


function AdminHelpFaqCard({category, faqs, onUpdated, onCreated, onDeleted})
{
const [editId, setEditId] = useState(null);
const [addId, setAddId] = useState(false);

const OneCard = addId || editId !== null;

return(
  <>
  <section className ="FullCard">
  <h2 className ="HelpCardTitle">{category}</h2>

  <ul className ="HelpCardList">
      {faqs.map((faq) => (
          <AdminHelpCRUD
            key={faq.id}
            faq={faq}
            isEditing={editId === faq.id}
            onStartEdit={() => setEditId(faq.id)}
            onCancelEdit={() => setEditId(null)}
            onUpdated={(updated) => {
              setEditId(null);
              onUpdated?.(updated);
            }}
            onDeleted={(id) => onDeleted?.(id)}
          />
        ))}

        {addId && (
          <AdminHelpCRUD
          isNew faq = {{category,
            title:'',
            answer:'',
            keywords: []
          }}
          isEditing onCancelEdit = {()=> setAddId(false)}
              onUpdated ={(created)=> {
                setAddId(false);
                onCreated?.(created);
              }} 
            />
            )}
  </ul>

  {!OneCard && (
    <button
    type ="button"
    className ="AddRowBtn"
    onClick ={()=>setAddId(true)}
    >
      +Add Question
    </button>
  )}
  </section>
  
  </>
)
}

export default AdminHelpFaqCard;