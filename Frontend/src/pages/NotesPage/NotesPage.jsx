import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./NotesPage.css";

// PDF processing now handled entirely by the backend

const NotesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { classname, _id: classroomid } = location.state || {};
  const user = JSON.parse(localStorage.getItem("user"));

  const [showModal, setShowModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [newNote, setNewNote] = useState({
    name: "",
    description: "",
    file: null,
  });

  // Same as code 2: we store notes from the server
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ----------------------------------------------
  // Fetch notes on mount
  // ----------------------------------------------
  useEffect(() => {
    const fetchNotes = async () => {
      if (!classroomid) {
        console.error("Classroom ID is missing");
        setError("Classroom ID not found.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        console.log("Fetching notes for classroomid:", classroomid);

        // Add cache busting parameter to force fresh data
        const response = await axios.post("http://localhost:5000/getnotes", {
          classroomid,
        }, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (response.status === 200) {
          const data = Array.isArray(response.data) ? response.data : [];
          console.log("📝 Fetched notes:", data.map(note => ({
            id: note._id,
            title: note.title,
            hasFileUrl: !!note.fileUrl
          })));
          setNotes(data);
        } else {
          setNotes([]);
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
        setError("");
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [classroomid]);

  // ----------------------------------------------
  // Handle text inputs
  // ----------------------------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNote({ ...newNote, [name]: value });
  };

  // ----------------------------------------------
  // Only allow PDF uploads
  // ----------------------------------------------
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setErrorMessage("Only PDF files are allowed.");
      setShowErrorModal(true);
      return;
    }
    setNewNote({ ...newNote, file });
  };

  // PDF text extraction and content moderation now handled by backend

  // Since we only allow PDFs, simplified file extension logic
  const getFileExtension = (mimeType) => {
    return 'pdf'; // Only PDFs are allowed
  };

  // Content moderation is now handled entirely by the backend

  // ----------------------------------------------
  // handleNoteSubmit
  // Send file directly to backend for processing and content moderation
  // ----------------------------------------------
  const handleNoteSubmit = async (e) => {
    e.preventDefault();

    if (!newNote.file) {
      setErrorMessage("Please select a PDF file.");
      setShowErrorModal(true);
      return;
    }

    setIsUploading(true);
    try {
      // Send file directly to backend for processing
      const formData = new FormData();
      formData.append("title", newNote.name);
      formData.append("content", newNote.description);
      formData.append("file", newNote.file);
      formData.append("classroomid", classroomid);
      formData.append("email", user.email);

      const response = await axios.post(
        "http://localhost:5000/notes",
        formData
      );

      if (response.status === 201) {
        // Add the new note to our notes array
        setNotes([...notes, response.data.note]);
        // Reset form fields & close modal
        setNewNote({ name: "", description: "", file: null });
        setShowModal(false);
      }
    } catch (err) {
      console.error("Failed to upload file:", err);
      console.error("Response data:", err.response?.data);
      console.error("Response status:", err.response?.status);

      // Show the actual server error message if available
      const serverMessage = err.response?.data?.message || "Something went wrong. Please try again later.";
      setErrorMessage(serverMessage);
      setShowErrorModal(true);
    } finally {
      setIsUploading(false);
    }
  };

  // ----------------------------------------------
  // Render UI
  // ----------------------------------------------
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="notes-page-wrapper">
      {/* Fixed Buttons - Outside scrollable container */}
      <button className="back-button-notes-fixed" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <div className="profile-section-notes">
        <div
          className="navbar-right-notes"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        >
          <span className="profile-icon">👤</span>
          Profile
          <div
            className={`navbar-dropdown-notes ${showProfileMenu ? "show" : ""}`}
          >
            <button onClick={() => navigate("/UserProfile")}>User Settings</button>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>

      <div className="notes-page-container">
        <div className="notes-header-enhanced">

        </div>

        <button className="btn-upload" onClick={() => setShowModal(true)}>
          Upload Notes (PDF only)
        </button>

        {/* Upload Modal */}
        {showModal && (
          <div className="custom-modal">
            <div className="custom-modal-content">
              <h2 className="modal-title">Upload PDF Notes</h2>
              <form onSubmit={handleNoteSubmit}>
                <div className="modal-section">
                  <label className="modal-label">Note Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={newNote.name}
                    onChange={handleInputChange}
                    className="modal-input"
                    required
                  />
                </div>
                <div className="modal-section">
                  <label className="modal-label">Description:</label>
                  <textarea
                    name="description"
                    value={newNote.description}
                    onChange={handleInputChange}
                    className="modal-textarea"
                    required
                  />
                </div>
                <div className="modal-section">
                  <label className="modal-label">Upload File (PDF only):</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="modal-input"
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-save" disabled={isUploading}>
                    {isUploading ? (
                      <>
                        <span className="loader"></span>
                        Uploading...
                      </>
                    ) : (
                      'Submit'
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn-save"
                    onClick={() => setShowModal(false)}
                    disabled={isUploading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Error Modal */}
        {showErrorModal && (
          <div className="custom-modal">
            <div className="custom-modal-content">
              <h2 className="modal-title">Error</h2>
              <p className="error-modal-message">{errorMessage}</p>
              <div className="modal-actions">
                <button
                  className="btn-save"
                  onClick={() => setShowErrorModal(false)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="notes-grid">
          {notes.length > 0 ? (
            notes.map((note, index) => (
              <div key={index} className="note-card">
                {/* Add this circle section just like Subjects */}
                <div className="circle">
                  <h3>{note.title}</h3>
                </div>

                {/* Card Content */}
                <div className="content">
                  <p>{note.content}</p>
                  {note.fileUrl && (
                    <div className="note-actions">
                      <a
                        href={`http://localhost:5000/serve-file/${note._id}?download=true`}
                        className="note-link"
                        onClick={() => {
                          console.log('⬇️ Download clicked for note:', note._id);
                          console.log('🔗 Download URL:', `http://localhost:5000/serve-file/${note._id}?download=true`);
                        }}
                      >
                        Download PDF
                      </a>
                      <a
                        href={`http://localhost:5000/serve-file/${note._id}?download=false`}
                        className="note-link view-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          console.log('👁️ View clicked for note:', note._id);
                          console.log('🔗 View URL:', `http://localhost:5000/serve-file/${note._id}?download=false`);
                        }}
                      >
                        View PDF
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-notes">
              <p className="no-notes-message">No notes available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesPage;