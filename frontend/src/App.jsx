import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import Register from './pages/Register';
import Login from './pages/Login';

function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Stats />
      <HowItWorks />
      <Footer />
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-bg">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;