'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { 
  HiPlus, HiPencil, HiTrash, HiSearch,
  HiFilter, HiDocumentDownload, HiFolder,
  HiBookOpen, HiExternalLink, HiEye,
  HiDocument, HiVideoCamera, HiLink,
  HiQuestionMarkCircle
} from 'react-icons/hi'
import { toast, Toaster } from 'react-hot-toast'

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

export default function TeachingMaterialsList() {
  const searchParams = useSearchParams()
  const courseId = searchParams.get('course')
  const moduleId = searchParams.get('module')
  
  const [materials, setMaterials] = useState<TeachingMaterial[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [allModules, setAllModules] = useState<Module[]>([]) // Store all modules
  const [filteredModules, setFilteredModules] = useState<Module[]>([]) // Store filtered modules
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<string>(courseId || '')
  const [selectedModule, setSelectedModule] = useState<string>(moduleId || '')
  const [selectedType, setSelectedType] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // Load all data from localStorage
  const loadData = useCallback(() => {
    try {
      setLoading(true)
      
      // Load courses
      const storedCourses = JSON.parse(localStorage.getItem('courses') || '[]')
      setCourses(storedCourses)

      // Load modules
      const storedModules = JSON.parse(localStorage.getItem('modules') || '[]')
      setAllModules(storedModules)

      // Extract all materials from modules
      const extractedMaterials: TeachingMaterial[] = []
      storedModules.forEach((module: Module) => {
        if (module.materials && Array.isArray(module.materials)) {
          module.materials.forEach((material: TeachingMaterial) => {
            extractedMaterials.push({
              ...material,
              courseId: module.courseId,
              moduleId: module.id
            })
          })
        }
      })

      setMaterials(extractedMaterials)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load teaching materials')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filter modules when course changes - FIXED: Remove modules from dependency array
  useEffect(() => {
    if (selectedCourse) {
      const courseModules = allModules.filter(m => m.courseId === selectedCourse)
      setFilteredModules(courseModules)
      if (!courseModules.some(m => m.id === selectedModule)) {
        setSelectedModule('')
      }
    } else {
      setFilteredModules(allModules)
    }
  }, [selectedCourse, selectedModule, allModules]) // Use allModules instead of modules

  // Handle module selection when URL has module parameter
  useEffect(() => {
    if (moduleId && allModules.length > 0) {
      const moduleExists = allModules.some(m => m.id === moduleId)
      if (moduleExists) {
        setSelectedModule(moduleId)
        // Find and set the corresponding course
        // eslint-disable-next-line @next/next/no-assign-module-variable
        const module = allModules.find(m => m.id === moduleId)
        if (module) {
          setSelectedCourse(module.courseId)
        }
      }
    }
  }, [moduleId, allModules])

  // Handle course selection when URL has course parameter
  useEffect(() => {
    if (courseId && courses.length > 0) {
      const courseExists = courses.some(c => c.id === courseId)
      if (courseExists) {
        setSelectedCourse(courseId)
      }
    }
  }, [courseId, courses])

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
      loadData() // Reload materials
      toast.success('Material deleted successfully')
    } catch (error) {
      console.error('Error deleting material:', error)
      toast.error('Failed to delete material')
    }
  }

  const getCourseName = (courseId: string): string => {
    const course = courses.find(c => c.id === courseId)
    return course ? course.title : 'Unknown Course'
  }

  const getModuleName = (moduleId: string): string => {
    // eslint-disable-next-line @next/next/no-assign-module-variable
    const module = allModules.find(m => m.id === moduleId)
    return module ? module.title : 'Unknown Module'
  }

  const getTypeIcon = (type: string = 'other') => {
    switch (type.toLowerCase()) {
      case 'document': return <HiDocument className="w-6 h-6 text-blue-600" />
      case 'video': return <HiVideoCamera className="w-6 h-6 text-purple-600" />
      case 'link': return <HiLink className="w-6 h-6 text-green-600" />
      default: return <HiQuestionMarkCircle className="w-6 h-6 text-gray-600" />
    }
  }

  const getTypeColor = (type: string = 'other') => {
    switch (type.toLowerCase()) {
      case 'document': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'video': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'link': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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

  const exportToCSV = () => {
    const headers = ['Title', 'Type', 'Course', 'Module', 'Description', 'URL', 'Uploaded', 'Size']
    const csvData = filteredMaterials.map(material => [
      `"${material.title}"`,
      material.type,
      `"${getCourseName(material.courseId)}"`,
      `"${getModuleName(material.moduleId)}"`,
      `"${material.description || ''}"`,
      `"${material.url}"`,
      formatDate(material.uploadedAt),
      formatFileSize(material.size)
    ])

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `teaching-materials-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Materials exported successfully')
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCourse('')
    setSelectedModule('')
    setSelectedType('')
  }

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Teaching Materials</h1>
              <p className="text-gray-600 mt-2">
                Manage teaching materials for courses and modules 
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {materials.length} materials total
                </span>
              </p>
            </div>
            <Link
              href="/lms/Admin_Portal/teaching-materials/add"
              className="inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 min-w-[140px]"
            >
              <HiPlus className="w-5 h-5 mr-2" />
              Add Material
            </Link>
          </div>

          {/* Search and Filter Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Search */}
              <div className="lg:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Materials
                </label>
                <div className="relative">
                  <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="search"
                    type="text"
                    placeholder="Search by title, description, or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Material Type
                </label>
                <select
                  id="type-filter"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                >
                  <option value="">All Types</option>
                  <option value="document">📄 Documents</option>
                  <option value="video">🎬 Videos</option>
                  <option value="link">🔗 Links</option>
                  <option value="other">📎 Other</option>
                </select>
              </div>
            </div>

            {/* Course and Module Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="course-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Course
                </label>
                <select
                  id="course-filter"
                  value={selectedCourse}
                  onChange={(e) => {
                    setSelectedCourse(e.target.value)
                    setSelectedModule('')
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                >
                  <option value="">All Courses</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title} {course.code && `(${course.code})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="module-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Module
                </label>
                <select
                  id="module-filter"
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white disabled:bg-gray-50 disabled:text-gray-500"
                  disabled={!selectedCourse}
                >
                  <option value="">All Modules</option>
                  {filteredModules
                    .filter(m => !selectedCourse || m.courseId === selectedCourse)
                    .map((module) => (
                      <option key={module.id} value={module.id}>
                        {module.title}
                      </option>
                    ))}
                </select>
                {!selectedCourse && (
                  <p className="mt-1 text-sm text-gray-500">Select a course first to filter modules</p>
                )}
              </div>
            </div>

            {/* Actions and Results Count */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-200 gap-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={clearFilters}
                  className="flex items-center px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
                >
                  <HiFilter className="w-4 h-4 mr-2 text-gray-600" />
                  Clear Filters
                </button>
                <button
                  onClick={exportToCSV}
                  className="flex items-center px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
                >
                  <HiDocumentDownload className="w-4 h-4 mr-2 text-gray-600" />
                  Export CSV
                </button>
              </div>
              <div className="text-sm text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                Showing <span className="font-bold">{filteredMaterials.length}</span> of <span className="font-bold">{materials.length}</span> materials
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
              <p className="mt-4 text-lg text-gray-700 font-medium">Loading teaching materials...</p>
              <p className="mt-1 text-gray-500">Please wait while we fetch your materials</p>
            </div>
          ) : (
            <>
              {/* Materials Grid */}
              {filteredMaterials.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <HiFolder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No materials found</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {searchTerm || selectedCourse || selectedType 
                      ? 'No materials match your current filters. Try adjusting your search criteria.'
                      : 'You haven\'t added any teaching materials yet. Get started by adding your first material.'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href="/lms/Admin_Portal/teaching-materials/add"
                      className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <HiPlus className="w-5 h-5 mr-2" />
                      Add Material
                    </Link>
                    {(searchTerm || selectedCourse || selectedType) && (
                      <button
                        onClick={clearFilters}
                        className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMaterials.map((material) => (
                      <div 
                        key={`${material.id}-${material.moduleId}`} 
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-gray-200"
                      >
                        {/* Material Header */}
                        <div className="p-6 border-b border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className="mt-1">
                                {getTypeIcon(material.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 text-lg truncate" title={material.title}>
                                  {material.title}
                                </h3>
                                <div className="mt-2">
                                  <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full border ${getTypeColor(material.type)}`}>
                                    {material.type ? material.type.charAt(0).toUpperCase() + material.type.slice(1) : 'Other'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Material Details */}
                        <div className="p-6 space-y-5">
                          {/* Description */}
                          <div>
                            <p className="text-gray-700 text-sm line-clamp-3" title={material.description}>
                              {material.description || 'No description provided'}
                            </p>
                          </div>

                          {/* Course & Module Info */}
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <HiBookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-sm text-gray-900 truncate" title={getCourseName(material.courseId)}>
                                Course: {getCourseName(material.courseId)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <HiFolder className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-sm text-gray-900 truncate" title={getModuleName(material.moduleId)}>
                                Module: {getModuleName(material.moduleId)}
                              </span>
                            </div>
                          </div>

                          {/* File Info */}
                          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                            <div>
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Uploaded</p>
                              <p className="text-sm text-gray-900 font-medium">
                                {formatDate(material.uploadedAt)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Size</p>
                              <p className="text-sm text-gray-900 font-medium">
                                {formatFileSize(material.size)}
                              </p>
                            </div>
                          </div>

                          {/* URL/Link Preview */}
                          {material.type === 'link' && material.url && (
                            <div className="pt-3 border-t border-gray-100">
                              <a
                                href={material.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800 font-medium group"
                              >
                                <HiExternalLink className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
                                <span className="truncate max-w-[200px]" title={material.url}>
                                  {material.url.replace(/^https?:\/\//, '')}
                                </span>
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => window.open(material.url || '#', '_blank')}
                              className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-150 text-sm font-medium flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
                              disabled={!material.url}
                              title={material.url ? 'View material' : 'No URL available'}
                            >
                              <HiEye className="w-4 h-4 mr-1.5" />
                              View
                            </button>
                            <Link
                              href={`/lms/Admin_Portal/teaching-materials/edit?id=${material.id}&module=${material.moduleId}`}
                              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-150 text-sm font-medium text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(material.id, material.moduleId, material.title)}
                              className="flex-1 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors duration-150 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Stats */}
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="font-bold text-gray-900 text-lg mb-4">Materials Overview</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 font-medium">Total Materials</p>
                            <p className="text-2xl font-bold text-blue-700 mt-1">{materials.length}</p>
                          </div>
                          <HiFolder className="w-8 h-8 text-blue-600 opacity-80" />
                        </div>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 font-medium">Documents</p>
                            <p className="text-2xl font-bold text-purple-700 mt-1">
                              {materials.filter(m => m.type === 'document').length}
                            </p>
                          </div>
                          <HiDocument className="w-8 h-8 text-purple-600 opacity-80" />
                        </div>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 font-medium">Videos</p>
                            <p className="text-2xl font-bold text-green-700 mt-1">
                              {materials.filter(m => m.type === 'video').length}
                            </p>
                          </div>
                          <HiVideoCamera className="w-8 h-8 text-green-600 opacity-80" />
                        </div>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 font-medium">Courses Covered</p>
                            <p className="text-2xl font-bold text-gray-700 mt-1">
                              {new Set(materials.map(m => m.courseId)).size}
                            </p>
                          </div>
                          <HiBookOpen className="w-8 h-8 text-gray-600 opacity-80" />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}