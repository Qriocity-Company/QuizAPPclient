import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaChevronDown } from 'react-icons/fa'; // Icons for leaderboard
import Navbar from '../components/Navbar';
import AdminNavbar from '../components/AdminNavbar'
const AdminLeaderboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [leaderboards, setLeaderboards] = useState({});
  const [expandedQuiz, setExpandedQuiz] = useState(null); // Track which quiz is expanded
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/quizzes', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setQuizzes(response.data);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    };

    fetchQuizzes();
  }, []);

  

  const fetchLeaderboard = async (quizId) => {
    if (leaderboards[quizId]) {
      // If leaderboard already fetched, toggle visibility
      setExpandedQuiz(expandedQuiz === quizId ? null : quizId);
      return;
    }
    
    try {
      const response = await axios.get(`http://localhost:5000/api/quizzes/${quizId}/leaderboard`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setLeaderboards(prev => ({ ...prev, [quizId]: response.data }));
      setExpandedQuiz(quizId); // Expand the current quiz
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  return (
    <div>
      
      <AdminNavbar />
      
      <div className="p-8 bg-gradient-to-br from-blue-100 to-blue-300 min-h-screen">
        <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-10">Leaderboard</h1>
        <div className="flex flex-col items-center"> {/* Center the items */}
          {quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <div key={quiz._id} className="bg-white w-2/4 p-6 rounded-lg shadow-md mb-4 transition-transform transform">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-blue-700 flex items-center">
                    <FaTrophy className="mr-2 text-yellow-500" />
                    {quiz.title}
                  </h2>
                  <button
                    onClick={() => fetchLeaderboard(quiz._id)}
                    className="p-3 bg-blue-500 text-white rounded-lg transition duration-200 hover:bg-blue-600"
                  >
                    <FaChevronDown className={`${expandedQuiz === quiz._id ? 'transform rotate-180' : ''}`} />
                  </button>
                </div>
                <div
                  style={{
                    maxHeight: expandedQuiz === quiz._id ? '300px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease-in-out', // Smooth transition for height
                  }}
                >
                  {expandedQuiz === quiz._id && leaderboards[quiz._id] && (
                    <ul className="mt-4">
                      {leaderboards[quiz._id].map((entry, index) => (
                        <li key={index} className="flex justify-between py-2 border-b border-gray-300">
                          <span className="font-semibold">{entry.username}</span>
                          <span className="text-blue-600">{entry.score}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-center">No quizzes available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLeaderboard;
