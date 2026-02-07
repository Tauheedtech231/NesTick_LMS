// components/QuizBlock.tsx
'use client';

import { useState } from 'react';
import { HiCheckCircle, HiXCircle, HiClock, HiArrowRight } from 'react-icons/hi';

type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

type QuizBlockProps = {
  id: string;
  title: string;
  description: string;
  course: string;
  questions: Question[];
  passingScore: number;
  studentScore?: number;
  isPassed: boolean;
  attempts: number;
  timeLimit: number;
  onStartQuiz: (quizId: string) => void;
};

export default function QuizBlock({
  id,
  title,
  description,
  course,
  questions,
  passingScore,
  studentScore,
  isPassed,
  attempts,
  timeLimit,
  onStartQuiz,
}: QuizBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const handleSubmitQuiz = () => {
    const score = calculateScore();
    alert(`Quiz submitted! Your score: ${score}% (Minimum required: ${passingScore}%)`);
    onStartQuiz(id);
  };

  return (
  <div className=" rounded-xl border border-gray-200 p-6  w-full max-w-3xl mx-auto">
  {/* Header: Course & Status */}
  <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2 sm:gap-0">
    <div className="flex-1">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full">{course}</span>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          isPassed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isPassed ? <HiCheckCircle className="w-3 h-3 mr-1" /> : <HiClock className="w-3 h-3 mr-1" />}
          {isPassed ? 'PASSED' : 'NOT ATTEMPTED'}
        </span>
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm sm:text-base text-gray-600 mb-3">{description}</p>

      {/* Quiz Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Questions</p>
          <p className="text-lg font-bold text-gray-900">{questions.length}</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Time Limit</p>
          <p className="text-lg font-bold text-gray-900">{timeLimit} min</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Passing Score</p>
          <p className="text-lg font-bold text-gray-900">{passingScore}%</p>
        </div>
      </div>
    </div>
  </div>

  {/* Student Score */}
  {studentScore !== undefined && (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
        <div className="text-center sm:text-left">
          <p className="text-sm font-medium text-gray-700">Your Best Score</p>
          <p className="text-2xl font-bold text-gray-900">{studentScore}%</p>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-sm text-gray-600">Attempts: {attempts}</p>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div
          className={`h-2 rounded-full ${
            studentScore >= passingScore ? 'bg-green-500' : 'bg-red-500'
          }`}
          style={{ width: `${Math.min(studentScore, 100)}%` }}
        />
      </div>
    </div>
  )}

  {/* Quiz Questions */}
  {isExpanded ? (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <div key={question.id} className="p-4 border border-gray-200 rounded-lg">
          <p className="font-medium text-gray-900 mb-3">
            Q{index + 1}: {question.question}
          </p>
          <div className="space-y-2">
            {question.options.map((option, optionIndex) => (
              <button
                key={optionIndex}
                onClick={() => handleAnswerSelect(question.id, optionIndex)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedAnswers[question.id] === optionIndex
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${
                      selectedAnswers[question.id] === optionIndex
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedAnswers[question.id] === optionIndex && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-gray-700">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleSubmitQuiz}
          className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-900 transition-colors"
        >
          Submit Quiz
        </button>
        <button
          onClick={() => setIsExpanded(false)}
          className="py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        onClick={() => onStartQuiz(id)}
        className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-900 transition-colors flex items-center justify-center"
      >
        Start Quiz
        <HiArrowRight className="ml-2 w-4 h-4" />
      </button>
      <button
        onClick={() => setIsExpanded(true)}
        className="py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
      >
        Preview Questions
      </button>
    </div>
  )}
</div>

  );
}