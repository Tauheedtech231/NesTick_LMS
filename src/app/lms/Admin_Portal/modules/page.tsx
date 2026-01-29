'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { 
  HiPlus, HiPencil, HiTrash, HiSearch,
  HiFilter, HiDocumentDownload, HiBookOpen,
  HiClock, HiAcademicCap
} from 'react-icons/hi'

interface Module {
  id: string
  courseId: string
  title: string
  description: string
  duration: string
  credits: number
  order: number
  status: 'active' | 'inactive'
  materials: Array<{ id: string; title: string; url: string }>
  completedStudents?: number
}

interface Course {
  id: string
  title: string
}

export default function ModulesList() {
  const searchParams = useSearchParams()
  const courseId = searchParams.get('course')
  
  const [modules, setModules] = useState<Module[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<string>(courseId || '')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const storedModules = JSON.parse(localStorage.getItem('modules') || '[]')
    const storedCourses = JSON.parse(localStorage.getItem('courses') || '[]')
    
    setModules(storedModules)
    setCourses(storedCourses)
    setLoading(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this module?')) {
      const updatedModules = modules.filter(module => module.id !== id)
      localStorage.setItem('modules', JSON.stringify(updatedModules))
      setModules(updatedModules)
    }
  }

  const filteredModules = modules.filter(module => {
    const matchesSearch = 
      module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCourse = !selectedCourse || module.courseId === selectedCourse
    
    return matchesSearch && matchesCourse
  })

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    return course ? course.title : 'Unknown Course'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Modules Management</h1>
          <p className="text-gray-600 mt-2">Manage course modules and teaching materials ({modules.length} modules)</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={loadData}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Refresh
          </button>
          <Link
            href="/lms/Admin_Portal/modules/add"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all shadow-md"
          >
            <HiPlus className="w-5 h-5 mr-2" />
            Add New Module
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search modules by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Course Filter */}
          <div>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <HiFilter className="w-5 h-5 mr-2 text-gray-600" />
              Filter
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <HiDocumentDownload className="w-5 h-5 mr-2 text-gray-600" />
              Export
            </button>
          </div>
          {selectedCourse && (
            <div className="text-sm text-gray-600">
              Showing modules for: <span className="font-medium">{getCourseName(selectedCourse)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-600">Loading modules...</p>
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white rounded-xl shadow-md">
            <HiBookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No modules found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCourse ? 'Try adjusting your filters' : 'Get started by adding your first module'}
            </p>
            <Link
              href="/lms/Admin_Portal/modules/add"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all"
            >
              <HiPlus className="w-5 h-5 mr-2" />
              Add Module
            </Link>
          </div>
        ) : (
          filteredModules.map((module) => (
            <div key={module.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Module Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <HiBookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{module.title}</h3>
                      <p className="text-sm text-gray-600">Module {module.order}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    module.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {module.status}
                  </span>
                </div>
              </div>

              {/* Module Details */}
              <div className="p-6 space-y-4">
                {/* Course */}
                <div className="flex items-center space-x-3">
                  <HiAcademicCap className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Course</p>
                    <p className="font-medium text-gray-900 truncate">
                      {getCourseName(module.courseId)}
                    </p>
                  </div>
                </div>

                {/* Duration and Credits */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium text-gray-900">{module.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Credits</p>
                    <p className="font-medium text-gray-900">{module.credits}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-gray-900 text-sm line-clamp-3">
                    {module.description}
                  </p>
                </div>

                {/* Teaching Materials */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Teaching Materials</p>
                  <div className="space-y-2">
                    {module.materials && module.materials.length > 0 ? (
                      module.materials.slice(0, 2).map((material) => (
                        <div key={material.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700 truncate">{material.title}</span>
                          <a href={material.url} className="text-purple-600 hover:text-purple-800 text-sm">
                            View
                          </a>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">No materials added</p>
                    )}
                    {module.materials && module.materials.length > 2 && (
                      <p className="text-sm text-gray-500">
                        +{module.materials.length - 2} more materials
                      </p>
                    )}
                  </div>
                </div>

                {/* Completion Stats */}
                {module.completedStudents !== undefined && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Completed by</p>
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{module.completedStudents} students</p>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                          style={{ width: `${Math.min((module.completedStudents / 50) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex space-x-3">
                  <Link
                    href={`/lms/Admin_Portal/modules/edit/${module.id}`}
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm text-center"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(module.id)}
                    className="flex-1 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm"
                  >
                    Delete
                  </button>
                  <Link
                    href={`/lms/Admin_Portal/teaching-materials?module=${module.id}`}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all text-sm text-center"
                  >
                    Materials
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {!loading && modules.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-bold text-gray-900 mb-4">Modules Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Modules</p>
              <p className="text-2xl font-bold text-purple-600">{modules.length}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Active Modules</p>
              <p className="text-2xl font-bold text-green-600">
                {modules.filter(m => m.status === 'active').length}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Courses Covered</p>
              <p className="text-2xl font-bold text-blue-600">
                {new Set(modules.map(m => m.courseId)).size}
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Materials</p>
              <p className="text-2xl font-bold text-amber-600">
                {modules.reduce((sum, module) => sum + (module.materials?.length || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}