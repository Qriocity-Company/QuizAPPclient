import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LZString from 'lz-string';

const UserDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [aquizzes, setAquizzes] = useState([]);
  const [challengeInputs, setChallengeInputs] = useState({});
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const storedUser = LZString.decompress(localStorage.getItem('user'));
  const user = JSON.parse(storedUser);

  const handleChallenge = async (quizId) => {
    const response = await fetch('https://angularbackend-o18e.onrender.com/api/challenges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quizId: quizId,
        challengerId: user._id,
        challengedUsername: username,
      }),
    });
    const result = await response.json();
    if (response.ok) {
      alert('Challenge created successfully!');
      setChallengeInputs((prev) => ({ ...prev, [quizId]: false })); // Hide input after success
    } else {
      alert(result.error);
    }
  };

  const toggleChallengeInput = (quizId) => {
    setChallengeInputs((prev) => ({
      ...prev,
      [quizId]: !prev[quizId], // Toggle visibility for the specific quiz
    }));
  };

  useEffect(() => {

    const token = localStorage.getItem('token');
    console.log("TOKENNNN : ",token)
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get('https://angularbackend-o18e.onrender.com/api/quizzes', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setQuizzes(response.data);
        console.log("Normal Quiz : ", response.data);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    };

    const fetchAquizzes = async () => {
      try {
        const response = await axios.get('https://angularbackend-o18e.onrender.com/api/aquizzes/a', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAquizzes(response.data);
        console.log("Auto Quizzes : ", response.data);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    };

    fetchQuizzes();
    fetchAquizzes();
  }, []);

  const attemptQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  const attemptAquiz = (quizId) => {
    navigate(`/aquiz/${quizId}`);
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-700 mb-8">Available Quizzes</h1>
          <h1 className="text-3xl font-bold text-gray-700 mb-8">Welcome {user.username}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-8">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-gray-800">{quiz.title}</h3>
                <p className="text-gray-500 mt-2">Test your knowledge with this quiz!</p>
                <button
                  onClick={() => attemptQuiz(quiz.id)}
                  disabled={quiz.hasAttempted}
                  className={`mt-4 px-4 py-2 ${quiz.hasAttempted ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg transition duration-200`}
                >
                  {quiz.hasAttempted ? 'Already Attempted' : 'Attempt Quiz'}
                </button>
              </div>
            ))}
            {aquizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-gray-800">{quiz.title}</h3>
                <p className="text-gray-500 mt-2">Test your knowledge with this quiz!</p>
                <button
                  onClick={() => attemptAquiz(quiz.id)}
                  disabled={quiz.hasAttempted}
                  className={`mt-4 px-4 py-2 ${quiz.hasAttempted ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg transition duration-200`}
                >
                  {quiz.hasAttempted ? 'Already Attempted' : 'Attempt Quiz'}
                </button>
                
              </div>
            ))} 
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
