import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TeacherSubmissionsPage.css';

const TeacherSubmissionsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { assignmentId } = location.state || {}; // Get assignment ID from state
  const [submissions, setSubmissions] = useState([]); // Store submissions
  const [assignmentDetails, setAssignmentDetails] = useState(null); // Store assignment details
  const [errorMessage, setErrorMessage] = useState(''); // Store error messages

  // Fetch submissions for the assignment on mount
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await axios.post(
          'http://localhost:5000/getSubmissions',
          { assignmentid: assignmentId }
        );

        if (response.status === 200) {
          console.log('Submissions fetched:', response.data.data);
          setSubmissions(response.data.data);
        } else {
          setErrorMessage('No submissions found for this assignment.');
        }
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setErrorMessage('An error occurred while fetching submissions.');
      }
    };

    fetchSubmissions();
  }, [assignmentId]);

  // Decode base64 to Blob for file download
  const base64ToBlob = (base64, type) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length).fill(null).map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type });
  };

  const downloadFile = (base64, type, filename) => {
    const blob = base64ToBlob(base64, type);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  // Delete a submission
  const handleDeleteSubmission = async (submissionId) => {
    try {
      const response = await axios.delete(
        'http://localhost:5000/deleteAssignmentSubmission',
        {
          data: { assignmentSubmissionId: submissionId }, // Pass ID in the request body
        }
      );

      if (response.status === 200) {
        alert('Submission deleted successfully!');
        setSubmissions((prev) => prev.filter((submission) => submission._id !== submissionId));
      } else {
        alert('Failed to delete submission. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('An error occurred while deleting the submission.');
    }
  };

  return (
    <>
      <div className="teacher-submissions-page">
        <button className="back-button-submissions" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2>Submissions for Assignment</h2>
        {assignmentDetails && (
          <div className="assignment-details">
            <h3>{assignmentDetails.title}</h3>
            <p>{assignmentDetails.desc}</p>
            <p><strong>Due Date:</strong> {assignmentDetails.duedate}</p>
          </div>
        )}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="submissions-container">
          {submissions.length > 0 ? (
            <ul className="submissions-list">
              {submissions.map((submission) => (
                <li key={submission._id} className="submission-item">
                  <p><strong>Student Email:</strong> {submission.email}</p>
                  <p><strong>Description:</strong> {submission.description}</p>
                  {submission.base64string && (
                    <p>
                      <strong>Attachment:</strong>{' '}
                      <button
                        className="download-button"
                        onClick={() =>
                          downloadFile(
                            submission.base64string,
                            submission.filetype,
                            `${submission.email}_submission.${submission.filetype.split('/')[1]}`
                          )
                        }
                      >
                        Download
                      </button>
                    </p>
                  )}
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteSubmission(submission._id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No submissions yet.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default TeacherSubmissionsPage;
