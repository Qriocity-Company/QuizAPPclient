// client/src/components/QuizForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaCheck } from 'react-icons/fa';
import { IoIosArrowRoundBack } from "react-icons/io";
import AdminNavbar from '../components/AdminNavbar';

const AquizForm = () => {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [timeLimit, setTimeLimit] = useState(0);
  const navigate = useNavigate();



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://angularbackend-o18e.onrender.com/api/aquizzes/a', {
        title,
        difficulty,
        timeLimit,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Error creating quiz. Please try again.');
    }
  };

  return (
    <div>
      <AdminNavbar />
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-200 to-purple-200 p-4">
        <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white p-8 shadow-lg rounded-lg space-y-6">
          <a href="/admin/dashboard"><div className="absolute translate-y-5 hover:scale-125 transition-all duration-300 cursor-pointer translate-x-4"><IoIosArrowRoundBack size={40} /></div></a>
          <h2 className="text-3xl font-bold text-center text-gray-800">Create a New Quiz</h2>

          <div className="space-y-2">
            <label className="block text-gray-600">Quiz Title</label>
            <input
              type="text"
              placeholder="Quiz Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-purple-500"
            />
          </div>

          <label className="block text-gray-600">Select Quiz Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-purple-500"
                  required
                >
                  <option value="" disabled>Select Quiz Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>

          <div className="space-y-2">
            <label className="block text-gray-600">Time Limit for Quiz (seconds)</label>
            <input
              type="number"
              placeholder="Enter total time limit for the quiz"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex justify-center">
            
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg focus:outline-none transition duration-200"
            >
              <FaCheck className="mr-2" /> Create Quiz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AquizForm;
