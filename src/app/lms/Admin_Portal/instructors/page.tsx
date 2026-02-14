'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  Star,
  BookOpen,
  Users,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle,
  XCircle,
  Award,
  Calendar,
  User,
  Shield,
  Briefcase
} from 'lucide-react'
/* eslint-disable */

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

type Instructor = {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: string;
  qualification: string;
  bio: string;
  status: 'active' | 'inactive';
  rating: number;
  assignedCourse: {
    id: string;
    title: string;
    category: string;
    duration: string;
  } | null;
  totalStudents: number;
  createdAt: string;
  updatedAt: string;
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Load instructors from LocalStorage
  useEffect(() => {
    const loadInstructors = () => {
      try {
        const savedInstructors = localStorage.getItem('lms_instructors')
        if (savedInstructors) {
          setInstructors(JSON.parse(savedInstructors))
        }
      } catch (error) {
        console.error('Error loading instructors:', error)
      } finally {
        setLoading(false)
      }
    }

    loadInstructors()
  }, [])

  // Filter instructors
  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = 
      instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.qualification.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || instructor.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  // Get stats
  const activeInstructors = instructors.filter(i => i.status === 'active').length
  const totalStudents = instructors.reduce((sum, i) => sum + (i.totalStudents || 0), 0)
  const averageRating = instructors.length > 0 
    ? (instructors.reduce((sum, i) => sum + i.rating, 0) / instructors.length).toFixed(1)
    : '0.0'

  // Delete instructor
  const handleDeleteInstructor = () => {
    if (!selectedInstructor) return

    const updatedInstructors = instructors.filter(i => i.id !== selectedInstructor.id)
    setInstructors(updatedInstructors)
    localStorage.setItem('lms_instructors', JSON.stringify(updatedInstructors))

    // Also remove from instructor_users
    const instructorUsers = JSON.parse(localStorage.getItem('instructor_users') || '[]')
    const updatedUsers = instructorUsers.filter((user: any) => user.email !== selectedInstructor.email)
    localStorage.setItem('instructor_users', JSON.stringify(updatedUsers))

    setShowDeleteModal(false)
    setSelectedInstructor(null)
    
    alert(`Instructor ${selectedInstructor.name} deleted successfully!`)
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    return status === 'active' ? BRAND_COLORS.teal : BRAND_COLORS.brightRed
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-darkRoyalBlue"></div>
          <p className="mt-4 text-darkGrey">Loading instructors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8 px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-softGrey p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold truncate" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                Instructor Management
              </h1>
              <p className="text-sm sm:text-base text-darkGrey mt-1 truncate">
                Manage all instructors, view details, and assign courses
              </p>
            </div>

            <Link
              href="/lms/Admin_Portal/instructors/add"
              className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-3 rounded-xl font-medium text-sm sm:text-base transition-all hover:scale-105 hover:shadow-md"
              style={{ 
                backgroundColor: BRAND_COLORS.deepRed,
                color: BRAND_COLORS.white
              }}
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Add New Instructor
            </Link>
          </div>

          <div className="h-1 w-14 rounded-full mx-auto sm:mx-0" style={{ backgroundColor: BRAND_COLORS.deepRed }}></div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bg-white rounded-2xl border border-softGrey p-5 shadow-sm transition-shadow max-w-full mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          {/* Total Instructors */}
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue }} />
            <div>
              <p className="text-sm sm:text-base font-medium text-darkGrey truncate">Total Instructors</p>
              <p className="text-xl sm:text-2xl font-bold truncate" style={{ color: BRAND_COLORS.darkNavy }}>
                {instructors.length}
              </p>
            </div>
          </div>

          {/* Active Instructors */}
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: BRAND_COLORS.teal }} />
            <div>
              <p className="text-sm sm:text-base font-medium text-darkGrey truncate">Active Instructors</p>
              <p className="text-xl sm:text-2xl font-bold truncate" style={{ color: BRAND_COLORS.darkNavy }}>
                {activeInstructors}
              </p>
            </div>
          </div>

          {/* Average Rating */}
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: BRAND_COLORS.teal }} />
            <div>
              <p className="text-sm sm:text-base font-medium text-darkGrey truncate">Average Rating</p>
              <p className="text-xl sm:text-2xl font-bold truncate" style={{ color: BRAND_COLORS.darkNavy }}>
                {averageRating}
              </p>
            </div>
          </div>

          {/* Total Students */}
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: BRAND_COLORS.deepRed }} />
            <div>
              <p className="text-sm sm:text-base font-medium text-darkGrey truncate">Total Students</p>
              <p className="text-xl sm:text-2xl font-bold truncate" style={{ color: BRAND_COLORS.darkNavy }}>
                {totalStudents}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-darkGrey/40" />
          <input
            type="text"
            placeholder="Search instructors by name, email, specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-softGrey rounded-lg focus:outline-none focus:ring-2 focus:ring-darkRoyalBlue/20 focus:border-darkRoyalBlue"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-darkGrey/60" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-softGrey rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-darkRoyalBlue/20"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Instructors Table */}
      <div className="mb-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
          All Instructors ({filteredInstructors.length})
        </h2>

        {filteredInstructors.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-softGrey">
            <table className="min-w-full table-fixed divide-y divide-softGrey">
              <thead className="bg-darkRoyalBlue">
                <tr>
                  <th className="w-1/4 px-4 py-3 text-left text-sm font-medium text-white">Name</th>
                  <th className="w-1/6 px-4 py-3 text-left text-sm font-medium text-white">Email</th>
                  <th className="w-1/6 px-4 py-3 text-left text-sm font-medium text-white">Specialization</th>
                  <th className="w-1/12 px-4 py-3 text-left text-sm font-medium text-white">Status</th>
                  <th className="w-1/12 px-4 py-3 text-left text-sm font-medium text-white">Rating</th>
                  <th className="w-1/4 px-4 py-3 text-left text-sm font-medium text-white">Assigned Course</th>
                  <th className="w-1/12 px-4 py-3 text-left text-sm font-medium text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-softGrey">
                {filteredInstructors.map((instructor) => (
                  <tr key={instructor.id} className="hover:bg-lightGrey transition-colors">
                    {/* Name with avatar */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${BRAND_COLORS.deepRed}10` }}
                        >
                          <User className="w-5 h-5" style={{ color: BRAND_COLORS.deepRed }} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-darkGrey truncate">{instructor.name}</div>
                          <div className="text-xs text-darkGrey/70 truncate">{instructor.qualification}</div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 text-sm text-darkGrey truncate" title={instructor.email}>
                      {instructor.email}
                    </td>

                    {/* Specialization */}
                    <td className="px-4 py-3 text-sm text-darkGrey truncate" title={instructor.specialization}>
                      {instructor.specialization}
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                        style={{
                          backgroundColor: `${getStatusColor(instructor.status)}20`,
                          color: getStatusColor(instructor.status)
                        }}
                      >
                        {instructor.status === "active" ? (
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

                    {/* Rating stars */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(instructor.rating) ? "text-amber-400 fill-amber-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-xs font-medium text-darkGrey ml-1">
                          {instructor.rating.toFixed(1)}
                        </span>
                      </div>
                    </td>

                    {/* Assigned Course */}
                    <td className="px-4 py-3 text-sm text-darkGrey">
                      {instructor.assignedCourse ? (
                        <div className="space-y-1">
                          <div className="font-medium truncate" title={instructor.assignedCourse.title}>
                            {instructor.assignedCourse.title}
                          </div>
                          <div className="flex items-center justify-between text-xs text-darkGrey/70">
                            <span className="truncate max-w-[60%]" title={instructor.assignedCourse.category}>
                              {instructor.assignedCourse.category}
                            </span>
                            <span className="whitespace-nowrap ml-2">{instructor.assignedCourse.duration}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-darkGrey/50">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/lms/Admin_Portal/instructors/edit/${instructor.id}`}
                          className="p-1.5 text-darkGrey hover:text-darkRoyalBlue hover:bg-lightGrey rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedInstructor(instructor);
                            setShowDeleteModal(true);
                          }}
                          className="p-1.5 text-brightRed hover:bg-brightRed/5 rounded-lg transition-colors"
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
              {searchTerm ? "No matching instructors found" : "No instructors yet"}
            </h3>
            <p className="text-darkGrey/70 mb-6 max-w-md mx-auto">
              {searchTerm ? "Try a different search term" : "Add your first instructor to get started"}
            </p>
            <Link
              href="/lms/Admin_Portal/instructors/add"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: BRAND_COLORS.deepRed,
                color: BRAND_COLORS.white,
              }}
            >
              <Plus className="w-5 h-5" />
              Add Your First Instructor
            </Link>
          </div>
        )}
      </div>

    

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedInstructor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-softGrey">
            <div className="p-4 border-b border-softGrey flex justify-between items-center bg-lightGrey">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>Delete Instructor</h3>
                <p className="text-sm text-darkGrey/70">Confirm deletion</p>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-2 text-darkGrey hover:text-darkGrey hover:bg-white rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" 
                  style={{ backgroundColor: `${BRAND_COLORS.brightRed}10` }}>
                  <User className="w-5 h-5" style={{ color: BRAND_COLORS.brightRed }} />
                </div>
                <div>
                  <h4 className="font-semibold text-darkGrey">{selectedInstructor.name}</h4>
                  <p className="text-sm text-darkGrey/70">{selectedInstructor.email}</p>
                </div>
              </div>

              <div className="bg-lightGrey rounded-lg p-4 mb-6">
                <p className="text-sm text-darkGrey mb-2">
                  <strong>Warning:</strong> This action cannot be undone.
                </p>
                <ul className="text-sm text-darkGrey/70 space-y-1">
                  <li>• Instructor will be removed from the system</li>
                  <li>• Login credentials will be revoked</li>
                  <li>• Course assignment will be removed</li>
                  <li>• All related data will be deleted</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteInstructor}
                  className="px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: BRAND_COLORS.brightRed, color: BRAND_COLORS.white }}
                >
                  Delete Instructor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}