// app/lms/Student_Portal/mock-quizzes/[id]/attempt/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  HiArrowLeft,
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiQuestionMarkCircle,
  HiChevronLeft,
  HiChevronRight,
  HiFlag,
  HiSave,
  HiPaperAirplane,
  HiExclamationCircle
} from 'react-icons/hi';
/* eslint-disable */
const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  white: '#FFFFFF',
  lightGrey: '#F4F6F8',
  softGrey: '#E5E7EB',
  darkGrey: '#1F2933',
  teal: '#1FB6CB'
};

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  course: string;
  instructorName: string;
  totalQuestions: number;
  passingScore: number;
  timeLimit: number;
  questions: QuizQuestion[];
}

export default function QuizAttemptPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const loadQuizData = () => {
      try {
        // Load user data
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
          const userData = JSON.parse(currentUserStr);
          setUser(userData);

          // Load quiz from localStorage
          const allQuizzes = JSON.parse(localStorage.getItem('instructor_quizzes') || '[]');
          const foundQuiz = allQuizzes.find((q: any) => q.id === quizId);

          if (foundQuiz) {
            // Load instructor details
            const allInstructors = JSON.parse(localStorage.getItem('lms_instructors') || '[]');
            const instructor = allInstructors.find((inst: any) => 
              inst.id === foundQuiz.instructorId
            ) || { name: foundQuiz.instructorName || 'Instructor' };

            const quizData: Quiz = {
              id: foundQuiz.id,
              title: foundQuiz.title,
              description: foundQuiz.description || '',
              course: foundQuiz.courseTitle || 'Course',
              instructorName: instructor.name,
              totalQuestions: foundQuiz.totalQuestions || foundQuiz.questions?.length || 10,
              passingScore: foundQuiz.passingScore || 70,
              timeLimit: foundQuiz.timeLimit || 30,
              questions: foundQuiz.questions || generateSampleQuestions(10)
            };

            setQuiz(quizData);
            setTimeLeft(quizData.timeLimit * 60); // Convert minutes to seconds
          }
        }
      } catch (error) {
        console.error('Error loading quiz:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuizData();
  }, [quizId]);

  const generateSampleQuestions = (count: number): QuizQuestion[] => {
    const questions: QuizQuestion[] = [];
    for (let i = 1; i <= count; i++) {
      questions.push({
        id: `q${i}`,
        question: `Sample question ${i} about the course topic?`,
        options: [
          'Option A',
          'Option B',
          'Option C',
          'Option D'
        ],
        correctAnswer: Math.floor(Math.random() * 4),
        explanation: 'This is the explanation for the correct answer.',
        points: 1
      });
    }
    return questions;
  };

  useEffect(() => {
    if (timeLeft > 0 && !timer) {
      const newTimer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(newTimer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimer(newTimer);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timeLeft, timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const toggleFlagQuestion = (questionIndex: number) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionIndex)) {
        newSet.delete(questionIndex);
      } else {
        newSet.add(questionIndex);
      }
      return newSet;
    });
  };

  const navigateToQuestion = (questionIndex: number) => {
    setCurrentQuestion(questionIndex);
  };

  const handleAutoSubmit = useCallback(() => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    submitQuiz();
  }, [isSubmitting]);

  const submitQuiz = async () => {
    if (!quiz) return;

    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    quiz.questions.forEach((question, index) => {
      totalPoints += question.points;
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
        earnedPoints += question.points;
      }
    });

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    const isPassed = score >= quiz.passingScore;

    // Save quiz result
    const quizResult = {
      id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      quizId: quiz.id,
      studentId: user?.id || user?.learnerId,
      studentName: user?.name || user?.email,
      studentEmail: user?.email,
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      isPassed,
      timeSpent: (quiz.timeLimit * 60) - timeLeft,
      submittedAt: new Date().toISOString(),
      answers: quiz.questions.map((question, index) => ({
        questionId: question.id,
        selectedOption: answers[index] ?? -1,
        isCorrect: answers[index] === question.correctAnswer,
        pointsEarned: answers[index] === question.correctAnswer ? question.points : 0
      }))
    };

    // Save to localStorage
    const existingResults = JSON.parse(localStorage.getItem('student_quiz_results') || '[]');
    localStorage.setItem('student_quiz_results', JSON.stringify([...existingResults, quizResult]));

    // Navigate to results page
    router.push(`/lms/Student_Portal/mock-quizzes/${quiz.id}/result`);
  };

  const handleSubmitClick = () => {
    setShowConfirm(true);
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const getProgressPercentage = () => {
    if (!quiz) return 0;
    return (getAnsweredCount() / quiz.questions.length) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-100 rounded-lg mb-6"></div>
          <div className="h-96 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center py-12">
          <HiExclamationCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-2">Quiz Not Found</h1>
          <p className="text-gray-600 mb-6">The quiz you're looking for doesn't exist.</p>
          <Link
            href="/lms/Student_Portal/mock-quizzes"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white"
            style={{ backgroundColor: BRAND_COLORS.deepRed }}
          >
            <HiArrowLeft className="w-4 h-4" />
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestionData = quiz.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/lms/Student_Portal/mock-quizzes"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <HiArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Quizzes</span>
              </Link>
              <div>
                <h1 className="text-lg font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                  {quiz.title}
                </h1>
                <p className="text-sm text-gray-600">
                  {quiz.course} • Question {currentQuestion + 1} of {quiz.questions.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className={`px-3 py-2 rounded-lg font-mono font-bold ${
                timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <div className="flex items-center gap-2">
                  <HiClock className="w-4 h-4" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              </div>
              
              {/* Progress */}
              <div className="hidden md:block text-right">
                <div className="text-sm text-gray-600">Progress</div>
                <div className="text-lg font-bold" style={{ color: BRAND_COLORS.deepRed }}>
                  {getAnsweredCount()}/{quiz.questions.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Question Navigation */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-24">
              <h3 className="font-bold mb-3" style={{ color: BRAND_COLORS.darkNavy }}>
                Question Navigation
              </h3>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(getProgressPercentage())}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${getProgressPercentage()}%`,
                      backgroundColor: BRAND_COLORS.deepRed
                    }}
                  ></div>
                </div>
              </div>
              
              {/* Question Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2 mb-4">
                {quiz.questions.map((_, index) => {
                  const isAnswered = answers[index] !== undefined;
                  const isFlagged = flaggedQuestions.has(index);
                  const isCurrent = index === currentQuestion;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => navigateToQuestion(index)}
                      className={`h-10 rounded-lg flex items-center justify-center relative transition-all ${
                        isCurrent
                          ? 'ring-2 ring-offset-1 bg-darkRoyalBlue text-white'
                          : isAnswered
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="font-medium">{index + 1}</span>
                      {isFlagged && (
                        <HiFlag className="absolute -top-1 -right-1 w-3 h-3 text-red-500" />
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-100"></div>
                  <span className="text-gray-600">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gray-100"></div>
                  <span className="text-gray-600">Unanswered</span>
                </div>
                <div className="flex items-center gap-2">
                  <HiFlag className="w-3 h-3 text-red-500" />
                  <span className="text-gray-600">Flagged for review</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column - Question & Options */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              {/* Question Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <HiQuestionMarkCircle className="w-5 h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                    <span className="text-sm font-medium" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                      Question {currentQuestion + 1} of {quiz.questions.length}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {currentQuestionData.question}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                    {currentQuestionData.points} point{currentQuestionData.points !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => toggleFlagQuestion(currentQuestion)}
                    className={`p-2 rounded-lg ${
                      flaggedQuestions.has(currentQuestion)
                        ? 'text-red-600 bg-red-50'
                        : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <HiFlag className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Options */}
              <div className="space-y-3 mb-8">
                {currentQuestionData.options.map((option, index) => {
                  const isSelected = answers[currentQuestion] === index;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(currentQuestion, index)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-darkRoyalBlue bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isSelected
                            ? 'bg-darkRoyalBlue text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          <span className="font-bold">{String.fromCharCode(65 + index)}</span>
                        </div>
                        <span className="text-gray-700">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={() => navigateToQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium ${
                    currentQuestion === 0
                      ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <HiChevronLeft className="w-5 h-5" />
                  Previous
                </button>
                
                <div className="flex gap-3">
                  {currentQuestion < quiz.questions.length - 1 ? (
                    <button
                      onClick={() => navigateToQuestion(Math.min(quiz.questions.length - 1, currentQuestion + 1))}
                      className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-darkRoyalBlue text-white hover:bg-darkRoyalBlue/90"
                    >
                      Next
                      <HiChevronRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitClick}
                      className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white hover:opacity-90"
                      style={{ backgroundColor: BRAND_COLORS.deepRed }}
                    >
                      <HiPaperAirplane className="w-5 h-5" />
                      Submit Quiz
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Quiz Info Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                Quiz Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <HiClock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Time Limit</div>
                    <div className="font-medium">{quiz.timeLimit} minutes</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-50">
                    <HiCheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Passing Score</div>
                    <div className="font-medium">{quiz.passingScore}%</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-50">
                    <HiQuestionMarkCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Points</div>
                    <div className="font-medium">
                      {quiz.questions.reduce((sum, q) => sum + q.points, 0)} points
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Submit Quiz?</h2>
              <p className="text-gray-600 mt-2">
                You have answered {getAnsweredCount()} out of {quiz.questions.length} questions.
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <HiExclamationCircle className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-gray-600">
                    {quiz.questions.length - getAnsweredCount()} questions are unanswered.
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <HiFlag className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-gray-600">
                    {flaggedQuestions.size} questions are flagged for review.
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <HiClock className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-600">
                    Time remaining: {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Continue Quiz
                </button>
                <button
                  onClick={submitQuiz}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-lg font-medium text-white hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: BRAND_COLORS.deepRed }}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </div>
                  ) : (
                    'Submit Quiz'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}