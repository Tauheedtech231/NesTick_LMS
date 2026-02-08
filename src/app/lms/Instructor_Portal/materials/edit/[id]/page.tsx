'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Save, X, Plus, Trash2, FileText, Video, File } from 'lucide-react'
/* eslint-disable */

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

export default function EditMaterialPage() {
  const router = useRouter()
  const params = useParams()
  const materialId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [instructor, setInstructor] = useState<any>(null)
  const [material, setMaterial] = useState<any>(null)
  const [modules, setModules] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    moduleId: '',
    status: 'draft' as 'draft' | 'published',
    tags: [] as string[],
    tagInput: ''
  })

  const [files, setFiles] = useState<any[]>([])

  useEffect(() => {
    const loadData = () => {
      try {
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

        // Load material
        const materials = JSON.parse(localStorage.getItem('instructor_materials') || '[]')
        const foundMaterial = materials.find((m: any) => 
          m.id === materialId && m.instructorId === currentUser.id
        )
        
        if (!foundMaterial) {
          alert('Material not found or you dont have permission to edit it')
          router.push('/lms/Instructor_Portal/materials')
          return
        }

        setMaterial(foundMaterial)
        setFormData({
          title: foundMaterial.title,
          description: foundMaterial.description,
          moduleId: foundMaterial.moduleId || '',
          status: foundMaterial.status,
          tags: foundMaterial.tags || [],
          tagInput: ''
        })
        setFiles(foundMaterial.files || [])

        // Load course modules
        const courses = JSON.parse(localStorage.getItem('lms_courses') || '[]')
        const course = courses.find((c: any) => c.id === currentUser.courseId)
        setModules(course?.modules || [])
        
      } catch (error) {
        console.error('Error loading material:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [materialId, router])

  const addTag = () => {
    if (formData.tagInput.trim() && !formData.tags.includes(formData.tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.tagInput.trim()],
        tagInput: ''
      })
    }
  }

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    })
  }

  const addFile = () => {
    const newFile = {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      type: 'slides',
      url: '',
      size: '0 MB'
    }
    setFiles([...files, newFile])
  }

  const removeFile = (index: number) => {
    if (files.length <= 1) {
      alert('At least one file is required')
      return
    }
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
  }

  const updateFile = (index: number, field: string, value: any) => {
    const newFiles = [...files]
    newFiles[index] = { ...newFiles[index], [field]: value }
    setFiles(newFiles)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('Please enter material title')
      return
    }

    // Check if we have slides
    const hasSlides = files.some(f => f.type === 'slides')
    if (!hasSlides) {
      alert('Slides are mandatory! Please ensure at least one slide file exists.')
      return
    }

    setSaving(true)

    try {
      // Update material in localStorage
      const materials = JSON.parse(localStorage.getItem('instructor_materials') || '[]')
      const updatedMaterials = materials.map((m: any) => {
        if (m.id === materialId) {
          return {
            ...m,
            ...formData,
            files: files,
            moduleTitle: formData.moduleId ? modules.find(mod => mod.id === formData.moduleId)?.title : undefined,
            updatedAt: new Date().toISOString()
          }
        }
        return m
      })
      
      localStorage.setItem('instructor_materials', JSON.stringify(updatedMaterials))

      // Save activity
      const activity = {
        id: `activity_${Date.now()}`,
        type: 'material',
        title: formData.title,
        description: 'Material updated',
        courseId: instructor.courseId,
        instructorId: instructor.id,
        timestamp: new Date().toISOString(),
        action: 'updated',
        metadata: formData
      }

      const existingActivities = JSON.parse(localStorage.getItem('instructor_activities') || '[]')
      const updatedActivities = [...existingActivities, activity]
      localStorage.setItem('instructor_activities', JSON.stringify(updatedActivities))

      alert('Material updated successfully!')
      router.push('/lms/Instructor_Portal/materials')
      
    } catch (error) {
      console.error('Error updating material:', error)
      alert('Failed to update material')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!material) {
    return null
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-lightGrey rounded-xl p-6 border border-softGrey">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                href="/lms/Instructor_Portal/materials"
                className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                  Edit Material
                </h1>
                <p className="text-darkGrey mt-1">
                  Update material details and files
                </p>
              </div>
            </div>
            <div className="text-sm text-darkGrey/70">
              Created: {new Date(material.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: BRAND_COLORS.deepRed }}></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {/* Material Details */}
        <div className="bg-white rounded-lg border border-softGrey p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
            Material Details
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-darkGrey mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-darkGrey mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-darkGrey mb-2">
                  Module (Optional)
                </label>
                <select
                  value={formData.moduleId}
                  onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 bg-white"
                >
                  <option value="">Select Module (Optional)</option>
                  {modules.map((module: any) => (
                    <option key={module.id} value={module.id}>
                      {module.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-darkGrey mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                  className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 bg-white"
                >
                  <option value="draft">Draft (Hidden from students)</option>
                  <option value="published">Published (Visible to students)</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-darkGrey mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={formData.tagInput}
                  onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                  placeholder="Add tags (press Enter)"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-lightGrey text-darkGrey rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-darkGrey/60 hover:text-brightRed"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Files Section */}
        <div className="bg-white rounded-lg border border-softGrey p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
              Files ({files.length})
            </h2>
            <button
              type="button"
              onClick={addFile}
              className="flex items-center gap-2 px-4 py-2 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add File
            </button>
          </div>

          <div className="space-y-4">
            {files.map((file, index) => (
              <div key={index} className="p-4 border border-softGrey rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      file.type === 'slides' ? 'bg-blue-100 text-blue-600' :
                      file.type === 'video' ? 'bg-red-100 text-red-600' :
                      file.type === 'pdf' ? 'bg-amber-100 text-amber-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {file.type === 'slides' ? <FileText className="w-5 h-5" /> :
                       file.type === 'video' ? <Video className="w-5 h-5" /> :
                       file.type === 'pdf' ? <File className="w-5 h-5" /> :
                       <FileText className="w-5 h-5" />}
                    </div>
                    <span className="text-sm font-medium text-darkGrey">
                      File {index + 1} - {file.type.charAt(0).toUpperCase() + file.type.slice(1)}
                    </span>
                  </div>
                  {files.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 text-brightRed hover:bg-brightRed/5 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">
                      File Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={file.name}
                      onChange={(e) => updateFile(index, 'name', e.target.value)}
                      className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">
                      File Type *
                    </label>
                    <select
                      value={file.type}
                      onChange={(e) => updateFile(index, 'type', e.target.value)}
                      className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 bg-white"
                    >
                      <option value="slides">Slides (Mandatory)</option>
                      <option value="video">Video</option>
                      <option value="pdf">PDF</option>
                      <option value="document">Document</option>
                      <option value="image">Image</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">
                      File URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={file.url}
                      onChange={(e) => updateFile(index, 'url', e.target.value)}
                      className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                      placeholder="https://example.com/file.pdf"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Material Stats */}
        <div className="bg-white rounded-lg border border-softGrey p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
            Material Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-lightGrey rounded-lg">
              <div className="text-2xl font-bold text-darkNavy">{files.length}</div>
              <div className="text-sm text-darkGrey/70">Total Files</div>
            </div>
            <div className="text-center p-4 bg-lightGrey rounded-lg">
              <div className="text-2xl font-bold text-darkNavy">
                {files.filter(f => f.type === 'slides').length}
              </div>
              <div className="text-sm text-darkGrey/70">Slides</div>
            </div>
            <div className="text-center p-4 bg-lightGrey rounded-lg">
              <div className="text-2xl font-bold text-darkNavy">
                {files.filter(f => f.type === 'video').length}
              </div>
              <div className="text-sm text-darkGrey/70">Videos</div>
            </div>
            <div className="text-center p-4 bg-lightGrey rounded-lg">
              <div className="text-2xl font-bold text-darkNavy">{material.downloads || 0}</div>
              <div className="text-sm text-darkGrey/70">Downloads</div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-between gap-4">
          <Link
            href={`/lms/Instructor_Portal/materials/view/${materialId}`}
            className="px-6 py-3 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors font-medium"
          >
            View Material
          </Link>
          <div className="flex gap-4">
            <Link
              href="/lms/Instructor_Portal/materials"
              className="px-6 py-3 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: BRAND_COLORS.deepRed,
                color: BRAND_COLORS.white 
              }}
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Update Material
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}