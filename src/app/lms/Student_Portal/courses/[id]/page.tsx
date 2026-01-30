// app/lms/Student_Portal/courses/[courseId]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, Clock, Users, Calendar, BarChart } from 'lucide-react';
import ModuleCard from '../../components/ModuleCard';
import ProgressBar from '../../components/ProgressBar';
import { getCourses, getModulesByCourse } from '../../utils/demoData';
/* eslint-disable */

export default function CourseDetailsPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadedCourses = getCourses();
    const foundCourse = loadedCourses.find(c => c.id === courseId);
    const courseModules = getModulesByCourse(courseId);
    
    setCourse(foundCourse);
    setModules(courseModules.sort((a, b) => a.order - b.order));
    setLoading(false);
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h1>
        <a 
          href="/lms/Student_Portal/courses" 
          className="text-purple-600 hover:text-purple-700 font-medium"
        >
          ← Back to Courses
        </a>
      </div>
    );
  }

  const completedModules = modules.filter(m => m.completed).length;
  const totalModules = modules.length;
  const completionPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="relative">
          <a 
            href="/lms/Student_Portal/courses" 
            className="inline-flex items-center gap-2 text-purple-100 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </a>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  {course.category}
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  {course.level}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-purple-100 text-lg">{course.description}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 min-w-[300px]">
              <h3 className="text-lg font-semibold mb-4">Course Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span className="font-bold">{completionPercentage}%</span>
                  </div>
                  <ProgressBar progress={completionPercentage} height={10} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white/10 rounded-lg">
                    <div className="text-2xl font-bold">{completedModules}</div>
                    <div className="text-sm text-purple-200">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-white/10 rounded-lg">
                    <div className="text-2xl font-bold">{totalModules}</div>
                    <div className="text-sm text-purple-200">Total Modules</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Modules</p>
              <p className="text-xl font-bold text-gray-900">{totalModules}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="text-xl font-bold text-gray-900">{course.duration}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Instructor</p>
              <p className="text-xl font-bold text-gray-900">{course.instructor}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Enrolled</p>
              <p className="text-xl font-bold text-gray-900">{course.enrolledDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modules Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Course Modules</h2>
            <p className="text-gray-600 mt-2">
              Complete modules in order to finish the course
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Progress:</span>
            <span className="text-lg font-bold text-purple-700">{completionPercentage}%</span>
          </div>
        </div>

        {modules.length > 0 ? (
          <div className="space-y-6">
            {modules.map((module) => (
              <ModuleCard 
                key={module.id} 
                module={module}
                onToggleComplete={() => {
                  // Refresh modules
                  const updatedModules = getModulesByCourse(courseId);
                  setModules(updatedModules.sort((a, b) => a.order - b.order));
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No modules available yet</h3>
            <p className="text-gray-600">Modules will be added soon by your instructor</p>
          </div>
        )}
      </div>

      {/* Course Materials */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Additional Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Course Syllabus', type: 'pdf', size: '2.4 MB' },
            { title: 'Reference Books', type: 'document', size: '1.8 MB' },
            { title: 'Practice Problems', type: 'pdf', size: '3.2 MB' },
          ].map((resource, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded">
                  {resource.type.toUpperCase()}
                </span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">{resource.title}</h4>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{resource.size}</span>
                <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}