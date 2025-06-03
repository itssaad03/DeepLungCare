import React from 'react';
import './popupmessage.css';

const PopupMessage = ({ message, type, onClose }) => {
  if (!message) return null;

  return (
    <div className={`popup-message ${type}`}>
      <div className="flex items-center justify-between w-full">
        <span>{message}</span>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
    </div>
  );
};

export default PopupMessage;
