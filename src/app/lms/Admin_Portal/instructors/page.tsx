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
  const totalStudents = instructors.reduce((sum, i) => sum + i.totalStudents, 0)
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
      <div className="mb-8">
        <div className="bg-lightGrey rounded-xl p-6 border border-softGrey">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                Instructor Management
              </h1>
              <p className="text-darkGrey mt-1">
                Manage all instructors, view details, and assign courses
              </p>
            </div>
            <Link
              href="/lms/Admin_Portal/instructors/add"
              className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors"
              style={{ 
                backgroundColor: BRAND_COLORS.deepRed,
                color: BRAND_COLORS.white 
              }}
            >
              <Plus className="w-5 h-5" />
              Add New Instructor
            </Link>
          </div>
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: BRAND_COLORS.deepRed }}></div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-softGrey p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-darkGrey">Total Instructors</p>
              <p className="text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
                {instructors.length}
              </p>
            </div>
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}10` }}>
              <User className="w-5 h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-softGrey p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-darkGrey">Active Instructors</p>
              <p className="text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
                {activeInstructors}
              </p>
            </div>
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.teal}10` }}>
              <CheckCircle className="w-5 h-5" style={{ color: BRAND_COLORS.teal }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-softGrey p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-darkGrey">Total Students</p>
              <p className="text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
                {totalStudents}
              </p>
            </div>
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}10` }}>
              <Users className="w-5 h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-softGrey p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-darkGrey">Average Rating</p>
              <p className="text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
                {averageRating}
              </p>
            </div>
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.teal}10` }}>
              <Star className="w-5 h-5" style={{ color: BRAND_COLORS.teal }} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border border-softGrey p-5 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: BRAND_COLORS.darkGrey }} />
              <input
                type="text"
                placeholder="Search instructors by name, email, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
              />
            </div>
          </div>
          
          <div className="w-full md:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: BRAND_COLORS.darkGrey }} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 bg-white appearance-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Instructors Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
            All Instructors ({filteredInstructors.length})
          </h2>
          <span className="text-sm text-darkGrey">
            Showing {filteredInstructors.length} of {instructors.length} instructors
          </span>
        </div>

        {filteredInstructors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInstructors.map((instructor) => (
              <div 
                key={instructor.id}
                className="bg-white rounded-lg border border-softGrey overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-softGrey">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                        style={{ backgroundColor: `${BRAND_COLORS.deepRed}10` }}>
                        <User className="w-6 h-6" style={{ color: BRAND_COLORS.deepRed }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-darkGrey">{instructor.name}</h3>
                        <p className="text-sm text-darkGrey/70">{instructor.qualification}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setSelectedInstructor(instructor === selectedInstructor ? null : instructor)}
                        className="p-1 hover:bg-lightGrey rounded-lg"
                      >
                        <MoreVertical className="w-5 h-5 text-darkGrey/70" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {selectedInstructor?.id === instructor.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg border border-softGrey shadow-lg z-10">
                          <div className="py-1">
                            <Link
                              href={`/lms/Admin_Portal/instructors/edit/${instructor.id}`}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-darkGrey hover:bg-lightGrey hover:text-darkRoyalBlue"
                            >
                              <Edit className="w-4 h-4" />
                              Edit Instructor
                            </Link>
                            <button
                              onClick={() => {
                                setSelectedInstructor(instructor)
                                setShowDeleteModal(true)
                              }}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-brightRed hover:bg-brightRed/5 w-full text-left"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Instructor
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex justify-between items-center">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
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
                    
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < Math.floor(instructor.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                        />
                      ))}
                      <span className="text-xs font-medium text-darkGrey ml-1">
                        {instructor.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-darkGrey/70" />
                      <span className="text-darkGrey/80">{instructor.email}</span>
                    </div>
                    
                    {instructor.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-darkGrey/70" />
                        <span className="text-darkGrey/80">{instructor.phone}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="w-4 h-4 text-darkGrey/70" />
                      <span className="text-darkGrey/80">{instructor.specialization}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="w-4 h-4 text-darkGrey/70" />
                      <span className="text-darkGrey/80">{instructor.experience} experience</span>
                    </div>
                  </div>

                  {/* Assigned Course */}
                  {instructor.assignedCourse && (
                    <div className="mt-4 pt-4 border-t border-softGrey">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-darkGrey">Assigned Course</span>
                        <BookOpen className="w-4 h-4 text-darkGrey/70" />
                      </div>
                      <div className="bg-lightGrey rounded-lg p-3">
                        <p className="font-medium text-darkGrey text-sm">
                          {instructor.assignedCourse.title}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-darkGrey/70">
                            {instructor.assignedCourse.category}
                          </span>
                          <span className="text-xs text-darkGrey/70">
                            {instructor.assignedCourse.duration}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Users className="w-3 h-3 text-darkGrey/70" />
                          <span className="text-xs text-darkGrey/70">
                            {instructor.totalStudents} students
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bio Preview */}
                  {instructor.bio && (
                    <div className="mt-4">
                      <p className="text-xs text-darkGrey/70 line-clamp-2">
                        {instructor.bio}
                      </p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-softGrey flex items-center justify-between">
                    <div className="text-xs text-darkGrey/70">
                      Added: {formatDate(instructor.createdAt)}
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/lms/Admin_Portal/instructors/edit/${instructor.id}`}
                        className="p-1.5 text-darkGrey hover:text-darkRoyalBlue hover:bg-lightGrey rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedInstructor(instructor)
                          setShowDeleteModal(true)
                        }}
                        className="p-1.5 text-brightRed hover:bg-brightRed/5 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-softGrey">
            <User className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.softGrey }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
              {searchTerm ? 'No matching instructors found' : 'No instructors yet'}
            </h3>
            <p className="text-darkGrey/70 mb-6 max-w-md mx-auto">
              {searchTerm 
                ? 'Try a different search term' 
                : 'Add your first instructor to get started'}
            </p>
            <Link
              href="/lms/Admin_Portal/instructors/add"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors"
              style={{ 
                backgroundColor: BRAND_COLORS.deepRed,
                color: BRAND_COLORS.white 
              }}
            >
              <Plus className="w-5 h-5" />
              Add Your First Instructor
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-softGrey p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-darkGrey">Need Help?</h3>
              <p className="text-sm text-darkGrey/70 mt-1">
                View instructor management guide
              </p>
            </div>
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}10` }}>
              <Shield className="w-5 h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
            </div>
          </div>
        </div>

        <Link
          href="/lms/Admin_Portal/courses"
          className="bg-white rounded-lg border border-softGrey p-5 hover:border-darkRoyalBlue transition-colors duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-darkGrey group-hover:text-darkRoyalBlue">
                Manage Courses
              </h3>
              <p className="text-sm text-darkGrey/70 mt-1">
                Add or edit courses for assignment
              </p>
            </div>
            <div className="p-2 rounded-lg group-hover:bg-darkRoyalBlue/10">
              <BookOpen className="w-5 h-5 text-darkGrey group-hover:text-darkRoyalBlue" />
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-lg border border-softGrey p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-darkGrey">Export Data</h3>
              <p className="text-sm text-darkGrey/70 mt-1">
                Export instructors list as CSV
              </p>
            </div>
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.teal}10` }}>
              <Calendar className="w-5 h-5" style={{ color: BRAND_COLORS.teal }} />
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedInstructor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-softGrey">
            <div className="p-4 border-b border-softGrey flex justify-between items-center bg-lightGrey">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
                  Delete Instructor
                </h3>
                <p className="text-sm text-darkGrey/70">
                  Confirm deletion
                </p>
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
                  style={{ 
                    backgroundColor: BRAND_COLORS.brightRed,
                    color: BRAND_COLORS.white 
                  }}
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