'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { HiArrowLeft, HiUpload, HiTrash, HiBookOpen, HiFolder } from 'react-icons/hi'
import Link from 'next/link'

interface TeachingMaterial {
  id: string
  courseId: string
  moduleId: string
  title: string
  description: string
  type: 'document' | 'video' | 'link' | 'other'
  url: string
  fileUrl: string | null
  fileName: string | null
  fileType: string | null
  uploadedAt: string
  size: number
}
/* eslint-disable */

export default function EditTeachingMaterial() {
  const router = useRouter()
  const params = useParams()
  const materialId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [courses, setCourses] = useState<any[]>([])
  const [modules, setModules] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'document' as 'document' | 'video' | 'link' | 'other',
    url: '',
    file: null as File | null
  })

  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [selectedModule, setSelectedModule] = useState<string>('')

  useEffect(() => {
    loadData()
  }, [materialId])

  useEffect(() => {
    // Load modules for selected course
    if (selectedCourse) {
      const storedModules = JSON.parse(localStorage.getItem('modules') || '[]')
      const courseModules = storedModules.filter((m: any) => m.courseId === selectedCourse)
      setModules(courseModules)
    }
  }, [selectedCourse])

  const loadData = () => {
    // Load all modules to find the material
    const allModules = JSON.parse(localStorage.getItem('modules') || '[]')
    let foundMaterial: TeachingMaterial | null = null
    let foundCourseId = ''
    let foundModuleId = ''

    // Search through all modules for the material
    for (const module of allModules) {
      if (module.materials) {
        const material = module.materials.find((m: any) => m.id === materialId)
        if (material) {
          foundMaterial = material
          foundCourseId = module.courseId
          foundModuleId = module.id
          break
        }
      }
    }

    if (!foundMaterial) {
      alert('Teaching material not found!')
      router.push('/lms/Admin_Portal/teaching-materials')
      return
    }

    // Set form data
    setFormData({
      title: foundMaterial.title || '',
      description: foundMaterial.description || '',
      type: foundMaterial.type || 'document',
      url: foundMaterial.url || '',
      file: null
    })

    setSelectedCourse(foundCourseId)
    setSelectedModule(foundModuleId)

    // Load available courses
    const storedCourses = JSON.parse(localStorage.getItem('courses') || '[]')
    setCourses(storedCourses)

    // Load modules for the course
    const courseModules = allModules.filter((m: any) => m.courseId === foundCourseId)
    setModules(courseModules)
    
    setLoading(false)
  }

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
    setSaving(true)

    if (!selectedCourse || !selectedModule) {
      alert('Please select both course and module')
      setSaving(false)
      return
    }

    // Update material in module
    const allModules = JSON.parse(localStorage.getItem('modules') || '[]')
    const updatedModules = allModules.map((module: any) => {
      if (module.id === selectedModule) {
        const updatedMaterials = module.materials?.map((material: any) => 
          material.id === materialId 
            ? {
                ...material,
                title: formData.title,
                description: formData.description,
                type: formData.type,
                url: formData.url || '#',
                updatedAt: new Date().toISOString()
              }
            : material
        )
        return {
          ...module,
          materials: updatedMaterials
        }
      }
      return module
    })

    // Save to localStorage
    localStorage.setItem('modules', JSON.stringify(updatedModules))

    // Show success message
    setTimeout(() => {
      setSaving(false)
      alert('Teaching material updated successfully!')
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/lms/Admin_Portal/teaching-materials"
              className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-2"
            >
              <HiArrowLeft className="w-5 h-5 mr-2" />
              Back to Teaching Materials
            </Link>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded mt-2 animate-pulse"></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Teaching Material</h1>
          <p className="text-gray-600 mt-2">Update teaching material information</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course and Module Selection (Read-only) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course
              </label>
              <div className="flex items-center p-2 bg-gray-50 border border-gray-300 rounded-lg">
                <HiBookOpen className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-900">{getCourseName(selectedCourse)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Module
              </label>
              <div className="flex items-center p-2 bg-gray-50 border border-gray-300 rounded-lg">
                <HiFolder className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-900">{getModuleName(selectedModule)}</span>
              </div>
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

          {/* URL or File Update */}
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
                  Update File (Optional)
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
                            <span>Choose a file</span>
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
                        <p className="text-xs text-gray-400">
                          Leave empty to keep current file
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
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
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Updating...
                  </span>
                ) : (
                  'Update Material'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}