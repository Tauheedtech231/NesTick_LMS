// app/lms/Student_Portal/courses/[id]/page.tsx
'use client';
/* eslint-disable */
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  HiArrowLeft, 
  HiCheckCircle, 
  HiClock, 
  HiDocumentText, 
  HiPlay, 
  HiDownload,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiChevronDown,
  HiChevronUp,
  HiChartBar,
  HiTrendingUp,
  HiTrendingDown,
  HiDocumentReport,
  HiPaperClip,
  HiRefresh,
  HiEye,
  HiEyeOff,
  HiChartPie,
  HiCalendar,
  HiTrendingUp as HiTrendingUpIcon,
  HiViewGrid,
  HiViewList,
  HiFolder,
  HiFolderOpen,
  HiLockClosed,
  HiLockOpen
} from 'react-icons/hi';
import { IoMdRadioButtonOff } from 'react-icons/io';
import { Loader2 } from 'lucide-react';

const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  white: '#FFFFFF',
  lightGrey: '#F4F6F8',
  softGrey: '#E5E7EB',
  darkGrey: '#1F2933',
  teal: '#1FB6CB'
};

// ============ UPDATED TYPES ============
enum QuestionType {
  MCQ = 'mcq',
  TEXT = 'text'
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  questionType?: QuestionType; // Optional for backward compatibility
}

interface Quiz {
  slideId: string;
  courseId: string;
  questions: QuizQuestion[];
}

interface QuizAnswer {
  questionIndex: number;
  selectedOption?: number; // For MCQ
  textAnswer?: string;     // For text questions
}

interface QuizAttempt {
  quizId: string;
  slideId: string;
  courseId: string;
  answers: QuizAnswer[];   // Updated to support both types
  score: number;
  passed: boolean;
  attemptedAt: string;
}

interface SlideFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  publicId: string;
  uploadedAt: string;
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

interface AssignmentSubmission {
  assignmentId: string;
  courseId: string;
  studentEmail: string;
  studentName: string;
  files: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    publicId: string;
    uploadedAt: string;
  }>;
  submittedAt: string;
  status: 'submitted' | 'graded' | 'late';
  score?: number;
  feedback?: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration?: string;
  image?: string;
  instructorName?: string;
  level?: string;
}

interface Slide {
  id: string;
  courseId: string;
  slideNumber: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface SlidePerformance {
  slideId: string;
  title: string;
  slideNumber: number;
  completed: boolean;
  hasQuiz: boolean;
  quizAttempted: boolean;
  quizScore?: number;
  quizPassed?: boolean;
  hasAssignment: boolean;
  assignmentSubmitted: boolean;
}

interface CourseData {
  course: Course;
  slides: Slide[];
  contents: Record<string, SlideFile[]>;
  quizzes: Record<string, Quiz>;
  assignments: Assignment[];
  progress: {
    completedSlides: string[];
    completedContent: string[];
    progressPercentage: number;
    studyHours: number;
    status: string;
  };
  quizAttempts: Record<string, QuizAttempt>;
  assignmentSubmissions: Record<string, AssignmentSubmission>;
}

// View mode type
type ViewMode = 'grid' | 'list';

export default function StudentCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [enrollmentId, setEnrollmentId] = useState<string>('');
  const [course, setCourse] = useState<Course | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [slideContents, setSlideContents] = useState<Map<string, SlideFile[]>>(new Map());
  const [quizzes, setQuizzes] = useState<Map<string, Quiz>>(new Map());
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<Map<string, AssignmentSubmission>>(new Map());
  const [completedSlides, setCompletedSlides] = useState<Set<string>>(new Set());
  const [completedContent, setCompletedContent] = useState<Set<string>>(new Set());
  const [quizAttempts, setQuizAttempts] = useState<Map<string, QuizAttempt>>(new Map());
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Quiz states - UPDATED for text questions
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  
  const [expandedSlides, setExpandedSlides] = useState<Set<string>>(new Set());
  const [showPerformance, setShowPerformance] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState<string | null>(null);
  const [assignmentFiles, setAssignmentFiles] = useState<File[]>([]);
  const [uploadingAssignment, setUploadingAssignment] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState<{show: boolean; message: string; type: 'success' | 'error'} | null>(null);
  const [assignmentFeedback, setAssignmentFeedback] = useState<{show: boolean; message: string; type: 'success' | 'error'} | null>(null);
  const [trackingContent, setTrackingContent] = useState<Record<string, boolean>>({});
  
