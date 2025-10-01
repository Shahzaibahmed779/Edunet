// src/components/Tab/Tab.jsx

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Chat from "../../pages/Chat/Chat";
import StreamSection from "../../pages/StreamSection/StreamSection";
import "./Tab.css";

const Tab = () => {
  const [activeTab, setActiveTab] = useState("chat");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { room } = location.state || {
    room: { teacherName: "", email: "", privateclassroompassword: "" },
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      <div className="tab-wrapper-enhanced">
        {/* Fixed Navigation Buttons */}
        <button className="back-button-tab-fixed" onClick={() => navigate("/SubjectsPage")}>
          ← Back
        </button>
        <div className="profile-section-tab">
          <div
            className="navbar-right-tab"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <span className="profile-icon">👤</span>
            Profile
            <div
              className={`navbar-dropdown-tab ${showProfileMenu ? "show" : ""}`}
            >
              <button onClick={() => navigate("/UserProfile")}>User Settings</button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>

        {/* Enhanced Header */}
        <div className="room-header">
          <h1 className="room-title">{room.privateclassroomname}</h1>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="tab-nav-enhanced">
          <button
            className={`tab-btn-enhanced ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => setActiveTab("chat")}
          >
            Chat
          </button>

          <button
            className={`tab-btn-enhanced ${activeTab === "classwork" ? "active" : ""}`}
            onClick={() => setActiveTab("classwork")}
          >
            Classwork
          </button>
        </div>

        {/* Enhanced Content Container */}
        <div className="tab-content-enhanced">
          {activeTab === "chat" && <Chat room={room} />}
          {activeTab === "classwork" && <StreamSection room={room} />}
        </div>
      </div>
    </>
  );
};

export default Tab;
