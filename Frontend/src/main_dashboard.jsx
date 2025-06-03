import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Home,
  Users,
  FileText,
  FileCheck,
  ExternalLink,
  Menu,
  Sun,
  Moon,
  Settings,
} from 'lucide-react';
import './main_dashboard.css';
import NewRegistration from './component/NewRegistration';
import PatientHistory from './component/PatientHistory';
import DiseaseDetector from './component/DiseaseDetector';
import ChatBot from './component/chatbot';
import Report from './component/report';
import { useNavigate } from 'react-router-dom';
import PopupMessage from './popupmessage';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [activePage, setActivePage] = useState('Dashboard');
  const [serialCounter, setSerialCounter] = useState(1);
  const [patientRecords, setPatientRecords] = useState([]);
  const [showSignOut, setShowSignOut] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(null);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');
  const [pdfBase64, setPdfBase64] = useState(null);

  const menuItems = [
    { title: 'New Registration', icon: <Users size={20} />, page: 'NewRegistration' },
    { title: 'Patient History', icon: <FileText size={20} />, page: 'PatientHistory' },
    { title: 'Disease Detector', icon: <FileCheck size={20} />, page: 'DiseaseDetector' },
    { title: 'Generate Report', icon: <FileText size={20} />, page: 'Report' },
    { title: 'AI ChatBot Assistant', icon: <ExternalLink size={20} />, page: 'ChatBot' },
  ];

  useEffect(() => {
    const resetSession = () => {
      clearTimeout(sessionTimeout);
      setSessionTimeout(setTimeout(() => {
        setPopupType('error');
        setPopupMessage('Your session has expired due to inactivity. You will be redirected to the login page.');
        navigate('/login');
      }, 20 * 60 * 1000)); // 20 minutes
    };

    resetSession();
    window.addEventListener('mousemove', resetSession);
    window.addEventListener('keydown', resetSession);

    return () => {
      clearTimeout(sessionTimeout);
      window.removeEventListener('mousemove', resetSession);
      window.removeEventListener('keydown', resetSession);
    };
  }, [navigate]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleTheme = () => setIsDarkTheme(!isDarkTheme);

  const handleSignOut = () => {
    setPopupType('success');
    setPopupMessage('You have been successfully signed out.');
    navigate('/login');
  };

  const handleClosePopup = () => {
    setPopupMessage('');
  };

  const renderContent = () => {
    switch (activePage) {
      case 'NewRegistration':
        return <NewRegistration serialCounter={serialCounter} isDarkTheme={isDarkTheme} />;
      case 'PatientHistory':
        return <PatientHistory patientRecords={patientRecords} isDarkTheme={isDarkTheme} />;
      case 'DiseaseDetector':
        return <DiseaseDetector isDarkTheme={isDarkTheme} setActivePage={setActivePage} setPdfBase64={setPdfBase64} />;
      case 'Report':
        return <Report pdfBase64={pdfBase64} />;
      case 'ChatBot':
        return <ChatBot isDarkTheme={isDarkTheme} />;
      default:
        return (
          <div className="intro-message" style={{ fontFamily: "'Times New Roman', serif", color: "#2c3e50", padding: "20px" }}>
            <h1 style={{ fontWeight: "bold", fontSize: "2.5rem", marginBottom: "10px" }}>Welcome to the Lung Disease Detection Portal</h1>
            <p style={{ fontSize: "1.2rem", lineHeight: "1.6" }}>Please select a feature from the navigation menu to begin.</p>
          </div>
        );
    }
  };

  return (
    <div className={`dashboard-container ${isDarkTheme ? 'dark-theme' : 'light-theme'}`} style={{ fontFamily: "'Times New Roman', serif", backgroundColor: isDarkTheme ? "#34495e" : "#ecf0f1", color: isDarkTheme ? "#ecf0f1" : "#2c3e50" }}>
      <div className="sidebar-toggle" onClick={toggleSidebar} style={{ backgroundColor: isDarkTheme ? "#2c3e50" : "#bdc3c7", padding: "10px", borderRadius: "5px", cursor: "pointer" }}>
        <Menu size={30} color={isDarkTheme ? "#ecf0f1" : "#2c3e50"} />
      </div>

      {isSidebarOpen && (
        <aside className="sidebar" style={{ backgroundColor: isDarkTheme ? "#2c3e50" : "#bdc3c7", padding: "20px", borderRadius: "8px", width: "250px" }}>
          <div className="sidebar-header" style={{ fontWeight: "bold", fontSize: "1.5rem", marginBottom: "20px", color: isDarkTheme ? "#ecf0f1" : "#2c3e50" }}>Lung Disease Detection System</div>
          <nav className="menu">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className={`menu-item ${activePage === item.page ? 'active' : ''}`}
                onClick={() => setActivePage(item.page)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px",
                  marginBottom: "8px",
                  borderRadius: "5px",
                  backgroundColor: activePage === item.page ? (isDarkTheme ? "#2980b9" : "#3498db") : "transparent",
                  color: activePage === item.page ? "#ecf0f1" : isDarkTheme ? "#ecf0f1" : "#2c3e50",
                  cursor: "pointer",
                  fontWeight: activePage === item.page ? "bold" : "normal",
                  fontSize: "1.1rem",
                  transition: "background-color 0.3s ease"
                }}
              >
                <span className="menu-icon" style={{ marginRight: "10px" }}>{React.cloneElement(item.icon, { color: activePage === item.page ? "#ecf0f1" : isDarkTheme ? "#ecf0f1" : "#2c3e50" })}</span>
                <span className="menu-title">{item.title}</span>
                {item.hasSubmenu && <ChevronRight size={18} className="submenu-icon" />}
              </div>
            ))}
          </nav>
          <div className="signout-section" onClick={() => setShowSignOut(!showSignOut)} style={{ marginTop: "auto", cursor: "pointer", paddingTop: "20px", borderTop: `1px solid ${isDarkTheme ? "#7f8c8d" : "#95a5a6"}` }}>
            <span className="menu-icon" style={{ marginRight: "1px" }}><Settings size={10} color={isDarkTheme ? "#ecf0f1" : "#2c3e50"} /></span>
            <span className="menu-title" style={{ color: isDarkTheme ? "#ecf0f1" : "#2c3e50", fontWeight: "bold" }}>Settings</span>
            {showSignOut && (
              <button className="signout-button" onClick={handleSignOut} style={{ marginTop: "10px", padding: "8px 12px", backgroundColor: "#c0392b", color: "#ecf0f1", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                Sign Out
              </button>
            )}
          </div>
        </aside>
      )}

      <main className="main-content" style={{ padding: "20px", flexGrow: 1 }}>
        <header className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div className="breadcrumb" style={{ display: "flex", alignItems: "center", fontSize: "1.2rem", color: isDarkTheme ? "#ecf0f1" : "#2c3e50" }}>
            <Home size={22} color={isDarkTheme ? "#ecf0f1" : "#2c3e50"} />
            <span style={{ margin: "0 8px" }}>/</span>
            <span>{activePage}</span>
          </div>
          <div className="header-buttons" style={{ display: "flex", gap: "10px" }}>
            <button onClick={toggleSidebar} className="header-button" style={{ padding: "8px 12px", fontSize: "1rem", cursor: "pointer", borderRadius: "5px", border: "1px solid", borderColor: isDarkTheme ? "#ecf0f1" : "#2c3e50", backgroundColor: isDarkTheme ? "#2c3e50" : "#ecf0f1", color: isDarkTheme ? "#ecf0f1" : "#2c3e50" }}>
              {isSidebarOpen ? 'Hide Menu' : 'Show Menu'}
            </button>
            <button onClick={toggleTheme} className="header-button theme-toggle" style={{ padding: "8px 12px", fontSize: "1rem", cursor: "pointer", borderRadius: "5px", border: "1px solid", borderColor: isDarkTheme ? "#ecf0f1" : "#2c3e50", backgroundColor: isDarkTheme ? "#2c3e50" : "#ecf0f1", color: isDarkTheme ? "#ecf0f1" : "#2c3e50" }}>
              {isDarkTheme ? <Sun size={22} color="#f39c12" /> : <Moon size={22} color="#34495e" />}
            </button>
          </div>
        </header>

        {renderContent()}

        <PopupMessage message={popupMessage} type={popupType} onClose={handleClosePopup} />

        <footer className="footer" style={{ textAlign: "center", padding: "15px 0", fontSize: "0.9rem", color: isDarkTheme ? "#bdc3c7" : "#7f8c8d" }}>
          © 2025 Bahria University | All rights reserved.
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;
