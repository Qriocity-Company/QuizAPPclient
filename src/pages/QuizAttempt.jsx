import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {toast, ToastContainer} from "react-toastify"
const QuizAttempt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [calculatedScore, setCalculatedScore] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const resultRef = useRef();
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(`https://angularbackend-o18e.onrender.com/api/quizzes/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setQuiz(response.data);
        setTimeLeft(response.data.timeLimit);
      } catch (error) {
        console.error('Error fetching quiz:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();

    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  }, [id]);

  useEffect(() => {
    if (showModal && resultRef.current) {
      console.log("Modal rendered. Element for PDF generation:", resultRef.current);
    }
  }, [showModal]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          if (!isSubmitted) {
            handleSubmit();
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prevAnswers) => ({ ...prevAnswers, [questionId]: value }));
  };

  const handleScoreCalculation = () => {
    if (!quiz) return 0;

    let calculatedScore = 0;

    quiz.questions.forEach((question) => {
      if (answers[question._id] === question.correctAnswer) {
        calculatedScore += 1;
      }
    });

    return calculatedScore;
  };

  const handleSubmit = async () => {
    if (isSubmitted) return;
    if (!quiz) return;
  
    const score = handleScoreCalculation();
    setCalculatedScore(score);
    setIsSubmitted(true);
    setShowModal(true);
  
    const token = localStorage.getItem('token');

    const createPdf = async () => {
      const input = resultRef.current;
    
      if (!input) {
        console.error("No element found for PDF generation.");
        throw new Error("No element found for PDF generation.");
      }
    
      try {
        // Delay to ensure the modal is fully rendered
        await new Promise((resolve) => setTimeout(resolve, 100)); // Wait 100ms
        console.log("Capturing element:", input); // Debug log for the element being captured
        const canvas = await html2canvas(input);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
        // Return the PDF as a Blob
        return pdf.output('blob');
      } catch (error) {
        console.error('Error creating PDF:', error);
        throw error;
      }
    };
  
    
      
      const pdfBlob = await createPdf();
      
      // Create FormData to send the PDF and additional data
      const formData = new FormData();
      formData.append('quizId', id);
      formData.append('score', score);
      formData.append('pdf', pdfBlob, 'quiz_result.pdf'); // Attach PDF with a name
  
      // Debug FormData entries
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
  
      // Send data to the server
      axios
        .post('https://angularbackend-o18e.onrender.com/api/auth/score', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          toast.success("Quiz Submitted Successfully")
          
        })
        .catch((error) => {
          toast.error('Error submitting quiz:');
        });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!quiz) return <div>No quiz found.</div>;

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const downloadPDF = () => {
    const input = resultRef.current;
    html2canvas(input).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save("temp_result.pdf");
    });
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-5 border border-gray-200 rounded-lg bg-white">
      <ToastContainer/>
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
              checked={answers[currentQuestion._id] === option}
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

      <div
  
  className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ${
    showModal ? 'block' : 'hidden'
  }`}
>
  <div ref={resultRef} className="bg-white h-[700px] overflow-auto rounded-lg p-6 w-full max-w-md">
    <h2 className="text-2xl font-bold text-center mb-2">Quiz : {quiz.title}</h2>
    <h2 className="text-2xl font-bold text-center text-green-500 mb-4">
      Your Score: {calculatedScore}
    </h2>
    <ul className="space-y-4">
      {quiz.questions.map((question, index) => (
        <li key={index} className="border-b border-gray-300 pb-2">
          <p className="font-medium">{question.question}</p>
          <p>
            <span className="font-semibold">Your Answer:</span>{' '}
            {answers[question._id] || 'Not Answered'}
          </p>
          {answers[question._id] !== question.correctAnswer && (
            <p className="text-blue-500">
              <span className="font-semibold">Correct Answer:</span> {question.correctAnswer}
            </p>
          )}
          <p
            className={
              answers[question._id] === question.correctAnswer
                ? 'text-green-500'
                : 'text-red-500'
            }
          >
            {answers[question._id] === question.correctAnswer ? 'Correct' : 'Wrong'}
          </p>
        </li>
      ))}
    </ul>
    <div className="justify-center flex gap-5">
      <button
        onClick={downloadPDF}
        className="mt-4 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
      >
        Save
      </button>
      <button
        onClick={() => navigate('/dashboard')}
        className="mt-4 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
      >
        Go to Dashboard
      </button>
    </div>
  </div>
</div>
      
    </div>
  );
};

export default QuizAttempt;
