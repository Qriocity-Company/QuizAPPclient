// client/src/pages/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'
import LZString from 'lz-string';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://angularbackend-o18e.onrender.com/api/auth/login', {
        username,
        password,
      });
      
      const { token, role, user } = response.data; // Expecting role from response
     
      localStorage.setItem('token', token);
      const compressedUser = LZString.compress(JSON.stringify(user));
      localStorage.setItem('user', compressedUser);
      if (role === 'admin') {
        navigate('/admin/dashboard'); // Redirect to admin dashboard
      } else {
        navigate('/dashboard'); // Redirect to user dashboard
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Error logging in. ');
    }
  };

  return (
    <div>
  
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-blue-800">
       
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-sm w-full">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition duration-200"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{' '}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
    </div>
  );
};

export default Login;
