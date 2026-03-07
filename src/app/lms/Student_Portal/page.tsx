// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  HiBookOpen, 
  HiCheckCircle, 
 
  HiArrowRight,
  HiClipboardCheck,
  
  HiStar,
  HiLightningBolt,
  HiPlay,
  
  HiAcademicCap,
  HiOutlineRefresh,
  HiXCircle
} from 'react-icons/hi';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
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

// Types from API
interface DashboardCourse {
  id: string;
  title: string;
  image: string;
  duration: string;
  level: string;
  totalSlides: number;
  completedSlides: number;
  progressPercentage: number;
  lastAccessed: string;
  status: 'completed' | 'in_progress' | 'not_started';
}

interface QuizStats {
  totalQuizzes: number;
  attemptedQuizzes: number;
  passedQuizzes: number;
  averageScore: number;
  highestScore: number;
  pendingQuizzes: number;
  passRate: number;
}

interface RecentActivity {
  type: string;
  description: string;
  createdAt: string;
  status: string;
  value: number | null;
}

interface DashboardSummary {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalQuizzes: number;
  completedQuizzes: number;
  passRate: number;
}

interface DashboardData {
  quizStats: QuizStats;
  courses: DashboardCourse[];
  recentActivity: RecentActivity[];
  summary: DashboardSummary;
}

// KPI Card Component
const KPICard = ({ 
  title, 
  value, 
  icon: Icon, 
  color
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
      <div className="flex items-center gap-3">
        <div className={`${color} rounded-lg p-2.5 text-white flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-600 mb-0.5">{title}</p>
          <h3 className="text-xl font-bold text-gray-900">{value}</h3>
        </div>
      </div>
    </div>
  );
};

// Progress Bar Component
const ProgressBar = ({ 
  progress, 
  size = 'md', 
  animate = false,
  className = ''
}: {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  className?: string;
}) => {
  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClasses[size]} ${className}`}>
      <div 
        className={`h-full rounded-full transition-all duration-1000 ${animate ? 'ease-out' : ''}`}
        style={{ 
          width: `${progress}%`,
          backgroundColor: BRAND_COLORS.deepRed
        }}
      ></div>
    </div>
  );
};

