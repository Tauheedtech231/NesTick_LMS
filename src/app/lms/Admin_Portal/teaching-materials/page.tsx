'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { 
  HiPlus, HiPencil, HiTrash, HiSearch,
  HiFilter, HiDocumentDownload, HiFolder,
  HiBookOpen, HiExternalLink, HiEye
} from 'react-icons/hi'
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
}

export default function TeachingMaterialsList() {
  const searchParams = useSearchParams()
  const courseId = searchParams.get('course')
  const moduleId = searchParams.get('module')
  
  const [materials, setMaterials] = useState<TeachingMaterial[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [modules, setModules] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<string>(courseId || '')
  const [selectedModule, setSelectedModule] = useState<string>(moduleId || '')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Load modules for selected course
    if (selectedCourse) {
      const storedModules = JSON.parse(localStorage.getItem('modules') || '[]')
      const courseModules = storedModules.filter((m: any) => m.courseId === selectedCourse)
      setModules(courseModules)
    } else {
      setModules([])
    }
  }, [selectedCourse])

  const loadData = () => {
    // Load all materials from modules
    const allModules = JSON.parse(localStorage.getItem('modules') || '[]')
    const allMaterials: TeachingMaterial[] = []

    allModules.forEach((module: any) => {
      if (module.materials) {
        module.materials.forEach((material: any) => {
          allMaterials.push({
            ...material,
            courseId: module.courseId,
            moduleId: module.id
          })
        })
      }
    })

    setMaterials(allMaterials)

    // Load available courses
    const storedCourses = JSON.parse(localStorage.getItem('courses') || '[]')
    setCourses(storedCourses)
    
    setLoading(false)
  }

  const handleDelete = (materialId: string, moduleId: string) => {
    if (confirm('Are you sure you want to delete this teaching material?')) {
      // Remove material from module
      const allModules = JSON.parse(localStorage.getItem('modules') || '[]')
      const updatedModules = allModules.map((module: any) => {
        if (module.id === moduleId) {
          return {
            ...module,
            materials: module.materials?.filter((m: any) => m.id !== materialId) || []
          }
        }
        return module
      })

      localStorage.setItem('modules', JSON.stringify(updatedModules))
      loadData() // Refresh the list
    }
  }

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = 
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCourse = !selectedCourse || material.courseId === selectedCourse
    const matchesModule = !selectedModule || material.moduleId === selectedModule
    
    return matchesSearch && matchesCourse && matchesModule
  })

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    return course ? course.title : 'Unknown Course'
  }

  const getModuleName = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId)
    return module ? module.title : 'Unknown Module'
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return '📄'
      case 'video': return '🎬'
      case 'link': return '🔗'
      default: return '📎'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'document': return 'bg-blue-100 text-blue-800'
      case 'video': return 'bg-purple-100 text-purple-800'
      case 'link': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Teaching Materials</h1>
          <p className="text-gray-600 mt-2">Manage teaching materials for courses and modules ({materials.length} materials)</p>
        </div>
        <Link
          href="/lms/Admin_Portal/teaching-materials/add"
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all shadow-md"
        >
          <HiPlus className="w-5 h-5 mr-2" />
          Add Material
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search materials by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="">All Types</option>
              <option value="document">Documents</option>
              <option value="video">Videos</option>
              <option value="link">Links</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Course and Module Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value)
                setSelectedModule('')
              }}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Module
            </label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={!selectedCourse}
            >
              <option value="">All Modules</option>
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
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
          <div className="text-sm text-gray-600">
            Showing {filteredMaterials.length} of {materials.length} materials
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-600">Loading materials...</p>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white rounded-xl shadow-md">
            <HiFolder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No materials found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCourse ? 'Try adjusting your filters' : 'Get started by adding your first teaching material'}
            </p>
            <Link
              href="/lms/Admin_Portal/teaching-materials/add"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all"
            >
              <HiPlus className="w-5 h-5 mr-2" />
              Add Material
            </Link>
          </div>
        ) : (
          filteredMaterials.map((material) => (
            <div key={material.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Material Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getTypeIcon(material.type)}</div>
                    <div>
                      <h3 className="font-bold text-gray-900">{material.title}</h3>
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(material.type)}`}>
                        {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Material Details */}
              <div className="p-6 space-y-4">
                {/* Description */}
                <div>
                  <p className="text-gray-900 text-sm line-clamp-3">
                    {material.description || 'No description provided'}
                  </p>
                </div>

                {/* Course & Module Info */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <HiBookOpen className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {getCourseName(material.courseId)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <HiFolder className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {getModuleName(material.moduleId)}
                    </span>
                  </div>
                </div>

                {/* File Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Uploaded</p>
                    <p className="text-sm text-gray-900">
                      {new Date(material.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Size</p>
                    <p className="text-sm text-gray-900">{formatFileSize(material.size)}</p>
                  </div>
                </div>

                {/* URL/Link */}
                {material.type === 'link' && (
                  <div className="pt-2 border-t border-gray-200">
                    <a
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800"
                    >
                      <HiExternalLink className="w-4 h-4 mr-1" />
                      Open Link
                    </a>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex space-x-3">
                  <button
                    onClick={() => window.open(material.url || '#', '_blank')}
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm text-center flex items-center justify-center"
                  >
                    <HiEye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  <Link
                    href={`/lms/Admin_Portal/teaching-materials/edit/${material.id}`}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all text-sm text-center"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(material.id, material.moduleId)}
                    className="flex-1 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {!loading && materials.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-bold text-gray-900 mb-4">Materials Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Materials</p>
              <p className="text-2xl font-bold text-blue-600">{materials.length}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Documents</p>
              <p className="text-2xl font-bold text-purple-600">
                {materials.filter(m => m.type === 'document').length}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Videos</p>
              <p className="text-2xl font-bold text-green-600">
                {materials.filter(m => m.type === 'video').length}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Courses Covered</p>
              <p className="text-2xl font-bold text-gray-600">
                {new Set(materials.map(m => m.courseId)).size}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}