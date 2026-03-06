// lms/Student_Portal/mock-quizzes/results/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  HiArrowLeft,
  HiCheckCircle,
  HiXCircle,

} from 'react-icons/hi';
import { Loader2 } from 'lucide-react';

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

interface QuestionResult {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  userAnswer: number;
  points: number;
  isCorrect: boolean;
}

interface ResultsData {
  quizTitle: string;
  attemptId: string;
  startedAt: string;
  completedAt: string;
  score: number;
  totalMarks: number;
  percentage: number;
  correctCount: number;
  totalQuestions: number;
  questions: QuestionResult[];
}

export default function QuizResultsPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadUserAndResults();
  }, [quizId]);

  const loadUserAndResults = async () => {
    try {
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
      await fetchResults(userData.id);
    } catch (error) {
      console.error('Error loading user:', error);
      setError('Failed to load user data');
      setLoading(false);
    }
  };

  const fetchResults = async (studentId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/students/quizzes/${quizId}/results?studentId=${studentId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load results');
      }

      if (result.success) {
        setResults(result.data);
      }
    } catch (error: any) {
      console.error('Error loading results:', error);
      setError(error.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestion = (index: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: BRAND_COLORS.deepRed }} />
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <HiXCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2 text-gray-900">Error Loading Results</h3>
          <p className="text-gray-600 mb-6">{error || 'Results not found'}</p>
          <Link
            href="/lms/Student_Portal/mock-quizzes"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <HiArrowLeft className="w-4 h-4" />
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  const passed = results.percentage >= 70;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/lms/Student_Portal/mock-quizzes"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <HiArrowLeft className="w-4 h-4" />
          Back to Quizzes
        </Link>
        
        <div className={`rounded-xl p-6 text-white ${
          passed ? 'bg-gradient-to-r from-green-600 to-teal-600' : 'bg-gradient-to-r from-red-600 to-orange-600'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">{results.quizTitle}</h1>
              <p className="opacity-90">Quiz Results</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold mb-1">{results.percentage.toFixed(1)}%</p>
              <p className="opacity-90">{passed ? 'PASSED' : 'FAILED'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Score</p>
          <p className="text-2xl font-bold text-gray-900">{results.score}/{results.totalMarks}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Correct Answers</p>
          <p className="text-2xl font-bold text-green-600">{results.correctCount}/{results.totalQuestions}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Started</p>
          <p className="text-sm font-medium text-gray-900">{formatDate(results.startedAt)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Completed</p>
          <p className="text-sm font-medium text-gray-900">{formatDate(results.completedAt)}</p>
        </div>
      </div>

      {/* Question Review */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Question Review</h2>
        <div className="space-y-3">
          {results.questions.map((q, index) => (
            <div key={q.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full p-4 text-left hover:bg-gray-50 flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
                    {q.isCorrect ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Correct</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Incorrect</span>
                    )}
                  </div>
                  <p className="text-gray-900 font-medium">{q.question}</p>
                </div>
                <div className="ml-4">
                  {expandedQuestions.has(index) ? '▼' : '▶'}
                </div>
              </button>

              {expandedQuestions.has(index) && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="space-y-3">
                    {q.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-3 rounded-lg border ${
                          optIndex === q.correctAnswer
                            ? 'bg-green-50 border-green-200'
                            : optIndex === q.userAnswer && optIndex !== q.correctAnswer
                            ? 'bg-red-50 border-red-200'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                            optIndex === q.correctAnswer
                              ? 'bg-green-600 text-white'
                              : optIndex === q.userAnswer
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}>
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <span className="text-gray-700">{option}</span>
                          {optIndex === q.correctAnswer && (
                            <HiCheckCircle className="w-4 h-4 text-green-600 ml-auto flex-shrink-0" />
                          )}
                          {optIndex === q.userAnswer && optIndex !== q.correctAnswer && (
                            <HiXCircle className="w-4 h-4 text-red-600 ml-auto flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}