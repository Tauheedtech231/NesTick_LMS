'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Download,
  BarChart,
  FileText,
  
  Star,
  CheckCircle,

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

export default function GradesPage() {
  const router = useRouter()
  const params = useParams()
  const assignmentId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [instructor, setInstructor] = useState<any>(null)
  const [assignment, setAssignment] = useState<any>(null)
  const [submissions, setSubmissions] = useState<any[]>([])

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
          alert('Assignment not found')
          router.push('/lms/Instructor_Portal/assignments')
          return
        }

        setAssignment(foundAssignment)

        // Load submissions for this assignment
        const allSubmissions = JSON.parse(localStorage.getItem('assignment_submissions') || '[]')
        const assignmentSubmissions = allSubmissions.filter((s: any) => 
          s.assignmentId === assignmentId
        )
        
        setSubmissions(assignmentSubmissions)
        
      } catch (error) {
        console.error('Error loading grades:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [assignmentId, router])

  const calculateStats = () => {
    const gradedSubmissions = submissions.filter(s => s.status === 'graded' && s.grade !== undefined)
    
    if (gradedSubmissions.length === 0) {
      return {
        average: 0,
        highest: 0,
        lowest: 0,
        gradedCount: 0,
        totalCount: submissions.length
      }
    }
    
    const grades = gradedSubmissions.map(s => s.grade)
    const average = grades.reduce((sum, grade) => sum + grade, 0) / grades.length
    const highest = Math.max(...grades)
    const lowest = Math.min(...grades)
    
    return {
      average: parseFloat(average.toFixed(2)),
      highest,
      lowest,
      gradedCount: gradedSubmissions.length,
      totalCount: submissions.length
    }
  }

  const stats = calculateStats()

  const handleExportGrades = () => {
    const csvData = [
      ['Student Name', 'Student Email', 'Grade', 'Total Points', 'Feedback', 'Submission Date', 'Graded Date'],
      ...submissions.map(s => [
        s.studentName,
        s.studentEmail,
        s.grade || 'Not graded',
        assignment.totalPoints,
        s.feedback || '',
        new Date(s.submittedAt).toLocaleDateString(),
        s.gradedAt ? new Date(s.gradedAt).toLocaleDateString() : ''
      ])
    ]
    
    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `grades_${assignment.title}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
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

  if (!assignment) {
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
                href="/lms/Instructor_Portal/assignments"
                className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                  Grades: {assignment.title}
                </h1>
                <p className="text-darkGrey mt-1">
                  View and manage student grades
                </p>
              </div>
            </div>
            <button
              onClick={handleExportGrades}
              className="flex items-center gap-2 px-4 py-2 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: BRAND_COLORS.deepRed }}></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Average Grade</p>
              <h3 className="text-2xl font-bold text-darkNavy">{stats.average}</h3>
              <p className="text-xs text-darkGrey/70">out of {assignment.totalPoints}</p>
            </div>
            <BarChart className="w-8 h-8 text-darkRoyalBlue" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Highest Grade</p>
              <h3 className="text-2xl font-bold text-darkNavy">{stats.highest}</h3>
              <p className="text-xs text-darkGrey/70">out of {assignment.totalPoints}</p>
            </div>
            <Star className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Lowest Grade</p>
              <h3 className="text-2xl font-bold text-darkNavy">{stats.lowest}</h3>
              <p className="text-xs text-darkGrey/70">out of {assignment.totalPoints}</p>
            </div>
            <Star className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Grading Progress</p>
              <h3 className="text-2xl font-bold text-darkNavy">{stats.gradedCount}/{stats.totalCount}</h3>
              <p className="text-xs text-darkGrey/70">
                {stats.totalCount > 0 ? Math.round((stats.gradedCount / stats.totalCount) * 100) : 0}% complete
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-teal" style={{ color: BRAND_COLORS.teal }} />
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-lg border border-softGrey overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-lightGrey">
                <th className="text-left p-4 text-sm font-medium text-darkGrey">Student</th>
                <th className="text-left p-4 text-sm font-medium text-darkGrey">Status</th>
                <th className="text-left p-4 text-sm font-medium text-darkGrey">Grade</th>
                <th className="text-left p-4 text-sm font-medium text-darkGrey">Percentage</th>
                <th className="text-left p-4 text-sm font-medium text-darkGrey">Feedback</th>
                <th className="text-left p-4 text-sm font-medium text-darkGrey">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-softGrey">
              {submissions.map(submission => (
                <tr key={submission.id} className="hover:bg-lightGrey">
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-darkGrey">{submission.studentName}</div>
                      <div className="text-sm text-darkGrey/70">{submission.studentEmail}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      submission.status === 'graded' 
                        ? 'bg-green-100 text-green-800'
                        : submission.status === 'late'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    {submission.grade !== undefined ? (
                      <div className="font-medium text-darkGrey">
                        {submission.grade}/{assignment.totalPoints}
                      </div>
                    ) : (
                      <div className="text-darkGrey/70">Not graded</div>
                    )}
                  </td>
                  <td className="p-4">
                    {submission.grade !== undefined ? (
                      <div className="font-medium text-darkGrey">
                        {((submission.grade / assignment.totalPoints) * 100).toFixed(1)}%
                      </div>
                    ) : (
                      <div className="text-darkGrey/70">-</div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="max-w-xs truncate text-sm text-darkGrey/70">
                      {submission.feedback || 'No feedback'}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/lms/Instructor_Portal/assignments/submissions/${assignmentId}`}
                        className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-lightGrey rounded-lg"
                        title="View Submission"
                      >
                        <FileText className="w-4 h-4" />
                      </Link>
                      {submission.status !== 'graded' && (
                        <button
                          onClick={() => {
                            // Navigate to submissions page for grading
                            router.push(`/lms/Instructor_Portal/assignments/submissions/${assignmentId}`)
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Grade"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {submissions.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.softGrey }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
              No Submissions Yet
            </h3>
            <p className="text-darkGrey/70">
              Students haven't submitted any work for this assignment yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}