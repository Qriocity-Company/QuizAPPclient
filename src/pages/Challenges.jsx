import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaChevronDown } from 'react-icons/fa'; // Icons for leaderboard
import Navbar from '../components/Navbar';
import AdminNavbar from '../components/AdminNavbar'
import LZString from 'lz-string';


const Challenges = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [leaderboards, setLeaderboards] = useState({});
  const [expandedQuiz, setExpandedQuiz] = useState(null); // Track which quiz is expanded
  const navigate = useNavigate();
    const [challenges, setChallenges] = useState([]);
    const storedUser = LZString.decompress(localStorage.getItem('user'));
      const user = JSON.parse(storedUser);

    const attemptQuiz = (quizId, challengeId, userType) => {
        navigate(`/challengequiz/${quizId}/${challengeId}/${userType}`);
      };

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/challenges/user/${user._id}`); // Use user._id as userId
        if (response.ok) {
          const result = await response.json();
          setChallenges(result);
          console.log(result);
        } else {
          console.error('Failed to fetch challenges:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching challenges:', error.message);
      }
    };

    if (user?._id) fetchChallenges();
  }, [user?._id]);

  

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
      
      <Navbar />
      
      <div className="p-8 bg-gradient-to-br from-blue-100 to-blue-300 min-h-screen">
        <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-10">Your Challenges</h1>
        <div className="flex flex-col items-center"> {/* Center the items */}
        <div className="p-6 w-[700px] border border-gray-300 rounded-lg shadow-xl bg-gradient-to-br from-blue-50 to-blue-100">
        
        {challenges.length > 0 ? (
          challenges.map((challenge) => (
            <div
              key={challenge._id}
              className="mb-6 p-4 bg-white rounded-lg shadow-md border border-gray-200"
            >
              <h3 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
                Quiz: <span className="text-blue-500">{challenge.quizId?.title || 'Unknown Quiz'}</span>
              </h3>
              <div className='text-center my-2'>
        <button
          onClick={() => {
            const userType = user._id === challenge.challenger._id ? 'challenger' : 'challenged';
            attemptQuiz(challenge.quizId._id, challenge._id, userType);
          }}
          className='bg-amber-200 p-2 mb-4 rounded-md hover:bg-amber-700 hover:text-white transition-all duration-300 hover:shadow-md hover:shadow-gray-400'
        >
          Attempt
        </button>
      </div>
              

              <div className="flex items-center justify-center">
                {/* Challenger */}
                <div className="flex-1 text-center border-r border-gray-300">
                  <h4 className="text-xl font-bold text-indigo-600">Challenger</h4>
                  <p className="text-lg font-medium text-gray-700 mt-2">
                    {challenge.challenger?.username || 'Unknown'}
                    {user._id === challenge.challenger?._id && ' (You)'}
                  </p>
                  <p className="text-lg text-gray-600 mt-1">
                    Score: <span className="text-indigo-500 font-semibold">{challenge.challengerScore ?? 'Pending'}</span>
                  </p>
                </div>

                {/* Versus */}
                <div className="px-4">
                  <h4 className="text-3xl font-bold text-gray-500">VS</h4>
                </div>

                {/* Challenged */}
                <div className="flex-1 border-l border-gray-300 text-center">
                  <h4 className="text-xl font-bold text-emerald-600">Challenged</h4>
                  <p className="text-lg font-medium text-gray-700 mt-2">
                    {challenge.challenged?.username || 'Unknown'}
                    {user._id === challenge.challenged?._id && ' (You)'}
                  </p>
                  <p className="text-lg text-gray-600 mt-1">
                    Score: <span className="text-emerald-500 font-semibold">{challenge.challengedScore ?? 'Pending'}</span>
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 italic text-center mt-4">No challenges found.</p>
        )}
      </div>
        </div>
      </div>
    </div>
  );
};

export default Challenges;
