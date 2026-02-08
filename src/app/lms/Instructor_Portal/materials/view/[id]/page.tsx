'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
/* eslint-disable */

import Link from 'next/link'
import {
  ArrowLeft,
  Download,
  FileText,
  Video,
  File,
  Image,
  Calendar,
  User,
  BookOpen,
  Folder,
  Eye,
  ExternalLink,
  Tag,
  Copy
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

export default function ViewMaterialPage() {
  const router = useRouter()
  const params = useParams()
  const materialId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [material, setMaterial] = useState<any>(null)

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

        // Load material
        const materials = JSON.parse(localStorage.getItem('instructor_materials') || '[]')
        const foundMaterial = materials.find((m: any) => 
          m.id === materialId && m.instructorId === currentUser.id
        )
        
        if (!foundMaterial) {
          alert('Material not found')
          router.push('/lms/Instructor_Portal/materials')
          return
        }

        setMaterial(foundMaterial)
        
      } catch (error) {
        console.error('Error loading material:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [materialId, router])

  const handleDownload = (fileUrl: string, fileName: string) => {
    // Increment download count
    const materials = JSON.parse(localStorage.getItem('instructor_materials') || '[]')
    const updatedMaterials = materials.map((m: any) => {
      if (m.id === materialId) {
        return {
          ...m,
          downloads: (m.downloads || 0) + 1
        }
      }
      return m
    })
    
    localStorage.setItem('instructor_materials', JSON.stringify(updatedMaterials))
    setMaterial((prev: any) => ({ ...prev, downloads: (prev.downloads || 0) + 1 }))
    
    // Open file
    window.open(fileUrl, '_blank')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'slides': return <FileText className="w-5 h-5" />
      case 'video': return <Video className="w-5 h-5" />
      case 'pdf': return <File className="w-5 h-5" />
      case 'image': return <Image className="w-5 h-5" />
      default: return <FileText className="w-5 h-5" />
    }
  }

  const getFileColor = (type: string) => {
    switch (type) {
      case 'slides': return 'bg-blue-100 text-blue-600'
      case 'video': return 'bg-red-100 text-red-600'
      case 'pdf': return 'bg-amber-100 text-amber-600'
      case 'image': return 'bg-green-100 text-green-600'
      default: return 'bg-gray-100 text-gray-600'
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
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                  {material.title}
                </h1>
                <p className="text-darkGrey mt-1">
                  View material details and files
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/lms/Instructor_Portal/materials/edit/${materialId}`}
                className="px-4 py-2 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors font-medium"
              >
                Edit
              </Link>
            </div>
          </div>
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: BRAND_COLORS.deepRed }}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Material Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-softGrey p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
              Material Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-darkRoyalBlue mb-2">{material.title}</h3>
                <p className="text-darkGrey mb-4">{material.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-lightGrey rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-darkGrey/70" />
                    <span className="text-sm font-medium text-darkGrey">Course</span>
                  </div>
                  <div className="text-darkNavy font-semibold">{material.courseTitle}</div>
                </div>

                {material.moduleTitle && (
                  <div className="bg-lightGrey rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Folder className="w-4 h-4 text-darkGrey/70" />
                      <span className="text-sm font-medium text-darkGrey">Module</span>
                    </div>
                    <div className="text-darkNavy font-semibold">{material.moduleTitle}</div>
                  </div>
                )}

                <div className="bg-lightGrey rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-darkGrey/70" />
                    <span className="text-sm font-medium text-darkGrey">Instructor</span>
                  </div>
                  <div className="text-darkNavy font-semibold">{material.instructorName}</div>
                </div>

                <div className="bg-lightGrey rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-darkGrey/70" />
                    <span className="text-sm font-medium text-darkGrey">Created</span>
                  </div>
                  <div className="text-darkNavy font-semibold">
                    {new Date(material.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Tags */}
              {material.tags && material.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-darkGrey mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {material.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-lightGrey text-darkGrey rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Files Section */}
          <div className="bg-white rounded-lg border border-softGrey p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
              Files ({material.files.length})
            </h2>
            
            <div className="space-y-4">
              {material.files.map((file: any, index: number) => (
                <div key={index} className="p-4 border border-softGrey rounded-lg hover:bg-lightGrey transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${getFileColor(file.type)}`}>
                        {getFileIcon(file.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-darkGrey">{file.name}</h4>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                            {file.type.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-darkGrey/70">
                          {file.size && (
                            <span>Size: {file.size}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Ready to download
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(file.url, file.name)}
                        className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-lightGrey rounded-lg"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(file.url)}
                        className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-lightGrey rounded-lg"
                        title="Copy URL"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-lightGrey rounded-lg"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Actions */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white rounded-lg border border-softGrey p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
              Statistics
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-darkGrey">Total Files</span>
                <span className="font-medium text-darkNavy">{material.files.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-darkGrey">Total Downloads</span>
                <span className="font-medium text-darkNavy">{material.downloads || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-darkGrey">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  material.status === 'published' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {material.status}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-darkGrey">Material Type</span>
                <span className="font-medium text-darkNavy capitalize">{material.type}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-darkGrey">Last Updated</span>
                <span className="text-sm text-darkGrey/70">
                  {new Date(material.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* File Types Summary */}
          <div className="bg-white rounded-lg border border-softGrey p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
              File Types
            </h2>
            
            <div className="space-y-3">
              {['slides', 'video', 'pdf', 'image', 'document', 'other'].map(type => {
                const count = material.files.filter((f: any) => f.type === type).length
                if (count === 0) return null
                
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded ${getFileColor(type)}`}>
                        {getFileIcon(type)}
                      </div>
                      <span className="text-darkGrey capitalize">{type}</span>
                    </div>
                    <span className="font-medium text-darkNavy">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-softGrey p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
              Quick Actions
            </h2>
            
            <div className="space-y-3">
              <Link
                href={`/lms/Instructor_Portal/materials/edit/${materialId}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-softGrey hover:border-darkRoyalBlue hover:bg-lightGrey transition-all"
              >
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}10`, color: BRAND_COLORS.darkRoyalBlue }}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-darkGrey">Edit Material</h4>
                  <p className="text-sm text-darkGrey/70">Update details or files</p>
                </div>
              </Link>

              <button
                onClick={() => {
                  const slides = material.files.filter((f: any) => f.type === 'slides')
                  if (slides.length > 0) {
                    handleDownload(slides[0].url, slides[0].name)
                  } else {
                    alert('No slides available')
                  }
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-softGrey hover:border-darkRoyalBlue hover:bg-lightGrey transition-all text-left"
              >
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-darkGrey">Download All Slides</h4>
                  <p className="text-sm text-darkGrey/70">
                    {material.files.filter((f: any) => f.type === 'slides').length} files
                  </p>
                </div>
              </button>

              <Link
                href="/lms/Instructor_Portal/materials/upload"
                className="flex items-center gap-3 p-3 rounded-lg border border-softGrey hover:border-darkRoyalBlue hover:bg-lightGrey transition-all"
              >
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.deepRed}10`, color: BRAND_COLORS.deepRed }}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-darkGrey">Upload New</h4>
                  <p className="text-sm text-darkGrey/70">Add more materials</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}