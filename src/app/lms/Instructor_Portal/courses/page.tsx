// lms/Instructor_Portal/courses/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  ChevronDown,
  SlidersHorizontal,
  FileVideo,
  PlayCircle,
  FileText
} from 'lucide-react'

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

// Published courses data with course images
const publishedCourses = [
  {
    id: 'pipe-fitter',
    title: 'Pipe Fitter',
    description: 'Master industrial pipe fitting techniques with hands-on training on cutting, threading, and installation following international standards.',
    studentCapacity: 20,
    category: 'Technical Training',
    status: 'published',
    instructorId: 'system',
    instructorName: 'System Instructor',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    isPublished: true,
    courseImage: "https://images.pexels.com/photos/6124242/pexels-photo-6124242.jpeg",
    duration: '8 Weeks',
    level: 'Beginner to Advanced',
    price: 'PKR 25,000'
  },
  {
    id: 'safety-inspector',
    title: 'Safety Inspector',
    description: 'Professional safety inspection training for construction and industrial environments with OSHA certification preparation.',
    studentCapacity: 15,
    category: 'Safety Training',
    status: 'published',
    instructorId: 'system',
    instructorName: 'System Instructor',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    isPublished: true,
    courseImage: "https://images.pexels.com/photos/34082713/pexels-photo-34082713.jpeg",
    duration: '6 Weeks',
    level: 'Intermediate',
    price: 'PKR 30,000'
  },
  {
    id: 'welding',
    title: 'Professional Welding',
    description: 'Comprehensive welding training covering MIG, TIG, and Arc welding techniques for industrial applications.',
    studentCapacity: 12,
    category: 'Technical Training',
    status: 'published',
    instructorId: 'system',
    instructorName: 'System Instructor',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    isPublished: true,
    courseImage: "https://images.pexels.com/photos/7650512/pexels-photo-7650512.jpeg",
    duration: '10 Weeks',
    level: 'Beginner to Professional',
    price: 'PKR 35,000'
  }
];

interface Course {
  id: string;
  title: string;
  description: string;
  studentCapacity: number;
  category: string;
  status: 'draft' | 'published';
  instructorId: string;
  instructorName: string;
  instructorImage?: string;
  createdAt: string;
  updatedAt: string;
  isPublished?: boolean;
  courseImage?: string;
  duration?: string;
  level?: string;
  price?: string;
}

interface Slide {
  id: string;
  courseId: string;
  slideNumber: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface SlideContent {
  slideId: string;
  courseId: string;
  files: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    publicId: string;
    uploadedAt: string;
  }[];
}
/* eslint-disable */

interface Quiz {
  slideId: string;
  courseId: string;
  questions: any[];
}

interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  totalMarks: number;
  passingMarks: number;
  file?: {
    name: string;
    type: string;
    size: number;
    url: string;
    publicId: string;
    uploadedAt: string;
  };
  status: 'published' | 'draft';
  createdAt: string;
  updatedAt: string;
}
/* eslint-disable */

