import { useEffect, useState } from 'react';
import api from '../api';
import AdminHelpFaqCard from './AdminHelpFaqCard';
import AdminHelpAdd from './AdminHelpAdd';
import '../css/AdminFaq.css';


function AdminHelpFaqPage(){
    const [faqs, setFaqs] = useState([]);
    const[adding, setAdding] = useState(false);


      useEffect(() => {
    api.get('/api/helpfaqs').then(({ data }) => setFaqs(data));
  }, []);

  const grouped = faqs.reduce((acc, faq) => {
    (acc[faq.category] ??= []).push(faq);
    return acc;
  }, {});

    return(
        <>
      <section className = "AdminMainPage">
        <div className ="AdminFaqToolBar">
          <h2>Manage FAQs</h2>
          <button type ="button"
          className = "AddFaqbtn"
          onClick={()=>setAdding((s)=> !s)}>
            {adding ? 'Cancel' : '+ Add New FAQ'}
          </button>
        </div>

    {adding && (
      <AdminHelpAdd
      onCreated={(newFaq) => {
        setFaqs((prev) => [newFaq, ...prev]);
        setAdding(false);
      }}
      />
    )}

      <div className ="AdminManagesFaq">
        <div className ="AdminCatList">
          {Object.entries(grouped).map(([category, list]) =>(
            <AdminHelpFaqCard
            key = {category}
            category = {category}
            faqs = {list}
            onCreated={(newFaq) =>
            setFaqs((prev) => [...prev, newFaq])
            }
          onUpdated={(updated) =>
        setFaqs((prev) =>
          prev.map((f) => (f.id === updated.id ? updated : f))
        )
      }
        onDeleted={(id) =>
        setFaqs((prev) => prev.filter((f) => f.id !== id))
      }
            />
          ))}
          </div>
        </div>
      </section>

    </>
  );
}

export default AdminHelpFaqPage;