import React from 'react';
import './PasswordInput.css'

const PasswordInput = () => {
  return (
    <div className="input-group">
      <label htmlFor="password">Password</label>
      <input type="password" id="password" placeholder="Enter your password" required />
    </div>
  );
}

export default PasswordInput;
