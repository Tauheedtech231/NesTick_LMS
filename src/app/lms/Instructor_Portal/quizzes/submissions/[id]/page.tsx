
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  BarChart,
  FileText,
  Mail,
  Award,
  TrendingUp,
  AlertCircle,
  Users,
  Percent,
  Trophy,
  Target,
  ChevronDown,
  ChevronUp,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Loader2 } from 'lucide-react';

const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  white: '#FFFFFF',
  lightGrey: '#F4F6F8',
  softGrey: '#E5E7EB',
  darkGrey: '#1F2933',
  teal: '#1FB6C9',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6'
};

interface QuizAttempt {
  attempt_id: string;
  student_email: string;
  student_name: string;
  score: number;
  total_points: number;
  passed: boolean;
  attempted_at: string;
  percentage: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalQuestions: number;
  totalPoints: number;
  startDate: string;
  endDate: string;
  status: string;
  instructorName: string;
  courseTitle: string;
}

interface QuizStats {
  totalAttempts: number;
  passedAttempts: number;
  averageScore: number;
  passRate: number;
}

export default function QuizResultsPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [instructor, setInstructor] = useState<any>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [filteredAttempts, setFilteredAttempts] = useState<QuizAttempt[]>([]);
  const [stats, setStats] = useState<QuizStats>({
    totalAttempts: 0,
    passedAttempts: 0,
    averageScore: 0,
    passRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      checkAuthAndLoadData();
    }
  }, [isMounted, quizId]);

  const checkAuthAndLoadData = async () => {
    try {
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) {
        router.push('/lms/auth/login?type=instructor');
        return;
      }

      const currentUser = JSON.parse(currentUserStr);
      if (currentUser.role !== 'instructor') {
        router.push('/lms/auth/login?type=instructor');
        return;
      }

      setInstructor(currentUser);
      await fetchQuizResults();
    } catch (error) {
      console.error('Error loading user:', error);
      setError('Failed to load user data');
      setLoading(false);
    }
  };

  const fetchQuizResults = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(`/api/instructors/quizzes/${quizId}/results`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch quiz results');
      }

      if (result.success) {
        setQuiz(result.data.quiz);
        setAttempts(result.data.attempts);
        setFilteredAttempts(result.data.attempts);
        setStats(result.data.stats);
      }
    } catch (error: any) {
      console.error('Error fetching quiz results:', error);
      setError(error.message || 'Failed to load quiz results');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let filtered = attempts;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        a.student_name.toLowerCase().includes(term) ||
        a.student_email.toLowerCase().includes(term)
      );
    }

    // Apply pass/fail filter
    if (filter === 'passed') {
      filtered = filtered.filter(a => a.passed);
    } else if (filter === 'failed') {
      filtered = filtered.filter(a => !a.passed);
    }

    setFilteredAttempts(filtered);
  }, [searchTerm, filter, attempts]);

  const handleRefresh = () => {
    fetchQuizResults(true);
  };

  const handleExportResults = () => {
    if (filteredAttempts.length === 0) {
      alert('No data to export');
      return;
    }
    
    // Create CSV content
    const headers = ['Student Name', 'Student Email', 'Score', 'Total Points', 'Percentage', 'Result', 'Attempted At'];
    const csvContent = [
      headers.join(','),
      ...filteredAttempts.map(a => [
        `"${a.student_name}"`,
        `"${a.student_email}"`,
        a.score,
        a.total_points,
        a.percentage,
        a.passed ? 'Pass' : 'Fail',
        new Date(a.attempted_at).toLocaleString()
      ].join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-results-${quiz?.title.replace(/\s+/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateMobile = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-50 border-green-200';
    if (percentage >= 60) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: BRAND_COLORS.deepRed }} />
          <p className="text-gray-600">Loading quiz results...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-xl font-bold mb-2">Error Loading Results</h1>
          <p className="text-gray-600 mb-6">{error || 'Quiz not found'}</p>
          <Link
            href="/lms/Instructor_Portal/quizzes/results"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white"
            style={{ backgroundColor: BRAND_COLORS.deepRed }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/lms/Instructor_Portal/quizzes/results"
              className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Back</span>
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                {quiz.title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                {quiz.courseTitle || 'Course'} • {stats.totalAttempts} submissions
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            
            {attempts.length > 0 && (
              <button
                onClick={handleExportResults}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Attempts</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.totalAttempts}</p>
              </div>
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Passed</p>
                <p className="text-lg sm:text-xl font-bold text-green-600">{stats.passedAttempts}</p>
              </div>
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Avg Score</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.averageScore}%</p>
              </div>
              <BarChart className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Pass Rate</p>
                <p className="text-lg sm:text-xl font-bold text-teal-600">{stats.passRate}%</p>
              </div>
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-900">Student Submissions</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-1 text-gray-600 hover:bg-gray-100 rounded"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
          
          {showFilters && (
            <div className="space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                />
              </div>
              
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({attempts.length})
                </button>
                <button
                  onClick={() => setFilter('passed')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    filter === 'passed' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Passed ({attempts.filter(a => a.passed).length})
                </button>
                <button
                  onClick={() => setFilter('failed')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    filter === 'failed' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Failed ({attempts.filter(a => !a.passed).length})
                </button>
              </div>
            </div>
          )}
          
          {/* Results Count */}
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredAttempts.length} of {attempts.length} submissions
          </div>
        </div>

        {/* Submissions List */}
        {filteredAttempts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <h3 className="text-lg font-medium mb-2 text-gray-700">
              {searchTerm ? 'No matching results' : 'No submissions yet'}
            </h3>
            <p className="text-gray-600 text-sm">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Student submissions will appear here'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Desktop Table */}
            <div className="hidden sm:block">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Student</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Score</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Result</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Submitted</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredAttempts.map((attempt) => (
                        <tr key={attempt.attempt_id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {attempt.student_name}
                              </div>
                              <div className="text-xs text-gray-600 truncate">
                                {attempt.student_email}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getScoreBgColor(attempt.percentage)}`}>
                              <span className={`font-bold ${getScoreColor(attempt.percentage)}`}>
                                {attempt.percentage}%
                              </span>
                              <span className="text-xs text-gray-600">
                                ({attempt.score}/{attempt.total_points})
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              attempt.passed 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {attempt.passed ? (
                                <>
                                  <CheckCircle className="w-3 h-3" />
                                  Passed
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3" />
                                  Failed
                                </>
                              )}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              {formatDateMobile(attempt.attempted_at)}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Link
                              href={`/lms/Instructor_Portal/students`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="w-5 h-5" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-3">
              {filteredAttempts.map((attempt) => (
                <div key={attempt.attempt_id} className="bg-white rounded-lg border border-gray-200 p-4">
                  {/* Student Info */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-gray-500" />
                        <h3 className="font-medium text-gray-900 truncate">
                          {attempt.student_name}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-600 truncate">
                        {attempt.student_email}
                      </p>
                    </div>
                    
                    {/* Score Badge */}
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border ${getScoreBgColor(attempt.percentage)}`}>
                      <span className={`font-bold text-sm ${getScoreColor(attempt.percentage)}`}>
                        {attempt.percentage}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Score</p>
                      <p className="text-sm font-medium">
                        {attempt.score}/{attempt.total_points}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Result</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        attempt.passed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {attempt.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Submitted</p>
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        {formatDateMobile(attempt.attempted_at)}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Action</p>
                      <Link
                        href={`/lms/Instructor_Portal/student/${encodeURIComponent(attempt.student_email)}`}
                        className="inline-flex items-center gap-1 text-blue-600 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}