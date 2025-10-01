import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import axios from "axios"; // Axios for API requests
import "./Login.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import loginImage from "./login.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);


  const handleLogin = async (event) => {
    event.preventDefault();
    setIsSending(true);

    try {
      // Send POST request to backend API
      const response = await axios.post(
        "http://localhost:5000/login",
        { email, password }
      );

      if (response.status === 200) {
        // Login successful, store user data in localStorage
        const userData = response.data.data; // User data from server
        localStorage.setItem("user", JSON.stringify(userData));
        // toast.success("Login successful")

        // Redirect to subjects page immediately
        setTimeout(() => {
          setIsSending(false);
          window.location.href = "/Subjectspage";
        }, 500);

      } else if (response.status === 400) {
        setMessage("Email does not exist");
        setIsSending(false);
      } else if (response.status === 202) {
        setMessage("Incorrect password");
        setIsSending(false);
      } else {
        setMessage("An unexpected error occurred");
        setIsSending(false);
      }
    } catch (error) {
      console.error("Error during login:", error);
      setIsSending(false);

      if (error.response) {
        setMessage(error.response.data.message || "An unexpected error occurred");
      } else {
        setMessage("Error: Unable to connect to the server");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Left Section */}
        <div className="login-left">
          <img src={loginImage} alt="Login" className="login-image" />
        </div>

        {/* Right Section */}
        <div className="login-right">
          <h2><bold>Already a Member?</bold></h2>
          <form className="login-form" onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {message && <p className="message">{message}</p>}

            <button type="submit" className="loginn-button" disabled={isSending}>
              {isSending ? (
                <>
                  <span className="login-spinner"></span>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
          <div className="signup-option" style={{ padding: "20px 0" }}>
            <p>Don't have an account?</p>
            <Link
              to="/signup"
              className="signup-link"
              style={{
                textDecoration: "none",
                color: "#007bff",
                fontWeight: "bold",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#133d89")}
              onMouseLeave={(e) => (e.target.style.color = "#007bff")}
            >
              Sign up here
            </Link>
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default Login;
