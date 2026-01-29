'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HiArrowLeft, HiUpload, HiTrash, HiBookOpen, HiFolder } from 'react-icons/hi'
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid'
/* eslint-disable */

export default function AddTeachingMaterial() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState<any[]>([])
  const [modules, setModules] = useState<any[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [selectedModule, setSelectedModule] = useState<string>('')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'document' as 'document' | 'video' | 'link' | 'other',
    url: '',
    file: null as File | null
  })

  useEffect(() => {
    // Load available courses
    const storedCourses = JSON.parse(localStorage.getItem('courses') || '[]')
    setCourses(storedCourses)
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        file,
        title: formData.title || file.name,
        type: getFileType(file.type)
      }))
    }
  }

  const getFileType = (mimeType: string): 'document' | 'video' | 'link' | 'other' => {
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document'
    return 'other'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!selectedCourse || !selectedModule) {
      alert('Please select both course and module')
      setLoading(false)
      return
    }

    // Generate unique ID
    const materialId = uuidv4()
    
    // Create material object
    const newMaterial = {
      id: materialId,
      courseId: selectedCourse,
      moduleId: selectedModule,
      title: formData.title,
      description: formData.description,
      type: formData.type,
      url: formData.url || '#',
      fileUrl: formData.file ? URL.createObjectURL(formData.file) : null,
      fileName: formData.file?.name || null,
      fileType: formData.file?.type || null,
      uploadedAt: new Date().toISOString(),
      size: formData.file?.size || 0
    }

    // Find module and add material
    const allModules = JSON.parse(localStorage.getItem('modules') || '[]')
    const updatedModules = allModules.map((module: any) => {
      if (module.id === selectedModule) {
        return {
          ...module,
          materials: [...(module.materials || []), {
            id: materialId,
            title: formData.title,
            url: formData.url || '#'
          }]
        }
      }
      return module
    })

    // Save to localStorage
    localStorage.setItem('modules', JSON.stringify(updatedModules))

    // Show success message
    setTimeout(() => {
      setLoading(false)
      alert('Teaching material added successfully!')
      router.push('/lms/Admin_Portal/teaching-materials')
    }, 1000)
  }

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    return course ? course.title : 'Unknown Course'
  }

  const getModuleName = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId)
    return module ? module.title : 'Unknown Module'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/lms/Admin_Portal/teaching-materials"
            className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-2"
          >
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Back to Teaching Materials
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Add Teaching Material</h1>
          <p className="text-gray-600 mt-2">Upload teaching materials for courses and modules</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course and Module Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                Select Course *
              </label>
              <select
                id="course"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              {selectedCourse && (
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <HiBookOpen className="w-4 h-4 mr-2" />
                  {getCourseName(selectedCourse)}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="module" className="block text-sm font-medium text-gray-700 mb-1">
                Select Module *
              </label>
              <select
                id="module"
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                disabled={!selectedCourse}
              >
                <option value="">{selectedCourse ? 'Select a module' : 'Select course first'}</option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.title}
                  </option>
                ))}
              </select>
              {selectedModule && (
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <HiFolder className="w-4 h-4 mr-2" />
                  {getModuleName(selectedModule)}
                </div>
              )}
            </div>
          </div>

          {/* Material Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Material Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., HTML5 Complete Guide"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Material Type *
              </label>
              <select
                id="type"
                name="type"
                required
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="document">Document (PDF, Word, etc.)</option>
                <option value="video">Video</option>
                <option value="link">External Link</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Describe what this material contains and how it should be used..."
            />
          </div>

          {/* File Upload or URL */}
          <div>
            {formData.type === 'link' ? (
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                  External URL *
                </label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  required={formData.type === 'link'}
                  value={formData.url}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://example.com/guide.pdf"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload File *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-purple-400 transition-colors">
                  <div className="space-y-1 text-center">
                    {formData.file ? (
                      <div className="space-y-2">
                        <HiFolder className="w-12 h-12 text-purple-400 mx-auto" />
                        <div className="text-sm text-gray-900">
                          {formData.file.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {(formData.file.size / 1024 / 1024).toFixed(2)} MB • {formData.file.type}
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm text-red-600 rounded-lg hover:bg-red-50"
                        >
                          <HiTrash className="w-4 h-4 mr-1" />
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <HiUpload className="w-12 h-12 text-gray-400 mx-auto" />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer rounded-md font-medium text-purple-600 hover:text-purple-500">
                            <span>Upload a file</span>
                            <input
                              type="file"
                              className="sr-only"
                              onChange={handleFileChange}
                              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.mp4,.avi,.mov"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, DOC, PPT, TXT, MP4 up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          {selectedCourse && selectedModule && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <HiFolder className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{formData.title || 'Untitled Material'}</div>
                  <div className="text-sm text-gray-600">
                    {getCourseName(selectedCourse)} • {getModuleName(selectedModule)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Type: {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-end space-x-4">
              <Link
                href="/lms/Admin_Portal/teaching-materials"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || !selectedCourse || !selectedModule}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Uploading...
                  </span>
                ) : (
                  'Add Teaching Material'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}