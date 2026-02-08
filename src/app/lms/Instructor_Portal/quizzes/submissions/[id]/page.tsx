'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Download,
  BarChart,
  User,

  Clock,
  Award,
  FileText
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

export default function QuizResultsPage() {
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [instructor, setInstructor] = useState<any>(null)
  const [quiz, setQuiz] = useState<any>(null)
  const [results, setResults] = useState<any[]>([])

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

        // Load quiz
        const quizzes = JSON.parse(localStorage.getItem('instructor_quizzes') || '[]')
        const foundQuiz = quizzes.find((q: any) => 
          q.id === quizId && q.instructorId === currentUser.id
        )
        
        if (!foundQuiz) {
          alert('Quiz not found')
          router.push('/lms/Instructor_Portal/quizzes')
          return
        }

        setQuiz(foundQuiz)

        // Load quiz results
        const allResults = JSON.parse(localStorage.getItem('quiz_results') || '[]')
        const quizResults = allResults.filter((r: any) => r.quizId === quizId)
        
        setResults(quizResults)
        
      } catch (error) {
        console.error('Error loading quiz results:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [quizId, router])

  const calculateStats = () => {
    if (results.length === 0) {
      return {
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        completionRate: 0
      }
    }
    
    const scores = results.map(r => r.score)
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const highestScore = Math.max(...scores)
    const lowestScore = Math.min(...scores)
    
    return {
      averageScore: parseFloat(averageScore.toFixed(2)),
      highestScore,
      lowestScore,
      completionRate: results.length // In real app, this would be compared to total students
    }
  }

  const stats = calculateStats()

  const handleExportResults = () => {
    const csvData = [
      ['Student Name', 'Student Email', 'Score', 'Total Points', 'Percentage', 'Time Taken', 'Completed At'],
      ...results.map(r => [
        r.studentName,
        r.studentEmail,
        r.score,
        quiz.totalPoints,
        `${((r.score / quiz.totalPoints) * 100).toFixed(1)}%`,
        `${r.timeTaken} minutes`,
        new Date(r.completedAt).toLocaleDateString()
      ])
    ]
    
    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quiz_results_${quiz.title}_${new Date().toISOString().split('T')[0]}.csv`
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

  if (!quiz) {
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
                href="/lms/Instructor_Portal/quizzes"
                className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                  Results: {quiz.title}
                </h1>
                <p className="text-darkGrey mt-1">
                  View quiz results and student performance
                </p>
              </div>
            </div>
            <button
              onClick={handleExportResults}
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
              <p className="text-sm text-darkGrey/70">Total Attempts</p>
              <h3 className="text-2xl font-bold text-darkNavy">{results.length}</h3>
            </div>
            <User className="w-8 h-8 text-darkRoyalBlue" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Average Score</p>
              <h3 className="text-2xl font-bold text-darkNavy">{stats.averageScore}</h3>
              <p className="text-xs text-darkGrey/70">out of {quiz.totalPoints}</p>
            </div>
            <BarChart className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Highest Score</p>
              <h3 className="text-2xl font-bold text-darkNavy">{stats.highestScore}</h3>
              <p className="text-xs text-darkGrey/70">out of {quiz.totalPoints}</p>
            </div>
            <Award className="w-8 h-8 text-amber-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Lowest Score</p>
              <h3 className="text-2xl font-bold text-darkNavy">{stats.lowestScore}</h3>
              <p className="text-xs text-darkGrey/70">out of {quiz.totalPoints}</p>
            </div>
            <BarChart className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg border border-softGrey overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-lightGrey">
                <th className="text-left p-4 text-sm font-medium text-darkGrey">Student</th>
                <th className="text-left p-4 text-sm font-medium text-darkGrey">Score</th>
                <th className="text-left p-4 text-sm font-medium text-darkGrey">Percentage</th>
                <th className="text-left p-4 text-sm font-medium text-darkGrey">Time Taken</th>
                <th className="text-left p-4 text-sm font-medium text-darkGrey">Completed At</th>
                <th className="text-left p-4 text-sm font-medium text-darkGrey">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-softGrey">
              {results.map((result, index) => {
                const percentage = (result.score / quiz.totalPoints) * 100
                const getScoreColor = (percent: number) => {
                  if (percent >= 80) return 'text-green-600 bg-green-50'
                  if (percent >= 60) return 'text-amber-600 bg-amber-50'
                  return 'text-red-600 bg-red-50'
                }
                
                return (
                  <tr key={result.id} className="hover:bg-lightGrey">
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-darkGrey">{result.studentName}</div>
                        <div className="text-sm text-darkGrey/70">{result.studentEmail}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`px-2 py-1 rounded text-center ${getScoreColor(percentage)}`}>
                        {result.score}/{quiz.totalPoints}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-darkGrey">
                        {percentage.toFixed(1)}%
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-darkGrey/70">
                        <Clock className="w-4 h-4" />
                        {result.timeTaken} min
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-darkGrey/70">
                        {new Date(result.completedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        result.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : result.status === 'incomplete'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {result.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {results.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.softGrey }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
              No Results Yet
            </h3>
            <p className="text-darkGrey/70">
              Students haven't taken this quiz yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}