/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  HiArrowLeft,
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiExclamation,
  HiRefresh,
  HiBookOpen
} from 'react-icons/hi';
import { Loader2 } from 'lucide-react';

export default function TakeQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime] = useState(Date.now());

  // Load user and quiz data
  useEffect(() => {
    loadUserAndQuiz();
  }, [quizId]);

  const loadUserAndQuiz = async () => {
    try {
      // Get user from localStorage
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) {
        router.push('/lms/auth/login?type=student');
        return;
      }

      const userData = JSON.parse(currentUserStr);
      if (userData.role !== 'student') {
        router.push('/lms/auth/login?type=student');
        return;
      }

      setUser(userData);

      // Fetch quiz data
      await fetchQuiz(userData.email || userData.id);
    } catch (error) {
      console.error('Error loading user:', error);
      setError('Failed to load user data');
      setLoading(false);
    }
  };

  const fetchQuiz = async (studentEmail: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/students/quizzes/${quizId}?studentEmail=${encodeURIComponent(studentEmail)}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load quiz');
      }

      if (result.success) {
        setQuiz(result.data);
        setAnswers(new Array(result.data.totalQuestions).fill(-1));
        setTimeLeft(result.data.duration * 60); // Convert to seconds
      }
    } catch (error: any) {
      console.error('Error loading quiz:', error);
      setError(error.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !submitting) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, submitting]);

  const handleAnswer = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < (quiz?.totalQuestions || 0) - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user || !quiz) return;

    // Check if all questions answered
    if (answers.some(a => a === -1)) {
      alert('Please answer all questions before submitting');
      return;
    }

    setSubmitting(true);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    try {
      // Get student email (your table uses student_email)
      const studentEmail = user.email || user.id;

      const response = await fetch(`/api/students/quizzes/${quizId}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentEmail: studentEmail,  // ✅ Changed to studentEmail
          studentName: user.name || user.fullName || 'Student',
          answers: answers,
          timeSpent: timeSpent
        })
      });

      const result = await response.json();
      console.log('Submission result:', result);

      if (!response.ok) {
        if (response.status === 400) {
          if (result.error?.includes('already attempted')) {
            alert('You have already attempted this quiz');
            router.push(`/lms/Student_Portal/mock-quizzes/results/${quizId}`);
          } else {
            alert(result.error || 'Failed to submit quiz');
          }
        } else {
          throw new Error(result.error || 'Failed to submit quiz');
        }
        return;
      }

      if (result.success) {
        if (result.data.passed) {
          alert('🎉 Congratulations! You passed the quiz!');
        } else {
          alert('Quiz submitted successfully');
        }
        
        router.push(`/lms/Student_Portal/mock-quizzes/results/${quizId}`);
      }
    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      alert(error.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = async () => {
    if (answers.some(a => a !== -1)) {
      await handleSubmit();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <HiXCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Quiz</h3>
          <p className="text-gray-600 mb-6">{error || 'Quiz not found'}</p>
          <Link
            href="/lms/Student_Portal/mock-quizzes"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <HiArrowLeft className="w-4 h-4" />
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  if (!quiz.canAttempt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <HiExclamation className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-lg font-semibold mb-2">Cannot Take Quiz</h3>
          <p className="text-gray-600 mb-6">{quiz.cannotAttemptReason}</p>
          <Link
            href="/lms/Student_Portal/mock-quizzes"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <HiArrowLeft className="w-4 h-4" />
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              href="/lms/Student_Portal/mock-quizzes"
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <HiArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="font-semibold text-gray-900 truncate px-4">{quiz.title}</h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-lg">
                <HiClock className="w-4 h-4 text-gray-600" />
                <span className={`font-medium ${
                  timeLeft < 60 ? 'text-red-600' : 'text-gray-700'
                }`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {currentQuestion + 1}/{quiz.totalQuestions}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-600 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / quiz.totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          {/* Question */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Question {currentQuestion + 1}</span>
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                {currentQ.points} point{currentQ.points !== 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-lg font-medium text-gray-900">{currentQ.question}</p>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {currentQ.options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswer(currentQuestion, index)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  answers[currentQuestion] === index
                    ? 'border-red-600 bg-red-50 ring-2 ring-red-600 ring-opacity-20'
                    : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                    answers[currentQuestion] === index
                      ? 'border-red-600 bg-red-600 text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-gray-700">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentQuestion === quiz.totalQuestions - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting || answers.some(a => a === -1)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Quiz'
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Quick Navigation</p>
          <div className="flex flex-wrap gap-2">
            {answers.map((answer, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  currentQuestion === index
                    ? 'bg-red-600 text-white'
                    : answer !== -1
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}