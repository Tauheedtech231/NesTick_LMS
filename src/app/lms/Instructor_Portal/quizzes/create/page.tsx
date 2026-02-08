'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Save, X, Plus, Trash2, Calendar, Clock } from 'lucide-react'
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

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

export default function CreateQuizPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [instructor, setInstructor] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    duration: 30,
    totalQuestions: 0,
    totalPoints: 0,
    startDate: '',
    endDate: '',
    status: 'draft' as 'draft' | 'published'
  })

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: `q_${Date.now()}`,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 1
    }
  ])

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
        const courses = JSON.parse(localStorage.getItem('courses') || '[]')
        const courseId = currentUser.courseId || currentUser.assignedCourseId
        const assignedCourse = courses.find((c: any) => c.id === courseId)
        setCourse(assignedCourse)
        
        // Set default dates
        const now = new Date()
        const defaultStart = now.toISOString().slice(0, 16)
        const defaultEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
        
        setQuiz(prev => ({
          ...prev,
          startDate: defaultStart,
          endDate: defaultEnd
        }))
        
      } catch (error) {
        console.error('Error loading instructor data:', error)
      }
    }

    loadInstructorData()
  }, [router])

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 1
    }
    setQuestions([...questions, newQuestion])
  }

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) {
      alert('Quiz must have at least one question')
      return
    }
    const newQuestions = questions.filter((_, i) => i !== index)
    setQuestions(newQuestions)
  }

  // Fixed: Properly type the updateQuestion function
  const updateQuestion = (index: number, field: keyof Question, value: string | number | string[]) => {
    const newQuestions = [...questions]
    
    if (field === 'options' && Array.isArray(value)) {
      newQuestions[index].options = value
    } else if (field === 'question' && typeof value === 'string') {
      newQuestions[index].question = value
    } else if (field === 'correctAnswer' && typeof value === 'number') {
      newQuestions[index].correctAnswer = value
    } else if (field === 'points' && typeof value === 'number') {
      newQuestions[index].points = value
    } else if (field === 'id' && typeof value === 'string') {
      newQuestions[index].id = value
    }
    
    setQuestions(newQuestions)
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options[optionIndex] = value
    setQuestions(newQuestions)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!quiz.title.trim()) {
      alert('Please enter quiz title')
      return
    }
    
    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question.trim()) {
        alert(`Please enter question ${i + 1}`)
        return
      }
      
      const hasEmptyOptions = q.options.some(opt => !opt.trim())
      if (hasEmptyOptions) {
        alert(`Question ${i + 1} has empty options`)
        return
      }
    }
    
    if (!quiz.startDate || !quiz.endDate) {
      alert('Please select start and end dates')
      return
    }

    setLoading(true)

    try {
      // Calculate totals
      const totalQuestions = questions.length
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)
      
      // Create quiz object
      const quizId = `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const newQuiz = {
        id: quizId,
        ...quiz,
        totalQuestions,
        totalPoints,
        instructorId: instructor.id,
        instructorName: instructor.name || instructor.fullName,
        courseId: instructor.courseId || instructor.assignedCourseId,
        courseTitle: course?.title || 'Course',
        questions,
        attempts: 0,
        averageScore: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Save to localStorage
      const existingQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
      const updatedQuizzes = [...existingQuizzes, newQuiz]
      localStorage.setItem('quizzes', JSON.stringify(updatedQuizzes))

      // Also save to instructor_quizzes
      const existingInstructorQuizzes = JSON.parse(localStorage.getItem('instructor_quizzes') || '[]')
      localStorage.setItem('instructor_quizzes', JSON.stringify([...existingInstructorQuizzes, newQuiz]))

      // Save activity
      const activity = {
        id: `activity_${Date.now()}`,
        type: 'quiz',
        title: newQuiz.title,
        description: 'Quiz created',
        courseId: instructor.courseId || instructor.assignedCourseId,
        instructorId: instructor.id,
        timestamp: new Date().toISOString(),
        action: 'created',
        metadata: newQuiz
      }

      const existingActivities = JSON.parse(localStorage.getItem('instructor_activities') || '[]')
      const updatedActivities = [...existingActivities, activity]
      localStorage.setItem('instructor_activities', JSON.stringify(updatedActivities))

      alert(`Quiz ${quiz.status === 'published' ? 'published' : 'saved as draft'} successfully!`)
      router.push('/lms/Instructor_Portal/quizzes')
      
    } catch (error) {
      console.error('Error creating quiz:', error)
      alert('Failed to create quiz')
    } finally {
      setLoading(false)
    }
  }

  if (!instructor) {
    return <div className="min-h-screen bg-white p-6">Loading...</div>
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
                <X className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                  Create Quiz
                </h1>
                <p className="text-darkGrey mt-1">
                  For: {course?.title || 'Course'}
                </p>
              </div>
            </div>
          </div>
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: BRAND_COLORS.deepRed }}></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {/* Quiz Details */}
        <div className="bg-white rounded-lg border border-softGrey p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
            Quiz Details
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-darkGrey mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={quiz.title}
                onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                placeholder="e.g., Chapter 1 Assessment"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-darkGrey mb-2">
                Description
              </label>
              <textarea
                value={quiz.description}
                onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                placeholder="Brief description of the quiz..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-darkGrey mb-2">
                  Duration (minutes) *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-darkGrey/50" />
                  <input
                    type="number"
                    required
                    min="1"
                    max="300"
                    value={quiz.duration}
                    onChange={(e) => setQuiz({ ...quiz, duration: parseInt(e.target.value) })}
                    className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-darkGrey mb-2">
                  Start Date & Time *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-darkGrey/50" />
                  <input
                    type="datetime-local"
                    required
                    value={quiz.startDate}
                    onChange={(e) => setQuiz({ ...quiz, startDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-darkGrey mb-2">
                  End Date & Time *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-darkGrey/50" />
                  <input
                    type="datetime-local"
                    required
                    value={quiz.endDate}
                    onChange={(e) => setQuiz({ ...quiz, endDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-darkGrey mb-2">
                Status
              </label>
              <select
                value={quiz.status}
                onChange={(e) => setQuiz({ ...quiz, status: e.target.value as 'draft' | 'published' })}
                className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 bg-white"
              >
                <option value="draft">Save as Draft (Hidden from students)</option>
                <option value="published">Publish Now (Visible to students)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-lg border border-softGrey p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
              Questions ({questions.length})
            </h2>
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-2 px-4 py-2 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>

          <div className="space-y-6">
            {questions.map((question, qIndex) => (
              <div key={question.id} className="p-4 border border-softGrey rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-darkGrey">Question {qIndex + 1}</h3>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="p-1 text-brightRed hover:bg-brightRed/5 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">
                      Question *
                    </label>
                    <textarea
                      required
                      value={question.question}
                      onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                      placeholder="Enter the question..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-darkGrey mb-2">
                        Points *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="100"
                        value={question.points}
                        onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                        className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-darkGrey mb-2">
                        Correct Answer *
                      </label>
                      <select
                        value={question.correctAnswer}
                        onChange={(e) => updateQuestion(qIndex, 'correctAnswer', parseInt(e.target.value))}
                        className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 bg-white"
                      >
                        {question.options.map((_, index) => (
                          <option key={index} value={index}>
                            Option {index + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">
                      Options *
                    </label>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <div className="w-6 h-6 flex items-center justify-center bg-lightGrey rounded text-sm">
                            {String.fromCharCode(65 + oIndex)}
                          </div>
                          <input
                            type="text"
                            required
                            value={option}
                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                            className="flex-1 px-4 py-2 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                            placeholder={`Option ${oIndex + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz Summary */}
        <div className="bg-white rounded-lg border border-softGrey p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
            Quiz Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-lightGrey rounded-lg">
              <div className="text-2xl font-bold text-darkNavy">{questions.length}</div>
              <div className="text-sm text-darkGrey/70">Total Questions</div>
            </div>
            <div className="text-center p-4 bg-lightGrey rounded-lg">
              <div className="text-2xl font-bold text-darkNavy">
                {questions.reduce((sum, q) => sum + q.points, 0)}
              </div>
              <div className="text-sm text-darkGrey/70">Total Points</div>
            </div>
            <div className="text-center p-4 bg-lightGrey rounded-lg">
              <div className="text-2xl font-bold text-darkNavy">{quiz.duration}</div>
              <div className="text-sm text-darkGrey/70">Minutes</div>
            </div>
            <div className="text-center p-4 bg-lightGrey rounded-lg">
              <div className="text-2xl font-bold text-darkNavy">
                {questions.filter(q => q.question.trim()).length}/{questions.length}
              </div>
              <div className="text-sm text-darkGrey/70">Questions Ready</div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Link
            href="/lms/Instructor_Portal/quizzes"
            className="px-6 py-3 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: BRAND_COLORS.deepRed,
              color: BRAND_COLORS.white 
            }}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {quiz.status === 'published' ? 'Publishing...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {quiz.status === 'published' ? 'Publish Quiz' : 'Save as Draft'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}