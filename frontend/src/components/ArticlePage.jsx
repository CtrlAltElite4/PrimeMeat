import {useNavigate, useParams, Link } from 'react-router';
import { MainSubCats, AllMainSections } from './SearchData';
//import "./HelpTiles.css";


function ArticlePage() {
    const {id} =useParams();
    const HelpNav = useNavigate();
    const HelpArticle = MainSubCats.find((s) =>s.id === id);
    const RelatedCat = AllMainSections.find((c)=> c.subCats.some((s)=> s.id === id));
    const RelatedArticles = RelatedCat ? RelatedCat.subCats.filter((s)=> s.id !== id) : [];
   

    return (
        <>
        <section className ="FullArticle">
            <button className ="ArticleBack"
            onClick={()=> HelpNav("/Support")}>
                &larr; Back to Home
            </button>
<div className = "MainHelpInfo">
            {HelpArticle ? (
                <>
                <h1 className ="ArticleTitle">{HelpArticle.title}</h1>
                <div className = "ArticleContent">{HelpArticle.content}</div>

                {RelatedArticles.length > 0 && (
                    <section className ="RelatedHelp">
                        <h2 className ="RelatedTitle">Related Articles</h2>
                        <ul className ="RelatedList">

                                {RelatedArticles.map((relate) => (
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
            ) : (
                <h1 className ="ArticleTitle"> We couldn't find that article</h1>
            )}
            </div>
        </section>
        </>
    )
}

export default ArticlePage;