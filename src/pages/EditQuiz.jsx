// client/src/pages/EditQuiz.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar'
import { IoIosArrowRoundBack } from "react-icons/io";
const EditQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([{ question: '', options: ['', ''], correctAnswer: '' }]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(`https://angularbackend-o18e.onrender.com/api/quizzes/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setQuiz(response.data);
        setTitle(response.data.title);
        setQuestions(response.data.questions);
      } catch (error) {
        console.error('Error fetching quiz:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', ''], correctAnswer: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`https://angularbackend-o18e.onrender.com/api/quizzes/${id}`, {
        title,
        questions,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      alert('Quiz updated successfully!');
      navigate('/admin/dashboard'); // Redirect to admin dashboard after successful update
    } catch (error) {
      console.error('Error updating quiz:', error);
      alert('Failed to update quiz. Please try again.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!quiz) return <div>No quiz found.</div>;

  return (
    <div>
      <AdminNavbar/>
    
    <div className="max-w-2xl mx-auto mt-10 p-5 bg-white rounded-lg shadow-lg">
    <a href="/admin/dashboard" ><div className=" absolute  hover:scale-125 transition-all duration-300 cursor-pointer translate-x-4"> <IoIosArrowRoundBack size={40}/></div></a>
      <h1 className="text-2xl text-center font-bold mb-4">Edit Quiz</h1>
      <form onSubmit={handleSubmit}>
        <div className="my-12">
          <label className="block text-lg font-semibold mb-2">Quiz Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        {questions.map((question, questionIndex) => (
          <div key={questionIndex} className="mb-4">
            <label className="block text-lg font-semibold mb-2">Question {questionIndex + 1}:</label>
            <input
              type="text"
              value={question.question}
              onChange={(e) => handleQuestionChange(questionIndex, 'question', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg mb-2"
              required
            />
            <label className="block text-lg font-semibold mb-2">Options:</label>
            {question.options.map((option, optionIndex) => (
              <input
                key={optionIndex}
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg mb-2"
                placeholder={`Option ${optionIndex + 1}`}
                required
              />
            ))}
            <div className="mb-2">
              <label className="block text-lg font-semibold mb-2">Correct Answer:</label>
              <select
                value={question.correctAnswer}
                onChange={(e) => handleQuestionChange(questionIndex, 'correctAnswer', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="" disabled>Select correct answer</option>
                {question.options.map((option, optionIndex) => (
                  <option key={optionIndex} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
        <button type="button" onClick={addQuestion} className="mb-4 bg-blue-500 text-white py-2 px-4 rounded-lg">Add Question</button>
        <button type="submit" className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Update Quiz</button>
      </form>
    </div>
    </div>
  );
};

export default EditQuiz;
