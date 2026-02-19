// app/lms/Student_Portal/mock-quizzes/[id]/review/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  HiArrowLeft,
  HiCheckCircle,
  HiXCircle,
  HiChevronDown,
  HiChevronUp,
  HiCalendar,
  HiClock,
  HiUser,
  HiBookOpen,
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

interface QuizResult {
  studentId: any;
  studentEmail: any;
  id: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  isPassed: boolean;
  timeSpent: number;
  submittedAt: string;
  answers: Array<{
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
  }>;
}

export default function QuizReviewPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAttempt, setExpandedAttempt] = useState<string | null>(null);

  useEffect(() => {
    const loadData = () => {
      try {
        // Load user data
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
          const userData = JSON.parse(currentUserStr);
          setUser(userData);

          // Load student's results for this quiz
          const allResults = JSON.parse(localStorage.getItem('student_quiz_results') || '[]');
          const studentResults = allResults.filter(
            (result: QuizResult) =>
              result.quizId === quizId &&
              (result.studentEmail === userData.email || result.studentId === userData.id)
          );

          // Sort by submission date (most recent first)
          studentResults.sort(
            (a: QuizResult, b: QuizResult) =>
              new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
          );

          setResults(studentResults);
        }
      } catch (error) {
        console.error('Error loading review data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [quizId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <Link
          href={`/lms/Student_Portal/mock-quizzes/${quizId}/details`}
          className="inline-flex items-center gap-2 text-sm font-medium mb-6"
          style={{ color: BRAND_COLORS.darkRoyalBlue }}
        >
          <HiArrowLeft className="w-4 h-4" />
          Back to Quiz Details
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <h1 className="text-2xl font-bold mb-2" style={{ color: BRAND_COLORS.darkNavy }}>
            No Attempts Yet
          </h1>
          <p className="text-gray-600 mb-6">
            You haven't attempted this quiz yet. Start now to see your review!
          </p>
          <Link
            href={`/lms/Student_Portal/mock-quizzes/${quizId}/attempt`}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-white"
            style={{ backgroundColor: BRAND_COLORS.deepRed }}
          >
            Start Quiz
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <Link
        href={`/lms/Student_Portal/mock-quizzes/${quizId}/details`}
        className="inline-flex items-center gap-2 text-sm font-medium mb-6"
        style={{ color: BRAND_COLORS.darkRoyalBlue }}
      >
        <HiArrowLeft className="w-4 h-4" />
        Back to Quiz Details
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" style={{ color: BRAND_COLORS.darkNavy }}>
          Quiz Review
        </h1>
        <p className="text-gray-600">
          Review your past attempts and answers ({results.length} total)
        </p>
      </div>

      {/* Attempts List */}
      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={result.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            {/* Attempt Header */}
            <button
              onClick={() =>
                setExpandedAttempt(expandedAttempt === result.id ? null : result.id)
              }
              className="w-full p-6 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="px-3 py-1 rounded-lg font-semibold text-sm"
                      style={{
                        backgroundColor: result.isPassed ? '#DCFCE7' : '#FEE2E2',
                        color: result.isPassed ? '#166534' : '#991B1B',
                      }}
                    >
                      Attempt {results.length - index}
                    </span>
                    <span
                      className="text-xl font-bold"
                      style={{
                        color: result.isPassed ? '#10B981' : '#EF4444',
                      }}
                    >
                      {result.score}%
                    </span>
                    {result.isPassed && (
                      <HiCheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <HiCalendar className="w-4 h-4" />
                      <span>
                        {new Date(result.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiClock className="w-4 h-4" />
                      <span>{formatTime(result.timeSpent)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiCheckCircle className="w-4 h-4" />
                      <span>
                        {result.correctAnswers}/{result.totalQuestions}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(result.submittedAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div>
                  {expandedAttempt === result.id ? (
                    <HiChevronUp className="w-6 h-6 text-gray-400" />
                  ) : (
                    <HiChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </div>
            </button>

            {/* Expanded Content */}
            {expandedAttempt === result.id && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="mb-6">
                  <h4 className="font-semibold mb-3" style={{ color: BRAND_COLORS.darkNavy }}>
                    Performance Summary
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Score</p>
                      <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                        {result.score}%
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Correct</p>
                      <p className="text-2xl font-bold" style={{ color: '#10B981' }}>
                        {result.correctAnswers}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Incorrect</p>
                      <p className="text-2xl font-bold text-red-600">
                        {result.totalQuestions - result.correctAnswers}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Time Spent</p>
                      <p className="text-lg font-bold" style={{ color: BRAND_COLORS.teal }}>
                        {formatTime(result.timeSpent)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Message */}
                <div
                  className="p-4 rounded-lg mb-6"
                  style={{
                    backgroundColor: result.isPassed ? '#DCFCE7' : '#FEE2E2',
                  }}
                >
                  <p
                    className="font-medium"
                    style={{
                      color: result.isPassed ? '#166534' : '#991B1B',
                    }}
                  >
                    {result.isPassed
                      ? '✓ You passed this attempt! Great job!'
                      : '✗ You did not pass this attempt. Review your answers and try again.'}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Link
                    href={`/lms/Student_Portal/mock-quizzes/${quizId}/result`}
                    className="flex-1 py-2 px-4 rounded-lg font-medium text-white text-center"
                    style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue }}
                  >
                    View Full Details
                  </Link>
                  <Link
                    href={`/lms/Student_Portal/mock-quizzes/${quizId}/attempt`}
                    className="flex-1 py-2 px-4 rounded-lg font-medium text-white text-center"
                    style={{ backgroundColor: BRAND_COLORS.deepRed }}
                  >
                    Retake Quiz
                  </Link>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Card */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
          Overall Statistics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Best Score</p>
            <p
              className="text-3xl font-bold"
              style={{
                color: Math.max(...results.map((r) => r.score)) >= 70
                  ? '#10B981'
                  : '#EF4444',
              }}
            >
              {Math.max(...results.map((r) => r.score))}%
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Average Score</p>
            <p className="text-3xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
              {Math.round(
                results.reduce((sum, r) => sum + r.score, 0) / results.length
              )}
              %
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Pass Rate</p>
            <p className="text-3xl font-bold" style={{ color: BRAND_COLORS.teal }}>
              {Math.round(
                (results.filter((r) => r.isPassed).length / results.length) * 100
              )}
              %
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
