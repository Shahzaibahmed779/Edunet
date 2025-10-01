import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const goToUserProfile = () => {
    navigate("/UserProfile");
  };

  // Hide on scroll
  useEffect(() => {
    let lastScrollTop = 0;
    const navbar = document.querySelector(".navbar-container");

    const onScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > lastScrollTop) {
        navbar.style.top = "-80px";
      } else {
        navbar.style.top = "0";
      }
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="navbar-container">
      <div className="navbar-left">
        {/* Welcome text removed as requested */}
      </div>

      <div
        className="navbar-right"
        onClick={() => setDropdownVisible(!dropdownVisible)}
      >
        Profile
        <div
          className={`navbar-dropdown ${dropdownVisible ? "show" : ""}`}
        >
          <button onClick={goToUserProfile}>User Settings</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
