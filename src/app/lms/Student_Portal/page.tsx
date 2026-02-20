// app/dashboard/page.tsx (updated version)
'use client';

import { useState, useEffect } from 'react';
import { 
  HiBookOpen, 
  HiCheckCircle, 
  HiClock, 
  HiArrowRight,
  HiUser,
  HiClipboardCheck
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

// KPI Card Component (same as before)
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

// Course Card Component
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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudyHours: 0,
    totalQuizzes: 0,
    quizzesAttempted: 0,
    quizzesPassed: 0,
    averageQuizScore: 0
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

  // FIXED: Better function to find student enrollments
  const findStudentEnrollments = (studentData: any) => {
    try {
      const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
      
      // Log all enrollments for debugging
      console.log('All enrollments:', enrollments);
      console.log('Current student data:', studentData);
      
      // Try multiple matching strategies
      const studentEnrollments = enrollments.filter((e: any) => {
        // Strategy 1: Match by email (case insensitive)
        if (e.studentEmail && studentData.email && 
            e.studentEmail.toLowerCase() === studentData.email.toLowerCase()) {
          return true;
        }
        
        // Strategy 2: Match by studentId
        if (e.studentId && studentData.id && e.studentId === studentData.id) {
          return true;
        }
        
        // Strategy 3: Match by userId/learnerId
        if (e.studentId && studentData.userId && e.studentId === studentData.userId) {
          return true;
        }
        
        // Strategy 4: Match by name (partial, case insensitive)
        if (e.studentName && studentData.fullName && 
            e.studentName.toLowerCase().includes(studentData.fullName.toLowerCase())) {
          return true;
        }
        
        return false;
      });
      
      console.log('Found student enrollments:', studentEnrollments);
      return studentEnrollments;
      
    } catch (error) {
      console.error('Error finding enrollments:', error);
      return [];
    }
  };

  // FIXED: Better function to load all available courses
  const loadAllCourses = () => {
    try {
      // Get hardcoded courses from instructor file structure
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
      
      // Get courses from localStorage
      const localStorageCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      
      // Combine all courses
      const allCourses = [...hardcodedCourses, ...localStorageCourses];
      
      // Remove duplicates by id
      const uniqueCourses = allCourses.filter((course, index, self) => 
        index === self.findIndex((c) => c.id === course.id)
      );
      
      console.log('All available courses:', uniqueCourses);
      return uniqueCourses;
      
    } catch (error) {
      console.error('Error loading courses:', error);
      return [];
    }
  };

  // FIXED: Main function to load student's enrolled courses
  const loadStudentCourses = (studentData: any) => {
    try {
      console.log('Loading student courses for:', studentData);
      
      // Step 1: Find enrollments for this student
      const studentEnrollments = findStudentEnrollments(studentData);
      
      // Step 2: Get all available courses
      const allCourses = loadAllCourses();
      
      // Step 3: Get course IDs from enrollments
      let enrolledCourseIds = studentEnrollments.map((e: any) => e.courseId);
      
      // Step 4: Also check studentCourses backup
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
      
      console.log('Enrolled course IDs:', enrolledCourseIds);
      
      // If no enrollments found, try to create demo enrollments for testing
      if (enrolledCourseIds.length === 0 && studentData) {
        console.log('No enrollments found, creating demo enrollments for testing');
        // Create demo enrollments for hardcoded courses
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
          }
        ];
        
        // Save demo enrollments to localStorage
        const existingEnrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
        const updatedEnrollments = [...existingEnrollments, ...demoEnrollments];
        localStorage.setItem('enrollments', JSON.stringify(updatedEnrollments));
        
        enrolledCourseIds = ['pipe-fitter', 'safety-inspector'];
        studentEnrollments.push(...demoEnrollments);
      }
      
      // Step 5: Build enrolled courses with REAL progress
      const enrolledCourses = enrolledCourseIds
        .map((courseId: string) => {
          // Find course details
          const course = allCourses.find((c: any) => c.id === courseId);
          if (!course) {
            console.log(`Course not found for ID: ${courseId}`);
            return null;
          }
          
          // Find enrollment details
          const enrollment = studentEnrollments.find((e: any) => e.courseId === courseId);
          
          // Calculate real progress
          const { progress, completedSlides, totalSlides } = calculateRealProgress(courseId, studentData.id);
          
          // Get study hours
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
      
      // Update stats
      setStats({
        totalCourses: enrolledCourses.length,
        totalStudyHours: enrolledCourses.reduce((sum: number, c: any) => sum + (c.studyHours || 0), 0),
        totalQuizzes: totalQuizzes,
        quizzesAttempted: attemptedQuizzes,
        quizzesPassed: passedQuizzes,
        averageQuizScore: averageScore
      });
      
      // Save to localStorage for backup
      localStorage.setItem('studentCourses', JSON.stringify(enrolledCourses));
      
    } catch (error) {
      console.error('Error in loadStudentCourses:', error);
    }
  };

  // Function to load all dashboard data
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

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'enrollments' || 
          e.key?.startsWith('completedSlides_') || 
          e.key?.startsWith('quizAttempts_') ||
          e.key === 'studentCourses' ||
          e.key === 'courses') {
        loadDashboardData();
      }
    };

    // Custom events for updates
    const handleDataUpdate = () => {
      loadDashboardData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('courseProgressUpdated', handleDataUpdate);
    window.addEventListener('quizAttempted', handleDataUpdate);
    window.addEventListener('enrollmentUpdated', handleDataUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('courseProgressUpdated', handleDataUpdate);
      window.removeEventListener('quizAttempted', handleDataUpdate);
      window.removeEventListener('enrollmentUpdated', handleDataUpdate);
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
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      {/* Welcome Section */}
      <div 
        className="rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white"
        style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.darkNavy} 0%, ${BRAND_COLORS.darkRoyalBlue} 100%)` }}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">
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
            <p className="text-sm sm:text-base font-bold">{user?.learnerId || user?.id || ''}</p>
            <p className="text-xs opacity-75 mt-0.5 sm:mt-1">
              {user?.registrationDate ? `Joined ${new Date(user.registrationDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KPICard
          title="Courses"
          value={stats.totalCourses}
          icon={HiBookOpen}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          size="sm"
        />
        <KPICard
          title="Quizzes"
          value={stats.totalQuizzes}
          icon={HiClipboardCheck}
          color="bg-gradient-to-r from-yellow-500 to-yellow-600"
          change={stats.quizzesAttempted > 0 ? `${stats.quizzesPassed} passed` : 'Not started'}
          changeType={stats.quizzesAttempted > 0 ? 'positive' : 'neutral'}
          size="sm"
        />
        <KPICard
          title="Progress"
          value={`${overallProgress}%`}
          icon={HiCheckCircle}
          color="bg-gradient-to-r from-green-500 to-green-600"
          size="sm"
        />
        <KPICard
          title="Study Hours"
          value={stats.totalStudyHours}
          icon={HiClock}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          size="sm"
        />
      </div>

      {/* Quiz Stats Row (only if quizzes exist) */}
      {stats.totalQuizzes > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
            Quiz Performance
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 rounded-lg" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
              <p className="text-xs text-gray-600">Attempted</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
                {stats.quizzesAttempted}/{stats.totalQuizzes}
              </p>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-lg" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
              <p className="text-xs text-gray-600">Passed</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold mt-1 text-green-600">
                {stats.quizzesPassed}
              </p>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-lg" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
              <p className="text-xs text-gray-600">Average Score</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                {stats.averageQuizScore}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Courses List */}
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
            {courses.map(course => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                category={course.category}
                progress={course.progress || 0}
                duration={course.duration}
                image={course.image}
                compact={true}
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
      </div>
    </div>
  );
}