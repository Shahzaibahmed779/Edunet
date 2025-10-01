import React from 'react';
import './ConfirmPasswordInput.css';

const ConfirmPasswordInput = () => {
  return (
    <div className="input-group">
      <label htmlFor="confirm-password">Confirm Password</label>
      <input type="password" id="confirm-password" placeholder="Re-enter your password" required />
    </div>
  );
};

export default ConfirmPasswordInput;
