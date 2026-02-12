// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  HiBookOpen, 
  HiCheckCircle, 
  HiClock, 
  HiDocumentText,
  HiChartBar,
  HiArrowRight,
  HiUser,
  HiStar,
  HiAcademicCap
} from 'react-icons/hi';
import Link from 'next/link';
/* eslint-disable */

// ✅ Brand Colors
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

// ✅ KPI Card Component
const KPICard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  change, 
  changeType,
  size = 'md'
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
}) => {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const iconSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${sizeClasses[size]} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-xs sm:text-sm">{title}</p>
          <h3 className="font-bold text-xl sm:text-2xl mt-1">{value}</h3>
          {change && (
            <p className={`text-xs sm:text-sm mt-1 ${
              changeType === 'positive' ? 'text-green-600' : 
              changeType === 'negative' ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className={`${color} rounded-lg p-2 text-white`}>
          <Icon className={iconSizeClasses[size]} />
        </div>
      </div>
    </div>
  );
};

// ✅ Progress Bar Component
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

// ✅ Course Card Component - INSTRUCTOR HIDDEN
const CourseCard = ({ 
  id,
  title,
  category,
  progress,
  duration,
  image,
  compact = false
}: {
  id: string;
  title: string;
  category: string;
  progress: number;
  duration: string;
  image?: string;
  compact?: boolean;
}) => {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow ${compact ? 'p-3 sm:p-4' : 'p-4 sm:p-6'}`}>
      {image && !compact && (
        <div className="h-32 sm:h-40 overflow-hidden mb-3 sm:mb-4 rounded-lg">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div>
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <span 
            className="text-xs font-semibold px-2 py-1 rounded"
            style={{ 
              backgroundColor: `${BRAND_COLORS.teal}20`,
              color: BRAND_COLORS.teal
            }}
          >
            {category}
          </span>
          <span className="text-xs font-medium text-gray-500">
            {progress}%
          </span>
        </div>
        
        <h3 className={`font-bold text-gray-900 mb-2 ${compact ? 'text-sm' : 'text-base sm:text-lg'}`}>
          {title}
        </h3>
        
        <div className="flex items-center text-xs text-gray-500 mb-2 sm:mb-3">
          <HiClock className="w-3 h-3 mr-1 flex-shrink-0" />
          <span className="truncate">{duration}</span>
        </div>
        
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium" style={{ color: BRAND_COLORS.deepRed }}>
              {progress}%
            </span>
          </div>
          <ProgressBar progress={progress} size="sm" animate={true} />
        </div>
        
        <Link
          href={`/lms/Student_Portal/my-courses/${id}`}
          className={`w-full flex items-center justify-center gap-2 font-medium rounded-lg transition-colors ${
            compact ? 'py-1.5 sm:py-2 text-xs' : 'py-2 sm:py-2.5 text-sm'
          }`}
          style={{ 
            backgroundColor: BRAND_COLORS.deepRed,
            color: BRAND_COLORS.white 
          }}
        >
          <span>{compact ? 'View' : 'Continue Learning'}</span>
          <HiArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalStudyHours: 0,
    pendingAssignments: 0,
    upcomingQuizzes: 0,
    assignmentsSubmitted: 0,
    quizzesAttempted: 0,
    averageScore: 0
  });

  // ========== 🔥 REAL INSTRUCTOR LOGIC (KEPT INTERNALLY, NOT DISPLAYED) ==========
  const findRealInstructorByCourseTitle = (courseTitle: string) => {
    try {
      if (!courseTitle) return null;
      const allInstructors = JSON.parse(localStorage.getItem('lms_instructors') || '[]');
      const realInstructors = allInstructors.filter((inst: any) => 
        !inst.id?.includes('demo') && 
        !inst.name?.includes('Demo') &&
        !inst.name?.includes('demo') &&
        inst.name !== 'Instructor' &&
        inst.name !== 'Not Assigned'
      );
      const instructor = realInstructors.find((inst: any) => {
        const instCourseTitle = inst.assignedCourse?.title?.toLowerCase().trim();
        const searchTitle = courseTitle?.toLowerCase().trim();
        return instCourseTitle === searchTitle;
      });
      return instructor || null;
    } catch (error) {
      console.error('Error finding instructor:', error);
      return null;
    }
  };

  // ========== 🔥 Load student courses (instructor data used internally only) ==========
  const loadStudentCourses = (studentData: any) => {
    try {
      console.log('🔍 Dashboard: Loading REAL courses for student:', studentData.email);
      console.log('⚠️ Student courseId "' + studentData.courseId + '" IGNORED! Using title match only.');

      const industrialCourses = JSON.parse(localStorage.getItem('industrial_training_courses') || '[]');
      const lmsCourses = JSON.parse(localStorage.getItem('lms_courses') || '[]');
      const allCourses = [...industrialCourses, ...lmsCourses];
      
      let enrolledCourses = [];

      // Check existing stored courses
      const existingCoursesStr = localStorage.getItem('studentCourses');
      if (existingCoursesStr) {
        const existingCourses = JSON.parse(existingCoursesStr);
        const hasRealInstructor = existingCourses.some((c: any) => 
          !c.instructorName?.includes('Demo') && 
          !c.instructorName?.includes('demo') &&
          !c.instructorId?.includes('demo') &&
          c.instructorName !== 'Not Assigned' &&
          c.instructorName !== 'Instructor' &&
          c.instructorId !== ''
        );
        if (hasRealInstructor) {
          console.log('✅ Dashboard: Using existing REAL instructor data from localStorage');
          setCourses(existingCourses);
          loadAssignmentsAndQuizzes(existingCourses, studentData);
          calculateStats(existingCourses);
          return;
        }
      }

      // Fresh load
      const studentCourseTitle = studentData.course;
      const courseInfo = allCourses.find((c: any) => 
        c.title?.toLowerCase().trim() === studentCourseTitle?.toLowerCase().trim()
      );

      if (courseInfo) {
        const instructor = findRealInstructorByCourseTitle(courseInfo.title);
        enrolledCourses.push({
          id: courseInfo.id,
          title: courseInfo.title,
          category: courseInfo.category || 'Training',
          duration: courseInfo.duration || 'N/A',
          instructorId: instructor?.id || '',
          instructorName: instructor?.name || 'Not Assigned', // kept for internal use
          progress: 0,
          status: 'not_started',
          enrolledDate: studentData.registrationDate || new Date().toISOString(),
          studyHours: 0,
          price: courseInfo.price,
          image: courseInfo.image,
          rating: courseInfo.rating
        });
      }

      // Courses from credentials
      const studentCredentials = JSON.parse(localStorage.getItem('studentCredentials') || '[]');
      const credentialCourses = studentCredentials
        .filter((cred: any) => 
          cred.studentEmail?.toLowerCase() === studentData.email?.toLowerCase() || 
          cred.username?.toLowerCase() === studentData.username?.toLowerCase()
        )
        .map((cred: any) => {
          const courseInfo = allCourses.find((c: any) => 
            c.title?.toLowerCase().trim() === cred.course?.toLowerCase().trim()
          );
          if (courseInfo) {
            const instructor = findRealInstructorByCourseTitle(courseInfo.title);
            return {
              id: courseInfo.id,
              title: courseInfo.title,
              category: courseInfo.category || 'Training',
              duration: courseInfo.duration || 'N/A',
              instructorId: instructor?.id || '',
              instructorName: instructor?.name || 'Not Assigned',
              progress: 0,
              status: 'not_started',
              enrolledDate: cred.sentDate || new Date().toISOString(),
              studyHours: 0,
              price: courseInfo.price,
              image: courseInfo.image,
              rating: courseInfo.rating
            };
          }
          return null;
        })
        .filter(Boolean);

      enrolledCourses = [...enrolledCourses, ...credentialCourses];

      // Remove duplicates
      const courseMap = new Map();
      enrolledCourses.forEach(course => {
        const existing = courseMap.get(course.id);
        if (!existing) {
          courseMap.set(course.id, course);
        } else {
          if (existing.instructorName.includes('Demo') || existing.instructorName === 'Not Assigned') {
            if (!course.instructorName.includes('Demo') && course.instructorName !== 'Not Assigned') {
              courseMap.set(course.id, course);
            }
          }
        }
      });
      
      const uniqueCourses = Array.from(courseMap.values());
      console.log('🎯 Dashboard: Final enrolled courses:', uniqueCourses.map(c => c.title));
      setCourses(uniqueCourses);
      localStorage.setItem('studentCourses', JSON.stringify(uniqueCourses));
      loadAssignmentsAndQuizzes(uniqueCourses, studentData);
      calculateStats(uniqueCourses);

    } catch (error) {
      console.error('Error loading student courses:', error);
    }
  };

  // ✅ Load assignments and quizzes
  const loadAssignmentsAndQuizzes = (studentCourses: any[], studentData: any) => {
    try {
      const studentEmail = studentData.email;
      if (!studentEmail) return;

      const allAssignments = JSON.parse(localStorage.getItem('instructor_assignments') || '[]');
      const allQuizzes = JSON.parse(localStorage.getItem('instructor_quizzes') || '[]');
      const allInstructors = JSON.parse(localStorage.getItem('lms_instructors') || '[]');
      
      const studentAssignments: any[] = [];
      const studentQuizzes: any[] = [];

      studentCourses.forEach(course => {
        const courseAssignments = allAssignments
          .filter((assignment: any) => {
            const matchesExactId = assignment.courseId === course.id;
            const matchesCourseTitle = assignment.courseTitle?.toLowerCase() === course.title?.toLowerCase();
            return (matchesExactId || matchesCourseTitle) && assignment.status === 'published';
          })
          .map((assignment: any) => {
            const assignmentInstructor = allInstructors.find((inst: any) => 
              inst.id === assignment.instructorId
            );
            return {
              ...assignment,
              courseTitle: course.title,
              instructorName: assignmentInstructor?.name || assignment.instructorName || '',
              studentStatus: 'not_started',
              studentScore: null
            };
          });

        const courseQuizzes = allQuizzes
          .filter((quiz: any) => {
            const matchesExactId = quiz.courseId === course.id;
            const matchesCourseTitle = quiz.courseTitle?.toLowerCase() === course.title?.toLowerCase();
            return (matchesExactId || matchesCourseTitle) && quiz.status === 'published';
          })
          .map((quiz: any) => {
            const quizInstructor = allInstructors.find((inst: any) => 
              inst.id === quiz.instructorId
            );
            return {
              ...quiz,
              courseTitle: course.title,
              instructorName: quizInstructor?.name || quiz.instructorName || '',
              studentStatus: 'not_attempted',
              studentScore: null
            };
          });

        studentAssignments.push(...courseAssignments);
        studentQuizzes.push(...courseQuizzes);
      });

      const pendingAssignments = studentAssignments.filter(a => a.studentStatus === 'not_started').length;
      const upcomingQuizzes = studentQuizzes.filter(q => q.studentStatus === 'not_attempted').length;

      setAssignments(studentAssignments);
      setQuizzes(studentQuizzes);
      
      setStats(prev => ({
        ...prev,
        pendingAssignments,
        upcomingQuizzes,
        assignmentsSubmitted: studentAssignments.filter(a => a.studentStatus === 'submitted' || a.studentStatus === 'graded').length,
        quizzesAttempted: studentQuizzes.filter(q => q.studentStatus === 'completed').length
      }));

    } catch (error) {
      console.error('Error loading assignments and quizzes:', error);
    }
  };

  // ✅ Calculate stats (no instructor display)
  const calculateStats = (courseList: any[]) => {
    const totalCourses = courseList.length;
    const completedCourses = courseList.filter((c: any) => c.status === 'completed').length;
    const inProgressCourses = courseList.filter((c: any) => c.status === 'in_progress').length;
    const totalStudyHours = courseList.reduce((sum: number, c: any) => sum + (c.studyHours || 0), 0);

    setStats(prev => ({
      ...prev,
      totalCourses,
      completedCourses,
      inProgressCourses,
      totalStudyHours
    }));
  };

  useEffect(() => {
    const loadDashboardData = () => {
      try {
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
          const userData = JSON.parse(currentUserStr);
          setUser(userData);
          loadStudentCourses(userData);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getLastAccessedCourse = () => {
    return courses
      .filter(course => course.status !== 'completed')
      .sort((a, b) => b.progress - a.progress)[0];
  };

  const getOverallProgress = () => {
    if (courses.length === 0) return 0;
    const totalProgress = courses.reduce((sum, course) => sum + (course.progress || 0), 0);
    return Math.round(totalProgress / courses.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div 
            className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
            style={{ borderColor: BRAND_COLORS.deepRed }}
          ></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const lastAccessedCourse = getLastAccessedCourse();
  const overallProgress = getOverallProgress();
  const upcomingAssignmentsCount = assignments.filter(a => a.studentStatus === 'not_started').length;
  const upcomingQuizzesCount = quizzes.filter(q => q.studentStatus === 'not_attempted').length;

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      {/* Welcome Section - Mobile Optimized */}
      <div 
        className="rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white"
        style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.darkNavy} 0%, ${BRAND_COLORS.darkRoyalBlue} 100%)` }}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">
              Welcome back, {user?.fullName?.split(' ')[0] || 'Student'}!
            </h1>
            <p className="text-xs sm:text-sm opacity-90">
              {courses.length > 0 
                ? `${courses.length} enrolled course${courses.length > 1 ? 's' : ''}` 
                : 'No courses enrolled yet'}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs opacity-90">Learner ID</p>
            <p className="text-sm sm:text-base font-bold">{user?.learnerId || ''}</p>
            <p className="text-xs opacity-75 mt-0.5 sm:mt-1">
              {user?.registrationDate ? `Joined ${new Date(user.registrationDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards - Mobile Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KPICard
          title="Courses"
          value={stats.totalCourses}
          icon={HiBookOpen}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          size="sm"
        />
        <KPICard
          title="Assignments"
          value={stats.pendingAssignments}
          icon={HiDocumentText}
          color="bg-gradient-to-r from-red-500 to-red-600"
          change={upcomingAssignmentsCount > 0 ? `${upcomingAssignmentsCount} due` : 'All done'}
          changeType={upcomingAssignmentsCount > 0 ? 'negative' : 'positive'}
          size="sm"
        />
        <KPICard
          title="Quizzes"
          value={stats.upcomingQuizzes}
          icon={HiChartBar}
          color="bg-gradient-to-r from-yellow-500 to-yellow-600"
          change={upcomingQuizzesCount > 0 ? `${upcomingQuizzesCount} ready` : 'None'}
          changeType={upcomingQuizzesCount > 0 ? 'negative' : 'positive'}
          size="sm"
        />
        <KPICard
          title="Progress"
          value={`${overallProgress}%`}
          icon={HiCheckCircle}
          color="bg-gradient-to-r from-green-500 to-green-600"
          size="sm"
        />
      </div>

      {/* Quick Access & Courses - Instructor completely hidden */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Quick Access - No instructor, no "My Courses" link */}
        <div className="lg:col-span-1">
          <div className="bg-transparent">
            <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 px-1" style={{ color: BRAND_COLORS.darkNavy }}>
              Quick Access
            </h2>
            <div className="space-y-1">
              {lastAccessedCourse ? (
                <Link
                  href={`/lms/Student_Portal/Materials`}
                  className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg hover:bg-gray-50 transition-colors active:bg-gray-100"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">Materials</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{lastAccessedCourse.title}</p>
                    {/* 🔥 INSTRUCTOR LINE COMPLETELY REMOVED */}
                  </div>
                  <HiArrowRight className="w-4 h-4 flex-shrink-0 ml-2" style={{ color: BRAND_COLORS.deepRed }} />
                </Link>
              ) : (
                <div className="px-3 sm:px-4 py-2.5 sm:py-3">
                  <p className="text-xs text-gray-500">No active courses</p>
                </div>
              )}

              {stats.pendingAssignments > 0 && (
                <Link
                  href="/lms/Student_Portal/assignments"
                  className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg hover:bg-gray-50 transition-colors active:bg-gray-100"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">Assignments</p>
                    <p className="text-xs text-gray-500 mt-0.5">{stats.pendingAssignments} pending</p>
                  </div>
                  <HiArrowRight className="w-4 h-4 flex-shrink-0 ml-2" style={{ color: BRAND_COLORS.teal }} />
                </Link>
              )}

              {stats.upcomingQuizzes > 0 && (
                <Link
                  href="/lms/Student_Portal/quizzes"
                  className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg hover:bg-gray-50 transition-colors active:bg-gray-100"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">Quizzes</p>
                    <p className="text-xs text-gray-500 mt-0.5">{stats.upcomingQuizzes} ready</p>
                  </div>
                  <HiArrowRight className="w-4 h-4 flex-shrink-0 ml-2" style={{ color: '#8B5CF6' }} />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Courses List - Instructor hidden in CourseCard */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                My Courses ({courses.length})
              </h2>
              <div className="text-left sm:text-right">
                <p className="text-xs text-gray-600">Overall Progress</p>
                <span className="text-xl sm:text-2xl font-bold" style={{ color: BRAND_COLORS.deepRed }}>
                  {overallProgress}%
                </span>
              </div>
            </div>
            
            <div className="mb-6 sm:mb-8">
              <ProgressBar progress={overallProgress} size="lg" animate={true} />
            </div>

            {courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {courses.slice(0, 4).map(course => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    category={course.category}
                    progress={course.progress || 0}
                    duration={course.duration}
                    image={course.image}
                    compact={true}
                    // 🔥 instructorName prop removed from CourseCard
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <HiBookOpen className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4" style={{ color: BRAND_COLORS.softGrey }} />
                <h3 className="text-base sm:text-lg font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
                  No courses enrolled
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                  You haven't enrolled in any courses yet.
                </p>
                <Link
                  href="/courses"
                  className="inline-flex px-5 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition-colors"
                  style={{ 
                    backgroundColor: BRAND_COLORS.deepRed,
                    color: BRAND_COLORS.white 
                  }}
                >
                  Browse Courses
                </Link>
              </div>
            )}
            
            {/* 🔥 "View all courses" link completely removed */}
          </div>
        </div>
      </div>

      {/* Stats Summary - Mobile Optimized */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
          Learning Stats
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center p-3 sm:p-4 rounded-lg" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
            <p className="text-xs text-gray-600">Study Hours</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
              {stats.totalStudyHours}
            </p>
          </div>
          <div className="text-center p-3 sm:p-4 rounded-lg" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
            <p className="text-xs text-gray-600">Completed</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
              {stats.completedCourses}
            </p>
          </div>
          <div className="text-center p-3 sm:p-4 rounded-lg" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
            <p className="text-xs text-gray-600">In Progress</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
              {stats.inProgressCourses}
            </p>
          </div>
          <div className="text-center p-3 sm:p-4 rounded-lg" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
            <p className="text-xs text-gray-600">Submitted</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
              {stats.assignmentsSubmitted}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}