  // NEW: View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  
  // NEW: Selected slide for detailed view in grid mode
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);

  // Load user from localStorage
  useEffect(() => {
    try {
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) {
        router.push('/lms/auth/login?type=student');
        return;
      }
      const userData = JSON.parse(currentUserStr);
      if (userData.role !== 'student') {
        router.push('/lms/auth/login?type=student');
        return;
      }
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
      setError('Failed to load user data');
    }
  }, [router]);

  // Fetch enrollment ID
  const fetchEnrollmentId = async () => {
    if (!user?.email) return null;

    try {
      const response = await fetch(`/api/students/enrollments?email=${encodeURIComponent(user.email)}`);
      const result = await response.json();

      if (result.success && result.data.length > 0) {
        const enrollment = result.data.find((e: any) => e.course_id === courseId);
        if (enrollment) {
          setEnrollmentId(enrollment.id);
          return enrollment.id;
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching enrollment:', error);
      return null;
    }
  };

  // Load course data from API
  const loadCourseData = async (showRefreshing = false) => {
    if (!user?.email) return;

    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Get enrollment ID first
      let eid = enrollmentId;
      if (!eid) {
        eid = await fetchEnrollmentId();
      }

      // Fetch course details
      const response = await fetch(
        `/api/students/courses/${courseId}?studentEmail=${encodeURIComponent(user.email)}${eid ? `&enrollmentId=${eid}` : ''}`
      );
      
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load course');
      }

      if (result.success && result.data) {
        const data: CourseData = result.data;
        
        setCourse(data.course);
        setSlides(data.slides || []);
        
        // Set slide contents
        const contentsMap = new Map();
        Object.entries(data.contents || {}).forEach(([slideId, files]) => {
          contentsMap.set(slideId, files);
        });
        setSlideContents(contentsMap);
        
        // Set quizzes
        const quizzesMap = new Map();
        Object.entries(data.quizzes || {}).forEach(([slideId, quiz]) => {
          quizzesMap.set(slideId, quiz);
        });
        setQuizzes(quizzesMap);
        
        // Set assignments
        setAssignments(data.assignments || []);
        
        // Set progress
        if (data.progress) {
          setCompletedSlides(new Set(data.progress.completedSlides || []));
          setCompletedContent(new Set(data.progress.completedContent || []));
        }
        
        // Set quiz attempts
        const attemptsMap = new Map();
        Object.entries(data.quizAttempts || {}).forEach(([slideId, attempt]) => {
          attemptsMap.set(slideId, attempt);
        });
        setQuizAttempts(attemptsMap);
        
        // Set assignment submissions
        const submissionsMap = new Map();
        Object.entries(data.assignmentSubmissions || {}).forEach(([key, sub]) => {
          submissionsMap.set(key, sub);
        });
        setAssignmentSubmissions(submissionsMap);
        
        // Auto-expand first incomplete slide in list mode
        if (data.slides?.length > 0) {
          const completed = new Set(data.progress?.completedSlides || []);
          const firstIncomplete = data.slides.find((s: Slide) => !completed.has(s.id));
          if (firstIncomplete) {
            setExpandedSlides(new Set([firstIncomplete.id]));
            setSelectedSlide(firstIncomplete);
          } else {
            setExpandedSlides(new Set([data.slides[0].id]));
            setSelectedSlide(data.slides[0]);
          }
        }
      }
    } catch (error: any) {
      console.error('Error loading course:', error);
      setError(error.message || 'Failed to load course');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      loadCourseData();
    }
  }, [user]);

  // Update progress API call
  const updateProgress = async (slideId?: string, contentType?: string, contentId?: string) => {
    if (!user?.email || !enrollmentId) return;

    try {
      const response = await fetch('/api/students/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId,
          studentEmail: user.email,
          courseId,
          slideId,
          contentType,
          contentId
        })
      });

      const result = await response.json();
      if (result.success && result.data) {
        setCompletedSlides(new Set(result.data.completedSlides || []));
        setCompletedContent(new Set(result.data.completedContent || []));
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // Track content view
  const trackContentView = async (slideId: string, fileId: string, completed: boolean, durationWatched: number = 0) => {
    if (!user?.email || !enrollmentId) return;

    const trackingKey = `${slideId}_${fileId}`;
    if (trackingContent[trackingKey]) return;
    
    setTrackingContent(prev => ({ ...prev, [trackingKey]: true }));

    try {
      const response = await fetch('/api/students/track/content-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId,
          studentEmail: user.email,
          courseId,
          slideId,
          contentId: fileId,
          durationWatched,
          completed
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Content view tracked');
        
        if (result.data.slideProgress.status === 'completed') {
          setCompletedSlides(prev => new Set([...prev, slideId]));
        }
      }
    } catch (error) {
      console.error('Error tracking content view:', error);
    } finally {
      setTrackingContent(prev => ({ ...prev, [trackingKey]: false }));
    }
  };

  // Auto-complete slide
  const autoCompleteSlide = async (slideId: string) => {
    if (!user?.email || !enrollmentId) return;

    try {
      const response = await fetch('/api/students/slide/auto-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId,
          studentEmail: user.email,
          courseId,
          slideId
        })
      });

      const result = await response.json();
      
      if (result.success && result.data.slideCompleted) {
        setCompletedSlides(prev => new Set([...prev, slideId]));
        
        setQuizFeedback({
          show: true,
          message: '🎉 Lesson automatically completed!',
          type: 'success'
        });
        setTimeout(() => setQuizFeedback(null), 3000);
      }
    } catch (error) {
      console.error('Error auto-completing slide:', error);
    }
  };

  // Mark content as complete
  const markContentComplete = async (slideId: string, fileId: string) => {
    if (!user) return;

    const contentKey = `${slideId}_${fileId}`;
    const isCurrentlyCompleted = completedContent.has(contentKey);
    const newCompleted = !isCurrentlyCompleted;
    
    const newCompletedSet = new Set(completedContent);
    if (newCompleted) {
      newCompletedSet.add(contentKey);
    } else {
      newCompletedSet.delete(contentKey);
    }
    setCompletedContent(newCompletedSet);

    await trackContentView(slideId, fileId, newCompleted, 30);

    const slideFiles = slideContents.get(slideId) || [];
    const allCompleted = slideFiles.every(f => 
      newCompletedSet.has(`${slideId}_${f.id}`)
    );

    if (allCompleted) {
      await autoCompleteSlide(slideId);
    }
  };

  // Check if slide can be marked complete
  const canMarkSlideComplete = (slideId: string): boolean => {
    const slideFiles = slideContents.get(slideId) || [];
    const quiz = quizzes.get(slideId);
    const quizAttempt = quiz ? quizAttempts.get(slideId) : null;
    const slideAssignments = assignments.filter(a => a.slideId === slideId);
    
    const allContentCompleted = slideFiles.every(f => 
      completedContent.has(`${slideId}_${f.id}`)
    );
    
    const quizAttempted = quiz ? !!quizAttempt : true;
    
    const allAssignmentsSubmitted = slideAssignments.length === 0 || 
      slideAssignments.every(a => assignmentSubmissions.has(a.id));
    
    return allContentCompleted && quizAttempted && allAssignmentsSubmitted;
  };

  // Mark slide as complete
  const markSlideComplete = async (slideId: string) => {
    if (!user) return;
    
    if (!canMarkSlideComplete(slideId)) {
      setQuizFeedback({
        show: true,
        message: 'Complete all content, quiz, and assignments first',
        type: 'error'
      });
      setTimeout(() => setQuizFeedback(null), 3000);
      return;
    }

    const newCompleted = new Set(completedSlides);
    newCompleted.add(slideId);
    setCompletedSlides(newCompleted);
    
    await updateProgress(slideId, 'slide');
    await autoCompleteSlide(slideId);
    
    setQuizFeedback({
      show: true,
      message: `✓ Lesson completed!`,
      type: 'success'
    });
    setTimeout(() => setQuizFeedback(null), 2000);
  };

  // ============ UPDATED QUIZ SUBMIT FUNCTION ============
  const handleQuizSubmit = async (slideId: string) => {
    const quiz = quizzes.get(slideId);
    if (!quiz || !user || !enrollmentId) return;

    // Validate answers based on question types
    let isValid = true;
    let errorMessage = '';

    quiz.questions.forEach((q, index) => {
      const answer = quizAnswers[index];
      
      if (q.questionType === 'text' || !q.options || q.options.length === 0) {
        // Text question validation
        if (!answer?.textAnswer?.trim()) {
          isValid = false;
          errorMessage = `Please answer question ${index + 1}`;
        }
      } else {
        // MCQ validation
        if (answer?.selectedOption === undefined || answer.selectedOption === -1) {
          isValid = false;
          errorMessage = `Please answer question ${index + 1}`;
        }
      }
    });

    if (!isValid) {
      setQuizFeedback({
        show: true,
        message: errorMessage,
        type: 'error'
      });
      setTimeout(() => setQuizFeedback(null), 3000);
      return;
    }

    const quizId = slideId;

    // Check if quiz already attempted
    if (quizAttempts.has(slideId)) {
      setQuizFeedback({
        show: true,
        message: 'You have already attempted this quiz. No retakes allowed.',
        type: 'error'
      });
      setTimeout(() => setQuizFeedback(null), 3000);
      setActiveQuiz(null);
      setQuizAnswers([]);
      setTextAnswers({});
      return;
    }

    // Calculate score (for display only - backend will do actual grading)
    let correctCount = 0;
    quiz.questions.forEach((q, index) => {
      const answer = quizAnswers[index];
      
      if (q.questionType === 'text' || !q.options || q.options.length === 0) {
        // Text questions are manually graded, so we don't auto-calculate
        // For now, we'll set score to 0 and backend will handle grading
        // The instructor will grade these manually
      } else {
        // MCQ - auto-grade
        if (answer?.selectedOption === q.correctAnswer) {
          correctCount++;
        }
      }
    });
    
    // For MCQ-only quizzes, calculate score
    const mcqQuestions = quiz.questions.filter(q => q.options && q.options.length > 0);
    const score = mcqQuestions.length > 0 
      ? Math.round((correctCount / mcqQuestions.length) * 100) 
      : 0;
    
    const passed = score >= 70; // Only meaningful for MCQ quizzes

    try {
      const response = await fetch('/api/students/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId,
          studentEmail: user.email,
          courseId,
          slideId,
          quizId,
          answers: quizAnswers, // Now sending array of QuizAnswer objects
          score,
          passed
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit quiz');
      }

      if (result.success) {
        const attempt: QuizAttempt = {
          quizId,
          slideId,
          courseId,
          answers: quizAnswers,
          score,
          passed,
          attemptedAt: new Date().toISOString()
        };

        setQuizAttempts(new Map(quizAttempts.set(slideId, attempt)));

        setQuizFeedback({
          show: true,
          message: passed ? `🎉 Quiz submitted! Score: ${score}%` : `Quiz submitted. Score: ${score}%`,
          type: passed ? 'success' : 'error'
        });
        setTimeout(() => setQuizFeedback(null), 4000);

        // Check if slide can be auto-completed
        const slideFiles = slideContents.get(slideId) || [];
        const allContentCompleted = slideFiles.every(f => 
          completedContent.has(`${slideId}_${f.id}`)
        );
        
        if (allContentCompleted) {
          await autoCompleteSlide(slideId);
        }
      }
    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      setQuizFeedback({
        show: true,
        message: error.message || 'Failed to submit quiz',
        type: 'error'
      });
      setTimeout(() => setQuizFeedback(null), 3000);
    }

    setActiveQuiz(null);
    setQuizAnswers([]);
    setTextAnswers({});
  };

  // Handle assignment submission
  const handleAssignmentSubmit = async (assignmentId: string, slideId: string) => {
    if (!user || !enrollmentId) return;
    
    if (assignmentFiles.length === 0) {
      setAssignmentFeedback({
        show: true,
        message: 'Please upload at least one file',
        type: 'error'
      });
      setTimeout(() => setAssignmentFeedback(null), 3000);
      return;
    }

    setUploadingAssignment(true);

    try {
      // Upload files to Cloudinary
      const uploadedFiles = [];
      
      for (const file of assignmentFiles) {
        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append('file', file);
        cloudinaryFormData.append('type', 'assignment_submission');

        const response = await fetch('/api/upload/cloudinary', {
          method: 'POST',
          body: cloudinaryFormData,
        });

        if (!response.ok) {
          continue;
        }

        const result = await response.json();

        if (result.success) {
          uploadedFiles.push({
            id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            type: file.type,
            size: file.size,
            url: result.data.secure_url,
            publicId: result.data.public_id,
            uploadedAt: new Date().toISOString()
          });
        }
      }

      if (uploadedFiles.length === 0) {
        throw new Error('Failed to upload any files');
      }

      // Submit assignment
      const submitFormData = new FormData();
      submitFormData.append('enrollmentId', enrollmentId);
      submitFormData.append('studentEmail', user.email);
      submitFormData.append('studentName', user.name || 'Student');
      submitFormData.append('courseId', courseId);
      submitFormData.append('slideId', slideId);
      submitFormData.append('assignmentId', assignmentId);
      submitFormData.append('files', JSON.stringify(uploadedFiles));

      const response = await fetch('/api/students/assignment/submit', {
        method: 'POST',
        body: submitFormData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit');
      }

      if (result.success) {
        const submission: AssignmentSubmission = {
          assignmentId,
          courseId,
          studentEmail: user.email,
          studentName: user.name || 'Student',
          files: uploadedFiles,
          submittedAt: new Date().toISOString(),
          status: 'submitted'
        };

        setAssignmentSubmissions(new Map(assignmentSubmissions.set(assignmentId, submission)));

        setAssignmentFeedback({
          show: true,
          message: '✓ Assignment submitted successfully!',
          type: 'success'
        });
        setTimeout(() => setAssignmentFeedback(null), 3000);

        // Check if slide can be auto-completed
        const slideFiles = slideContents.get(slideId) || [];
        const allContentCompleted = slideFiles.every(f => 
          completedContent.has(`${slideId}_${f.id}`)
        );
        const quiz = quizzes.get(slideId);
        const quizAttempted = quiz ? quizAttempts.has(slideId) : true;
        
        if (allContentCompleted && quizAttempted) {
          await autoCompleteSlide(slideId);
        }
        
        setActiveAssignment(null);
        setAssignmentFiles([]);
      }
    } catch (error: any) {
      console.error('❌ Submission error:', error);
      setAssignmentFeedback({
        show: true,
        message: error.message || 'Failed to submit assignment',
        type: 'error'
      });
      setTimeout(() => setAssignmentFeedback(null), 3000);
    } finally {
      setUploadingAssignment(false);
    }
  };

  // Calculate slide performance
  const getSlidePerformance = (): SlidePerformance[] => {
    return slides.map(slide => {
      const quiz = quizzes.get(slide.id);
      const attempt = quiz ? quizAttempts.get(slide.id) : null;
      const slideAssignments = assignments.filter(a => a.slideId === slide.id);
      
      return {
        slideId: slide.id,
        title: slide.title,
        slideNumber: slide.slideNumber,
        completed: completedSlides.has(slide.id),
        hasQuiz: !!quiz,
        quizAttempted: !!attempt,
        quizScore: attempt?.score,
        quizPassed: attempt?.passed,
        hasAssignment: slideAssignments.length > 0,
        assignmentSubmitted: slideAssignments.some(a => assignmentSubmissions.has(a.id))
      };
    });
  };

  // Calculate overall performance
  const getOverallPerformance = () => {
    const performance = getSlidePerformance();
    const totalSlides = performance.length;
    const completedSlidesCount = performance.filter(p => p.completed).length;
    const slidesWithQuiz = performance.filter(p => p.hasQuiz);
    const passedQuizzes = slidesWithQuiz.filter(p => p.quizPassed).length;
    const slidesWithAssignment = performance.filter(p => p.hasAssignment);
    const submittedAssignments = slidesWithAssignment.filter(p => p.assignmentSubmitted).length;
    
    const completionRate = totalSlides > 0 ? Math.round((completedSlidesCount / totalSlides) * 100) : 0;
    const quizPassRate = slidesWithQuiz.length > 0 ? Math.round((passedQuizzes / slidesWithQuiz.length) * 100) : 0;
    const assignmentRate = slidesWithAssignment.length > 0 ? Math.round((submittedAssignments / slidesWithAssignment.length) * 100) : 0;
    
    let performanceLevel = 'Needs Improvement';
    let performanceColor = BRAND_COLORS.deepRed;
    let performanceIcon = HiTrendingDown;
    
    if (completionRate >= 80 && quizPassRate >= 80 && assignmentRate >= 80) {
      performanceLevel = 'Excellent';
      performanceColor = '#10B981';
      performanceIcon = HiTrendingUp;
    } else if (completionRate >= 60 && quizPassRate >= 60 && assignmentRate >= 60) {
      performanceLevel = 'Good';
      performanceColor = BRAND_COLORS.teal;
      performanceIcon = HiTrendingUp;
    } else if (completionRate >= 40 && quizPassRate >= 40 && assignmentRate >= 40) {
      performanceLevel = 'Average';
      performanceColor = BRAND_COLORS.darkRoyalBlue;
      performanceIcon = HiChartBar;
    }
    
    return {
      completionRate,
      quizPassRate,
      assignmentRate,
      performanceLevel,
      performanceColor,
      performanceIcon,
      completedSlides: completedSlidesCount,
      totalSlides,
      passedQuizzes,
      totalQuizzes: slidesWithQuiz.length,
      submittedAssignments,
      totalAssignments: slidesWithAssignment.length
    };
  };

  const progress = slides.length > 0 
    ? Math.round((completedSlides.size / slides.length) * 100) 
    : 0;

  const completedCount = completedSlides.size;
  const totalCount = slides.length;
  const overallPerformance = getOverallPerformance();
  const PerformanceIcon = overallPerformance.performanceIcon;

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('video')) return <HiPlay className="w-5 h-5 text-blue-600" />;
    if (fileType.includes('pdf')) return <HiDocumentText className="w-5 h-5 text-red-500" />;
    if (fileType.includes('image')) return <HiDocumentText className="w-5 h-5 text-green-500" />;
    if (fileType.includes('word') || fileType.includes('document')) return <HiDocumentText className="w-5 h-5 text-blue-700" />;
    return <HiDocumentText className="w-5 h-5 text-gray-500" />;
  };

  const toggleSlideExpansion = (slideId: string) => {
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Initialize quiz answers when starting a quiz
  const initializeQuiz = (slideId: string, quiz: Quiz) => {
    setActiveQuiz(slideId);
    
    // Initialize answers array based on question types
    const initialAnswers: QuizAnswer[] = quiz.questions.map((q, index) => {
      if (q.questionType === 'text' || !q.options || q.options.length === 0) {
        return { questionIndex: index, textAnswer: '' };
      } else {
        return { questionIndex: index, selectedOption: -1 };
      }
    });
    
    setQuizAnswers(initialAnswers);
    setTextAnswers({});
  };

  // Update answer for a question
  const updateQuizAnswer = (questionIndex: number, question: QuizQuestion, value: any) => {
    const updatedAnswers = [...quizAnswers];
    
    if (question.questionType === 'text' || !question.options || question.options.length === 0) {
      // Text answer
      updatedAnswers[questionIndex] = {
        questionIndex,
        textAnswer: value
      };
    } else {
      // MCQ answer
      updatedAnswers[questionIndex] = {
        questionIndex,
        selectedOption: parseInt(value)
      };
    }
    
    setQuizAnswers(updatedAnswers);
  };

  // NEW: Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  // NEW: Handle slide selection in grid mode
  const handleSlideSelect = (slide: Slide) => {
    setSelectedSlide(slide);
    // In list mode, also expand this slide
    if (viewMode === 'list') {
      setExpandedSlides(new Set([slide.id]));
    }
  };

  // NEW: Check if slide is accessible (previous slides completed)
  const isSlideAccessible = (slideIndex: number): boolean => {
    if (slideIndex === 0) return true;
    
    // Check if all previous slides are completed
    for (let i = 0; i < slideIndex; i++) {
      if (!completedSlides.has(slides[i].id)) {
        return false;
      }
    }
    return true;
  };

  // NEW: Get slide status
  const getSlideStatus = (slide: Slide): {
    status: 'locked' | 'available' | 'in-progress' | 'completed';
    icon: any;
    color: string;
    bgColor: string;
  } => {
    const slideIndex = slides.findIndex(s => s.id === slide.id);
    const accessible = isSlideAccessible(slideIndex);
    const isCompleted = completedSlides.has(slide.id);
    const hasContent = (slideContents.get(slide.id) || []).length > 0;
    const hasQuiz = quizzes.has(slide.id);
    const quizAttempted = quizzes.has(slide.id) ? quizAttempts.has(slide.id) : true;
    
    if (!accessible) {
      return {
        status: 'locked',
        icon: HiLockClosed,
        color: '#9CA3AF',
        bgColor: '#F3F4F6'
      };
    } else if (isCompleted) {
      return {
        status: 'completed',
        icon: HiCheckCircle,
        color: '#10B981',
        bgColor: '#D1FAE5'
      };
    } else if (hasContent || hasQuiz) {
      return {
        status: 'available',
        icon: HiLockOpen,
        color: BRAND_COLORS.deepRed,
        bgColor: '#FEE2E2'
      };
    } else {
      return {
        status: 'available',
        icon: HiLockOpen,
        color: BRAND_COLORS.deepRed,
        bgColor: '#FEE2E2'
      };
    }
  };

  // NEW: Render slide grid/tile view
  const renderSlideGrid = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {slides.map((slide, index) => {
          const status = getSlideStatus(slide);
          const StatusIcon = status.icon;
          const isSelected = selectedSlide?.id === slide.id;
          const slideFiles = slideContents.get(slide.id) || [];
          const quiz = quizzes.get(slide.id);
          const attempt = quiz ? quizAttempts.get(slide.id) : null;
          const hasAssignment = assignments.some(a => a.slideId === slide.id);
          const completedFilesCount = slideFiles.filter(f => completedContent.has(`${slide.id}_${f.id}`)).length;
          
          return (
            <div
              key={slide.id}
              onClick={() => handleSlideSelect(slide)}
              className={`bg-white rounded-xl border-2 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected ? 'border-red-600 ring-2 ring-red-200' : 'border-gray-200 hover:border-red-300'
              }`}
            >
              {/* Slide Header */}
              <div className="p-4 border-b border-gray-100" style={{ backgroundColor: status.bgColor }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusIcon className="w-5 h-5" style={{ color: status.color }} />
                    <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ 
                      backgroundColor: status.color + '20',
                      color: status.color
                    }}>
                      {status.status === 'locked' ? 'Locked' : status.status === 'completed' ? 'Completed' : 'Available'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-500">Lesson {slide.slideNumber}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mt-2 line-clamp-2">{slide.title}</h3>
              </div>

              {/* Slide Content Preview */}
              <div className="p-4">
                {/* Files Preview */}
                {slideFiles.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <HiDocumentText className="w-3 h-3" />
                      {slideFiles.length} file(s)
                    </p>
                    <div className="flex items-center gap-1">
                      {slideFiles.slice(0, 3).map((file, idx) => (
                        <div key={idx} className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
                          {getFileIcon(file.type)}
                        </div>
                      ))}
                      {slideFiles.length > 3 && (
                        <span className="text-xs text-gray-400">+{slideFiles.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Quiz Preview */}
                {quiz && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        Quiz
                      </span>
                      {attempt && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          attempt.passed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          Score: {attempt.score}%
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Assignment Preview */}
                {hasAssignment && (
                  <div className="mb-3">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      Assignment
                    </span>
                  </div>
                )}

                {/* Progress Bar */}
                {slideFiles.length > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium">{completedFilesCount}/{slideFiles.length}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(completedFilesCount / slideFiles.length) * 100}%`,
                          backgroundColor: BRAND_COLORS.deepRed
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* View Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSlideSelect(slide);
                  }}
                  className={`w-full mt-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    status.status === 'locked'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isSelected
                      ? 'bg-red-600 text-white'
                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                  disabled={status.status === 'locked'}
                >
                  {status.status === 'locked' ? 'Locked' : isSelected ? 'Viewing' : 'View Lesson'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // NEW: Render slide list view (original expanded view)
  const renderSlideList = () => {
    return (
      <div className="space-y-4">
        {slides.map((slide) => {
          const isCompleted = completedSlides.has(slide.id);
          const isExpanded = expandedSlides.has(slide.id);
          const slideFiles = slideContents.get(slide.id) || [];
          const quiz = quizzes.get(slide.id);
          const attempt = quiz ? quizAttempts.get(slide.id) : null;
          const slideAssignments = assignments.filter(a => a.slideId === slide.id);
          const hasAssignment = slideAssignments.length > 0;
          const canComplete = canMarkSlideComplete(slide.id);

          const completedFilesCount = slideFiles.filter(f => completedContent.has(`${slide.id}_${f.id}`)).length;

          return (
            <div 
              key={slide.id} 
              className={`border rounded-lg overflow-hidden ${
                isCompleted ? 'border-green-200 bg-green-50/30' : 'border-gray-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50">
                <div className="flex items-center gap-3 flex-1">
                  <div>
                    {isCompleted ? (
                      <HiCheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <IoMdRadioButtonOff className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <button
                    onClick={() => toggleSlideExpansion(slide.id)}
                    className="flex-1 text-left"
                  >
                    <h3 className={`font-medium ${isCompleted ? 'text-gray-700' : 'text-gray-900'}`}>
                      Lesson {slide.slideNumber}: {slide.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span>{slideFiles.length} file(s)</span>
                      {slideFiles.length > 0 && (
                        <span className="text-blue-600">
                          {completedFilesCount}/{slideFiles.length} completed
                        </span>
                      )}
                      {quiz && <span>• 1 quiz</span>}
                      {hasAssignment && <span>• {slideAssignments.length} assignment(s)</span>}
                    </div>
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  {quiz && attempt && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      attempt.passed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      Quiz: {attempt.score}%
                    </span>
                  )}
                  <button
                    onClick={() => toggleSlideExpansion(slide.id)}
                    className="p-1 hover:bg-gray-200 rounded-full"
                  >
                    {isExpanded ? <HiChevronUp className="w-5 h-5" /> : <HiChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="p-4 space-y-4">
                  {/* Files */}
                  {slideFiles.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Lesson Materials</h4>
                      <div className="space-y-2">
                        {slideFiles.map((file) => {
                          const isContentCompleted = completedContent.has(`${slide.id}_${file.id}`);
                          const isVideo = file.type.includes('video');
                          
                          return (
                            <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3 flex-1">
                                {getFileIcon(file.type)}
                                <div>
                                  <p className="text-sm text-gray-700">{file.name}</p>
                                  <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => markContentComplete(slide.id, file.id)}
                                  disabled={trackingContent[`${slide.id}_${file.id}`]}
                                  className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                    isContentCompleted
                                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                  } disabled:opacity-50`}
                                >
                                  {trackingContent[`${slide.id}_${file.id}`] ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    isContentCompleted ? '✓ Completed' : 'Mark Complete'
                                  )}
                                </button>
                                
                                {isVideo ? (
                                  <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline px-3 py-1 flex items-center gap-1"
                                  >
                                    <HiEye className="w-4 h-4" />
                                    View
                                  </a>
                                ) : (
                                  <a
                                    href={file.url}
                                    download={file.name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline px-3 py-1 flex items-center gap-1"
                                  >
                                    <HiDownload className="w-4 h-4" />
                                    Download
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quiz */}
                  {quiz && (
                    <div className={slideFiles.length > 0 ? 'border-t pt-4' : ''}>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Quiz</h4>
                      
                      {attempt ? (
                        <div className={`p-4 rounded-lg ${
                          attempt.passed ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                        }`}>
                          <div className="flex items-center gap-3">
                            {attempt.passed ? (
                              <HiOutlineCheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                              <HiOutlineXCircle className="w-6 h-6 text-yellow-600" />
                            )}
                            <div>
                              <p className={`text-sm font-medium ${
                                attempt.passed ? 'text-green-700' : 'text-yellow-700'
                              }`}>
                                Score: {attempt.score}% - {attempt.passed ? 'Passed' : 'Failed'}
                              </p>
                              <p className="text-xs text-gray-500">
                                Attempted on {formatDate(attempt.attemptedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : activeQuiz === slide.id ? (
                        <div className="space-y-4">
                          {quiz.questions.map((q, idx) => {
                            const isTextQuestion = q.questionType === 'text' || !q.options || q.options.length === 0;
                            
                            return (
                              <div key={q.id} className="border border-gray-200 rounded-lg p-4">
                                <p className="text-sm font-medium mb-3">
                                  Question {idx + 1}: {q.question}
                                </p>
                                
                                {isTextQuestion ? (
                                  <div className="mt-2">
                                    <textarea
                                      value={quizAnswers[idx]?.textAnswer || ''}
                                      onChange={(e) => updateQuizAnswer(idx, q, e.target.value)}
                                      rows={4}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                      placeholder="Type your answer here..."
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                      Write your answer in the text box above
                                    </p>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {q.options.map((opt, optIdx) => (
                                      <label key={optIdx} className="flex items-center gap-3 text-sm p-2 rounded hover:bg-gray-50 cursor-pointer">
                                        <input
                                          type="radio"
                                          name={`q-${q.id}`}
                                          checked={quizAnswers[idx]?.selectedOption === optIdx}
                                          onChange={() => updateQuizAnswer(idx, q, optIdx)}
                                          className="w-4 h-4 text-blue-600"
                                        />
                                        <span>{opt}</span>
                                      </label>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleQuizSubmit(slide.id)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                            >
                              Submit Quiz
                            </button>
                            <button
                              onClick={() => {
                                setActiveQuiz(null);
                                setQuizAnswers([]);
                                setTextAnswers({});
                              }}
                              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => initializeQuiz(slide.id, quiz)}
                          className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100"
                        >
                          Start Quiz
                        </button>
                      )}
                    </div>
                  )}

                  {/* Assignments */}
                  {hasAssignment && (
                    <div className={(slideFiles.length > 0 || quiz) ? 'border-t pt-4' : ''}>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Assignments</h4>
                      
                      {slideAssignments.map((assignment) => {
                        const submission = assignmentSubmissions.get(assignment.id);
                        
                        return (
                          <div key={assignment.id} className="space-y-3">
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                              <h5 className="font-medium">{assignment.title}</h5>
                              <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                              
                              <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                                <span>Due: {formatDate(assignment.dueDate)}</span>
                                <span>Total: {assignment.totalMarks}</span>
                                <span>Passing: {assignment.passingMarks}</span>
                              </div>

                              {assignment.file && (
                                <div className="mt-3 p-2 bg-white rounded-lg border">
                                  <p className="text-xs font-medium text-gray-500 mb-1">Assignment File:</p>
                                  <a
                                    href={assignment.file.url}
                                    download={assignment.file.name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                  >
                                    <HiPaperClip className="w-4 h-4" />
                                    {assignment.file.name}
                                    <HiDownload className="w-4 h-4 ml-1" />
                                  </a>
                                </div>
                              )}
                            </div>

                            {submission ? (
                              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <HiCheckCircle className="w-6 h-6 text-green-600" />
                                  <div>
                                    <p className="text-sm font-medium text-green-700">Submitted</p>
                                    <p className="text-xs text-gray-500">
                                      {formatDate(submission.submittedAt)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : activeAssignment === assignment.id ? (
                              <div className="border border-gray-200 rounded-lg p-4">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                  <input
                                    type="file"
                                    multiple
                                    onChange={(e) => setAssignmentFiles(Array.from(e.target.files || []))}
                                    className="hidden"
                                    id={`assignment-${assignment.id}`}
                                  />
                                  <label
                                    htmlFor={`assignment-${assignment.id}`}
                                    className="cursor-pointer block text-center"
                                  >
                                    <HiDocumentText className="w-8 h-8 mx-auto text-gray-400" />
                                    <p className="text-sm text-gray-600 mt-2">Click to upload files</p>
                                    {assignmentFiles.map((file, idx) => (
                                      <p key={idx} className="text-xs text-green-600 mt-1">{file.name}</p>
                                    ))}
                                  </label>
                                </div>

                                <div className="flex gap-2 mt-4">
                                  <button
                                    onClick={() => handleAssignmentSubmit(assignment.id, slide.id)}
                                    disabled={uploadingAssignment || assignmentFiles.length === 0}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                                  >
                                    {uploadingAssignment ? 'Uploading...' : 'Submit'}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveAssignment(null);
                                      setAssignmentFiles([]);
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setActiveAssignment(assignment.id)}
                                className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                              >
                                Start Assignment
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Complete Lesson Button */}
                  {canComplete && !isCompleted && (
                    <button
                      onClick={() => markSlideComplete(slide.id)}
                      className="mt-3 w-full py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      <HiCheckCircle className="w-4 h-4 inline mr-2" />
                      Mark Lesson as Complete
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: BRAND_COLORS.deepRed }} />
          <p className="text-gray-600">Loading course materials...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-bold mb-2">Error Loading Course</h2>
          <p className="text-gray-600 mb-6">{error || 'Course not found'}</p>
          <Link
            href="/lms/Student_Portal/my-courses"
            className="inline-block px-6 py-3 rounded-lg text-white"
            style={{ backgroundColor: BRAND_COLORS.deepRed }}
          >
            Back to My Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Feedback Toasts */}
      {quizFeedback?.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg animate-slide-in ${
          quizFeedback.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <p className="text-sm font-medium">{quizFeedback.message}</p>
        </div>
      )}

      {assignmentFeedback?.show && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg animate-slide-in ${
          assignmentFeedback.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <p className="text-sm font-medium">{assignmentFeedback.message}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/lms/Student_Portal/my-courses"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <HiArrowLeft className="w-5 h-5 mr-2" />
          Back to Courses
        </Link>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Grid View"
            >
              <HiViewGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleViewModeChange('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="List View"
            >
              <HiViewList className="w-5 h-5" />
            </button>
          </div>
          
          <button
            onClick={() => loadCourseData(true)}
            disabled={refreshing}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <HiRefresh className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Course Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>
        <p className="text-gray-600 mb-4">{course.description}</p>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <span className="flex items-center">
            <HiClock className="w-4 h-4 mr-1" />
            {course.duration || 'Self-paced'}
          </span>
          <span className="flex items-center">
            <HiDocumentText className="w-4 h-4 mr-1" />
            {totalCount} {totalCount === 1 ? 'lesson' : 'lessons'}
          </span>
          {course.level && (
            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
              {course.level}
            </span>
          )}
          {course.instructorName && (
            <span className="flex items-center">
              Instructor: {course.instructorName}
            </span>
          )}
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progress ({completedCount}/{totalCount} lessons)
            </span>
            <span className="text-sm font-semibold" style={{ color: BRAND_COLORS.deepRed }}>
              {progress}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500" 
              style={{ width: `${progress}%`, backgroundColor: BRAND_COLORS.deepRed }}
            />
          </div>
        </div>

        {/* Performance */}
        <div className="mt-4 bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PerformanceIcon className="w-5 h-5" style={{ color: overallPerformance.performanceColor }} />
              <span className="text-sm font-medium text-gray-700">Performance</span>
            </div>
            <span 
              className="text-sm font-semibold px-2 py-1 rounded-full"
              style={{ 
                backgroundColor: `${overallPerformance.performanceColor}20`,
                color: overallPerformance.performanceColor
              }}
            >
              {overallPerformance.performanceLevel}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div>
              <p className="text-xs text-gray-500">Completion</p>
              <p className="text-sm font-semibold">{overallPerformance.completionRate}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Quiz Pass</p>
              <p className="text-sm font-semibold">{overallPerformance.quizPassRate}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Assignment</p>
              <p className="text-sm font-semibold">{overallPerformance.assignmentRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Toggle */}
      <button
        onClick={() => setShowPerformance(!showPerformance)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <HiChartBar className="w-4 h-4" />
        {showPerformance ? 'Hide' : 'Show'} Detailed Performance
        {showPerformance ? <HiChevronUp className="w-4 h-4" /> : <HiChevronDown className="w-4 h-4" />}
      </button>

      {/* Performance Table */}
      {showPerformance && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-xs font-medium text-gray-500">Lesson</th>
                <th className="text-left py-2 text-xs font-medium text-gray-500">Status</th>
                <th className="text-left py-2 text-xs font-medium text-gray-500">Quiz</th>
                <th className="text-left py-2 text-xs font-medium text-gray-500">Score</th>
                <th className="text-left py-2 text-xs font-medium text-gray-500">Assignment</th>
                <th className="text-left py-2 text-xs font-medium text-gray-500">Files</th>
              </tr>
            </thead>
            <tbody>
              {getSlidePerformance().map((perf) => (
                <tr key={perf.slideId} className="border-b border-gray-100">
                  <td className="py-3">
                    <p className="text-sm font-medium text-gray-900">
                      Lesson {perf.slideNumber}: {perf.title}
                    </p>
                  </td>
                  <td className="py-3">
                    {perf.completed ? (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <HiCheckCircle className="w-4 h-4" />
                        Completed
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">In Progress</span>
                    )}
                  </td>
                  <td className="py-3">
                    {perf.hasQuiz ? (
                      perf.quizAttempted ? (
                        <span className={`text-xs ${perf.quizPassed ? 'text-green-600' : 'text-yellow-600'}`}>
                          {perf.quizPassed ? 'Passed' : 'Failed'}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Not Attempted</span>
                      )
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-3">
                    {perf.quizScore ? (
                      <span className={`text-sm font-medium ${perf.quizScore >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {perf.quizScore}%
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-3">
                    {perf.hasAssignment ? (
                      perf.assignmentSubmitted ? (
                        <span className="text-xs text-green-600">Submitted</span>
                      ) : (
                        <span className="text-xs text-yellow-600">Pending</span>
                      )
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Lessons Section with View Mode Toggle */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Course Lessons</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {viewMode === 'grid' ? `${slides.length} lessons` : 'List View'}
            </span>
          </div>
        </div>
        
        {slides.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-500">No lessons available yet.</p>
          </div>
        ) : (
          <>
            {/* View Mode Renderer */}
            {viewMode === 'grid' ? renderSlideGrid() : renderSlideList()}
            
            {/* Selected Slide Detail View (for Grid Mode) */}
            {viewMode === 'grid' && selectedSlide && (
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Lesson {selectedSlide.slideNumber}: {selectedSlide.title}
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {/* Render the same detailed content as expanded list view but for selected slide */}
                  {renderSlideList().props.children.find(
                    (child: any) => child.key === selectedSlide.id
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}