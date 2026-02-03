// app/courses/page.tsx
'use client';

import { useState } from 'react';
import CourseCard from '@/components/CourseCard';

// Sample courses data
const courses = [
  {
    id: 'osha-safety',
    title: 'OSHA Workplace Safety',
    description: 'Learn essential workplace safety protocols and regulations for industrial environments.',
    duration: '6 Weeks',
    level: 'Intermediate',
    category: 'Safety',
    fees: 15000,
    image: 'osha.jpg'
  },
  {
    id: 'civil-engineering',
    title: 'Civil Engineering Basics',
    description: 'Introduction to civil engineering principles, materials, and construction techniques.',
    duration: '8 Weeks',
    level: 'Matric',
    category: 'Engineering',
    fees: 12000,
    image: 'civil.jpg'
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity Fundamentals',
    description: 'Understand basic cybersecurity concepts, threats, and protection mechanisms.',
    duration: '10 Weeks',
    level: 'Intermediate',
    category: 'IT & Tech',
    fees: 18000,
    image: 'cybersecurity.jpg'
  },
  {
    id: 'electrical-basics',
    title: 'Electrical Engineering Basics',
    description: 'Fundamentals of electrical circuits, wiring, and safety procedures.',
    duration: '7 Weeks',
    level: 'Matric',
    category: 'Engineering',
    fees: 14000,
    image: 'electrical.jpg'
  },
  {
    id: 'mechanical-drafting',
    title: 'Mechanical Drafting & CAD',
    description: 'Learn mechanical drawing techniques and Computer-Aided Design software.',
    duration: '9 Weeks',
    level: 'Advanced',
    category: 'Design',
    fees: 20000,
    image: 'mechanical.jpg'
  },
  {
    id: 'first-aid',
    title: 'First Aid & Emergency Response',
    description: 'Essential first aid skills and emergency response procedures for various situations.',
    duration: '5 Weeks',
    level: 'Matric',
    category: 'Safety',
    fees: 8000,
    image: 'first-aid.jpg'
  },
  
  {
    id: 'construction-safety',
    title: 'Construction Site Safety',
    description: 'Safety protocols and regulations specific to construction sites and heavy machinery.',
    duration: '6 Weeks',
    level: 'Intermediate',
    category: 'Safety',
    fees: 13000,
    image: 'construction.jpg'
  },
];

export default function CoursesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique categories and levels
  const categories = ['All', ...new Set(courses.map(course => course.category))];
  const levels = ['All', ...new Set(courses.map(course => course.level))];

  // Filter courses based on selections
  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesLevel && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Technical Courses</h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
              Choose from our comprehensive range of technical courses designed for Class 10–12 students
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 pl-12 rounded-xl border border-gray-300 
                       focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 
                       outline-none transition-colors shadow-sm"
            />
            <svg 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4 justify-center">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 
                         focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 
                         outline-none transition-colors"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 
                         focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 
                         outline-none transition-colors"
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* Reset Filters */}
            <div className="self-end">
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedLevel('All');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 
                         font-medium rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-8 text-center">
          <p className="text-gray-600">
            Showing <span className="font-bold text-gray-900">{filteredCourses.length}</span> courses
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            {selectedLevel !== 'All' && ` at ${selectedLevel} level`}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map(course => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedLevel('All');
                setSearchQuery('');
              }}
              className="px-6 py-3 bg-[#1E3A8A] hover:bg-[#1E40AF] text-white 
                       font-semibold rounded-lg transition-colors"
            >
              View All Courses
            </button>
          </div>
        )}
      </div>
    </div>
  );
}