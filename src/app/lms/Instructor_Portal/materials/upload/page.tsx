'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Upload, 
  FileText, 
  Video, 
  File, 
  
  AlertCircle,
  CheckCircle,
  ArrowLeft
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

interface FileItem {
  id: string;
  name: string;
  type: 'slides' | 'video' | 'pdf' | 'document' | 'image' | 'other';
  url: string;
  size?: string;
  file?: File;
}
/* eslint-disable */

export default function UploadMaterialsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [instructor, setInstructor] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  const [modules, setModules] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    moduleId: '',
    status: 'draft' as 'draft' | 'published',
    type: 'slides' as 'slides' | 'video' | 'pdf' | 'document' | 'image' | 'other',
    tags: [] as string[],
    tagInput: ''
  })

  const [files, setFiles] = useState<FileItem[]>([
    {
      id: `file_${Date.now()}`,
      name: '',
      type: 'slides',
      url: '',
      size: '0 MB'
    }
  ])

  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({})

  useEffect(() => {
    const loadInstructorData = () => {
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

        // Load assigned courses
        const courses = JSON.parse(localStorage.getItem('courses') || '[]')
        const courseId = currentUser.courseId || currentUser.assignedCourseId
        const assignedCourse = courses.find((c: any) => c.id === courseId)
        
        if (assignedCourse) {
          setCourse(assignedCourse)

          // Load modules for this course
          const courseModules = assignedCourse.modules || []
          setModules(courseModules)
        }
        
      } catch (error) {
        console.error('Error loading instructor data:', error)
      }
    }

    loadInstructorData()
  }, [router])

  const addFile = (type: FileItem['type'] = 'slides') => {
    const newFile: FileItem = {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      type: type,
      url: '',
      size: '0 MB'
    }
    setFiles([...files, newFile])
  }

  const removeFile = (id: string) => {
    if (files.length <= 1) {
      setFiles([{
        id: `file_${Date.now()}`,
        name: '',
        type: 'slides',
        url: '',
        size: '0 MB'
      }])
      return
    }
    const newFiles = files.filter(f => f.id !== id)
    setFiles(newFiles)
  }

  const updateFile = (id: string, field: keyof FileItem, value: any) => {
    const newFiles = files.map(f => {
      if (f.id === id) {
        return { ...f, [field]: value }
      }
      return f
    })
    setFiles(newFiles)
  }

  const handleFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileType = getFileType(file.name)
    updateFile(id, 'name', file.name)
    updateFile(id, 'type', fileType)
    updateFile(id, 'file', file)
    updateFile(id, 'size', `${(file.size / (1024 * 1024)).toFixed(2)} MB`)

    // Simulate upload progress
    simulateUpload(id)
  }

  const getFileType = (fileName: string): FileItem['type'] => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    
    if (ext === 'pdf') return 'pdf'
    if (['ppt', 'pptx', 'key'].includes(ext || '')) return 'slides'
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext || '')) return 'video'
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext || '')) return 'image'
    if (['doc', 'docx', 'txt', 'rtf'].includes(ext || '')) return 'document'
    return 'other'
  }

  const simulateUpload = (fileId: string) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setUploadProgress(prev => ({ ...prev, [fileId]: progress }))
      
      if (progress >= 100) {
        clearInterval(interval)
        updateFile(fileId, 'url', `https://example.com/uploads/${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
      }
    }, 200)
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // All fields are optional - minimum validation
    if (files.length === 0) {
      alert('Please add at least one file')
      return
    }

    setLoading(true)

    try {
      // Create material object with optional fields
      const materialId = `material_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const newMaterial = {
        id: materialId,
        title: formData.title || 'Untitled Materials',
        description: formData.description || '',
        courseId: course?.id || '',
        courseTitle: course?.title || 'General',
        moduleId: formData.moduleId || undefined,
        moduleTitle: formData.moduleId ? modules.find(m => m.id === formData.moduleId)?.title : undefined,
        instructorId: instructor?.id,
        instructorName: instructor?.name,
        type: files[0]?.type || 'other',
        files: files.map(f => ({
          name: f.name || 'Unnamed file',
          url: f.url || '',
          type: f.type,
          size: f.size || '0 MB'
        })),
        tags: formData.tags,
        status: formData.status,
        downloads: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Save to localStorage
      const existingMaterials = JSON.parse(localStorage.getItem('instructor_materials') || '[]')
      const updatedMaterials = [...existingMaterials, newMaterial]
      localStorage.setItem('instructor_materials', JSON.stringify(updatedMaterials))

      alert(`Materials ${formData.status === 'published' ? 'published' : 'saved as draft'} successfully!`)
      router.push('/lms/Instructor_Portal/materials')
      
    } catch (error) {
      console.error('Error uploading materials:', error)
      alert('Failed to upload materials')
    } finally {
      setLoading(false)
    }
  }

  if (!instructor) {
    return (
      <div className="min-h-screen bg-white p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-darkRoyalBlue border-softGrey rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-darkGrey">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      {/* Mobile Header */}
      <div className="md:hidden mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/lms/Instructor_Portal/materials"
            className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
              Upload Materials
            </h1>
            {course && (
              <p className="text-sm text-darkGrey mt-1 truncate">
                {course.title}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block mb-8">
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
                  Upload Materials
                </h1>
                {course && (
                  <p className="text-darkGrey mt-1">
                    For: {course.title}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: BRAND_COLORS.deepRed }}></div>
        </div>
      </div>

      {/* Notice */}
      <div className="mb-6 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2 md:gap-3">
          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-blue-900 mb-1 text-sm md:text-base">All Fields are Optional</h3>
            <ul className="text-xs md:text-sm text-blue-800 space-y-0.5 md:space-y-1">
              <li>• Add materials at your convenience</li>
              <li>• No mandatory fields - upload what you have</li>
              <li>• Save as draft or publish immediately</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {/* Material Details */}
        <div className="bg-white rounded-lg border border-softGrey p-4 md:p-6 mb-4 md:mb-6">
          <h2 className="text-lg font-semibold mb-3 md:mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
            Material Details (Optional)
          </h2>
          
          <div className="space-y-3 md:space-y-4">
            <div>
              <label className="block text-sm font-medium text-darkGrey mb-1 md:mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                placeholder="Material title (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-darkGrey mb-1 md:mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                placeholder="Brief description (optional)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-sm font-medium text-darkGrey mb-1 md:mb-2">
                  Module (Optional)
                </label>
                <select
                  value={formData.moduleId}
                  onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
                  className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 bg-white"
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
                <label className="block text-sm font-medium text-darkGrey mb-1 md:mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                  className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 bg-white"
                >
                  <option value="draft">Save as Draft</option>
                  <option value="published">Publish Now</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-darkGrey mb-1 md:mb-2">
                Tags (Optional)
              </label>
              <div className="flex flex-col md:flex-row gap-2 mb-2">
                <input
                  type="text"
                  value={formData.tagInput}
                  onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 md:px-4 py-2 text-sm md:text-base border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                  placeholder="Add tags (optional)"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors text-sm md:text-base whitespace-nowrap"
                >
                  Add Tag
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 md:px-3 py-0.5 md:py-1 bg-lightGrey text-darkGrey rounded-full text-xs md:text-sm"
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

        {/* File Upload Section */}
        <div className="bg-white rounded-lg border border-softGrey p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 md:mb-4 gap-3">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
                Upload Files
              </h2>
              <p className="text-xs md:text-sm text-darkGrey/70 mt-1">
                Add one or more files (all optional)
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              <button
                type="button"
                onClick={() => addFile('slides')}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs md:text-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Slides
              </button>
              <button
                type="button"
                onClick={() => addFile('video')}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs md:text-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Video
              </button>
              <button
                type="button"
                onClick={() => addFile('pdf')}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-xs md:text-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                PDF
              </button>
            </div>
          </div>

          <div className="space-y-3 md:space-y-4">
            {files.map((file, index) => {
              const progress = uploadProgress[file.id] || 0
              const isUploaded = file.url.trim() !== ''
              
              return (
                <div key={file.id} className="p-3 md:p-4 border border-softGrey rounded-lg">
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className={`p-1.5 md:p-2 rounded-lg ${
                        file.type === 'slides' ? 'bg-blue-100 text-blue-600' :
                        file.type === 'video' ? 'bg-red-100 text-red-600' :
                        file.type === 'pdf' ? 'bg-amber-100 text-amber-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {file.type === 'slides' ? <FileText className="w-4 h-4 md:w-5 md:h-5" /> :
                         file.type === 'video' ? <Video className="w-4 h-4 md:w-5 md:h-5" /> :
                         file.type === 'pdf' ? <File className="w-4 h-4 md:w-5 md:h-5" /> :
                         <FileText className="w-4 h-4 md:w-5 md:h-5" />}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-darkGrey block md:inline">
                          File {index + 1}
                        </span>
                        <span className="text-xs text-darkGrey/70 hidden md:inline ml-2">
                          {file.type.charAt(0).toUpperCase() + file.type.slice(1)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-brightRed hover:bg-brightRed/5 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 md:space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-darkGrey mb-1">
                        File Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={file.name}
                        onChange={(e) => updateFile(file.id, 'name', e.target.value)}
                        className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                        placeholder="File name (optional)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-darkGrey mb-1">
                        Upload File
                      </label>
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                        <label className="flex-1 cursor-pointer">
                          <div className="border-2 border-dashed border-softGrey rounded-lg p-3 md:p-4 text-center hover:border-darkRoyalBlue transition-colors">
                            <Upload className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 text-darkGrey/60" />
                            <span className="text-xs md:text-sm text-darkGrey block truncate">
                              {file.file ? file.file.name : 'Click to choose file (optional)'}
                            </span>
                            <input
                              type="file"
                              onChange={(e) => handleFileUpload(file.id, e)}
                              className="hidden"
                              accept={
                                file.type === 'slides' ? '.ppt,.pptx,.pdf,.key' :
                                file.type === 'video' ? '.mp4,.mov,.avi,.mkv,.webm' :
                                file.type === 'pdf' ? '.pdf' :
                                file.type === 'image' ? '.jpg,.jpeg,.png,.gif,.svg' :
                                '*'
                              }
                            />
                          </div>
                        </label>
                        
                        {isUploaded ? (
                          <div className="flex items-center gap-1.5 md:gap-2 text-green-600">
                            <CheckCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                            <span className="text-xs md:text-sm">Uploaded</span>
                          </div>
                        ) : progress > 0 ? (
                          <div className="w-full md:w-32">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-darkGrey/70 mt-1 text-center">
                              {progress}%
                            </div>
                          </div>
                        ) : null}
                      </div>
                      
                      {file.size && (
                        <p className="text-xs text-darkGrey/70 mt-1">
                          Size: {file.size}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Files Summary */}
          <div className="mt-4 md:mt-6 p-3 md:p-4 bg-lightGrey rounded-lg">
            <h3 className="font-medium text-darkGrey mb-2 text-sm md:text-base">Upload Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              <div className="text-center p-2 md:p-3 bg-white rounded">
                <div className="text-base md:text-lg font-bold text-darkNavy">{files.length}</div>
                <div className="text-xs text-darkGrey/70">Files</div>
              </div>
              <div className="text-center p-2 md:p-3 bg-white rounded">
                <div className="text-base md:text-lg font-bold text-darkNavy">
                  {files.filter(f => f.type === 'slides').length}
                </div>
                <div className="text-xs text-darkGrey/70">Slides</div>
              </div>
              <div className="text-center p-2 md:p-3 bg-white rounded">
                <div className="text-base md:text-lg font-bold text-darkNavy">
                  {files.filter(f => f.type === 'video').length}
                </div>
                <div className="text-xs text-darkGrey/70">Videos</div>
              </div>
              <div className="text-center p-2 md:p-3 bg-white rounded">
                <div className="text-base md:text-lg font-bold text-darkNavy">
                  {files.filter(f => f.url.trim() !== '').length}
                </div>
                <div className="text-xs text-darkGrey/70">Ready</div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col-reverse md:flex-row justify-end gap-3 md:gap-4">
          <Link
            href="/lms/Instructor_Portal/materials"
            className="w-full md:w-auto px-4 md:px-6 py-2.5 md:py-3 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors font-medium text-center text-sm md:text-base"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            style={{ 
              backgroundColor: BRAND_COLORS.deepRed,
              color: BRAND_COLORS.white 
            }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {formData.status === 'published' ? 'Publishing...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 md:w-5 md:h-5" />
                {formData.status === 'published' ? 'Publish Materials' : 'Save as Draft'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}