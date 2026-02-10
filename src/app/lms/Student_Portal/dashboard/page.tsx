// app/dashboard/page.tsx
'use client';

import { useState, useEffect, SetStateAction } from 'react';
import { 
  HiBookOpen, 
  HiCheckCircle, 
  HiClock, 
  HiAcademicCap, 
  HiDocumentText,
  HiChartBar,
  HiArrowRight,
  HiCalendar,
  HiUser,
  HiStar
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
          <p className="text-gray-600 text-sm">{title}</p>
          <h3 className="font-bold text-2xl mt-1">{value}</h3>
          {change && (
            <p className={`text-sm mt-1 ${
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

// ✅ Course Card Component
const CourseCard = ({ 
  id,
  title,
  category,
  progress,
  instructorName,
  duration,
  image,
  compact = false
}: {
  id: string;
  title: string;
  category: string;
  progress: number;
  instructorName: string;
  duration: string;
  image?: string;
  compact?: boolean;
}) => {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow ${compact ? 'p-4' : 'p-6'}`}>
      {image && !compact && (
        <div className="h-40 overflow-hidden mb-4 rounded-lg">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div>
        <div className="flex justify-between items-start mb-3">
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
            {progress}% Complete
          </span>
        </div>
        
        <h3 className={`font-bold text-gray-900 mb-2 ${compact ? 'text-sm' : 'text-base'}`}>
          {title}
        </h3>
        
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
            <HiUser className="w-3 h-3 text-gray-600" />
          </div>
          <p className="text-xs text-gray-600">{instructorName}</p>
        </div>
        
        <div className="flex items-center text-xs text-gray-500 mb-3">
          <HiClock className="w-3 h-3 mr-1" />
          {duration}
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
          href={`/lms/Student_Portal/courses/${id}`}
          className={`w-full flex items-center justify-center gap-2 font-medium rounded-lg transition-colors ${
            compact ? 'py-2 text-xs' : 'py-2.5 text-sm'
          }`}
          style={{ 
            backgroundColor: BRAND_COLORS.deepRed,
            color: BRAND_COLORS.white 
          }}
        >
          {compact ? 'View Course' : 'Continue Learning'}
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

  useEffect(() => {
    const loadDashboardData = () => {
      try {
        // ✅ Load user data
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
          const userData = JSON.parse(currentUserStr);
          setUser(userData);
          
          // ✅ Load student courses with REAL data matching
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

  // ✅ REAL DATA ONLY: Load student courses with Course ID and Name Matching
  const loadStudentCourses = (studentData: any) => {
    try {
      console.log('🔍 Loading REAL courses for student:', studentData.email);
      
      // Get REAL courses from localStorage
      const industrialCourses = JSON.parse(localStorage.getItem('industrial_training_courses') || '[]');
      const lmsCourses = JSON.parse(localStorage.getItem('lms_courses') || '[]');
      const allCourses = [...industrialCourses, ...lmsCourses];
      
      console.log('📚 Total courses in system:', allCourses.length);
      
      // Get REAL instructors
      const allInstructors = JSON.parse(localStorage.getItem('lms_instructors') || '[]');
      console.log('👨‍🏫 Total instructors in system:', allInstructors.length);
      
      let enrolledCourses = [];

      // 🔍 Method 1: Check studentCredentials (Admin sent REAL data)
      const studentCredentials = JSON.parse(localStorage.getItem('studentCredentials') || '[]');
      console.log('📋 Student credentials found:', studentCredentials.length);
      
      const credentialCourses = studentCredentials
        .filter((cred: any) => {
          // Match by email OR username
          const matchesEmail = cred.studentEmail?.toLowerCase() === studentData.email?.toLowerCase();
          const matchesUsername = cred.username?.toLowerCase() === studentData.username?.toLowerCase();
          return matchesEmail || matchesUsername;
        })
        .map((cred: any) => {
          console.log('Processing credential for course:', cred.course);
          
          // ✅ Find course by ID OR by Title (BOTH MATCHING)
          let courseInfo = null;
          
          // First try by ID
          if (cred.courseId) {
            courseInfo = allCourses.find((c: any) => c.id === cred.courseId);
          }
          
          // If not found by ID, try by title
          if (!courseInfo && cred.course) {
            courseInfo = allCourses.find((c: any) => 
              c.title?.toLowerCase() === cred.course?.toLowerCase()
            );
          }
          
          // If still no course found, skip (NO DEMO DATA)
          if (!courseInfo) {
            console.log('❌ No matching course found for:', cred.course);
            return null;
          }
          
          console.log('✅ Found course:', courseInfo.title);
          
          // ✅ Find REAL instructor for this course
          let courseInstructor = null;
          
          // First try: Instructor assigned to this course ID
          if (cred.courseId) {
            courseInstructor = allInstructors.find((inst: any) => 
              inst.courseId === cred.courseId
            );
          }
          
          // Second try: Instructor assigned to course title
          if (!courseInstructor) {
            courseInstructor = allInstructors.find((inst: any) => 
              inst.assignedCourse?.title === cred.course ||
              inst.assignedCourse?.id === cred.courseId
            );
          }
          
          // If no instructor found, check if instructor created quizzes for this course
          if (!courseInstructor) {
            const instructorQuizzes = JSON.parse(localStorage.getItem('instructor_quizzes') || '[]');
            const quizForCourse = instructorQuizzes.find((q: any) => 
              q.courseId === cred.courseId || q.courseTitle === cred.course
            );
            
            if (quizForCourse) {
              courseInstructor = allInstructors.find((inst: any) => 
                inst.id === quizForCourse.instructorId ||
                inst.name === quizForCourse.instructorName
              );
            }
          }
          
          // If still no instructor, check assignments
          if (!courseInstructor) {
            const instructorAssignments = JSON.parse(localStorage.getItem('instructor_assignments') || '[]');
            const assignmentForCourse = instructorAssignments.find((a: any) => 
              a.courseId === cred.courseId || a.courseTitle === cred.course
            );
            
            if (assignmentForCourse) {
              courseInstructor = allInstructors.find((inst: any) => 
                inst.id === assignmentForCourse.instructorId ||
                inst.name === assignmentForCourse.instructorName
              );
            }
          }
          
          // If NO REAL instructor found, leave instructorName empty (NO FAKE DATA)
          const instructorName = courseInstructor ? courseInstructor.name : '';

          return {
            id: cred.courseId || courseInfo.id,
            title: courseInfo.title || cred.course,
            category: courseInfo.category || 'Training',
            duration: courseInfo.duration || 'N/A',
            instructorId: courseInstructor?.id || '',
            instructorName: instructorName, // Empty if no real instructor
            progress: 0,
            status: 'not_started',
            enrolledDate: cred.sentDate || new Date().toISOString(),
            studyHours: 0,
            price: courseInfo.price,
            image: courseInfo.image,
            rating: courseInfo.rating
          };
        })
        .filter(Boolean); // Remove null entries

      enrolledCourses = [...credentialCourses];
      console.log('✅ Credential courses loaded:', credentialCourses.length);

      // 🔍 Method 2: Check uploadedFiles (Payment submissions)
      const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
      const paymentCourses = uploadedFiles
        .filter((file: any) => file.email?.toLowerCase() === studentData.email?.toLowerCase())
        .map((file: any) => {
          // Find course by title
          const courseInfo = allCourses.find((c: any) => 
            c.title?.toLowerCase() === file.course?.toLowerCase()
          );
          
          if (!courseInfo) return null;
          
          // Find instructor for this course
          let courseInstructor = allInstructors.find((inst: any) => 
            inst.courseId === courseInfo.id ||
            inst.assignedCourse?.title === file.course
          );
          
          const instructorName = courseInstructor ? courseInstructor.name : '';
          
          return {
            id: courseInfo.id,
            title: courseInfo.title,
            category: courseInfo.category || 'Training',
            duration: courseInfo.duration || 'N/A',
            instructorId: courseInstructor?.id || '',
            instructorName: instructorName,
            progress: 0,
            status: 'not_started',
            enrolledDate: file.paymentDate || file.uploadDate || new Date().toISOString(),
            studyHours: 0,
            price: courseInfo.price,
            image: courseInfo.image,
            rating: courseInfo.rating
          };
        })
        .filter(Boolean);

      enrolledCourses = [...enrolledCourses, ...paymentCourses];
      console.log('✅ Payment courses loaded:', paymentCourses.length);

      // Remove duplicates
      const uniqueCourses = Array.from(
        new Map(enrolledCourses.map(course => [course.id, course])).values()
      );

      console.log('🎯 Final enrolled courses:', uniqueCourses.map(c => ({
        id: c.id,
        title: c.title,
        instructor: c.instructorName || 'No instructor assigned'
      })));

      setCourses(uniqueCourses);
      
      // Save to localStorage
      localStorage.setItem('studentCourses', JSON.stringify(uniqueCourses));

      // ✅ Now load REAL assignments and quizzes
      loadAssignmentsAndQuizzes(uniqueCourses, studentData);

      // Calculate stats
      const totalCourses = uniqueCourses.length;
      const completedCourses = uniqueCourses.filter((c: any) => c.status === 'completed').length;
      const inProgressCourses = uniqueCourses.filter((c: any) => c.status === 'in_progress').length;
      const totalStudyHours = uniqueCourses.reduce((sum: number, c: any) => sum + c.studyHours, 0);

      setStats(prev => ({
        ...prev,
        totalCourses,
        completedCourses,
        inProgressCourses,
        totalStudyHours
      }));

    } catch (error) {
      console.error('Error loading student courses:', error);
    }
  };

  // ✅ REAL DATA ONLY: Load assignments and quizzes
  const loadAssignmentsAndQuizzes = (studentCourses: any[], studentData: any) => {
    try {
      console.log('🔍 Loading REAL assignments/quizzes for', studentCourses.length, 'courses');
      
      const studentEmail = studentData.email;
      if (!studentEmail) return;

      // Load REAL data
      const allAssignments = JSON.parse(localStorage.getItem('instructor_assignments') || '[]');
      const allQuizzes = JSON.parse(localStorage.getItem('instructor_quizzes') || '[]');
      const allInstructors = JSON.parse(localStorage.getItem('lms_instructors') || '[]');
      
      console.log('📝 Total assignments in system:', allAssignments.length);
      console.log('🧪 Total quizzes in system:', allQuizzes.length);
      
      const studentAssignments: SetStateAction<any[]> = [];
      const studentQuizzes: SetStateAction<any[]> = [];

      studentCourses.forEach(course => {
        console.log('Checking course for assignments/quizzes:', course.title);
        
        // 🔍 Find REAL assignments for this course
        const courseAssignments = allAssignments
          .filter((assignment: any) => {
            // Multiple REAL matching strategies
            const matchesExactId = assignment.courseId === course.id;
            const matchesCourseTitle = assignment.courseTitle?.toLowerCase() === course.title?.toLowerCase();
            
            return matchesExactId || matchesCourseTitle;
          })
          .filter((assignment: any) => assignment.status === 'published')
          .map((assignment: any) => {
            // Find REAL instructor
            let assignmentInstructor = null;
            
            // First try by instructor ID
            if (assignment.instructorId) {
              assignmentInstructor = allInstructors.find((inst: any) => 
                inst.id === assignment.instructorId
              );
            }
            
            // Then try by name
            if (!assignmentInstructor && assignment.instructorName) {
              assignmentInstructor = allInstructors.find((inst: any) => 
                inst.name === assignment.instructorName
              );
            }
            
            // NO FAKE DATA - if no instructor found, use empty string
            const instructorName = assignmentInstructor ? assignmentInstructor.name : '';
            
            return {
              ...assignment,
              courseTitle: course.title,
              instructorName: instructorName,
              studentStatus: 'not_started',
              studentScore: null
            };
          });

        // 🔍 Find REAL quizzes for this course
        const courseQuizzes = allQuizzes
          .filter((quiz: any) => {
            // Multiple REAL matching strategies
            const matchesExactId = quiz.courseId === course.id;
            const matchesCourseTitle = quiz.courseTitle?.toLowerCase() === course.title?.toLowerCase();
            
            return matchesExactId || matchesCourseTitle;
          })
          .filter((quiz: any) => quiz.status === 'published')
          .map((quiz: any) => {
            // Find REAL instructor
            let quizInstructor = null;
            
            // First try by instructor ID
            if (quiz.instructorId) {
              quizInstructor = allInstructors.find((inst: any) => 
                inst.id === quiz.instructorId
              );
            }
            
            // Then try by name
            if (!quizInstructor && quiz.instructorName) {
              quizInstructor = allInstructors.find((inst: any) => 
                inst.name === quiz.instructorName
              );
            }
            
            // NO FAKE DATA - if no instructor found, use empty string
            const instructorName = quizInstructor ? quizInstructor.name : '';
            
            return {
              ...quiz,
              courseTitle: course.title,
              instructorName: instructorName,
              studentStatus: 'not_attempted',
              studentScore: null
            };
          });

        console.log(`📊 Course "${course.title}": ${courseAssignments.length} assignments, ${courseQuizzes.length} quizzes`);
        
        studentAssignments.push(...courseAssignments);
        studentQuizzes.push(...courseQuizzes);
      });

      // Calculate REAL stats
      const pendingAssignments = studentAssignments.filter(a => 
        a.studentStatus === 'not_started'
      ).length;

      const upcomingQuizzes = studentQuizzes.filter(q => 
        q.studentStatus === 'not_attempted'
      ).length;

      console.log('📈 Stats calculated:', {
        assignments: studentAssignments.length,
        quizzes: studentQuizzes.length,
        pendingAssignments,
        upcomingQuizzes
      });

      // Log REAL data examples
      if (studentAssignments.length > 0) {
        const sampleAssignment = studentAssignments[0];
        console.log('📄 Sample assignment:', {
          title: sampleAssignment.title,
          course: sampleAssignment.courseTitle,
          instructor: sampleAssignment.instructorName || 'No instructor data'
        });
      }

      if (studentQuizzes.length > 0) {
        const sampleQuiz = studentQuizzes[0];
        console.log('🧪 Sample quiz:', {
          title: sampleQuiz.title,
          course: sampleQuiz.courseTitle,
          instructor: sampleQuiz.instructorName || 'No instructor data'
        });
      }

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

  const getLastAccessedCourse = () => {
    return courses
      .filter(course => course.status !== 'completed')
      .sort((a, b) => b.progress - a.progress)[0];
  };

  const getOverallProgress = () => {
    if (courses.length === 0) return 0;
    const totalProgress = courses.reduce((sum, course) => sum + course.progress, 0);
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

  // ✅ Start assignment links ONLY in stats, not in UI
  const upcomingAssignmentsCount = assignments.filter(a => a.studentStatus === 'not_started').length;
  const upcomingQuizzesCount = quizzes.filter(q => q.studentStatus === 'not_attempted').length;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Welcome Section */}
      <div 
        className="rounded-2xl p-6 text-white"
        style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.darkNavy} 0%, ${BRAND_COLORS.darkRoyalBlue} 100%)` }}
      >
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.fullName || 'Student'}!
            </h1>
            <p className="opacity-90">
              {courses.length > 0 
                ? `You have ${courses.length} enrolled courses` 
                : 'No courses enrolled yet'}
            </p>
          </div>
          <div className="text-right lg:text-right">
            <p className="text-sm opacity-90">Learner ID</p>
            <p className="text-lg font-bold">{user?.learnerId || ''}</p>
            <p className="text-xs opacity-75 mt-1">
              {user?.registrationDate ? `Joined ${new Date(user.registrationDate).toLocaleDateString()}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards - ONLY STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <KPICard
          title="Total Courses"
          value={stats.totalCourses}
          icon={HiBookOpen}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          size="sm"
        />
        <KPICard
          title="Pending Assignments"
          value={stats.pendingAssignments}
          icon={HiDocumentText}
          color="bg-gradient-to-r from-red-500 to-red-600"
          change={upcomingAssignmentsCount > 0 ? 'Start now' : 'All done'}
          changeType={upcomingAssignmentsCount > 0 ? 'negative' : 'positive'}
          size="sm"
        />
        <KPICard
          title="Upcoming Quizzes"
          value={stats.upcomingQuizzes}
          icon={HiChartBar}
          color="bg-gradient-to-r from-yellow-500 to-yellow-600"
          change={upcomingQuizzesCount > 0 ? 'Prepare now' : 'None scheduled'}
          changeType={upcomingQuizzesCount > 0 ? 'negative' : 'positive'}
          size="sm"
        />
        <KPICard
          title="Overall Progress"
          value={`${overallProgress}%`}
          icon={HiCheckCircle}
          color="bg-gradient-to-r from-green-500 to-green-600"
          size="sm"
        />
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border p-6" style={{ borderColor: BRAND_COLORS.softGrey }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
              Quick Access
            </h2>
            <div className="space-y-3">
              {lastAccessedCourse ? (
                <Link
                  href={`/lms/Student_Portal/courses/${lastAccessedCourse.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border hover:shadow-sm transition-all"
                  style={{ 
                    borderColor: BRAND_COLORS.softGrey,
                    backgroundColor: `${BRAND_COLORS.lightGrey}`
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: BRAND_COLORS.deepRed }}
                    >
                      <HiBookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">Continue Learning</p>
                      <p className="text-xs text-gray-600 truncate">{lastAccessedCourse.title}</p>
                    </div>
                  </div>
                  <HiArrowRight className="w-4 h-4 flex-shrink-0 ml-2" style={{ color: BRAND_COLORS.deepRed }} />
                </Link>
              ) : (
                <div className="p-4 rounded-lg border text-center" style={{ borderColor: BRAND_COLORS.softGrey }}>
                  <p className="text-sm text-gray-600">No active courses</p>
                </div>
              )}

              <Link
                href="/lms/Student_Portal/my-courses"
                className="flex items-center justify-between p-4 rounded-lg border hover:shadow-sm transition-all"
                style={{ borderColor: BRAND_COLORS.softGrey }}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue }}
                  >
                    <HiBookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">My Courses</p>
                    <p className="text-xs text-gray-600">{stats.totalCourses} enrolled</p>
                  </div>
                </div>
                <HiArrowRight className="w-4 h-4 flex-shrink-0 ml-2" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
              </Link>

              {stats.pendingAssignments > 0 && (
                <Link
                  href="/lms/Student_Portal/assignments"
                  className="flex items-center justify-between p-4 rounded-lg border hover:shadow-sm transition-all"
                  style={{ borderColor: BRAND_COLORS.softGrey }}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: BRAND_COLORS.teal }}
                    >
                      <HiDocumentText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">My Assignments</p>
                      <p className="text-xs text-gray-600">{stats.pendingAssignments} pending</p>
                    </div>
                  </div>
                  <HiArrowRight className="w-4 h-4 flex-shrink-0 ml-2" style={{ color: BRAND_COLORS.teal }} />
                </Link>
              )}

              {stats.upcomingQuizzes > 0 && (
                <Link
                  href="/lms/Student_Portal/quizzes"
                  className="flex items-center justify-between p-4 rounded-lg border hover:shadow-sm transition-all"
                  style={{ borderColor: BRAND_COLORS.softGrey }}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: '#8B5CF6' }}
                    >
                      <HiChartBar className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">My Quizzes</p>
                      <p className="text-xs text-gray-600">{stats.upcomingQuizzes} upcoming</p>
                    </div>
                  </div>
                  <HiArrowRight className="w-4 h-4 flex-shrink-0 ml-2" style={{ color: '#8B5CF6' }} />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Courses List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border p-6" style={{ borderColor: BRAND_COLORS.softGrey }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                My Courses ({courses.length})
              </h2>
              <div className="text-right">
                <p className="text-sm text-gray-600">Overall Progress</p>
                <span className="text-2xl font-bold" style={{ color: BRAND_COLORS.deepRed }}>
                  {overallProgress}%
                </span>
              </div>
            </div>
            
            <div className="mb-8">
              <ProgressBar progress={overallProgress} size="lg" animate={true} />
            </div>

            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.slice(0, 4).map(course => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    category={course.category}
                    progress={course.progress}
                    instructorName={course.instructorName || 'Instructor not assigned'}
                    duration={course.duration}
                    image={course.image}
                    compact={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <HiBookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.softGrey }} />
                <h3 className="text-lg font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
                  No courses enrolled
                </h3>
                <p className="text-gray-600 mb-6">You haven't enrolled in any courses yet.</p>
                <Link
                  href="/courses"
                  className="inline-flex px-6 py-3 rounded-lg font-medium transition-colors"
                  style={{ 
                    backgroundColor: BRAND_COLORS.deepRed,
                    color: BRAND_COLORS.white 
                  }}
                >
                  Browse Available Courses
                </Link>
              </div>
            )}
            
            {courses.length > 4 && (
              <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: BRAND_COLORS.softGrey }}>
                <Link
                  href="/lms/Student_Portal/my-courses"
                  className="inline-flex items-center gap-2 text-sm font-medium"
                  style={{ color: BRAND_COLORS.darkRoyalBlue }}
                >
                  View all {courses.length} courses
                  <HiArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="bg-white rounded-xl border p-6" style={{ borderColor: BRAND_COLORS.softGrey }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
          Learning Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
            <p className="text-sm text-gray-600">Study Hours</p>
            <p className="text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
              {stats.totalStudyHours}
            </p>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
              {stats.completedCourses}
            </p>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
            <p className="text-sm text-gray-600">In Progress</p>
            <p className="text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
              {stats.inProgressCourses}
            </p>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
            <p className="text-sm text-gray-600">Submitted Work</p>
            <p className="text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
              {stats.assignmentsSubmitted}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}