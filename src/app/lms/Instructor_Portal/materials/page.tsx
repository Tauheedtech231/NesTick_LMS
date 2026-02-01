// app/lms/Instructor_Portal/materials/page.tsx
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  HiPencil, HiTrash, HiSearch,
 HiFolder,
  HiBookOpen, HiExternalLink, 
 HiVideoCamera, HiLink,

  HiCloudUpload, HiChevronDown, 
   HiDocumentText,
  HiCollection
} from 'react-icons/hi'
import { toast, Toaster } from 'react-hot-toast'
/* eslint-disable */

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
  uploadedBy?: string
}

interface Course {
  id: string
  title: string
  code: string
}

interface Module {
  id: string
  courseId: string
  title: string
  materials?: TeachingMaterial[]
}

export default function InstructorMaterialsList() {
  const router = useRouter()
  const [materials, setMaterials] = useState<TeachingMaterial[]>([])
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([])
  const [allModules, setAllModules] = useState<Module[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [selectedModule, setSelectedModule] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [currentInstructor, setCurrentInstructor] = useState<any>(null)
  const [isMounted, setIsMounted] = useState(false) // Add this line

  // Load instructor data and assigned courses
  const loadData = useCallback(() => {
    try {
      setLoading(true)
      
      // Get current logged in instructor
      const userData = localStorage.getItem('currentUser')
      if (userData) {
        const user = JSON.parse(userData)
        setCurrentInstructor(user)
      }

      // Load all courses and modules
      const storedCourses = JSON.parse(localStorage.getItem('courses') || '[]')
      const storedModules = JSON.parse(localStorage.getItem('modules') || '[]')
      setAllModules(storedModules)

      // Get instructor's assigned courses
      const allInstructors = JSON.parse(localStorage.getItem('instructors') || '[]')
      let instructorAssignedCourseIds: string[] = []
      
      if (currentInstructor?.email === 'instructor@gmail.com') {
        // Demo instructor - access to all courses
        setAssignedCourses(storedCourses)
        instructorAssignedCourseIds = storedCourses.map((c: Course) => c.id)
      } else if (currentInstructor?.role === 'instructor') {
        // Real instructor - get assigned courses
        const instructorDetails = allInstructors.find((instr: any) => 
          instr.email === currentInstructor.email || 
          instr.id === currentInstructor.instructorId
        )
        
        if (instructorDetails?.assignedCourseIds) {
          instructorAssignedCourseIds = instructorDetails.assignedCourseIds
          const instructorCourses = storedCourses.filter((course: Course) => 
            instructorAssignedCourseIds.includes(course.id)
          )
          setAssignedCourses(instructorCourses)
        } else {
          setAssignedCourses([])
        }
      }

      // Extract materials only from assigned courses
      const extractedMaterials: TeachingMaterial[] = []
      storedModules.forEach((module: Module) => {
        if (instructorAssignedCourseIds.includes(module.courseId)) {
          if (module.materials && Array.isArray(module.materials)) {
            module.materials.forEach((material: TeachingMaterial) => {
              extractedMaterials.push({
                ...material,
                courseId: module.courseId,
                moduleId: module.id
              })
            })
          }
        }
      })

      setMaterials(extractedMaterials)

    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load teaching materials')
    } finally {
      setLoading(false)
    }
  }, [currentInstructor])

  useEffect(() => {
    setIsMounted(true)
    loadData()
  }, [loadData])

  // Get modules for selected course
  const getModulesForCourse = () => {
    if (!selectedCourse) return []
    return allModules.filter(module => module.courseId === selectedCourse)
  }

  // Filter materials based on search, course, module, and type
  const filteredMaterials = useMemo(() => {
    return materials.filter(material => {
      const matchesSearch = 
        material.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCourse = !selectedCourse || material.courseId === selectedCourse
      const matchesModule = !selectedModule || material.moduleId === selectedModule
      const matchesType = !selectedType || material.type === selectedType
      
      return matchesSearch && matchesCourse && matchesModule && matchesType
    })
  }, [materials, searchTerm, selectedCourse, selectedModule, selectedType])

  const handleDelete = (materialId: string, moduleId: string, materialTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${materialTitle}"?`)) return

    try {
      // Remove material from module
      const updatedAllModules = allModules.map((module: Module) => {
        if (module.id === moduleId) {
          return {
            ...module,
            materials: module.materials?.filter((m: TeachingMaterial) => m.id !== materialId) || []
          }
        }
        return module
      })

      localStorage.setItem('modules', JSON.stringify(updatedAllModules))
      setAllModules(updatedAllModules)
      loadData()
      toast.success('Material deleted successfully')
    } catch (error) {
      console.error('Error deleting material:', error)
      toast.error('Failed to delete material')
    }
  }

  const handleEdit = (materialId: string, moduleId: string) => {
    router.push(`/lms/Instructor_Portal/materials/edit?id=${materialId}&moduleId=${moduleId}`)
  }

  const getCourseName = (courseId: string): string => {
    const course = assignedCourses.find(c => c.id === courseId)
    return course ? course.title : 'Unknown Course'
  }

  const getModuleName = (moduleId: string): string => {
    const module = allModules.find(m => m.id === moduleId)
    return module ? module.title : 'Unknown Module'
  }

  const getTypeIcon = (type: string = 'other') => {
    switch (type.toLowerCase()) {
      case 'document': return <HiDocumentText className="w-5 h-5 text-blue-600" />
      case 'video': return <HiVideoCamera className="w-5 h-5 text-red-600" />
      case 'link': return <HiLink className="w-5 h-5 text-green-600" />
      default: return <HiCollection className="w-5 h-5 text-gray-600" />
    }
  }

  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return 'N/A'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'Invalid date'
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCourse('')
    setSelectedModule('')
    setSelectedType('')
  }

  const getMaterialCountByCourse = (courseId: string) => {
    return materials.filter(m => m.courseId === courseId).length
  }

  // Statistics
  const stats = useMemo(() => ({
    total: materials.length,
    documents: materials.filter(m => m.type === 'document').length,
    videos: materials.filter(m => m.type === 'video').length,
    links: materials.filter(m => m.type === 'link').length,
    other: materials.filter(m => m.type === 'other').length,
    courses: new Set(materials.map(m => m.courseId)).size
  }), [materials])

  // Add this check
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
        }}
      />
      
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
  {/* Header */}
  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Teaching Materials</h1>
      <p className="text-gray-600 mt-1">Manage your course materials</p>
    </div>

    <Link
      href="/lms/Instructor_Portal/materials/add"
      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg flex items-center gap-2 transition-colors"
    >
      <HiCloudUpload className="w-5 h-5" />
      Upload Material
    </Link>
  </div>

  {/* Stats Grid */}
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
  {[
    { label: 'Total', value: stats.total, color: 'text-gray-900', bgFrom: 'from-gray-50', bgTo: 'to-white' },
    { label: 'Documents', value: stats.documents, color: 'text-blue-700', bgFrom: 'from-blue-50', bgTo: 'to-blue-100' },
    { label: 'Videos', value: stats.videos, color: 'text-red-700', bgFrom: 'from-red-50', bgTo: 'to-red-100' },
    { label: 'Links', value: stats.links, color: 'text-green-700', bgFrom: 'from-green-50', bgTo: 'to-green-100' },
    { label: 'Other', value: stats.other, color: 'text-gray-700', bgFrom: 'from-gray-50', bgTo: 'to-gray-100' },
    { label: 'Courses', value: stats.courses, color: 'text-purple-700', bgFrom: 'from-purple-50', bgTo: 'to-purple-100' },
  ].map((stat) => (
    <div
      key={stat.label}
      className={`bg-gradient-to-br ${stat.bgFrom} ${stat.bgTo} border border-gray-200 rounded-2xl p-5 flex flex-col items-start shadow-md hover:shadow-lg transform hover:scale-[1.03] transition-all duration-200`}
    >
      <p className="text-sm font-semibold text-gray-600">{stat.label}</p>
      <p className={`text-2xl font-bold ${stat.color} mt-2`}>{stat.value}</p>
    </div>
  ))}
