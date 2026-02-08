'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  PlusCircle,
  FileText,
  Video,
  Image,
  File,
  Folder,
  Edit,
  Trash2,
  Eye,
  Download,

  Search,
  Calendar,
 
} from 'lucide-react'
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

interface Material {
  instructorEmail: any
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseTitle: string;
  moduleId?: string;
  moduleTitle?: string;
  instructorId: string;
  instructorName: string;
  type: 'slides' | 'video' | 'pdf' | 'document' | 'image' | 'other';
  files: {
    name: string;
    url: string;
    type: 'slides' | 'video' | 'pdf' | 'document' | 'image' | 'other';
    size?: string;
  }[];
  tags: string[];
  status: 'published' | 'draft';
  downloads: number;
  createdAt: string;
  updatedAt: string;
}

export default function MaterialsPage() {
  const router = useRouter()
  const [instructor, setInstructor] = useState<any>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'slides' | 'video' | 'pdf' | 'draft'>('all')
  const [debugInfo, setDebugInfo] = useState<string>('')

  useEffect(() => {
    const loadData = () => {
      try {
        const currentUserStr = localStorage.getItem('currentUser')
        if (!currentUserStr) {
          router.push('/lms/auth/login?type=instructor')
          return
        }

        const currentUser = JSON.parse(currentUserStr)
        console.log('Current User:', currentUser)
        
        if (currentUser.role !== 'instructor') {
          router.push('/lms/auth/login?type=instructor')
          return
        }

        setInstructor(currentUser)

        // // DEBUG: Check all localStorage data
        // console.log('=== DEBUG LOCALSTORAGE ===')
        // for (let i = 0; i < localStorage.length; i++) {
        //   const key = localStorage.key(i)
        //   console.log(`${key}:`, localStorage.getItem(key))
        // }

        // Load ALL materials
        const allMaterials = JSON.parse(localStorage.getItem('instructor_materials') || '[]')
        console.log('All Materials from localStorage:', allMaterials)
        console.log('Number of materials found:', allMaterials.length)
        
        if (allMaterials.length === 0) {
          console.log('No materials found in localStorage under key: instructor_materials')
          console.log('Creating demo materials for testing...')
          
          // Create demo materials for testing
          const demoMaterials = [
            {
              id: `demo_material_${Date.now()}`,
              title: 'Web Development Slides',
              description: 'Introduction to HTML, CSS, and JavaScript',
              courseId: currentUser.courseId || 'course_01',
              courseTitle: 'Web Development',
              instructorId: currentUser.id || 'instructor_001',
              instructorName: currentUser.name || 'Demo Instructor',
              type: 'slides',
              files: [
                {
                  name: 'intro-slides.pdf',
                  url: 'https://example.com/slides/intro.pdf',
                  type: 'slides',
                  size: '2.5 MB'
                }
              ],
              tags: ['web', 'beginner', 'html'],
              status: 'published',
              downloads: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: `demo_material_${Date.now() + 1}`,
              title: 'React Tutorial Video',
              description: 'Complete React.js tutorial for beginners',
              courseId: currentUser.courseId || 'course_01',
              courseTitle: 'Web Development',
              instructorId: currentUser.id || 'instructor_001',
              instructorName: currentUser.name || 'Demo Instructor',
              type: 'video',
              files: [
                {
                  name: 'react-tutorial.mp4',
                  url: 'https://example.com/videos/react.mp4',
                  type: 'video',
                  size: '150 MB'
                }
              ],
              tags: ['react', 'javascript', 'frontend'],
              status: 'published',
              downloads: 5,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
          
         
          
          setDebugInfo('Created demo materials for testing. Check console for details.')
        } else {
          // Filter for current instructor
          const myMaterials = allMaterials.filter((m: Material) => {
            console.log('Checking material:', m)
            console.log('Instructor ID:', currentUser.id)
            console.log('Material Instructor ID:', m.instructorId)
            
            // If instructorId doesn't match, check by name/email
            if (m.instructorId !== currentUser.id) {
              // Try to match by name or email
              if (m.instructorName === currentUser.name || 
                  m.instructorName === currentUser.fullName ||
                  m.instructorEmail === currentUser.email) {
                console.log('Match found by name/email')
                return true
              }
              return false
            }
            return true
          })
          
          console.log('Filtered materials for instructor:', myMaterials)
          setMaterials(myMaterials)
          
          setDebugInfo(`Found ${myMaterials.length} materials for instructor ${currentUser.name || currentUser.id}`)
        }
      } catch (error) {
  console.error('Error loading materials:', error);

  if (error instanceof Error) {
    setDebugInfo(`Error: ${error.message}`);
  } else {
    setDebugInfo(`Unexpected error: ${String(error)}`);
  }
}
 finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleDeleteMaterial = (id: string) => {
    if (confirm('Are you sure you want to delete this material? This action cannot be undone.')) {
      const updatedMaterials = materials.filter(m => m.id !== id)
      setMaterials(updatedMaterials)
      
      // Update localStorage
      const allMaterials = JSON.parse(localStorage.getItem('instructor_materials') || '[]')
      const filtered = allMaterials.filter((m: Material) => m.id !== id)
      localStorage.setItem('instructor_materials', JSON.stringify(filtered))
      
      alert('Material deleted successfully!')
    }
  }

  const handleDownload = (fileUrl: string, fileName: string) => {
    // For demo, open in new tab
    window.open(fileUrl, '_blank')
  }

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = searchTerm === '' || 
                         material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (material.tags && material.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    const matchesFilter = filter === 'all' || 
                         material.type === filter || 
                         (filter === 'draft' && material.status === 'draft')
    return matchesSearch && matchesFilter
  })

  const getTypeIcon = (type: Material['type']) => {
    switch (type) {
      case 'slides': return <FileText className="w-5 h-5" />
      case 'video': return <Video className="w-5 h-5" />
      case 'pdf': return <File className="w-5 h-5" />
      case 'image': return <Image className="w-5 h-5" />
      default: return <FileText className="w-5 h-5" />
    }
  }

  const getTypeColor = (type: Material['type']) => {
    switch (type) {
      case 'slides': return 'bg-blue-100 text-blue-600'
      case 'video': return 'bg-red-100 text-red-600'
      case 'pdf': return 'bg-amber-100 text-amber-600'
      case 'image': return 'bg-green-100 text-green-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getFileCountByType = (material: Material, type: Material['type']) => {
    return material.files ? material.files.filter(f => f.type === type).length : 0
  }

  const addDemoMaterials = () => {
    if (!instructor) return
    
    const demoMaterials = [
      {
        id: `demo_material_${Date.now()}`,
        title: 'Introduction to Programming',
        description: 'Basic concepts of programming and algorithms',
        courseId: instructor.courseId || 'course_01',
        courseTitle: 'Programming Fundamentals',
        instructorId: instructor.id || 'instructor_001',
        instructorName: instructor.name || instructor.fullName || 'Instructor',
        type: 'slides',
        files: [
          {
            name: 'intro-programming.pdf',
            url: 'https://example.com/slides/programming.pdf',
            type: 'slides',
            size: '3.2 MB'
          }
        ],
        tags: ['programming', 'basics', 'algorithms'],
        status: 'published',
        downloads: 12,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `demo_material_${Date.now() + 1}`,
        title: 'CSS Styling Tutorial',
        description: 'Advanced CSS techniques and responsive design',
        courseId: instructor.courseId || 'course_01',
        courseTitle: 'Web Development',
        instructorId: instructor.id || 'instructor_001',
        instructorName: instructor.name || instructor.fullName || 'Instructor',
        type: 'video',
        files: [
          {
            name: 'css-tutorial.mp4',
            url: 'https://example.com/videos/css.mp4',
            type: 'video',
            size: '120 MB'
          },
          {
            name: 'css-cheatsheet.pdf',
            url: 'https://example.com/pdf/css-cheatsheet.pdf',
            type: 'pdf',
            size: '0.8 MB'
          }
        ],
        tags: ['css', 'styling', 'responsive'],
        status: 'published',
        downloads: 8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `demo_material_${Date.now() + 2}`,
        title: 'JavaScript Basics',
        description: 'Variables, functions, and DOM manipulation',
        courseId: instructor.courseId || 'course_01',
        courseTitle: 'Web Development',
        instructorId: instructor.id || 'instructor_001',
        instructorName: instructor.name || instructor.fullName || 'Instructor',
        type: 'slides',
        files: [
          {
            name: 'js-basics.pdf',
            url: 'https://example.com/slides/js-basics.pdf',
            type: 'slides',
            size: '4.1 MB'
          },
          {
            name: 'practice-exercises.pdf',
            url: 'https://example.com/pdf/js-exercises.pdf',
            type: 'pdf',
            size: '1.2 MB'
          }
        ],
        tags: ['javascript', 'dom', 'functions'],
        status: 'draft',
        downloads: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    
    const existingMaterials = JSON.parse(localStorage.getItem('instructor_materials') || '[]')
    const combinedMaterials = [...existingMaterials, ...demoMaterials]
    localStorage.setItem('instructor_materials', JSON.stringify(combinedMaterials))
    
    setMaterials(combinedMaterials.filter(m => 
      m.instructorId === instructor.id || 
      m.instructorName === instructor.name ||
      m.instructorName === instructor.fullName
    ))
    
    setDebugInfo('Demo materials added successfully!')
    alert('Demo materials added successfully!')
  }

  const clearAllMaterials = () => {
    if (confirm('Are you sure you want to clear all materials? This cannot be undone.')) {
      localStorage.setItem('instructor_materials', JSON.stringify([]))
      setMaterials([])
      setDebugInfo('All materials cleared')
      alert('All materials cleared!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-100 rounded-lg mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Debug Info */}
      {debugInfo && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="text-sm text-blue-800">{debugInfo}</div>
            <div className="flex gap-2">
              <button
                onClick={addDemoMaterials}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Add Demo Materials
              </button>
              <button
                onClick={clearAllMaterials}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="bg-lightGrey rounded-xl p-6 border border-softGrey">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                Course Materials
              </h1>
              <p className="text-darkGrey mt-1">
                Upload and manage course materials (Slides, Videos, PDFs)
              </p>
              <div className="mt-2 text-sm text-darkGrey/70">
                Showing {filteredMaterials.length} materials
              </div>
            </div>
            <Link
              href="/lms/Instructor_Portal/materials/upload"
              className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors"
              style={{ 
                backgroundColor: BRAND_COLORS.deepRed,
                color: BRAND_COLORS.white 
              }}
            >
              <PlusCircle className="w-5 h-5" />
              Upload Materials
            </Link>
          </div>
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: BRAND_COLORS.deepRed }}></div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-darkGrey/50" />
            <input
              type="text"
              placeholder="Search materials by title, description or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2.5 rounded-lg font-medium ${filter === 'all' ? 'bg-darkRoyalBlue text-white' : 'bg-lightGrey text-darkGrey hover:bg-softGrey'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('slides')}
              className={`px-4 py-2.5 rounded-lg font-medium ${filter === 'slides' ? 'bg-blue-600 text-white' : 'bg-lightGrey text-darkGrey hover:bg-softGrey'}`}
            >
              Slides
            </button>
            <button
              onClick={() => setFilter('video')}
              className={`px-4 py-2.5 rounded-lg font-medium ${filter === 'video' ? 'bg-red-600 text-white' : 'bg-lightGrey text-darkGrey hover:bg-softGrey'}`}
            >
              Videos
            </button>
            <button
              onClick={() => setFilter('pdf')}
              className={`px-4 py-2.5 rounded-lg font-medium ${filter === 'pdf' ? 'bg-amber-600 text-white' : 'bg-lightGrey text-darkGrey hover:bg-softGrey'}`}
            >
              PDFs
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-4 py-2.5 rounded-lg font-medium ${filter === 'draft' ? 'bg-gray-600 text-white' : 'bg-lightGrey text-darkGrey hover:bg-softGrey'}`}
            >
              Drafts
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Total Materials</p>
              <h3 className="text-2xl font-bold text-darkNavy">{materials.length}</h3>
            </div>
            <Folder className="w-8 h-8 text-darkRoyalBlue" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Slides</p>
              <h3 className="text-2xl font-bold text-darkNavy">
                {materials.filter(m => m.type === 'slides').length}
              </h3>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Videos</p>
              <h3 className="text-2xl font-bold text-darkNavy">
                {materials.filter(m => m.type === 'video').length}
              </h3>
            </div>
            <Video className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">PDFs</p>
              <h3 className="text-2xl font-bold text-darkNavy">
                {materials.filter(m => m.type === 'pdf').length}
              </h3>
            </div>
            <File className="w-8 h-8 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map(material => (
          <div key={material.id} className="bg-white rounded-lg border border-softGrey p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg ${getTypeColor(material.type)}`}>
                    {getTypeIcon(material.type)}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${material.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {material.status}
                  </span>
                </div>
                <h3 className="font-semibold text-darkGrey text-lg mb-1">{material.title}</h3>
                <p className="text-sm text-darkGrey/70 mb-2 line-clamp-2">{material.description}</p>
                {material.moduleTitle && (
                  <p className="text-xs text-darkGrey/60 mb-2">
                    Module: {material.moduleTitle}
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <Link
                  href={`/lms/Instructor_Portal/materials/view/${material.id}`}
                  className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-lightGrey rounded-lg"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <Link
                  href={`/lms/Instructor_Portal/materials/edit/${material.id}`}
                  className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-lightGrey rounded-lg"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDeleteMaterial(material.id)}
                  className="p-2 text-brightRed hover:bg-brightRed/5 rounded-lg"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Files Summary */}
            <div className="mb-3">
              <div className="flex flex-wrap gap-2">
                {material.files && getFileCountByType(material, 'slides') > 0 && (
                  <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded">
                    {getFileCountByType(material, 'slides')} Slides
                  </span>
                )}
                {material.files && getFileCountByType(material, 'video') > 0 && (
                  <span className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded">
                    {getFileCountByType(material, 'video')} Videos
                  </span>
                )}
                {material.files && getFileCountByType(material, 'pdf') > 0 && (
                  <span className="text-xs px-2 py-1 bg-amber-50 text-amber-600 rounded">
                    {getFileCountByType(material, 'pdf')} PDFs
                  </span>
                )}
                {material.files && material.files.length > 3 && (
                  <span className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded">
                    +{material.files.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Tags */}
            {material.tags && material.tags.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {material.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="text-xs px-2 py-0.5 bg-lightGrey text-darkGrey rounded">
                      #{tag}
                    </span>
                  ))}
                  {material.tags.length > 3 && (
                    <span className="text-xs text-darkGrey/60">+{material.tags.length - 3}</span>
                  )}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-softGrey">
              <div className="flex items-center justify-between text-sm text-darkGrey/70">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(material.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  {material.downloads || 0}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-softGrey">
          <Folder className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.softGrey }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
            No Materials Found
          </h3>
          <p className="text-darkGrey/70 mb-4">
            {searchTerm ? 'Try a different search term' : 'Upload your first course materials'}
          </p>
          <div className="space-y-3">
            <Link
              href="/lms/Instructor_Portal/materials/upload"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors"
              style={{ 
                backgroundColor: BRAND_COLORS.deepRed,
                color: BRAND_COLORS.white 
              }}
            >
              <PlusCircle className="w-5 h-5" />
              Upload First Material
            </Link>
            <button
              onClick={addDemoMaterials}
              className="block mx-auto px-4 py-2 text-sm text-darkRoyalBlue hover:text-darkRoyalBlue/80"
            >
              Or add demo materials for testing
            </button>
          </div>
        </div>
      )}
    </div>
  )
}