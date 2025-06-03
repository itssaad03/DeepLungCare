import React from 'react';

const Settings = ({ onSignOut }) => {
  return (
    <div style={{ padding: '20px', fontFamily: "'Times New Roman', serif" }}>
      <h2>Settings</h2>
      <button
        onClick={onSignOut}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#c0392b',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        Sign Out
      </button>
    </div>
  );
};

export default Settings;
