// app/lms/Student_Portal/my-courses/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HiClock, HiUser, HiOutlineRefresh, HiXCircle, HiSearch, HiBookOpen, HiAcademicCap } from 'react-icons/hi';
import { Loader2 } from 'lucide-react';
/* eslint-disable */

type Course = {
  id: string;
  title: string;
  instructor: string;
  instructorName?: string;
  description: string;
  category: string;
  enrolledDate: string;
  modules: any[];
  totalModules: number;
  completedModules: number;
  lastAccessed?: string;
  image?: string;
  duration?: string;
  level?: string;
  instructorImage?: string;
  enrollmentId: string;
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

export default function MyCoursesPage() {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get instructor name
  const getInstructorName = (course: any): string => {
    const instructorName = 
      course.instructorName || 
      course.instructor || 
      course.instructor_name || 
      'Not Assigned';
    
    if (typeof instructorName === 'object' && instructorName !== null) {
      return instructorName.name || instructorName.fullName || 'Instructor';
    }
    
    if (typeof instructorName === 'string' && instructorName.trim()) {
      return instructorName;
    }
    
    return 'Not Assigned';
  };

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

  // Fetch enrolled courses from API
  const fetchEnrolledCourses = async (showRefreshing = false) => {
    if (!user?.email) return;

    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      console.log('🔍 Fetching enrolled courses for:', user.email);

      // Get student's enrollments from database
      const response = await fetch(`/api/students/enrollments?email=${encodeURIComponent(user.email)}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch enrollments');
      }

      if (result.success && result.data) {
        console.log('📊 Enrollments found:', result.data.length);

        // Get course details for each enrollment
        const coursesWithDetails = await Promise.all(
          result.data.map(async (enrollment: any) => {
            // Fetch course details
            const courseResponse = await fetch(`/api/instructors/course/${enrollment.course_id}`);
            const courseResult = await courseResponse.json();

            if (!courseResponse.ok || !courseResult.success) {
              return null;
            }

            const course = courseResult.data.course;

            return {
              id: course.id,
              title: course.title,
              instructor: getInstructorName(course),
              instructorName: getInstructorName(course),
              description: course.description || course.title,
              category: course.category || 'General',
              enrolledDate: enrollment.enrollment_date,
              modules: [],
              totalModules: 10,
              completedModules: 0,
              lastAccessed: enrollment.last_accessed,
              image: course.image || '',
              duration: course.duration || 'Self-paced',
              level: course.level || 'All Levels',
              enrollmentId: enrollment.id
            };
          })
        );

        const validCourses = coursesWithDetails.filter(Boolean) as Course[];
        setCourses(validCourses);
        setFilteredCourses(validCourses);
        localStorage.setItem('studentCourses', JSON.stringify(validCourses));
      } else {
        setCourses([]);
        setFilteredCourses([]);
      }
    } catch (error: any) {
      console.error('Error fetching enrolled courses:', error);
      setError(error.message || 'Failed to load courses');
      
      try {
        const studentCoursesStr = localStorage.getItem('studentCourses');
        if (studentCoursesStr) {
          const savedCourses = JSON.parse(studentCoursesStr);
          setCourses(savedCourses);
          setFilteredCourses(savedCourses);
        }
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchEnrolledCourses();
    }
  }, [user]);

  useEffect(() => {
    const displayCourses = courses;
    let filtered = displayCourses;

    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  }, [searchTerm, courses]);

  const handleRefresh = () => {
    if (user?.email) {
      fetchEnrolledCourses(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: BRAND_COLORS.deepRed }} />
          <p className="text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <HiXCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2 text-gray-900">Error Loading Courses</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: BRAND_COLORS.deepRed }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Clean Background */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-b border-gray-200 px-4 sm:px-6 py-10 sm:py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white shadow-md rounded-full mb-4">
            <HiBookOpen className="w-8 h-8 text-indigo-600" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            My Learning Journey
          </h1>
          
          <p className="text-lg text-gray-600 mb-6">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}! You're enrolled in {courses.length} {courses.length === 1 ? 'course' : 'courses'}
          </p>

          {/* Search Input - Clean Design */}
          <div className="relative max-w-xl mx-auto">
            <div className="relative">
              <HiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search your courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-12 py-4 text-base bg-white rounded-full border border-gray-200 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm placeholder-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Search Stats */}
            {searchTerm && filteredCourses.length > 0 && (
              <div className="absolute left-0 right-0 -bottom-8 text-sm text-gray-500">
                Found {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} matching "{searchTerm}"
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="absolute top-6 right-6 p-2 bg-white shadow-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <HiOutlineRefresh className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Empty State - No Enrolled Courses */}
        {courses.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-10 text-center">
            <div className="p-3 sm:p-4 bg-indigo-50 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 flex items-center justify-center">
              <HiAcademicCap className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              No Enrolled Courses
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-5 max-w-md mx-auto">
              You haven't enrolled in any courses yet. Browse available courses to start your learning journey!
            </p>
            <Link
              href="/courses"
              className="inline-block px-5 py-2 rounded-lg text-white text-xs sm:text-sm font-medium transition-colors"
              style={{ backgroundColor: BRAND_COLORS.deepRed }}
            >
              Browse Courses
            </Link>
          </div>
        )}

        {/* No matching courses */}
        {courses.length > 0 && filteredCourses.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-10 text-center">
            <div className="p-3 sm:p-4 bg-gray-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 flex items-center justify-center">
              <HiSearch className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              No matching courses
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-5 max-w-md mx-auto">
              No courses found matching "{searchTerm}"
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="px-5 py-2 rounded-lg text-white text-xs sm:text-sm font-medium transition-colors"
              style={{ backgroundColor: BRAND_COLORS.deepRed }}
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Course grid */}
        {filteredCourses.length > 0 && (
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

                  {/* Category */}
                  <div className="mb-2 sm:mb-3">
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded"
                      style={{
                        backgroundColor: `${BRAND_COLORS.teal}20`,
                        color: BRAND_COLORS.teal,
                      }}
                    >
                      {course.category}
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
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600 flex items-center gap-1">
                      <HiClock className="w-3 h-3" />
                      {course.duration}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                      {course.level}
                    </span>
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <HiUser className="w-3 h-3 text-gray-400" />
                    <span className="truncate">{course.instructor}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}