// app/my-courses/page.tsx
'use client';

import { useState, useEffect } from 'react';
import CourseCard from '../components/CourseCard';
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
  studyHours: number;
  lastAccessed?: string;
  image?: string;
  instructorName?: string;
};

export default function MyCoursesPage() {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // ========== 📋 LOAD CURRENT USER & THEIR COURSES ==========
  useEffect(() => {
    const loadData = () => {
      try {
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
          const userData = JSON.parse(currentUserStr);
          setUser(userData);
        }

        const studentCoursesStr = localStorage.getItem('studentCourses');
        if (studentCoursesStr) {
          const coursesData = JSON.parse(studentCoursesStr);

          const typedCourses: Course[] = coursesData.map((course: any) => ({
            ...course,
            instructor: course.instructorName || course.instructor || 'Not Assigned',
            status:
              course.status === 'completed'
                ? 'completed'
                : course.status === 'in_progress'
                ? 'in_progress'
                : 'not_started',
            modules: course.modules || [],
            totalModules: course.totalModules || 5,
            completedModules: course.completedModules || 0,
            studyHours: course.studyHours || 0,
            description: course.description || 'Course description not available.',
          }));

          setCourses(typedCourses);
          setFilteredCourses(typedCourses);
        }
      } catch (error) {
        console.error('Error loading courses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ========== 🔍 SEARCH FILTER ==========
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

  // ========== 🎯 MARK MODULE COMPLETED – kept for future use ==========
  const handleCompleteModule = (courseId: string, moduleId: string) => {
    const updatedCourses: Course[] = courses.map((course) => {
      if (course.id === courseId) {
        const updatedModules = course.modules.map((module) => {
          if (module.id === moduleId) {
            return {
              ...module,
              isVideoWatched: true,
              isAssignmentSubmitted: true,
              isQuizPassed: true,
              isCompleted: true,
            };
          }
          return module;
        });

        const completedModules = updatedModules.filter((m) => m.isCompleted).length;
        const progress = Math.round((completedModules / course.totalModules) * 100);
        const status: 'not_started' | 'in_progress' | 'completed' =
          progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started';

        return {
          ...course,
          modules: updatedModules,
          completedModules,
          progress,
          status,
        };
      }
      return course;
    });

    setCourses(updatedCourses);
    setFilteredCourses(updatedCourses);
    localStorage.setItem('studentCourses', JSON.stringify(updatedCourses));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div
            className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
            style={{ borderColor: '#B11217' }}
          ></div>
          <p className="mt-4 text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 p-3 sm:p-4 md:p-5">
      {/* ========== SIMPLE HEADER ========== */}
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

        {/* ========== SEARCH ========== */}
        <div className="w-full sm:w-64 md:w-80">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search courses by title, instructor, or category..."
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

      {/* ========== COURSES GRID ========== */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              instructor={course.instructor}
              description={course.description}
              progress={course.progress}
              status={course.status}
              modules={course.modules}
              totalModules={course.totalModules}
              completedModules={course.completedModules}
              studyHours={course.studyHours}
              category={course.category}
              lastAccessed={course.lastAccessed}
              image={course.image}
              compact={true}
            />
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