</div>

</div>


          {/* Filters */}
          <div className="bg-white border border-gray-300 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search materials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Course Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <div className="relative">
                  <select
                    value={selectedCourse}
                    onChange={(e) => {
                      setSelectedCourse(e.target.value)
                      setSelectedModule('')
                    }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Courses</option>
                    {assignedCourses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title} ({course.code})
                      </option>
                    ))}
                  </select>
                  <HiChevronDown className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Module Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Module
                </label>
                <div className="relative">
                  <select
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                    disabled={!selectedCourse}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="">All Modules</option>
                    {getModulesForCourse().map((module) => (
                      <option key={module.id} value={module.id}>
                        {module.title}
                      </option>
                    ))}
                  </select>
                  <HiChevronDown className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <div className="relative">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="document">Document</option>
                    <option value="video">Video</option>
                    <option value="link">Link</option>
                    <option value="other">Other</option>
                  </select>
                  <HiChevronDown className="absolute right-3 top-2.5 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-300">
              <div className="text-sm text-gray-600">
                Showing {filteredMaterials.length} of {materials.length} materials
              </div>
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="bg-white border border-gray-300 rounded-lg p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mb-4"></div>
              <p className="text-gray-700">Loading teaching materials...</p>
            </div>
          ) : assignedCourses.length === 0 ? (
            <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
              <HiBookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Assigned Courses</h3>
              <p className="text-gray-600 mb-4">
                You haven't been assigned any courses yet.
              </p>
            </div>
          ) : (
            <>
              {/* Materials Grid */}
              {filteredMaterials.length === 0 ? (
                <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
                  <HiFolder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No materials found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || selectedCourse || selectedType 
                      ? 'No materials match your filters.'
                      : 'No materials uploaded yet.'}
                  </p>
                  <Link
                    href="/lms/Instructor_Portal/materials/add"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    <HiCloudUpload className="w-5 h-5" />
                    Upload First Material
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMaterials.map((material) => (
                    <div 
                      key={material.id} 
                      className="bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                    >
                      {/* Header */}
                      <div className="p-4 border-b border-gray-300">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              {getTypeIcon(material.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 truncate" title={material.title}>
                                {material.title}
                              </h3>
                              <p className="text-sm text-gray-600 capitalize">{material.type}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-4 space-y-4">
                        {/* Description */}
                        {material.description && (
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {material.description}
                          </p>
                        )}

                        {/* Course & Module */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <HiBookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-700 truncate" title={getCourseName(material.courseId)}>
                              {getCourseName(material.courseId)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <HiFolder className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-700 truncate" title={getModuleName(material.moduleId)}>
                              {getModuleName(material.moduleId)}
                            </span>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                          <div>
                            <p className="text-xs text-gray-500">Uploaded</p>
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(material.uploadedAt)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Size</p>
                            <p className="text-sm font-medium text-gray-900">
                              {formatFileSize(material.size)}
                            </p>
                          </div>
                        </div>

                        {/* URL for links */}
                        {material.type === 'link' && material.url && (
                          <div className="pt-3 border-t border-gray-200">
                            <a
                              href={material.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                            >
                              <HiExternalLink className="w-4 h-4" />
                              <span className="truncate">{material.url.replace(/^https?:\/\//, '')}</span>
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="p-4 border-t border-gray-300 bg-gray-50">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(material.id, material.moduleId)}
                            className="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <HiPencil className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(material.id, material.moduleId, material.title)}
                            className="flex-1 px-3 py-2 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <HiTrash className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}