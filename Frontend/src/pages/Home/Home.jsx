import React, { useContext, useEffect, useState } from "react";
import { SocketContext } from "../../context/SocketContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./Home.css";
import axios from "axios";

const Home = () => {
  const [roomName, setRoomName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [joinRoomError, setJoinRoomError] = useState("");
  const navigate = useNavigate();
  const { socket, setMyMeets, newMeetType, setNewMeetType } =
    useContext(SocketContext);

  // Set default meet type to instant
  useEffect(() => {
    setNewMeetType("instant");
  }, [setNewMeetType]);

  // Retrieve user and class information from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const currentClass = JSON.parse(localStorage.getItem("currentClass"));
  const isTeacher = user?.email === currentClass?.useremail;

  // Handler to create a new meeting (only for teachers)
  const handleCreateRoom = () => {
    socket.emit("create-room", {
      userId: user?._id,
      roomName,
      newMeetType: "instant",
      newMeetDate: "none",
      newMeetTime: "none",
      classroomId: currentClass?._id,
    });
    setRoomName("");
  };

  // Handler to join a meeting (for both teachers and students)
  const handleJoinRoom = async () => {
    if (!joinRoomId.trim()) {
      setJoinRoomError("Please enter a valid room code.");
      return;
    }
    console.log("🔍 Attempting to join room:", joinRoomId);
    socket.emit("user-code-join", { roomId: joinRoomId });
    socket.on("room-exists", ({ roomId }) => {
      console.log("✅ Room exists, navigating...");
      navigate(`/meet/${roomId}`);
    });
    socket.on("room-not-exist", () => {
      console.log("Room does not exist.");
      setJoinRoomId("");
      setJoinRoomError("Room doesn't exist! Please try again.");
    });
  };

  useEffect(() => {
    socket.on("room-created", async ({ roomId }) => {
      console.log("✅ Room Created:", roomId);
      navigate(`/meet/${roomId}`);
      if (!currentClass?._id) {
        console.error("No classroom ID found! Announcement not posted.");
        return;
      }
      try {
        await axios.post("http://localhost:5000/createAnnouncement", {
          privateclassroomid: currentClass._id,
          announcementdata: `📢 A new meeting has been created! Code: ${roomId}`,
          email: user.email,
        });
        console.log("📢 Announcement Created Successfully!");
        localStorage.removeItem("currentClass");
        console.log("🗑 Classroom ID removed from local storage.");
      } catch (error) {
        console.error("❌ Error creating announcement:", error);
      }
    });
    return () => {
      socket.off("room-created");
    };
  }, [socket, navigate, currentClass, user]);

  return (
    <div className="homePage">
      <div className="decorative-curve"></div>
      <button className="back-button-home" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <div className="home-header">
        <div className="home-logo">
          <h2>EduNet's Meet</h2>
        </div>
        {!user ? (
          <div className="header-before-login">
            <button onClick={() => navigate("/login")}>Login</button>
          </div>
        ) : (
          <div className=""></div>
        )}
      </div>

      <div className="home-content">
        {!user ? (
          <div className="home-app-intro">
            <h2>Flawless Meetings, Anytime, Anywhere.</h2>
            <button onClick={() => navigate("/login")}>Join Now</button>
          </div>
        ) : (
          <div className="meet-container">
            <div className="meet-actions">
              {isTeacher && (
                <div className="create-meet">
                  <input
                    type="text"
                    placeholder="Name"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                  />
                  <button onClick={handleCreateRoom}>
                    <RiVideoAddFill /> New Instant Meet
                  </button>
                </div>
              )}
              <p>or</p>
              <div className="join-meet">
                <input
                  type="text"
                  placeholder="Enter code..."
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                />
                <button onClick={handleJoinRoom}>
                  <CgEnter /> Join Meet
                </button>
              </div>
              {joinRoomError && <span>{joinRoomError}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;