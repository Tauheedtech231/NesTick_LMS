// lms/Instructor_Portal/courses/add/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Save,
  X,
  Plus,
  Trash2,
  Upload,
  BookOpen,
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  FileVideo,
  FileImage,
  File,
  Edit3,
  AlertCircle,
  HelpCircle,
  Loader2,
  User,
  Camera,
  IndianRupee,
  Calendar,
  Clock,
  Award,
  Download
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

// Types
interface Course {
  id: string;
  title: string;
  description: string;
  studentCapacity: number;
  category: string;
  status: 'draft' | 'published';
  instructorId: string;
  instructorName: string;
  instructorImage?: string;
  image?: string;
  price?: string;
  originalPrice?: string;
  duration?: string;
  level?: string;
  createdAt: string;
  updatedAt: string;
}

interface Slide {
  id: string;
  courseId: string;
  slideNumber: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface SlideContent {
  slideId: string;
  courseId: string;
  files: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    publicId: string;
    uploadedAt: string;
  }[];
}

interface Quiz {
  slideId: string;
  courseId: string;
  questions: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
}

interface Assignment {
  id: string;
  slideId: string;  // Changed from courseId to slideId
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  totalMarks: number;
  passingMarks: number;
  file?: {
    name: string;
    type: string;
    size: number;
    url: string;
    publicId: string;
    uploadedAt: string;
  };
  status: 'published' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export default function AddCoursePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [instructor, setInstructor] = useState<any>(null)
  const [uploading, setUploading] = useState<{[key: string]: boolean}>({})
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingAssignment, setUploadingAssignment] = useState(false)
  
  // Course image states
  const [courseImage, setCourseImage] = useState<string>('')
  const [courseImagePreview, setCourseImagePreview] = useState<string>('')
  
  // Step 1: Course Details
  const [courseDetails, setCourseDetails] = useState({
    title: '',
    description: '',
    studentCapacity: 30,
    category: '',
    status: 'draft' as 'draft' | 'published',
    price: '',
    originalPrice: '',
    duration: '',
    level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels'
  })
  const [courseId, setCourseId] = useState<string>('')
  const [step1Errors, setStep1Errors] = useState<{[key: string]: string}>({})
  const [showDiscount, setShowDiscount] = useState(false)
  
  // Step 2: Slides
  const [slides, setSlides] = useState<Slide[]>([])
  
  // Step 3: Current selected slide for content management
  const [selectedSlideId, setSelectedSlideId] = useState<string>('')
  
  // Load slide contents from localStorage
  const [slideContents, setSlideContents] = useState<{[slideId: string]: SlideContent}>({})
  const [slideQuizzes, setSlideQuizzes] = useState<{[slideId: string]: Quiz}>({})
  
  // Step 4: Assignments per slide
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [showAssignmentForm, setShowAssignmentForm] = useState(false)
  const [selectedAssignmentSlide, setSelectedAssignmentSlide] = useState<string>('')
  const [currentAssignment, setCurrentAssignment] = useState<Partial<Assignment>>({
    title: '',
    description: '',
    dueDate: '',
    totalMarks: 100,
    passingMarks: 70,
    status: 'draft'
  })
  const [assignmentFile, setAssignmentFile] = useState<{
    name: string;
    type: string;
    size: number;
    url: string;
    publicId: string;
    uploadedAt: string;
  } | null>(null)

  useEffect(() => {
    // Load instructor data
    const currentUserStr = localStorage.getItem('currentUser')
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr)
      setInstructor(currentUser)
    } else {
      router.push('/lms/auth/login?type=instructor')
    }
  }, [router])

  // Load data from localStorage when slide changes
  useEffect(() => {
    if (courseId) {
      loadSlideContents()
      loadAssignments()
    }
  }, [courseId, slides])

  const loadSlideContents = () => {
    // Load slide contents
    const existingContents = JSON.parse(localStorage.getItem('slideContent') || '[]')
    const contentsMap: {[slideId: string]: SlideContent} = {}
    existingContents.forEach((content: SlideContent) => {
      if (content.courseId === courseId) {
        contentsMap[content.slideId] = content
      }
    })
    setSlideContents(contentsMap)

    // Load quizzes
    const existingQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
    const quizzesMap: {[slideId: string]: Quiz} = {}
    existingQuizzes.forEach((quiz: Quiz) => {
      if (quiz.courseId === courseId) {
        quizzesMap[quiz.slideId] = quiz
      }
    })
    setSlideQuizzes(quizzesMap)
  }

  const loadAssignments = () => {
    const existingAssignments = JSON.parse(localStorage.getItem('assignments') || '[]')
    const courseAssignments = existingAssignments.filter((a: Assignment) => a.courseId === courseId)
    setAssignments(courseAssignments)
  }

  // ============ COURSE IMAGE UPLOAD FUNCTIONS ============
  const handleImageUpload = async (file: File) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    setUploadingImage(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setCourseImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'course_image')

      // Upload to Cloudinary via API route
      const response = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success) {
        setCourseImage(result.data.secure_url)
      }
    } catch (error) {
      console.error('Image upload error:', error)
      alert('Failed to upload image. Please try again.')
      setCourseImagePreview('')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleImageRemove = () => {
    setCourseImage('')
    setCourseImagePreview('')
  }

  // ============ STEP 1 FUNCTIONS ============
  const validateStep1 = () => {
    const errors: {[key: string]: string} = {}
    
    if (!courseDetails.title.trim()) {
      errors.title = 'Course title is required'
    }
    
    if (!courseDetails.description.trim()) {
      errors.description = 'Course description is required'
    }
    
    if (!courseDetails.category) {
      errors.category = 'Please select a category'
    }

    if (!courseDetails.price) {
      errors.price = 'Course price is required'
    } else if (isNaN(Number(courseDetails.price)) || Number(courseDetails.price) <= 0) {
      errors.price = 'Please enter a valid price'
    }

    if (showDiscount && courseDetails.originalPrice) {
      if (isNaN(Number(courseDetails.originalPrice)) || Number(courseDetails.originalPrice) <= 0) {
        errors.originalPrice = 'Please enter a valid original price'
      } else if (Number(courseDetails.originalPrice) <= Number(courseDetails.price)) {
        errors.originalPrice = 'Original price must be greater than selling price'
      }
    }

    if (!courseDetails.duration) {
      errors.duration = 'Course duration is required'
    }

    if (!courseDetails.level) {
      errors.level = 'Please select a level'
    }
    
    setStep1Errors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveStep1 = () => {
    if (!validateStep1()) return
    if (!instructor) return
    
    // Generate unique course ID
    const newCourseId = `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const newCourse: Course = {
      id: newCourseId,
      title: courseDetails.title,
      description: courseDetails.description,
      studentCapacity: courseDetails.studentCapacity,
      category: courseDetails.category,
      status: courseDetails.status,
      instructorId: instructor.id,
      instructorName: instructor.name || instructor.fullName || 'Instructor',
      instructorImage: instructor.image || '',
      image: courseImage,
      price: courseDetails.price ? `PKR ${Number(courseDetails.price).toLocaleString()}` : undefined,
      originalPrice: showDiscount && courseDetails.originalPrice ? `PKR ${Number(courseDetails.originalPrice).toLocaleString()}` : undefined,
      duration: courseDetails.duration,
      level: courseDetails.level,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Save to localStorage
    const existingCourses = JSON.parse(localStorage.getItem('courses') || '[]')
    const updatedCourses = [...existingCourses, newCourse]
    localStorage.setItem('courses', JSON.stringify(updatedCourses))
    
    setCourseId(newCourseId)
    setCurrentStep(2)
  }

  // ============ STEP 2 FUNCTIONS ============
  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: `slide_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      courseId: courseId,
      slideNumber: slides.length + 1,
      title: `Slide ${slides.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const updatedSlides = [...slides, newSlide]
    setSlides(updatedSlides)
    
    // Save to localStorage
    const existingSlides = JSON.parse(localStorage.getItem('slides') || '[]')
    const updatedSlidesStorage = [...existingSlides, newSlide]
    localStorage.setItem('slides', JSON.stringify(updatedSlidesStorage))
    
    // Auto-select first slide if none selected
    if (!selectedSlideId) {
      setSelectedSlideId(newSlide.id)
    }
  }

  const handleRemoveSlide = (slideId: string) => {
    const updatedSlides = slides.filter(s => s.id !== slideId)
    
    // Reorder remaining slides
    const reorderedSlides = updatedSlides.map((slide, index) => ({
      ...slide,
      slideNumber: index + 1,
      title: `Slide ${index + 1}`,
      updatedAt: new Date().toISOString()
    }))
    
    setSlides(reorderedSlides)
    
    // Update localStorage
    const existingSlides = JSON.parse(localStorage.getItem('slides') || '[]')
    const filteredSlides = existingSlides.filter((s: Slide) => s.id !== slideId)
    const updatedSlidesStorage = filteredSlides.map((slide: Slide, index: number) => ({
      ...slide,
      slideNumber: index + 1,
      title: `Slide ${index + 1}`,
      updatedAt: new Date().toISOString()
    }))
    
    localStorage.setItem('slides', JSON.stringify(updatedSlidesStorage))
    
    // Update selected slide
    if (selectedSlideId === slideId) {
      setSelectedSlideId(updatedSlidesStorage[0]?.id || '')
    }
    
    // Remove associated content, quizzes, and assignments
    const existingContents = JSON.parse(localStorage.getItem('slideContent') || '[]')
    const filteredContents = existingContents.filter((c: SlideContent) => c.slideId !== slideId)
    localStorage.setItem('slideContent', JSON.stringify(filteredContents))
    
    const existingQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
    const filteredQuizzes = existingQuizzes.filter((q: Quiz) => q.slideId !== slideId)
    localStorage.setItem('quizzes', JSON.stringify(filteredQuizzes))
    
    const existingAssignments = JSON.parse(localStorage.getItem('assignments') || '[]')
    const filteredAssignments = existingAssignments.filter((a: Assignment) => a.slideId !== slideId)
    localStorage.setItem('assignments', JSON.stringify(filteredAssignments))
    
    // Update state
    const newContents = { ...slideContents }
    delete newContents[slideId]
    setSlideContents(newContents)
    
    const newQuizzes = { ...slideQuizzes }
    delete newQuizzes[slideId]
    setSlideQuizzes(newQuizzes)
    
    setAssignments(filteredAssignments)
  }

  const handleEditSlideTitle = (slideId: string, newTitle: string) => {
    const updatedSlides = slides.map(slide => 
      slide.id === slideId ? { ...slide, title: newTitle, updatedAt: new Date().toISOString() } : slide
    )
    setSlides(updatedSlides)
    
    // Update localStorage
    const existingSlides = JSON.parse(localStorage.getItem('slides') || '[]')
    const updatedSlidesStorage = existingSlides.map((slide: Slide) => 
      slide.id === slideId ? { ...slide, title: newTitle, updatedAt: new Date().toISOString() } : slide
    )
    localStorage.setItem('slides', JSON.stringify(updatedSlidesStorage))
  }

  const handleMoveToStep3 = () => {
    if (slides.length === 0) {
      alert('Please add at least one slide before proceeding')
      return
    }
    setCurrentStep(3)
  }

  // ============ STEP 3 FUNCTIONS ============
  const handleFileUpload = async (slideId: string, files: FileList | null) => {
    if (!files || !courseId) return
    
    const slide = slides.find(s => s.id === slideId)
    if (!slide) return
    
    setUploading(prev => ({ ...prev, [slideId]: true }))
    
    try {
      const uploadedFiles = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Create form data
        const formData = new FormData()
        formData.append('file', file)
        formData.append('slideId', slideId)
        formData.append('courseId', courseId)
        
        // Upload to Cloudinary via API route
        const response = await fetch('/api/upload/cloudinary', {
          method: 'POST',
          body: formData,
        })
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`)
        }
        
        const result = await response.json()
        
        if (result.success) {
          uploadedFiles.push({
            id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            type: file.type,
            size: file.size,
            url: result.data.secure_url,
            publicId: result.data.public_id,
            uploadedAt: new Date().toISOString()
          })
        }
      }
      
      if (uploadedFiles.length > 0) {
        // Save to localStorage
        const existingContents = JSON.parse(localStorage.getItem('slideContent') || '[]')
        
        const slideContent = existingContents.find((sc: SlideContent) => sc.slideId === slideId)
        
        if (slideContent) {
          // Update existing
          slideContent.files = [...slideContent.files, ...uploadedFiles]
          const updatedContents = existingContents.map((sc: SlideContent) => 
            sc.slideId === slideId ? slideContent : sc
          )
          localStorage.setItem('slideContent', JSON.stringify(updatedContents))
        } else {
          // Create new
          const newContent: SlideContent = {
            slideId: slideId,
            courseId: courseId,
            files: uploadedFiles
          }
          localStorage.setItem('slideContent', JSON.stringify([...existingContents, newContent]))
        }
        
        // Update state
        setSlideContents({
          ...slideContents,
          [slideId]: {
            slideId,
            courseId,
            files: [...(slideContents[slideId]?.files || []), ...uploadedFiles]
          }
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload files. Please try again.')
    } finally {
      setUploading(prev => ({ ...prev, [slideId]: false }))
    }
  }

  const handleRemoveFile = (slideId: string, filePublicId: string) => {
    const existingContents = JSON.parse(localStorage.getItem('slideContent') || '[]')
    const updatedContents = existingContents.map((sc: SlideContent) => {
      if (sc.slideId === slideId) {
        sc.files = sc.files.filter(f => f.publicId !== filePublicId)
      }
      return sc
    }).filter((sc: SlideContent) => sc.files.length > 0)
    
    localStorage.setItem('slideContent', JSON.stringify(updatedContents))
    
    // Update state
    if (slideContents[slideId]) {
      const updatedFiles = slideContents[slideId].files.filter(f => f.publicId !== filePublicId)
      if (updatedFiles.length > 0) {
        setSlideContents({
          ...slideContents,
          [slideId]: { ...slideContents[slideId], files: updatedFiles }
        })
      } else {
        const newContents = { ...slideContents }
        delete newContents[slideId]
        setSlideContents(newContents)
      }
    }
  }

  // Quiz Functions
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  })

  const handleAddQuestion = (slideId: string) => {
    if (!currentQuizQuestion.question.trim()) {
      alert('Please enter a question')
      return
    }
    
    if (currentQuizQuestion.options.some(opt => !opt.trim())) {
      alert('Please fill all options')
      return
    }
    
    const newQuestion = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question: currentQuizQuestion.question,
      options: [...currentQuizQuestion.options],
      correctAnswer: currentQuizQuestion.correctAnswer
    }
    
    // Get existing quizzes
    const existingQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
    const quiz = existingQuizzes.find((q: Quiz) => q.slideId === slideId)
    
    if (quiz) {
      // Update existing quiz
      quiz.questions = [...quiz.questions, newQuestion]
      const updatedQuizzes = existingQuizzes.map((q: Quiz) => 
        q.slideId === slideId ? quiz : q
      )
      localStorage.setItem('quizzes', JSON.stringify(updatedQuizzes))
      
      setSlideQuizzes({
        ...slideQuizzes,
        [slideId]: quiz
      })
    } else {
      // Create new quiz
      const newQuiz: Quiz = {
        slideId: slideId,
        courseId: courseId,
        questions: [newQuestion]
      }
      
      localStorage.setItem('quizzes', JSON.stringify([...existingQuizzes, newQuiz]))
      
      setSlideQuizzes({
        ...slideQuizzes,
        [slideId]: newQuiz
      })
    }
    
    // Reset form
    setCurrentQuizQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    })
  }

  const handleRemoveQuestion = (slideId: string, questionId: string) => {
    const existingQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
    const quizIndex = existingQuizzes.findIndex((q: Quiz) => q.slideId === slideId)
    
    if (quizIndex !== -1) {
      const quiz = existingQuizzes[quizIndex]
      quiz.questions = quiz.questions.filter((q: any) => q.id !== questionId)
      
      if (quiz.questions.length === 0) {
        // Remove quiz if no questions left
        existingQuizzes.splice(quizIndex, 1)
      }
      
      localStorage.setItem('quizzes', JSON.stringify(existingQuizzes))
      
      // Update state
      if (quiz.questions.length > 0) {
        setSlideQuizzes({
          ...slideQuizzes,
          [slideId]: quiz
        })
      } else {
        const newQuizzes = { ...slideQuizzes }
        delete newQuizzes[slideId]
        setSlideQuizzes(newQuizzes)
      }
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...currentQuizQuestion.options]
    newOptions[index] = value
    setCurrentQuizQuestion({
      ...currentQuizQuestion,
      options: newOptions
    })
  }

  // ============ ASSIGNMENT FUNCTIONS PER SLIDE ============
  const handleAssignmentFileUpload = async (file: File) => {
    if (!file) return

    setUploadingAssignment(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'assignment')

      const response = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success) {
        setAssignmentFile({
          name: file.name,
          type: file.type,
          size: file.size,
          url: result.data.secure_url,
          publicId: result.data.public_id,
          uploadedAt: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Assignment file upload error:', error)
      alert('Failed to upload assignment file. Please try again.')
    } finally {
      setUploadingAssignment(false)
    }
  }

  const handleSaveAssignment = () => {
    if (!selectedAssignmentSlide) {
      alert('Please select a slide first')
      return
    }

    if (!currentAssignment.title?.trim()) {
      alert('Please enter assignment title')
      return
    }

    if (!currentAssignment.description?.trim()) {
      alert('Please enter assignment description')
      return
    }

    if (!currentAssignment.dueDate) {
      alert('Please select due date')
      return
    }

    if (!currentAssignment.totalMarks || currentAssignment.totalMarks <= 0) {
      alert('Please enter valid total marks')
      return
    }

    if (!currentAssignment.passingMarks || currentAssignment.passingMarks <= 0) {
      alert('Please enter valid passing marks')
      return
    }

    const newAssignment: Assignment = {
      id: `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      slideId: selectedAssignmentSlide,
      courseId: courseId,
      title: currentAssignment.title,
      description: currentAssignment.description,
      dueDate: currentAssignment.dueDate,
      totalMarks: currentAssignment.totalMarks,
      passingMarks: currentAssignment.passingMarks,
      file: assignmentFile || undefined,
      status: currentAssignment.status as 'published' | 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Save to localStorage
    const existingAssignments = JSON.parse(localStorage.getItem('assignments') || '[]')
    localStorage.setItem('assignments', JSON.stringify([...existingAssignments, newAssignment]))

    // Update state
    setAssignments([...assignments, newAssignment])

    // Reset form
    resetAssignmentForm()
  }

  const handleRemoveAssignment = (assignmentId: string) => {
    const updatedAssignments = assignments.filter(a => a.id !== assignmentId)
    
    // Update localStorage
    const existingAssignments = JSON.parse(localStorage.getItem('assignments') || '[]')
    const filteredAssignments = existingAssignments.filter((a: Assignment) => a.id !== assignmentId)
    localStorage.setItem('assignments', JSON.stringify(filteredAssignments))

    // Update state
    setAssignments(updatedAssignments)
  }

  const resetAssignmentForm = () => {
    setCurrentAssignment({
      title: '',
      description: '',
      dueDate: '',
      totalMarks: 100,
      passingMarks: 70,
      status: 'draft'
    })
    setAssignmentFile(null)
    setShowAssignmentForm(false)
    setSelectedAssignmentSlide('')
  }

  const openAssignmentFormForSlide = (slideId: string) => {
    setSelectedAssignmentSlide(slideId)
    setShowAssignmentForm(true)
  }

  const handleMoveToStep4 = () => {
    setCurrentStep(4)
  }

  const handleFinalSubmit = () => {
    // Update course status if published
    if (courseDetails.status === 'published') {
      const existingCourses = JSON.parse(localStorage.getItem('courses') || '[]')
      const updatedCourses = existingCourses.map((c: Course) => 
        c.id === courseId ? { ...c, status: 'published' } : c
      )
      localStorage.setItem('courses', JSON.stringify(updatedCourses))
    }
    
    alert('Course created successfully!')
    router.push('/lms/Instructor_Portal/courses')
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('video')) return <FileVideo className="w-5 h-5 text-blue-500" />
    if (fileType.includes('image')) return <FileImage className="w-5 h-5 text-green-500" />
    if (fileType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />
    if (fileType.includes('word') || fileType.includes('document')) return <FileText className="w-5 h-5 text-blue-700" />
    return <File className="w-5 h-5 text-gray-500" />
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      {/* Header with Step Indicator */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-lightGrey rounded-xl p-4 sm:p-6 border border-softGrey">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                href="/lms/Instructor_Portal/courses"
                className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                  Create New Course
                </h1>
                <p className="text-darkGrey mt-1 text-sm">
                  Step {currentStep} of 4: {currentStep === 1 ? 'Basic Details' : currentStep === 2 ? 'Create Slides' : currentStep === 3 ? 'Add Content' : 'Add Assignments'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Step Indicator */}
          <div className="flex items-center justify-between mt-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                    ${currentStep > step ? 'bg-green-500 text-white' : 
                      currentStep === step ? 'text-white' : 'bg-softGrey text-darkGrey/60'}`}
                    style={{ backgroundColor: currentStep === step ? BRAND_COLORS.deepRed : '' }}>
                    {currentStep > step ? <Check className="w-4 h-4" /> : step}
                  </div>
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${
                    currentStep > step ? 'bg-green-500' : 'bg-softGrey'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-darkGrey/60 px-1">
            <span>Course Details</span>
            <span>Create Slides</span>
            <span>Add Content</span>
            <span>Add Assignments</span>
          </div>
        </div>
      </div>

      {/* Step 1: Basic Course Details */}
      {currentStep === 1 && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg border border-softGrey p-6">
            <h2 className="text-lg font-semibold mb-6" style={{ color: BRAND_COLORS.darkNavy }}>
              Step 1: Basic Course Details
            </h2>
            
            <div className="space-y-5">
              {/* Course Image Upload */}
              <div>
                <label className="block text-sm font-medium text-darkGrey mb-2">
                  Course Image
                </label>
                <div className="flex items-center gap-6">
                  {/* Image Preview */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-softGrey bg-lightGrey flex items-center justify-center">
                      {courseImagePreview || courseImage ? (
                        <img 
                          src={courseImagePreview || courseImage} 
                          alt="Course preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="w-8 h-8 text-darkGrey/40" />
                      )}
                    </div>
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <label className="relative cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleImageUpload(e.target.files[0])
                            }
                          }}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                        <span className={`px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-colors
                          ${uploadingImage ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'}`}
                          style={{ 
                            backgroundColor: BRAND_COLORS.darkRoyalBlue,
                            color: BRAND_COLORS.white 
                          }}>
                          <Camera className="w-4 h-4" />
                          {uploadingImage ? 'Uploading...' : 'Upload Image'}
                        </span>
                      </label>
                      
                      {(courseImagePreview || courseImage) && (
                        <button
                          onClick={handleImageRemove}
                          className="px-4 py-2 border border-brightRed text-brightRed rounded-lg text-sm font-medium hover:bg-brightRed/5 transition-colors"
                          disabled={uploadingImage}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-darkGrey/60 mt-2">
                      Upload a cover image for the course. Max size: 5MB. Supported formats: JPG, PNG, GIF
                    </p>
                  </div>
                </div>
              </div>

              {/* Course Name */}
              <div>
                <label className="block text-sm font-medium text-darkGrey mb-2">
                  Course Name <span className="text-deepRed">*</span>
                </label>
                <input
                  type="text"
                  value={courseDetails.title}
                  onChange={(e) => setCourseDetails({ ...courseDetails, title: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20
                    ${step1Errors.title ? 'border-deepRed' : 'border-softGrey'}`}
                  placeholder="e.g., Pipe Welding for Beginners"
                />
                {step1Errors.title && (
                  <p className="text-xs text-deepRed mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {step1Errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-darkGrey mb-2">
                  Course Description <span className="text-deepRed">*</span>
                </label>
                <textarea
                  value={courseDetails.description}
                  onChange={(e) => setCourseDetails({ ...courseDetails, description: e.target.value })}
                  rows={4}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20
                    ${step1Errors.description ? 'border-deepRed' : 'border-softGrey'}`}
                  placeholder="Describe your course in detail..."
                />
                {step1Errors.description && (
                  <p className="text-xs text-deepRed mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {step1Errors.description}
                  </p>
                )}
              </div>

              {/* Course Duration */}
              <div>
                <label className="block text-sm font-medium text-darkGrey mb-2">
                  Course Duration <span className="text-deepRed">*</span>
                </label>
                <input
                  type="text"
                  value={courseDetails.duration}
                  onChange={(e) => setCourseDetails({ ...courseDetails, duration: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20
                    ${step1Errors.duration ? 'border-deepRed' : 'border-softGrey'}`}
                  placeholder="e.g., 8 Weeks, 3 Months, 6 Months"
                />
                {step1Errors.duration && (
                  <p className="text-xs text-deepRed mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {step1Errors.duration}
                  </p>
                )}
              </div>

              {/* Course Level */}
              <div>
                <label className="block text-sm font-medium text-darkGrey mb-2">
                  Course Level <span className="text-deepRed">*</span>
                </label>
                <select
                  value={courseDetails.level}
                  onChange={(e) => setCourseDetails({ ...courseDetails, level: e.target.value as any })}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 bg-white
                    ${step1Errors.level ? 'border-deepRed' : 'border-softGrey'}`}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="All Levels">All Levels</option>
                </select>
                {step1Errors.level && (
                  <p className="text-xs text-deepRed mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {step1Errors.level}
                  </p>
                )}
              </div>

              {/* Student Capacity */}
              <div>
                <label className="block text-sm font-medium text-darkGrey mb-2">
                  Student Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  value={courseDetails.studentCapacity}
                  onChange={(e) => setCourseDetails({ ...courseDetails, studentCapacity: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                  placeholder="e.g., 30"
                />
              </div>

              {/* Course Price Section */}
              <div className="border-t border-softGrey pt-4 mt-2">
                <h3 className="text-md font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                  Course Pricing
                </h3>
                
                {/* Price */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-darkGrey mb-2">
                    Course Price (PKR) <span className="text-deepRed">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-darkGrey/40" />
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={courseDetails.price}
                      onChange={(e) => setCourseDetails({ ...courseDetails, price: e.target.value })}
                      className={`w-full pl-9 pr-4 py-2.5 border rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20
                        ${step1Errors.price ? 'border-deepRed' : 'border-softGrey'}`}
                      placeholder="e.g., 25000"
                    />
                  </div>
                  {step1Errors.price && (
                    <p className="text-xs text-deepRed mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {step1Errors.price}
                    </p>
                  )}
                </div>

                {/* Discount Toggle */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showDiscount}
                      onChange={(e) => setShowDiscount(e.target.checked)}
                      className="w-4 h-4 text-deepRed focus:ring-deepRed rounded"
                    />
                    <span className="text-sm text-darkGrey">Show discounted price (original price)</span>
                  </label>
                </div>

                {/* Original Price (for discount) */}
                {showDiscount && (
                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">
                      Original Price (PKR)
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-darkGrey/40" />
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={courseDetails.originalPrice}
                        onChange={(e) => setCourseDetails({ ...courseDetails, originalPrice: e.target.value })}
                        className={`w-full pl-9 pr-4 py-2.5 border rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20
                          ${step1Errors.originalPrice ? 'border-deepRed' : 'border-softGrey'}`}
                        placeholder="e.g., 30000"
                      />
                    </div>
                    {step1Errors.originalPrice && (
                      <p className="text-xs text-deepRed mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {step1Errors.originalPrice}
                      </p>
                    )}
                    <p className="text-xs text-darkGrey/60 mt-1">
                      Original price should be higher than selling price to show discount
                    </p>
                  </div>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-darkGrey mb-2">
                  Course Category <span className="text-deepRed">*</span>
                </label>
                <select
                  value={courseDetails.category}
                  onChange={(e) => setCourseDetails({ ...courseDetails, category: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 bg-white
                    ${step1Errors.category ? 'border-deepRed' : 'border-softGrey'}`}
                >
                  <option value="">Select Category</option>
                  <option value="Technical Training">Technical Training</option>
                  <option value="Safety Training">Safety Training</option>
                 
                </select>
                {step1Errors.category && (
                  <p className="text-xs text-deepRed mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {step1Errors.category}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-darkGrey mb-2">
                  Course Status
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="status"
                      checked={courseDetails.status === 'draft'}
                      onChange={() => setCourseDetails({ ...courseDetails, status: 'draft' })}
                      className="w-4 h-4 text-deepRed focus:ring-deepRed"
                    />
                    <span className="text-sm text-darkGrey">Draft</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="status"
                      checked={courseDetails.status === 'published'}
                      onChange={() => setCourseDetails({ ...courseDetails, status: 'published' })}
                      className="w-4 h-4 text-deepRed focus:ring-deepRed"
                    />
                    <span className="text-sm text-darkGrey">Published</span>
                  </label>
                </div>
                <p className="text-xs text-darkGrey/60 mt-1">
                  Draft courses are only visible to you. Published courses are visible to students.
                </p>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="mt-8 pt-6 border-t border-softGrey flex justify-end">
              <button
                onClick={handleSaveStep1}
                className="px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
                style={{ 
                  backgroundColor: BRAND_COLORS.deepRed,
                  color: BRAND_COLORS.white 
                }}
              >
                Save & Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Slide Creation */}
      {currentStep === 2 && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-softGrey p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
                Step 2: Create Slides (Lectures)
              </h2>
              <button
                onClick={handleAddSlide}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ 
                  backgroundColor: BRAND_COLORS.darkRoyalBlue,
                  color: BRAND_COLORS.white 
                }}
              >
                <Plus className="w-4 h-4" />
                Add New Slide
              </button>
            </div>

            {slides.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-softGrey rounded-lg">
                <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.softGrey }} />
                <h3 className="text-base font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
                  No Slides Yet
                </h3>
                <p className="text-darkGrey/70 mb-4 text-sm">
                  Start by adding your first slide (lecture)
                </p>
                <button
                  onClick={handleAddSlide}
                  className="px-4 py-2 rounded-lg font-medium text-sm transition-colors inline-flex items-center gap-2"
                  style={{ 
                    backgroundColor: BRAND_COLORS.darkRoyalBlue,
                    color: BRAND_COLORS.white 
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Create First Slide
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {slides.map((slide) => (
                  <div key={slide.id} className="flex items-center gap-3 p-3 border border-softGrey rounded-lg hover:bg-lightGrey/50">
                    <div className="w-8 h-8 rounded-full bg-lightGrey flex items-center justify-center text-sm font-medium">
                      {slide.slideNumber}
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => handleEditSlideTitle(slide.id, e.target.value)}
                        className="font-medium text-darkGrey bg-transparent border-b border-transparent hover:border-softGrey focus:border-darkRoyalBlue focus:outline-none px-1 py-0.5 w-full"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveSlide(slide.id)}
                      className="p-2 text-brightRed hover:bg-brightRed/5 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 pt-6 border-t border-softGrey flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2.5 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors font-medium flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleMoveToStep3}
                className="px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
                style={{ 
                  backgroundColor: BRAND_COLORS.deepRed,
                  color: BRAND_COLORS.white 
                }}
              >
                Continue to Content
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Slide Content Management */}
      {currentStep === 3 && (
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Slide List Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-softGrey p-4">
                <h3 className="font-medium text-darkGrey mb-3">Slides</h3>
                <div className="space-y-2">
                  {slides.map((slide) => (
                    <button
                      key={slide.id}
                      onClick={() => setSelectedSlideId(slide.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedSlideId === slide.id 
                          ? 'bg-lightGrey border-l-4' 
                          : 'hover:bg-lightGrey/50'
                      }`}
                      style={{ borderLeftColor: selectedSlideId === slide.id ? BRAND_COLORS.deepRed : 'transparent' }}
                    >
                      <p className="font-medium text-sm text-darkGrey">{slide.title}</p>
                      <p className="text-xs text-darkGrey/60 mt-1">
                        {slideContents[slide.id]?.files?.length || 0} files • 
                        {slideQuizzes[slide.id]?.questions?.length || 0} questions •
                        {assignments.filter(a => a.slideId === slide.id).length || 0} assignments
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              {selectedSlideId ? (
                <div className="space-y-6">
                  {/* Educational Content Section */}
                  <div className="bg-white rounded-lg border border-softGrey p-6">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                      Educational Content
                    </h3>
                    
                    {/* File Upload with Cloudinary */}
                    <div className="mb-6">
                      <div className="border-2 border-dashed border-softGrey rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: BRAND_COLORS.softGrey }} />
                        <p className="text-sm text-darkGrey/70 mb-2">
                          Drag & drop files or click to upload
                        </p>
                        <p className="text-xs text-darkGrey/50 mb-4">
                          Supports: MP4, PDF, DOC/DOCX, JPG, PNG
                        </p>
                        <label className="inline-block relative">
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.mp4,.mov,.avi,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(selectedSlideId, e.target.files)}
                            className="hidden"
                            disabled={uploading[selectedSlideId]}
                          />
                          <span className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors inline-flex items-center gap-2
                            ${uploading[selectedSlideId] ? 'opacity-50 cursor-not-allowed' : ''}`}
                            style={{ 
                              backgroundColor: BRAND_COLORS.darkRoyalBlue,
                              color: BRAND_COLORS.white 
                            }}>
                            {uploading[selectedSlideId] ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              'Browse Files'
                            )}
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Uploaded Files List */}
                    {slideContents[selectedSlideId]?.files?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-darkGrey mb-3">Uploaded Files</h4>
                        <div className="space-y-2">
                          {slideContents[selectedSlideId].files.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-3 bg-lightGrey rounded-lg">
                              <div className="flex items-center gap-3">
                                {getFileIcon(file.type)}
                                <div>
                                  <p className="text-sm font-medium text-darkGrey">{file.name}</p>
                                  <p className="text-xs text-darkGrey/60">
                                    {(file.size / 1024).toFixed(2)} KB • {new Date(file.uploadedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveFile(selectedSlideId, file.publicId)}
                                className="p-1 text-brightRed hover:bg-brightRed/5 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quiz Content Section */}
                  <div className="bg-white rounded-lg border border-softGrey p-6">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                      Quiz Content
                    </h3>

                    {/* Add Question Form */}
                    <div className="bg-lightGrey rounded-lg p-4 mb-6">
                      <h4 className="font-medium text-darkGrey mb-3">Add New Question</h4>
                      
                      <div className="space-y-4">
                        {/* Question */}
                        <div>
                          <label className="block text-xs font-medium text-darkGrey/70 mb-1">
                            Question
                          </label>
                          <input
                            type="text"
                            value={currentQuizQuestion.question}
                            onChange={(e) => setCurrentQuizQuestion({
                              ...currentQuizQuestion,
                              question: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue text-sm"
                            placeholder="Enter your question"
                          />
                        </div>

                        {/* Options */}
                        <div>
                          <label className="block text-xs font-medium text-darkGrey/70 mb-1">
                            Options (4 options required)
                          </label>
                          <div className="space-y-2">
                            {currentQuizQuestion.options.map((option, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="correctAnswer"
                                  checked={currentQuizQuestion.correctAnswer === index}
                                  onChange={() => setCurrentQuizQuestion({
                                    ...currentQuizQuestion,
                                    correctAnswer: index
                                  })}
                                  className="w-4 h-4 text-deepRed focus:ring-deepRed"
                                />
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => handleOptionChange(index, e.target.value)}
                                  className="flex-1 px-3 py-2 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue text-sm"
                                  placeholder={`Option ${index + 1}`}
                                />
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-darkGrey/50 mt-1">
                            Select the radio button for the correct answer
                          </p>
                        </div>

                        <button
  onClick={() => handleAddQuestion(selectedSlideId)}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
>
  Add Question
</button>

                      </div>
                    </div>

                    {/* Questions List */}
                    {slideQuizzes[selectedSlideId]?.questions?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-darkGrey mb-3">Questions ({slideQuizzes[selectedSlideId].questions.length})</h4>
                        <div className="space-y-3">
                          {slideQuizzes[selectedSlideId].questions.map((q, qIndex) => (
                            <div key={q.id} className="border border-softGrey rounded-lg p-3">
                              <div className="flex items-start justify-between mb-2">
                                <p className="font-medium text-sm text-darkGrey">
                                  Q{qIndex + 1}: {q.question}
                                </p>
                                <button
                                  onClick={() => handleRemoveQuestion(selectedSlideId, q.id)}
                                  className="p-1 text-brightRed hover:bg-brightRed/5 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {q.options.map((opt, optIndex) => (
                                  <div key={optIndex} className="flex items-center gap-2">
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                      optIndex === q.correctAnswer 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      {String.fromCharCode(65 + optIndex)}
                                    </span>
                                    <span className="text-xs text-darkGrey/70">{opt}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Assignments Section for this Slide */}
                  <div className="bg-white rounded-lg border border-softGrey p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
                        Assignments for this Slide
                      </h3>
                      <button
                        onClick={() => openAssignmentFormForSlide(selectedSlideId)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        style={{ 
                          backgroundColor: BRAND_COLORS.darkRoyalBlue,
                          color: BRAND_COLORS.white 
                        }}
                      >
                        <Plus className="w-4 h-4" />
                        Add Assignment
                      </button>
                    </div>

                    {/* Assignment Form for this Slide */}
                    {showAssignmentForm && selectedAssignmentSlide === selectedSlideId && (
                      <div className="bg-lightGrey rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-darkGrey">New Assignment for this Slide</h4>
                          <button
                            onClick={resetAssignmentForm}
                            className="p-1 text-darkGrey/60 hover:text-darkGrey"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="space-y-4">
                          {/* Assignment Title */}
                          <div>
                            <label className="block text-sm font-medium text-darkGrey mb-2">
                              Assignment Title <span className="text-deepRed">*</span>
                            </label>
                            <input
                              type="text"
                              value={currentAssignment.title}
                              onChange={(e) => setCurrentAssignment({ ...currentAssignment, title: e.target.value })}
                              className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue bg-white"
                              placeholder="e.g., Final Project Submission"
                            />
                          </div>

                          {/* Assignment Description */}
                          <div>
                            <label className="block text-sm font-medium text-darkGrey mb-2">
                              Description <span className="text-deepRed">*</span>
                            </label>
                            <textarea
                              value={currentAssignment.description}
                              onChange={(e) => setCurrentAssignment({ ...currentAssignment, description: e.target.value })}
                              rows={4}
                              className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue bg-white"
                              placeholder="Describe the assignment requirements..."
                            />
                          </div>

                          {/* Due Date */}
                          <div>
                            <label className="block text-sm font-medium text-darkGrey mb-2">
                              Due Date <span className="text-deepRed">*</span>
                            </label>
                            <input
                              type="datetime-local"
                              value={currentAssignment.dueDate}
                              onChange={(e) => setCurrentAssignment({ ...currentAssignment, dueDate: e.target.value })}
                              className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue bg-white"
                            />
                          </div>

                          {/* Marks */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-darkGrey mb-2">
                                Total Marks <span className="text-deepRed">*</span>
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={currentAssignment.totalMarks}
                                onChange={(e) => setCurrentAssignment({ ...currentAssignment, totalMarks: parseInt(e.target.value) })}
                                className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-darkGrey mb-2">
                                Passing Marks <span className="text-deepRed">*</span>
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={currentAssignment.passingMarks}
                                onChange={(e) => setCurrentAssignment({ ...currentAssignment, passingMarks: parseInt(e.target.value) })}
                                className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue bg-white"
                              />
                            </div>
                          </div>

                          {/* Assignment File Upload */}
                          <div>
                            <label className="block text-sm font-medium text-darkGrey mb-2">
                              Assignment File (Optional)
                            </label>
                            <div className="border-2 border-dashed border-softGrey rounded-lg p-4 text-center bg-white">
                              {assignmentFile ? (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {getFileIcon(assignmentFile.type)}
                                    <div className="text-left">
                                      <p className="text-sm font-medium text-darkGrey">{assignmentFile.name}</p>
                                      <p className="text-xs text-darkGrey/60">
                                        {(assignmentFile.size / 1024).toFixed(2)} KB
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => setAssignmentFile(null)}
                                    className="p-1 text-brightRed hover:bg-brightRed/5 rounded"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: BRAND_COLORS.softGrey }} />
                                  <p className="text-sm text-darkGrey/70 mb-2">
                                    Upload assignment instructions or template
                                  </p>
                                  <label className="inline-block relative">
                                    <input
                                      type="file"
                                      accept=".pdf,.doc,.docx,.txt"
                                      onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                          handleAssignmentFileUpload(e.target.files[0])
                                        }
                                      }}
                                      className="hidden"
                                      disabled={uploadingAssignment}
                                    />
                                    <span className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors inline-flex items-center gap-2
                                      ${uploadingAssignment ? 'opacity-50 cursor-not-allowed' : ''}`}
                                      style={{ 
                                        backgroundColor: BRAND_COLORS.darkRoyalBlue,
                                        color: BRAND_COLORS.white 
                                      }}>
                                      {uploadingAssignment ? (
                                        <>
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                          Uploading...
                                        </>
                                      ) : (
                                        'Browse Files'
                                      )}
                                    </span>
                                  </label>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Status */}
                          <div>
                            <label className="block text-sm font-medium text-darkGrey mb-2">
                              Status
                            </label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="assignmentStatus"
                                  checked={currentAssignment.status === 'draft'}
                                  onChange={() => setCurrentAssignment({ ...currentAssignment, status: 'draft' })}
                                  className="w-4 h-4 text-deepRed focus:ring-deepRed"
                                />
                                <span className="text-sm text-darkGrey">Draft</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="assignmentStatus"
                                  checked={currentAssignment.status === 'published'}
                                  onChange={() => setCurrentAssignment({ ...currentAssignment, status: 'published' })}
                                  className="w-4 h-4 text-deepRed focus:ring-deepRed"
                                />
                                <span className="text-sm text-darkGrey">Published</span>
                              </label>
                            </div>
                          </div>

                          {/* Form Actions */}
                          <div className="flex justify-end gap-3 pt-4">
                            <button
                              onClick={resetAssignmentForm}
                              className="px-4 py-2 border border-softGrey text-darkGrey rounded-lg text-sm font-medium hover:bg-lightGrey transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveAssignment}
                              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                              style={{ backgroundColor: BRAND_COLORS.deepRed }}
                            >
                              Save Assignment
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Assignments List for this Slide */}
                    {assignments.filter(a => a.slideId === selectedSlideId).length > 0 ? (
                      <div className="space-y-3">
                        {assignments.filter(a => a.slideId === selectedSlideId).map((assignment) => (
                          <div key={assignment.id} className="border border-softGrey rounded-lg p-4 hover:bg-lightGrey/50">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-medium text-darkGrey">{assignment.title}</h4>
                                <p className="text-sm text-darkGrey/70 mt-1">{assignment.description}</p>
                              </div>
                              <button
                                onClick={() => handleRemoveAssignment(assignment.id)}
                                className="p-1 text-brightRed hover:bg-brightRed/5 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 mt-3">
                              <div className="flex items-center gap-2 text-xs text-darkGrey/60">
                                <Calendar className="w-3 h-3" />
                                <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-darkGrey/60">
                                <Award className="w-3 h-3" />
                                <span>Total: {assignment.totalMarks} marks</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className={`px-2 py-1 rounded-full ${
                                  assignment.status === 'published' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {assignment.status}
                                </span>
                              </div>
                            </div>

                            {assignment.file && (
                              <div className="mt-3 flex items-center gap-2 text-sm">
                                <FileText className="w-4 h-4 text-darkRoyalBlue" />
                                <a 
                                  href={assignment.file.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-darkRoyalBlue hover:underline"
                                >
                                  {assignment.file.name}
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      !showAssignmentForm && (
                        <div className="text-center py-8 border-2 border-dashed border-softGrey rounded-lg">
                          <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.softGrey }} />
                          <p className="text-darkGrey/70 text-sm">
                            No assignments for this slide yet
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-softGrey p-12 text-center">
                  <HelpCircle className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.softGrey }} />
                  <h3 className="text-base font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
                    Select a Slide
                  </h3>
                  <p className="text-darkGrey/70 text-sm">
                    Choose a slide from the left to add content, quizzes, and assignments
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2.5 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors font-medium flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Slides
            </button>
            <button
              onClick={handleMoveToStep4}
              className="px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
              style={{ 
                backgroundColor: BRAND_COLORS.deepRed,
                color: BRAND_COLORS.white 
              }}
            >
              Continue to Assignments Overview
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Assignments Overview */}
      {currentStep === 4 && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-softGrey p-6">
            <h2 className="text-lg font-semibold mb-6" style={{ color: BRAND_COLORS.darkNavy }}>
              All Assignments Overview
            </h2>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-lightGrey rounded-lg p-4 text-center">
                <p className="text-xs text-darkGrey/60">Total Assignments</p>
                <p className="text-2xl font-bold text-darkGrey">{assignments.length}</p>
              </div>
              <div className="bg-lightGrey rounded-lg p-4 text-center">
                <p className="text-xs text-darkGrey/60">Published</p>
                <p className="text-2xl font-bold text-green-600">
                  {assignments.filter(a => a.status === 'published').length}
                </p>
              </div>
              <div className="bg-lightGrey rounded-lg p-4 text-center">
                <p className="text-xs text-darkGrey/60">Drafts</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {assignments.filter(a => a.status === 'draft').length}
                </p>
              </div>
            </div>

            {/* Assignments List Grouped by Slide */}
            {slides.length > 0 ? (
              <div className="space-y-6">
                {slides.map(slide => {
                  const slideAssignments = assignments.filter(a => a.slideId === slide.id);
                  if (slideAssignments.length === 0) return null;
                  
                  return (
                    <div key={slide.id} className="border border-softGrey rounded-lg overflow-hidden">
                      <div className="bg-lightGrey px-4 py-3 border-b border-softGrey">
                        <h3 className="font-medium text-darkGrey">
                          Slide {slide.slideNumber}: {slide.title}
                        </h3>
                      </div>
                      <div className="p-4 space-y-3">
                        {slideAssignments.map((assignment) => (
                          <div key={assignment.id} className="border border-softGrey rounded-lg p-4 hover:bg-lightGrey/50">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-medium text-darkGrey">{assignment.title}</h4>
                                <p className="text-sm text-darkGrey/70 mt-1">{assignment.description}</p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                assignment.status === 'published' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {assignment.status}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 mt-3">
                              <div className="flex items-center gap-2 text-xs text-darkGrey/60">
                                <Calendar className="w-3 h-3" />
                                <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-darkGrey/60">
                                <Award className="w-3 h-3" />
                                <span>Total: {assignment.totalMarks} marks</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-darkGrey/60">
                                <Download className="w-3 h-3" />
                                <span>Passing: {assignment.passingMarks} marks</span>
                              </div>
                            </div>

                            {assignment.file && (
                              <div className="mt-3 flex items-center gap-2 text-sm">
                                <FileText className="w-4 h-4 text-darkRoyalBlue" />
                                <a 
                                  href={assignment.file.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-darkRoyalBlue hover:underline"
                                >
                                  {assignment.file.name}
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* If no assignments at all */}
                {assignments.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-softGrey rounded-lg">
                    <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.softGrey }} />
                    <h3 className="text-base font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
                      No Assignments Created
                    </h3>
                    <p className="text-darkGrey/70 text-sm">
                      Go back to Step 3 to add assignments to your slides
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-softGrey rounded-lg">
                <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.softGrey }} />
                <h3 className="text-base font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
                  No Slides Created
                </h3>
                <p className="text-darkGrey/70 text-sm">
                  Please create slides first before adding assignments
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 pt-6 border-t border-softGrey flex justify-between">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2.5 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors font-medium flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Content
              </button>
              <button
                onClick={handleFinalSubmit}
                className="px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
                style={{ 
                  backgroundColor: BRAND_COLORS.deepRed,
                  color: BRAND_COLORS.white 
                }}
              >
                <Check className="w-4 h-4" />
                Complete Course Creation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}