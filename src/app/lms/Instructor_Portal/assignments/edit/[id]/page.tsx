'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Save, X, Plus, Trash2, Calendar, ArrowLeft } from 'lucide-react'
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

export default function EditAssignmentPage() {
  const router = useRouter()
  const params = useParams()
  const assignmentId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [instructor, setInstructor] = useState<any>(null)
  const [assignment, setAssignment] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
    totalPoints: 100,
    attachments: [''] as string[],
    status: 'draft' as 'draft' | 'published'
  })

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

        // Load assignment
        const assignments = JSON.parse(localStorage.getItem('instructor_assignments') || '[]')
        const foundAssignment = assignments.find((a: any) => 
          a.id === assignmentId && a.instructorId === currentUser.id
        )
        
        if (!foundAssignment) {
          alert('Assignment not found or you dont have permission to edit it')
          router.push('/lms/Instructor_Portal/assignments')
          return
        }

        setAssignment(foundAssignment)
        setFormData({
          title: foundAssignment.title,
          description: foundAssignment.description,
          instructions: foundAssignment.instructions,
          dueDate: foundAssignment.dueDate.slice(0, 16),
          totalPoints: foundAssignment.totalPoints,
          attachments: foundAssignment.attachments && foundAssignment.attachments.length > 0 
            ? foundAssignment.attachments 
            : [''],
          status: foundAssignment.status
        })
        
      } catch (error) {
        console.error('Error loading assignment:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [assignmentId, router])

  const handleAddAttachment = () => {
    setFormData({ ...formData, attachments: [...formData.attachments, ''] })
  }

  const handleRemoveAttachment = (index: number) => {
    const newAttachments = formData.attachments.filter((_, i) => i !== index)
    setFormData({ ...formData, attachments: newAttachments })
  }

  const handleAttachmentChange = (index: number, value: string) => {
    const newAttachments = [...formData.attachments]
    newAttachments[index] = value
    setFormData({ ...formData, attachments: newAttachments })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('Please enter assignment title')
      return
    }
    
    if (!formData.instructions.trim()) {
      alert('Please enter assignment instructions')
      return
    }
    
    if (!formData.dueDate) {
      alert('Please select due date')
      return
    }

    setSaving(true)

    try {
      // Update assignment in localStorage
      const assignments = JSON.parse(localStorage.getItem('instructor_assignments') || '[]')
      const updatedAssignments = assignments.map((a: any) => {
        if (a.id === assignmentId) {
          return {
            ...a,
            ...formData,
            attachments: formData.attachments.filter(att => att.trim() !== ''),
            updatedAt: new Date().toISOString()
          }
        }
        return a
      })
      
      localStorage.setItem('instructor_assignments', JSON.stringify(updatedAssignments))

      // Save activity
      const activity = {
        id: `activity_${Date.now()}`,
        type: 'assignment',
        title: formData.title,
        description: 'Assignment updated',
        courseId: instructor.courseId,
        instructorId: instructor.id,
        timestamp: new Date().toISOString(),
        action: 'updated',
        metadata: formData
      }

      const existingActivities = JSON.parse(localStorage.getItem('instructor_activities') || '[]')
      const updatedActivities = [...existingActivities, activity]
      localStorage.setItem('instructor_activities', JSON.stringify(updatedActivities))

      alert('Assignment updated successfully!')
      router.push('/lms/Instructor_Portal/assignments')
      
    } catch (error) {
      console.error('Error updating assignment:', error)
      alert('Failed to update assignment')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-8 w-32 sm:w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return null
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-lightGrey rounded-xl p-4 sm:p-6 border border-softGrey">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/lms/Instructor_Portal/assignments"
                className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-white rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 block sm:hidden" />
                <X className="w-5 h-5 hidden sm:block" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                  Edit Assignment
                </h1>
                <p className="text-sm sm:text-base text-darkGrey mt-1">
                  Update assignment details
                </p>
              </div>
            </div>
            <div className="text-xs sm:text-sm text-darkGrey/70 ml-9 sm:ml-0">
              Created: {new Date(assignment.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: BRAND_COLORS.deepRed }}></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg border border-softGrey p-4 sm:p-6 mb-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
            Assignment Details
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
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                placeholder="Enter assignment title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-darkGrey mb-2">
                Brief Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                placeholder="Brief overview of the assignment"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-darkGrey mb-2">
                Detailed Instructions *
              </label>
              <textarea
                required
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                rows={6}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                placeholder="Provide detailed instructions for students..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-darkGrey mb-2">
                  Due Date & Time *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-darkGrey/50" />
                  <input
                    type="datetime-local"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-darkGrey mb-2">
                  Total Points *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="1000"
                  step="0.5"
                  value={formData.totalPoints}
                  onChange={(e) => setFormData({ ...formData, totalPoints: parseFloat(e.target.value) })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                />
              </div>
            </div>

            {/* Attachments */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <label className="block text-sm font-medium text-darkGrey">
                  Attachment URLs
                </label>
                <button
                  type="button"
                  onClick={handleAddAttachment}
                  className="flex items-center justify-center gap-1 text-sm text-darkRoyalBlue hover:text-darkRoyalBlue/80 py-1 px-2 rounded-lg hover:bg-darkRoyalBlue/5 w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  Add URL
                </button>
              </div>
              
              <div className="space-y-2">
                {formData.attachments.map((attachment, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={attachment}
                      onChange={(e) => handleAttachmentChange(index, e.target.value)}
                      className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                      placeholder="https://example.com/resource.pdf"
                    />
                    {formData.attachments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        className="p-2 text-brightRed hover:bg-brightRed/5 rounded-lg transition-colors flex-shrink-0"
                        aria-label="Remove attachment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-darkGrey mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 bg-white"
              >
                <option value="draft">Draft (Hidden from students)</option>
                <option value="published">Published (Visible to students)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Assignment Stats */}
        <div className="bg-white rounded-lg border border-softGrey p-4 sm:p-6 mb-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
            Assignment Statistics
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-lightGrey rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-darkNavy">{assignment.submissions || 0}</div>
              <div className="text-xs sm:text-sm text-darkGrey/70">Submissions</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-lightGrey rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-darkNavy">{assignment.graded || 0}</div>
              <div className="text-xs sm:text-sm text-darkGrey/70">Graded</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-lightGrey rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-darkNavy">
                {assignment.submissions ? Math.round((assignment.graded / assignment.submissions) * 100) : 0}%
              </div>
              <div className="text-xs sm:text-sm text-darkGrey/70">Progress</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-lightGrey rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-darkNavy">{assignment.totalPoints}</div>
              <div className="text-xs sm:text-sm text-darkGrey/70">Points</div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-4">
          <Link
            href={`/lms/Instructor_Portal/assignments/submissions/${assignmentId}`}
            className="w-full sm:w-auto px-4 sm:px-6 py-3 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors font-medium text-center text-sm sm:text-base"
          >
            View Submissions
          </Link>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <Link
              href="/lms/Instructor_Portal/assignments"
              className="w-full sm:w-auto px-4 sm:px-6 py-3 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors font-medium text-center text-sm sm:text-base"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              style={{ 
                backgroundColor: BRAND_COLORS.deepRed,
                color: BRAND_COLORS.white 
              }}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="sm:hidden">Saving...</span>
                  <span className="hidden sm:inline">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="sm:hidden">Update</span>
                  <span className="hidden sm:inline">Update Assignment</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}