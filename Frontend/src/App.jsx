import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import Tab from "./components/Tab/Tab";
import StreamSection from "./pages/StreamSection/StreamSection";
import TeacherSubmissionsPage from "./pages/TeacherSubmissionsPage/TeacherSubmissionsPage";
import Subject from "./pages/Subject/Subject";
import CreateRoom from "./pages/CreateRoom/CreateRoom";
import EnterRoomPassword from "./pages/EnterRoomPassword/EnterRoomPassword";
import SubjectsPage from "./pages/SubjectsPage/SubjectsPage";
import UserProfile from "./pages/UserProfile/UserProfile";
import RouteProtect from "./RouteProtect";
import NotesPage from "./pages/NotesPage/NotesPage";
import LandingPage from "./pages/LandingPage/LandingPage";
import MeetRoom from "./pages/MeetRoom/MeetRoom";
import Home from "./pages/Home/Home";
// Import Bootstrap CSS in your main JavaScript or React file (like index.js or App.js)
import 'bootstrap/dist/css/bootstrap.min.css';
import { SocketContextProvider } from './context/SocketContext';


const App = () => {
  return (
    <div className="app">
      <SocketContextProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/Login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route path="/Tab" element={<RouteProtect><Tab /></RouteProtect>} />
        <Route path="/StreamSection" element={<RouteProtect><StreamSection /></RouteProtect>} />
        <Route path="/Teachersub" element={<RouteProtect><TeacherSubmissionsPage /></RouteProtect>} />
        <Route path="/Subject" element={<RouteProtect><Subject /></RouteProtect>} />
        <Route path="/NotesPage" element={<RouteProtect><NotesPage /></RouteProtect>} />
        <Route path="/CreateRoom" element={<RouteProtect><CreateRoom /></RouteProtect>} />
        <Route path="/EnterRoomPassword" element={<RouteProtect><EnterRoomPassword /></RouteProtect>} />
        <Route path="/SubjectsPage" element={<RouteProtect><SubjectsPage /></RouteProtect>} />
        <Route path="/UserProfile" element={<RouteProtect><UserProfile /></RouteProtect>} />
        <Route path="/" element={<LandingPage />} /> {/* Landing Page Route */}
        <Route path="/meet/:id" element={  <MeetRoom />} />
        <Route exact path="/Home" element={  <Home /> } />



        <Route path="/notes" element={
            <RouteProtect>
              <NotesPage />
            </RouteProtect>
          }
        />

      </Routes>
      </SocketContextProvider>
    </div>
  );
};

export default App;