// app/lms/Student_Portal/courses/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, Grid, List, BookOpen } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import { getCourses } from '../utils/demoData';
/* eslint-disable */

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

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
    
    if (levelFilter !== 'all') {
      filtered = filtered.filter(course => course.level === levelFilter);
    }
    
    setFilteredCourses(filtered);
  }, [searchTerm, categoryFilter, levelFilter, courses]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-2">Browse and manage all your enrolled courses</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full md:w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filter by:</span>
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          <option value="Matric">Matric</option>
          <option value="Intermediate">Intermediate</option>
        </select>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">All Levels</option>
          <option value="9th">9th Grade</option>
          <option value="10th">10th Grade</option>
          <option value="11th">11th Grade</option>
          <option value="12th">12th Grade</option>
        </select>
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
          <option value="all">All Progress</option>
          <option value="completed">Completed</option>
          <option value="in-progress">In Progress</option>
          <option value="not-started">Not Started</option>
        </select>
      </div>

      {/* Course Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredCourses.length}</span> courses
        </p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Sort by:</span>
          <select className="border-none bg-transparent font-medium text-gray-900 focus:outline-none">
            <option>Recent</option>
            <option>Progress</option>
            <option>A-Z</option>
          </select>
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
                <div className="flex items-start gap-6">
                  <div className="w-32 h-32 rounded-lg bg-gradient-to-r from-purple-100 to-purple-50 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                        <p className="text-gray-600 mt-2 line-clamp-2">{course.description}</p>
                        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                          <span>Instructor: {course.instructor}</span>
                          <span>Duration: {course.duration}</span>
                          <span className={`px-2 py-1 rounded ${
                            course.category === 'Matric' 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {course.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-700">{course.completion}%</div>
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                          <div 
                            className={`h-full ${
                              course.completion === 100 ? 'bg-emerald-500' : 'bg-purple-500'
                            }`}
                            style={{ width: `${course.completion}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-6">
                      <div>
                        <span className="text-sm text-gray-500">Enrolled on {course.enrolledDate}</span>
                      </div>
                      <a 
                        href={`/lms/Student_Portal/courses/${course.id}`}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors duration-300"
                      >
                        Continue Learning
                      </a>
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
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}