// Course Row Component
const CourseRow = ({ course }: { course: DashboardCourse }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <HiAcademicCap className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{
              backgroundColor: `${BRAND_COLORS.teal}15`,
              color: BRAND_COLORS.teal
            }}>
              {course.level || 'General'}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{course.duration}</span>
          </div>
          <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">{course.title}</h3>
        </div>

        <div className="flex flex-col sm:items-end gap-2 flex-shrink-0">
          <span className={`text-sm font-bold px-3 py-1 rounded-full self-start sm:self-auto ${
            course.progressPercentage === 100 
              ? 'bg-green-100 text-green-700' 
              : course.progressPercentage > 0 
                ? 'bg-amber-100 text-amber-700'
                : 'bg-gray-100 text-gray-700'
          }`}>
            {course.progressPercentage === 100 
              ? 'Completed' 
              : course.progressPercentage > 0 
                ? `${course.progressPercentage}% Complete`
                : 'Not Started'}
          </span>
          <Link
            href={`/lms/Student_Portal/my-courses/${course.id}`}
            className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors text-white"
            style={{ backgroundColor: BRAND_COLORS.deepRed }}
          >
            {course.progressPercentage === 100 ? 'Review Course' : 'Continue Learning'}
            <HiArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Progress bar */}
      {course.progressPercentage > 0 && course.progressPercentage < 100 && (
        <div className="mt-3">
          <ProgressBar progress={course.progressPercentage} size="md" animate />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{course.completedSlides || 0}/{course.totalSlides || 0} lessons</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user from localStorage
  useEffect(() => {
    try {
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) {
        window.location.href = '/lms/auth/login?type=student';
        return;
      }

      const userData = JSON.parse(currentUserStr);
      if (userData.role !== 'student') {
        window.location.href = '/lms/auth/login?type=student';
        return;
      }

      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
      setError('Failed to load user data');
    }
  }, []);

  // Fetch dashboard data from API
  const fetchDashboardData = async (showRefreshing = false) => {
    if (!user?.email) return;

    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      console.log('🔍 Fetching dashboard data for:', user.email);

      const response = await fetch(`/api/students/dashboard?studentEmail=${encodeURIComponent(user.email)}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }

      if (result.success) {
        console.log('📊 Dashboard data:', result.data);
        setDashboardData(result.data);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard:', error);
      setError(error.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchDashboardData();
    }
  }, [user]);

  const handleRefresh = () => {
    if (user?.email) {
      fetchDashboardData(true);
    }
  };

  const getOverallProgress = () => {
    if (!dashboardData?.courses || dashboardData.courses.length === 0) return 0;
    
    const totalProgress = dashboardData.courses.reduce((sum, course) => sum + (course.progressPercentage || 0), 0);
    return Math.round(totalProgress / dashboardData.courses.length);
  };

  const getLastAccessedCourse = () => {
    if (!dashboardData?.courses || dashboardData.courses.length === 0) return null;
    
    return dashboardData.courses.find(c => c.status === 'in_progress') || dashboardData.courses[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: BRAND_COLORS.deepRed }} />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md mx-auto">
          <HiXCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2 text-gray-900">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 rounded-lg text-white font-medium inline-flex items-center gap-2"
            style={{ backgroundColor: BRAND_COLORS.deepRed }}
          >
            <HiOutlineRefresh className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const overallProgress = getOverallProgress();
  const lastAccessedCourse = getLastAccessedCourse();
  const quizStats = dashboardData?.quizStats;
  const summary = dashboardData?.summary;

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6 bg-gray-50 min-h-screen">
      {/* Welcome Section */}
      <div 
        className="rounded-xl p-4 sm:p-5 md:p-6 text-white shadow-lg"
        style={{ background: `linear-gradient(145deg, ${BRAND_COLORS.darkNavy} 0%, ${BRAND_COLORS.darkRoyalBlue} 100%)` }}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3">
          <div>
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-0.5">
              Welcome back, {user?.name?.split(' ')[0] || 'Student'}!
            </h1>
            <p className="text-xs sm:text-sm opacity-90">
              {summary?.totalCourses || 0} enrolled course{(summary?.totalCourses || 0) !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-3 py-1.5 text-xs bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <HiOutlineRefresh className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <div className="text-left sm:text-right">
              <p className="text-xs opacity-90">Email</p>
              <p className="text-xs sm:text-sm font-bold">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards - Only real stats from API */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KPICard
          title="Total Courses"
          value={summary?.totalCourses || 0}
          icon={HiBookOpen}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <KPICard
          title="Completed"
          value={summary?.completedCourses || 0}
          icon={HiCheckCircle}
          color="bg-gradient-to-r from-green-500 to-green-600"
        />
        <KPICard
          title="In Progress"
          value={summary?.inProgressCourses || 0}
          icon={HiLightningBolt}
          color="bg-gradient-to-r from-orange-500 to-orange-600"
        />
        <KPICard
          title="Quizzes Passed"
          value={`${quizStats?.passedQuizzes || 0}/${quizStats?.totalQuizzes || 0}`}
          icon={HiClipboardCheck}
          color="bg-gradient-to-r from-yellow-500 to-yellow-600"
        />
      </div>

      {/* Quiz Performance - Only if quizzes exist */}
      {quizStats && quizStats.totalQuizzes > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
          <h2 className="text-base sm:text-lg font-bold mb-3" style={{ color: BRAND_COLORS.darkNavy }}>
            Quiz Performance
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="text-center p-2 sm:p-3 rounded-lg" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
              <p className="text-xs text-gray-600">Attempted</p>
              <p className="text-sm sm:text-base font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
                {quizStats.attemptedQuizzes}
              </p>
            </div>
            <div className="text-center p-2 sm:p-3 rounded-lg" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
              <p className="text-xs text-gray-600">Passed</p>
              <p className="text-sm sm:text-base font-bold mt-1 text-green-600">
                {quizStats.passedQuizzes}
              </p>
            </div>
            <div className="text-center p-2 sm:p-3 rounded-lg" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
              <p className="text-xs text-gray-600">Avg Score</p>
              <p className="text-sm sm:text-base font-bold mt-1" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                {quizStats.averageScore}%
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h3>
              {dashboardData.recentActivity.slice(0, 3).map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {activity.value !== null && (
                      <span className={`text-sm font-bold ${
                        activity.status === 'passed' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {activity.value}%
                      </span>
                    )}
                    {activity.status === 'passed' && (
                      <HiCheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Access - 3 in a row */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
        <h2 className="text-base sm:text-lg font-bold mb-3" style={{ color: BRAND_COLORS.darkNavy }}>
          Quick Access
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          {/* Continue Learning */}
          {lastAccessedCourse && (
            <Link
              href={`/lms/Student_Portal/my-courses/${lastAccessedCourse.id}`}
              className="p-3 rounded-lg border flex items-center justify-between hover:shadow-md transition-all group"
              style={{ borderColor: BRAND_COLORS.deepRed }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <HiPlay className="w-3 h-3" style={{ color: BRAND_COLORS.deepRed }} />
                  <p className="text-xs font-medium text-gray-600 truncate">CONTINUE</p>
                </div>
                <p className="text-xs font-medium text-gray-900 truncate">
                  {lastAccessedCourse.title}
                </p>
              </div>
              <HiArrowRight className="w-3 h-3 text-gray-400 group-hover:text-gray-900 ml-2 flex-shrink-0" />
            </Link>
          )}

          {/* My Courses */}
          <Link
            href="/lms/Student_Portal/my-courses"
            className="p-3 rounded-lg border flex items-center justify-between hover:shadow-md transition-all group"
            style={{ borderColor: BRAND_COLORS.teal }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <HiBookOpen className="w-3 h-3" style={{ color: BRAND_COLORS.teal }} />
                <p className="text-xs font-medium text-gray-600 truncate">MY COURSES</p>
              </div>
              <p className="text-xs font-medium text-gray-900 truncate">
                {summary?.totalCourses || 0} {summary?.totalCourses === 1 ? 'Course' : 'Courses'}
              </p>
            </div>
            <HiArrowRight className="w-3 h-3 text-gray-400 group-hover:text-gray-900 ml-2 flex-shrink-0" />
          </Link>

          {/* Certificates */}
          <Link
            href="/lms/Student_Portal/certificates"
            className="p-3 rounded-lg border flex items-center justify-between hover:shadow-md transition-all group"
            style={{ borderColor: '#FCD34D' }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <HiStar className="w-3 h-3" style={{ color: '#F59E0B' }} />
                <p className="text-xs font-medium text-gray-600 truncate">CERTIFICATES</p>
              </div>
              <p className="text-xs font-medium text-gray-900 truncate">
                {summary?.completedCourses || 0} Earned
              </p>
            </div>
            <HiArrowRight className="w-3 h-3 text-gray-400 group-hover:text-gray-900 ml-2 flex-shrink-0" />
          </Link>
        </div>
      </div>

      {/* Courses List */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
              My Courses ({dashboardData?.courses.length || 0})
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {summary?.completedCourses || 0} completed • {summary?.inProgressCourses || 0} in progress
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs text-gray-600">Overall Progress</p>
            <span className="text-lg sm:text-xl font-bold" style={{ color: BRAND_COLORS.deepRed }}>
              {overallProgress}%
            </span>
          </div>
        </div>

        {/* Overall progress bar */}
        {dashboardData?.courses && dashboardData.courses.length > 0 && (
          <div className="mb-4">
            <ProgressBar progress={overallProgress} size="md" animate />
          </div>
        )}

        {dashboardData?.courses && dashboardData.courses.length > 0 ? (
          <div className="space-y-3">
            {dashboardData.courses.map(course => (
              <CourseRow key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <HiBookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.softGrey }} />
            <h3 className="text-base font-medium mb-1" style={{ color: BRAND_COLORS.darkGrey }}>
              No courses enrolled
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              You haven't enrolled in any courses yet.
            </p>
            <Link
              href="/courses"
              className="inline-flex px-4 py-2 rounded-lg font-medium text-xs transition-colors"
              style={{ 
                backgroundColor: BRAND_COLORS.deepRed,
                color: BRAND_COLORS.white 
              }}
            >
              Browse Courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}