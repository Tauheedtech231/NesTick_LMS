// lms/Instructor_Portal/courses/preview/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft,
  BookOpen,
  FileText,
  FileVideo,
  FileImage,
  File,
  Clock,
  Award,
  Layers,
  HelpCircle,
  Loader2,
  AlertCircle,
 
  ChevronDown,
  ChevronUp
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

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  level: string;
  instructorName: string;
  image?: string;
  status: 'draft' | 'published';
  stats: {
    slides: number;
    files: number;
    quizzes: number;
    assignments: number;
  };
}

interface Slide {
  id: string;
  slideNumber: number;
  title: string;
  files: SlideFile[];
  quiz?: Quiz;
  assignments: Assignment[];
}

interface SlideFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

interface Quiz {
  id: string;
  slideId: string;
  questions: QuizQuestion[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  totalMarks: number;
  passingMarks: number;
  file?: {
    name: string;
    url: string;
  };
  status: string;
}

export default function CoursePreviewPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [expandedSlides, setExpandedSlides] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPreviewData();
  }, [courseId]);

  const fetchPreviewData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/instructors/course/preview/${courseId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load preview');
      }

      if (result.success) {
        setCourse(result.data.course);
        setSlides(result.data.slides || []);
        
        // Auto-expand first slide
        if (result.data.slides?.length > 0) {
          setExpandedSlides(new Set([result.data.slides[0].id]));
        }
      }
    } catch (error: any) {
      console.error('Error loading preview:', error);
      setError(error.message || 'Failed to load preview');
    } finally {
      setLoading(false);
    }
  };

  const toggleSlide = (slideId: string) => {
    setExpandedSlides(prev => {
      const newSet = new Set(prev);
      if (newSet.has(slideId)) {
        newSet.delete(slideId);
      } else {
        newSet.add(slideId);
      }
      return newSet;
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('video')) return <FileVideo className="w-4 h-4 text-blue-500" />;
    if (fileType.includes('image')) return <FileImage className="w-4 h-4 text-green-500" />;
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />;
    return <File className="w-4 h-4 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
          <p className="text-sm text-darkGrey">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2 text-darkGrey">Error Loading Preview</h3>
          <p className="text-darkGrey/70 mb-6">{error || 'Course not found'}</p>
          <Link
            href="/lms/Instructor_Portal/courses"
            className="px-4 py-2 bg-darkRoyalBlue text-white rounded-lg inline-flex items-center gap-2 hover:bg-darkRoyalBlue/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-lightGrey rounded-xl p-4 sm:p-6 border border-softGrey">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/lms/Instructor_Portal/courses"
              className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                Course Preview
              </h1>
              <p className="text-darkGrey text-sm mt-1">Preview how students will see your course</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              course.status === 'published' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-amber-100 text-amber-700'
            }`}>
              {course.status === 'published' ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
      </div>

      {/* Course Overview Card */}
      <div className="bg-white rounded-xl border border-softGrey p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Course Image */}
          <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden bg-softGrey flex-shrink-0">
            {course.image ? (
              <img 
                src={course.image} 
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-8 h-8" style={{ color: BRAND_COLORS.softGrey }} />
              </div>
            )}
          </div>

          {/* Course Info */}
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2" style={{ color: BRAND_COLORS.darkNavy }}>
              {course.title}
            </h2>
            <p className="text-darkGrey/70 text-sm mb-4">{course.description}</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 text-xs text-darkGrey/60">
                <Layers className="w-4 h-4" style={{ color: BRAND_COLORS.teal }} />
                <span>{course.stats.slides} Slides</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-darkGrey/60">
                <FileText className="w-4 h-4" style={{ color: BRAND_COLORS.teal }} />
                <span>{course.stats.files} Files</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-darkGrey/60">
                <HelpCircle className="w-4 h-4" style={{ color: BRAND_COLORS.teal }} />
                <span>{course.stats.quizzes} Quizzes</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-darkGrey/60">
                <Award className="w-4 h-4" style={{ color: BRAND_COLORS.teal }} />
                <span>{course.stats.assignments} Assignments</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-4 text-xs text-darkGrey/60">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Duration: {course.duration || 'Self-paced'}
              </span>
              <span className="flex items-center gap-1">
                Level: {course.level || 'All Levels'}
              </span>
              <span className="flex items-center gap-1">
                Instructor: {course.instructorName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Slides List */}
      <div className="bg-white rounded-xl border border-softGrey p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
          Course Content ({slides.length} {slides.length === 1 ? 'Slide' : 'Slides'})
        </h3>

        {slides.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-softGrey rounded-lg">
            <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.softGrey }} />
            <p className="text-darkGrey/70 text-sm">No slides in this course yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {slides.map((slide) => {
              const isExpanded = expandedSlides.has(slide.id);
              const hasQuiz = slide.quiz && slide.quiz.questions && slide.quiz.questions.length > 0;
              const hasAssignments = slide.assignments && slide.assignments.length > 0;
              const hasFiles = slide.files && slide.files.length > 0;

              return (
                <div key={slide.id} className="border border-softGrey rounded-lg overflow-hidden">
                  {/* Slide Header */}
                  <div 
                    className="flex items-center justify-between p-4 bg-lightGrey cursor-pointer hover:bg-lightGrey/80 transition-colors"
                    onClick={() => toggleSlide(slide.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-medium">
                        {slide.slideNumber}
                      </div>
                      <div>
                        <h4 className="font-medium text-darkGrey">{slide.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-darkGrey/60">
                          {hasFiles && <span>{slide.files.length} files</span>}
                          {hasQuiz && <span>1 quiz</span>}
                          {hasAssignments && <span>{slide.assignments.length} assignments</span>}
                        </div>
                      </div>
                    </div>
                    <div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-darkGrey/60" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-darkGrey/60" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 space-y-4">
                      {/* Files Section */}
                      {hasFiles && (
                        <div>
                          <h5 className="text-sm font-medium text-darkGrey mb-2">Materials</h5>
                          <div className="space-y-2">
                            {slide.files.map((file) => (
                              <div key={file.id} className="flex items-center gap-3 p-2 bg-lightGrey rounded-lg">
                                {getFileIcon(file.type)}
                                <div className="flex-1">
                                  <p className="text-sm text-darkGrey">{file.name}</p>
                                  <p className="text-xs text-darkGrey/60">
                                    {(file.size / 1024).toFixed(0)} KB
                                  </p>
                                </div>
                                <a 
                                  href={file.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-darkRoyalBlue hover:underline"
                                >
                                  View
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quiz Section */}
                      {hasQuiz && slide.quiz && (
                        <div className={hasFiles ? 'border-t pt-4' : ''}>
                          <h5 className="text-sm font-medium text-darkGrey mb-2">Quiz</h5>
                          <div className="bg-lightGrey rounded-lg p-3">
                            <p className="text-sm text-darkGrey mb-2">
                              {slide.quiz.questions.length} Question{slide.quiz.questions.length !== 1 ? 's' : ''}
                            </p>
                            <div className="space-y-2">
                              {slide.quiz.questions.map((q, idx) => (
                                <div key={q.id} className="bg-white rounded-lg p-2 border border-softGrey">
                                  <p className="text-xs font-medium mb-1">Q{idx + 1}: {q.question}</p>
                                  <div className="grid grid-cols-2 gap-1">
                                    {q.options.map((opt, optIdx) => (
                                      <div key={optIdx} className="flex items-center gap-1 text-xs">
                                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                                          optIdx === q.correctAnswer 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-gray-100 text-gray-500'
                                        }`}>
                                          {String.fromCharCode(65 + optIdx)}
                                        </span>
                                        <span className="truncate">{opt}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Assignments Section */}
                      {hasAssignments && (
                        <div className={(hasFiles || hasQuiz) ? 'border-t pt-4' : ''}>
                          <h5 className="text-sm font-medium text-darkGrey mb-2">Assignments</h5>
                          <div className="space-y-2">
                            {slide.assignments.map((assignment) => (
                              <div key={assignment.id} className="bg-lightGrey rounded-lg p-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-darkGrey">{assignment.title}</p>
                                    <p className="text-xs text-darkGrey/60 mt-1">{assignment.description}</p>
                                  </div>
                                  <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                                    assignment.status === 'published' 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {assignment.status}
                                  </span>
                                </div>
                                <div className="flex gap-4 mt-2 text-xs text-darkGrey/60">
                                  <span>Marks: {assignment.totalMarks}</span>
                                  <span>Passing: {assignment.passingMarks}</span>
                                  {assignment.dueDate && (
                                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                  )}
                                </div>
                                {assignment.file && (
                                  <a 
                                    href={assignment.file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 mt-2 text-xs text-darkRoyalBlue hover:underline"
                                  >
                                    <FileText className="w-3 h-3" />
                                    {assignment.file.name}
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Back to Edit Button */}
      <div className="mt-6 flex justify-center">
        <Link
          href={`/lms/Instructor_Portal/courses/edit/${courseId}`}
          className="px-6 py-2.5 bg-darkRoyalBlue text-white rounded-lg font-medium hover:bg-darkRoyalBlue/90 transition-colors"
        >
          Edit Course
        </Link>
      </div>
    </div>
  );
}