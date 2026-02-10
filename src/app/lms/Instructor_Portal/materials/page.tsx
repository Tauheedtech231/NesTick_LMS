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
  Search,
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
    id?: string;
    name: string;
    url: string;
    cloudinary_url?: string;
    public_id?: string;
    type: 'slides' | 'video' | 'pdf' | 'document' | 'image' | 'other';
    size?: string;
    isVideo?: boolean;
    isDocument?: boolean;
    format?: string;
  }[];
  tags: string[];
  status: 'published' | 'draft';
  downloads: number;
  createdAt: string;
  updatedAt: string;
  storage?: 'cloudinary' | 'local';
}

export default function MaterialsPage() {
  const router = useRouter()
  const [instructor, setInstructor] = useState<any>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'slides' | 'video' | 'pdf' | 'draft'>('all')

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

        // Load materials from localStorage
        const allMaterials = JSON.parse(localStorage.getItem('instructor_materials') || '[]')
        
        // Filter for current instructor
        const myMaterials = allMaterials.filter((m: Material) => {
          if (m.instructorId === currentUser.id) return true
          if (m.instructorEmail === currentUser.email) return true
          if (m.instructorName === currentUser.name || 
              m.instructorName === currentUser.fullName) return true
          return false
        })

        setMaterials(myMaterials)
        
      } catch (error) {
        console.error('Error loading materials:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleDeleteMaterial = (id: string) => {
    if (confirm('Are you sure you want to delete this material? This action cannot be undone.')) {
      const material = materials.find(m => m.id === id)
      if (material?.files) {
        material.files.forEach(async (file) => {
          if (file.public_id) {
            try {
              await fetch('/api/upload/cloudinary', {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ public_id: file.public_id })
              })
            } catch (error) {
              console.error('Error deleting file from Cloudinary:', error)
            }
          }
        })
      }

      const updatedMaterials = materials.filter(m => m.id !== id)
      setMaterials(updatedMaterials)
      
      const allMaterials = JSON.parse(localStorage.getItem('instructor_materials') || '[]')
      const filtered = allMaterials.filter((m: Material) => m.id !== id)
      localStorage.setItem('instructor_materials', JSON.stringify(filtered))
      
      alert('Material deleted successfully!')
    }
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
      case 'slides': return <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
      case 'video': return <Video className="w-4 h-4 sm:w-5 sm:h-5" />
      case 'pdf': return <File className="w-4 h-4 sm:w-5 sm:h-5" />
      case 'image': return <Image className="w-4 h-4 sm:w-5 sm:h-5" />
      default: return <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
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

  // Stats calculations
  const stats = {
    totalMaterials: materials.length,
    cloudinaryFiles: materials.reduce((total, m) => total + (m.files?.length || 0), 0),
    published: materials.filter(m => m.status === 'published').length,
    drafts: materials.filter(m => m.status === 'draft').length,
  }

  const getFilterCount = (type: 'all' | 'slides' | 'video' | 'pdf' | 'draft') => {
    if (type === 'all') return materials.length
    if (type === 'draft') return materials.filter(m => m.status === 'draft').length
    return materials.filter(m => m.type === type).length
  }

  const renderFilePreview = (file: Material['files'][0]) => {
    const fileUrl = file.cloudinary_url || file.url
    
    if (file.isVideo) {
      return (
        <div className="mt-2 p-2 bg-black rounded-lg">
          <div className="aspect-video bg-black/20 rounded overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="mt-1 px-1">
            <p className="text-xs text-white/70 truncate">{file.name}</p>
          </div>
        </div>
      )
    } else {
      return (
        <div className="mt-2 p-2 bg-lightGrey rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded ${
              file.type === 'slides' ? 'bg-blue-100 text-blue-600' :
              file.type === 'pdf' ? 'bg-amber-100 text-amber-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              {file.type === 'slides' ? <FileText className="w-3 h-3 sm:w-4 sm:h-4" /> :
               file.type === 'pdf' ? <File className="w-3 h-3 sm:w-4 sm:h-4" /> :
               <FileText className="w-3 h-3 sm:w-4 sm:h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-darkGrey truncate">{file.name}</p>
              <p className="text-xs text-darkGrey/70">
                {file.format?.toUpperCase() || file.type} • {file.size || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-100 rounded-lg mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-lightGrey rounded-xl p-4 sm:p-6 border border-softGrey">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                Course Materials
              </h1>
              <p className="text-darkGrey mt-1 text-sm sm:text-base">
                Manage your course materials (Videos, Slides, PDFs)
              </p>
              <div className="mt-2 text-xs sm:text-sm text-darkGrey/70">
                Showing {filteredMaterials.length} materials • Cloudinary Storage
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/lms/Instructor_Portal/materials/upload"
                className="inline-flex items-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition-colors whitespace-nowrap"
                style={{ 
                  backgroundColor: BRAND_COLORS.deepRed,
                  color: BRAND_COLORS.white 
                }}
              >
                <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                Upload Material
              </Link>
            </div>
          </div>
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: BRAND_COLORS.deepRed }}></div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-lg border border-softGrey p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-darkGrey/70">Total Materials</p>
              <h3 className="text-lg sm:text-2xl font-bold text-darkNavy">{stats.totalMaterials}</h3>
            </div>
            <Folder className="w-6 h-6 sm:w-8 sm:h-8 text-darkRoyalBlue" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-softGrey p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-darkGrey/70">Cloudinary Files</p>
              <h3 className="text-lg sm:text-2xl font-bold text-darkNavy">{stats.cloudinaryFiles}</h3>
            </div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-teal-100 flex items-center justify-center">
              <CloudinaryIcon />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-softGrey p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-darkGrey/70">Published</p>
              <h3 className="text-lg sm:text-2xl font-bold text-darkNavy">{stats.published}</h3>
            </div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-softGrey p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-darkGrey/70">Drafts</p>
              <h3 className="text-lg sm:text-2xl font-bold text-darkNavy">{stats.drafts}</h3>
            </div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-darkGrey/50" />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 text-sm sm:text-base"
            />
          </div>
       
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredMaterials.map(material => (
          <div key={material.id} className="bg-white rounded-lg border border-softGrey p-4 sm:p-5 hover:shadow-md transition-shadow flex flex-col">
            {/* Top section */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-3">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <div className={`p-1.5 sm:p-2 rounded-lg ${getTypeColor(material.type)}`}>
                    {getTypeIcon(material.type)}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${material.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {material.status}
                  </span>
                  {material.storage === 'cloudinary' && (
                    <span className="text-xs px-2 py-1 rounded-full bg-teal-100 text-teal-800">
                      Cloudinary
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-darkGrey text-base sm:text-lg mb-1 line-clamp-1">{material.title}</h3>
                <p className="text-sm text-darkGrey/70 mb-2 line-clamp-2">{material.description}</p>
                {material.moduleTitle && (
                  <p className="text-xs text-darkGrey/60 mb-2">
                    Module: {material.moduleTitle}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-row justify-end gap-1 sm:flex-col sm:items-end">
                {/* <Link
                  href={`/lms/Instructor_Portal/materials/view/${material.id}`}
                  className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-lightGrey rounded-lg transition-colors"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </Link> */}
                <Link
                  href={`/lms/Instructor_Portal/materials/edit/${material.id}`}
                  className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-lightGrey rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDeleteMaterial(material.id)}
                  className="p-2 text-brightRed hover:bg-brightRed/5 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* File Previews */}
            {material.files && material.files.length > 0 && (
              <div className="mb-3">
                {material.files.slice(0, 1).map((file, index) => (
                  <div key={file.id || index}>
                    {renderFilePreview(file)}
                  </div>
                ))}
                {material.files.length > 1 && (
                  <div className="mt-2 text-center">
                    <span className="text-xs text-darkGrey/60">
                      +{material.files.length - 1} more files
                    </span>
                  </div>
                )}
              </div>
            )}

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

            {/* Bottom info */}
            <div className="mt-auto pt-3 border-t border-softGrey">
              <div className="text-xs text-darkGrey/60">
                Updated: {new Date(material.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-8 sm:py-12 bg-white rounded-lg border border-softGrey">
          <Folder className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.softGrey }} />
          <h3 className="text-base sm:text-lg font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
            No Materials Found
          </h3>
          <p className="text-darkGrey/70 mb-4 text-sm sm:text-base">
            {searchTerm ? 'Try a different search term' : 'Upload your first course materials'}
          </p>
          <Link
            href="/lms/Instructor_Portal/materials/upload"
            className="inline-flex items-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition-colors"
            style={{ 
              backgroundColor: BRAND_COLORS.deepRed,
              color: BRAND_COLORS.white 
            }}
          >
            <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            Upload Material
          </Link>
        </div>
      )}
    </div>
  )
}

function CloudinaryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5">
      <path d="M21.5 12.5C21.5 15.533 19.033 18 16 18H8C5.51472 18 3.5 15.9853 3.5 13.5C3.5 11.0147 5.51472 9 8 9C8.18689 9 8.37134 9.00931 8.55301 9.02745C9.33632 6.16376 11.936 4 15 4C18.5899 4 21.5 6.91015 21.5 10.5C21.5 10.9897 21.4533 11.4684 21.364 11.9319C21.4552 12.0941 21.5 12.2836 21.5 12.5Z" 
        fill="#3448C5" />
      <path d="M12 16C13.6569 16 15 14.6569 15 13C15 11.3431 13.6569 10 12 10C10.3431 10 9 11.3431 9 13C9 14.6569 10.3431 16 12 16Z" 
        fill="#FFC24C" />
    </svg>
  )
}