// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
// import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./List_of_private_roomss.css";

// Receive subjectName as a prop
// eslint-disable-next-line react/prop-types
const List_of_private_rooms = ({ subjectName }) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]); // State for all rooms
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [filteredRooms, setFilteredRooms] = useState([]); // State for filtered results

  // Fetch rooms from API when component mounts
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // eslint-disable-next-line no-undef
        const response = await axios.get("/api/rooms"); // Replace with actual backend endpoint
        setRooms(response.data); // Update rooms state
        setFilteredRooms(response.data); // Initialize filtered rooms
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    fetchRooms();
  }, []);

  // Filter rooms based on search term
  const handleSearch = () => {
    const results = rooms.filter((room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRooms(results);
  };

  // Navigate to room password page
  const handleRoomClick = (room) => {
    navigate("/EnterRoomPassword", { state: { room } });
  };

  // Navigate to CreateRoom page, passing the subject name
  const handleCreateRoom = () => {
    navigate("/CreateRoom", { state: { subjectName } });
  };

  return (
    <div className="private-rooms shadow-md bg-blue-50 rounded-lg p-6">
      <h2 className="private-rooms-title text-blue-700 text-xl font-bold mb-4">
        Search Private Rooms
      </h2>
      <div className="search-container flex items-center mb-4">
        <input
          type="text"
          className="search-input flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search private room"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          className="btn-search bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>
      <ul className="room-list space-y-2">
        {filteredRooms.map((room, index) => (
          <li
            key={index}
            className="room-item bg-white p-3 rounded-md shadow hover:bg-blue-100 cursor-pointer"
            onClick={() => handleRoomClick(room)}
          >
            <div className="room-link text-blue-600 font-medium">
              {room.name} <br />
              <span className="text-gray-500 text-sm">{room.teacher}</span>
            </div>
          </li>
        ))}
      </ul>
      <button
        className="btn-create-room mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
        onClick={handleCreateRoom}
      >
        Create New Room
      </button>
    </div>
  );
};

export default List_of_private_rooms;