export default function CoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [instructor, setInstructor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [courseStats, setCourseStats] = useState<{
    [key: string]: {
      slides: number, 
      files: number, 
      quizzes: number,
      assignments: number
    }
  }>({})
  const [showPublished, setShowPublished] = useState(true)

  useEffect(() => {
    loadInstructorData()
  }, [])

  useEffect(() => {
    filterCourses()
  }, [searchTerm, statusFilter, courses, showPublished])

  const loadInstructorData = () => {
    try {
      // Get current instructor
      const currentUserStr = localStorage.getItem('currentUser')
      if (!currentUserStr) {
        router.push('/lms/auth/login?type=instructor')
        return
      }

      const currentUser = JSON.parse(currentUserStr)
      if (currentUser.role !== 'instructor') {
        router.push('/lms/auth/login?type=instructor')
        return
      }

      setInstructor(currentUser)

      // Load courses from localStorage for this instructor
      const allCourses = JSON.parse(localStorage.getItem('courses') || '[]')
      const instructorCourses = allCourses.filter((c: Course) => 
        c.instructorId === currentUser.id || c.instructorName === currentUser.name
      ).map((c: any) => ({
        ...c,
        courseImage: c.image || c.courseImage,
      }))
      
      // Combine with published courses if enabled
      let allAvailableCourses = [...instructorCourses]
      
      if (showPublished) {
        allAvailableCourses = [...publishedCourses, ...instructorCourses]
      }
      
      setCourses(allAvailableCourses)
      setFilteredCourses(allAvailableCourses)
      
      // Load stats for each course
      loadCourseStats(allAvailableCourses)
      
      // Initialize published course data if not exists
      initializePublishedCourseData()
      
    } catch (error) {
      console.error('Error loading courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const initializePublishedCourseData = () => {
    // Check if published courses have slides initialized
    publishedCourses.forEach(course => {
      const existingSlides = JSON.parse(localStorage.getItem('slides') || '[]')
      const courseSlides = existingSlides.filter((s: Slide) => s.courseId === course.id)
      
      if (courseSlides.length === 0) {
        // Create default slides for published courses
        const defaultSlides = [
          {
            id: `${course.id}_slide_1`,
            courseId: course.id,
            slideNumber: 1,
            title: 'Introduction',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: `${course.id}_slide_2`,
            courseId: course.id,
            slideNumber: 2,
            title: 'Fundamentals',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: `${course.id}_slide_3`,
            courseId: course.id,
            slideNumber: 3,
            title: 'Advanced Concepts',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
        
        const updatedSlides = [...existingSlides, ...defaultSlides]
        localStorage.setItem('slides', JSON.stringify(updatedSlides))
      }
    })
  }

  const loadCourseStats = (courses: Course[]) => {
    const slides = JSON.parse(localStorage.getItem('slides') || '[]')
    const slideContent = JSON.parse(localStorage.getItem('slideContent') || '[]')
    const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
    const assignments = JSON.parse(localStorage.getItem('assignments') || '[]')
    
    const stats: {[key: string]: {slides: number, files: number, quizzes: number, assignments: number}} = {}
    
    courses.forEach(course => {
      const courseSlides = slides.filter((s: Slide) => s.courseId === course.id)
      const courseSlideIds = courseSlides.map((s: Slide) => s.id)
      
      const courseFiles = slideContent.filter((sc: SlideContent) => 
        courseSlideIds.includes(sc.slideId)
      ).reduce((acc: number, sc: SlideContent) => acc + (sc.files?.length || 0), 0)
      
      const courseQuizzes = quizzes.filter((q: Quiz) => 
        courseSlideIds.includes(q.slideId)
      ).reduce((acc: number, q: Quiz) => acc + (q.questions?.length || 0), 0)

      const courseAssignments = assignments.filter((a: Assignment) => 
        a.courseId === course.id
      ).length
      
      stats[course.id] = {
        slides: courseSlides.length,
        files: courseFiles,
        quizzes: courseQuizzes,
        assignments: courseAssignments
      }
    })
    
    setCourseStats(stats)
  }

  const filterCourses = () => {
    let filtered = [...courses]
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(course => course.status === statusFilter)
    }
    
    setFilteredCourses(filtered)
  }

  const handleDeleteCourse = (courseId: string, isPublished?: boolean) => {
    if (isPublished) {
      alert('Published courses cannot be deleted. You can hide them using the toggle switch.')
      return
    }
    
    if (!confirm('Are you sure you want to delete this course? All slides, content, quizzes, and assignments will be permanently removed.')) {
      return
    }
    
    // Delete course
    const updatedCourses = courses.filter(c => c.id !== courseId)
    localStorage.setItem('courses', JSON.stringify(updatedCourses.filter(c => !c.isPublished)))
    
    // Delete associated slides
    const slides = JSON.parse(localStorage.getItem('slides') || '[]')
    const updatedSlides = slides.filter((s: Slide) => s.courseId !== courseId)
    localStorage.setItem('slides', JSON.stringify(updatedSlides))
    
    // Delete associated slide content
    const slideContent = JSON.parse(localStorage.getItem('slideContent') || '[]')
    const updatedContent = slideContent.filter((sc: SlideContent) => sc.courseId !== courseId)
    localStorage.setItem('slideContent', JSON.stringify(updatedContent))
    
    // Delete associated quizzes
    const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
    const updatedQuizzes = quizzes.filter((q: Quiz) => q.courseId !== courseId)
    localStorage.setItem('quizzes', JSON.stringify(updatedQuizzes))
    
    // Delete associated assignments
    const assignments = JSON.parse(localStorage.getItem('assignments') || '[]')
    const updatedAssignments = assignments.filter((a: Assignment) => a.courseId !== courseId)
    localStorage.setItem('assignments', JSON.stringify(updatedAssignments))
    
    setCourses(updatedCourses)
  }

  const getStatusBadge = (status: string, isPublished?: boolean) => {
    if (isPublished) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <PlayCircle className="w-3 h-3" />
          Published
        </span>
      )
    }
    
    if (status === 'published') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3" />
          Published
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        <XCircle className="w-3 h-3" />
        Draft
      </span>
    )
  }

  const handleManageSlides = (courseId: string) => {
    router.push(`/lms/Instructor_Portal/courses/edit/${courseId}?tab=slides`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 w-48 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-48 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-lightGrey rounded-xl p-4 sm:p-6 border border-softGrey">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                My Courses
              </h1>
              <p className="text-darkGrey mt-1 text-sm">
                Manage your courses, slides, content, and assignments
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Toggle for showing/hiding published courses */}
              <label className="flex items-center gap-2 text-sm">
                <span className="text-darkGrey/70">Show Published</span>
                <button
                  onClick={() => setShowPublished(!showPublished)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    showPublished ? 'bg-teal-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showPublished ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
              <Link
                href="/lms/Instructor_Portal/courses/add"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{ 
                  backgroundColor: BRAND_COLORS.deepRed,
                  color: BRAND_COLORS.white 
                }}
              >
                <Plus className="w-4 h-4" />
                Create New Course
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="mb-6">
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-darkGrey/40" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 text-sm"
              />
            </div>
            
            {/* Filter and view section */}
            <div className="flex items-center gap-2">
              {/* Filter Button - Mobile */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden px-3 py-2 border border-softGrey rounded-lg flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-sm">Filter</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Status Filter - Desktop */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="hidden sm:block px-3 py-2 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue text-sm bg-white"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
          
          {/* Mobile Filters */}
          {showFilters && (
            <div className="mt-4 sm:hidden">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue text-sm bg-white"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Courses Table */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-lg border border-softGrey p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.softGrey }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
            No Courses Found
          </h3>
          <p className="text-darkGrey/70 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Get started by creating your first course'}
          </p>
          {(searchTerm || statusFilter !== 'all') ? (
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
              }}
              className="px-4 py-2 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors"
            >
              Clear Filters
            </button>
          ) : (
            <Link
              href="/lms/Instructor_Portal/courses/add"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{ 
                backgroundColor: BRAND_COLORS.deepRed,
                color: BRAND_COLORS.white 
              }}
            >
              <Plus className="w-4 h-4" />
              Create First Course
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-softGrey overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue }}>
                <tr>
                  <th className="text-left text-xs font-medium py-3 px-4 text-white">Course</th>
                  <th className="text-left text-xs font-medium py-3 px-4 text-white">Status</th>
                  <th className="text-left text-xs font-medium py-3 px-4 text-white">Slides</th>
                  <th className="text-left text-xs font-medium py-3 px-4 text-white">Files</th>
                  <th className="text-left text-xs font-medium py-3 px-4 text-white">Quizzes</th>
                  <th className="text-left text-xs font-medium py-3 px-4 text-white">Assignments</th>
                  <th className="text-left text-xs font-medium py-3 px-4 text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-softGrey">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-lightGrey/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {/* Course Image - Show for all courses with fallback */}
                        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-softGrey">
                          {course.courseImage ? (
                            <img 
                              src={course.courseImage} 
                              alt={course.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-5 h-5" style="color: #1E3A8A" ...></div>';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-5 h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-darkGrey text-sm">{course.title}</p>
                          <p className="text-xs text-darkGrey/60 line-clamp-1">{course.description}</p>
                          {course.duration && course.level && (
                            <p className="text-xs text-purple-600 mt-1">{course.duration} • {course.level}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(course.status, course.isPublished)}
                    </td>
                    <td className="py-3 px-4 text-sm text-darkGrey">
                      {courseStats[course.id]?.slides || 0}
                    </td>
                    <td className="py-3 px-4 text-sm text-darkGrey">
                      {courseStats[course.id]?.files || 0}
                    </td>
                    <td className="py-3 px-4 text-sm text-darkGrey">
                      {courseStats[course.id]?.quizzes || 0}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" style={{ color: BRAND_COLORS.teal }} />
                        <span className="text-sm text-darkGrey">
                          {courseStats[course.id]?.assignments || 0}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleManageSlides(course.id)}
                          className="p-1.5 hover:bg-lightGrey rounded-lg transition-colors"
                          title="Manage Slides"
                        >
                          <FileVideo className="w-4 h-4" style={{ color: BRAND_COLORS.teal }} />
                        </button>
                        {!course.isPublished && (
                          <Link
                            href={`/lms/Instructor_Portal/courses/edit/${course.id}`}
                            className="p-1.5 hover:bg-lightGrey rounded-lg transition-colors"
                            title="Edit Course"
                          >
                            <Edit className="w-4 h-4" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                          </Link>
                        )}
                        <Link
                          href={`/lms/Instructor_Portal/courses/preview/${course.id}`}
                          className="p-1.5 hover:bg-lightGrey rounded-lg transition-colors"
                          title="Preview Course"
                        >
                          <Eye className="w-4 h-4" style={{ color: BRAND_COLORS.teal }} />
                        </Link>
                        <button
                          onClick={() => handleDeleteCourse(course.id, course.isPublished)}
                          className="p-1.5 hover:bg-lightGrey rounded-lg transition-colors"
                          title={course.isPublished ? "Published courses cannot be deleted" : "Delete Course"}
                        >
                          <Trash2 className="w-4 h-4" style={{ color: course.isPublished ? BRAND_COLORS.softGrey : BRAND_COLORS.brightRed }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {filteredCourses.length > 0 && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white rounded-lg border border-softGrey p-3">
            <p className="text-xs text-darkGrey/60">Total Courses</p>
            <p className="text-lg font-semibold text-darkGrey">{filteredCourses.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-softGrey p-3">
            <p className="text-xs text-darkGrey/60">Published</p>
            <p className="text-lg font-semibold text-darkGrey">
              {filteredCourses.filter(c => c.status === 'published' || c.isPublished).length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-softGrey p-3">
            <p className="text-xs text-darkGrey/60">Drafts</p>
            <p className="text-lg font-semibold text-darkGrey">
              {filteredCourses.filter(c => c.status === 'draft').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-softGrey p-3">
            <p className="text-xs text-darkGrey/60">System Courses</p>
            <p className="text-lg font-semibold text-darkGrey">
              {filteredCourses.filter(c => c.isPublished).length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-softGrey p-3">
            <p className="text-xs text-darkGrey/60">Total Assignments</p>
            <p className="text-lg font-semibold text-darkGrey">
              {Object.values(courseStats).reduce((sum, stat) => sum + (stat.assignments || 0), 0)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}