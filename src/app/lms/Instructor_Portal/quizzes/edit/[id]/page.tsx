// app/lms/Instructor_Portal/quizzes/edit/[id]/page.tsx
'use client'
/* eslint-disable */

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  HiArrowLeft, HiCalendar, HiBookOpen, 
  HiSave, HiChevronDown
} from 'react-icons/hi'
import { toast, Toaster } from 'react-hot-toast'

interface Quiz {
  id: string
  courseId: string
  title: string
  description: string
  type: 'assignment' | 'quiz'
  totalMarks: number
  dueDate: string
  createdAt: string
  createdBy: string
  instructions?: string
  duration?: number
  status: 'active' | 'draft' | 'graded'
}

interface Course {
  id: string
  title: string
  code: string
}

export default function EditQuizPage() {
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    totalMarks: 50,
    dueDate: '',
    instructions: '',
    duration: 30,
    status: 'active' as 'active' | 'draft' | 'graded'
  })
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    loadData()
  }, [])

  const loadData = () => {
    try {
      // Get current instructor
      const userData = localStorage.getItem('currentUser')
      let currentUser = null
      if (userData) {
        currentUser = JSON.parse(userData)
      }

      // Get assigned courses
      const allCourses = JSON.parse(localStorage.getItem('courses') || '[]')
      const allInstructors = JSON.parse(localStorage.getItem('instructors') || '[]')
      
      let assignedCourses: Course[] = []
      
      if (currentUser?.email === 'instructor@gmail.com') {
        assignedCourses = allCourses
      } else if (currentUser?.role === 'instructor') {
        const instructorDetails = allInstructors.find((instr: any) => 
          instr.email === currentUser.email || instr.id === currentUser.instructorId
        )
        
        if (instructorDetails?.assignedCourseIds) {
          assignedCourses = allCourses.filter((course: Course) => 
            instructorDetails.assignedCourseIds.includes(course.id)
          )
        }
      }
      
      setCourses(assignedCourses)

      // Get quiz to edit
      const allAssignments = JSON.parse(localStorage.getItem('assignments') || '[]')
      const foundQuiz = allAssignments.find((q: Quiz) => q.id === quizId)
      
      if (!foundQuiz) {
        toast.error('Quiz not found')
        router.push('/lms/Instructor_Portal/quizzes')
        return
      }
      
      setQuiz(foundQuiz)
      
      // Set form data
      setFormData({
        courseId: foundQuiz.courseId,
        title: foundQuiz.title,
        description: foundQuiz.description,
        totalMarks: foundQuiz.totalMarks,
        dueDate: new Date(foundQuiz.dueDate).toISOString().slice(0, 16),
        instructions: foundQuiz.instructions || '',
        duration: foundQuiz.duration || 30,
        status: foundQuiz.status
      })

    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.courseId) {
      toast.error('Please select a course')
      return
    }

    if (!formData.title.trim()) {
      toast.error('Please enter quiz title')
      return
    }

    if (!formData.dueDate) {
      toast.error('Please select a due date')
      return
    }

    setLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update quiz in localStorage
      const allAssignments = JSON.parse(localStorage.getItem('assignments') || '[]')
      
      const updatedAssignments = allAssignments.map((q: Quiz) => {
        if (q.id === quizId) {
          return {
            ...q,
            courseId: formData.courseId,
            title: formData.title,
            description: formData.description,
            totalMarks: parseInt(formData.totalMarks.toString()),
            dueDate: new Date(formData.dueDate).toISOString(),
            instructions: formData.instructions,
            duration: formData.duration,
            status: formData.status,
            updatedAt: new Date().toISOString()
          }
        }
        return q
      })

      localStorage.setItem('assignments', JSON.stringify(updatedAssignments))
      
      toast.success('Quiz updated successfully!')
      
      setTimeout(() => {
        router.push('/lms/Instructor_Portal/quizzes')
      }, 1000)

    } catch (error) {
      console.error('Error updating quiz:', error)
      toast.error('Failed to update quiz')
    } finally {
      setLoading(false)
    }
  }

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    return course ? `${course.title} (${course.code})` : ''
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

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quiz Not Found</h2>
            <p className="text-gray-600 mb-6">The quiz you're trying to edit doesn't exist.</p>
            <Link
              href="/lms/Instructor_Portal/quizzes"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg"
            >
              Back to Quizzes
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-center" />
      
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/lms/Instructor_Portal/quizzes"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <HiArrowLeft className="w-5 h-5 mr-2" />
              <span>Back to Quizzes</span>
            </Link>
            
            <h1 className="text-2xl font-bold text-gray-900">Edit Quiz</h1>
            <p className="text-gray-600 mt-1">
              Update quiz details
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-gray-300 rounded-lg p-6">
            {/* Course Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course *
              </label>
              <div className="relative">
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title} ({course.code})
                    </option>
                  ))}
                </select>
                <HiChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter quiz title"
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
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Brief description..."
              />
            </div>

            {/* Instructions */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Detailed instructions for students..."
              />
            </div>

            {/* Quiz Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Marks *
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.totalMarks}
                  onChange={(e) => setFormData({...formData, totalMarks: parseInt(e.target.value) || 50})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 30})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date *
                </label>
                <div className="relative">
                  <HiCalendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="relative">
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="graded">Graded</option>
                </select>
                <HiChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Course Info */}
            {formData.courseId && (
              <div className="mb-6 p-4 bg-gray-50 border border-gray-300 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Selected Course</h3>
                <div className="flex items-center gap-3">
                  <HiBookOpen className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900">{getCourseName(formData.courseId)}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-300">
              <Link
                href="/lms/Instructor_Portal/quizzes"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </Link>
              
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-lg font-medium flex-1 flex items-center justify-center gap-2 ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
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