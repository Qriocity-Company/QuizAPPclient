import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const AquizAttempt = () => {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [quiz_scores, setQuizScores] = useState([]);
  const [quizdata, setQuizdata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);
  const hasFetched = useRef(false);
  const navigate = useNavigate();
  const handleNewQuiz = (quizId) => {
    window.open(`/aquiz/${quizId}`);
  }

  useEffect(() => {
    const getquiz = async () => {
      try {
        const response = await axios.get(
          `https://angularbackend-o18e.onrender.com/api/aquizzes/a/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setQuizdata(response.data);
      } catch (error) {
        console.error("Error fetching quiz:", error);
      }
    };

    getquiz();

    // Request fullscreen on mount
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  }, [id]);

  const validateQuiz = (quiz) => {
  if (!quiz || !Array.isArray(quiz)) return false;
  
  return quiz.every(q => 
    q.question && 
    Array.isArray(q.options) && 
    q.options.length >= 2 && // At least 2 options
    q.answer !== undefined
  );
};

  useEffect(() => {
  const fetchQuiz = async () => {
    if (!quizdata || hasFetched.current) return;
    hasFetched.current = true;

    setLoading(true);
    try {
      console.log("QUIZ DATA : ", quizdata);
      const response = await axios.post("http://localhost:8000/generate_content", {
        subject: quizdata.title,
        topic: quizdata.title,
        level: quizdata.difficulty,
        content_type: "quiz",
      });

      console.log("Backend response:", response.data);
      
      if (response.data.generated_content) {
        const parsedQuiz = parseQuizContent(response.data.generated_content);
        
        if (validateQuiz(parsedQuiz)) {
          setQuiz(parsedQuiz);
        } else {
          console.error("Parsed quiz failed validation");
          // You might want to retry or show an error message
        }
      } else {
        console.error("Quiz data format incorrect:", response.data);
      }
    } catch (error) {
      console.error("Error fetching quiz:", error.message);
    } finally {
      setLoading(false);
    }
  };

  fetchQuiz();
}, [quizdata]);

  const parseQuizContent = (content) => {
  try {
    console.log("Raw content received:", content);
    
    // Remove any surrounding markdown code blocks
    content = content.trim();
    if (content.startsWith("```json")) {
      content = content.slice(7).trim();
    }
    if (content.startsWith("```")) {
      content = content.slice(3).trim();
    }
    if (content.endsWith("```")) {
      content = content.slice(0, -3).trim();
    }

    // Fix the JSON by properly escaping backslashes
    content = content.replace(/\\/g, '\\\\');

    // Also fix other common JSON issues
    content = content
      .replace(/\n/g, '\\n')  // Escape newlines
      .replace(/\t/g, '\\t')  // Escape tabs
      .replace(/\r/g, '\\r')  // Escape carriage returns
      .replace(/\f/g, '\\f'); // Escape form feeds

    // Try to parse the content
    let quizData;
    try {
      quizData = JSON.parse(content);
    } catch (parseError) {
      console.warn("First parse attempt failed, trying to extract and fix JSON...");
      
      // Try to find JSON within the text with more robust extraction
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          // Clean the JSON string more aggressively
          let jsonString = jsonMatch[0];
          // Escape backslashes
          jsonString = jsonString.replace(/\\/g, '\\\\');
          // Remove any trailing commas that might break JSON
          jsonString = jsonString.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
          
          quizData = JSON.parse(jsonString);
        } catch (secondError) {
          console.error("Second parse attempt failed:", secondError);
          throw new Error("Could not parse JSON even after cleaning");
        }
      } else {
        throw new Error("No valid JSON found in response");
      }
    }

    // Validate the basic structure
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error("Invalid quiz format: missing questions array");
    }

    // Transform questions to consistent format
    const quizQuestions = quizData.questions.map((q, index) => {
      const questionId = q.id || `Q${index + 1}`;
      
      // Handle different answer key formats
      let correctAnswerKey = "";
      if (quizData.answer_key) {
        correctAnswerKey = quizData.answer_key[questionId] || 
                          quizData.answer_key[q.id] || 
                          quizData.answer_key[index + 1] || 
                          quizData.answer_key[`Q${index + 1}`];
      } else if (quizData.answer_keys) {
        correctAnswerKey = quizData.answer_keys[questionId] || 
                          quizData.answer_keys[q.id] || 
                          quizData.answer_keys[index + 1] || 
                          quizData.answer_keys[`Q${index + 1}`];
      }

      // Get answers/options (handle different field names)
      const options = q.answers || q.options || [];
      
      // Find correct answer text
      let correctAnswer = "";
      if (options.length > 0 && correctAnswerKey) {
        const correctOption = options.find(option => 
          option.trim().startsWith(`${correctAnswerKey})`) ||
          option.trim().startsWith(`${correctAnswerKey}.`)
        );
        correctAnswer = correctOption || options[0] || "";
      }

      // Combine scenario and question
      const fullQuestion = q.scenario ? 
        `${q.scenario}\n\n${q.question || q.questionText || ""}` : 
        (q.question || q.questionText || "");

      return {
        id: questionId,
        question: fullQuestion,
        options: options,
        answer: correctAnswer,
        rawData: q // Keep raw data for debugging
      };
    });

    console.log("Successfully parsed quiz:", quizQuestions);
    return quizQuestions;

  } catch (error) {
    console.error("Error parsing quiz content:", error.message);
    console.error("Content that failed to parse:", content);
    
    // Return a fallback quiz or empty array
    return [];
  }
};



  const handleAnswerChange = (questionIndex, answer) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const calculateScore = () => {
  if (!quiz) return;

  let calculatedScore = 0;

  quiz.forEach((q, index) => {
    const selectedAnswer = selectedAnswers[index]?.trim();
    const correctAnswer = q.answer?.trim();

    // Compare the full answer text
    if (selectedAnswer === correctAnswer) {
      calculatedScore++;
    }
  });
  setQuizScores([...quiz_scores, calculatedScore]);
  setScore(calculatedScore);
};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div
          className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"
          role="status"
        >
          <span className="visually-hidden">--</span>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Quiz not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
      <div className="max-w-4xl mx-auto mt-10 p-6 border border-gray-200 rounded-lg bg-white shadow-lg text-gray-800">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-indigo-600">
          Automated Quiz on {quizdata.title}
        </h1>
        {quiz.map((q, index) => (
  <div key={index} className="mb-8">
    <div className="flex flex-col">
      <div className="flex">
        <p className="font-bold text-xl">{index+1}</p>
        <h2 className="text-xl font-semibold mb-4">. {q.question.split('\n\n')[1] || q.question}</h2>
      </div>
      {q.question.includes('\n\n') && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-700 italic">{q.question.split('\n\n')[0]}</p>
        </div>
      )}
    </div>
    {q.options.map((option, i) => (
      <label
        key={i}
        className="block py-2 px-4 rounded-lg bg-gray-100 hover:bg-indigo-100 text-gray-800 mb-2 transition-colors cursor-pointer"
      >
        <input
          type="radio"
          name={`question-${index}`}
          value={option}
          onChange={() => handleAnswerChange(index, option)}
          className="mr-3"
        />
        {option}
      </label>
    ))}
  </div>
))}
        <div className="text-center">
          <button
            onClick={calculateScore}
            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 shadow-lg transition-transform transform hover:scale-105"
          >
            Submit Quiz
          </button>
        </div>
      </div>

      {score !== null && (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
    <div className="bg-white h-[90vh] w-full overflow-y-auto p-8 rounded-lg shadow-lg text-center text-gray-800 max-w-xl">
      <h2 className="text-2xl font-bold mb-4 text-indigo-600">Your Score</h2>
      <p className="text-lg font-medium mb-6">
        You scored{" "}
        <span className="font-extrabold text-indigo-700">{score}</span> out
        of <span className="font-extrabold text-indigo-700">{quiz.length}</span>
      </p>

      {quiz.map((q, index) => (
  <div key={index} className="text-left">
    <p className="font-semibold">{index + 1}. {q.question}</p>
    <p>Correct Answer: {q.answer}</p>
    <p className={selectedAnswers[index] === q.answer ? "text-green-600" : "text-red-600"}>
      Your Answer: {selectedAnswers[index] || "No Answer"}
    </p>
  </div>
))}

<h2 className="text-3xl font-semibold my-3">Previous Quiz Scores</h2>
      {quiz_scores.length === 0 ? (
        <p>No scores yet! Start a quiz to see your scores.</p>
      ) : (
        <ul className="text-xl mb-5 score-list">
          {quiz_scores.map((score, index) => (
            <li key={index} className="score-item">
              <strong>Quiz {index + 1}:</strong> {score} points
            </li>
          ))}
        </ul>
      )}

        


      <button
        onClick={() => navigate("/dashboard")}
        className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 shadow-lg transition-transform transform hover:scale-105"
      >
        Close
      </button>
      <button
        onClick={() => handleNewQuiz(id)}
        className="px-5 py-2 mx-2 bg-sky-500 text-white font-bold rounded-full hover:bg-sky-700 shadow-lg transition-transform transform hover:scale-105"
      >
        {score < 5 ? "Try An Easier Quiz" : "Try More Difficult Quiz"}
      </button>
    </div>
  </div>
)}

    </div>
  );
};

export default AquizAttempt;
