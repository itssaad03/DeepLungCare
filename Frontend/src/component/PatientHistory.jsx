import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PatientHistory = ({ isDarkTheme }) => {
  const [patientRecords, setPatientRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailedReports, setDetailedReports] = useState({}); // Store detailed report data keyed by serialNumber

  // Fetch patient records on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem('token'); // or however you're storing the token
        const response = await axios.get('http://localhost:5000/api/patients', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPatientRecords(response.data);
        setFilteredRecords(response.data);

        // Fetch detailed report for each patient
        const reports = {};
        for (const patient of response.data) {
          try {
            const reportResponse = await axios.get(`http://localhost:5000/api/patientReport/${patient.serialNumber}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            reports[patient.serialNumber] = reportResponse.data;
          } catch (err) {
            console.error(`Error fetching report for patient ${patient.serialNumber}:`, err);
          }
        }
        setDetailedReports(reports);
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };

    fetchPatients();
  }, []);

  const handleSearch = () => {
    const filtered = patientRecords.filter((patient) => {
      const nameMatch = patient.patientName.toLowerCase().includes(searchQuery.toLowerCase());
      const serialMatch = patient.serialNumber.includes(searchQuery);
      return sortBy === 'name' ? nameMatch : serialMatch;
    });
    setFilteredRecords(filtered);
  };

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    return sortBy === 'name'
      ? a.patientName.localeCompare(b.patientName)
      : a.serialNumber.localeCompare(b.serialNumber);
  });

  return (
    <div className="content-area">
      <h1 className="content-title" style={{ color: isDarkTheme ? '#f3f4f6' : '#1a202c' }}>Patient History</h1>

      <div className="search-bar">
        <label htmlFor="searchOption">Search by: </label>
        <select 
          id="searchOption"
          onChange={(e) => setSortBy(e.target.value)} 
          value={sortBy}
        >
          <option value="name">Name</option>
          <option value="serial">Serial Number</option>
        </select>
        
        <input 
          type="text" 
          placeholder={`Search by ${sortBy === 'name' ? 'Name' : 'Serial Number'}`} 
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
        
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="patient-records">
        <h2>Registered Patients</h2>
        <table>
          <thead>
            <tr>
              <th>Serial Number</th>
              <th>Name</th>
              <th>Gender</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Blood Group</th>
              <th>Smoker</th>
              <th>Previous Lung Disease</th>
              <th>OPD</th>
              <th>Recommended Disease</th>
              <th>Summary</th>
              <th>Last Visit Date</th>
            </tr>
          </thead>
          <tbody>
            {sortedRecords.map((patient, index) => {
              const report = detailedReports[patient.serialNumber] || {};
              return (
                <tr key={index}>
                  <td>{patient.serialNumber}</td>
                  <td>{patient.patientName}</td>
                  <td>{patient.gender}</td>
                  <td>{patient.email}</td>
                  <td>{patient.contact}</td>
                  <td>{patient.bloodGroup}</td>
                  <td>{patient.smoker}</td>
                  <td>{patient.previousLungDisease}</td>
                  <td>{patient.opd}</td>
                  <td>{report.recommendedDisease || ''}</td>
                  <td>{report.summary || ''}</td>
                  <td>{report.lastVisitDate ? new Date(report.lastVisitDate).toLocaleDateString() : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientHistory;
