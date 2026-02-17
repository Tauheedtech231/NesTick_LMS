// lms/Instructor_Portal/courses/preview/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  FileVideo,
  FileImage,
  File,
  AlertCircle,
  HelpCircle,
  CheckCircle,
  XCircle,
  Lock,
  PlayCircle,
  Download
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

// Published courses data – explicitly typed as Course[]
const publishedCourses: Course[] = [
  {
    id: 'pipe-fitter',
    title: 'Pipe Fitter',
    description: 'Master industrial pipe fitting techniques with hands-on training on cutting, threading, and installation following international standards.',
    category: 'Technical Training',
    status: 'published',
    instructorName: 'System Instructor',
    isPublished: true,
    image: "https://images.pexels.com/photos/6124242/pexels-photo-6124242.jpeg",
    duration: '8 Weeks',
    level: 'Beginner to Advanced',
    price: 'PKR 25,000',
    highlights: [
      'Learn pipe cutting, threading, and installation',
      'Blueprint reading and interpretation',
      'Pipe system design and layout',
      'Safety protocols and standards',
      'Hands-on workshop training',
      'Industry certification preparation'
    ]
  },
  {
    id: 'safety-inspector',
    title: 'Safety Inspector',
    description: 'Professional safety inspection training for construction and industrial environments with OSHA certification preparation.',
    category: 'Safety Training',
    status: 'published',
    instructorName: 'System Instructor',
    isPublished: true,
    image: "https://images.pexels.com/photos/34082713/pexels-photo-34082713.jpeg",
    duration: '6 Weeks',
    level: 'Intermediate',
    price: 'PKR 30,000',
    highlights: [
      'OSHA standards and regulations',
      'Site inspection methodologies',
      'Risk assessment techniques',
      'Safety documentation',
      'Emergency response planning',
      'Certification exam preparation'
    ]
  },
  {
    id: 'welding',
    title: 'Professional Welding',
    description: 'Comprehensive welding training covering MIG, TIG, and Arc welding techniques for industrial applications.',
    category: 'Technical Training',
    status: 'published',
    instructorName: 'System Instructor',
    isPublished: true,
    image: "https://images.pexels.com/photos/7650512/pexels-photo-7650512.jpeg",
    duration: '10 Weeks',
    level: 'Beginner to Professional',
    price: 'PKR 35,000',
    highlights: [
      'MIG, TIG, and Arc welding techniques',
      'Metal identification and preparation',
      'Weld quality inspection',
      'Safety equipment usage',
      'Industry-standard certification',
      'Portfolio development'
    ]
  }
];

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'draft' | 'published';
  instructorName: string;
  isPublished?: boolean;          // optional, for published courses
  image?: string;                 // optional
  duration?: string;              // optional
  level?: string;                 // optional
  price?: string;                 // optional
  highlights?: string[];          // optional
}

interface Slide {
  id: string;
  courseId: string;
  slideNumber: number;
  title: string;
}

interface SlideContent {
  slideId: string;
  files: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
}

interface Quiz {
  slideId: string;
  questions: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
}

