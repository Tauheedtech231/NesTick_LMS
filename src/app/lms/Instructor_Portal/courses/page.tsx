'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Clock,
  Users,
  DollarSign,
  Star,
  Eye,
  Search,
  Filter,
  Wrench,
  ShieldCheck,
  Flame as Fire,
  FolderPlus,
  ChevronRight
} from 'lucide-react'

// Brand Colors
const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  white: '#FFFFFF',
  lightGrey: '#F4F6F8',
  softGrey: '#E5E7EB',
  darkGrey: '#1F2933',
  teal: '#1FB6C9',
  brightRed: '#D32F2F'
}

type Course = {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  students: string;
  level: string;
  highlights: string[];
  price: string;
  originalPrice: string;
  savings: string;
  featured: boolean;
  rating: number;
  reviews: number;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  // Load courses from localStorage
  useEffect(() => {
    const loadCourses = () => {
      try {
        const savedCourses = localStorage.getItem('lms_courses')
        if (savedCourses) {
          setCourses(JSON.parse(savedCourses))
        } else {
          // Default courses
          const defaultCourses: Course[] = [
            {
              id: 'pipe-fitter',
              title: 'Pipe Fitter',
              category: 'Technical Training',
              description: 'Master industrial pipe fitting techniques with hands-on training on cutting, threading, and installation following international standards.',
              duration: '8 Weeks',
              students: 'Max 20 per batch',
              level: 'Beginner to Advanced',
              highlights: [
                'Learn pipe cutting, threading, and installation',
                'Blueprint reading and interpretation',
                'Pipe system design and layout',
                'Safety protocols and standards',
                'Hands-on workshop training',
                'Industry certification preparation'
              ],
              price: 'PKR 25,000',
              originalPrice: 'PKR 30,000',
              savings: 'Save PKR 5,000',
              featured: true,
              rating: 4.8,
              reviews: 124,
              image: "https://images.pexels.com/photos/6124242/pexels-photo-6124242.jpeg",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 'safety-inspector',
              title: 'Safety Inspector',
              category: 'Safety Training',
              description: 'Professional safety inspection training for construction and industrial environments with OSHA certification preparation.',
              duration: '6 Weeks',
              students: 'Max 15 per batch',
              level: 'Intermediate',
              highlights: [
                'OSHA standards and regulations',
                'Site inspection methodologies',
                'Risk assessment techniques',
                'Safety documentation',
                'Emergency response planning',
                'Certification exam preparation'
              ],
              price: 'PKR 30,000',
              originalPrice: 'PKR 35,000',
              savings: 'Save PKR 5,000',
              featured: true,
              rating: 4.9,
              reviews: 89,
              image: "https://images.pexels.com/photos/34082713/pexels-photo-34082713.jpeg",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 'welding',
              title: 'Professional Welding',
              category: 'Technical Training',
              description: 'Comprehensive welding training covering MIG, TIG, and Arc welding techniques for industrial applications.',
              duration: '10 Weeks',
              students: 'Max 12 per batch',
              level: 'Beginner to Professional',
              highlights: [
                'MIG, TIG, and Arc welding techniques',
                'Metal identification and preparation',
                'Weld quality inspection',
                'Safety equipment usage',
                'Industry-standard certification',
                'Portfolio development'
              ],
              price: 'PKR 35,000',
              originalPrice: 'PKR 40,000',
              savings: 'Save PKR 5,000',
              featured: true,
              rating: 4.7,
              reviews: 156,
              image: "https://images.pexels.com/photos/7650512/pexels-photo-7650512.jpeg",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
          setCourses(defaultCourses)
          localStorage.setItem('lms_courses', JSON.stringify(defaultCourses))
        }
      } catch (error) {
        console.error('Error loading courses:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [])

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory
    
    return matchesSearch && matchesCategory
  })

  // Get unique categories
  const categories = ['all', ...new Set(courses.map(course => course.category))]

  // Delete course
  const deleteCourse = (courseId: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      const updatedCourses = courses.filter(course => course.id !== courseId)
      setCourses(updatedCourses)
      localStorage.setItem('lms_courses', JSON.stringify(updatedCourses))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-darkRoyalBlue"></div>
          <p className="mt-4 text-darkGrey">Loading courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-lightGrey rounded-xl p-6 border border-softGrey">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                Course Management
              </h1>
              <p className="text-darkGrey mt-1">
                Manage all courses, add new courses, edit existing ones, and handle modules
              </p>
            </div>
            <Link
              href="/lms/Instructor_Portal/courses/add"
              className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors"
              style={{ 
                backgroundColor: BRAND_COLORS.deepRed,
                color: BRAND_COLORS.white 
              }}
            >
              <Plus className="w-5 h-5" />
              Add New Course
            </Link>
          </div>
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: BRAND_COLORS.deepRed }}></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-softGrey p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-darkGrey">Total Courses</p>
              <p className="text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
                {courses.length}
              </p>
            </div>
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}10` }}>
              <BookOpen className="w-5 h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-softGrey p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-darkGrey">Featured Courses</p>
              <p className="text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
                {courses.filter(c => c.featured).length}
              </p>
            </div>
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.deepRed}10` }}>
              <Star className="w-5 h-5" style={{ color: BRAND_COLORS.deepRed }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-softGrey p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-darkGrey">Average Rating</p>
              <p className="text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
                {courses.length > 0 
                  ? (courses.reduce((acc, c) => acc + c.rating, 0) / courses.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.teal}10` }}>
              <Star className="w-5 h-5" style={{ color: BRAND_COLORS.teal }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-softGrey p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-darkGrey">Manage Modules</p>
              <p className="text-sm font-medium mt-1" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                <Link href="/lms/Instructor_Portal/courses/modules" className="hover:underline">
                  View All Modules →
                </Link>
              </p>
            </div>
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}10` }}>
              <FolderPlus className="w-5 h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border border-softGrey p-5 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: BRAND_COLORS.darkGrey }} />
              <input
                type="text"
                placeholder="Search courses by title, category, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
              />
            </div>
          </div>

          <div className="w-full md:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: BRAND_COLORS.darkGrey }} />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 bg-white appearance-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-lg border border-softGrey overflow-hidden">
        <div className="p-4 border-b border-softGrey flex justify-between items-center bg-lightGrey">
          <h2 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
            All Courses ({filteredCourses.length})
          </h2>
          <span className="text-sm text-darkGrey">
            Showing {filteredCourses.length} of {courses.length} courses
          </span>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
                  <th className="text-left py-3.5 px-6 font-semibold text-sm" style={{ color: BRAND_COLORS.darkNavy }}>
                    Course
                  </th>
                  <th className="text-left py-3.5 px-6 font-semibold text-sm" style={{ color: BRAND_COLORS.darkNavy }}>
                    Category
                  </th>
                  <th className="text-left py-3.5 px-6 font-semibold text-sm" style={{ color: BRAND_COLORS.darkNavy }}>
                    Duration
                  </th>
                  <th className="text-left py-3.5 px-6 font-semibold text-sm" style={{ color: BRAND_COLORS.darkNavy }}>
                    Price
                  </th>
                  <th className="text-left py-3.5 px-6 font-semibold text-sm" style={{ color: BRAND_COLORS.darkNavy }}>
                    Rating
                  </th>
                  <th className="text-left py-3.5 px-6 font-semibold text-sm" style={{ color: BRAND_COLORS.darkNavy }}>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredCourses.map((course) => (
                  <tr 
                    key={course.id} 
                    className="border-b border-softGrey hover:bg-lightGrey transition-colors duration-150"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" 
                          style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}10` }}>
                          {course.title === 'Pipe Fitter' ? (
                            <Wrench className="w-5 h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                          ) : course.title === 'Safety Inspector' ? (
                            <ShieldCheck className="w-5 h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                          ) : course.title === 'Professional Welding' ? (
                            <Fire className="w-5 h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                          ) : (
                            <BookOpen className="w-5 h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-darkGrey">{course.title}</p>
                          <p className="text-sm text-darkGrey/70 truncate max-w-xs">{course.description}</p>
                        </div>
                        {course.featured && (
                          <span className="px-2 py-1 text-xs rounded-full bg-deepRed/10 text-deepRed">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 text-sm rounded-full bg-lightGrey text-darkGrey">
                        {course.category}
                      </span>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-darkGrey/70" />
                        <span className="text-darkGrey">{course.duration}</span>
                      </div>
                      <div className="text-xs text-darkGrey/70 mt-1">{course.students}</div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <p className="font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>{course.price}</p>
                        <p className="text-sm line-through text-darkGrey/70">{course.originalPrice}</p>
                        <p className="text-xs text-teal">{course.savings}</p>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(course.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-darkGrey">{course.rating}</span>
                        <span className="text-xs text-darkGrey/70">({course.reviews})</span>
                      </div>
                      <p className="text-xs text-darkGrey/70 mt-1">{course.level}</p>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <Link
                          href={`/lms/Instructor_Portal/courses/edit/${course.id}`}
                          className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-lightGrey rounded-lg transition-colors"
                          title="Edit Course"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        
                        <Link
                          href="/lms/Instructor_Portal/courses/modules"
                          className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-lightGrey rounded-lg transition-colors"
                          title="Manage Modules"
                        >
                          <FolderPlus className="w-4 h-4" />
                        </Link>
                        
                        <button
                          onClick={() => deleteCourse(course.id)}
                          className="p-2 text-brightRed hover:bg-brightRed/5 rounded-lg transition-colors"
                          title="Delete Course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => {
                            // Preview course
                            alert(`Preview: ${course.title}`)
                          }}
                          className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-lightGrey rounded-lg transition-colors"
                          title="Preview Course"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.softGrey }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
              {searchTerm ? 'No matching courses found' : 'No courses available'}
            </h3>
            <p className="text-darkGrey/70 mb-6 max-w-md mx-auto">
              {searchTerm 
                ? 'Try a different search term' 
                : 'Add your first course to get started'}
            </p>
            <Link
              href="/lms/Instructor_Portal/courses/add"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors"
              style={{ 
                backgroundColor: BRAND_COLORS.deepRed,
                color: BRAND_COLORS.white 
              }}
            >
              <Plus className="w-5 h-5" />
              Add Your First Course
            </Link>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/lms/Instructor_Portal/courses/add"
          className="bg-white rounded-lg border border-softGrey p-5 hover:border-darkRoyalBlue transition-colors duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-darkGrey group-hover:text-darkRoyalBlue">
                Add New Course
              </h3>
              <p className="text-sm text-darkGrey/70 mt-1">
                Create a new course with modules, pricing, and details
              </p>
            </div>
            <div className="p-2 rounded-lg group-hover:bg-darkRoyalBlue/10">
              <Plus className="w-5 h-5 text-darkGrey group-hover:text-darkRoyalBlue" />
            </div>
          </div>
        </Link>

        <Link
          href="/lms/Instructor_Portal/courses/modules"
          className="bg-white rounded-lg border border-softGrey p-5 hover:border-darkRoyalBlue transition-colors duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-darkGrey group-hover:text-darkRoyalBlue">
                Manage Modules
              </h3>
              <p className="text-sm text-darkGrey/70 mt-1">
                Add, edit, and organize modules for all courses
              </p>
            </div>
            <div className="p-2 rounded-lg group-hover:bg-darkRoyalBlue/10">
              <FolderPlus className="w-5 h-5 text-darkGrey group-hover:text-darkRoyalBlue" />
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-lg border border-softGrey p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-darkGrey">Quick Stats</h3>
              <p className="text-sm text-darkGrey/70 mt-1">
                {courses.length} courses • {courses.reduce((acc, c) => acc + c.reviews, 0)} reviews
              </p>
            </div>
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.teal}10` }}>
              <Star className="w-5 h-5" style={{ color: BRAND_COLORS.teal }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}