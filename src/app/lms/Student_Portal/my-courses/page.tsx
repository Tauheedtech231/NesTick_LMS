// app/lms/Student_Portal/my-courses/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HiClock, HiDocumentText, HiUser, HiChartBar } from 'react-icons/hi';
/* eslint-disable */

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
  lastAccessed?: string;
  image?: string;
  instructorName?: string;
  duration?: string;
  level?: string;
};

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
/* eslint-disable */

export default function MyCoursesPage() {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [overallProgress, setOverallProgress] = useState(0);

  // Function to load courses with real-time progress
  const loadCoursesWithProgress = () => {
    try {
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) {
        setLoading(false);
        return;
      }
      
      const userData = JSON.parse(currentUserStr);
      setUser(userData);

      // Get studentCourses
      const studentCoursesStr = localStorage.getItem('studentCourses');
      if (!studentCoursesStr) {
        setLoading(false);
        return;
      }

      const studentCoursesData = JSON.parse(studentCoursesStr);

      // For each course, get the latest progress from individual completion data
      const typedCourses: Course[] = studentCoursesData.map((course: any) => {
        // Get the latest completion data for this course and student
        const completedSlidesKey = `completedSlides_${userData.id}_${course.id}`;
        const savedCompletedSlides = localStorage.getItem(completedSlidesKey);
        
        // Get total slides for this course
        const allSlides = JSON.parse(localStorage.getItem('slides') || '[]');
        const courseSlides = allSlides.filter((s: any) => s.courseId === course.id);
        const totalSlides = courseSlides.length;
        
        // Calculate completed slides
        const completedSlides = savedCompletedSlides ? JSON.parse(savedCompletedSlides).length : 0;
        
        // Calculate progress based on slides completion
        const progress = totalSlides > 0 
          ? Math.round((completedSlides / totalSlides) * 100) 
          : course.progress || 0;

        // Get completed modules count
        const completedModules = completedSlides;

        return {
          id: course.id,
          title: course.title || 'Untitled Course',
          instructor: course.instructorName || course.instructor || 'Not Assigned',
          description: course.description || 'Course description not available.',
          category: course.category || 'General',
          progress: progress,
          status: progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started',
          enrolledDate: course.enrolledDate || new Date().toISOString(),
          modules: course.modules || [],
          totalModules: totalSlides,
          completedModules: completedModules,
          lastAccessed: course.lastAccessed,
          image: course.image || course.courseImage,
          instructorName: course.instructorName,
          duration: course.duration || 'Self-paced',
          level: course.level || 'All Levels'
        };
      });

      // Update studentCourses with latest progress to keep it in sync
      localStorage.setItem('studentCourses', JSON.stringify(typedCourses));

      // Calculate overall progress
      const totalProgress = typedCourses.reduce((sum, course) => sum + course.progress, 0);
      const avgProgress = typedCourses.length > 0 
        ? Math.round(totalProgress / typedCourses.length) 
        : 0;
      
      setOverallProgress(avgProgress);
      setCourses(typedCourses);
      setFilteredCourses(typedCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoursesWithProgress();

    // Add event listener for storage changes (when data updates in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('completedSlides_') || 
          e.key?.startsWith('completedContent_') || 
          e.key === 'studentCourses') {
        loadCoursesWithProgress();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events (for same-tab updates)
    const handleCourseProgressUpdate = () => {
      loadCoursesWithProgress();
    };

    window.addEventListener('courseProgressUpdated', handleCourseProgressUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('courseProgressUpdated', handleCourseProgressUpdate);
    };
  }, []);

  useEffect(() => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  }, [searchTerm, courses]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div
            className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
            style={{ borderColor: BRAND_COLORS.deepRed }}
          ></div>
          <p className="mt-4 text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 p-3 sm:p-4 md:p-5">
      {/* Header with search and overall progress */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            My Courses
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
            {user?.fullName?.split(' ')[0] || 'Student'} • {courses.length}{' '}
            {courses.length === 1 ? 'course' : 'courses'} enrolled
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Overall Progress Badge */}
          {courses.length > 0 && (
            <div 
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200"
            >
              <HiChartBar className="w-4 h-4" style={{ color: BRAND_COLORS.teal }} />
              <div>
                <p className="text-xs text-gray-500">Overall Progress</p>
                <p className="text-sm font-semibold" style={{ color: BRAND_COLORS.deepRed }}>
                  {overallProgress}%
                </p>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="w-full sm:w-64 md:w-80">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overall Progress */}
      {courses.length > 0 && (
        <div className="sm:hidden bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HiChartBar className="w-5 h-5" style={{ color: BRAND_COLORS.teal }} />
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            </div>
            <span className="text-lg font-bold" style={{ color: BRAND_COLORS.deepRed }}>
              {overallProgress}%
            </span>
          </div>
          <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${overallProgress}%`,
                backgroundColor: BRAND_COLORS.deepRed,
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {courses.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900">{courses.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <p className="text-xs text-gray-500">In Progress</p>
            <p className="text-lg sm:text-xl font-bold text-yellow-600">
              {courses.filter(c => c.status === 'in_progress').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <p className="text-xs text-gray-500">Completed</p>
            <p className="text-lg sm:text-xl font-bold text-green-600">
              {courses.filter(c => c.status === 'completed').length}
            </p>
          </div>
        </div>
      )}

      {/* Course grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredCourses.map((course) => (
            <Link
              key={course.id}
              href={`/lms/Student_Portal/my-courses/${course.id}`}
              className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              <div className="p-4 sm:p-5">
                {/* Image if available */}
                {course.image && (
                  <div className="h-32 sm:h-36 overflow-hidden mb-3 sm:mb-4 rounded-lg">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Category and progress */}
                <div className="flex justify-between items-start mb-2 sm:mb-3">
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded"
                    style={{
                      backgroundColor: `${BRAND_COLORS.teal}20`,
                      color: BRAND_COLORS.teal,
                    }}
                  >
                    {course.category}
                  </span>
                  <span className="text-xs font-medium text-gray-500">
                    {course.progress}%
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-2 line-clamp-2">
                  {course.title}
                </h3>

               

                {/* Description */}
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                  {course.description}
                </p>

                {/* Duration & Level */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                    {course.duration}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                    {course.level}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium" style={{ color: BRAND_COLORS.deepRed }}>
                      {course.progress}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${course.progress}%`,
                        backgroundColor: BRAND_COLORS.deepRed,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Meta info */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center">
                    <HiDocumentText className="w-3 h-3 mr-1" />
                    {course.completedModules}/{course.totalModules} lessons
                  </span>
                  {course.status === 'completed' && (
                    <span className="text-green-600 font-medium">✓ Completed</span>
                  )}
                  {course.status === 'in_progress' && (
                    <span className="text-yellow-600 font-medium">● In Progress</span>
                  )}
                  {course.status === 'not_started' && (
                    <span className="text-gray-400 font-medium">○ Not Started</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-10 text-center">
          <div className="text-5xl sm:text-6xl mb-4">📚</div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No matching courses' : 'No courses enrolled'}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-5 max-w-md mx-auto">
            {searchTerm
              ? `No courses found matching "${searchTerm}"`
              : "You haven't enrolled in any courses yet. Browse available courses to get started."}
          </p>
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-purple-900 transition-colors"
            >
              Clear Search
            </button>
          ) : (
            // eslint-disable-next-line @next/next/no-html-link-for-pages
            <a
              href="/courses"
              className="inline-block px-5 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-purple-900 transition-colors"
            >
              Browse Courses
            </a>
          )}
        </div>
      )}
    </div>
  );
}