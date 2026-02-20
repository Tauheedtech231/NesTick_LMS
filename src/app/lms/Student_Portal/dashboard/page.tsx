// app/dashboard/page.tsx (FIXED - 3 cards per row)
'use client';

import { useState, useEffect } from 'react';
import { 
  HiBookOpen, 
  HiCheckCircle, 
  HiClock, 
  HiArrowRight,
  HiClipboardCheck,
  HiDocumentText,
  HiStar,
  HiLightningBolt,
  HiPlay,
  HiTrendingUp,
  HiAcademicCap
} from 'react-icons/hi';
import Link from 'next/link';
/* eslint-disable */

// Brand Colors
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

// KPI Card Component – Fixed size for 3 per row
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

// Progress Bar Component (animated)
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

// Single Course Row Component (responsive)
const CourseRow = ({ course }: { course: any }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <HiAcademicCap className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap" style={{
              backgroundColor: `${BRAND_COLORS.teal}15`,
              color: BRAND_COLORS.teal
            }}>
              {course.category}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">{course.title}</h3>
          <p className="text-xs text-gray-500 mt-1">{course.duration}</p>
        </div>

        <div className="flex flex-col sm:items-end gap-2 flex-shrink-0">
          <span className="text-sm font-bold px-3 py-1 rounded-full self-start sm:self-auto whitespace-nowrap" style={{
            backgroundColor: course.progress === 100 ? '#D1FAE5' : '#FEF3C7',
            color: course.progress === 100 ? '#059669' : '#92400E'
          }}>
            {course.progress}% Complete
          </span>
          <Link
            href={`/lms/Student_Portal/my-courses/${course.id}`}
            className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            style={{
              backgroundColor: BRAND_COLORS.deepRed,
              color: '#FFFFFF'
            }}
          >
            {course.progress === 100 ? 'Review' : 'Continue'}
            <HiArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Progress bar and stats */}
      <div className="mt-3">
        <ProgressBar progress={course.progress} size="md" animate />
        <div className="flex flex-wrap justify-between text-xs text-gray-500 mt-2 gap-2">
          <span>{course.completedSlides || 0}/{course.totalSlides || 0} lessons</span>
          <span>{course.studyHours || 0} study hours</span>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastAccessedCourse, setLastAccessedCourse] = useState<any>(null);
  const [stats, setStats] = useState({
    totalCourses: 0,
    coursesCompleted: 0,
    coursesInProgress: 0,
    totalStudyHours: 0,
    totalQuizzes: 0,
    quizzesAttempted: 0,
    quizzesPassed: 0,
    averageQuizScore: 0,
    assignmentsCompleted: 0,
    totalAssignments: 0
  });

  // Function to calculate real progress from completed slides
  const calculateRealProgress = (courseId: string, studentId: string) => {
    try {
      const completedSlidesKey = `completedSlides_${studentId}_${courseId}`;
      const completedSlidesStr = localStorage.getItem(completedSlidesKey);
      const completedSlides = completedSlidesStr ? JSON.parse(completedSlidesStr) : [];
      
      const allSlides = JSON.parse(localStorage.getItem('slides') || '[]');
      const courseSlides = allSlides.filter((s: any) => s.courseId === courseId);
      const totalSlides = courseSlides.length;
      
      const progress = totalSlides > 0 
        ? Math.round((completedSlides.length / totalSlides) * 100) 
        : 0;
      
      return {
        progress,
        completedSlides: completedSlides.length,
        totalSlides
      };
    } catch (error) {
      console.error('Error calculating progress:', error);
      return { progress: 0, completedSlides: 0, totalSlides: 0 };
    }
  };

  // Function to load real quiz attempts
  const loadQuizAttempts = (studentId: string, courseIds: string[]) => {
    try {
      const attemptsKey = `quizAttempts_${studentId}`;
      const savedAttempts = localStorage.getItem(attemptsKey);
      if (!savedAttempts) return { totalQuizzes: 0, attemptedQuizzes: 0, passedQuizzes: 0, averageScore: 0 };
      
      const attempts = JSON.parse(savedAttempts);
      const courseAttempts = Object.values(attempts).filter((attempt: any) => 
        courseIds.includes(attempt.courseId)
      );
      
      const totalQuizzes = courseAttempts.length;
      const passedQuizzes = courseAttempts.filter((a: any) => a.passed).length;
      const averageScore = totalQuizzes > 0 
        ? Math.round(courseAttempts.reduce((sum: number, a: any) => sum + a.score, 0) / totalQuizzes) 
        : 0;
      
      return {
        totalQuizzes,
        attemptedQuizzes: totalQuizzes,
        passedQuizzes,
        averageScore
      };
    } catch (error) {
      console.error('Error loading quiz attempts:', error);
      return { totalQuizzes: 0, attemptedQuizzes: 0, passedQuizzes: 0, averageScore: 0 };
    }
  };

  // Function to load assignments data
  const loadAssignmentsData = (studentId: string, courseIds: string[]) => {
    try {
      const submissionsStr = localStorage.getItem('assignmentSubmissions');
      if (!submissionsStr) return { totalAssignments: 0, completedAssignments: 0 };
      
      const submissions = JSON.parse(submissionsStr);
      
      // Filter submissions for this student
      const studentSubmissions = submissions.filter((sub: any) => 
        sub.studentId === studentId || sub.studentEmail === user?.email
      );
      
      // Get all assignments for enrolled courses
      const allAssignments = JSON.parse(localStorage.getItem('assignments') || '[]');
      const courseAssignments = allAssignments.filter((a: any) => courseIds.includes(a.courseId));
      
      const completedCount = courseAssignments.filter((a: any) => 
        studentSubmissions.some((sub: any) => sub.assignmentId === a.id)
      ).length;
      
      return {
        totalAssignments: courseAssignments.length,
        completedAssignments: completedCount
      };
    } catch (error) {
      console.error('Error loading assignments:', error);
      return { totalAssignments: 0, completedAssignments: 0 };
    }
  };

  // Find student enrollments
  const findStudentEnrollments = (studentData: any) => {
    try {
      const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
      
      const studentEnrollments = enrollments.filter((e: any) => {
        if (e.studentEmail && studentData.email && 
            e.studentEmail.toLowerCase() === studentData.email.toLowerCase()) {
          return true;
        }
        if (e.studentId && studentData.id && e.studentId === studentData.id) {
          return true;
        }
        if (e.studentId && studentData.userId && e.studentId === studentData.userId) {
          return true;
        }
        if (e.studentName && studentData.fullName && 
            e.studentName.toLowerCase().includes(studentData.fullName.toLowerCase())) {
          return true;
        }
        return false;
      });
      
      return studentEnrollments;
    } catch (error) {
      console.error('Error finding enrollments:', error);
      return [];
    }
  };

  // Load all available courses
  const loadAllCourses = () => {
    try {
      const hardcodedCourses = [
        {
          id: 'pipe-fitter',
          title: 'Pipe Fitter',
          category: 'Technical Training',
          description: 'Master industrial pipe fitting techniques',
          duration: '8 Weeks',
          image: "https://images.pexels.com/photos/6124242/pexels-photo-6124242.jpeg",
        },
        {
          id: 'safety-inspector',
          title: 'Safety Inspector',
          category: 'Safety Training',
          description: 'Professional safety inspection training',
          duration: '6 Weeks',
          image: "https://images.pexels.com/photos/34082713/pexels-photo-34082713.jpeg",
        },
        {
          id: 'welding',
          title: 'Professional Welding',
          category: 'Technical Training',
          description: 'Comprehensive welding training',
          duration: '10 Weeks',
          image: "https://images.pexels.com/photos/7650512/pexels-photo-7650512.jpeg",
        }
      ];
      
      const localStorageCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      const allCourses = [...hardcodedCourses, ...localStorageCourses];
      
      const uniqueCourses = allCourses.filter((course, index, self) => 
        index === self.findIndex((c) => c.id === course.id)
      );
      
      return uniqueCourses;
    } catch (error) {
      console.error('Error loading courses:', error);
      return [];
    }
  };

  // Main function to load student's enrolled courses
  const loadStudentCourses = (studentData: any) => {
    try {
      console.log('Loading student courses for:', studentData);
      
      const studentEnrollments = findStudentEnrollments(studentData);
      const allCourses = loadAllCourses();
      let enrolledCourseIds = studentEnrollments.map((e: any) => e.courseId);
      
      // Also check studentCourses backup
      try {
        const studentCoursesStr = localStorage.getItem('studentCourses');
        if (studentCoursesStr) {
          const studentCourses = JSON.parse(studentCoursesStr);
          studentCourses.forEach((sc: any) => {
            if (!enrolledCourseIds.includes(sc.id)) {
              enrolledCourseIds.push(sc.id);
            }
          });
        }
      } catch (error) {
        console.error('Error reading studentCourses:', error);
      }
      
      // If no enrollments, create demo enrollments for testing (only for student@gmail.com)
      if (enrolledCourseIds.length === 0 && studentData && studentData.email === 'student@gmail.com') {
        console.log('No enrollments found, creating demo enrollments for demo user');
        const demoEnrollments = [
          {
            id: `enroll_demo_1_${studentData.id}`,
            courseId: 'pipe-fitter',
            courseTitle: 'Pipe Fitter',
            studentId: studentData.id,
            studentName: studentData.fullName || studentData.name,
            studentEmail: studentData.email,
            studentPhone: studentData.phone || '',
            enrollmentDate: new Date().toISOString().split('T')[0],
            status: 'active'
          },
          {
            id: `enroll_demo_2_${studentData.id}`,
            courseId: 'safety-inspector',
            courseTitle: 'Safety Inspector',
            studentId: studentData.id,
            studentName: studentData.fullName || studentData.name,
            studentEmail: studentData.email,
            studentPhone: studentData.phone || '',
            enrollmentDate: new Date().toISOString().split('T')[0],
            status: 'active'
          },
          {
            id: `enroll_demo_3_${studentData.id}`,
            courseId: 'welding',
            courseTitle: 'Professional Welding',
            studentId: studentData.id,
            studentName: studentData.fullName || studentData.name,
            studentEmail: studentData.email,
            studentPhone: studentData.phone || '',
            enrollmentDate: new Date().toISOString().split('T')[0],
            status: 'active'
          }
        ];
        
        const existingEnrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
        const updatedEnrollments = [...existingEnrollments, ...demoEnrollments];
        localStorage.setItem('enrollments', JSON.stringify(updatedEnrollments));
        
        enrolledCourseIds = ['pipe-fitter', 'safety-inspector', 'welding'];
        studentEnrollments.push(...demoEnrollments);
      }
      
      // Build enrolled courses with REAL progress
      const enrolledCourses = enrolledCourseIds
        .map((courseId: string) => {
          const course = allCourses.find((c: any) => c.id === courseId);
          if (!course) return null;
          
          const enrollment = studentEnrollments.find((e: any) => e.courseId === courseId);
          const { progress, completedSlides, totalSlides } = calculateRealProgress(courseId, studentData.id);
          
          const hoursKey = `studyHours_${studentData.id}_${courseId}`;
          const savedHours = localStorage.getItem(hoursKey);
          const studyHours = savedHours ? parseInt(savedHours) : 0;
          
          return {
            id: course.id,
            title: course.title,
            description: course.description || course.title,
            category: course.category || 'General',
            duration: course.duration || 'Self-paced',
            image: course.courseImage || course.image,
            progress: progress,
            studyHours: studyHours,
            totalSlides: totalSlides,
            completedSlides: completedSlides,
            status: progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started',
            enrolledDate: enrollment?.enrollmentDate || new Date().toISOString()
          };
        })
        .filter(Boolean);
      
      console.log('Final enrolled courses:', enrolledCourses);
      setCourses(enrolledCourses);
      
      // Load quiz attempts for stats
      const { totalQuizzes, attemptedQuizzes, passedQuizzes, averageScore } = 
        loadQuizAttempts(studentData.id, enrolledCourseIds);
      
      // Load assignments for stats
      const { totalAssignments, completedAssignments } = loadAssignmentsData(studentData.id, enrolledCourseIds);
      
      const coursesCompleted = enrolledCourses.filter((c: any) => c.progress === 100).length;
      const coursesInProgress = enrolledCourses.filter((c: any) => c.progress > 0 && c.progress < 100).length;
      
      // Set last accessed course
      const inProgressCourses = enrolledCourses.filter((c: any) => c.progress > 0 && c.progress < 100);
      if (inProgressCourses.length > 0) {
        setLastAccessedCourse(inProgressCourses[0]);
      } else if (enrolledCourses.length > 0) {
        setLastAccessedCourse(enrolledCourses[0]);
      }
      
      setStats({
        totalCourses: enrolledCourses.length,
        coursesCompleted,
        coursesInProgress,
        totalStudyHours: enrolledCourses.reduce((sum: number, c: any) => sum + (c.studyHours || 0), 0),
        totalQuizzes,
        quizzesAttempted: attemptedQuizzes,
        quizzesPassed: passedQuizzes,
        averageQuizScore: averageScore,
        totalAssignments,
        assignmentsCompleted: completedAssignments
      });
      
      localStorage.setItem('studentCourses', JSON.stringify(enrolledCourses));
      
    } catch (error) {
      console.error('Error in loadStudentCourses:', error);
    }
  };

  // Load all dashboard data
  const loadDashboardData = () => {
    try {
      const currentUserStr = localStorage.getItem('currentUser');
      if (currentUserStr) {
        const userData = JSON.parse(currentUserStr);
        setUser(userData);
        loadStudentCourses(userData);
      } else {
        console.log('No current user found in localStorage');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'enrollments' || 
          e.key?.startsWith('completedSlides_') || 
          e.key?.startsWith('quizAttempts_') ||
          e.key === 'studentCourses' ||
          e.key === 'courses') {
        loadDashboardData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('courseProgressUpdated', loadDashboardData);
    window.addEventListener('quizAttempted', loadDashboardData);
    window.addEventListener('enrollmentUpdated', loadDashboardData);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('courseProgressUpdated', loadDashboardData);
      window.removeEventListener('quizAttempted', loadDashboardData);
      window.removeEventListener('enrollmentUpdated', loadDashboardData);
    };
  }, []);

  const getOverallProgress = () => {
    if (courses.length === 0) return 0;
    
    let totalCompletedSlides = 0;
    let totalSlides = 0;
    
    courses.forEach(course => {
      totalCompletedSlides += course.completedSlides || 0;
      totalSlides += course.totalSlides || 0;
    });
    
    if (totalSlides === 0) return 0;
    
    return Math.round((totalCompletedSlides / totalSlides) * 100);
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

  const overallProgress = getOverallProgress();

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6 bg-gray-50 min-h-screen">
      {/* Welcome Section - Compact */}
      <div 
        className="rounded-xl p-4 sm:p-5 md:p-6 text-white shadow-lg"
        style={{ background: `linear-gradient(145deg, ${BRAND_COLORS.darkNavy} 0%, ${BRAND_COLORS.darkRoyalBlue} 100%)` }}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3">
          <div>
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-0.5">
              Welcome back, {user?.fullName?.split(' ')[0] || user?.name?.split(' ')[0] || 'Student'}!
            </h1>
            <p className="text-xs sm:text-sm opacity-90">
              {courses.length > 0 
                ? `${courses.length} enrolled course${courses.length > 1 ? 's' : ''}` 
                : 'No courses enrolled yet'}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs opacity-90">Learner ID</p>
            <p className="text-xs sm:text-sm font-bold">{user?.learnerId || user?.id || ''}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards - 3 per row on all screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <KPICard
          title="Completed"
          value={stats.coursesCompleted}
          icon={HiCheckCircle}
          color="bg-gradient-to-r from-green-500 to-green-600"
        />
        <KPICard
          title="In Progress"
          value={stats.coursesInProgress}
          icon={HiLightningBolt}
          color="bg-gradient-to-r from-orange-500 to-orange-600"
        />
        <KPICard
          title="Study Hours"
          value={stats.totalStudyHours}
          icon={HiClock}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <KPICard
          title="Assignments"
          value={`${stats.assignmentsCompleted}/${stats.totalAssignments}`}
          icon={HiDocumentText}
          color="bg-gradient-to-r from-indigo-500 to-indigo-600"
        />
        <KPICard
          title="Quizzes Passed"
          value={stats.quizzesPassed}
          icon={HiClipboardCheck}
          color="bg-gradient-to-r from-yellow-500 to-yellow-600"
        />
        <KPICard
          title="Progress"
          value={`${overallProgress}%`}
          icon={HiTrendingUp}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
        />
      </div>

      {/* Quiz Stats Row - Compact */}
      {stats.totalQuizzes > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
          <h2 className="text-base sm:text-lg font-bold mb-3" style={{ color: BRAND_COLORS.darkNavy }}>
            Quiz Performance
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="text-center p-2 sm:p-3 rounded-lg" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
              <p className="text-xs text-gray-600">Attempted</p>
              <p className="text-sm sm:text-base font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
                {stats.quizzesAttempted}/{stats.totalQuizzes}
              </p>
            </div>
            <div className="text-center p-2 sm:p-3 rounded-lg" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
              <p className="text-xs text-gray-600">Passed</p>
              <p className="text-sm sm:text-base font-bold mt-1 text-green-600">
                {stats.quizzesPassed}
              </p>
            </div>
            <div className="text-center p-2 sm:p-3 rounded-lg" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
              <p className="text-xs text-gray-600">Avg Score</p>
              <p className="text-sm sm:text-base font-bold mt-1" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                {stats.averageQuizScore}%
              </p>
            </div>
          </div>
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
                {stats.totalCourses} {stats.totalCourses === 1 ? 'Course' : 'Courses'}
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
                <HiStar className="w-3 h-3" style={{ color: '#FCD34D' }} />
                <p className="text-xs font-medium text-gray-600 truncate">CERTIFICATES</p>
              </div>
              <p className="text-xs font-medium text-gray-900 truncate">
                {stats.coursesCompleted} Earned
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
              My Courses ({courses.length})
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {stats.coursesCompleted} completed • {stats.coursesInProgress} in progress
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
        <div className="mb-4">
          <ProgressBar progress={overallProgress} size="md" animate />
        </div>

        {courses.length > 0 ? (
          <div className="space-y-3">
            {courses.map(course => (
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