import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaHome, FaTrophy, FaPeopleCarry, FaUsersSlash, FaUsers } from 'react-icons/fa';

const AdminNavbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleDropdown = (isOpen) => {
    setDropdownOpen(isOpen);
  };

  return (
    <nav className="bg-blue-600 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo Section */}
        <div className="text-white text-2xl font-bold">
          <Link to="/">Teacher Portal</Link>
        </div>

        {/* Links Section */}
        <div className="flex space-x-4 items-center">
          <Link
            to="/admin/dashboard"
            className="text-white hover:bg-blue-500 rounded px-3 py-2 transition duration-300 flex items-center"
          >
            <FaHome className="mr-2" /> Home
          </Link>

          <Link
            to="/admin/students"
            className="text-white hover:bg-blue-500 rounded px-3 py-2 transition duration-300 flex items-center"
          >
            <FaUsers className="mr-2" /> Students
          </Link>

          <Link
            to="/admin/leaderboard"
            className="text-white hover:bg-blue-500 rounded px-3 py-2 transition duration-300 flex items-center"
          >
            <FaTrophy className="mr-2" /> Leaderboard
          </Link>

          {/* Profile Icon with Dropdown */}
          <div
            className="relative  p-4"
            onMouseEnter={() => toggleDropdown(true)}
            onMouseLeave={() => toggleDropdown(false)}
          >
            <FaUserCircle size={30} className="text-white cursor-pointer" />

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg py-2 z-10"
                onMouseEnter={() => toggleDropdown(true)}
                onMouseLeave={() => toggleDropdown(false)}
              >
                
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
