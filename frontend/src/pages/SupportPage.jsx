import {useState, useEffect, useRef} from 'react'
import '../css/SupportPage.css'
import {pipeline} from '@huggingface/transformers'
import { AllMainSections, MainSubCats } from '../components/SearchData'
import SearchIcon from '../assets/search-icon.svg'
import { Link } from 'react-router'



const MaxResults = 4;
const HelpCards =6;
const TileLinks = 2;
const DropDelay = 300;

function SupportPage() {
const [helpsearch, setHelpSearch] = useState('');
const [load, setLoad] = useState(true);
const [helplist, setHelpList] = useState([]);
const [showmore, setShowMore] = useState(false);
const [dropdownOpen, setDropDownOpen] = useState(true);
const searchWrapRef = useRef(null);
const searchTimer = useRef(null);


const extractor = useRef(null);
const embeddingRef = useRef([]);

useEffect(() => {
    async function loadModel() {
extractor.current = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

const precomputed = [];
for(const item of MainSubCats){
    const output = await extractor.current(item.search, {
        pooling: 'mean',
        normalize: true
    });
        precomputed.push({item, vector: Array.from(output.data)});
    }
    embeddingRef.current =precomputed;
    setLoad(false);
    }
loadModel();
}, []);

useEffect(()=>{
    const OutClick = (e) =>{
        if(searchWrapRef.current && !searchWrapRef.current.contains(e.target)){
            setDropDownOpen(false);
        }
    };
    document.addEventListener('mousedown', OutClick);
    return() =>{
        document.removeEventListener('mousedown', OutClick);
        clearTimeout(searchTimer.current);
    }
},[]);


const similarity = (v1, v2) => {
    let dot = 0, nA = 0, nB = 0;
    for(let i =0; i<v1.length; i++) {
        dot += v1[i] * v2[i]; nA += v1[i] * v1[i]; nB += v2[i] * v2[i];
    }
    return dot / (Math.sqrt(nA) * Math.sqrt(nB));
};

const handleHelpChange = async (e) => {
    const HelpValue = e.target.value;
    setHelpSearch(HelpValue);
    setDropDownOpen(true);

    if (!HelpValue.trim()){
        setHelpList([]);
        return;
    }
    const runSearch = async (HelpValue) => {
if(!extractor.current || load) return;

const searchOut = await extractor.current(HelpValue, {
    pooling: 'mean',
    normalize: true
});
const searchVector = Array.from(searchOut.data);

const scored = embeddingRef.current.map(({item, vector}) => ({
    ...item,
    score: similarity(searchVector, vector)
}));

scored.sort((a, b) => b.score - a.score);
setHelpList(scored.slice(0, MaxResults));
} 
searchTimer.current = setTimeout(()=> runSearch(HelpValue), DropDelay)
};

const showResults = helpsearch.trim().length > 0 && helplist.length > 0 && dropdownOpen;
const tiles = showmore ? AllMainSections : AllMainSections.slice(0, HelpCards);
    
    return (
<>


<section className ="MidSupport">
<div className ="SupportHeroContent">
    <div className ="MidTitle">
<h1 className ="SupportHeroTitle">How can we help?</h1>
</div>
<div className ="HelpSearchWrap" ref={searchWrapRef}>
<div className ={`HelpSearchInput ${showResults ? 'open' : ''} `}>
    <img src ={SearchIcon} className ="SearchImage" width={25}/>
    <input 
    type = "text" 
    value = {helpsearch}
    onChange ={handleHelpChange}
    size ="65" 
    placeholder ="Find Your Problem Here" 
    className ="HelpInput"
    onFocus={()=> setDropDownOpen(true)}
    />
   
</div>

{showResults && (
    <ul className ="HelpDropDown">
    {helplist.map((sub)=> (
    
    <li key ={sub.id}>
    <Link to = {`/article/${sub.id}`} 
className = "HelpDropDownItem">
           {sub.title}    
        </Link>
        </li>
))}
</ul>
)}
</div>

    <div className ="FinalCards">
    {tiles.map((cat) => (
        <section key = {cat.Cat} className = "HelpHeaderandList">
            <h2 className = "TileHeader">
                {cat.icon}
                {cat.Cat}
                </h2>
            <ul className =" CardList">
                {cat.subCats.slice(0, TileLinks).map((sub) =>(
                    <li key = {sub.id}>
                        <Link to = {`/article/${sub.id}`} 
                        className ="HelpCatList">
                        <span className ="HelpCatText">{sub.title}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    ))}
    </div>
    {AllMainSections.length > HelpCards && (
        <button className ="MoreTopics" onClick={()=> setShowMore((v) =>
               !v)}>
                {showmore ? 'Show Less' : 'Show More'}
               </button>
     )}          
   
</div>
</section>
 
</>
    );

}



export default SupportPage;




