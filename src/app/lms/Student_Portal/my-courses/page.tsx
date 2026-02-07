// app/my-courses/page.tsx
'use client';

import { useState, useEffect } from 'react';
import CourseCard from '../components/CourseCard';
import ProgressBar from '../components/ProgressBar';
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
};

type Module = {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  assignment: any;
  quiz: any;
  isVideoWatched: boolean;
  isAssignmentSubmitted: boolean;
  isQuizPassed: boolean;
  isCompleted: boolean;
  order: number;
};

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  useEffect(() => {
    // Load courses data
    const studentCoursesStr = localStorage.getItem('studentCourses');
    if (studentCoursesStr) {
      try {
        const coursesData = JSON.parse(studentCoursesStr);
        // Convert status strings to the correct type
        const typedCourses: Course[] = coursesData.map((course: any) => ({
          ...course,
          status: course.status === 'completed' 
            ? 'completed' 
            : course.status === 'in_progress' 
            ? 'in_progress' 
            : 'not_started'
        }));
        setCourses(typedCourses);
        setFilteredCourses(typedCourses);
      } catch (error) {
        console.error('Error parsing courses:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(course => course.status === selectedStatus);
    }

    setFilteredCourses(filtered);
  }, [searchTerm, selectedCategory, selectedStatus, courses]);

  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleViewModule = (module: Module) => {
    setSelectedModule(module);
  };

  const handleCompleteModule = (moduleId: string) => {
    if (!selectedCourse) return;

    const updatedCourses: Course[] = courses.map(course => {
      if (course.id === selectedCourse.id) {
        const updatedModules = course.modules.map(module => {
          if (module.id === moduleId) {
            return {
              ...module,
              isVideoWatched: true,
              isAssignmentSubmitted: true,
              isQuizPassed: true,
              isCompleted: true
            };
          }
          return module;
        });

        const completedModules = updatedModules.filter(m => m.isCompleted).length;
        const progress = Math.round((completedModules / course.totalModules) * 100);
        
        // Type assertion to ensure status matches Course type
        const status: 'not_started' | 'in_progress' | 'completed' = 
          progress === 100 ? 'completed' : 
          progress > 0 ? 'in_progress' : 'not_started';

        return {
          ...course,
          modules: updatedModules,
          completedModules,
          progress,
          status
        } as Course;
      }
      return course;
    });

    setCourses(updatedCourses);
    setFilteredCourses(updatedCourses);
    localStorage.setItem('studentCourses', JSON.stringify(updatedCourses));

    // Update selected course
    const updatedCourse = updatedCourses.find(c => c.id === selectedCourse.id);
    if (updatedCourse) {
      setSelectedCourse(updatedCourse);
    }
  };

  const categories = Array.from(new Set(courses.map(c => c.category)));
  const totalCourses = courses.length;
  const inProgressCourses = courses.filter(c => c.status === 'in_progress').length;
  const completedCourses = courses.filter(c => c.status === 'completed').length;
  const totalStudyHours = courses.reduce((sum, c) => sum + c.studyHours, 0);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1 md:mb-2">Total Courses</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{totalCourses}</p>
          <div className="mt-2 flex items-center">
            
            <span className="text-xs text-gray-500">Enrolled</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1 md:mb-2">In Progress</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{inProgressCourses}</p>
          <div className="mt-2 flex items-center">
           
            <span className="text-xs text-gray-500">Active Learning</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1 md:mb-2">Completed</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{completedCourses}</p>
          <div className="mt-2 flex items-center">
            
            <span className="text-xs text-gray-500">Finished</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1 md:mb-2">Study Hours</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{totalStudyHours}h</p>
          <div className="mt-2 flex items-center">
         
            <span className="text-xs text-gray-500">Total Time</span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:gap-4">
          {/* Search input */}
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 text-sm md:text-base"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 appearance-none bg-white text-sm md:text-base"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
  
            </div>

            <div className="relative flex-1">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 appearance-none bg-white text-sm md:text-base"
              >
                <option value="all">All Status</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2">▼</span>
            </div>

           
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredCourses.map(course => (
            <div 
              key={course.id} 
              onClick={() => handleViewCourse(course)}
              className="cursor-pointer transition-transform hover:scale-[1.02]"
            >
              <CourseCard {...course} />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12 text-center">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">
            No courses found
          </h3>
          <p className="text-gray-600 mb-6 text-sm md:text-base">
            {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'You are not enrolled in any courses yet'}
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedStatus('all');
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-900 transition-colors text-sm md:text-base"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-purple-50 to-purple-100">
              <div className="flex-1">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">{selectedCourse.title}</h2>
                <p className="text-sm text-gray-600 mt-1">Instructor: {selectedCourse.instructor}</p>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="ml-4 p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 flex-shrink-0"
              >
                <span className="text-xl">×</span>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 md:p-6">
              {/* Progress Section */}
              <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
                  <h3 className="font-semibold text-gray-900 text-lg">Course Progress</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-lg md:text-2xl font-bold text-purple-600">{selectedCourse.progress}%</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedCourse.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : selectedCourse.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedCourse.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                <ProgressBar progress={selectedCourse.progress} size="lg" />
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Modules</p>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedCourse.completedModules}/{selectedCourse.totalModules}
                    </p>
                    <span className="text-xs text-gray-400">completed</span>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Study Hours</p>
                    <p className="text-lg font-bold text-gray-900">{selectedCourse.studyHours}h</p>
                    <span className="text-xs text-gray-400">total</span>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Enrolled</p>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(selectedCourse.enrolledDate).toLocaleDateString()}
                    </p>
                    <span className="text-xs text-gray-400">date</span>
                  </div>
                </div>
              </div>

              {/* Modules Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 text-lg">Course Modules</h3>
                  <span className="text-sm text-gray-500">
                    {selectedCourse.completedModules} of {selectedCourse.totalModules} completed
                  </span>
                </div>
                
                <div className="space-y-3">
                  {selectedCourse.modules.map(module => (
                    <div
                      key={module.id}
                      className={`p-4 border rounded-lg transition-colors ${
                        module.isCompleted
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${
                              module.isCompleted 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-200 text-gray-700'
                            }`}>
                              {module.order}
                            </span>
                            <h4 className="font-medium text-gray-900">{module.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600 pl-8">{module.description}</p>
                        </div>
                        <div className="flex items-center gap-2 pl-8 sm:pl-0">
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            {module.duration} min
                          </span>
                          {module.isCompleted ? (
                            <span className="text-green-500 text-lg">✅</span>
                          ) : (
                            <span className="text-blue-500 text-lg">▶️</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3 pl-8">
                        <div className={`p-2 rounded text-center ${
                          module.isVideoWatched ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <p className="text-xs text-gray-700">Video</p>
                          <p className={`text-sm font-medium ${
                            module.isVideoWatched ? 'text-green-700' : 'text-gray-700'
                          }`}>
                            {module.isVideoWatched ? '✓ Watched' : 'Not Watched'}
                          </p>
                        </div>
                        <div className={`p-2 rounded text-center ${
                          module.isAssignmentSubmitted ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <p className="text-xs text-gray-700">Assignment</p>
                          <p className={`text-sm font-medium ${
                            module.isAssignmentSubmitted ? 'text-green-700' : 'text-gray-700'
                          }`}>
                            {module.isAssignmentSubmitted ? '✓ Submitted' : 'Pending'}
                          </p>
                        </div>
                        <div className={`p-2 rounded text-center ${
                          module.isQuizPassed ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <p className="text-xs text-gray-700">Quiz</p>
                          <p className={`text-sm font-medium ${
                            module.isQuizPassed ? 'text-green-700' : 'text-gray-700'
                          }`}>
                            {module.isQuizPassed ? '✓ Passed' : 'Not Attempted'}
                          </p>
                        </div>
                      </div>

                      {!module.isCompleted && (
                        <div className="pl-8">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompleteModule(module.id);
                            }}
                            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-900 transition-colors text-sm md:text-base"
                          >
                            Mark as Completed
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 md:p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setSelectedCourse(null)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm md:text-base"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.location.href = `/lms/Student_Portal/my-courses/${selectedCourse.id}`;
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-900 transition-colors text-sm md:text-base"
              >
                Continue Learning
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}