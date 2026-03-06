'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
 
  BookOpen,
  Users,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Award,
  User,
  RefreshCw,
  AlertCircle
} from 'lucide-react'

// Brand Colors
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
/* eslint-disable */
interface Instructor {
  id: string
  name: string
  email: string
  phone: string | null
  specialization: string
  experience: string
  qualification: string
  status: 'active' | 'inactive'
  rating: number | string
  course_id: string | null
  total_students: number
  created_at: string
  // Joined fields
  course_title?: string
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Fetch instructors from API
  const fetchInstructors = async () => {
    try {
      setError(null)
      setRefreshing(true)
      
      const response = await fetch('/api/instructors')
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch instructors')
      }
       console.log('Fetched instructors:', result.data) 
      if (result.success && result.data) {
        setInstructors(result.data)
      } else {
        setInstructors([])
      }
    } catch (error: any) {
      console.error('Error fetching instructors:', error)
      setError(error.message || 'Failed to load instructors')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchInstructors()
  }, [])

  // Filter instructors
  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = 
      instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (instructor.specialization?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (instructor.course_title?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || instructor.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  // Get stats
  const activeInstructors = instructors.filter(i => i.status === 'active').length
  const totalStudents = instructors.reduce((sum, i) => sum + (i.total_students || 0), 0)

  // Delete instructor
  const handleDeleteInstructor = async () => {
    if (!selectedInstructor) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/instructors/${selectedInstructor.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete instructor')
      }

      setInstructors(prev => prev.filter(i => i.id !== selectedInstructor.id))
      setShowDeleteModal(false)
      setSelectedInstructor(null)
      
      alert(`✅ Instructor ${selectedInstructor.name} deleted successfully!`)
      
    } catch (error: any) {
      console.error('Error deleting instructor:', error)
      alert(`❌ Error: ${error.message}`)
    } finally {
      setDeleting(false)
    }
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    return status === 'active' ? BRAND_COLORS.teal : BRAND_COLORS.brightRed
  }

  // Format rating safely
  const formatRating = (rating: number | string | undefined): string => {
    if (!rating) return '0.0'
    const numRating = typeof rating === 'string' ? parseFloat(rating) : rating
    return isNaN(numRating) ? '0.0' : numRating.toFixed(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
            <div 
              className="absolute top-0 left-0 w-16 h-16 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: BRAND_COLORS.deepRed }}
            ></div>
          </div>
          <p className="mt-4 text-darkGrey">Loading instructors...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <AlertCircle className="w-16 h-16 mb-4" style={{ color: BRAND_COLORS.brightRed }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: BRAND_COLORS.darkNavy }}>
            Error Loading Instructors
          </h3>
          <p className="text-darkGrey/70 mb-6 text-center max-w-md">{error}</p>
          <button
            onClick={fetchInstructors}
            className="px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue, color: BRAND_COLORS.white }}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl border border-softGrey p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                Instructors
              </h1>
              <p className="text-darkGrey mt-1">
                Manage instructors and their course assignments
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchInstructors}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 border border-softGrey rounded-lg hover:bg-lightGrey transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <Link
                href="/lms/Admin_Portal/instructors/add"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors"
                style={{ backgroundColor: BRAND_COLORS.deepRed }}
              >
                <Plus className="w-4 h-4" />
                Add Instructor
              </Link>
            </div>
          </div>

          <div className="h-1 w-20 rounded-full" style={{ backgroundColor: BRAND_COLORS.deepRed }}></div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}10` }}>
              <Users className="w-5 h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
            </div>
            <div>
              <p className="text-sm text-darkGrey/70">Total Instructors</p>
              <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                {instructors.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.teal}10` }}>
              <CheckCircle className="w-5 h-5" style={{ color: BRAND_COLORS.teal }} />
            </div>
            <div>
              <p className="text-sm text-darkGrey/70">Active</p>
              <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                {activeInstructors}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.deepRed}10` }}>
              <BookOpen className="w-5 h-5" style={{ color: BRAND_COLORS.deepRed }} />
            </div>
            <div>
              <p className="text-sm text-darkGrey/70">Total Students</p>
              <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                {totalStudents}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-darkGrey/40" />
          <input
            type="text"
            placeholder="Search by name, email, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-softGrey rounded-lg focus:outline-none focus:ring-2 focus:ring-darkRoyalBlue/20"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-softGrey rounded-lg focus:outline-none focus:ring-2 focus:ring-darkRoyalBlue/20"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Instructors Table */}
      {filteredInstructors.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-softGrey">
          <table className="min-w-full divide-y divide-softGrey">
            <thead className="bg-darkRoyalBlue">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Instructor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Qualification</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Course</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-softGrey">
              {filteredInstructors.map((instructor) => (
                <tr key={instructor.id} className="hover:bg-lightGrey">
                  {/* Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                        style={{ backgroundColor: `${BRAND_COLORS.deepRed}10` }}>
                        <User className="w-4 h-4" style={{ color: BRAND_COLORS.deepRed }} />
                      </div>
                      <span className="font-medium">{instructor.name}</span>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-4 py-3">
                    <div className="text-sm">{instructor.email}</div>
                    {instructor.phone && (
                      <div className="text-xs text-darkGrey/70">{instructor.phone}</div>
                    )}
                  </td>

                  {/* Qualification */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                      <span>{instructor.qualification || '—'}</span>
                    </div>
                    <div className="text-xs text-darkGrey/70 mt-1">
                      {instructor.experience || '—'}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${getStatusColor(instructor.status)}20`,
                        color: getStatusColor(instructor.status)
                      }}
                    >
                      {instructor.status === 'active' ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </span>
                  </td>

                  {/* Course */}
                  <td className="px-4 py-3">
                    {instructor.course_title ? (
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                        <span className="text-sm">{instructor.course_title}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-darkGrey/50">Not assigned</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/lms/Admin_Portal/instructors/edit/${instructor.id}`}
                        className="p-1 text-darkGrey hover:text-darkRoyalBlue hover:bg-lightGrey rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedInstructor(instructor)
                          setShowDeleteModal(true)
                        }}
                        className="p-1 text-brightRed hover:bg-brightRed/5 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-softGrey">
          <User className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.softGrey }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
            {searchTerm ? 'No instructors found' : 'No instructors yet'}
          </h3>
          <p className="text-darkGrey/70 mb-6">
            {searchTerm ? 'Try a different search term' : 'Add your first instructor to get started'}
          </p>
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5"
            >
              Clear Search
            </button>
          ) : (
            <Link
              href="/lms/Admin_Portal/instructors/add"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white"
              style={{ backgroundColor: BRAND_COLORS.deepRed }}
            >
              <Plus className="w-4 h-4" />
              Add Instructor
            </Link>
          )}
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedInstructor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                Delete Instructor
              </h3>
              
              <p className="text-darkGrey mb-4">
                Are you sure you want to delete <strong>{selectedInstructor.name}</strong>?
              </p>
              
              <p className="text-sm text-darkGrey/70 mb-6">
                This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteInstructor}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg text-white flex items-center gap-2"
                  style={{ backgroundColor: BRAND_COLORS.brightRed }}
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}