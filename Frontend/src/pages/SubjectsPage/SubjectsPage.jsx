import React, { useState, useEffect } from "react";
import "./SubjectsPage.css"; // Custom styles
import axios from "axios"; // Axios for API requests
import { useNavigate } from "react-router-dom"; // React Router for navigation

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]); // State to hold subjects data
  const [isModalOpen, setIsModalOpen] = useState(false); // Track modal visibility
  const [newSubject, setNewSubject] = useState({ name: "", description: "" }); // Form input state
  const [message, setMessage] = useState(""); // State for success/error messages
  const [showProfileMenu, setShowProfileMenu] = useState(false); // Profile menu state
  const navigate = useNavigate(); // React Router navigation function
  const token = localStorage.getItem("authToken");

  // Function to format subject names with proper hyphenation
  const formatSubjectName = (name) => {
    if (!name) return "";

    // If it's a single word longer than 12 characters, add hyphenation
    if (!name.includes(" ") && name.length > 12) {
      const midPoint = Math.ceil(name.length / 2);
      return name.substring(0, midPoint) + "-" + name.substring(midPoint);
    }

    return name;
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.post("http://localhost:5000/fetchClass");
        const fetchedSubjects = Array.isArray(response.data)
          ? response.data
          : [];
        setSubjects(fetchedSubjects);
        setMessage(""); // Clear any previous error messages
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setMessage("Error fetching subjects");
      }
    };
    fetchSubjects(); // Call the function immediately
  }, []);

  const handleAddSubject = async () => {
    try {
      const response = await axios.post("http://localhost:5000/addClass", {
        classname: newSubject.name,
        desc: newSubject.description,
      });

      if (response.status === 201) {
        setMessage(response.data.message);
        setSubjects([...subjects, response.data.data]); // Add the newly created class to the list
        setNewSubject({ name: "", description: "" }); // Reset form inputs
        setIsModalOpen(false); // Close modal
      }
    } catch (error) {
      console.error("Error adding subject:", error);
      setMessage(error.response?.data?.message || "Error adding subject");
    }
  };

  const handleViewDetails = (subject) => {
    // Navigate to the Subject page, passing subject as state
    navigate("/subject", { state: subject });
  };

  window.scrollTo({
    top: 0, // Scroll to the top; change to desired Y position
    behavior: "smooth",
  });

  return (
    <div className="bg-set">
      <div className="profile-section-subjects">
        <div
          className="navbar-right-subjects"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        >
          <span className="profile-icon">👤</span>
          Profile
          <div
            className={`navbar-dropdown-subjects ${showProfileMenu ? "show" : ""}`}
          >
            <button onClick={() => navigate("/UserProfile")}>User Settings</button>
            <button onClick={() => {
              localStorage.removeItem("authToken");
              localStorage.removeItem("user");
              navigate("/login");
            }}>Logout</button>
          </div>
        </div>
      </div>
      {/* Hero Section with Title and Add Button */}
      <div className="subjects-hero-section">
        <div className="hero-content">
          <h1 className="page-title">
            My Learning Hub
          </h1>
          <p className="page-subtitle">Manage your subjects and collaborative spaces</p>
          <button onClick={() => setIsModalOpen(true)} className="add-subject-btn-hero">
            <span className="btn-icon" style={{ color: '#007bff', fontSize: '2.5rem' }}>+</span>
            Add More Subjects
          </button>
        </div>
        <div className="hero-decoration">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
      </div>

      {/* Display success/error message */}
      {message && <p className="message">{message}</p>}

      {/* Subjects Grid Section */}
      <div className="subjects-main-container">
        <div className={`subjects-grid ${subjects.length === 3 ? 'three-tiles' : subjects.length % 2 === 1 ? 'odd-tiles' : 'even-tiles'}`}>
          {subjects.length > 0 ? (
            subjects.map((subject) => (
              <div key={subject._id} className="subject-card">
                <div className="circle">
                  <h3>{formatSubjectName(subject.classname)}</h3>
                </div>
                <div className="content">
                  <p>{subject.desc}</p>
                  <button
                    onClick={() => handleViewDetails(subject)}
                    className="details-button"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-subjects-card">
              <div className="empty-state-icon">📖</div>
              <h3>Start Your Learning Journey</h3>
              <p>No subjects created yet. Click the button above to add your first subject!</p>
            </div>
          )}
        </div>
      </div>

      {/* Custom Modal for Adding New Subject */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="custom-modal">
            <input
              type="text"
              placeholder="Subject Name"
              value={newSubject.name}
              onChange={(e) =>
                setNewSubject({ ...newSubject, name: e.target.value })
              }
              className="input-field"
            />
            <textarea
              placeholder="Description (max 200 characters)"
              value={newSubject.description}
              onChange={(e) =>
                setNewSubject({
                  ...newSubject,
                  description: e.target.value,
                })
              }
              className="textarea-field"
              maxLength={200}
            />
            <div className="character-count">
              {newSubject.description.length}/200 characters
            </div>
            <div className="modal-actions">
              <button
                onClick={handleAddSubject}
                className="modal-add-button"
              >
                Confirm
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="modal-add-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectsPage;