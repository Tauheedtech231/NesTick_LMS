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
  HiXCircle,
  HiTrendingUp,
  HiChartBar,
  HiClock,
  HiCalendar,
  HiDocumentText,
  HiFire,
  HiSparkles,
  HiCog,
  HiUserGroup,
  HiBadgeCheck,
  HiChartPie
} from 'react-icons/hi';
import Link from 'next/link';

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

// KPI Card Component - Consistent font sizes
const KPICard = ({ 
  title, 
  value, 
  icon: Icon, 
  color,
  trend,
  trendValue
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group">
      <div className="flex items-start justify-between">
        <div className={`${color} rounded-lg p-2.5 text-white shadow-md group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-green-100 text-green-700' :
            trend === 'down' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            <HiTrendingUp className={`w-3 h-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
            {trendValue}
          </div>
        )}
      </div>
      <div className="mt-2">
        <p className="text-xs text-gray-600 mb-0.5">{title}</p>
        <h3 className="text-xl font-bold text-gray-900">{value}</h3>
      </div>
    </div>
  );
};

// Progress Bar Component - Consistent sizing
const ProgressBar = ({ 
  progress, 
  size = 'sm', 
  animate = false,
  showLabel = false,
  label = '',
  className = ''
}: {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  showLabel?: boolean;
  label?: string;
  className?: string;
}) => {
  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-2.5'
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-600">{label}</span>
          <span className="text-xs font-semibold" style={{ color: BRAND_COLORS.deepRed }}>{progress}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClasses[size]} ${className}`}>
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${animate ? 'ease-out' : ''}`}
          style={{ 
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${BRAND_COLORS.deepRed} 0%, ${BRAND_COLORS.darkRoyalBlue} 100%)`
          }}
        ></div>
      </div>
    </div>
  );
};

// Course Row Component - Consistent font sizes
const CourseRow = ({ course }: { course: DashboardCourse }) => {
  const getStatusColor = () => {
    if (course.progressPercentage === 100) return 'bg-green-100 text-green-700';
    if (course.progressPercentage > 0) return 'bg-amber-100 text-amber-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getLevelColor = () => {
    switch(course.level?.toLowerCase()) {
      case 'beginner': return `${BRAND_COLORS.teal}15`;
      case 'intermediate': return `${BRAND_COLORS.darkRoyalBlue}15`;
      case 'advanced': return `${BRAND_COLORS.deepRed}15`;
      default: return `${BRAND_COLORS.teal}15`;
    }
  };

  const getLevelTextColor = () => {
    switch(course.level?.toLowerCase()) {
      case 'beginner': return BRAND_COLORS.teal;
      case 'intermediate': return BRAND_COLORS.darkRoyalBlue;
      case 'advanced': return BRAND_COLORS.deepRed;
      default: return BRAND_COLORS.teal;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all group">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <div className="p-1 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}15` }}>
              <HiAcademicCap className="w-3.5 h-3.5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
            </div>
            <span 
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: getLevelColor(),
                color: getLevelTextColor()
              }}
            >
              {course.level || 'General'}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <HiClock className="w-3 h-3" />
              {course.duration}
            </span>
            {course.lastAccessed && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <HiCalendar className="w-3 h-3" />
                  {new Date(course.lastAccessed).toLocaleDateString()}
                </span>
              </>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 text-base truncate group-hover:text-blue-600 transition-colors">
            {course.title}
          </h3>
        </div>

        <div className="flex flex-col sm:items-end gap-2 flex-shrink-0">
          <span className={`text-xs font-bold px-2 py-1 rounded-full self-start sm:self-auto ${getStatusColor()}`}>
            {course.progressPercentage === 100 
              ? 'Completed' 
              : course.progressPercentage > 0 
                ? `${course.progressPercentage}% Complete`
                : 'Not Started'}
          </span>
          <Link
            href={`/lms/Student_Portal/my-courses`}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all text-white hover:opacity-90 hover:shadow-md group"
            style={{ backgroundColor: BRAND_COLORS.deepRed }}
          >
            {course.progressPercentage === 100 ? 'Review' : 'Continue'}
            <HiArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Progress bar */}
      {course.progressPercentage > 0 && (
        <div className="mt-3">
          <ProgressBar 
            progress={course.progressPercentage} 
            size="sm" 
            animate 
            showLabel 
            label="Progress"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1.5">
            <span className="flex items-center gap-1">
              <HiDocumentText className="w-3 h-3" />
              {course.completedSlides || 0}/{course.totalSlides || 0} lessons
            </span>
            {course.progressPercentage < 100 && (
              <span className="text-xs text-gray-500">{course.totalSlides - (course.completedSlides || 0)} left</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Quick Access Card Component - Consistent font sizes
const QuickAccessCard = ({ 
  href, 
  title, 
  subtitle, 
  icon: Icon, 
  color,
  bgColor 
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  bgColor: string;
}) => {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 hover:shadow-lg transition-all hover:-translate-y-1"
    >
      <div className="absolute top-0 right-0 w-20 h-20 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon className="w-20 h-20" style={{ color }} />
      </div>
      <div className="relative z-10">
        <div className={`${bgColor} w-10 h-10 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-semibold text-gray-900 text-sm mb-0.5">{title}</h3>
        <p className="text-xs text-gray-600">{subtitle}</p>
        <div className="mt-2 flex items-center gap-1 text-xs font-medium" style={{ color }}>
          View
          <HiArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
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
      const response = await fetch(`/api/students/dashboard?studentEmail=${encodeURIComponent(user.email)}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }

      if (result.success) {
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
            <HiAcademicCap className="w-6 h-6 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-sm text-gray-600 mt-3">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-red-100 flex items-center justify-center">
            <HiXCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-base font-bold mb-1 text-gray-900">Something went wrong</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 rounded-lg text-sm text-white font-medium inline-flex items-center gap-2 hover:opacity-90 transition-all shadow-sm"
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
    <div className="space-y-4 p-4 bg-gray-50 min-h-screen">
      {/* Welcome Section */}
      <div 
        className="relative overflow-hidden rounded-xl p-5 text-white shadow-lg"
        style={{ 
          background: `linear-gradient(135deg, ${BRAND_COLORS.darkNavy} 0%, ${BRAND_COLORS.darkRoyalBlue} 70%, ${BRAND_COLORS.deepRed} 100%)`
        }}
      >
        <div className="absolute top-0 right-0 w-48 h-48 opacity-10">
          <HiSparkles className="w-48 h-48 text-white" />
        </div>
        <div className="absolute bottom-0 left-0 w-32 h-32 opacity-10">
          <HiAcademicCap className="w-32 h-32 text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg md:text-xl font-bold">
                Welcome back, {user?.name?.split(' ')[0] || 'Student'}!
              </h1>
              <HiBadgeCheck className="w-5 h-5 text-yellow-300" />
            </div>
            <p className="text-xs md:text-sm opacity-90 flex items-center gap-2">
              <HiUserGroup className="w-4 h-4" />
              {summary?.totalCourses || 0} enrolled course{(summary?.totalCourses || 0) !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-3 py-1.5 text-xs bg-white/20 rounded-lg hover:bg-white/30 transition-all flex items-center gap-1.5 disabled:opacity-50 backdrop-blur-sm"
            >
              <HiOutlineRefresh className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <div className="text-right px-3 py-1.5 bg-white/10 rounded-lg">
              <p className="text-xs opacity-80">ID</p>
              <p className="text-xs font-bold">{user?.email?.split('@')[0] || 'STU001'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Total Courses"
          value={summary?.totalCourses || 0}
          icon={HiBookOpen}
          color="bg-gradient-to-br from-blue-500 to-blue-700"
        trend={(summary?.totalCourses ?? 0) > 0 ? 'up' : 'neutral'}
          trendValue="+2"
        />
        <KPICard
          title="Completed"
          value={summary?.completedCourses || 0}
          icon={HiCheckCircle}
          color="bg-gradient-to-br from-green-500 to-green-700"
          trend={(summary?.completedCourses ?? 0) > 0 ? 'up' : 'neutral'}
          trendValue={`${Math.round((summary?.completedCourses || 0) / (summary?.totalCourses || 1) * 100)}%`}
        />
        <KPICard
          title="In Progress"
          value={summary?.inProgressCourses || 0}
          icon={HiLightningBolt}
          color="bg-gradient-to-br from-orange-500 to-orange-700"
          trend="neutral"
          trendValue="Active"
        />
        <KPICard
          title="Quizzes Passed"
          value={`${quizStats?.passedQuizzes || 0}/${quizStats?.totalQuizzes || 0}`}
          icon={HiClipboardCheck}
          color="bg-gradient-to-br from-purple-500 to-purple-700"
          trend={quizStats?.passRate && quizStats.passRate > 70 ? 'up' : 'down'}
          trendValue={`${quizStats?.passRate || 0}%`}
        />
      </div>

      {/* Quiz Performance & Recent Activity */}
      {quizStats && quizStats.totalQuizzes > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Quiz Stats */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}15` }}>
                <HiChartPie className="w-4 h-4" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
              </div>
              <h2 className="text-sm font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
                Quiz Performance
              </h2>
            </div>
            
            <div className="space-y-3">
              {/* Simple Progress Circle */}
              <div className="relative w-24 h-24 mx-auto">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="6"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke={BRAND_COLORS.deepRed}
                    strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 40 * (quizStats.passRate / 100)} ${2 * Math.PI * 40}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-lg font-bold" style={{ color: BRAND_COLORS.deepRed }}>{quizStats.passRate}%</span>
                    <p className="text-xs text-gray-500">Pass Rate</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
                  <p className="text-xs text-gray-600">Attempted</p>
                  <p className="text-base font-bold mt-0.5" style={{ color: BRAND_COLORS.darkNavy }}>
                    {quizStats.attemptedQuizzes}
                  </p>
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
                  <p className="text-xs text-gray-600">Passed</p>
                  <p className="text-base font-bold mt-0.5 text-green-600">
                    {quizStats.passedQuizzes}
                  </p>
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
                  <p className="text-xs text-gray-600">Avg Score</p>
                  <p className="text-base font-bold mt-0.5" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                    {quizStats.averageScore}%
                  </p>
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
                  <p className="text-xs text-gray-600">Highest</p>
                  <p className="text-base font-bold mt-0.5" style={{ color: BRAND_COLORS.teal }}>
                    {quizStats.highestScore}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.teal}15` }}>
                  <HiFire className="w-4 h-4" style={{ color: BRAND_COLORS.teal }} />
                </div>
                <h2 className="text-sm font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
                  Recent Activity
                </h2>
              </div>
              <span className="text-xs text-gray-500">Last 7 days</span>
            </div>

            {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
              <div className="space-y-2">
                {dashboardData.recentActivity.slice(0, 3).map((activity, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 rounded-lg transition-all hover:shadow-sm"
                    style={{ backgroundColor: index % 2 === 0 ? BRAND_COLORS.lightGrey : BRAND_COLORS.white }}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ 
                          backgroundColor: activity.status === 'passed' 
                            ? `${BRAND_COLORS.teal}15` 
                            : `${BRAND_COLORS.deepRed}15` 
                        }}
                      >
                        {activity.type === 'quiz' ? (
                          <HiClipboardCheck className="w-4 h-4" style={{ 
                            color: activity.status === 'passed' ? BRAND_COLORS.teal : BRAND_COLORS.deepRed 
                          }} />
                        ) : (
                          <HiBookOpen className="w-4 h-4" style={{ 
                            color: activity.status === 'passed' ? BRAND_COLORS.teal : BRAND_COLORS.deepRed 
                          }} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {activity.value !== null && (
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-bold ${
                          activity.status === 'passed' ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {activity.value}%
                        </span>
                        {activity.status === 'passed' ? (
                          <HiCheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <HiClock className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <HiFire className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-xs text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <QuickAccessCard
          href={`/lms/Student_Portal/my-courses/${lastAccessedCourse?.id || ''}`}
          title="Continue Learning"
          subtitle={lastAccessedCourse?.title?.substring(0, 30) || 'Your last course'}
          icon={HiPlay}
          color={BRAND_COLORS.deepRed}
          bgColor="bg-gradient-to-br from-red-500 to-red-700"
        />
        <QuickAccessCard
          href="/lms/Student_Portal/my-courses"
          title="My Courses"
          subtitle={`${summary?.totalCourses || 0} total • ${summary?.inProgressCourses || 0} active`}
          icon={HiBookOpen}
          color={BRAND_COLORS.darkRoyalBlue}
          bgColor="bg-gradient-to-br from-blue-500 to-blue-700"
        />
        <QuickAccessCard
          href="/lms/Student_Portal/certificates"
          title="Certificates"
          subtitle={`${summary?.completedCourses || 0} earned`}
          icon={HiStar}
          color="#F59E0B"
          bgColor="bg-gradient-to-br from-yellow-500 to-yellow-700"
        />
      </div>

      {/* Courses List */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}15` }}>
                <HiBookOpen className="w-4 h-4" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
              </div>
              <h2 className="text-base font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
                My Courses
              </h2>
            </div>
            <p className="text-xs text-gray-600 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                {summary?.completedCourses || 0} completed
              </span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">
                {summary?.inProgressCourses || 0} in progress
              </span>
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-gray-600 mb-1">Overall Progress</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold" style={{ color: BRAND_COLORS.deepRed }}>
                {overallProgress}%
              </span>
              <div className="w-24">
                <ProgressBar progress={overallProgress} size="sm" />
              </div>
            </div>
          </div>
        </div>

        {dashboardData?.courses && dashboardData.courses.length > 0 ? (
          <div className="space-y-3">
            {dashboardData.courses.map(course => (
              <CourseRow key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-200 flex items-center justify-center">
              <HiBookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium mb-1 text-gray-900">No courses enrolled</h3>
            <p className="text-xs text-gray-600 mb-4 max-w-md mx-auto">
              Browse our catalog and start your learning journey!
            </p>
            <Link
              href="/courses"
              className="inline-flex px-4 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-90 hover:shadow-sm"
              style={{ 
                backgroundColor: BRAND_COLORS.deepRed,
                color: BRAND_COLORS.white 
              }}
            >
              Browse Courses
              <HiArrowRight className="w-3 h-3 ml-1.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}