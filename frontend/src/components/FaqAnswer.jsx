import ReactMarkdown from 'react-markdown';
import DOMpurify from 'dompurify';

const BlockPattern = /<(p|h[1-6]|ul|ol|li|div|br|blockquote|table)\b[^>]*>/i;

function FaqAnswer({text, className =""}){
    if(!text) return null;

const FaqValue = String(text);
const isHtml = BlockPattern.test(FaqValue);

    return (
<>
<section 
className = {`FaqAnswer ${className}`.trim()}>
{isHtml ? (
    <div dangerouslySetInnerHTML={{__html:DOMpurify.sanitize(FaqValue)}}
        />
    
    ):(
    <ReactMarkdown>
      {FaqValue}
    </ReactMarkdown>
    )}

</section>
</>

    )
}

export default FaqAnswer;