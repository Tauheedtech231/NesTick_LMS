// app/lms/Student_Portal/materials/page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  HiSearch, HiFolder, HiDocument, 
  HiVideoCamera, HiLink, HiDownload,
  HiExternalLink, HiBookOpen, HiAcademicCap,
  HiFilter, HiEye
} from 'react-icons/hi'

interface TeachingMaterial {
  id: string
  courseId: string
  moduleId: string
  title: string
  description: string
  type: 'document' | 'video' | 'link' | 'other'
  url: string
  uploadedAt: string
  size?: number
  instructorName?: string
}

interface Course {
  id: string
  title: string
  code: string
  instructorId?: string
}

interface Module {
  id: string
  courseId: string
  title: string
  materials?: TeachingMaterial[]
}

interface Student {
  id: string
  name: string
  email: string
  courseId?: string
  courseName?: string
  enrolledCourses?: string[]
}

interface Instructor {
  id: string
  name: string
  email: string
  assignedCourseIds: string[]
}

export default function StudentMaterialsPage() {
  const router = useRouter()
  const [materials, setMaterials] = useState<TeachingMaterial[]>([])
  const [filteredMaterials, setFilteredMaterials] = useState<TeachingMaterial[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [student, setStudent] = useState<Student | null>(null)
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if student is logged in
    const studentData = localStorage.getItem('currentStudent')
    
    if (!studentData) {
      router.push('/student-login')
      return
    }

    loadMaterials()
  }, [router])

  const loadMaterials = async () => {
    try {
      setLoading(true)
      
      // Get current student
      const studentData = localStorage.getItem('currentStudent')
      const currentStudent = studentData ? JSON.parse(studentData) : null
      setStudent(currentStudent)

      // Get all students to find enrolled courses
      const allStudents = JSON.parse(localStorage.getItem('students') || '[]')
      const studentDetails = allStudents.find((s: any) => s.id === currentStudent?.id)

      // Get courses
      const storedCourses = JSON.parse(localStorage.getItem('courses') || '[]')
      setCourses(storedCourses)

      // Get instructors
      const storedInstructors = JSON.parse(localStorage.getItem('instructors') || '[]')
      setInstructors(storedInstructors)

      // Get modules
      const storedModules = JSON.parse(localStorage.getItem('modules') || '[]')
      setModules(storedModules)

      // Determine which courses student is enrolled in
      let enrolledCourseIds: string[] = []

      if (studentDetails) {
        // Method 1: Check enrolledCourses array
        if (studentDetails.enrolledCourses && Array.isArray(studentDetails.enrolledCourses)) {
          enrolledCourseIds = studentDetails.enrolledCourses
        }
        // Method 2: Check courseId field
        else if (studentDetails.courseId) {
          enrolledCourseIds = [studentDetails.courseId]
        }
        // Method 3: Check course name matching
        else if (studentDetails.courseName) {
          const course = storedCourses.find((c: any) => 
            c.title?.toLowerCase() === studentDetails.courseName?.toLowerCase() ||
            c.name?.toLowerCase() === studentDetails.courseName?.toLowerCase()
          )
          if (course) enrolledCourseIds = [course.id]
        }
      }

      // Extract materials from modules for enrolled courses only
      const allMaterials: TeachingMaterial[] = []
      
      storedModules.forEach((module: Module) => {
        // Only include materials from enrolled courses
        if (enrolledCourseIds.includes(module.courseId)) {
          if (module.materials && Array.isArray(module.materials)) {
            module.materials.forEach((material: TeachingMaterial) => {
              // Find course
              const course = storedCourses.find((c: any) => c.id === module.courseId)
              // Find instructor for this course
              const instructor = storedInstructors.find((inst: Instructor) => 
                inst.assignedCourseIds && inst.assignedCourseIds.includes(module.courseId)
              )
              
              allMaterials.push({
                ...material,
                courseId: module.courseId,
                moduleId: module.id,
                instructorName: instructor?.name || 'Not Assigned'
              })
            })
          }
        }
      })

      setMaterials(allMaterials)
      setFilteredMaterials(allMaterials)
    } catch (error) {
      console.error('Error loading materials:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter materials
  useEffect(() => {
    let filtered = [...materials]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.instructorName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by course
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(material => material.courseId === selectedCourse)
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(material => material.type === selectedType)
    }

    setFilteredMaterials(filtered)
  }, [searchTerm, selectedCourse, selectedType, materials])

  // Get course name
  const getCourseName = (courseId: string): string => {
    const course = courses.find(c => c.id === courseId)
    return course ? course.title : 'Unknown Course'
  }

  // Get module name
  const getModuleName = (moduleId: string): string => {
    const module = modules.find(m => m.id === moduleId)
    return module ? module.title : 'Unknown Module'
  }

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return <HiDocument className="w-5 h-5 text-blue-600" />
      case 'video': return <HiVideoCamera className="w-5 h-5 text-purple-600" />
      case 'link': return <HiLink className="w-5 h-5 text-green-600" />
      default: return <HiFolder className="w-5 h-5 text-gray-600" />
    }
  }

  // Get type badge color
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'document': return 'bg-blue-100 text-blue-800'
      case 'video': return 'bg-purple-100 text-purple-800'
      case 'link': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return 'Invalid date'
    }
  }

  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Handle material download/view
  const handleMaterialAction = (material: TeachingMaterial) => {
    if (material.type === 'link') {
      window.open(material.url, '_blank')
    } else {
      // For documents and other files, trigger download
      const link = document.createElement('a')
      link.href = material.url
      link.download = material.title
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Get unique courses from materials
  const studentCourses = useMemo(() => {
    const uniqueCourseIds = [...new Set(materials.map(m => m.courseId))]
    return uniqueCourseIds.map(courseId => {
      const course = courses.find(c => c.id === courseId)
      return { id: courseId, name: course?.title || 'Unknown Course' }
    })
  }, [materials, courses])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your study materials...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Study Materials</h1>
            <p className="text-gray-600 mt-2">
              Access all your course materials in one place
              {student && (
                <span className="ml-2 text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                  Student: {student.name}
                </span>
              )}
            </p>
          </div>
          
          {/* Stats */}
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700">{materials.length}</div>
              <div className="text-sm text-gray-500">Total Materials</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">{studentCourses.length}</div>
              <div className="text-sm text-gray-500">Courses</div>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Materials
              </label>
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, description, or instructor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Course Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                <option value="all">All Courses</option>
                {studentCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                <option value="all">All Types</option>
                <option value="document">📄 Documents</option>
                <option value="video">🎬 Videos</option>
                <option value="link">🔗 Links</option>
                <option value="other">📎 Other</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-bold text-gray-900">{filteredMaterials.length}</span> materials
            </div>
            {(searchTerm || selectedCourse !== 'all' || selectedType !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCourse('all')
                  setSelectedType('all')
                }}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Materials List */}
        {filteredMaterials.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <HiBookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No materials found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCourse !== 'all' || selectedType !== 'all'
                ? 'No materials match your search criteria. Try adjusting your filters.'
                : 'You don\'t have any study materials assigned yet.'}
            </p>
            {searchTerm || selectedCourse !== 'all' || selectedType !== 'all' ? (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCourse('all')
                  setSelectedType('all')
                }}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                Show all materials
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                Materials will appear here once your instructor uploads them.
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Materials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material) => (
                <div
                  key={`${material.id}-${material.moduleId}`}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-gray-200"
                >
                  {/* Material Header */}
                  <div className="p-5 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          {getTypeIcon(material.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 truncate" title={material.title}>
                            {material.title}
                          </h3>
                          <div className="mt-2 flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(material.type)}`}>
                              {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
                            </span>
                            {material.instructorName && (
                              <span className="text-xs text-gray-600 truncate" title={`Instructor: ${material.instructorName}`}>
                                👤 {material.instructorName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Material Details */}
                  <div className="p-5 space-y-4">
                    {/* Description */}
                    <div>
                      <p className="text-gray-700 text-sm line-clamp-2">
                        {material.description || 'No description provided'}
                      </p>
                    </div>

                    {/* Course and Module Info */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <HiBookOpen className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate" title={getCourseName(material.courseId)}>
                          {getCourseName(material.courseId)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <HiFolder className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate" title={getModuleName(material.moduleId)}>
                          Module: {getModuleName(material.moduleId)}
                        </span>
                      </div>
                    </div>

                    {/* File Info */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="text-sm text-gray-500">
                        📅 {formatDate(material.uploadedAt)}
                      </div>
                      <div className="text-sm text-gray-500">
                        📦 {formatFileSize(material.size)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-5 py-4 bg-gray-50 border-t border-gray-200">
                    <button
                      onClick={() => handleMaterialAction(material)}
                      className="w-full flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-150 font-medium"
                    >
                      {material.type === 'link' ? (
                        <>
                          <HiExternalLink className="w-4 h-4 mr-2" />
                          View Link
                        </>
                      ) : (
                        <>
                          <HiDownload className="w-4 h-4 mr-2" />
                          Download
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Your Materials Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total Materials</p>
                      <p className="text-2xl font-bold text-blue-700">{materials.length}</p>
                    </div>
                    <HiDocument className="w-8 h-8 text-blue-600 opacity-80" />
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Courses</p>
                      <p className="text-2xl font-bold text-purple-700">{studentCourses.length}</p>
                    </div>
                    <HiBookOpen className="w-8 h-8 text-purple-600 opacity-80" />
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Instructors</p>
                      <p className="text-2xl font-bold text-green-700">
                        {new Set(materials.map(m => m.instructorName)).size}
                      </p>
                    </div>
                    <HiAcademicCap className="w-8 h-8 text-green-600 opacity-80" />
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Latest Update</p>
                      <p className="text-lg font-bold text-amber-700">
                        {materials.length > 0 
                          ? formatDate(materials.sort((a, b) => 
                              new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
                            )[0].uploadedAt)
                          : 'No materials'
                        }
                      </p>
                    </div>
                    <HiFolder className="w-8 h-8 text-amber-600 opacity-80" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}