// app/lms/Student_Portal/mock-quizzes/[id]/details/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  HiArrowLeft,
  HiClock,
  HiBookOpen,
  HiUser,
  HiCheckCircle,
  HiSparkles,
  HiFlag,
  HiTrendingUp,
  HiPlay,
  HiRefresh,
  HiCalendar,
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
  teal: '#1FB6CB',
};

interface Quiz {
  id: string;
  title: string;
  description: string;
  courseTitle: string;
  instructorName: string;
  instructorId: string;
  totalQuestions: number;
  passingScore: number;
  timeLimit: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdAt: string;
  status: 'draft' | 'published' | 'closed';
  questions?: any[];
}

interface QuizResult {
  id: string;
  quizId: string;
  score: number;
  isPassed: boolean;
  submittedAt: string;
  attempts: number;
}

export default function QuizDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [attempts, setAttempts] = useState<QuizResult[]>([]);
  const [bestScore, setBestScore] = useState<number | null>(null);

  useEffect(() => {
    const loadData = () => {
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
            setQuiz(foundQuiz);

            // Load student's attempts for this quiz
            const allResults = JSON.parse(localStorage.getItem('student_quiz_results') || '[]');
            const studentAttempts = allResults.filter(
              (result: any) =>
                result.quizId === quizId &&
                (result.studentEmail === userData.email || result.studentId === userData.id)
            );

            setAttempts(studentAttempts);

            // Calculate best score
            if (studentAttempts.length > 0) {
              const scores = studentAttempts.map((a: any) => a.score);
              const best = Math.max(...scores);
              setBestScore(best);
            }
          }
        }
      } catch (error) {
        console.error('Error loading quiz details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [quizId]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100' };
      case 'medium':
        return { bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100' };
      case 'hard':
        return { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-700', badge: 'bg-gray-100' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 bg-gray-100 rounded-lg mb-6"></div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Quiz Not Found</h1>
          <p className="text-gray-600 mb-6">The quiz you're looking for doesn't exist.</p>
          <Link
            href="/lms/Student_Portal/mock-quizzes"
            className="inline-flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-white"
            style={{ backgroundColor: BRAND_COLORS.deepRed }}
          >
            <HiArrowLeft className="w-4 h-4" />
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  const colors = getDifficultyColor(quiz.difficulty);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <Link
        href="/lms/Student_Portal/mock-quizzes"
        className="inline-flex items-center gap-2 text-sm font-medium mb-6"
        style={{ color: BRAND_COLORS.darkRoyalBlue }}
      >
        <HiArrowLeft className="w-4 h-4" />
        Back to Quizzes
      </Link>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quiz Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quiz Header Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className={`${colors.bg} p-8`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2" style={{ color: BRAND_COLORS.darkNavy }}>
                    {quiz.title}
                  </h1>
                  <p className="text-gray-700 text-lg">{quiz.description}</p>
                </div>
                <div className={`${colors.badge} px-4 py-2 rounded-lg font-semibold text-sm ${colors.text}`}>
                  {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                </div>
              </div>
            </div>

            {/* Course & Instructor Info */}
            <div className="p-6 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: BRAND_COLORS.lightGrey }}
                  >
                    <HiBookOpen className="w-5 h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Course</p>
                    <p className="font-semibold text-gray-900">{quiz.courseTitle || 'General'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: BRAND_COLORS.lightGrey }}
                  >
                    <HiUser className="w-5 h-5" style={{ color: BRAND_COLORS.teal }} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Instructor</p>
                    <p className="font-semibold text-gray-900">{quiz.instructorName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quiz Specifications */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold mb-6" style={{ color: BRAND_COLORS.darkNavy }}>
              Quiz Details
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Questions */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <HiSparkles className="w-5 h-5" style={{ color: BRAND_COLORS.teal }} />
                  <span className="text-sm text-gray-600">Questions</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                  {quiz.totalQuestions}
                </p>
              </div>

              {/* Time Limit */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <HiClock className="w-5 h-5" style={{ color: BRAND_COLORS.deepRed }} />
                  <span className="text-sm text-gray-600">Time Limit</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                  {quiz.timeLimit}
                  <span className="text-sm font-normal text-gray-600 ml-1">min</span>
                </p>
              </div>

              {/* Passing Score */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <HiFlag className="w-5 h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                  <span className="text-sm text-gray-600">Pass %</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                  {quiz.passingScore}
                  <span className="text-sm font-normal text-gray-600">%</span>
                </p>
              </div>

              {/* Attempts */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <HiTrendingUp className="w-5 h-5" style={{ color: BRAND_COLORS.teal }} />
                  <span className="text-sm text-gray-600">Attempts</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                  {attempts.length}
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {quiz.tags && quiz.tags.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {quiz.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: BRAND_COLORS.lightGrey,
                      color: BRAND_COLORS.darkRoyalBlue,
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Action Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-6">
            {/* Status Card */}
            {attempts.length > 0 ? (
              <>
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
                  <p className="text-sm text-gray-600 mb-2">Best Score</p>
                  <p className="text-3xl font-bold mb-2" style={{ color: BRAND_COLORS.darkNavy }}>
                    {bestScore}
                    <span className="text-sm font-normal text-gray-600">%</span>
                  </p>
                  {bestScore && bestScore >= quiz.passingScore ? (
                    <div className="flex items-center gap-2 text-green-700">
                      <HiCheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Passed</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-700">
                      <HiCheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Not Yet Passed</span>
                    </div>
                  )}
                </div>

                {/* Attempt History */}
                <div className="mb-6">
                  <h4 className="font-semibold text-sm mb-3" style={{ color: BRAND_COLORS.darkNavy }}>
                    Attempt History
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {attempts.map((attempt, idx) => (
                      <div
                        key={attempt.id}
                        className="p-3 border border-gray-200 rounded-lg text-sm"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">Attempt {attempts.length - idx}</span>
                          <span
                            className="font-bold"
                            style={{
                              color: attempt.isPassed ? '#10B981' : '#EF4444',
                            }}
                          >
                            {attempt.score}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(attempt.submittedAt).toLocaleDateString()} at{' '}
                          {new Date(attempt.submittedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="mb-6 p-4 rounded-lg bg-blue-50">
                <p className="text-sm text-blue-700">No attempts yet. Start the quiz to begin!</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                href={`/lms/Student_Portal/mock-quizzes/${quizId}/attempt`}
                className="w-full py-3 px-4 rounded-lg font-semibold text-white text-center inline-flex items-center justify-center gap-2 transition-transform hover:scale-105"
                style={{ backgroundColor: BRAND_COLORS.deepRed }}
              >
                {attempts.length === 0 ? (
                  <>
                    <HiPlay className="w-5 h-5" />
                    Start Quiz
                  </>
                ) : (
                  <>
                    <HiRefresh className="w-5 h-5" />
                    Retake Quiz
                  </>
                )}
              </Link>

              {attempts.length > 0 && (
                <Link
                  href={`/lms/Student_Portal/mock-quizzes/${quizId}/result`}
                  className="w-full py-3 px-4 rounded-lg font-semibold text-white text-center inline-flex items-center justify-center gap-2 transition-colors"
                  style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue }}
                >
                  <HiCheckCircle className="w-5 h-5" />
                  View Last Result
                </Link>
              )}

              <Link
                href="/lms/Student_Portal/mock-quizzes"
                className="w-full py-3 px-4 rounded-lg font-semibold text-gray-700 border border-gray-300 text-center hover:bg-gray-50 transition-colors"
              >
                Back to Quizzes
              </Link>
            </div>

            {/* Quiz Info Footer */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <HiCalendar className="w-4 h-4" />
                <span>Created on {new Date(quiz.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
