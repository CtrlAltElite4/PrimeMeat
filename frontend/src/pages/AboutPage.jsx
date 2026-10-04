import CollageImage1 from "../assets/MeatProcessImage.webp";
import CollageImage2 from "../assets/AnimalBreedImage2.jpg";
import CollageImage3 from "../assets/DeliveryImage.jpg";
import CollageImage4 from "../assets/PackagingImage.jpg";
import ClientImage from "../assets/ClientImage2.jpg";
import StoreImage from "../assets/RealButcherImage.jpg";
import "../css/AboutPage.css";

{
  /*}
export function Navbar(){
    return (
<>
<nav className ="Nav">
   
    <ul>
 <li><a href = "/" className ="site-title" id ="WebLogo">[Logo]</a></li>

<li><a href = "/Home" id ="Homer">Home</a></li>
<li><a href= "/About">About</a></li>
<li><a href = "/Shop">Shop</a></li>
<li><a href= "/Contact">Contact</a></li>
<button className ="NavButton" id ="MainSearch"><img src ={SearchImage} style ={{width: '23px'}} className ="NavIcons" id ="SearchIcon" />Search </button>
<button className ="NavButton" id ="MainUser"><img src ={UserImage} style ={{width: '23px'}} className ="NavIcons" id ="UserIcon" />Sign-in</button>
<button className ="NavButton" id ="MainCart"><img src ={CartImage} style ={{width: '25px'}} className ="NavIcons" id ="CartIcon"/>Cart</button>
    </ul>
</nav>
</>
    );
}
*/
}

export function Collage() {
  return (
    <div className="collage-container">
      <img src={CollageImage1} className="left" id="CollagePics" />
      <img src={CollageImage2} className="top" id="CollagePics" />
      <img src={CollageImage3} className="bottom" id="CollagePics" />
      <img src={CollageImage4} className="right" id="CollagePics" />
    </div>
  );
}

function AboutPage() {
  return (
    <>
      {/*
     <Navbar />
*/}

      <section className="AboutHeroFinal">
        <h1 className="AboutHeroTitle">About Us</h1>
        <br />
        <p className="AboutHeroPhrase">Producing quality meat since 2024</p>
      </section>

      <section className="Story" id="HistoryStory">
        <img className="StorePic" src={StoreImage} id="MainStore" />
        <p className="StoryParagraph">
          <span className="StoryTitle" id="HistoryTitle">
            Our History
          </span>
          <br />
          <span className="FullHistory">
            Johnas Doesses, a prominent member of society, helping out his
            community with what ever resources he had. He figured that he wasn't
            doing enough as he felt that there was a gap in the meat department
            that could be filled. He knew that the people of his hometown in
            Centurion Mall weren't getting the best quality meat that they
            could. He decided that he would be the one to do something about it,
            prompting him to focus on opening a new butchery which only supplies
            quality bulk meat. What started as a community butchery, has now
            reached nationwide status, giving Johnass Doesses a chance to offer
            his service everyone in South Africa.
          </span>
        </p>
      </section>

      <div className="ProcessWrap">
        <section className="TheProcess">
          <span className="StoryTitle" id="ProcessTitle">
            Our Process
          </span>
          <div className="center-line"></div>
          <br />
          <div className="InfoLine"> </div>

          <svg width="60" height="60" className="FarmDot">
            <circle cx="30" cy="30" r="15" />
          </svg>

          <div className="MeatSource" id="FarmSource">
            <div className="MainSource">
              <h1 className="Source1">Right At Home</h1>
              {/*<h3 className ="SourceTitle">Right at home</h3> */}
              <p className="Source2">
                We have our very own farm where we breed our cattle in-house.
                Our cattle are fed regularly with the required nutrients to
                ensure they yield the best quality meat. There is no stopping us
                from giving our customers the best quality meat.
              </p>
            </div>
            <img
              src={CollageImage2}
              className="SourceImage"
              id="rotate10"
            ></img>
          </div>

          <div className="InfoLine" id="Line2"></div>
          <svg width="60" height="60" className="ProcessDot">
            <circle cx="30" cy="30" r="15" />
          </svg>

          <div className="MeatSource" id="ProcessSource">
            <div className="MainSource">
              <h1 className="Source1" id="ProcessCut">
                Cut To Perfection
              </h1>
              <p className="Source2" id="ProcessCut2">
                We take pride in our skilled butchers as they are given the task
                of cutting our meat to your satisfaction. Customers can make use
                of our cutsheet option which allows them to specify exactly what
                kind of meat they want, and to which proportions. Every cut,
                trim, and portion made to customer satisfaction.
              </p>
            </div>
            <img
              src={CollageImage1}
              className="SourceImage"
              id="rotate-10"
            ></img>
          </div>

          <div className="InfoLine" id="Line3"></div>
          <svg width="60" height="60" className="PackageDot">
            <circle cx="30" cy="30" r="15" />
          </svg>

          <div className="MeatSource" id="PackageSource">
            <div className="MainSource">
              <h1 className="Source1">Freshly Sealed</h1>
              <p className="Source2">
                Our Products are vacuum-sealed and labelled clearly for
                recognition. We keep our products fresh at the best temperature
                to reach your your doorstep in the best condition.
              </p>
            </div>
            <img
              src={CollageImage4}
              className="SourceImage"
              id="rotate10"
            ></img>
          </div>

          <div className="InfoLine" id="Line4"></div>
          <svg width="60" height="60" className="DeliveryDot">
            <circle cx="30" cy="30" r="15" />
          </svg>

          <div className="MeatSource" id="DeliverySource">
            <div className="MainSource">
              <h1 className="Source1">Knock Knock</h1>
              <p className="Source2">
                Your order is now on the way to its designated location. Your
                order will be on schedule and arrive at your doorstep on time.
                Your meat is delivered the right way.
              </p>
            </div>
            <img
              src={CollageImage3}
              className="SourceImage"
              id="rotate-10"
            ></img>
          </div>

          <Collage />
          <div className="Farm-Text"></div>
        </section>
      </div>

      <div class="FullMission">
        <p class="Mission">
          <span class="StoryTitle" id="MissionTitle">
            Our Mission
          </span>
          <br />
          <span className="MissionStatement">
            As PrimeMeat, our goal is a simple one, but it's our one, we want to
            make quality meat accessible across South Africa. We want to support
            households, be the gift the brings joy at weddings, we want to be
            the reliever that brings comfort at hospitals, we want to be all of
            it. Our customers should know where their food is coming from, that
            what they're being given is purely fresh produce. We're here for our
            communities and the families we serve every day, we're here for it
            all.
          </span>
        </p>
      </div>

      <section className="FullClient">
        <div class="ClientImage">
          <img src={ClientImage} className="RealImage" />
        </div>

        <div class="ClientInfo">
          <h3>Johnas Doe</h3>
          <p>Founder & CEO</p>
        </div>
      </section>

      {/*}
       <footer className = "Mid">
<p className ="Hero" id="Footer">Footer</p>
    </footer>
    */}
    </>
  );
}

export default AboutPage;
