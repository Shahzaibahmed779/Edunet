import React from 'react';
import './EmailInput.css'

const EmailInput = () => {
  return (
    <div className="input-group">
      <label htmlFor="email">Email Address</label>
      <input type="email" id="email" placeholder="Enter your email" required />
    </div>
  );
}

export default EmailInput;
