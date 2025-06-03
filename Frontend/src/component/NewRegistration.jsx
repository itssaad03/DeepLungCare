import React, { useState, useEffect } from 'react';
import PopupMessage from '../popupmessage';

const NewRegistration = ({ isDarkTheme }) => {
  const [formData, setFormData] = useState({
    serialNumber:"",
    patientName: '',
    gender: '',
    email: '',
    contact: '',
    bloodGroup: '',
    opd: '',
    smoker: '',
    previousLungDisease: ''
  });

  const [serialNumber, setSerialNumber] = useState('0001'); // Initialized to '0001'

  useEffect(() => {
    // Generate a random 4-digit serial number with leading zeros
    const generateSerialNumber = () => {
      const randomNum = Math.floor(Math.random() * 10000);
      return randomNum.toString().padStart(4, '0');
    };

    const checkSerialUnique = async (serial) => {
      try {
        const response = await fetch(`http://localhost:5000/api/registerPatient/${serial}`);
        if (response.ok) {
          // Serial exists, generate a new one
          return false;
        } else if (response.status === 404) {
          // Serial does not exist, unique
          return true;
        } else {
          // Other errors, assume not unique to be safe
          return false;
        }
      } catch (error) {
        console.error('Error checking serial uniqueness:', error);
        return false;
      }
    };

    const generateUniqueSerial = async () => {
      let unique = false;
      let serial = '';
      while (!unique) {
        serial = generateSerialNumber();
        unique = await checkSerialUnique(serial);
      }
      return serial;
    };

    generateUniqueSerial().then((uniqueSerial) => {
      setSerialNumber(uniqueSerial);
      setFormData((prev) => ({
        ...prev,
        serialNumber: uniqueSerial,
      }));
    });
  }, []);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const validateForm = () => {
    const nameRegex = /^[A-Za-z\s]+$/;
    const contactRegex = /^[0-9]+$/;
    const emailRegex = /^.+@.+\.com$/;

    if (!nameRegex.test(formData.patientName)) {
      setPopupType('error');
      setPopupMessage('Patient name must contain only letters and spaces.');
      return false;
    }

    if (!contactRegex.test(formData.contact)) {
      setPopupType('error');
      setPopupMessage('Contact number must contain only numbers.');
      return false;
    }

    if (formData.contact.length < 7) {
      setPopupType('error');
      setPopupMessage('Contact number must be at least 7 digits long.');
      return false;
    }

    if (!emailRegex.test(formData.email)) {
      setPopupType('error');
      setPopupMessage('Email must contain "@" and end with ".com".');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setTimeout(() => setPopupMessage(''), 3000);
      return;
    }

    console.log('Serial number sent from frontend:', serialNumber);
    const patientData = {
      ...formData,
      serialNumber,
    };

    try {
      const response = await fetch('http://localhost:5000/api/registerPatient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(patientData),
      });

      const data = await response.json();

      if (response.ok) {
        setPopupType('success');
        setPopupMessage('Patient has been registered successfully!');
      } else {
        setPopupType('error');
        setPopupMessage(data.message);
      }

      // Hide the popup after 3 seconds
      setTimeout(() => setPopupMessage(''), 3000);
    } catch (err) {
      setPopupType('error');
      setPopupMessage('Something went wrong. Please try again.');
      setTimeout(() => setPopupMessage(''), 3000);
    }
  };

  const handleClosePopup = () => {
    setPopupMessage('');
  };

  return (
    <div className="content-area">
      <h1 className="content-title" style={{ color: isDarkTheme ? '#f3f4f6' : '#1a202c' }}>
        New Registration
      </h1>

      <PopupMessage message={popupMessage} type={popupType} onClose={handleClosePopup} />

      <div className="patient-history-scroll">
        <form className="registration-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="serialNumber">Serial Number</label>
            <input type="text" id="serialNumber" value={serialNumber} readOnly />
          </div>

          <div className="form-group">
            <label htmlFor="patientName">Patient Name</label>
            <input
              type="text"
              id="patientName"
              value={formData.patientName}
              onChange={handleChange}
              placeholder="Enter patient name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select id="gender" value={formData.gender} onChange={handleChange} required>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact">Contact Number</label>
            <input
              type="tel"
              id="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Enter contact number"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="bloodGroup">Blood Group</label>
            <select
              id="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              required
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="opd">OPD (if any)</label>
            <input
              type="text"
              id="opd"
              value={formData.opd}
              onChange={handleChange}
              placeholder="Enter OPD details"
            />
          </div>

          <div className="form-group">
            <label htmlFor="smoker">Smooker</label>
            <select
              id="smoker"
              value={formData.smoker}
              onChange={handleChange}
              required
            >
              <option value="">Select Option</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="previousLungDisease">Any Lung Disease in the Past</label>
            <select
              id="previousLungDisease"
              value={formData.previousLungDisease}
              onChange={handleChange}
              required
            >
              <option value="Astma">Astma</option>
              <option value="COPD">COPD</option>
              <option value="Bacterial_Infection">Bacterial Infection</option>
              <option value="Covid Patient">CoVid Patient</option>
              <option value="No_disease">No </option>
            </select>
          </div>

          <button type="submit" className="form-submit-button">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default NewRegistration;
