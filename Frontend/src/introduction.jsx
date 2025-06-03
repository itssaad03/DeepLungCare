import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Routes, Route } from "react-router-dom";
import { motion } from 'framer-motion';
import './intro.css';
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./main_dashboard";
import NewRegistration from './component/NewRegistration';
import PatientHistory from './component/PatientHistory';
import DiseaseDetector from './component/DiseaseDetector';
import Report from './component/report';
import ChatBot from './component/chatbot';

const Intro = () => {
  return (
    <div className="app-container">
      <Header />
      <motion.div
        className="content-container"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Home />
        <Why_Us />
        <About_developer />
        <Contact />
      </motion.div>
      <Footer />
    </div>
  );
};

// Header Component
const Header = () => {
  return (
    <nav className="main_header">
      <h1 className="logo">Lungs Disease Detection</h1>
      <ul className="nav-links">
        <li><a href="#home">Home</a></li>
        <li><a href="#services">Services</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
  );
};

// Home Component
const Home = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <section className="home-section">
      <div className="text-container">
        <h1>Welcome to Our Platform</h1>
        <p>An AI-based system for efficient and accurate disease detection and personalized healthcare solutions.</p>
        <button onClick={handleGetStarted} className="get-started-btn">
          Get Started
        </button>
      </div>
    </section>
  );
};

// Why_Us Component
const Why_Us = () => {
  return (
    <section id="services" className="services-section">
      <h1>Our Services</h1>
      <div className="services-grid">
        <div className="service-box">
          <div>
            <h2>Automated Detection</h2>
            <p>This System uses AI to analyze X-rays, accurately identifying conditions like pneumonia and lung cancer. It enhances early diagnosis, reduces errors, and generates personalized reports, making healthcare faster and more efficient.</p>
          </div>
        </div>
        <div className="service-box"><div><h2>Report Generation</h2>
        <p>
        provides AI-driven, tailored diagnostic reports with disease detection, severity levels, and recommendations, ensuring clarity for both doctors and patients. Using NLP, the system simplifies complex medical data into easy-to-understand insights. This automation enhances accuracy, speeds up diagnosis, and improves patient care.</p></div></div>
        <div className="service-box"><div><h2>Privacy & Security</h2><p> the core principles of our lung disease detection system. Advanced encryption ensures patient data privacy, while strict security measures protect sensitive medical records. AI-driven analysis enhances accuracy, reducing errors and improving diagnostic reliability. Together, these features ensure a secure, precise, and trustworthy healthcare solution.</p></div></div>
      </div>
    </section>
  );
};

// About_developer Component
const About_developer = () => {
  return (
    <section id="about" className="about-section">
      <h2>Our Team</h2>
      <p>Meet the talented individuals behind this project. Each of us has contributed to making this platform a reality.</p>
      <div className="team-container">
        <div className="team-member">
          
          <h2>Qazi Usman</h2>
          <p className="role">Lead Developer</p>
          <p>Qazi led the development of the entire application, working on both front-end and back-end aspects, ensuring the system runs smoothly.</p>
        </div>
        <div className="team-member">

          <h2>Saad Atif</h2>
          <p className="role">UI/UX Designer</p>
          <p>Saad was responsible for creating the user-friendly design and ensuring the overall experience is intuitive and accessible.</p>
        </div>
      </div>
    </section>
  );
};

// Contact Component

const Contact = () => {
  return (
    <section id="contact" className="contact-section">
      <div className="contact-container">
        
        {/* Left Side - Image */}
        <div className="contact_image-container">
          <img src='image/contact.jpg'alt ="Contact Us" className="contact-image"/>
        </div>

        {/* Right Side - Contact Form */}
        <div className="form-container">
          <h2>Contact Us</h2>
          <form className="contact-form">
            <input type="text" placeholder="Name" className="input-field" />
            <input type="email" placeholder="Email" className="input-field" />
            <textarea placeholder="Message" className="input-field"></textarea>
            <button className="submit-button">Submit</button>
          </form>
        </div>

      </div>
    </section>
  );
};
// Footer Component
const Footer = () => {
  return (
    <footer className="footer">
      <p>&copy; 2025. Bahria University.</p>
    </footer>
  );
};

// App Component
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Intro />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />}>
        <Route path="new-registration" element={<NewRegistration />} />
        <Route path="patient-history" element={<PatientHistory />} />
        <Route path="disease-detector" element={<DiseaseDetector />} />
        <Route path="report" element={<Report />} />
        <Route path="chatbot" element={<ChatBot />} />
      </Route>
    </Routes>
  );
};
export default App;
