// app/my-courses/[courseId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProgressBar from '../../components/ProgressBar';
import Link from 'next/link';
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
  modules: Module[];
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
  assignment: Assignment;
  quiz: Quiz;
  isVideoWatched: boolean;
  isAssignmentSubmitted: boolean;
  isQuizPassed: boolean;
  isCompleted: boolean;
  order: number;
};

type Assignment = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  studentScore?: number;
  submission?: string;
  isSubmitted: boolean;
  submittedDate?: string;
};

type Quiz = {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  passingScore: number;
  studentScore?: number;
  isPassed: boolean;
  attempts: number;
  timeLimit: number;
};

type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  studentAnswer?: number;
  explanation: string;
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [activeTab, setActiveTab] = useState<'modules' | 'overview' | 'resources'>('modules');

  useEffect(() => {
    loadCourseData();
  }, [params.courseId]);

  const loadCourseData = () => {
    setLoading(true);
    
    const studentCoursesStr = localStorage.getItem('studentCourses');
    if (studentCoursesStr) {
      try {
        const coursesData = JSON.parse(studentCoursesStr);
        const courseId = params.courseId as string;
        const foundCourse = coursesData.find((c: any) => c.id === courseId);
        
        if (foundCourse) {
          // Ensure status is properly typed
          const typedCourse: Course = {
            ...foundCourse,
            status: foundCourse.status === 'completed' 
              ? 'completed' 
              : foundCourse.status === 'in_progress' 
              ? 'in_progress' 
              : 'not_started'
          };
          setCourse(typedCourse);
        } else {
          router.push('/lms/Student_Portal/my-courses');
        }
      } catch (error) {
        console.error('Error loading course:', error);
        router.push('/lms/Student_Portal/my-courses');
      }
    } else {
      router.push('/lms/Student_Portal/my-courses');
    }
    
    setLoading(false);
  };

  const handleModuleClick = (module: Module) => {
    setSelectedModule(module);
  };

  const handleCompleteModule = (moduleId: string) => {
    if (!course) return;

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
    
    // Properly type the status
    const status: 'not_started' | 'in_progress' | 'completed' = 
      progress === 100 ? 'completed' : 
      progress > 0 ? 'in_progress' : 'not_started';

    const updatedCourse: Course = {
      ...course,
      modules: updatedModules,
      completedModules,
      progress,
      status
    };

    setCourse(updatedCourse);

    // Update localStorage
    const studentCoursesStr = localStorage.getItem('studentCourses');
    if (studentCoursesStr) {
      const coursesData = JSON.parse(studentCoursesStr);
      const updatedCourses = coursesData.map((c: any) => 
        c.id === course.id ? updatedCourse : c
      );
      localStorage.setItem('studentCourses', JSON.stringify(updatedCourses));
    }

    alert('Module marked as completed!');
  };

  const handleStartLearning = () => {
    const firstIncompleteModule = course?.modules.find(m => !m.isCompleted);
    if (firstIncompleteModule) {
      handleModuleClick(firstIncompleteModule);
    } else {
      alert('All modules are completed!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">📚</div>
        <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">Course not found</h3>
        <p className="text-gray-600 mb-6">The course you're looking for doesn't exist.</p>
        <Link
          href="/lms/Student_Portal/my-courses"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-900 transition-colors"
        >
          <span>←</span>
          Back to Courses
        </Link>
      </div>
    );
  }

  const completedModules = course.modules.filter(m => m.isCompleted).length;
  const pendingAssignments = course.modules.filter(m => !m.assignment.isSubmitted).length;
  const pendingQuizzes = course.modules.filter(m => !m.quiz.isPassed).length;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 md:gap-6">
          {/* Left Section */}
          <div className="flex-1">
            {/* Back link */}
            <Link
              href="/lms/Student_Portal/my-courses"
              className="inline-flex items-center gap-1 mb-3 text-purple-200 hover:text-white font-medium text-sm md:text-base"
            >
              <span>←</span>
              Back to Courses
            </Link>

            {/* Labels */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs md:text-sm px-2 md:px-3 py-1 bg-white/20 rounded-full">
                {course.category}
              </span>
              <span
                className={`text-xs md:text-sm px-2 md:px-3 py-1 rounded-full ${
                  course.status === 'completed' ? 'bg-green-500/30' : 'bg-blue-500/30'
                }`}
              >
                {course.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {/* Title & Instructor */}
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1">{course.title}</h1>
            <p className="text-purple-100 text-sm md:text-base">Instructor: {course.instructor}</p>

            {/* Description */}
            <p className="text-purple-200 mt-2 text-sm md:text-base">{course.description}</p>
          </div>

          {/* Right Section */}
          <div className="flex-shrink-0 mt-4 lg:mt-0">
            <button
              onClick={handleStartLearning}
              className="w-full lg:w-auto px-5 md:px-6 py-2.5 md:py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm md:text-base"
            >
              {course.status === 'completed' ? 'Review Course' : 'Start Learning'}
            </button>
          </div>
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* Progress */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
          <div className="flex flex-col gap-1 md:gap-2">
            <p className="text-xs md:text-sm text-gray-500">Progress</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900">{course.progress}%</p>
            <ProgressBar progress={course.progress} size="sm" className="mt-1 md:mt-2" />
          </div>
        </div>

        {/* Modules */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs md:text-sm text-gray-500">Modules</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900">{completedModules}/{course.totalModules}</p>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
        </div>

        {/* Study Hours */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs md:text-sm text-gray-500">Study Hours</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900">{course.studyHours}h</p>
            <p className="text-xs text-gray-500">Total time</p>
          </div>
        </div>

        {/* Enrolled */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs md:text-sm text-gray-500">Enrolled</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900">
              {new Date(course.enrolledDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
            <p className="text-xs text-gray-500">Date joined</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto -mb-px">
            <button
              onClick={() => setActiveTab('modules')}
              className={`py-3 md:py-4 px-4 md:px-6 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'modules'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="mr-2">📚</span>
              Modules
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 md:py-4 px-4 md:px-6 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="mr-2">🎥</span>
              Course Overview
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`py-3 md:py-4 px-4 md:px-6 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'resources'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="mr-2">📄</span>
              Resources
            </button>
          </nav>
        </div>

        <div className="p-4 md:p-6">
          {activeTab === 'modules' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 md:mb-6">
                <h3 className="text-lg font-bold text-gray-900">Course Modules</h3>
                <div className="text-sm text-gray-600">
                  {pendingAssignments} assignments pending • {pendingQuizzes} quizzes pending
                </div>
              </div>

              <div className="space-y-3">
                {course.modules.map((module, index) => (
                  <div
                    key={module.id}
                    className={`border rounded-xl p-3 md:p-4 transition-all hover:shadow-md ${
                      module.isCompleted
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            module.isCompleted 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <span className="font-bold text-sm">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm md:text-base">{module.title}</h4>
                            <p className="text-xs md:text-sm text-gray-600 mt-1">{module.description}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className={`text-center p-1 md:p-2 rounded ${
                            module.isVideoWatched ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            <p className="text-xs text-gray-700">Video</p>
                            <p className={`text-xs md:text-sm font-medium ${
                              module.isVideoWatched ? 'text-green-700' : 'text-gray-700'
                            }`}>
                              {module.isVideoWatched ? '✓ Watched' : 'Not Watched'}
                            </p>
                          </div>
                          <div className={`text-center p-1 md:p-2 rounded ${
                            module.isAssignmentSubmitted ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            <p className="text-xs text-gray-700">Assignment</p>
                            <p className={`text-xs md:text-sm font-medium ${
                              module.isAssignmentSubmitted ? 'text-green-700' : 'text-gray-700'
                            }`}>
                              {module.isAssignmentSubmitted ? '✓ Submitted' : 'Pending'}
                            </p>
                          </div>
                          <div className={`text-center p-1 md:p-2 rounded ${
                            module.isQuizPassed ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            <p className="text-xs text-gray-700">Quiz</p>
                            <p className={`text-xs md:text-sm font-medium ${
                              module.isQuizPassed ? 'text-green-700' : 'text-gray-700'
                            }`}>
                              {module.isQuizPassed ? '✓ Passed' : 'Not Attempted'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 sm:w-auto w-full">
                        <button
                          onClick={() => handleModuleClick(module)}
                          className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          View Details
                        </button>
                        {!module.isCompleted && (
                          <button
                            onClick={() => handleCompleteModule(module.id)}
                            className="px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 pt-3 border-t border-gray-200 gap-2">
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <span>⏰</span>
                          {module.duration} min
                        </span>
                        <span className="flex items-center gap-1">
                          <span>📝</span>
                          Assignment
                        </span>
                        <span className="flex items-center gap-1">
                          <span>❓</span>
                          Quiz
                        </span>
                      </div>
                      
                      {module.isCompleted ? (
                        <span className="flex items-center gap-1 text-green-600 text-xs md:text-sm">
                          <span>✅</span>
                          Completed
                        </span>
                      ) : (
                        <span className="text-yellow-600 text-xs md:text-sm">In Progress</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-4 md:space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Course Overview</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 text-sm md:text-base">
                  This course provides comprehensive training in {course.title.toLowerCase()}. 
                  You'll learn through a combination of video lectures, hands-on assignments, 
                  and interactive quizzes.
                </p>
                
                <h4 className="font-semibold text-gray-900 mt-4 md:mt-6 mb-2 md:mb-3">What You'll Learn</h4>
                <ul className="space-y-2 text-gray-700 text-sm md:text-base">
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>Master fundamental concepts and techniques</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>Apply knowledge through practical assignments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>Test your understanding with quizzes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>Complete all modules to earn certification</span>
                  </li>
                </ul>
                
                <h4 className="font-semibold text-gray-900 mt-4 md:mt-6 mb-2 md:mb-3">Prerequisites</h4>
                <p className="text-gray-700 text-sm md:text-base">
                  No prior experience required. This course is designed for beginners.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-4 md:space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Course Resources</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="border border-gray-200 rounded-lg p-3 md:p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <span className="text-purple-600 text-lg">📄</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base">Course Materials</h4>
                      <p className="text-xs md:text-sm text-gray-600">Downloadable resources</p>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm md:text-base">
                    Download All Materials
                  </button>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-3 md:p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <span className="text-blue-600 text-lg">🎥</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base">Video Lectures</h4>
                      <p className="text-xs md:text-sm text-gray-600">All course videos</p>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm md:text-base">
                    Access Videos
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-3 md:p-4">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm md:text-base">Additional Resources</h4>
                <ul className="space-y-1">
                  <li className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700 text-sm md:text-base">Course Syllabus PDF</span>
                    <span className="text-gray-400">⬇️</span>
                  </li>
                  <li className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700 text-sm md:text-base">Reference Guide</span>
                    <span className="text-gray-400">⬇️</span>
                  </li>
                  <li className="flex items-center justify-between py-2">
                    <span className="text-gray-700 text-sm md:text-base">Practice Exercises</span>
                    <span className="text-gray-400">⬇️</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Module Detail Modal */}
      {selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-center">
              <div className="flex-1">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">{selectedModule.title}</h2>
                <p className="text-sm text-gray-600">Module {course.modules.findIndex(m => m.id === selectedModule.id) + 1} of {course.totalModules}</p>
              </div>
              <button
                onClick={() => setSelectedModule(null)}
                className="ml-4 p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 flex-shrink-0"
              >
                <span className="text-xl">×</span>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 md:p-6">
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Description</h3>
                  <p className="text-gray-700 text-sm md:text-base">{selectedModule.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-600 text-lg">🎥</span>
                      <h4 className="font-medium text-gray-900 text-sm md:text-base">Video Lecture</h4>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 mb-3">{selectedModule.duration} minutes</p>
                    <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm md:text-base">
                      Watch Video
                    </button>
                  </div>

                  <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-600 text-lg">📝</span>
                      <h4 className="font-medium text-gray-900 text-sm md:text-base">Assignment</h4>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 mb-3">
                      {selectedModule.assignment.isSubmitted ? 'Submitted' : 'Due: ' + new Date(selectedModule.assignment.dueDate).toLocaleDateString()}
                    </p>
                    <button className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm md:text-base">
                      {selectedModule.assignment.isSubmitted ? 'View Submission' : 'Submit Assignment'}
                    </button>
                  </div>

                  <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-purple-600 text-lg">❓</span>
                      <h4 className="font-medium text-gray-900 text-sm md:text-base">Quiz</h4>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 mb-3">
                      {selectedModule.quiz.questions.length} questions • {selectedModule.quiz.timeLimit} minutes
                    </p>
                    <button className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm md:text-base">
                      {selectedModule.quiz.isPassed ? 'Review Quiz' : 'Take Quiz'}
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 md:pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">Completion Status</h3>
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm md:text-base">Video Watched</span>
                      <span className={`font-medium text-sm md:text-base ${selectedModule.isVideoWatched ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedModule.isVideoWatched ? '✓ Completed' : '✗ Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm md:text-base">Assignment Submitted</span>
                      <span className={`font-medium text-sm md:text-base ${selectedModule.isAssignmentSubmitted ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedModule.isAssignmentSubmitted ? '✓ Submitted' : '✗ Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm md:text-base">Quiz Passed</span>
                      <span className={`font-medium text-sm md:text-base ${selectedModule.isQuizPassed ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedModule.isQuizPassed ? '✓ Passed' : '✗ Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 md:p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setSelectedModule(null)}
                className="px-4 md:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm md:text-base"
              >
                Close
              </button>
              {!selectedModule.isCompleted && (
                <button
                  onClick={() => {
                    handleCompleteModule(selectedModule.id);
                    setSelectedModule(null);
                  }}
                  className="px-4 md:px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-900 transition-colors text-sm md:text-base"
                >
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}