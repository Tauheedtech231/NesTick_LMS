// lms/Instructor_Portal/courses/edit/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import {
  Save,
  X,
  Plus,
  Trash2,
  Upload,
  BookOpen,
  ArrowLeft,
 
  FileText,
  FileVideo,
  FileImage,
  File,
  Edit3,
  AlertCircle,
  HelpCircle,
  Loader2,
  Eye,

  Lock,
  Calendar,
  Award,

} from 'lucide-react'

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

interface Course {
  id: string;
  title: string;
  description: string;
  studentCapacity: number;
  category: string;
  status: 'draft' | 'published';
  instructorId: string;
  instructorName: string;
  createdAt: string;
  updatedAt: string;
  isPublished?: boolean;
  image?: string;
  duration?: string;
  level?: string;
  price?: string;
}

// Published courses data - typed as Course[]
const publishedCourses: Course[] = [
  {
    id: 'pipe-fitter',
    title: 'Pipe Fitter',
    description: 'Master industrial pipe fitting techniques with hands-on training on cutting, threading, and installation following international standards.',
    studentCapacity: 20,
    category: 'Technical Training',
    status: 'published',
    instructorId: 'system',
    instructorName: 'System Instructor',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    isPublished: true,
    image: "https://images.pexels.com/photos/6124242/pexels-photo-6124242.jpeg",
    duration: '8 Weeks',
    level: 'Beginner to Advanced',
    price: 'PKR 25,000'
  },
  {
    id: 'safety-inspector',
    title: 'Safety Inspector',
    description: 'Professional safety inspection training for construction and industrial environments with OSHA certification preparation.',
    studentCapacity: 15,
    category: 'Safety Training',
    status: 'published',
    instructorId: 'system',
    instructorName: 'System Instructor',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    isPublished: true,
    image: "https://images.pexels.com/photos/34082713/pexels-photo-34082713.jpeg",
    duration: '6 Weeks',
    level: 'Intermediate',
    price: 'PKR 30,000'
  },
  {
    id: 'welding',
    title: 'Professional Welding',
    description: 'Comprehensive welding training covering MIG, TIG, and Arc welding techniques for industrial applications.',
    studentCapacity: 12,
    category: 'Technical Training',
    status: 'published',
    instructorId: 'system',
    instructorName: 'System Instructor',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    isPublished: true,
    image: "https://images.pexels.com/photos/7650512/pexels-photo-7650512.jpeg",
    duration: '10 Weeks',
    level: 'Beginner to Professional',
    price: 'PKR 35,000'
  }
];

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
  slideId: string;
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
/* eslint-disable */

