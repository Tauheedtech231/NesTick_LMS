// lms/Student_Portal/progress/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
/* eslint-disable */
import {
  HiChartBar,
  HiClock,
  HiCheckCircle,
 
  HiPlay,

  HiTrendingUp,
  
  HiCalendar,
 
  HiRefresh,

  HiBookOpen,
  HiStar
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

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  instructorName: string;
  image?: string;
}

interface SlideProgress {
  slideId: string;
  slideNumber: number;
  title: string;
  totalFiles: number;
  completedFiles: number;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  timeSpent: number;
  lastAccessed: string | null;
  completedAt: string | null;
}

interface CourseProgress {
  courseId: string;
  courseTitle: string;
  totalSlides: number;
  completedSlides: number;
  progressPercentage: number;
  totalTimeSpent: number;
  lastActive: string | null;
  slides: SlideProgress[];
}

interface AnalyticsData {
  enrollment: {
    id: string;
    studentName: string;
    studentEmail: string;
    enrolledAt: string;
    status: string;
  };
  course: {
    id: string;
    title: string;
    duration: string;
  };
  progress: {
    overall: number;
    status: string;
    studyHours: number;
    lastAccessed: string;
  };
  slides: {
    total: number;
    completed: number;
    inProgress: number;
    completionRate: number;
    totalTimeSpent: number;
  };
  content: {
    totalViews: number;
    completedViews: number;
    completionRate: number;
    totalWatchTime: number;
  };
  quizzes: {
    totalAttempts: number;
    averageScore: number;
    passedQuizzes: number;
    passRate: number;
  };
  activity: {
    daily: Array<{ date: string; slidesAccessed: number }>;
    peakHours: Array<{ hour: number; activityCount: number }>;
    totalActiveDays: number;
  };
  summary: {
    totalTimeInvested: number;
    consistencyScore: number;
    predictedCompletion: string;
  };
}

