import CollageImage1 from "../assets/MeatProcessImage.webp";
import CollageImage2 from "../assets/AnimalBreedImage2.jpg";
import CollageImage3 from "../assets/DeliveryImage.jpg";
import CollageImage4 from "../assets/PackagingImage.jpg";
import ClientImage from "../assets/ClientImage2.png";
import StoreImage from "/images/logo.png";
import "../css/AboutPage.css";

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
      <section className="AboutHeroFinal">
        <h1 className="AboutHeroTitle">About Us</h1>
        <br />
        <p className="AboutHeroPhrase">
          Quality meat. Community roots. Growing together.
        </p>
      </section>

      <section className="Story" id="HistoryStory">
        <img className="StorePic" src={StoreImage} id="MainStore" />

        <p className="StoryParagraph">
          <span className="StoryTitle" id="HistoryTitle">
            Our Story
          </span>
          <br />

          <span className="FullHistory">
            PrimeMeat is part of Syrol Group, a beef operation with its own
            feedlot and a strong connection to the community. What began as a
            community-focused operation has grown to provide quality beef for
            households, sharing groups, and businesses.
            <br />
            <br />
            PrimeMeat was created to make bulk beef purchasing practical for
            different types of customers. Whether a household needs a bulk
            purchase, a group wants to share a carcass, or a business needs beef
            for its operations, our focus is on providing quality beef in a way
            that suits the customer.
          </span>
        </p>
      </section>

      <div className="ProcessWrap">
        <section className="TheProcess">
          <span className="StoryTitle" id="ProcessTitle">
            What We Offer
          </span>

          <div className="center-line"></div>
          <br />

          <div className="InfoLine"></div>

          <svg width="60" height="60" className="FarmDot">
            <circle cx="30" cy="30" r="15" />
          </svg>

          <div className="MeatSource" id="FarmSource">
            <div className="MainSource">
              <h1 className="Source1">From the Feedlot</h1>

              <p className="Source2">
                Our beef comes through Syrol Group's own feedlot, forming an
                important part of the journey from cattle to the beef we provide
                to our customers. Our focus is on maintaining a reliable source
                of quality beef for the people and businesses we serve.
              </p>
            </div>

            <img src={CollageImage2} className="SourceImage" id="rotate10" />
          </div>

          <div className="InfoLine" id="Line2"></div>

          <svg width="60" height="60" className="ProcessDot">
            <circle cx="30" cy="30" r="15" />
          </svg>

          <div className="MeatSource" id="ProcessSource">
            <div className="MainSource">
              <h1 className="Source1" id="ProcessCut">
                Bulk Beef, Your Way
              </h1>

              <p className="Source2" id="ProcessCut2">
                PrimeMeat offers full, half, and quarter beef carcasses in
                different grades and weight options. Customers can choose an
                option that fits their household, group, or business needs,
                making bulk beef purchasing simpler and more practical.
              </p>
            </div>

            <img src={CollageImage1} className="SourceImage" id="rotate-10" />
          </div>

          <div className="InfoLine" id="Line3"></div>

          <svg width="60" height="60" className="PackageDot">
            <circle cx="30" cy="30" r="15" />
          </svg>

          <div className="MeatSource" id="PackageSource">
            <div className="MainSource">
              <h1 className="Source1">Made for Sharing</h1>

              <p className="Source2">
                Our group orders are designed for sharing groups who want to
                purchase a full carcass together. The traditional cuts are
                divided as evenly as possible among the group, giving everyone a
                share while making bulk purchasing more accessible.
              </p>
            </div>

            <img src={CollageImage4} className="SourceImage" id="rotate10" />
          </div>

          <div className="InfoLine" id="Line4"></div>

          <svg width="60" height="60" className="DeliveryDot">
            <circle cx="30" cy="30" r="15" />
          </svg>

          <div className="MeatSource" id="DeliverySource">
            <div className="MainSource">
              <h1 className="Source1">For Homes and Businesses</h1>

              <p className="Source2">
                PrimeMeat provides bulk beef for households, sharing groups, and
                businesses. Whether you are buying for your home, sharing the
                cost and meat with a group, or purchasing for a business, we aim
                to make the process straightforward from order to delivery or
                collection.
              </p>
            </div>

            <img src={CollageImage3} className="SourceImage" id="rotate-10" />
          </div>

          <Collage />

          <div className="Farm-Text"></div>
        </section>
      </div>

      <div className="FullMission">
        <p className="Mission">
          <span className="StoryTitle" id="MissionTitle">
            Our Mission
          </span>
          <br />

          <span className="MissionStatement">
            Our mission is to provide quality bulk beef in a way that works for
            the people we serve. We want to make bulk purchasing accessible to
            households, practical for sharing groups, and reliable for
            businesses.
            <br />
            <br />
            PrimeMeat continues the community-focused approach of Syrol Group
            while growing to serve more customers. We believe that buying beef
            in bulk should be a practical experience, whether it is shared
            between a group of people or purchased for a household or business.
          </span>
        </p>
      </div>

      <section className="FullClient">
        <div className="ClientImage">
          <img src={ClientImage} className="RealImage" />
        </div>

        <div className="ClientInfo">
          <h3>Syrol Group</h3>
          <p>Quality beef. Community roots. Growing together.</p>
        </div>
      </section>
    </>
  );
}

export default AboutPage;
