import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import "./StickySidebar.css";
import SubjectsPage from "..//SubjectsPage/SubjectsPage.jsx"; // Import the SubjectsPage component

const StickySidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.clear(); // Clear local storage
    navigate("/"); // Redirect to login page
  };
  const handleMeet = () => {
    const url = "http://localhost:3000";
    // Open the URL in a new tab
    window.open(url, "_blank");
  };

  return (
    <>
      {/* Sticky Circular Button */}
      <button className="sticky-button" onClick={toggleSidebar}>
        ☰
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <ul className="sidebar-options">
          <li>
            <button
              className="sidebar-option-btn"
              onClick={() => navigate("/subjectspage")}
            >
              Home
            </button>
          </li>
          <li>
            <button className="sidebar-option-btn" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default StickySidebar;