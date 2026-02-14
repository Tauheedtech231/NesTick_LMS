'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Save, X, Plus, Trash2, Calendar } from 'lucide-react'
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

export default function CreateAssignmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [instructor, setInstructor] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  
  const [assignment, setAssignment] = useState({
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
    totalPoints: 100,
    attachments: [''] as string[],
    status: 'draft' as 'draft' | 'published'
  })

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

        // Load assigned course
        const courses = JSON.parse(localStorage.getItem('lms_courses') || '[]')
        const courseId = currentUser.courseId || currentUser.assignedCourseId
        const assignedCourse = courses.find((c: any) => c.id === courseId)
        setCourse(assignedCourse)
        
        // Set default due date (7 days from now)
        const defaultDueDate = new Date()
        defaultDueDate.setDate(defaultDueDate.getDate() + 7)
        setAssignment(prev => ({
          ...prev,
          dueDate: defaultDueDate.toISOString().slice(0, 16)
        }))
        
      } catch (error) {
        console.error('Error loading instructor data:', error)
      }
    }

    loadInstructorData()
  }, [router])

  const handleAddAttachment = () => {
    setAssignment({ ...assignment, attachments: [...assignment.attachments, ''] })
  }

  const handleRemoveAttachment = (index: number) => {
    const newAttachments = assignment.attachments.filter((_, i) => i !== index)
    setAssignment({ ...assignment, attachments: newAttachments })
  }

  const handleAttachmentChange = (index: number, value: string) => {
    const newAttachments = [...assignment.attachments]
    newAttachments[index] = value
    setAssignment({ ...assignment, attachments: newAttachments })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!assignment.title.trim()) {
      alert('Please enter assignment title')
      return
    }
    
    if (!assignment.instructions.trim()) {
      alert('Please enter assignment instructions')
      return
    }
    
    if (!assignment.dueDate) {
      alert('Please select due date')
      return
    }

    setLoading(true)

    try {
      // Create assignment object
      const assignmentId = `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const newAssignment = {
        id: assignmentId,
        ...assignment,
        attachments: assignment.attachments.filter(a => a.trim() !== ''),
        instructorId: instructor.id,
        instructorName: instructor.name,
        courseId: instructor.courseId,
        courseTitle: course?.title || 'Course',
        submissions: 0,
        graded: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Save to localStorage
      const existingAssignments = JSON.parse(localStorage.getItem('instructor_assignments') || '[]')
      const updatedAssignments = [...existingAssignments, newAssignment]
      localStorage.setItem('instructor_assignments', JSON.stringify(updatedAssignments))

      // Save activity
      const activity = {
        id: `activity_${Date.now()}`,
        type: 'assignment',
        title: newAssignment.title,
        description: 'Assignment created',
        courseId: instructor.courseId,
        instructorId: instructor.id,
        timestamp: new Date().toISOString(),
        action: 'created',
        metadata: newAssignment
      }

      const existingActivities = JSON.parse(localStorage.getItem('instructor_activities') || '[]')
      const updatedActivities = [...existingActivities, activity]
      localStorage.setItem('instructor_activities', JSON.stringify(updatedActivities))

      alert(`Assignment ${assignment.status === 'published' ? 'published' : 'saved as draft'} successfully!`)
      router.push('/lms/Instructor_Portal/assignments')
      
    } catch (error) {
      console.error('Error creating assignment:', error)
      alert('Failed to create assignment')
    } finally {
      setLoading(false)
    }
  }

  if (!instructor || !course) {
    return <div className="min-h-screen bg-white p-4 sm:p-6">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-lightGrey rounded-xl p-4 sm:p-6 border border-softGrey">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <Link
                href="/lms/Instructor_Portal/assignments"
                className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                  Create Assignment
                </h1>
                <p className="text-sm sm:text-base text-darkGrey mt-1">
                  For: {course.title}
                </p>
              </div>
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
                value={assignment.title}
                onChange={(e) => setAssignment({ ...assignment, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 text-sm sm:text-base"
                placeholder="e.g., Final Project Submission"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-darkGrey mb-2">
                Brief Description
              </label>
              <input
                type="text"
                value={assignment.description}
                onChange={(e) => setAssignment({ ...assignment, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 text-sm sm:text-base"
                placeholder="Short description of the assignment"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-darkGrey mb-2">
                Detailed Instructions *
              </label>
              <textarea
                required
                value={assignment.instructions}
                onChange={(e) => setAssignment({ ...assignment, instructions: e.target.value })}
                rows={6}
                className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 text-sm sm:text-base"
                placeholder="Provide detailed instructions for students..."
              />
              <p className="text-xs text-darkGrey/70 mt-1">
                You can use markdown formatting for better readability
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-darkGrey mb-2">
                  Due Date & Time *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-darkGrey/50" />
                  <input
                    type="datetime-local"
                    required
                    value={assignment.dueDate}
                    onChange={(e) => setAssignment({ ...assignment, dueDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 text-sm sm:text-base"
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
                  value={assignment.totalPoints}
                  onChange={(e) => setAssignment({ ...assignment, totalPoints: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Attachments */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <label className="block text-sm font-medium text-darkGrey">
                  Attachment URLs (Optional)
                </label>
                <button
                  type="button"
                  onClick={handleAddAttachment}
                  className="flex items-center gap-1 text-sm text-darkRoyalBlue hover:text-darkRoyalBlue/80 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  Add URL
                </button>
              </div>
              
              <div className="space-y-2">
                {assignment.attachments.map((attachment, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      value={attachment}
                      onChange={(e) => handleAttachmentChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 text-sm sm:text-base"
                      placeholder={`https://example.com/resource-${index + 1}.pdf`}
                    />
                    {assignment.attachments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        className="p-2 text-brightRed hover:bg-brightRed/5 rounded-lg transition-colors self-end sm:self-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-darkGrey/70 mt-1">
                Add links to PDFs, videos, or other resources
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-darkGrey mb-2">
                Status
              </label>
              <select
                value={assignment.status}
                onChange={(e) => setAssignment({ ...assignment, status: e.target.value as 'draft' | 'published' })}
                className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 bg-white text-sm sm:text-base"
              >
                <option value="draft">Save as Draft (Hidden from students)</option>
                <option value="published">Publish Now (Visible to students)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <Link
            href="/lms/Instructor_Portal/assignments"
            className="px-6 py-3 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors font-medium text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            style={{ 
              backgroundColor: BRAND_COLORS.deepRed,
              color: BRAND_COLORS.white 
            }}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {assignment.status === 'published' ? 'Publishing...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {assignment.status === 'published' ? 'Publish Assignment' : 'Save as Draft'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}