import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop"
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Events from "./pages/Events";
import Achievements from "./components/Achievements";
import Footer from "./components/Footer";
import Societies from "./pages/Societies";
import Contact from "./pages/Contact";
import Gallery from "./pages/Gallery";
import PreEventPage from "./pages/PreEventPage";
import PostEventPage from "./pages/PostEventPage";
import Team from "./pages/Team";
import WebsiteTeam from "./pages/WebsiteTeam";
import AnnualReport from "./pages/AnnualReport";
import Faculty from "./pages/Faculty";
import ResponsiveGallery from "./components/ResponsiveGallery";
import SwipeCards from "./components/SwipeCards";
import AchievementsPage from "./pages/AchievementsPage";
const Home = () => (
  <>
    <Hero />
    <About />
    <ResponsiveGallery />
    <SwipeCards />
    <Achievements />
  </>
);

function App() {
  return (
    <Router>
      <ScrollToTop />
      <main className="min-h-screen bg-white dark:bg-ieee-dark transition-colors duration-300">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<div className="pt-20"><Events /></div>} />
          <Route path="/events/pre/:id" element={<div className="pt-20"><PreEventPage /></div>} />
          <Route path="/annual-report" element={<div className="pt-20"><AnnualReport /></div>} />
          <Route path="/events/post/:id" element={<div className="pt-20"><PostEventPage /></div>} />
          <Route path="/societies" element={<div className="pt-20"><Societies /></div>} />
          <Route path="/website-team" element={<div className="pt-20"><WebsiteTeam /></div>} />
          <Route path="/team" element={<div className="pt-20"><Team /></div>} />
          <Route path="/faculty" element={<div className="pt-20"><Faculty /></div>} />
          <Route path="/contact" element={<div className="pt-20"><Contact /></div>} />
          <Route path="/gallery" element={<div className="pt-20"><Gallery /></div>} />
          <Route path="/achievements" element={<div className="pt-20"><AchievementsPage /></div>} />
        </Routes>
        <Footer />
        
      </main>
    </Router>
  );
}

export default App;