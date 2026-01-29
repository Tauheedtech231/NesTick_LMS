'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { HiArrowLeft, HiPlus, HiTrash } from 'react-icons/hi'
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid'
/* eslint-disable */

export default function EditModule() {
  const router = useRouter()
  const params = useParams()
  const moduleId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [courses, setCourses] = useState<any[]>([])
  const [materials, setMaterials] = useState<Array<{ id: string; title: string; url: string }>>([])
  
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    duration: '',
    credits: 0,
    order: 1,
    status: 'active' as 'active' | 'inactive'
  })

  const [materialForm, setMaterialForm] = useState({
    title: '',
    url: ''
  })

  useEffect(() => {
    loadData()
  }, [moduleId])

  const loadData = () => {
    // Load module data
    const modules = JSON.parse(localStorage.getItem('modules') || '[]')
    const module = modules.find((m: any) => m.id === moduleId)
    
    if (!module) {
      alert('Module not found!')
      router.push('/lms/Admin_Portal/modules')
      return
    }

    setFormData({
      courseId: module.courseId,
      title: module.title,
      description: module.description,
      duration: module.duration,
      credits: module.credits,
      order: module.order,
      status: module.status
    })

    setMaterials(module.materials || [])

    // Load available courses
    const storedCourses = JSON.parse(localStorage.getItem('courses') || '[]')
    setCourses(storedCourses)
    
    setLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'credits' || name === 'order' ? parseInt(value) || 0 : value
    }))
  }

  const handleMaterialInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setMaterialForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const addMaterial = () => {
    if (materialForm.title && materialForm.url) {
      setMaterials(prev => [...prev, {
        id: uuidv4(),
        ...materialForm
      }])
      setMaterialForm({ title: '', url: '' })
    }
  }

  const removeMaterial = (id: string) => {
    setMaterials(prev => prev.filter(material => material.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    if (!formData.courseId) {
      alert('Please select a course')
      setSaving(false)
      return
    }

    // Update module object
    const updatedModule = {
      id: moduleId,
      ...formData,
      materials,
      updatedAt: new Date().toISOString()
    }

    // Update localStorage
    const modules = JSON.parse(localStorage.getItem('modules') || '[]')
    const updatedModules = modules.map((module: any) =>
      module.id === moduleId ? updatedModule : module
    )
    
    localStorage.setItem('modules', JSON.stringify(updatedModules))

    // Show success message
    setTimeout(() => {
      setSaving(false)
      alert('Module updated successfully!')
      router.push('/lms/Admin_Portal/modules')
    }, 1000)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/lms/Admin_Portal/modules"
              className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-2"
            >
              <HiArrowLeft className="w-5 h-5 mr-2" />
              Back to Modules
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
            href="/lms/Admin_Portal/modules"
            className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-2"
          >
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Back to Modules
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Module</h1>
          <p className="text-gray-600 mt-2">Update module information and teaching materials</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Selection */}
          <div>
            <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-1">
              Select Course *
            </label>
            <select
              id="courseId"
              name="courseId"
              required
              value={formData.courseId}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            {formData.courseId && (
              <p className="text-sm text-gray-500 mt-1">
                Selected: {courses.find(c => c.id === formData.courseId)?.title}
              </p>
            )}
          </div>

          {/* Module Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Module Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., HTML & CSS Fundamentals"
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duration *
              </label>
              <input
                type="text"
                id="duration"
                name="duration"
                required
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., 4 weeks"
              />
            </div>

            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                Module Order *
              </label>
              <input
                type="number"
                id="order"
                name="order"
                required
                min="1"
                value={formData.order}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., 1"
              />
            </div>

            <div>
              <label htmlFor="credits" className="block text-sm font-medium text-gray-700 mb-1">
                Credits *
              </label>
              <input
                type="number"
                id="credits"
                name="credits"
                required
                min="0"
                step="0.5"
                value={formData.credits}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., 10"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Describe what students will learn in this module..."
            />
          </div>

          {/* Teaching Materials */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Teaching Materials</h3>
            
            {/* Add Material Form */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={materialForm.title}
                    onChange={handleMaterialInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., HTML5 Guide.pdf"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL/Link
                  </label>
                  <input
                    type="url"
                    name="url"
                    value={materialForm.url}
                    onChange={handleMaterialInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., https://example.com/guide.pdf"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={addMaterial}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all shadow-md"
              >
                <HiPlus className="w-5 h-5 mr-2" />
                Add Material
              </button>
            </div>

            {/* Materials List */}
            {materials.length > 0 ? (
              <div className="space-y-2">
                {materials.map((material) => (
                  <div key={material.id} className="flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900">{material.title}</span>
                      <div className="text-sm text-gray-600 truncate">{material.url}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMaterial(material.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <HiTrash className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No materials added yet</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              id="status"
              name="status"
              required
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-end space-x-4">
              <Link
                href="/lms/Admin_Portal/modules"
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
                  'Update Module'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}