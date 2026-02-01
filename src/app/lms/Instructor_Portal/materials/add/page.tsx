// app/lms/Instructor_Portal/materials/add/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  HiArrowLeft, HiCloudUpload, HiDocument, 
  HiVideoCamera, HiLink, HiInformationCircle,
  HiX, HiBookOpen, HiFolder,
  HiTag, HiChevronDown
} from 'react-icons/hi'
import { toast, Toaster } from 'react-hot-toast'
/* eslint-disable */

interface Course {
  id: string
  title: string
  code: string
}

interface Module {
  id: string
  courseId: string
  title: string
  materials?: any[]
}

export default function UploadMaterialPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [selectedModule, setSelectedModule] = useState<string>('')
  const [materialType, setMaterialType] = useState<'document' | 'video' | 'link' | 'other'>('document')
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    size: 0
  })
  const [currentInstructor, setCurrentInstructor] = useState<any>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Load data on component mount
  useEffect(() => {
    setIsMounted(true)
    
    // Get current logged in instructor
    const userData = localStorage.getItem('currentUser')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        setCurrentInstructor(user)
        
        // Load assigned courses for this instructor
        const allCourses = JSON.parse(localStorage.getItem('courses') || '[]')
        const allInstructors = JSON.parse(localStorage.getItem('instructors') || '[]')
        const allModules = JSON.parse(localStorage.getItem('modules') || '[]')
        setModules(allModules)
        
        let instructorCourses: Course[] = []
        
        if (user.email === 'instructor@gmail.com') {
          // Demo instructor - access to all courses
          instructorCourses = allCourses
        } else if (user.role === 'instructor') {
          // Real instructor - get assigned courses
          const instructorDetails = allInstructors.find((instr: any) => 
            instr.email === user.email || 
            instr.id === user.instructorId
          )
          
          if (instructorDetails?.assignedCourseIds) {
            instructorCourses = allCourses.filter((course: Course) => 
              instructorDetails.assignedCourseIds.includes(course.id)
            )
          }
        }

        setAssignedCourses(instructorCourses)

      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
  }, [])

  // Get modules for selected course
  const getModulesForCourse = () => {
    if (!selectedCourse) return []
    return modules.filter(module => module.courseId === selectedCourse)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setFormData(prev => ({
        ...prev,
        title: selectedFile.name.split('.')[0],
        size: selectedFile.size
      }))
    }
  }

  const simulateUpload = () => {
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 100)
    return interval
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCourse) {
      toast.error('Please select a course')
      return
    }

    if (!selectedModule) {
      toast.error('Please select a module')
      return
    }

    if (materialType !== 'link' && !file) {
      toast.error('Please select a file to upload')
      return
    }

    if (materialType === 'link' && !formData.url) {
      toast.error('Please enter a URL')
      return
    }

    setLoading(true)
    const uploadInterval = simulateUpload()

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      const materialId = `material_${Date.now()}`
      
      const newMaterial = {
        id: materialId,
        courseId: selectedCourse,
        moduleId: selectedModule,
        title: formData.title || file?.name.split('.')[0] || 'Untitled',
        description: formData.description,
        type: materialType,
        url: materialType === 'link' ? formData.url : `uploads/${materialId}/${file?.name}`,
        uploadedAt: new Date().toISOString(),
        size: file?.size || 0,
        uploadedBy: currentInstructor?.name || currentInstructor?.email || 'Instructor'
      }

      const allModules = JSON.parse(localStorage.getItem('modules') || '[]')
      
      const updatedModules = allModules.map((module: Module) => {
        if (module.id === selectedModule) {
          return {
            ...module,
            materials: [...(module.materials || []), newMaterial]
          }
        }
        return module
      })

      localStorage.setItem('modules', JSON.stringify(updatedModules))

      clearInterval(uploadInterval)
      setUploadProgress(100)
      
      toast.success('Material uploaded successfully!')
      
      setTimeout(() => {
        router.push('/lms/Instructor_Portal/materials')
      }, 1000)

    } catch (error) {
      console.error('Error uploading material:', error)
      clearInterval(uploadInterval)
      toast.error('Failed to upload material')
    } finally {
      setLoading(false)
    }
  }

  const isUploadDisabled = () => {
    const hasRequiredFields = selectedCourse && selectedModule && 
      (materialType === 'link' ? formData.url : file) && 
      formData.title.trim();
    
    return !hasRequiredFields || loading;
  }

  const getCourseName = (courseId: string) => {
    const course = assignedCourses.find(c => c.id === courseId)
    return course ? `${course.title} (${course.code})` : ''
  }

  const getModuleName = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId)
    return module ? module.title : ''
  }

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/lms/Instructor_Portal/materials"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <HiArrowLeft className="w-5 h-5 mr-2" />
              <span>Back to Materials</span>
            </Link>
            
            <h1 className="text-2xl font-bold text-gray-900">Upload Teaching Material</h1>
            <p className="text-gray-600 mt-1">
              Add learning resources to your assigned courses
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-gray-300 rounded-lg p-6">
            {/* Course Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Course *
              </label>
              <div className="relative">
                <select
                  value={selectedCourse}
                  onChange={(e) => {
                    setSelectedCourse(e.target.value)
                    setSelectedModule('') // Reset module when course changes
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Choose a course</option>
                  {assignedCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title} ({course.code})
                    </option>
                  ))}
                </select>
                <HiChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              
              {assignedCourses.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  No courses assigned to you. Please contact your administrator.
                </p>
              )}
            </div>

            {/* Module Selection (only show if course is selected) */}
            {selectedCourse && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Module *
                </label>
                <div className="relative">
                  <select
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Choose a module</option>
                    {getModulesForCourse().map((module) => (
                      <option key={module.id} value={module.id}>
                        {module.title}
                      </option>
                    ))}
                  </select>
                  <HiChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                
                {getModulesForCourse().length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    No modules found for this course.
                  </p>
                )}
              </div>
            )}

            {/* Material Type Selection */}
            {selectedModule && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Material Type *
                </label>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setMaterialType('document')}
                    className={`px-4 py-3 border rounded-lg flex items-center gap-2 ${
                      materialType === 'document'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <HiDocument className="w-5 h-5" />
                    Document
                  </button>

                  <button
                    type="button"
                    onClick={() => setMaterialType('video')}
                    className={`px-4 py-3 border rounded-lg flex items-center gap-2 ${
                      materialType === 'video'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <HiVideoCamera className="w-5 h-5" />
                    Video
                  </button>

                  <button
                    type="button"
                    onClick={() => setMaterialType('link')}
                    className={`px-4 py-3 border rounded-lg flex items-center gap-2 ${
                      materialType === 'link'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <HiLink className="w-5 h-5" />
                    Link
                  </button>

                  <button
                    type="button"
                    onClick={() => setMaterialType('other')}
                    className={`px-4 py-3 border rounded-lg flex items-center gap-2 ${
                      materialType === 'other'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <HiTag className="w-5 h-5" />
                    Other
                  </button>
                </div>
              </div>
            )}

            {/* Material Details */}
            {selectedModule && (
              <>
                {/* Title */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Material Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter material title"
                    required
                  />
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add description (optional)"
                  />
                </div>

                {/* File Upload or URL */}
                {materialType !== 'link' ? (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload File *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        id="file-upload"
                        onChange={handleFileChange}
                        className="hidden"
                        accept={materialType === 'document' ? '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt' : 
                               materialType === 'video' ? '.mp4,.avi,.mov,.wmv,.flv,.mkv' : 
                               '*'}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer block">
                        {file ? (
                          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-300">
                            <div className="flex items-center gap-3">
                              <HiDocument className="w-6 h-6 text-gray-500" />
                              <div className="text-left">
                                <p className="font-medium text-gray-900">{file.name}</p>
                                <p className="text-sm text-gray-500">
                                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFile(null);
                              }}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <HiX className="w-5 h-5 text-gray-500" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <HiCloudUpload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-700 font-medium mb-1">Click to upload file</p>
                            <p className="text-sm text-gray-500">
                              {materialType === 'document' ? 'PDF, DOC, PPT up to 50MB' :
                               materialType === 'video' ? 'MP4, AVI, MOV up to 500MB' :
                               'Any file up to 100MB'}
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL *
                    </label>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({...formData, url: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/your-material"
                      required
                    />
                  </div>
                )}
              </>
            )}

            {/* Upload Progress */}
            {uploadProgress > 0 && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700">Uploading...</span>
                  <span className="text-sm font-bold text-blue-700">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-300">
              <Link
                href="/lms/Instructor_Portal/materials"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </Link>
              
              <button
                type="submit"
                disabled={isUploadDisabled()}
                className={`px-6 py-3 rounded-lg font-medium flex-1 flex items-center justify-center gap-2 ${
                  isUploadDisabled()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <HiCloudUpload className="w-5 h-5" />
                    Upload Material
                  </>
                )}
              </button>
            </div>

            {/* Validation Messages */}
            {isUploadDisabled() && selectedCourse && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <HiInformationCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Complete all required fields:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      {!selectedModule && <li>Select a module</li>}
                      {selectedModule && !formData.title.trim() && <li>Add material title</li>}
                      {selectedModule && formData.title.trim() && materialType !== 'link' && !file && <li>Upload a file</li>}
                      {selectedModule && formData.title.trim() && materialType === 'link' && !formData.url && <li>Enter URL</li>}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Current Selection Display */}
          {(selectedCourse || selectedModule) && (
            <div className="mt-6 bg-gray-50 border border-gray-300 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Selected Location:</p>
              <div className="flex flex-wrap gap-4">
                {selectedCourse && (
                  <div className="flex items-center gap-2">
                    <HiBookOpen className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">{getCourseName(selectedCourse)}</span>
                  </div>
                )}
                {selectedModule && (
                  <div className="flex items-center gap-2">
                    <HiFolder className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">{getModuleName(selectedModule)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}