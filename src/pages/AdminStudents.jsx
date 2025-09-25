import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrophy } from 'react-icons/fa'; // Icon for leaderboard
import AdminNavbar from '../components/AdminNavbar';
import { useNavigate } from 'react-router-dom';

const AdminStudents = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchStudents = async () => {
      const token = localStorage.getItem('token')
      try {
        const response = await axios.get('https://angularbackend-o18e.onrender.com/api/students', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, []);

  const handleStudentClick = (user) => {
    navigate('/admin/studentprofile', { state: user });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <AdminNavbar />

      <div className="p-8">
        <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-10">All Students</h1>
        <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
          {users.length > 0 ? (

            <div className="space-y-6">
              {users.map((user) => (
                
                <div
                  onClick={() => handleStudentClick(user)}
                  key={user._id}
                  className="border cursor-pointer border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-gradient-to-r from-white to-blue-50"
                >
                
                  <h2 className="text-xl font-semibold text-gray-700">
                    {user.username}
                  </h2>
                 
                  <ul className="mt-4 space-y-2">
                    {user.scores.length > 0 ? (
                      user.scores.map((score, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between bg-blue-100 rounded-md px-4 py-2 shadow-sm"
                        >
                          <span className="text-gray-800 font-medium">
                            {score.quizId.title}
                          </span>
                          <span className="text-blue-700 font-bold flex items-center">
                            <FaTrophy className="mr-2" /> {score.score}
                          </span>
                        </li>
                      ))
                    ) : (
                      <p className="text-gray-500">No scores available</p>
                    )}
                  </ul>
                </div>
                
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No students found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStudents;
