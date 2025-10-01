import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./UserProfile.css";

const UserProfile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullname: user?.fullname || "",
    oldPassword: "",
    newPassword: "",
  });
  const [modalErrorMessage, setModalErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setModalErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async () => {
    if (modalType === "name") {
      if (!formData.fullname.trim()) {
        setModalErrorMessage("Name cannot be empty.");
        return;
      }
      if (!formData.oldPassword.trim()) {
        setModalErrorMessage("Please enter your current password.");
        return;
      }

      setIsLoading(true);
      try {
        // First verify current password by attempting login
        const loginResponse = await axios.post("http://localhost:5000/login", {
          email: user.email,
          password: formData.oldPassword
        });

        if (loginResponse.status !== 200) {
          setModalErrorMessage("Incorrect current password.");
          setIsLoading(false);
          return;
        }

        // If password correct, update name
        const response = await axios.put(
          "http://localhost:5000/updateUserDetails",
          {
            email: user.email,
            fullname: formData.fullname,
          }
        );

        if (response.status === 200) {
          const updatedUser = response.data.data;
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setSuccessMessage("Name updated successfully!");
          setShowModal(false);
          setFormData({ ...formData, oldPassword: "" });
        }
      } catch (error) {
        if (error.response?.status === 202) {
          setModalErrorMessage("Incorrect current password.");
        } else {
          setModalErrorMessage("Failed to update name. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    } else if (modalType === "password") {
      if (!formData.oldPassword.trim()) {
        setModalErrorMessage("Please enter your current password.");
        return;
      }
      if (!formData.newPassword.trim()) {
        setModalErrorMessage("New password cannot be empty.");
        return;
      }
      if (formData.newPassword.length < 8) {
        setModalErrorMessage("New password must be at least 8 characters long.");
        return;
      }

      setIsLoading(true);
      try {
        // First verify current password
        const loginResponse = await axios.post("http://localhost:5000/login", {
          email: user.email,
          password: formData.oldPassword
        });

        if (loginResponse.status !== 200) {
          setModalErrorMessage("Incorrect current password.");
          setIsLoading(false);
          return;
        }

        // If password correct, update to new password
        const response = await axios.put(
          "http://localhost:5000/updateUserDetails",
          {
            email: user.email,
            password: formData.newPassword,
          }
        );

        if (response.status === 200) {
          setSuccessMessage("Password updated successfully!");
          setShowModal(false);
          setFormData({ ...formData, oldPassword: "", newPassword: "" });
        }
      } catch (error) {
        if (error.response?.status === 202) {
          setModalErrorMessage("Incorrect current password.");
        } else {
          setModalErrorMessage("Failed to update password. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div>
      <div className="user-profile-container">
        <div className="user-profile-content">
          <div className="profile-header">
            <button className="back-button-profile" onClick={() => navigate("/Subjectspage")}>
              ← Back to Subjects
            </button>
            <div className="contact-header">
              <div className="contact-logo">
                <div className="profile-avatar animate-float">
                  {user?.fullname?.charAt(0)?.toUpperCase() || "U"}
                </div>
              </div>
              <h2 className="contact-title">User Profile</h2>
            </div>
          </div>

          <div className="user-profile">
            {successMessage && (
              <p className="success-message">{successMessage}</p>
            )}

            <div className="profile-section">
              <label className="profile-label">Name</label>
              <p className="profile-text">{user?.fullname || "N/A"}</p>
              <button
                className="btn-edit"
                onClick={() => {
                  setModalType("name");
                  setShowModal(true);
                }}
              >
                Change Name
              </button>
            </div>

            <div className="profile-section">
              <label className="profile-label">Email</label>
              <p className="profile-text">{user?.email || "N/A"}</p>
            </div>

            <div className="profile-section">
              <label className="profile-label">Password</label>
              <p className="profile-text-password">••••••••••••</p>
              <button
                className="btn-edit"
                onClick={() => {
                  setModalType("password");
                  setShowModal(true);
                }}
              >
                Change Password
              </button>
            </div>
          </div>

          {showModal && (
            <div className="modal-overlay">
              <div className="centered-modal">
                <h3 className="modal-title">
                  {modalType === "name" ? "Change Name" : "Change Password"}
                </h3>

                {modalErrorMessage && (
                  <p className="modal-error-message">{modalErrorMessage}</p>
                )}

                <div className="modal-section">
                  {modalType === "name" && (
                    <>
                      <label className="modal-label">New Name:</label>
                      <input
                        type="text"
                        name="fullname"
                        value={formData.fullname}
                        onChange={handleInputChange}
                        className="modal-input"
                      />
                      <label className="modal-label">Password:</label>
                      <input
                        type="password"
                        name="oldPassword"
                        onChange={handleInputChange}
                        className="modal-input"
                      />
                    </>
                  )}

                  {modalType === "password" && (
                    <>
                      <label className="modal-label">Old Password:</label>
                      <input
                        type="password"
                        name="oldPassword"
                        onChange={handleInputChange}
                        className="modal-input"
                      />
                      <label className="modal-label">New Password:</label>
                      <input
                        type="password"
                        name="newPassword"
                        onChange={handleInputChange}
                        className="modal-input"
                      />
                    </>
                  )}
                </div>

                <div className="modal-actions">
                  <button
                    className="btn-save"
                    onClick={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="profile-spinner"></span>
                        Saving...
                      </>
                    ) : (
                      'Save'
                    )}
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => setShowModal(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;