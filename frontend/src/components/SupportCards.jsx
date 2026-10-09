import {Link} from 'react-router'
import '../css/SupportPage.css'

const SuppCards = [
                   
        
                    {id: 'prods', Name: 'Products', link: '/Products', className: "Cards"},
                    {id: 'contacts', Name: 'Contact Us', link: '/contactpage', className: "Cards"},
                    {id: 'bots', Name: 'Butcher ChatBot', link: '/Butcher', className: "Cards"},
          
                 
];


function SupportCards(){
return(
<>
<section className ="MidCards"> 
<div className ="FinalCards">
{SuppCards.map(card => (
<Link to={card.link} className="MainCards"  
 key={card.id}>
{card.Name}
</Link>
))}
</div>
</section>
</>
)
}


export default SupportCards;