export default function PreviewCoursePage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string

  const [loading, setLoading] = useState(true)
  const [course, setCourse] = useState<Course | null>(null)
  const [slides, setSlides] = useState<Slide[]>([])
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [slideContents, setSlideContents] = useState<{ [slideId: string]: SlideContent }>({})
  const [slideQuizzes, setSlideQuizzes] = useState<{ [slideId: string]: Quiz }>({})
  const [isPublishedCourse, setIsPublishedCourse] = useState(false)

  useEffect(() => {
    loadPreviewData()
  }, [courseId])

  const loadPreviewData = () => {
    try {
      // First check if it's a published course
      const publishedCourse = publishedCourses.find((c) => c.id === courseId)
      
      if (publishedCourse) {
        setIsPublishedCourse(true)
        setCourse(publishedCourse)
      } else {
        // Load from localStorage courses
        const courses = JSON.parse(localStorage.getItem('courses') || '[]')
        const foundCourse = courses.find((c: Course) => c.id === courseId)
        
        if (!foundCourse) {
          alert('Course not found')
          router.push('/lms/Instructor_Portal/courses')
          return
        }
        setCourse(foundCourse)
      }

      // Load slides (works for both types)
      const allSlides = JSON.parse(localStorage.getItem('slides') || '[]')
      const courseSlides = allSlides
        .filter((s: Slide) => s.courseId === courseId)
        .sort((a: Slide, b: Slide) => a.slideNumber - b.slideNumber)
      
      // If no slides for published course, create default preview slides
      if (courseSlides.length === 0 && publishedCourse) {
        const defaultSlides = [
          {
            id: `${courseId}_slide_1`,
            courseId: courseId,
            slideNumber: 1,
            title: 'Introduction to the Course'
          },
          {
            id: `${courseId}_slide_2`,
            courseId: courseId,
            slideNumber: 2,
            title: 'Key Concepts'
          },
          {
            id: `${courseId}_slide_3`,
            courseId: courseId,
            slideNumber: 3,
            title: 'Practical Applications'
          },
          {
            id: `${courseId}_slide_4`,
            courseId: courseId,
            slideNumber: 4,
            title: 'Assessment Preparation'
          }
        ]
        setSlides(defaultSlides)
        
        // Create default content for preview
        const defaultContents: { [slideId: string]: SlideContent } = {}
        defaultSlides.forEach(slide => {
          defaultContents[slide.id] = {
            slideId: slide.id,
            files: [
              {
                id: `file_${slide.id}_1`,
                name: `Lecture Notes - ${slide.title}.pdf`,
                type: 'application/pdf',
                size: 1024 * 1024 * 1.5, // 1.5 MB
                url: '#',
              },
              {
                id: `file_${slide.id}_2`,
                name: `Video Tutorial - ${slide.title}.mp4`,
                type: 'video/mp4',
                size: 1024 * 1024 * 25, // 25 MB
                url: '#',
              }
            ]
          }
        })
        setSlideContents(defaultContents)
      } else {
        setSlides(courseSlides)
      }

      // Load content
      const allContents = JSON.parse(localStorage.getItem('slideContent') || '[]')
      const contentsMap: { [slideId: string]: SlideContent } = {}
      allContents.forEach((content: SlideContent) => {
        if (content.slideId && (courseSlides.some((s: Slide) => s.id === content.slideId) || publishedCourse)) {
          contentsMap[content.slideId] = content
        }
      })
      setSlideContents(contentsMap)

      // Load quizzes
      const allQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
      const quizzesMap: { [slideId: string]: Quiz } = {}
      allQuizzes.forEach((quiz: Quiz) => {
        if (quiz.slideId && (courseSlides.some((s: { id: string }) => s.id === quiz.slideId) || publishedCourse)) {
          quizzesMap[quiz.slideId] = quiz
        }
      })
      setSlideQuizzes(quizzesMap)
    } catch (error) {
      console.error('Error loading preview:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('video')) return <FileVideo className="w-5 h-5 text-blue-500" />
    if (fileType.includes('image')) return <FileImage className="w-5 h-5 text-green-500" />
    if (fileType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />
    if (fileType.includes('word') || fileType.includes('document')) return <FileText className="w-5 h-5 text-blue-700" />
    return <File className="w-5 h-5 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const currentSlide = slides[currentSlideIndex]
  const currentContent = currentSlide ? slideContents[currentSlide.id] : null
  const currentQuiz = currentSlide ? slideQuizzes[currentSlide.id] : null

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.softGrey }} />
          <h3 className="text-lg font-medium mb-2">Course not found</h3>
          <Link href="/lms/Instructor_Portal/courses" className="text-darkRoyalBlue hover:underline">
            Back to courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-lightGrey rounded-xl p-4 sm:p-6 border border-softGrey">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/lms/Instructor_Portal/courses"
              className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                  {course.title}
                </h1>
                {isPublishedCourse && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 flex items-center gap-1">
                    <PlayCircle className="w-3 h-3" />
                    System Course
                  </span>
                )}
              </div>
              <p className="text-darkGrey text-sm mt-1">{course.description}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                <span className="px-2 py-1 bg-white rounded-full">{course.category}</span>
                <span className="text-darkGrey/60">Instructor: {course.instructorName}</span>
                {course.duration && (
                  <span className="text-darkGrey/60">Duration: {course.duration}</span>
                )}
                {course.level && (
                  <span className="text-darkGrey/60">Level: {course.level}</span>
                )}
                {course.price && (
                  <span className="text-darkGrey/60">Price: {course.price}</span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  course.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {course.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
          </div>

          {/* Course Image for published courses */}
          {isPublishedCourse && course.image && (
            <div className="mt-4 rounded-lg overflow-hidden h-48 sm:h-64">
              <img 
                src={course.image} 
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Highlights for published courses */}
          {isPublishedCourse && course.highlights && course.highlights.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-darkGrey mb-2">Course Highlights</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {course.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-darkGrey/70">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main preview area */}
      <div className="max-w-4xl mx-auto">
        {slides.length === 0 ? (
          <div className="bg-white rounded-lg border border-softGrey p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.softGrey }} />
            <h3 className="text-lg font-medium mb-2">No slides yet</h3>
            <p className="text-darkGrey/70">This course has no content to preview.</p>
          </div>
        ) : (
          <>
            {/* Slide navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentSlideIndex(i => Math.max(0, i - 1))}
                disabled={currentSlideIndex === 0}
                className="p-2 rounded-lg border border-softGrey disabled:opacity-50 disabled:cursor-not-allowed hover:bg-lightGrey transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-darkGrey">
                  Slide {currentSlideIndex + 1} of {slides.length}
                </span>
                {isPublishedCourse && (
                  <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                    Preview Mode
                  </span>
                )}
              </div>
              <button
                onClick={() => setCurrentSlideIndex(i => Math.min(slides.length - 1, i + 1))}
                disabled={currentSlideIndex === slides.length - 1}
                className="p-2 rounded-lg border border-softGrey disabled:opacity-50 disabled:cursor-not-allowed hover:bg-lightGrey transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Current slide title */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
                {currentSlide?.title}
              </h2>
            </div>

            {/* Content files */}
            {currentContent && currentContent.files.length > 0 && (
              <div className="bg-white rounded-lg border border-softGrey p-6 mb-6">
                <h3 className="font-medium text-darkGrey mb-4">Materials</h3>
                <div className="space-y-3">
                  {currentContent.files.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-lightGrey rounded-lg">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getFileIcon(file.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-darkGrey truncate">{file.name}</p>
                          <p className="text-xs text-darkGrey/60">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      {file.url && file.url !== '#' ? (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 text-xs bg-darkRoyalBlue text-white rounded hover:bg-darkRoyalBlue/90 transition-colors flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          View
                        </a>
                      ) : (
                        <span className="px-3 py-1 text-xs bg-softGrey text-darkGrey/60 rounded">
                          Preview Only
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quiz */}
            {currentQuiz && currentQuiz.questions.length > 0 && (
              <div className="bg-white rounded-lg border border-softGrey p-6">
                <h3 className="font-medium text-darkGrey mb-4">Quiz</h3>
                <div className="space-y-6">
                  {currentQuiz.questions.map((q, idx) => (
                    <div key={q.id} className="border-b border-softGrey last:border-0 pb-4 last:pb-0">
                      <p className="font-medium text-darkGrey mb-2">
                        {idx + 1}. {q.question}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = optIdx === q.correctAnswer
                          return (
                            <div
                              key={optIdx}
                              className={`flex items-center gap-2 p-2 rounded-lg ${
                                isCorrect ? 'bg-green-50 border border-green-200' : 'bg-lightGrey'
                              }`}
                            >
                              {isCorrect ? (
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                              ) : (
                                <XCircle className="w-4 h-4 text-darkGrey/30 flex-shrink-0" />
                              )}
                              <span className="text-sm text-darkGrey flex-1">{opt}</span>
                              {isCorrect && (
                                <span className="ml-auto text-xs font-medium text-green-600">Correct answer</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-darkGrey/60 mt-4">
                  * Correct answers are highlighted for preview only. Students will see the quiz without indicators.
                </p>
              </div>
            )}

            {/* No content message */}
            {(!currentContent || currentContent.files.length === 0) && (!currentQuiz || currentQuiz.questions.length === 0) && (
              <div className="bg-white rounded-lg border border-softGrey p-12 text-center">
                <HelpCircle className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.softGrey }} />
                <h3 className="text-base font-medium mb-2">No content on this slide</h3>
                <p className="text-darkGrey/70 text-sm">
                  This slide has no files or quiz questions.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}