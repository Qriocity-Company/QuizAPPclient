import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import LZString from 'lz-string';


const ChallengeQuizAttempt = () => {
  const { id, challengeId, userType } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false); // Track submission status

  

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/quizzes/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setQuiz(response.data);
        console.log("UserType : ", userType);
        setTimeLeft(response.data.timeLimit);
      } catch (error) {
        console.error('Error fetching quiz:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();

    // Request fullscreen when the component mounts
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          if (!isSubmitted) {
            console.log("Timer ended, submitting quiz...");
            handleSubmit(); // Call handleSubmit directly
          }
          return 0; // Ensure timeLeft does not go negative
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup timer on unmount
  }, [isSubmitted]); // Dependency only on isSubmitted

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prevAnswers) => ({ ...prevAnswers, [questionId]: value }));
  };

  const handleScoreCalculation = () => {
    if (!quiz) return 0; // Return 0 if quiz is null

    let calculatedScore = 0;

    quiz.questions.forEach((question) => {
      if (answers[question._id] === question.correctAnswer) {
        calculatedScore += 1; // Increment score for each correct answer
      }
    });

    return calculatedScore; // Return calculated score
  };

  

const handleSubmit = async () => {
  if (isSubmitted) return; // Prevent submission if already submitted
  if (!quiz) return; // Prevent submission if quiz is null

  const calculatedScore = handleScoreCalculation(); // Calculate score
  console.log('Calculated Score:', calculatedScore); // Debugging score
  setIsSubmitted(true); // Mark as submitted

  const token = localStorage.getItem('token');
  const storedUser = LZString.decompress(localStorage.getItem('user'));
        const user = JSON.parse(storedUser);
  console.log('UserType from Params:', userType);
  try {
    // Correctly assign the score based on userType
    const scoreData = userType === 'challenger'
      ? { challengerScore: calculatedScore }
      : { challengedScore: calculatedScore };

    const response = await axios.put(`http://localhost:5000/api/challenge/${challengeId}/scores`, scoreData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Quiz submitted successfully:', response.data); // Debugging response
    alert('Quiz submitted! Your score: ' + calculatedScore);
    navigate('/profile'); // Navigate to desired path
  } catch (error) {
    console.error('Error submitting quiz:', error.response ? error.response.data : error.message);
    alert('Error submitting quiz. Please try again.');
    setIsSubmitted(false); // Reset submission flag on error
  }
};

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit(); // If on the last question, submit the quiz
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!quiz) return <div>No quiz found.</div>;

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="max-w-2xl mx-auto mt-10 p-5 border border-gray-200 rounded-lg bg-white">
      <h1 className="text-2xl font-bold mb-4">{quiz.title}</h1>
      <p className="text-lg mb-4">Time Left: {timeLeft}s</p>
      <div className="mb-4">
        <h3 className="font-semibold text-xl">{currentQuestion.question}</h3>
        {currentQuestion.options.map((option, optionIndex) => (
          <div key={optionIndex} className="flex items-center mb-2">
            <input
              type="radio"
              name={`question-${currentQuestionIndex}`}
              value={option}
              onChange={() => handleAnswerChange(currentQuestion._id, option)}
              checked={answers[currentQuestion._id] === option} // Set checked based on current answer
              className="mr-2"
            />
            <label className="text-lg">{option}</label>
          </div>
        ))}
      </div>
      <button
        onClick={handleNextQuestion}
        className="w-full py-2 mt-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
      >
        {currentQuestionIndex < quiz.questions.length - 1 ? 'Next' : 'Submit Quiz'}
      </button>
    </div>
  );
};

export default ChallengeQuizAttempt;
