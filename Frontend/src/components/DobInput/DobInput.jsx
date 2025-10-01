import React from 'react';
import './DobInput.css';

const DobInput = () => {
  return (
    <div className="input-group">
      <label htmlFor="dob">Date of Birth</label>
      <input type="date" id="dob" required />
    </div>
  );
};

export default DobInput;
