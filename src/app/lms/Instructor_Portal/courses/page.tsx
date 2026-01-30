// app/lms/Instructor_Portal/courses/page.tsx
'use client';
/* eslint-disable */


import { useEffect, useState } from 'react';
import { Search, Filter, Plus, Grid, List, Download, MoreVertical, BookOpen } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import { getCourses } from '../utils/demoData';

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const loadedCourses = getCourses();
    setCourses(loadedCourses);
    setFilteredCourses(loadedCourses);
  }, []);

  useEffect(() => {
    let filtered = courses;
    
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(course => course.category === categoryFilter);
    }
    
    setFilteredCourses(filtered);
  }, [searchTerm, categoryFilter, courses]);

  const handleCreateCourse = () => {
    // In a real app, this would open a form
    setShowCreateModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses Management</h1>
          <p className="text-gray-600 mt-2">Manage all your teaching courses and modules</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleCreateCourse}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#6B21A8] hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Course
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="Matric">Matric</option>
            <option value="Intermediate">Intermediate</option>
          </select>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid' ? 'bg-[#6B21A8] text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list' ? 'bg-[#6B21A8] text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#6B21A8]">{courses.length}</div>
            <div className="text-sm text-gray-600">Total Courses</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#F59E0B]">
              {courses.reduce((sum, course) => sum + course.studentCount, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Students</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#10B981]">
              {courses.reduce((sum, course) => sum + course.modulesCount, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Modules</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#C4B5FD]">
              {Math.round(courses.reduce((sum, course) => sum + course.completionRate, 0) / courses.length)}%
            </div>
            <div className="text-sm text-gray-600">Avg Completion</div>
          </div>
        </div>
      </div>

      {/* Courses Grid/List */}
      {filteredCourses.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {filteredCourses.map((course) => (
            viewMode === 'grid' ? (
              <CourseCard key={course.id} course={course} />
            ) : (
              <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-purple-500 to-purple-300 flex items-center justify-center text-white font-bold text-xl">
                        {course.title.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            course.category === 'Matric' 
                              ? 'bg-[#F59E0B] text-white' 
                              : 'bg-[#6B21A8] text-white'
                          }`}>
                            {course.category}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">{course.description}</p>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span>📚 {course.modulesCount} modules</span>
                          <span>👨‍🎓 {course.studentCount} students</span>
                          <span>📅 Created: {course.createdDate}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6">
                      <div className="flex-1 max-w-md">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Course Progress</span>
                          <span className="font-medium text-[#6B21A8]">{course.completionRate}%</span>
                        </div>
                        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`absolute left-0 top-0 h-full rounded-full ${
                              course.completionRate >= 80 ? 'bg-[#10B981]' : 
                              course.completionRate >= 50 ? 'bg-[#F59E0B]' : 
                              'bg-[#6B21A8]'
                            }`}
                            style={{ width: `${course.completionRate}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 ml-6">
                        <a 
                          href={`/lms/Instructor_Portal/courses/${course.id}`}
                          className="px-4 py-2 bg-[#6B21A8] hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                        >
                          Manage Course
                        </a>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <BookOpen className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
          <button 
            onClick={handleCreateCourse}
            className="px-6 py-3 bg-[#6B21A8] hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            Create Your First Course
          </button>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Create New Course</h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Advanced Calculus"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of the course..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent">
                      <option>Matric</option>
                      <option>Intermediate</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Level
                    </label>
                    <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent">
                      <option>9th Grade</option>
                      <option>10th Grade</option>
                      <option>11th Grade</option>
                      <option>12th Grade</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-8">
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button className="px-6 py-2.5 bg-[#6B21A8] hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
                  Create Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}