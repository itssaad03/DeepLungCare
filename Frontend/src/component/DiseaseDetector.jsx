import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const DiseaseDetector = ({ isDarkTheme, setActivePage, setPdfBase64 }) => {
  const [serialNumber, setSerialNumber] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSerial, setIsValidSerial] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reportGenerated, setReportGenerated] = useState(false);

  const navigate = useNavigate();

  const handleSerialCheck = async () => {
    const normalizedSerial = serialNumber.trim();
    if (!normalizedSerial) {
      alert('Please enter a serial number.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/registerPatient/${normalizedSerial}`);
      if (response.ok) {
        const data = await response.json();
        setIsValidSerial(true);
        setPatientData(data);
        setError('');
      } else {
        setIsValidSerial(false);
        alert('Invalid serial number. Please enter a valid registered number.');
      }
    } catch (err) {
      console.error(err);
      alert('Server error. Please try again later.');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setError('');
      setImageUploaded(true);
      setDetectionResult(null);
      setReportGenerated(false);
      setPdfBase64(null);
    }
  };

  const handleSelectImage = () => {
    document.getElementById('imageUpload').click();
  };

  const handleDeleteImage = () => {
    setSelectedImage(null);
    setImageUploaded(false);
    setDetectionResult(null);
    setReportGenerated(false);
    setPdfBase64(null);
    setError('');
  };

  const handleDetectDisease = async () => {
    setIsLoading(true);
    setReportGenerated(false);
    setPdfBase64(null);
    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await fetch('http://localhost:5000/api/detectDisease', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const result = await response.json();
      setDetectionResult(result.disease);
      setAccuracy(result.percentage !== undefined ? result.percentage / 100 : null);
    } catch (err) {
      console.error('Full Error:', err);
      const errorMessage = err.message || '';
      if (errorMessage === 'Model execution failed') {
        setError('Wrong image is uploaded, kindly change it');
      } else {
        setError(errorMessage || 'Failed to analyze image');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    if (!patientData || !detectionResult) {
      alert('Please ensure patient data and disease detection result are available.');
      return;
    }

    setIsGeneratingReport(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 300);

    try {
      const templateResponse = await fetch('/form.txt');
      const templateText = await templateResponse.text();

      const reportData = {
        ...patientData,
        disease: detectionResult,
      };

      const response = await fetch('http://localhost:5000/api/generateReport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: reportData,
          template: templateText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Report generation failed');
      }

      const result = await response.json();

      clearInterval(interval);
      setProgress(100);
      setIsGeneratingReport(false);
      setReportGenerated(true);
      setPdfBase64(result.pdfBase64);
    } catch (err) {
      clearInterval(interval);
      setIsGeneratingReport(false);
      setProgress(0);
      alert(err.message || 'Failed to generate report');
    }
  };

  const handleViewReport = () => {
    setActivePage('Report');
  };

  const handleDownloadReport = () => {
    if (pdfBase64) {
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${pdfBase64}`;
      link.download = '_Medical_Report.pdf';
      link.click();
    }
  };

  return (
    <div className="content-area">
      <h1 className="content-title" style={{ color: isDarkTheme ? '#f3f4f6' : '#1a202c' }}>
        Disease Detector
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSerialCheck();
        }}
        className="serial-section"
        style={{ marginBottom: '20px' }}
      >
        <input
          type="text"
          placeholder="Enter Patient Serial Number"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          className="serial-input"
        />
        <button type="submit" className="check-button">
          Check Serial
        </button>
      </form>

      {isValidSerial && (
        <>
          {patientData && (
            <div className="patient-info" style={{ marginBottom: '10px' }}>
              <p><strong>Name:</strong> {patientData.patientName}</p>
            </div>
          )}

          <div className="upload-section">
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <button onClick={handleSelectImage} className="upload-button">
              {selectedImage ? 'Change Image' : 'Upload Image'}
            </button>

            {imageUploaded && (
              <div className="upload-success-message" style={{ animation: 'fadeIn 1s ease-in-out' }}>
                <p>Image uploaded successfully!</p>
              </div>
            )}
          </div>

          {selectedImage && (
            <button className="analyze-button" onClick={handleDetectDisease}>
              {isLoading ? 'Analyzing...' : 'Analyze It'}
            </button>
          )}

          {detectionResult && (
            <div style={{ marginTop: '20px' }}>
              <p><strong>Disease Detected:</strong> {detectionResult}</p>
              {accuracy !== null && (
                <p><strong>Accuracy:</strong> {(accuracy * 100).toFixed(2)}%</p>
              )}

              <div style={{ marginTop: '15px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {!reportGenerated && (
                  <button
                    className="generate-button"
                    onClick={generateReport}
                    disabled={isGeneratingReport}
                  >
                    {isGeneratingReport ? 'Generating Report...' : 'Generate Report'}
                  </button>
                )}

                {reportGenerated && (
                  <>
                    <button
                      className="generate-button"
                      onClick={handleViewReport}
                      style={{ backgroundColor: '#3498db', color: '#fff' }}
                    >
                      View Report
                    </button>
                    <button
                      className="generate-button"
                      onClick={handleDownloadReport}
                    >
                      Download Report
                    </button>
                  </>
                )}
              </div>

              {isGeneratingReport && (
                <div style={{ marginTop: '10px' }}>
                  <p>Generating report...</p>
                  <div style={{
                    width: '100%',
                    background: '#ccc',
                    height: '20px',
                    borderRadius: '10px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${progress}%`,
                      background: '#007bff',
                      height: '100%',
                      transition: 'width 0.3s'
                    }}></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default DiseaseDetector;
