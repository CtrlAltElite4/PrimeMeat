import HeroSection from "../components/HeroSection";
import HomeFilterBar from "../components/HomeFilterBar";
import FeaturedProducts from "../components/FeaturedProducts";
import "../styles/Home.css";

function Home() {
  return (
    <main className="home-page">
      <HeroSection />

      <HomeFilterBar />

      <FeaturedProducts />
    </main>
  );
}

export default Home;
