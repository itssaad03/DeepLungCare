import React from 'react';

const Report = ({ pdfBase64 }) => {
  const downloadReport = () => {
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${pdfBase64}`;
    link.download = 'Medical_Report.pdf';
    link.click();
  };

  if (!pdfBase64) {
    return (
      <div style={{ padding: 20 }}>
        <h2>No report data available</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Medical Report</h2>
      <button onClick={downloadReport} style={{ marginBottom: 10 }}>
        Download Report
      </button>
      <iframe
        title="Medical Report PDF"
        src={`data:application/pdf;base64,${pdfBase64}`}
        width="100%"
        height="600px"
        style={{ border: '1px solid #ccc' }}
      />
    </div>
  );
};

export default Report;
