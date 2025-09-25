import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { FaUserCircle, FaTrophy, FaFileDownload } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import AdminNavbar from '../components/AdminNavbar';
import { useLocation } from 'react-router-dom';
import { LuHardDriveDownload } from 'react-icons/lu';

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  
  const profileRef = useRef();
  
  const user = location.state
  console.log("User Profile : ", user)

  const attemptQuiz = (quizId, challengeId, userType) => {
    navigate(`/challengequiz/${quizId}/${challengeId}/${userType}`);
  };

 

  if (!user) return <div className='bg-gradient-to-r justify-center font-mono align-middle text-center self-center center text-4xl from-indigo-300 to-violet-300 h-screen p-64'><div>404 ERROR <a href='/login' className="text-gray-500 cursor-pointer hover:text-gray-800 transition-all duration-200"> LOGIN </a> FIRST </div></div>;

  const quizTitles = user.scores.map(score => score.quizId.title);
  const quizScores = user.scores.map(score => score.score);

  const chartData = {
    labels: quizTitles,
    datasets: [
      {
        label: 'Quiz Scores',
        data: quizScores,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Quiz Performance Overview',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  const downloadPDF = () => {
    const input = profileRef.current;
    html2canvas(input).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${user.username}_profile.pdf`);
    });
  };

  return (
    <div ref={profileRef} >
      <AdminNavbar/>
      <div  className="max-w-lg mx-auto mt-10 p-6 border border-gray-300 rounded-lg shadow-xl bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="flex justify-between items-center mb-6">
          <div className='flex'>
            <FaUserCircle size={50} className="text-blue-500" />
            <h1 className="text-3xl my-auto font-bold ml-4">{user.username}</h1>
          </div>
          <div>
            <button onClick={downloadPDF} className="bg-emerald-500 p-2 hover:bg-emerald-700 transition-all duration-200 my-auto rounded-lg text-white font-bold">
              <FaFileDownload size={20} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-inner mb-6">
          <h2 className="text-xl font-semibold text-blue-600 mt-4 mb-3 flex items-center">
            <FaTrophy className="mr-2" /> Quiz Scores
          </h2>
          {user.scores.length > 0 ? (
            <ul className="space-y-2 mb-6">
              {user.scores.map((score, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center bg-blue-50 p-3 rounded-md shadow-md border border-blue-200"
                >
                  <div>
                    <span className="font-medium text-gray-700">Quiz Title:</span> {score.quizId.title}
                  </div>
                  <div className="text-blue-500 font-bold text-lg">
                    <span className="mr-1">Score:</span> {score.score}
                  </div>
                  {score.pdf && (
                                <button
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = `data:application/pdf;base64,${score.pdf}`;
                                    link.download = `${score.quizTitle}_result.pdf`;
                                    link.click();
                                  }}
                                  className="py-3 px-3 bg-green-500 text-white rounded-lg hover:bg-green-700 transition duration-200"
                                >
                                  <LuHardDriveDownload/>
                                </button>
                              )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 italic mt-2">No scores available.</p>
          )}
        </div>

        {/* Chart Section */}
        {user.scores.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-inner">
            <h2 className="text-xl font-semibold text-blue-600 mb-4">Performance Chart</h2>
            <Bar data={chartData} options={chartOptions} />
          </div>
        )}
      </div>


    </div>
  );
};

export default StudentProfile;
