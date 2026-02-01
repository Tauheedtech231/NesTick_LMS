'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  HiArrowLeft, HiCalendar, HiBookOpen, 
  HiSave, HiChevronDown, HiPlus, HiTrash
} from 'react-icons/hi'
import { toast, Toaster } from 'react-hot-toast'

interface Course {
  id: string
  title: string
  code: string
}

interface MCQQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  marks: number
}
/* eslint-disable */

export default function EditQuizPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [questions, setQuestions] = useState<MCQQuestion[]>([
    { id: 'q1', question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 1 }
  ])
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    dueDate: '',
    instructions: '',
    duration: 30,
    status: 'active' as 'active' | 'draft'
  })
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    loadCourses()
    loadQuiz()
  }, [])

  const loadCourses = () => {
    try {
      const userData = localStorage.getItem('currentUser')
      let currentUser = null
      if (userData) {
        currentUser = JSON.parse(userData)
      }

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

    } catch (error) {
      console.error('Error loading courses:', error)
      toast.error('Failed to load courses')
    }
  }

  const loadQuiz = () => {
    try {
      const allQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
      const foundQuiz = allQuizzes.find((q: any) => q.id === params.id)
      
      if (foundQuiz) {
        setFormData({
          courseId: foundQuiz.courseId,
          title: foundQuiz.title,
          description: foundQuiz.description,
          dueDate: foundQuiz.dueDate,
          instructions: foundQuiz.instructions,
          duration: foundQuiz.duration,
          status: foundQuiz.status
        })
        
        if (foundQuiz.questions) {
          setQuestions(foundQuiz.questions)
        }
      } else {
        toast.error('Quiz not found')
        router.push('/lms/Instructor_Portal/quizzes')
      }
    } catch (error) {
      console.error('Error loading quiz:', error)
      toast.error('Failed to load quiz')
    }
  }

  const addQuestion = () => {
    const newId = `q${Date.now()}`
    setQuestions([
      ...questions,
      { id: newId, question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 1 }
    ])
  }

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index)
      setQuestions(newQuestions)
    } else {
      toast.error('Quiz must have at least one question')
    }
  }

  const updateQuestion = (index: number, field: keyof MCQQuestion, value: any) => {
    const newQuestions = [...questions]
    newQuestions[index] = { ...newQuestions[index], [field]: value }
    setQuestions(newQuestions)
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options[optionIndex] = value
    setQuestions(newQuestions)
  }

  const calculateTotalMarks = () => {
    return questions.reduce((total, q) => total + q.marks, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
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

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question.trim()) {
        toast.error(`Question ${i + 1}: Please enter question text`)
        return
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          toast.error(`Question ${i + 1}: Option ${j + 1} cannot be empty`)
          return
        }
      }
      if (q.marks <= 0) {
        toast.error(`Question ${i + 1}: Marks must be greater than 0`)
        return
      }
    }

    setLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const totalMarks = calculateTotalMarks()
      
      const updatedQuiz = {
        ...formData,
        id: params.id,
        totalMarks: totalMarks,
        type: 'quiz',
        createdAt: new Date().toISOString(),
        createdBy: 'Instructor',
        questions: questions,
        submissions: [] // Preserve existing submissions
      }

      const allQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
      const updatedQuizzes = allQuizzes.map((q: any) => 
        q.id === params.id ? updatedQuiz : q
      )
      
      localStorage.setItem('quizzes', JSON.stringify(updatedQuizzes))
      
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
        <div className="max-w-6xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-center" />
      
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href={`/lms/Instructor_Portal/quizzes/${params.id}`}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <HiArrowLeft className="w-5 h-5 mr-2" />
              <span>Back to Quiz</span>
            </Link>
            
            <h1 className="text-2xl font-bold text-gray-900">Edit Quiz</h1>
            <p className="text-gray-600 mt-1">
              Update quiz details and questions
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
                placeholder="Brief description of the quiz..."
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

            {/* MCQ Questions Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  MCQ Questions ({questions.length})
                </h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <HiPlus className="w-5 h-5" />
                  Add Question
                </button>
              </div>

              <div className="space-y-6">
                {questions.map((question, qIndex) => (
                  <div key={question.id} className="border border-gray-300 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-gray-900">
                        Question {qIndex + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <HiTrash className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Question Text */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Text *
                      </label>
                      <textarea
                        value={question.question}
                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Enter your question here..."
                        required
                      />
                    </div>

                    {/* Options */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Options *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`correctAnswer_${qIndex}`}
                              checked={question.correctAnswer === oIndex}
                              onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                              className="w-5 h-5 text-purple-600"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                              placeholder={`Option ${oIndex + 1}`}
                              required
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Select the radio button next to the correct answer
                      </p>
                    </div>

                    {/* Marks */}
                    <div className="w-32">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Marks *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={question.marks}
                        onChange={(e) => updateQuestion(qIndex, 'marks', parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quiz Details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Marks
                </label>
                <input
                  type="number"
                  value={calculateTotalMarks()}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 font-medium"
                />
                <p className="text-sm text-gray-500 mt-1">Auto-calculated from questions</p>
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

              <div>
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
                  </select>
                  <HiChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
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
                href={`/lms/Instructor_Portal/quizzes/${params.id}`}
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
                    Updating...
                  </>
                ) : (
                  <>
                    <HiSave className="w-5 h-5" />
                    Update Quiz
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