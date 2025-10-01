import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Subject.css";

const Subject = () => {
  const handleMeet = () => {
    navigate("/Home");
  };
  const location = useLocation(); // Access the state passed from SubjectsPage
  const navigate = useNavigate(); // Hook for navigation
  const { classname, _id } = location.state || {}; // Destructure classname and _id from state

  const user = JSON.parse(localStorage.getItem("user")); // Get user info from localStorage

  // State for private rooms
  const [publicRooms, setPublicRooms] = useState([]);
  const [userRooms, setUserRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPublicRooms, setFilteredPublicRooms] = useState([]);
  const [publicRoomsMessage, setPublicRoomsMessage] = useState(""); // Message specific to public rooms
  const [userRoomsMessage, setUserRoomsMessage] = useState(""); // Message specific to user rooms
  const [showProfileMenu, setShowProfileMenu] = useState(false); // Profile menu state
  const [showSearch, setShowSearch] = useState(false); // Search visibility state

  // Fetch private rooms for the classroom that do not belong to the user
  useEffect(() => {
    if (!_id || !user?._id) {
      return;
    }

    const fetchPublicRooms = async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/getPrivateClassrooms",
          {
            classroomid: _id,
            userid: user?._id || "defaultUserId",
          }
        );

        if (response.status === 200) {
          setPublicRooms(response.data.data);
          setFilteredPublicRooms(response.data.data);
        } else if (response.status === 404) {
          setPublicRoomsMessage("No public classrooms found for the user.");
        }
      } catch (error) {
        if (error.response?.status === 404) {
          setPublicRoomsMessage("No public classrooms found for the user.");
        } else {
          console.error("Error fetching public private classrooms:", error);
          setPublicRoomsMessage(
            "Error fetching public private classrooms. Please try again."
          );
        }
      }
    };

    fetchPublicRooms();
  }, [_id, user?._id]);

  // Fetch private classrooms specific to the logged-in user
  useEffect(() => {
    if (!_id || !user?._id) {
      return;
    }

    const fetchUserRooms = async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/getUserPrivateClassrooms",
          {
            classroomid: _id,
            userid: user?._id || "defaultUserId",
          }
        );

        if (response.status === 200) {
          setUserRooms(response.data.data);
        } else if (response.status === 404) {
          setUserRoomsMessage("No private classrooms found for the user.");
        }
      } catch (error) {
        if (error.response?.status === 404) {
          setUserRoomsMessage("No private classrooms found for the user.");
        } else {
          console.error(
            "Error fetching user-specific private classrooms:",
            error
          );
          setUserRoomsMessage(
            "Error fetching user-specific private classrooms. Please try again."
          );
        }
      }
    };

    fetchUserRooms();
  }, [_id, user?._id]);

  // Handle search functionality for public rooms
  const handleSearch = () => {
    const results = publicRooms.filter((room) =>
      room.privateclassroomname.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPublicRooms(results);
  };

  // Navigate to room - skip password if you're the owner
  const handleRoomClick = (room) => {
    // Check if the current user is the owner of the room
    if (user?.email === room.useremail) {
      // You own this room, go directly to Tab
      navigate("/Tab", { state: { room }, replace: true });
    } else {
      // You don't own this room, need password
      navigate("/EnterRoomPassword", { state: { room } });
    }
  };

  // Navigate to create room page
  const handleCreateRoom = () => {
    navigate("/createroom", {
      state: { classname, _id, teacherName: user?.fullname },
    });
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Add error handling
  if (!classname || !_id) {
    return (
      <div className="subject-page">
        <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>
          <h1>Error: Missing class information</h1>
          <p>Please go back to the subjects page and try again.</p>
          <button onClick={() => navigate('/SubjectsPage')} style={{
            padding: '10px 20px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="subject-page">
      <header className="subject-header">
        <h1>
          <span>{classname || "Unknown"}</span> Class
        </h1>
        <div className="profile-section">
          <div
            className="navbar-right-subject"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <span className="profile-icon">👤</span>
            Profile
            <div
              className={`navbar-dropdown-subject ${showProfileMenu ? "show" : ""}`}
            >
              <button onClick={() => navigate("/UserProfile")}>User Settings</button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      </header>

      {/* Back Button */}
      <button className="back-button-subject-fixed" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="subject-content">
        {/* Enhanced Notes Section */}
        <div className="notes-section-v2">
          <div className="section-card-v2">
            <div className="card-header-v2">
              <div className="feature-icon-v2">📚</div>
            </div>
            <div className="card-content-v2">
              <h3 className="feature-title-v2">Course Notes</h3>
              <p className="feature-description-v2">Access and review important notes anytime, anywhere. Collaborate with classmates and organize your study materials effectively.</p>
              <button
                className="action-button-v2"
                onClick={() => navigate("/NotesPage", { state: { _id }, classname })}
              >
                <span className="btn-text-v2">View Notes</span>
                <span className="btn-arrow-v2">→</span>
              </button>
            </div>
            <div className="card-decoration-v2">
              <div className="decoration-circle-v2"></div>
              <div className="decoration-circle-v2"></div>
            </div>
          </div>
        </div>

        {/* Your Private Study Rooms - Matching Notes Design */}
        <div className="private-rooms-v2">
          <div className="section-card-v2">
            <div className="card-header-v2">
              <div className="feature-icon-v2">🏠</div>
            </div>
            <div className="card-content-v2">
              <h3 className="feature-title-v2">Your Study Rooms</h3>
              <p className="feature-description-v2">Create and manage private study spaces for focused learning and collaboration with your classmates.</p>
              <button className="action-button-v2" onClick={handleCreateRoom}>
                <span className="btn-text-v2">Create Room</span>
                <span className="btn-arrow-v2">→</span>
              </button>

              {/* Display User's Private Rooms Inside Card */}
              {userRoomsMessage && (
                <div className="alert-message-v2 error" style={{ marginTop: '1.5rem' }}>{userRoomsMessage}</div>
              )}

              {userRooms.length > 0 && (
                <div className="rooms-container-inside-card">
                  <div className="rooms-grid-inside-card">
                    {userRooms.map((room, index) => (
                      <div
                        key={index}
                        className="room-card-compact"
                        onClick={() => handleRoomClick(room)}
                      >
                        <div className="room-card-glow-compact"></div>
                        <div className="room-body-compact">
                          <h4 className="room-name-compact">{room.privateclassroomname}</h4>
                          <p className="room-teacher-compact">Hosted by {room.teacherName || 'You'}</p>
                        </div>
                        <div className="room-footer-compact">
                          <span className="enter-arrow-compact">→</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {userRooms.length === 0 && !userRoomsMessage && (
                <div className="empty-state-compact" style={{ marginTop: '1.5rem' }}>
                  <div className="empty-text-compact">No rooms yet</div>
                  <div className="empty-hint-compact">Create your first study space</div>
                </div>
              )}
            </div>
            <div className="card-decoration-v2">
              <div className="decoration-circle-v2"></div>
              <div className="decoration-circle-v2"></div>
            </div>
          </div>
        </div>

        {/* Discover Public Study Groups - Matching Notes Design */}
        <div className="public-rooms-v2">
          <div className="section-card-v2">
            <div className="card-header-v2">
              <div className="feature-icon-v2">🌐</div>
            </div>
            <div className="card-content-v2">
              <h3 className="feature-title-v2">Discover Study Groups</h3>
              <p className="feature-description-v2">Join public study groups and collaborate with students from around the world. Find study partners and expand your learning network.</p>
              <button className="action-button-v2" onClick={() => setShowSearch(true)}>
                <span className="btn-text-v2">Search Groups</span>
                <span className="btn-arrow-v2">→</span>
              </button>
            </div>
            <div className="card-decoration-v2">
              <div className="decoration-circle-v2"></div>
              <div className="decoration-circle-v2"></div>
            </div>
          </div>

          {/* Search Section */}
          {showSearch && (
            <div className="search-area-v2">
              <div className="search-box-v2">
                <div className="search-input-container-v2">
                  <span className="search-icon-v2">🔍</span>
                  <input
                    type="text"
                    className="search-field-v2"
                    placeholder="Search for study groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="search-btn-v2" onClick={handleSearch}>
                  Search
                </button>
              </div>
            </div>
          )}

          {/* Display Public Rooms */}
          {publicRoomsMessage && (
            <div className="alert-message-v2 info">{publicRoomsMessage}</div>
          )}

          {filteredPublicRooms.length > 0 && (
            <div className="rooms-container-v2">
              <div className="rooms-grid-v2">
                {filteredPublicRooms.map((room, index) => (
                  <div
                    key={index}
                    className="room-card-v2 public-room"
                    onClick={() => handleRoomClick(room)}
                  >
                    <div className="card-glow-v2"></div>
                    <div className="room-header-v2">
                      <div className="room-type-v2">
                        <span className="type-icon-v2">🌐</span>
                        <span className="type-label-v2">Public</span>
                      </div>
                      <div className="room-status-v2 active">Open</div>
                    </div>
                    <div className="room-body-v2">
                      <h3 className="room-name-v2">{room.privateclassroomname}</h3>
                      <p className="room-teacher-v2">Created by {room.teacherName || 'Community'}</p>
                    </div>
                    <div className="room-footer-v2">
                      <div className="join-indicator-v2">
                        <span>Join Group</span>
                        <span className="enter-arrow-v2">→</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredPublicRooms.length === 0 && !publicRoomsMessage && showSearch && (
            <div className="empty-state-v2">
              <div className="empty-icon-v2">🔍</div>
              <div className="empty-text-v2">No Groups Found</div>
              <div className="empty-hint-v2">Try different search terms or check back later</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Subject;