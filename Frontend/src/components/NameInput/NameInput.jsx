import React from 'react';
import './NameInput.css';

const NameInput = () => {
  return (
    <div className="input-group">
      <label htmlFor="name">Full Name</label>
      <input type="text" id="name" placeholder="Enter your full name" required />
    </div>
  );
};

export default NameInput;
