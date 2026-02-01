// app/lms/Instructor_Portal/materials/edit/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  HiArrowLeft, HiCloudUpload, HiDocument, 
  HiVideoCamera, HiLink, 
  HiX, HiSave
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

interface Material {
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

// Wrapper component to handle search params safely
function EditMaterialContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const materialId = searchParams.get('id')
  const moduleId = searchParams.get('moduleId')
  
  const [loading, setLoading] = useState(false)
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [materialType, setMaterialType] = useState<'document' | 'video' | 'link' | 'other'>('document')
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    size: 0
  })
  const [currentMaterial, setCurrentMaterial] = useState<Material | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    if (!materialId || !moduleId) {
      toast.error('Invalid material or module ID')
      router.push('/lms/Instructor_Portal/materials')
      return
    }
    
    // Get current logged in instructor
    const userData = localStorage.getItem('currentUser')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        
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

        // Load the material to edit
        if (materialId && moduleId) {
          const module = allModules.find((m: Module) => m.id === moduleId)
          if (module && module.materials) {
            const material = module.materials.find((m: any) => m.id === materialId)
            if (material) {
              setCurrentMaterial(material)
              setMaterialType(material.type)
              setFormData({
                title: material.title,
                description: material.description || '',
                url: material.url || '',
                size: material.size || 0
              })
            } else {
              toast.error('Material not found')
              router.push('/lms/Instructor_Portal/materials')
            }
          } else {
            toast.error('Module not found')
            router.push('/lms/Instructor_Portal/materials')
          }
        }

      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Failed to load data')
      }
    } else {
      router.push('/lms/login')
    }
  }, [materialId, moduleId, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setFormData(prev => ({
        ...prev,
        title: selectedFile.name.replace(/\.[^/.]+$/, ""),
        size: selectedFile.size
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentMaterial || !materialId || !moduleId) return

    if (!formData.title.trim()) {
      toast.error('Please add a title')
      return
    }

    if (materialType === 'link' && !formData.url) {
      toast.error('Please enter a URL')
      return
    }

    setLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const allModules = JSON.parse(localStorage.getItem('modules') || '[]')
      
      const updatedModules = allModules.map((module: Module) => {
        if (module.id === moduleId && module.materials) {
          return {
            ...module,
            materials: module.materials.map((material: Material) => 
              material.id === materialId 
                ? {
                    ...material,
                    title: formData.title,
                    description: formData.description,
                    type: materialType,
                    url: materialType === 'link' ? formData.url : (file ? URL.createObjectURL(file) : material.url),
                    size: file ? file.size : material.size,
                    updatedAt: new Date().toISOString()
                  }
                : material
            )
          }
        }
        return module
      })

      localStorage.setItem('modules', JSON.stringify(updatedModules))
      
      toast.success('Material updated successfully!')
      
      setTimeout(() => {
        router.push('/lms/Instructor_Portal/materials')
      }, 1000)

    } catch (error) {
      console.error('Error updating material:', error)
      toast.error('Failed to update material')
    } finally {
      setLoading(false)
    }
  }

  const getCourseName = (courseId: string) => {
    const course = assignedCourses.find(c => c.id === courseId)
    return course ? course.title : 'Unknown Course'
  }

  const getModuleName = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId)
    return module ? module.title : 'Unknown Module'
  }

  const isSaveDisabled = () => {
    const hasRequiredFields = formData.title.trim() && 
      (materialType !== 'link' || formData.url)
    
    return !hasRequiredFields || loading
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

  if (!currentMaterial) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Material Not Found</h2>
            <p className="text-gray-600 mb-6">The material you're trying to edit doesn't exist.</p>
            <Link
              href="/lms/Instructor_Portal/materials"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              Back to Materials
            </Link>
          </div>
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
            
            <h1 className="text-2xl font-bold text-gray-900">Edit Material</h1>
            <p className="text-gray-600 mt-1">
              Update your teaching material
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-gray-300 rounded-lg p-6">
            {/* Current Location */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-300">
              <h3 className="font-medium text-gray-900 mb-2">Current Location</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Course</p>
                  <p className="font-medium text-gray-900">{getCourseName(currentMaterial.courseId)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Module</p>
                  <p className="font-medium text-gray-900">{getModuleName(currentMaterial.moduleId)}</p>
                </div>
              </div>
            </div>

            {/* Material Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Material Type
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
                  <HiDocument className="w-5 h-5" />
                  Other
                </button>
              </div>
            </div>

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
                  Update File (Optional)
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
                        <p className="text-gray-700 font-medium mb-1">Click to upload new file</p>
                        <p className="text-sm text-gray-500">
                          Leave empty to keep current file
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

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-300">
              <Link
                href="/lms/Instructor_Portal/materials"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </Link>
              
              <button
                type="submit"
                disabled={isSaveDisabled()}
                className={`px-6 py-3 rounded-lg font-medium flex-1 flex items-center justify-center gap-2 ${
                  isSaveDisabled()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <HiSave className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

// Main export with Suspense boundary
export default function EditMaterialPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <EditMaterialContent />
    </Suspense>
  )
}