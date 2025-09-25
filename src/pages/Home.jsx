// client/src/pages/Home.jsx
import React from 'react';
import Navbar from '../components/Navbar';

const Home = () => {
  return (
    <div>
   
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-500 to-indigo-600">
      <div className="bg-white shadow-lg rounded-lg p-8 text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Welcome to the App!</h1>
        <p className="text-gray-700 mb-6">
          Please <a href="/login" className="text-blue-500 hover:underline">login</a> to continue.
        </p>
        <p className="text-gray-500">
          Create your quizzes, challenge your friends, and track your progress!
        </p>
      </div>
    </div>
    </div>
  );
};

export default Home;
