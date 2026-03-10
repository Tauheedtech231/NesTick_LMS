'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  HiClipboardCheck,
  HiClock,

  HiRefresh,
  HiCheckCircle,
  HiXCircle,
  HiSearch,
  HiChevronRight,
  HiCalendar,
  HiUser,
  HiBookOpen,

} from 'react-icons/hi';
import { Loader2 } from 'lucide-react';
/* eslint-disable */
const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  royalBlue: '#1E4A8A',
  deepRed: '#B11217',
  white: '#FFFFFF',
  lightGrey: '#F4F6F8',
  softGrey: '#E5E7EB',
  darkGrey: '#1F2933',
  teal: '#1FB6CB'
};

interface Quiz {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalQuestions: number;
  instructorName: string;
  courseTitle: string;
  averageScore: number;
  studentAttempts: number;
  bestScore: number | null;
  availability: 'available' | 'upcoming' | 'expired';
  timeRemaining: string | null;
  canAttempt: boolean;
  hasAttempted: boolean;
}

export default function StudentQuizzesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'available' | 'completed' | 'upcoming'>('all');
  const [isMounted, setIsMounted] = useState(false);

  // Fix hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load user and quizzes after mount
  useEffect(() => {
    if (isMounted) {
      loadUserAndQuizzes();
    }
  }, [isMounted]);

  const loadUserAndQuizzes = async () => {
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
      await fetchQuizzes(userData.email || userData.id);
    } catch (error) {
      console.error('Error loading user:', error);
      setError('Failed to load user data');
      setLoading(false);
    }
  };

  const fetchQuizzes = async (studentId: string, showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(`/api/students/quizzes?studentId=${studentId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch quizzes');
      }

      if (result.success) {
        setQuizzes(result.data);
        setFilteredQuizzes(result.data);
      }
    } catch (error: any) {
      console.error('Error fetching quizzes:', error);
      setError(error.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter quizzes when search or filter changes
  useEffect(() => {
    if (quizzes.length > 0) {
      let filtered = [...quizzes];

      // Apply search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(q =>
          q.title.toLowerCase().includes(term) ||
          q.description.toLowerCase().includes(term) ||
          q.courseTitle.toLowerCase().includes(term)
        );
      }

      // Apply filter
      switch (filter) {
        case 'available':
          filtered = filtered.filter(q => q.availability === 'available' && !q.hasAttempted);
          break;
        case 'completed':
          filtered = filtered.filter(q => q.hasAttempted);
          break;
        case 'upcoming':
          filtered = filtered.filter(q => q.availability === 'upcoming');
          break;
        default:
          break;
      }

      setFilteredQuizzes(filtered);
    }
  }, [searchTerm, filter, quizzes]);

  const handleRefresh = () => {
    if (user?.email || user?.id) {
      fetchQuizzes(user.email || user.id, true);
    }
  };

  const getStatusBadge = (quiz: Quiz) => {
    if (quiz.hasAttempted) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1 w-fit">
          <HiCheckCircle className="w-3 h-3" />
          Completed
        </span>
      );
    }

    if (quiz.availability === 'upcoming') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex items-center gap-1 w-fit">
          <HiCalendar className="w-3 h-3" />
          Upcoming
        </span>
      );
    }

    if (quiz.availability === 'expired') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 flex items-center gap-1 w-fit">
          <HiXCircle className="w-3 h-3" />
          Expired
        </span>
      );
    }

    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1 w-fit">
        <HiClipboardCheck className="w-3 h-3" />
        Available
      </span>
    );
  };

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: BRAND_COLORS.deepRed }} />
          <p className="text-gray-600">Loading your quizzes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <HiXCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2 text-gray-900">Error Loading Quizzes</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header - Original Theme */}
      <div className="mb-6">
  <div 
    className="rounded-xl p-6 text-white"
    style={{ 
      background: 'linear-gradient(135deg, #B11217 0%, #1E3A8A 100%)'
    }}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div 
          className="p-3 rounded-xl"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
        >
          <HiClipboardCheck className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-2">Mock Quizzes</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Practice and test your knowledge</p>
        </div>
      </div>
      <button
        onClick={handleRefresh}
        disabled={refreshing}
        className="p-2 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
      >
        <HiRefresh className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
      </button>
    </div>
  </div>
</div>

      {/* Stats Cards - Original Theme Colors, Example Code Font Sizes */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Quizzes</p>
          <p className="text-2xl font-bold text-gray-900">{quizzes.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-600">
            {quizzes.filter(q => q.hasAttempted).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Available</p>
          <p className="text-2xl font-bold text-blue-600">
            {quizzes.filter(q => q.availability === 'available' && !q.hasAttempted).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Upcoming</p>
          <p className="text-2xl font-bold text-amber-600">
            {quizzes.filter(q => q.availability === 'upcoming').length}
          </p>
        </div>
      </div>

      {/* Filters - Original Theme */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-[160px]"
          >
            <option value="all">All Quizzes</option>
            <option value="available">Available</option>
            <option value="completed">Completed</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>
      </div>

      {/* Quizzes Table - Royal Blue Header, Example Code Font Sizes */}
      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="p-4 bg-indigo-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <HiClipboardCheck className="w-10 h-10 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Quizzes Found</h3>
          <p className="text-sm text-gray-500 mb-6">Check back later for new quizzes.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: BRAND_COLORS.royalBlue }} className="text-white">
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">Quiz Details</th>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">Course</th>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">Questions</th>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">Instructor</th>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredQuizzes.map((quiz, index) => (
                  <tr key={quiz.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{quiz.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-1 mt-1">{quiz.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <HiBookOpen className="w-4 h-4 text-gray-400" />
                        {quiz.courseTitle}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <HiClock className="w-4 h-4 text-gray-400" />
                        {quiz.duration} min
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {quiz.totalQuestions}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <HiUser className="w-4 h-4 text-gray-400" />
                        {quiz.instructorName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        {getStatusBadge(quiz)}
                        {quiz.timeRemaining && quiz.availability === 'available' && !quiz.hasAttempted && (
                          <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full w-fit">
                            ⏰ {quiz.timeRemaining}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {quiz.hasAttempted ? (
                        <Link
                          href={`/lms/Student_Portal/mock-quizzes/results/${quiz.id}`}
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          View Results
                          <HiChevronRight className="w-4 h-4" />
                        </Link>
                      ) : quiz.canAttempt ? (
                        <Link
                          href={`/lms/Student_Portal/mock-quizzes/${quiz.id}`}
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          Start Quiz
                          <HiChevronRight className="w-4 h-4" />
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-400">Not Available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}