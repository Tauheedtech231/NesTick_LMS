'use client';
/* eslint-disable */

import { useState, useEffect } from 'react';
import { HiOutlineCheckCircle, HiOutlineXCircle, HiCheckCircle } from 'react-icons/hi';
import { Loader2 } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  questionType?: 'mcq' | 'text';
}

interface Quiz {
  quizId: string;
  slideId: string;
  courseId: string;
  questions: QuizQuestion[];
}

interface QuizAnswer {
  questionIndex: number;
  selectedOption?: number;
  textAnswer?: string;
}

interface SimpleQuizProps {
  quiz: Quiz;
  slideId: string;
  courseId: string;
  enrollmentId: string;
  studentEmail: string;
  attempt: any;
  onQuizSubmit: (slideId: string, answers: QuizAnswer[], score: number, passed: boolean) => Promise<void>;
  onCancel: () => void;
  formatDate: (date: string) => string;
}

export default function SimpleQuiz({ 
  quiz, 
  slideId, 
  attempt, 
  onQuizSubmit, 
  onCancel,
  formatDate 
}: SimpleQuizProps) {
  const [activeQuiz, setActiveQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Initialize quiz answers
  const initializeQuiz = () => {
    setActiveQuiz(true);
    const initialAnswers: QuizAnswer[] = quiz.questions.map((q, index) => {
      if (q.questionType === 'text' || !q.options || q.options.length === 0) {
        return { questionIndex: index, textAnswer: '' };
      } else {
        return { questionIndex: index, selectedOption: -1 };
      }
    });
    setQuizAnswers(initialAnswers);
  };

  const updateAnswer = (questionIndex: number, question: QuizQuestion, value: any) => {
    const updatedAnswers = [...quizAnswers];
    
    if (question.questionType === 'text' || !question.options || question.options.length === 0) {
      updatedAnswers[questionIndex] = {
        questionIndex,
        textAnswer: value
      };
    } else {
      updatedAnswers[questionIndex] = {
        questionIndex,
        selectedOption: parseInt(value)
      };
    }
    
    setQuizAnswers(updatedAnswers);
  };

  const handleSubmit = async () => {
    // Validate all questions answered
    let isValid = true;
    let errorMessage = '';

    quiz.questions.forEach((q, index) => {
      const answer = quizAnswers[index];
      
      if (q.questionType === 'text' || !q.options || q.options.length === 0) {
        if (!answer?.textAnswer?.trim()) {
          isValid = false;
          errorMessage = `Please answer question ${index + 1}`;
        }
      } else {
        if (answer?.selectedOption === undefined || answer.selectedOption === -1) {
          isValid = false;
          errorMessage = `Please answer question ${index + 1}`;
        }
      }
    });

    if (!isValid) {
      alert(errorMessage);
      return;
    }

    // Calculate score
    let correctCount = 0;
    let mcqCount = 0;
    
    quiz.questions.forEach((q, index) => {
      const answer = quizAnswers[index];
      
      if (q.options && q.options.length > 0 && answer?.selectedOption !== undefined) {
        mcqCount++;
        if (answer.selectedOption === q.correctAnswer) {
          correctCount++;
        }
      }
    });
    
    const score = mcqCount > 0 ? Math.round((correctCount / mcqCount) * 100) : 0;
    const passed = score >= 70;

    setSubmitting(true);
    await onQuizSubmit(slideId, quizAnswers, score, passed);
    setSubmitting(false);
    setActiveQuiz(false);
  };

  // If already attempted, show result
  if (attempt) {
    return (
      <div className={`p-4 rounded-lg ${attempt.passed ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
        <div className="flex items-center gap-3">
          {attempt.passed ? <HiOutlineCheckCircle className="w-6 h-6 text-green-600" /> : <HiOutlineXCircle className="w-6 h-6 text-yellow-600" />}
          <div>
            <p className={`text-sm font-medium ${attempt.passed ? 'text-green-700' : 'text-yellow-700'}`}>
              Score: {attempt.score}% - {attempt.passed ? 'Passed' : 'Failed'}
            </p>
            <p className="text-xs text-gray-500">Attempted on {formatDate(attempt.attemptedAt)}</p>
          </div>
        </div>
      </div>
    );
  }

  // If quiz in progress
  if (activeQuiz) {
    return (
      <div className="space-y-4">
        {quiz.questions.map((q, idx) => {
          const isTextQuestion = q.questionType === 'text' || !q.options || q.options.length === 0;
          return (
            <div key={q.id} className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium mb-3">Question {idx + 1}: {q.question}</p>
              {isTextQuestion ? (
                <textarea
                  value={quizAnswers[idx]?.textAnswer || ''}
                  onChange={(e) => updateAnswer(idx, q, e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Type your answer here..."
                />
              ) : (
                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => (
                    <label key={optIdx} className="flex items-center gap-3 text-sm p-2 rounded hover:bg-gray-50 cursor-pointer">
                      <input 
                        type="radio" 
                        name={`q-${q.id}`} 
                        checked={quizAnswers[idx]?.selectedOption === optIdx} 
                        onChange={() => updateAnswer(idx, q, optIdx)} 
                        className="w-4 h-4 text-blue-600 cursor-pointer" 
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div className="flex gap-2">
          <button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <HiCheckCircle className="w-4 h-4" />}
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
          <button 
            onClick={() => { setActiveQuiz(false); setQuizAnswers([]); onCancel(); }} 
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Start quiz button
  return (
    <button 
      onClick={initializeQuiz} 
      className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 cursor-pointer"
    >
      Start Quiz ({quiz.questions.length} Questions)
    </button>
  );
}