export default function EditCoursePage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'slides' | 'content' | 'assignments'>('details')
  const [instructor, setInstructor] = useState<any>(null)
  const [isPublishedCourse, setIsPublishedCourse] = useState(false)
  
  // Course Details
  const [courseDetails, setCourseDetails] = useState<Course | null>(null)
  const [editedDetails, setEditedDetails] = useState<Partial<Course>>({})
  
  // Slides
  const [slides, setSlides] = useState<Slide[]>([])
  const [selectedSlideId, setSelectedSlideId] = useState<string>('')
  
  // Content
  const [slideContents, setSlideContents] = useState<{[slideId: string]: SlideContent}>({})
  const [slideQuizzes, setSlideQuizzes] = useState<{[slideId: string]: Quiz}>({})
  const [uploading, setUploading] = useState<{[key: string]: boolean}>({})
  
  // Assignments per slide
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [showAssignmentForm, setShowAssignmentForm] = useState(false)
  const [selectedAssignmentSlide, setSelectedAssignmentSlide] = useState<string>('')
  const [editingAssignment, setEditingAssignment] = useState<string | null>(null)
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
  const [uploadingAssignment, setUploadingAssignment] = useState(false)
  
  // Quiz creation
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  })

  useEffect(() => {
    loadCourseData()
  }, [courseId])

  const loadCourseData = () => {
    try {
      // Get current instructor
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

      // First check if it's a published course
      const publishedCourse = publishedCourses.find((c: Course) => c.id === courseId)
      
      if (publishedCourse) {
        setIsPublishedCourse(true)
        setCourseDetails(publishedCourse)
        setEditedDetails(publishedCourse)
      } else {
        // Load from localStorage courses
        const courses = JSON.parse(localStorage.getItem('courses') || '[]')
        const course = courses.find((c: Course) => c.id === courseId)
        
        if (!course) {
          alert('Course not found')
          router.push('/lms/Instructor_Portal/courses')
          return
        }
        
        // Check if instructor owns this course
        if (course.instructorId !== currentUser.id && course.instructorName !== currentUser.name) {
          alert('You do not have permission to edit this course')
          router.push('/lms/Instructor_Portal/courses')
          return
        }
        
        setCourseDetails(course)
        setEditedDetails(course)
      }
      
      // Load slides for this course (works for both types)
      const allSlides = JSON.parse(localStorage.getItem('slides') || '[]')
      const courseSlides = allSlides.filter((s: Slide) => s.courseId === courseId)
      
      // If no slides exist for published course, initialize them
      if (courseSlides.length === 0 && publishedCourse) {
        const defaultSlides = [
          {
            id: `${courseId}_slide_1`,
            courseId: courseId,
            slideNumber: 1,
            title: 'Introduction',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: `${courseId}_slide_2`,
            courseId: courseId,
            slideNumber: 2,
            title: 'Fundamentals',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: `${courseId}_slide_3`,
            courseId: courseId,
            slideNumber: 3,
            title: 'Advanced Concepts',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
        
        const updatedSlides = [...allSlides, ...defaultSlides]
        localStorage.setItem('slides', JSON.stringify(updatedSlides))
        setSlides(defaultSlides)
        setSelectedSlideId(defaultSlides[0].id)
      } else {
        setSlides(courseSlides)
        if (courseSlides.length > 0) {
          setSelectedSlideId(courseSlides[0].id)
        }
      }
      
      // Load slide contents
      const allContents = JSON.parse(localStorage.getItem('slideContent') || '[]')
      const contentsMap: {[slideId: string]: SlideContent} = {}
      allContents.forEach((content: SlideContent) => {
        if (content.courseId === courseId) {
          contentsMap[content.slideId] = content
        }
      })
      setSlideContents(contentsMap)
      
      // Load quizzes
      const allQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
      const quizzesMap: {[slideId: string]: Quiz} = {}
      allQuizzes.forEach((quiz: Quiz) => {
        if (quiz.courseId === courseId) {
          quizzesMap[quiz.slideId] = quiz
        }
      })
      setSlideQuizzes(quizzesMap)

      // Load assignments (now with slideId)
      const allAssignments = JSON.parse(localStorage.getItem('assignments') || '[]')
      const courseAssignments = allAssignments.filter((a: Assignment) => a.courseId === courseId)
      setAssignments(courseAssignments)
      
    } catch (error) {
      console.error('Error loading course:', error)
    } finally {
      setLoading(false)
    }
  }

  // ============ COURSE DETAILS FUNCTIONS ============
  const handleSaveDetails = () => {
    if (!courseDetails || !editedDetails) return
    
    if (isPublishedCourse) {
      alert('Published course details cannot be modified.')
      return
    }
    
    const updatedCourse = {
      ...courseDetails,
      ...editedDetails,
      updatedAt: new Date().toISOString()
    }
    
    // Update in localStorage
    const courses = JSON.parse(localStorage.getItem('courses') || '[]')
    const updatedCourses = courses.map((c: Course) => 
      c.id === courseId ? updatedCourse : c
    )
    localStorage.setItem('courses', JSON.stringify(updatedCourses))
    
    setCourseDetails(updatedCourse)
    alert('Course details updated successfully!')
  }

  // ============ SLIDE FUNCTIONS ============
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
    
    setSelectedSlideId(newSlide.id)
  }

  const handleRemoveSlide = (slideId: string) => {
    if (!confirm('Are you sure you want to delete this slide? All content, quizzes, and assignments will be removed.')) {
      return
    }
    
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
    if (selectedSlideId === slideId) {
      setSelectedSlideId(updatedSlidesStorage[0]?.id || '')
    }
    
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

  // ============ FILE UPLOAD FUNCTIONS ============
  const handleFileUpload = async (slideId: string, files: FileList | null) => {
    if (!files || !courseId) return
    
    setUploading(prev => ({ ...prev, [slideId]: true }))
    
    try {
      const uploadedFiles = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        const formData = new FormData()
        formData.append('file', file)
        formData.append('slideId', slideId)
        formData.append('courseId', courseId)
        
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
        const existingContents = JSON.parse(localStorage.getItem('slideContent') || '[]')
        
        let slideContent = existingContents.find((sc: SlideContent) => sc.slideId === slideId)
        
        if (slideContent) {
          slideContent.files = [...slideContent.files, ...uploadedFiles]
          const updatedContents = existingContents.map((sc: SlideContent) => 
            sc.slideId === slideId ? slideContent : sc
          )
          localStorage.setItem('slideContent', JSON.stringify(updatedContents))
        } else {
          const newContent: SlideContent = {
            slideId: slideId,
            courseId: courseId,
            files: uploadedFiles
          }
          localStorage.setItem('slideContent', JSON.stringify([...existingContents, newContent]))
        }
        
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

  // ============ QUIZ FUNCTIONS ============
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
    
    const existingQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
    let quiz = existingQuizzes.find((q: Quiz) => q.slideId === slideId)
    
    if (quiz) {
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
        existingQuizzes.splice(quizIndex, 1)
      }
      
      localStorage.setItem('quizzes', JSON.stringify(existingQuizzes))
      
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
    if (!selectedAssignmentSlide && !editingAssignment) {
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

    if (editingAssignment) {
      // Update existing assignment
      const updatedAssignments = assignments.map(a => 
        a.id === editingAssignment 
          ? {
              ...a,
              title: currentAssignment.title!,
              description: currentAssignment.description!,
              dueDate: currentAssignment.dueDate!,
              totalMarks: currentAssignment.totalMarks!,
              passingMarks: currentAssignment.passingMarks!,
              file: assignmentFile || a.file,
              status: currentAssignment.status as 'published' | 'draft',
              updatedAt: new Date().toISOString()
            }
          : a
      )

      // Update localStorage
      const allAssignments = JSON.parse(localStorage.getItem('assignments') || '[]')
      const updatedAllAssignments = allAssignments.map((a: Assignment) =>
        a.id === editingAssignment
          ? {
              ...a,
              title: currentAssignment.title!,
              description: currentAssignment.description!,
              dueDate: currentAssignment.dueDate!,
              totalMarks: currentAssignment.totalMarks!,
              passingMarks: currentAssignment.passingMarks!,
              file: assignmentFile || a.file,
              status: currentAssignment.status as 'published' | 'draft',
              updatedAt: new Date().toISOString()
            }
          : a
      )
      localStorage.setItem('assignments', JSON.stringify(updatedAllAssignments))
      setAssignments(updatedAssignments)
    } else {
      // Create new assignment
      const newAssignment: Assignment = {
        id: `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        slideId: selectedAssignmentSlide,
        courseId: courseId,
        title: currentAssignment.title!,
        description: currentAssignment.description!,
        dueDate: currentAssignment.dueDate!,
        totalMarks: currentAssignment.totalMarks!,
        passingMarks: currentAssignment.passingMarks!,
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
    }

    // Reset form
    resetAssignmentForm()
  }

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment.id)
    setSelectedAssignmentSlide(assignment.slideId)
    setCurrentAssignment({
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      totalMarks: assignment.totalMarks,
      passingMarks: assignment.passingMarks,
      status: assignment.status
    })
    if (assignment.file) {
      setAssignmentFile(assignment.file)
    }
    setShowAssignmentForm(true)
  }

  const handleRemoveAssignment = (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) {
      return
    }

    const updatedAssignments = assignments.filter(a => a.id !== assignmentId)
    
    // Update localStorage
    const existingAssignments = JSON.parse(localStorage.getItem('assignments') || '[]')
    const filteredAssignments = existingAssignments.filter((a: Assignment) => a.id !== assignmentId)
    localStorage.setItem('assignments', JSON.stringify(filteredAssignments))

    // Update state
    setAssignments(updatedAssignments)
  }

  const openAssignmentFormForSlide = (slideId: string) => {
    setSelectedAssignmentSlide(slideId)
    setEditingAssignment(null)
    setCurrentAssignment({
      title: '',
      description: '',
      dueDate: '',
      totalMarks: 100,
      passingMarks: 70,
      status: 'draft'
    })
    setAssignmentFile(null)
    setShowAssignmentForm(true)
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
    setEditingAssignment(null)
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('video')) return <FileVideo className="w-5 h-5 text-blue-500" />
    if (fileType.includes('image')) return <FileImage className="w-5 h-5 text-green-500" />
    if (fileType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />
    if (fileType.includes('word') || fileType.includes('document')) return <FileText className="w-5 h-5 text-blue-700" />
    return <File className="w-5 h-5 text-gray-500" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 w-48 bg-gray-200 rounded mb-6"></div>
            <div className="h-64 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!courseDetails) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.softGrey }} />
          <h3 className="text-lg font-medium mb-2">Course Not Found</h3>
          <Link
            href="/lms/Instructor_Portal/courses"
            className="text-darkRoyalBlue hover:underline cursor-pointer"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-lightGrey rounded-xl p-4 sm:p-6 border border-softGrey">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/lms/Instructor_Portal/courses"
              className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-white rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                {isPublishedCourse ? 'Published Course' : 'Edit Course'}
              </h1>
              <p className="text-darkGrey text-sm mt-1">{courseDetails.title}</p>
            </div>
            <div className="flex items-center gap-2">
              {isPublishedCourse && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  System Course
                </span>
              )}
              <Link
                href={`/lms/Instructor_Portal/courses/preview/${courseId}`}
                className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-white rounded-lg transition-colors cursor-pointer"
                title="Preview Course"
              >
                <Eye className="w-5 h-5" />
              </Link>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                courseDetails.status === 'published' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {courseDetails.status === 'published' ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-softGrey overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 text-sm font-medium transition-colors relative cursor-pointer whitespace-nowrap ${
                activeTab === 'details' 
                  ? 'text-deepRed' 
                  : 'text-darkGrey/60 hover:text-darkGrey'
              }`}
            >
              Course Details
              {activeTab === 'details' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-deepRed"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('slides')}
              className={`px-4 py-2 text-sm font-medium transition-colors relative cursor-pointer whitespace-nowrap ${
                activeTab === 'slides' 
                  ? 'text-deepRed' 
                  : 'text-darkGrey/60 hover:text-darkGrey'
              }`}
            >
              Slides ({slides.length})
              {activeTab === 'slides' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-deepRed"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 text-sm font-medium transition-colors relative cursor-pointer whitespace-nowrap ${
                activeTab === 'content' 
                  ? 'text-deepRed' 
                  : 'text-darkGrey/60 hover:text-darkGrey'
              } ${slides.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}
              disabled={slides.length === 0}
            >
              Content & Quizzes
              {activeTab === 'content' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-deepRed"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-4 py-2 text-sm font-medium transition-colors relative cursor-pointer whitespace-nowrap ${
                activeTab === 'assignments' 
                  ? 'text-deepRed' 
                  : 'text-darkGrey/60 hover:text-darkGrey'
              }`}
            >
              Assignments ({assignments.length})
              {activeTab === 'assignments' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-deepRed"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto">
        {/* Tab 1: Course Details */}
        {activeTab === 'details' && (
          <div className="bg-white rounded-lg border border-softGrey p-6">
            <h2 className="text-lg font-semibold mb-6" style={{ color: BRAND_COLORS.darkNavy }}>
              Course Details
            </h2>
            
            {isPublishedCourse ? (
              <div className="space-y-5 max-w-3xl">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">System Course - Read Only</h4>
                      <p className="text-sm text-blue-600 mt-1">
                        This is a system course provided by the platform. You can add slides, upload materials, create quizzes, and manage assignments, but the core course details cannot be modified.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">Course Name</label>
                    <p className="px-4 py-2.5 bg-lightGrey rounded-lg text-darkGrey">{courseDetails.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">Category</label>
                    <p className="px-4 py-2.5 bg-lightGrey rounded-lg text-darkGrey">{courseDetails.category}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-darkGrey mb-2">Description</label>
                  <p className="px-4 py-2.5 bg-lightGrey rounded-lg text-darkGrey">{courseDetails.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">Duration</label>
                    <p className="px-4 py-2.5 bg-lightGrey rounded-lg text-darkGrey">{courseDetails.duration || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">Level</label>
                    <p className="px-4 py-2.5 bg-lightGrey rounded-lg text-darkGrey">{courseDetails.level || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">Price</label>
                    <p className="px-4 py-2.5 bg-lightGrey rounded-lg text-darkGrey">{courseDetails.price || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5 max-w-3xl">
                <div>
                  <label className="block text-sm font-medium text-darkGrey mb-2">
                    Course Name
                  </label>
                  <input
                    type="text"
                    value={editedDetails.title || ''}
                    onChange={(e) => setEditedDetails({ ...editedDetails, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkGrey mb-2">
                    Description
                  </label>
                  <textarea
                    value={editedDetails.description || ''}
                    onChange={(e) => setEditedDetails({ ...editedDetails, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">
                      Student Capacity
                    </label>
                    <input
                      type="number"
                      value={editedDetails.studentCapacity || 0}
                      onChange={(e) => setEditedDetails({ ...editedDetails, studentCapacity: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">
                      Category
                    </label>
                    <select
                      value={editedDetails.category || ''}
                      onChange={(e) => setEditedDetails({ ...editedDetails, category: e.target.value })}
                      className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue bg-white"
                    >
                      <option value="Technical Training">Technical Training</option>
                      <option value="Safety Training">Safety Training</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Mobile Development">Mobile Development</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Business">Business</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkGrey mb-2">
                    Status
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={editedDetails.status === 'draft'}
                        onChange={() => setEditedDetails({ ...editedDetails, status: 'draft' })}
                        className="w-4 h-4 text-deepRed cursor-pointer"
                      />
                      <span className="text-sm">Draft</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={editedDetails.status === 'published'}
                        onChange={() => setEditedDetails({ ...editedDetails, status: 'published' })}
                        className="w-4 h-4 text-deepRed cursor-pointer"
                      />
                      <span className="text-sm">Published</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSaveDetails}
                    className="px-6 py-2.5 bg-red-700 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap min-w-fit"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Slides Management */}
        {activeTab === 'slides' && (
          <div className="bg-white rounded-lg border border-softGrey p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
                Manage Slides
              </h2>
              <button
                onClick={handleAddSlide}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap min-w-fit"
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
                <h3 className="text-base font-medium mb-2">No Slides Yet</h3>
                <p className="text-darkGrey/70 mb-4 text-sm">
                  Start by adding your first slide
                </p>
                <button
                  onClick={handleAddSlide}
                  className="px-4 py-2 bg-darkRoyalBlue text-white rounded-lg text-sm font-medium inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Create First Slide
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {slides.map((slide) => {
                  const slideAssignmentCount = assignments.filter(a => a.slideId === slide.id).length;
                  return (
                    <div key={slide.id} className="flex items-center gap-3 p-3 border border-softGrey rounded-lg">
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
                        <p className="text-xs text-darkGrey/60 mt-1">
                          {slideContents[slide.id]?.files?.length || 0} files • 
                          {slideQuizzes[slide.id]?.questions?.length || 0} questions •
                          {slideAssignmentCount} assignments
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveSlide(slide.id)}
                        className="p-2 text-brightRed hover:bg-brightRed/5 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Content & Quizzes */}
        {activeTab === 'content' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Slide List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-softGrey p-4">
                <h3 className="font-medium text-darkGrey mb-3">Slides</h3>
                <div className="space-y-2">
                  {slides.map((slide) => {
                    const slideAssignmentCount = assignments.filter(a => a.slideId === slide.id).length;
                    return (
                      <button
                        key={slide.id}
                        onClick={() => setSelectedSlideId(slide.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors cursor-pointer ${
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
                          {slideAssignmentCount} assignments
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              {selectedSlideId ? (
                <div className="space-y-6">
                  {/* Educational Content */}
                  <div className="bg-white rounded-lg border border-softGrey p-6">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                      Educational Content
                    </h3>
                    
                    <div className="mb-6">
                      <div className="border-2 border-dashed border-softGrey rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: BRAND_COLORS.softGrey }} />
                        <p className="text-sm text-darkGrey/70 mb-2">
                          Upload files to this slide
                        </p>
                        <label
                          htmlFor={`file-upload-${selectedSlideId}`}
                          className="inline-block cursor-pointer"
                        >
                          <input
                            id={`file-upload-${selectedSlideId}`}
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.mp4,.mov,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(selectedSlideId, e.target.files)}
                            className="hidden"
                            disabled={uploading[selectedSlideId]}
                          />
                          <span
                            className={`px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 ${
                              uploading[selectedSlideId] ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue, color: BRAND_COLORS.white }}
                          >
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
                                    {(file.size / 1024).toFixed(2)} KB
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveFile(selectedSlideId, file.publicId)}
                                className="p-1 text-brightRed hover:bg-brightRed/5 rounded cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quiz Content */}
                  <div className="bg-white rounded-lg border border-softGrey p-6">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                      Quiz Questions
                    </h3>

                    {/* Add Question Form */}
                    <div className="bg-lightGrey rounded-lg p-4 mb-6">
                      <h4 className="font-medium text-darkGrey mb-3">Add New Question</h4>
                      
                      <div className="space-y-4">
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

                        <div>
                          <label className="block text-xs font-medium text-darkGrey/70 mb-1">
                            Options
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
                                  className="w-4 h-4 text-deepRed cursor-pointer"
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
                        </div>

                        <button
                          onClick={() => handleAddQuestion(selectedSlideId)}
                          className="px-4 py-2 bg-blue-800 text-white rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap min-w-fit hover:bg-blue-700 transition-colors"
                        >
                          Add Question
                        </button>
                      </div>
                    </div>

                    {/* Questions List */}
                    {slideQuizzes[selectedSlideId]?.questions?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-darkGrey mb-3">
                          Questions ({slideQuizzes[selectedSlideId].questions.length})
                        </h4>
                        <div className="space-y-3">
                          {slideQuizzes[selectedSlideId].questions.map((q, qIndex) => (
                            <div key={q.id} className="border border-softGrey rounded-lg p-3">
                              <div className="flex items-start justify-between mb-2">
                                <p className="font-medium text-sm text-darkGrey">
                                  Q{qIndex + 1}: {q.question}
                                </p>
                                <button
                                  onClick={() => handleRemoveQuestion(selectedSlideId, q.id)}
                                  className="p-1 text-brightRed hover:bg-brightRed/5 rounded cursor-pointer"
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

                  {/* Assignments for this Slide */}
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
                          <h4 className="font-medium text-darkGrey">
                            {editingAssignment ? 'Edit Assignment' : 'New Assignment for this Slide'}
                          </h4>
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
                                  className="w-4 h-4 text-deepRed"
                                />
                                <span className="text-sm text-darkGrey">Draft</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="assignmentStatus"
                                  checked={currentAssignment.status === 'published'}
                                  onChange={() => setCurrentAssignment({ ...currentAssignment, status: 'published' })}
                                  className="w-4 h-4 text-deepRed"
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
                              {editingAssignment ? 'Update Assignment' : 'Save Assignment'}
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
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditAssignment(assignment)}
                                  className="p-1 text-darkRoyalBlue hover:bg-darkRoyalBlue/5 rounded"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRemoveAssignment(assignment.id)}
                                  className="p-1 text-brightRed hover:bg-brightRed/5 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
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
                  <h3 className="text-base font-medium mb-2">Select a Slide</h3>
                  <p className="text-darkGrey/70 text-sm">
                    Choose a slide from the left to add content, quizzes, and assignments
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Assignments Overview */}
        {activeTab === 'assignments' && (
          <div className="bg-white rounded-lg border border-softGrey p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
                All Assignments
              </h2>
            </div>

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
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setActiveTab('content');
                                    setSelectedSlideId(slide.id);
                                    setTimeout(() => {
                                      openAssignmentFormForSlide(slide.id);
                                      handleEditAssignment(assignment);
                                    }, 100);
                                  }}
                                  className="p-1 text-darkRoyalBlue hover:bg-darkRoyalBlue/5 rounded"
                                  title="Edit Assignment"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              </div>
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
                    </div>
                  );
                })}

                {/* If no assignments at all */}
                {assignments.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-softGrey rounded-lg">
                    <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.softGrey }} />
                    <h3 className="text-base font-medium mb-2">No Assignments Created</h3>
                    <p className="text-darkGrey/70 text-sm">
                      Go to the Content tab to add assignments to your slides
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-softGrey rounded-lg">
                <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.softGrey }} />
                <h3 className="text-base font-medium mb-2">No Slides Created</h3>
                <p className="text-darkGrey/70 text-sm">
                  Please create slides first before adding assignments
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}