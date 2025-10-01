import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './LandingPage.css';

const LandingPage = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Display overlay after 2 seconds
    const timer = setTimeout(() => {
      setShowOverlay(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleExploreClick = () => {
    // Immediately remove the explore button and show login/signup
    setShowButtons(true);
  };

  const handleLogin = () => navigate('/login');
  const handleSignup = () => navigate('/signup');

  return (
    <div className="landing-page">
      <div className={`background-professional ${showOverlay ? 'blurred' : ''}`}></div>
      <div className="background-overlay"></div>

      {showOverlay && (
        <div className="overlay">
          <AnimatePresence>
            <motion.h1
              className="brand-name-simple"
              initial={{ opacity: 0, scale: 0.5, z: -100 }}
              animate={{ opacity: 1, scale: 1, z: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.2,
                ease: "backOut",
                type: "spring",
                stiffness: 100
              }}
            >
              EduNet
            </motion.h1>
          </AnimatePresence>

          {/* Fixed container to reserve vertical space */}
          <div className="buttons-container">
            {!showButtons ? (
              <motion.button
                className="explore-button"
                onClick={handleExploreClick}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                // Remove exit so it disappears immediately when showButtons becomes true
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                Explore
              </motion.button>
            ) : (
              <motion.div
                className="button-group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.button
                  className="login-button animate"
                  onClick={handleLogin}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  Login
                </motion.button>
                <motion.button
                  className="signup-button animate"
                  onClick={handleSignup}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  Signup
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
