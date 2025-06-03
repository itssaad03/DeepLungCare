import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Facebook, Twitter, Instagram } from 'lucide-react';
import "./intro.css";
import Login from "../Login";
import Signup from "../Signup";
import Dashboard from "../main_dashboard";
import NewRegistration from './NewRegistration';
import PatientHistory from './PatientHistory';
import DiseaseDetector from './DiseaseDetector';
import ChatBot from './chatbot';

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-gray-900">
      <div className="text-2xl font-bold text-white">AI MEDICARE</div>
      <div className="flex gap-8">
        <button onClick={() => navigate("/")} className="text-white hover:text-blue-500">Home</button>
        <button onClick={() => navigate("/Dashboard")} className="text-white hover:text-blue-500">Dashboard</button>
        <button onClick={() => navigate("/signup")} className="text-white hover:text-blue-500">Register</button>
        <button onClick={() => navigate("/Login")} className="text-white hover:text-blue-500">Sign-In</button>
        <button onClick={() => navigate("/Contact")} className="text-white hover:text-blue-500">Contact</button>
      </div>
    </nav>
  );
};

const Intro = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-900 text-center flex flex-col items-center justify-center">
      <Navbar />
      <div className="content space-y-6">
        <h1 className="text-5xl font-bold text-white">Transforming Healthcare with AI</h1>
        <p className="max-w-2xl text-gray-300">
          Explore the future of AI-powered medical diagnostics, offering precision and efficiency.
        </p>
        <button className="px-8 py-3 mt-6 border border-white text-white hover:bg-blue-500" onClick={() => navigate("/Login")}>
          Get Started
        </button>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Intro />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/Dashboard" element={<Dashboard />}>
        <Route path="new-registration" element={<NewRegistration />} />
        <Route path="patient-history" element={<PatientHistory />} />
        <Route path="disease-detector" element={<DiseaseDetector />} />
      <Route path="chatbot" element={<ChatBot />} />
      <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

export default App;
