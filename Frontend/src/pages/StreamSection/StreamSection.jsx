import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./StreamSection.css";

const StreamSection = ({ room }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isTeacher = user?.email === room.useremail;

  // ✅ Store current class info temporarily
  useEffect(() => {
    localStorage.setItem("currentClass", JSON.stringify(room));
  }, [room]);

  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/getAnnouncements",
          { privateclassroomid: room._id }
        );

        if (response.status === 200) {
          setAnnouncements(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };

    fetchAnnouncements();
  }, [room._id]);

  // Handle adding an announcement
  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.trim()) {
      alert("Announcement cannot be empty.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/createAnnouncement",
        {
          privateclassroomid: room._id,
          announcementdata: newAnnouncement,
          email: user.email,
        }
      );

      if (response.status === 201) {
        setAnnouncements([...announcements, response.data.data]);
        setNewAnnouncement("");
        // Popup removed as requested
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
      // Error popup removed as requested
    }
  };

  return (
    <div className="classwork-container-enhanced">
      {/* Enhanced Meeting Section */}
      <div className="meeting-section-enhanced">
        <div className="meeting-content">
          <h3>Live Meetings</h3>
          <p>Start or join video conferences for this room</p>
          <button className="btn-meeting-enhanced" onClick={() => navigate("/Home")}>
            Create or Join Meeting
          </button>
        </div>
      </div>

      {/* Enhanced Announcements Section */}
      <div className="announcements-section-enhanced">
        <div className="section-header">
          <h3>Announcements</h3>
        </div>

        {isTeacher && (
          <div className="create-announcement-enhanced">
            <textarea
              className="announcement-input"
              placeholder="Share an important announcement with the class..."
              value={newAnnouncement}
              onChange={(e) => setNewAnnouncement(e.target.value)}
              rows="3"
            />
            <button className="btn-post-enhanced" onClick={handleAddAnnouncement}>
              Post Announcement
            </button>
          </div>
        )}

        <div className="announcements-list-enhanced">
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <div key={announcement._id} className="announcement-card">
                <div className="announcement-content">
                  <p>{announcement.announcementdata}</p>
                </div>
                <div className="announcement-meta">
                  <span className="posted-by">
                    {announcement.email === user?.email ? "You" : announcement.email.split('@')[0]}
                  </span>
                  <span className="post-time">
                    {new Date(announcement.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-announcements">
              <p>No announcements yet</p>
              <small>{isTeacher ? "Post the first announcement!" : "Check back later for updates."}</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreamSection;
