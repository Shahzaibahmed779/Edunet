import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CreateRoom.css";

const CreateRoom = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { classname, _id } = location.state || {};
  const user = JSON.parse(localStorage.getItem("user"));

  const [roomName, setRoomName] = useState(classname || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleCreateRoom = async () => {
    if (!roomName || !password || !confirmPassword) {
      setErrorMessage("All fields are required!");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    try {
      const newRoom = {
        username: user,
        userid: user?._id || "defaultUserId",
        useremail: user?.email || "default@example.com",
        classroomid: _id,
        privateclassroomname: roomName,
        privateclassroompassword: password,
      };

      const response = await fetch(
        "http://localhost:5000/createPrivateClassroom",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newRoom),
        }
      );

      if (response.ok) {
        navigate("/SubjectsPage");
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Failed to create room.");
      }
    } catch (error) {
      setErrorMessage("Failed to create room. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="create-room-container">
      {/* Fixed Navigation Buttons */}
      <button className="back-button-createroom-fixed" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <div className="profile-section-createroom">
        <div
          className="navbar-right-createroom"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        >
          <span className="profile-icon">👤</span>
          Profile
          <div
            className={`navbar-dropdown-createroom ${showProfileMenu ? "show" : ""}`}
          >
            <button onClick={() => navigate("/UserProfile")}>User Settings</button>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
      <div className="decorative-curve"></div>
      <div className="create-room-content">
        <div className="contact-header">
          <div className="contact-logo animate-float">
            <i className="fas fa-door-open"></i>
          </div>
          <h2 className="contact-title">Create Room for {classname}</h2>
        </div>

        <div className="create-room">
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <input
            type="text"
            className="modal-input"
            placeholder="Room Name"
            value={roomName}
            onChange={(e) => {
              setRoomName(e.target.value);
              setErrorMessage("");
            }}
          />
          <input
            type="password"
            className="modal-input"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrorMessage("");
            }}
          />
          <input
            type="password"
            className="modal-input"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrorMessage("");
            }}
          />

          <button className="gradient-btn" onClick={handleCreateRoom}>
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;