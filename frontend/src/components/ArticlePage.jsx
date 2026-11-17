import {useNavigate, useParams, Link} from 'react-router-dom';
import {useEffect, useState } from 'react';
//import { MainSubCats, AllMainSections } from './SearchData';
import api from '../api';
import FaqAnswer from './FaqAnswer'


function ArticlePage() {
    const {id} =useParams();
    const HelpNav = useNavigate();
    const [article, setArticle] = useState(null);
    const [relatedarticles, setRelated] = useState([]);
    const [status, setStatus] = useState('loading');
    /*
    const HelpArticle = MainSubCats.find((s) =>s.id === id);
    const RelatedCat = AllMainSections.find((c)=> c.subCats.some((s)=> s.id === id));
    const RelatedArticles = RelatedCat ? RelatedCat.subCats.filter((s)=> s.id !== id) : [];
   */
    useEffect(() => {
    api.get('/api/helpfaqs')
      .then(({ data }) => {
        const found = data.find((f) => String(f.id) === id);
        if (!found) return setStatus('missing');
        setArticle(found);
        setRelated(
          data.filter((f) => f.category === found.category && String(f.id) !== id)
        );
        setStatus('ok');
      })
      .catch(() => setStatus('missing'));
  }, [id]);


    return (
        <>
        <section className ="FullArticle">
            <button className ="ArticleBack"
            onClick={()=> HelpNav("/Support")}>
                &larr; Back to Home
            </button>
<div className = "MainHelpInfo">
    {status === 'loading' && <p>Loading...</p>}
             {status === 'missing' && (
          <h1 className="ArticleTitle">We couldn't find that article</h1>
        )}
        {status === 'ok' && article && (
          <>
            <h1 className="ArticleTitle">{article.title}</h1>
          
            <FaqAnswer text = {article.answer} 
            className ="ArticleContent" />
            
                {relatedarticles.length > 0 && (
                    <section className ="RelatedHelp">
                        <h2 className ="RelatedTitle">Related Articles</h2>
                        <ul className ="RelatedList">
                                {relatedarticles.map((relate) => (
                                    <li key = {relate.id}>
                                        <Link to = {`/article/${relate.id}`}>
                                        {relate.title}
                                        </Link>
                                    </li>
                                ))}
                        </ul>
                    </section>
                )}
        
                </>
        )}
          
            </div>
        </section>
        </>
    );
}

export default ArticlePage;