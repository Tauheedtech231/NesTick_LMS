// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  HiBookOpen, 
  HiCheckCircle, 
  HiClock, 
  HiAcademicCap, 
  HiDocumentText,
  HiChartBar,
  HiArrowRight,
  HiPlay
} from 'react-icons/hi';
/* eslint-disable */

import KPICard from '../components/KPICard';
import ProgressBar from '../components/ProgressBar';
import CourseCard from '../components/CourseCard';
import Link from 'next/link';


type User = {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: 'student';
  course: string;
  courseId: string;
  registrationDate: string;
  status: 'active' | 'inactive';
  paymentVerified: boolean;
  learnerId: string;
};

type Course = {
  id: string;
  title: string;
  instructor: string;
  description: string;
  category: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  enrolledDate: string;
  modules: any[];
  totalModules: number;
  completedModules: number;
  studyHours: number;
  lastAccessed?: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalStudyHours: 0,
    assignmentsCompleted: 0,
    quizzesPassed: 0
  });

  useEffect(() => {
    // Load user data
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      try {
        const userData = JSON.parse(currentUserStr);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Load courses data
    const studentCoursesStr = localStorage.getItem('studentCourses');
    if (studentCoursesStr) {
      try {
        const coursesData = JSON.parse(studentCoursesStr);
        setCourses(coursesData);
        
        // Calculate stats
        const totalCourses = coursesData.length;
        const completedCourses = coursesData.filter((c: Course) => c.status === 'completed').length;
        const inProgressCourses = coursesData.filter((c: Course) => c.status === 'in_progress').length;
        const totalStudyHours = coursesData.reduce((sum: number, c: Course) => sum + c.studyHours, 0);
        const assignmentsCompleted = coursesData.reduce((sum: number, c: Course) => {
          return sum + c.modules.filter((m: any) => m.assignment.isSubmitted).length;
        }, 0);
        const quizzesPassed = coursesData.reduce((sum: number, c: Course) => {
          return sum + c.modules.filter((m: any) => m.quiz.isPassed).length;
        }, 0);

        setStats({
          totalCourses,
          completedCourses,
          inProgressCourses,
          totalStudyHours,
          assignmentsCompleted,
          quizzesPassed
        });
      } catch (error) {
        console.error('Error parsing courses:', error);
      }
    }
  }, []);

  const getLastAccessedCourse = () => {
    return courses
      .filter(course => course.status !== 'completed')
      .sort((a, b) => {
        if (!a.lastAccessed) return 1;
        if (!b.lastAccessed) return -1;
        return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime();
      })[0];
  };

  const getOverallProgress = () => {
    if (courses.length === 0) return 0;
    const totalProgress = courses.reduce((sum, course) => sum + course.progress, 0);
    return Math.round(totalProgress / courses.length);
  };

  const lastAccessedCourse = getLastAccessedCourse();
  const overallProgress = getOverallProgress();

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Welcome Section - Mobile Responsive */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl lg:rounded-2xl p-4 lg:p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-xl lg:text-2xl font-bold mb-2">
              Welcome back, {user?.fullName || 'Student'}!
            </h1>
            <p className="text-purple-100 text-sm lg:text-base">
              Continue your learning journey. You have {stats.inProgressCourses} courses in progress.
            </p>
          </div>
          <div className="text-right lg:text-right">
            <p className="text-xs lg:text-sm text-purple-200">Learner ID</p>
            <p className="text-base lg:text-lg font-bold">{user?.learnerId || 'LRN000000'}</p>
            <p className="text-xs text-purple-200 mt-1">
              Joined {user?.registrationDate ? new Date(user.registrationDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid - Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <KPICard
          title="Total Courses"
          value={stats.totalCourses}
          icon={HiBookOpen}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          size="sm"
        />
        <KPICard
          title="Courses Completed"
          value={stats.completedCourses}
          icon={HiCheckCircle}
          color="bg-gradient-to-r from-green-500 to-green-600"
          change={`${stats.completedCourses > 0 ? '+' : ''}${stats.completedCourses} this month`}
          changeType="positive"
          size="sm"
        />
        <KPICard
          title="Courses In Progress"
          value={stats.inProgressCourses}
          icon={HiClock}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          size="sm"
        />
        <KPICard
          title="Study Hours"
          value={stats.totalStudyHours}
          icon={HiAcademicCap}
          color="bg-gradient-to-r from-yellow-500 to-yellow-600"
          change="+12h this week"
          changeType="positive"
          size="sm"
        />
        <KPICard
          title="Assignments"
          value={stats.assignmentsCompleted}
          icon={HiDocumentText}
          color="bg-gradient-to-r from-indigo-500 to-indigo-600"
          size="sm"
        />
        <KPICard
          title="Quizzes Passed"
          value={stats.quizzesPassed}
          icon={HiChartBar}
          color="bg-gradient-to-r from-pink-500 to-pink-600"
          size="sm"
        />
      </div>

      {/* Quick Access & Progress Section - Stack on mobile, side-by-side on desktop */}
      <div className="flex flex-col lg:flex-row lg:gap-6 gap-4">
        {/* Quick Access - Full width on mobile, 1/3 on desktop */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Access</h2>
            <div className="space-y-3">
              {lastAccessedCourse && (
                <Link
                  href={`/my-courses/${lastAccessedCourse.id}`}
                  className="flex items-center justify-between p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                   
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">Continue Learning</p>
                      <p className="text-xs text-gray-600 truncate">{lastAccessedCourse.title}</p>
                    </div>
                  </div>
                  <HiArrowRight className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 flex-shrink-0 ml-2" />
                </Link>
              )}

              <Link
                href="/lms/Student_Portal/my-courses"
                className="flex items-center justify-between p-3 lg:p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-center space-x-3">
               
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">My Courses</p>
                    <p className="text-xs text-gray-600">{stats.totalCourses} enrolled courses</p>
                  </div>
                </div>
                <HiArrowRight className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600 flex-shrink-0 ml-2" />
              </Link>

              <Link
                href="/lms/Student_Portal/certificates"
                className="flex items-center justify-between p-3 lg:p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 hover:border-green-300 transition-colors"
              >
                <div className="flex items-center space-x-3">
               
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Certificates</p>
                    <p className="text-xs text-gray-600">{stats.completedCourses} available</p>
                  </div>
                </div>
                <HiArrowRight className="w-4 h-4 lg:w-5 lg:h-5 text-green-600 flex-shrink-0 ml-2" />
              </Link>
            </div>
          </div>
        </div>

        {/* Overall Progress - Full width on mobile, 2/3 on desktop */}
      <div className="lg:w-2/3">
  <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6  transition-shadow duration-300">
    <h2 className="text-lg font-bold text-gray-900 mb-4 lg:mb-6">Learning Progress</h2>
    
    {/* Overall Progress Bar */}
    <div className="mb-6 lg:mb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3 lg:mb-4">
        <h3 className="font-semibold text-gray-900 text-sm lg:text-base">Overall Learning Progress</h3>
        <span className="text-xl lg:text-2xl font-bold text-purple-600 transition-transform duration-200 hover:scale-105">{overallProgress}%</span>
      </div>
      <ProgressBar progress={overallProgress} size="md" animate={true} className="rounded-full" />
    </div>

    {/* Course-wise Progress */}
    <div>
      <h3 className="font-semibold text-gray-900 text-sm lg:text-base mb-3 lg:mb-4">Course Progress</h3>
      <div className="space-y-3 lg:space-y-4">
        {courses.map(course => (
          <div key={course.id} className="space-y-2 group">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span className="text-sm font-medium text-gray-700 truncate group-hover:text-gray-900 transition-colors duration-200">{course.title}</span>
              <span className="text-sm font-bold text-gray-900 transition-transform duration-200 group-hover:scale-105">{course.progress}%</span>
            </div>
            <ProgressBar progress={course.progress} size="sm" animate={true} className="rounded-full" />
            <div className="flex flex-col xs:flex-row xs:justify-between text-xs text-gray-500 gap-1">
              <span>{course.completedModules}/{course.totalModules} modules</span>
              <span>{course.studyHours} study hours</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>

      </div>

      {/* Active Courses */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 lg:mb-6">
          <h2 className="text-lg font-bold text-gray-900">Active Courses</h2>
          <Link
            href="/lms/Student_Portal/my-courses"
            className="text-purple-600 hover:text-purple-800 font-medium flex items-center text-sm"
          >
            View All Courses
            <HiArrowRight className="ml-2 w-3 h-3 lg:w-4 lg:h-4" />
          </Link>
        </div>
        
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {courses.slice(0, 3).map(course => (
              <div key={course.id} className="transform transition-transform hover:scale-[1.01]">
                <CourseCard
                  {...course}
                  compact={true}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 lg:py-12">
            <HiBookOpen className="w-12 h-12 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-3 lg:mb-4" />
            <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">No courses enrolled yet</h3>
            <p className="text-sm lg:text-base text-gray-600 mb-4 lg:mb-6">Start your learning journey by enrolling in courses</p>
            <Link
              href="/"
              className="inline-flex px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-900 transition-colors text-sm lg:text-base"
            >
              Browse Courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}