export default function StudentProgressPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'slides' | 'analytics'>('overview');

  // Load user from localStorage
  useEffect(() => {
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
    } catch (error) {
      console.error('Error loading user:', error);
      setError('Failed to load user data');
    }
  }, [router]);

  // Fetch enrollments
  useEffect(() => {
    if (user?.email) {
      fetchEnrollments();
    }
  }, [user]);

  const fetchEnrollments = async () => {
    try {
      const response = await fetch(`/api/students/enrollments?email=${encodeURIComponent(user.email)}`);
      const result = await response.json();

      if (result.success) {
        setEnrollments(result.data || []);
        if (result.data.length > 0) {
          setSelectedCourse(result.data[0].course_id);
        }
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  // Fetch course progress when course selected
  useEffect(() => {
    if (selectedCourse && user?.email) {
      fetchCourseProgress();
      fetchAnalytics();
    }
  }, [selectedCourse]);

  const fetchCourseProgress = async () => {
    if (!selectedCourse) return;

    setLoading(true);
    try {
      // Get enrollment ID for this course
      const enrollment = enrollments.find(e => e.course_id === selectedCourse);
      if (!enrollment) return;

      const response = await fetch(
        `/api/students/progress/detailed?enrollmentId=${enrollment.id}&courseId=${selectedCourse}`
      );
      const result = await response.json();

      if (result.success) {
        const data = result.data;
        setCourseProgress({
          courseId: data.course.id,
          courseTitle: data.course.title,
          totalSlides: data.summary.totalSlides,
          completedSlides: data.summary.completedSlides,
          progressPercentage: data.summary.courseProgress,
          totalTimeSpent: data.summary.totalTimeSpent,
          lastActive: data.summary.lastActive,
          slides: data.slides
        });
      }
    } catch (error) {
      console.error('Error fetching course progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!selectedCourse || !user?.email) return;

    try {
      const enrollment = enrollments.find(e => e.course_id === selectedCourse);
      if (!enrollment) return;

      const response = await fetch(
        `/api/students/analytics?enrollmentId=${enrollment.id}&studentEmail=${encodeURIComponent(user.email)}&courseId=${selectedCourse}`
      );
      const result = await response.json();

      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCourseProgress();
    await fetchAnalytics();
    setRefreshing(false);
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <HiCheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress': return <HiPlay className="w-5 h-5 text-blue-600" />;
      default: return <HiClock className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !courseProgress) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: BRAND_COLORS.deepRed }} />
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      {/* Header */}
     <div className="mb-6">
  <div 
    className="rounded-xl p-6 text-white"
    style={{ 
      background: 'linear-gradient(135deg, #B11217 0%, #1E3A8A 100%)'
    }}
  >
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold mb-2">My Learning Progress</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Track your course completion and performance</p>
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

      {/* Course Selector */}
      {enrollments.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {enrollments.map((enrollment) => (
              <option key={enrollment.id} value={enrollment.course_id}>
                {enrollment.course_title || 'Course'}
              </option>
            ))}
          </select>
        </div>
      )}

      {courseProgress && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Overall Progress</span>
                <HiChartBar className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{courseProgress.progressPercentage}%</p>
              <p className="text-xs text-gray-500 mt-1">
                {courseProgress.completedSlides} of {courseProgress.totalSlides} lessons
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Time Invested</span>
                <HiClock className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatTime(courseProgress.totalTimeSpent)}</p>
              <p className="text-xs text-gray-500 mt-1">Total learning time</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Last Active</span>
                <HiCalendar className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">{formatDate(courseProgress.lastActive)}</p>
              <p className="text-xs text-gray-500 mt-1">Last lesson accessed</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Completion Rate</span>
                <HiTrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {courseProgress.totalSlides > 0 
                  ? Math.round((courseProgress.completedSlides / courseProgress.totalSlides) * 100) 
                  : 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Lessons completed</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('slides')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'slides'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Lesson Details
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Course Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Course Overview</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Course Title</p>
                    <p className="font-medium">{courseProgress.courseTitle}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Lessons</p>
                      <p className="font-medium">{courseProgress.totalSlides}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Completed</p>
                      <p className="font-medium text-green-600">{courseProgress.completedSlides}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">In Progress</p>
                      <p className="font-medium text-blue-600">
                        {courseProgress.slides.filter(s => s.status === 'in_progress').length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Not Started</p>
                      <p className="font-medium text-gray-600">
                        {courseProgress.slides.filter(s => s.status === 'not_started').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  {courseProgress.slides
                    .filter(s => s.lastAccessed)
                    .sort((a, b) => new Date(b.lastAccessed || 0).getTime() - new Date(a.lastAccessed || 0).getTime())
                    .slice(0, 5)
                    .map(slide => (
                      <div key={slide.slideId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(slide.status)}
                          <div>
                            <p className="font-medium text-sm">Lesson {slide.slideNumber}: {slide.title}</p>
                            <p className="text-xs text-gray-500">Last accessed: {formatDate(slide.lastAccessed)}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(slide.status)}`}>
                          {slide.status === 'completed' ? 'Completed' : slide.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'slides' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Lesson Progress</h2>
              <div className="space-y-3">
                {courseProgress.slides.map((slide) => (
                  <div key={slide.slideId} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(slide.status)}
                        <div>
                          <p className="font-medium">
                            Lesson {slide.slideNumber}: {slide.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {slide.completedFiles} of {slide.totalFiles} files completed
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(slide.status)}`}>
                        {slide.status === 'completed' ? 'Completed' : slide.status === 'in_progress' ? `${slide.progress}%` : 'Not Started'}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    {slide.totalFiles > 0 && (
                      <div className="mt-2">
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-300"
                            style={{ 
                              width: `${slide.progress}%`,
                              backgroundColor: slide.status === 'completed' ? '#10B981' : '#3B82F6'
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mt-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <HiClock className="w-3 h-3" />
                        <span>Time: {formatTime(slide.timeSpent / 60)}</span>
                      </div>
                      {slide.completedAt && (
                        <div className="flex items-center gap-1">
                          <HiCheckCircle className="w-3 h-3 text-green-600" />
                          <span>Completed: {formatDate(slide.completedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              {/* Quiz Performance */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Quiz Performance</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600 mb-1">Average Score</p>
                    <p className="text-2xl font-bold text-purple-700">{analytics.quizzes.averageScore}%</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 mb-1">Passed Quizzes</p>
                    <p className="text-2xl font-bold text-green-700">{analytics.quizzes.passedQuizzes}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 mb-1">Pass Rate</p>
                    <p className="text-2xl font-bold text-blue-700">{analytics.quizzes.passRate}%</p>
                  </div>
                </div>
              </div>

              {/* Learning Stats */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Learning Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Files Viewed</p>
                    <p className="text-xl font-semibold">
                      {analytics.content.completedViews} / {analytics.content.totalViews}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Watch Time</p>
                    <p className="text-xl font-semibold">{formatTime(analytics.content.totalWatchTime)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active Days</p>
                    <p className="text-xl font-semibold">{analytics.activity.totalActiveDays}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Consistency</p>
                    <p className="text-xl font-semibold">{analytics.summary.consistencyScore}</p>
                  </div>
                </div>
              </div>

              {/* Peak Hours */}
              {analytics.activity.peakHours.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">Peak Learning Hours</h2>
                  <div className="flex flex-wrap gap-3">
                    {analytics.activity.peakHours.map((hour) => (
                      <div key={hour.hour} className="bg-indigo-50 rounded-lg px-4 py-2">
                        <span className="text-indigo-700 font-medium">{hour.hour}:00</span>
                        <span className="text-xs text-indigo-500 ml-2">({hour.activityCount} sessions)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Predicted Completion */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center gap-4">
                  <HiStar className="w-8 h-8 text-yellow-300" />
                  <div>
                    <p className="text-sm text-indigo-100 mb-1">Predicted Completion</p>
                    <p className="text-xl font-semibold">
                      {analytics.summary.predictedCompletion}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!courseProgress && !loading && (
        <div className="text-center py-12">
          <HiBookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Progress Data</h3>
          <p className="text-gray-500">Start learning to see your progress here!</p>
        </div>
      )}
    </div>
  );
}