import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./EnterRoomPassword.css";

const EnterRoomPassword = () => {
  const [password, setPassword] = useState(""); // User-entered password
  const [errorMessage, setErrorMessage] = useState(""); // Error message state
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve room details passed via navigation
  const { room } = location.state || {
    room: { teacherName: "", useremail: "", privateclassroompassword: "" },
  };

  const user = JSON.parse(localStorage.getItem("user")); // Get logged-in user from localStorage

  useEffect(() => {
    // Check if the logged-in user is the owner of the classroom
    if (user?.email === room.useremail) {
      navigate("/Tab", { state: { room }, replace: true }); // Directly navigate to the classroom
    }
  }, [user, room, navigate]);

  const handleEnterRoom = () => {
    if (!password) {
      setErrorMessage("Password is required to enter the room.");
      return;
    }

    // Compare user-entered password with room's password
    if (password !== room.privateclassroompassword) {
      setErrorMessage("Incorrect password. Please try again.");
      return;
    }

    // Password is correct - navigate with replace to avoid history issues
    navigate("/Tab", { state: { room }, replace: true });
  };

  return (
    <div className="enter-room-container">
      <button className="back-button-enter" onClick={() => navigate("/SubjectsPage")}>
        ← Back
      </button>
      <div className="enter-room shadow-lg rounded-lg p-6">
        <h1 className="enter-room-title">
          Enter <span>{room.privateclassroomname}</span>
        </h1>

        <p className="info-text">
          Forgot the password? You can contact the teacher at{" "}
          <a href={`mailto:${room.useremail}`} className="email-link">
            {room.useremail || "N/A"}
          </a>
        </p>

        <input
          type="password"
          className="password-input"
          placeholder="Enter Room Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrorMessage(""); // Clear error on input change
          }}
        />
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <button className="btn-enter" onClick={handleEnterRoom}>
          Enter Room
        </button>
      </div>
    </div>
  );
};

export default EnterRoomPassword;
