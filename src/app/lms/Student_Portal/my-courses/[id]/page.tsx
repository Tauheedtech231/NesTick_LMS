'use client';
/* eslint-disable */
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
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
  HiPaperClip,
  HiRefresh,
  HiEye,
  HiChartPie,
  HiCalendar,
  HiViewGrid,
  HiViewList,
  HiLockClosed,
  HiLockOpen,
  HiX,
  HiRewind
} from 'react-icons/hi';
import { IoMdRadioButtonOff } from 'react-icons/io';
import { Loader2 } from 'lucide-react';
import StudentAdvancedQuiz from '../../components/StudentAdvancedQuiz';
import SimpleQuiz from '../../components/SimpleQuiz';

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

// ============ TYPES ============
enum QuestionType {
  MCQ = 'mcq',
  TEXT = 'text'
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  questionType?: QuestionType;
}

interface Quiz {
  quizId: string;
  slideId: string;
  courseId: string;
  questions: QuizQuestion[];
}

interface QuizAnswer {
  questionIndex: number;
  selectedOption?: number;
  textAnswer?: string;
}

interface QuizAttempt {
  quizId: string;
  slideId: string;
  courseId: string;
  answers: QuizAnswer[];
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
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface AssignmentSubmission {
  assignmentId: string;
  courseId: string;
  studentEmail: string;
  studentName: string;
  files: any[];
  submittedAt: string;
  status: string;
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
  price?: number;
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
  hasVideo: boolean;
  videoCompleted: boolean;
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

type ViewMode = 'grid' | 'list';

// Video progress tracking interface
interface VideoProgress {
  fileId: string;
  slideId: string;
  progress: number;
  lastPosition: number;
  completed: boolean;
  updatedAt: string;
  duration: number;
}

export default function StudentCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [enrollmentId, setEnrollmentId] = useState<string>('');
  const [enrollment, setEnrollment] = useState<any>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [slideContents, setSlideContents] = useState<Map<string, SlideFile[]>>(new Map());
  const [quizzes, setQuizzes] = useState<Map<string, Quiz>>(new Map());
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<Map<string, AssignmentSubmission>>(new Map());
  const [completedSlides, setCompletedSlides] = useState<Set<string>>(new Set());
  const [completedContent, setCompletedContent] = useState<Set<string>>(new Set());
  const [quizAttempts, setQuizAttempts] = useState<Map<string, QuizAttempt>>(new Map());
  const [advancedQuizAttempts, setAdvancedQuizAttempts] = useState<Set<string>>(new Set());
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Simple quiz states
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  
  const [expandedSlides, setExpandedSlides] = useState<Set<string>>(new Set());
  const [showPerformance, setShowPerformance] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState<string | null>(null);
  const [assignmentFiles, setAssignmentFiles] = useState<File[]>([]);
  const [uploadingAssignment, setUploadingAssignment] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState<{show: boolean; message: string; type: 'success' | 'error'} | null>(null);
  const [assignmentFeedback, setAssignmentFeedback] = useState<{show: boolean; message: string; type: 'success' | 'error'} | null>(null);
  const [trackingContent, setTrackingContent] = useState<Record<string, boolean>>({});
  const [markingComplete, setMarkingComplete] = useState<Record<string, boolean>>({});
  
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);

  // Video player states
  const [activeVideo, setActiveVideo] = useState<{ slideId: string; fileId: string; file: SlideFile } | null>(null);
  const [videoProgress, setVideoProgress] = useState<Record<string, VideoProgress>>({});
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showViewButton, setShowViewButton] = useState<Record<string, boolean>>({});

  // Load video progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('videoProgress');
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        setVideoProgress(progress);
        
        const completedVideos: Record<string, boolean> = {};
        Object.keys(progress).forEach(key => {
          if (progress[key].completed) {
            completedVideos[key] = true;
          }
        });
        setShowViewButton(completedVideos);
      } catch (e) {
        console.error('Error loading video progress:', e);
      }
    }
  }, []);

  // Save video progress to localStorage
  const saveVideoProgress = (fileId: string, slideId: string, progress: number, position: number, completed: boolean, duration: number) => {
    const key = `${slideId}_${fileId}`;
    const newProgress = {
      ...videoProgress,
      [key]: {
        fileId,
        slideId,
        progress,
        lastPosition: position,
        completed,
        updatedAt: new Date().toISOString(),
        duration: duration
      }
    };
    setVideoProgress(newProgress);
    localStorage.setItem('videoProgress', JSON.stringify(newProgress));
    
    if (completed && !showViewButton[key]) {
      setShowViewButton(prev => ({ ...prev, [key]: true }));
      markContentViewed(slideId, fileId);
    }
  };

  // ✅ Handle video time update - track progress, allow backward, block forward
  const handleVideoTimeUpdate = () => {
    if (!videoRef.current || !activeVideo) return;
    
    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    const key = `${activeVideo.slideId}_${activeVideo.fileId}`;
    const savedProgress = videoProgress[key];
    const lastSavedPosition = savedProgress?.lastPosition || 0;
    
    // ✅ ONLY track forward progress naturally (no forced seeking)
    if (currentTime > lastSavedPosition) {
      const progressPercent = (currentTime / duration) * 100;
      const completed = progressPercent >= 95;
      
      // Save progress every 3 seconds
      if (Math.floor(currentTime) % 3 === 0 || completed) {
        saveVideoProgress(activeVideo.fileId, activeVideo.slideId, progressPercent, currentTime, completed, duration);
        
        if (completed && !completedContent.has(key)) {
          setQuizFeedback({
            show: true,
            message: '✅ Video completed!',
            type: 'success'
          });
          setTimeout(() => setQuizFeedback(null), 2000);
          setActiveVideo(null);
        }
      }
    }
    
    // Update progress for UI display
    const progressPercent = (currentTime / duration) * 100;
    setVideoProgress(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        progress: progressPercent,
        lastPosition: currentTime,
        duration: duration
      }
    }));
  };

  // ✅ Handle seeking - BLOCK forward seeking, ALLOW backward
  const handleVideoSeeking = () => {
    if (!videoRef.current || !activeVideo) return;
    
    const currentTime = videoRef.current.currentTime;
    const key = `${activeVideo.slideId}_${activeVideo.fileId}`;
    const savedProgress = videoProgress[key];
    const maxAllowedPosition = savedProgress?.lastPosition || 0;
    
    // ✅ If user tries to seek forward beyond watched position, block it
    if (currentTime > maxAllowedPosition + 0.5 && maxAllowedPosition > 0) {
      videoRef.current.currentTime = maxAllowedPosition;
      setQuizFeedback({
        show: true,
        message: '⚠️ You cannot skip forward. Only backward seeking is allowed.',
        type: 'error'
      });
      setTimeout(() => setQuizFeedback(null), 2000);
    }
    // ✅ Allow backward seeking (rewind) anytime - no restriction
  };

  // ✅ Handle backward button click (rewind 10 seconds)
  const handleBackward = () => {
    if (!videoRef.current || !activeVideo) return;
    const newTime = Math.max(0, videoRef.current.currentTime - 10);
    videoRef.current.currentTime = newTime;
    setQuizFeedback({
      show: true,
      message: '⏪ Rewound 10 seconds',
      type: 'success'
    });
    setTimeout(() => setQuizFeedback(null), 1000);
  };

  const handleVideoLoadedMetadata = () => {
    if (!videoRef.current || !activeVideo) return;
    
    const key = `${activeVideo.slideId}_${activeVideo.fileId}`;
    const savedProgress = videoProgress[key];
    const duration = videoRef.current.duration;
    
    if (savedProgress && savedProgress.lastPosition > 0 && !savedProgress.completed) {
      if (savedProgress.lastPosition < duration - 5) {
        videoRef.current.currentTime = savedProgress.lastPosition;
        setQuizFeedback({
          show: true,
          message: `▶️ Resuming from ${Math.floor(savedProgress.lastPosition / 60)}:${Math.floor(savedProgress.lastPosition % 60).toString().padStart(2, '0')}`,
          type: 'success'
        });
        setTimeout(() => setQuizFeedback(null), 2000);
      }
    }
    
    // Update duration in progress
    if (savedProgress) {
      setVideoProgress(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          duration: duration
        }
      }));
    }
  };

  const handleVideoEnded = () => {
    if (!activeVideo) return;
    
    const key = `${activeVideo.slideId}_${activeVideo.fileId}`;
    const duration = videoRef.current?.duration || 0;
    saveVideoProgress(activeVideo.fileId, activeVideo.slideId, 100, duration, true, duration);
    markContentViewed(activeVideo.slideId, activeVideo.fileId);
    
    setQuizFeedback({
      show: true,
      message: '✅ Video completed!',
      type: 'success'
    });
    setTimeout(() => setQuizFeedback(null), 2000);
    setActiveVideo(null);
  };

  const handleWatchVideo = (slideId: string, file: SlideFile) => {
    if (activeVideo?.fileId === file.id) {
      if (videoRef.current) videoRef.current.pause();
      setActiveVideo(null);
    } else {
      setActiveVideo({ slideId, fileId: file.id, file });
    }
  };

  const handleViewClick = async (slideId: string, fileId: string) => {
    await markContentViewed(slideId, fileId);
    
    setQuizFeedback({
      show: true,
      message: '✓ Content marked as viewed!',
      type: 'success'
    });
    setTimeout(() => setQuizFeedback(null), 2000);
  };

  const closeVideoPlayer = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setActiveVideo(null);
  };

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

  const fetchAndValidateEnrollment = async () => {
    if (!user?.email) return null;

    try {
      const response = await fetch(`/api/students/enrollments?email=${encodeURIComponent(user.email)}`);
      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        const enrollment = result.data.find((e: any) => {
          return e.course_id === courseId || e.course_title === courseId;
        });
        
        if (enrollment) {
          setEnrollmentId(enrollment.id);
          setEnrollment(enrollment);
          const actualCourseId = enrollment.course_id;
          return { enrollmentId: enrollment.id, courseId: actualCourseId };
        } else {
          setError('You are not enrolled in this course');
          return null;
        }
      } else {
        setError('No enrollments found');
        return null;
      }
    } catch (error) {
      console.error('Error fetching enrollment:', error);
      setError('Failed to verify enrollment');
      return null;
    }
  };

  const loadCourseData = async (showRefreshing = false) => {
    if (!user?.email) return;

    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const enrollmentInfo = await fetchAndValidateEnrollment();
      
      if (!enrollmentInfo) {
        setError('You are not enrolled in this course.');
        setLoading(false);
        return;
      }

      const { enrollmentId: eid, courseId: actualCourseId } = enrollmentInfo;

      const response = await fetch(
        `/api/students/courses/${actualCourseId}?studentEmail=${encodeURIComponent(user.email)}${eid ? `&enrollmentId=${eid}` : ''}`
      );
      
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load course');
      }

      if (result.success && result.data) {
        const data: CourseData = result.data;
        
        if (!data.slides || data.slides.length === 0) {
          setError('No lessons available for this course yet.');
          setLoading(false);
          return;
        }
        
        setCourse(data.course);
        setSlides(data.slides || []);
        
        const contentsMap = new Map();
        Object.entries(data.contents || {}).forEach(([slideId, files]) => {
          contentsMap.set(slideId, files);
        });
        setSlideContents(contentsMap);
        
        const quizzesMap = new Map();
        Object.entries(data.quizzes || {}).forEach(([key, quiz]) => {
          const quizData = quiz as any;
          const slideId = quizData.slideId || key;
          quizzesMap.set(slideId, quizData);
        });
        setQuizzes(quizzesMap);
        
        setAssignments(data.assignments || []);
        
        if (data.progress) {
          setCompletedSlides(new Set(data.progress.completedSlides || []));
          setCompletedContent(new Set(data.progress.completedContent || []));
        }
        
        // Track simple quiz attempts
        const attemptsMap = new Map();
        const advancedSet = new Set<string>();
        Object.entries(data.quizAttempts || {}).forEach(([quizId, attempt]) => {
          const attemptData = attempt as any;
          const slideId = attemptData.slideId;
          if (slideId) {
            attemptsMap.set(slideId, attemptData);
            advancedSet.add(slideId);
          }
        });
        setQuizAttempts(attemptsMap);
        setAdvancedQuizAttempts(advancedSet);
        
        const submissionsMap = new Map();
        Object.entries(data.assignmentSubmissions || {}).forEach(([assignmentId, sub]) => {
          submissionsMap.set(assignmentId, sub);
        });
        setAssignmentSubmissions(submissionsMap);
        
        const completed = new Set(data.progress?.completedSlides || []);
        const firstIncomplete = data.slides.find((s: Slide) => !completed.has(s.id));
        if (firstIncomplete) {
          setExpandedSlides(new Set([firstIncomplete.id]));
          setSelectedSlide(firstIncomplete);
        } else if (data.slides.length > 0) {
          setExpandedSlides(new Set([data.slides[0].id]));
          setSelectedSlide(data.slides[0]);
        }
      } else {
        throw new Error(result.error || 'Failed to load course data');
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
  }, [user, courseId]);

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
        const contentKey = `${slideId}_${fileId}`;
        if (completed) {
          setCompletedContent(prev => new Set([...prev, contentKey]));
        }
        
        if (result.data?.slideProgress?.status === 'completed') {
          setCompletedSlides(prev => new Set([...prev, slideId]));
        }
      }
    } catch (error) {
      console.error('Error tracking content view:', error);
    } finally {
      setTrackingContent(prev => ({ ...prev, [trackingKey]: false }));
    }
  };

  // ✅ Updated: Auto-complete slide based on content (video + quiz logic)
  const autoCompleteSlide = async (slideId: string) => {
    if (!user?.email || !enrollmentId) return;
    if (completedSlides.has(slideId)) return;

    // Check if slide can be completed
    const canComplete = canMarkSlideComplete(slideId);
    if (!canComplete) return;

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
      
      if (result.success && result.data?.slideCompleted) {
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

  const markContentViewed = async (slideId: string, fileId: string) => {
    if (!user) return;

    const contentKey = `${slideId}_${fileId}`;
    const isCurrentlyViewed = completedContent.has(contentKey);
    
    if (isCurrentlyViewed) {
      return;
    }
    
    setCompletedContent(prev => new Set([...prev, contentKey]));
    await trackContentView(slideId, fileId, true, 30);

    // Check if all content for this slide is viewed
    const slideFiles = slideContents.get(slideId) || [];
    const allContentViewed = slideFiles.length === 0 || slideFiles.every(f => 
      completedContent.has(`${slideId}_${f.id}`)
    );
    
    if (allContentViewed) {
      // Check if quiz is also completed
      const quizCompleted = isQuizCompleted(slideId);
      if (quizCompleted) {
        await autoCompleteSlide(slideId);
      }
    }
  };

  // ✅ Helper: Check if quiz is completed for a slide
const isQuizCompleted = (slideId: string): boolean => {
  const simpleQuiz = quizzes.get(slideId);
  
  // Agar quiz hai to attempt check karo
  if (simpleQuiz) {
    const attempt = quizAttempts.get(slideId);
    return attempt !== undefined && attempt !== null;
  }
  
  // Advanced quiz check
  return advancedQuizAttempts.has(slideId);
};

  // ✅ Helper: Check if video is completed for a slide
  const isVideoCompleted = (slideId: string): boolean => {
    const slideFiles = slideContents.get(slideId) || [];
    const videoFiles = slideFiles.filter(f => f.type.includes('video'));
    
    if (videoFiles.length === 0) return true;
    
    return videoFiles.every(f => 
      completedContent.has(`${slideId}_${f.id}`)
    );
  };

  // ✅ UPDATED: Check if slide can be marked complete (smart logic)
  const canMarkSlideComplete = (slideId: string): boolean => {
    const slideFiles = slideContents.get(slideId) || [];
    const hasVideo = slideFiles.some(f => f.type.includes('video'));
    const hasQuiz = quizzes.get(slideId) !== undefined;
    const hasAdvancedQuiz = advancedQuizAttempts.has(slideId);
    
    const videoCompleted = !hasVideo || isVideoCompleted(slideId);
    const quizCompleted = !hasQuiz || isQuizCompleted(slideId);
    const assignmentsCompleted = true; // Add assignment logic if needed
    
    return videoCompleted && quizCompleted && assignmentsCompleted;
  };

  // ✅ UPDATED: Mark slide as complete
  const markSlideComplete = async (slideId: string) => {
    if (!user || markingComplete[slideId]) return;
    
    const slideFiles = slideContents.get(slideId) || [];
    const hasVideo = slideFiles.some(f => f.type.includes('video'));
    const hasQuiz = quizzes.get(slideId) !== undefined;
    
    const videoCompleted = !hasVideo || isVideoCompleted(slideId);
    const quizCompleted = !hasQuiz || isQuizCompleted(slideId);
    
    if (!videoCompleted || !quizCompleted) {
      let message = 'Complete all requirements first:';
      if (hasVideo && !videoCompleted) message += '\n• Watch the video completely';
      if (hasQuiz && !quizCompleted) message += '\n• Attempt the quiz';
      setQuizFeedback({ show: true, message, type: 'error' });
      setTimeout(() => setQuizFeedback(null), 3000);
      return;
    }

    setMarkingComplete(prev => ({ ...prev, [slideId]: true }));

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

      if (result.success && result.data?.slideCompleted) {
        setCompletedSlides(prev => new Set([...prev, slideId]));
        setQuizFeedback({
          show: true,
          message: `✓ Lesson completed!`,
          type: 'success'
        });
        setTimeout(() => setQuizFeedback(null), 2000);
      } else {
        throw new Error(result.error || 'Failed to complete slide');
      }
    } catch (error: any) {
      console.error('Error marking slide complete:', error);
      setQuizFeedback({
        show: true,
        message: error.message || 'Failed to complete lesson',
        type: 'error'
      });
      setTimeout(() => setQuizFeedback(null), 3000);
    } finally {
      setMarkingComplete(prev => ({ ...prev, [slideId]: false }));
    }
  };

  // ✅ Updated: Handle simple quiz submission
const handleSimpleQuizSubmit = async (slideId: string, answers: QuizAnswer[], score: number, passed: boolean) => {
  if (!user || !enrollmentId) return;

  const quiz = quizzes.get(slideId);
  if (!quiz) return;

  // ✅ REAL QUIZ ID from course_quizzes table (not slideId)
  const realQuizId = quiz.quizId;

  console.log('📤 Simple Quiz Submit with REAL IDs:', {
    enrollmentId,
    studentEmail: user.email,
    courseId,
    slideId,
    quizId: realQuizId,        // ✅ Real UUID
    answersCount: answers.length,
    score,
    passed
  });

  try {
    const response = await fetch('/api/students/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enrollmentId,
        studentEmail: user.email,
        courseId,
        slideId,
        quizId: realQuizId,      // ✅ Real quiz_id from course_quizzes
        answers,
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
        quizId: realQuizId,      // ✅ Store real quiz_id
        slideId,
        courseId,
        answers,
        score,
        passed,
        attemptedAt: new Date().toISOString()
      };

      setQuizAttempts(new Map(quizAttempts.set(slideId, attempt)));

      setQuizFeedback({
        show: true,
        message: passed ? `🎉 Quiz passed! Score: ${score}%` : `Quiz submitted. Score: ${score}%`,
        type: passed ? 'success' : 'error'
      });
      setTimeout(() => setQuizFeedback(null), 4000);

      // Check if video is also completed
      const videoCompleted = isVideoCompleted(slideId);
      if (videoCompleted) {
        await autoCompleteSlide(slideId);
      }
      
      await loadCourseData();
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
};

  // ✅ Handle advanced quiz completion
const handleAdvancedQuizComplete = async (slideId: string, score: number, total: number, passed: boolean) => {
  console.log('Advanced Quiz completed for slide:', slideId, { score, total, passed });
  
  // ✅ Add to advancedQuizAttempts Set
  setAdvancedQuizAttempts(prev => new Set([...prev, slideId]));
  
  await loadCourseData();
};
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
      const uploadedFiles = [];
      
      for (const file of assignmentFiles) {
        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append('file', file);
        cloudinaryFormData.append('type', 'assignment_submission');

        const response = await fetch('/api/upload/cloudinary', {
          method: 'POST',
          body: cloudinaryFormData,
        });

        if (!response.ok) continue;

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
        
        setActiveAssignment(null);
        setAssignmentFiles([]);
        
        const videoCompleted = isVideoCompleted(slideId);
        const quizCompleted = isQuizCompleted(slideId);
        
        if (videoCompleted && quizCompleted) {
          await autoCompleteSlide(slideId);
        }
      }
    } catch (error: any) {
      console.error('Submission error:', error);
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

  const initializeQuiz = (slideId: string, quiz: Quiz) => {
    setActiveQuiz(slideId);
    
    const initialAnswers: QuizAnswer[] = quiz.questions.map((q, index) => {
      if (q.questionType === 'text' || !q.options || q.options.length === 0) {
        return { questionIndex: index, textAnswer: '' };
      } else {
        return { questionIndex: index, selectedOption: -1 };
      }
    });
    
    setQuizAnswers(initialAnswers);
  };

  const updateQuizAnswer = (questionIndex: number, question: QuizQuestion, value: any) => {
    const updatedAnswers = [...quizAnswers];
    
    if (question.questionType === 'text' || !question.options || question.options.length === 0) {
      updatedAnswers[questionIndex] = {
        questionIndex,
        textAnswer: value
      };
    } else {
      updatedAnswers[questionIndex] = {
        questionIndex,
        selectedOption: parseInt(value)
      };
    }
    
    setQuizAnswers(updatedAnswers);
  };

const handleQuizSubmit = async (slideId: string) => {
  const quiz = quizzes.get(slideId);
  if (!quiz || !user || !enrollmentId) return;

  // ✅ REAL QUIZ ID from course_quizzes table
  const realQuizId = quiz.quizId;

  let isValid = true;
  let errorMessage = '';

  quiz.questions.forEach((q, index) => {
    const answer = quizAnswers[index];
    
    if (q.questionType === 'text' || !q.options || q.options.length === 0) {
      if (!answer?.textAnswer?.trim()) {
        isValid = false;
        errorMessage = `Please answer question ${index + 1}`;
      }
    } else {
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

  // Check if already attempted using real quiz_id
  if (quizAttempts.has(slideId)) {
    setQuizFeedback({
      show: true,
      message: 'You have already attempted this quiz. No retakes allowed.',
      type: 'error'
    });
    setTimeout(() => setQuizFeedback(null), 3000);
    setActiveQuiz(null);
    setQuizAnswers([]);
    return;
  }

  // Calculate score
  let correctCount = 0;
  let mcqCount = 0;
  
  quiz.questions.forEach((q, index) => {
    const answer = quizAnswers[index];
    
    if (q.options && q.options.length > 0 && answer?.selectedOption !== undefined) {
      mcqCount++;
      if (answer.selectedOption === q.correctAnswer) {
        correctCount++;
      }
    }
  });
  
  const score = mcqCount > 0 ? Math.round((correctCount / mcqCount) * 100) : 0;
  const passed = score >= 70;

  console.log('📤 Submitting quiz with REAL IDs:', {
    enrollmentId,
    studentEmail: user.email,
    courseId,
    slideId,
    quizId: realQuizId,        // ✅ Real UUID, not slideId
    answersCount: quizAnswers.length,
    score,
    passed
  });

  try {
    const response = await fetch('/api/students/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enrollmentId,
        studentEmail: user.email,
        courseId,
        slideId,
        quizId: realQuizId,      // ✅ Real quiz_id from course_quizzes
        answers: quizAnswers,
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
        quizId: realQuizId,      // ✅ Store real quiz_id
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
        message: passed ? `🎉 Quiz passed! Score: ${score}%` : `Quiz submitted. Score: ${score}%`,
        type: passed ? 'success' : 'error'
      });
      setTimeout(() => setQuizFeedback(null), 4000);

      const videoCompleted = isVideoCompleted(slideId);
      if (videoCompleted) {
        await autoCompleteSlide(slideId);
      }
      
      // Refresh course data
      await loadCourseData();
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
};

  const getSlidePerformance = (): SlidePerformance[] => {
    return slides.map(slide => {
      const slideFiles = slideContents.get(slide.id) || [];
      const hasVideo = slideFiles.some(f => f.type.includes('video'));
      const simpleQuiz = quizzes.get(slide.id);
      const hasQuiz = simpleQuiz !== undefined;
      const simpleAttempt = hasQuiz ? quizAttempts.get(slide.id) : null;
      const advancedAttempted = advancedQuizAttempts.has(slide.id);
      const quizAttempted = (!hasQuiz && !advancedAttempted) || 
                            (hasQuiz && simpleAttempt !== null) || 
                            (advancedAttempted);
      const videoCompleted = !hasVideo || isVideoCompleted(slide.id);
      const slideAssignments = assignments.filter(a => a.slideId === slide.id);
      
      return {
        slideId: slide.id,
        title: slide.title,
        slideNumber: slide.slideNumber,
        completed: completedSlides.has(slide.id),
        hasQuiz: hasQuiz,
        quizAttempted: quizAttempted,
        quizScore: simpleAttempt?.score,
        quizPassed: simpleAttempt?.passed,
        hasVideo: hasVideo,
        videoCompleted: videoCompleted,
        hasAssignment: slideAssignments.length > 0,
        assignmentSubmitted: slideAssignments.some(a => assignmentSubmissions.has(a.id))
      };
    });
  };

  // Updated: Only completion rate
  const getOverallPerformance = () => {
    const performance = getSlidePerformance();
    const totalSlides = performance.length;
    const completedSlidesCount = performance.filter(p => p.completed).length;
    
    const completionRate = totalSlides > 0 ? Math.round((completedSlidesCount / totalSlides) * 100) : 0;
    
    let performanceLevel = 'Needs Improvement';
    let performanceColor = BRAND_COLORS.deepRed;
    let performanceIcon = HiTrendingDown;
    
    if (completionRate >= 80) {
      performanceLevel = 'Excellent';
      performanceColor = '#10B981';
      performanceIcon = HiTrendingUp;
    } else if (completionRate >= 60) {
      performanceLevel = 'Good';
      performanceColor = BRAND_COLORS.teal;
      performanceIcon = HiTrendingUp;
    } else if (completionRate >= 40) {
      performanceLevel = 'Average';
      performanceColor = BRAND_COLORS.darkRoyalBlue;
      performanceIcon = HiChartBar;
    }
    
    return {
      completionRate,
      performanceLevel,
      performanceColor,
      performanceIcon,
      completedSlides: completedSlidesCount,
      totalSlides
    };
  };

  const progress = slides.length > 0 
    ? Math.round((completedSlides.size / slides.length) * 100) 
    : 0;

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

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const isSlideAccessible = (slideIndex: number): boolean => {
    if (slideIndex === 0) return true;
    for (let i = 0; i < slideIndex; i++) {
      if (!completedSlides.has(slides[i].id)) {
        return false;
      }
    }
    return true;
  };

  const getSlideStatus = (slide: Slide) => {
    const slideIndex = slides.findIndex(s => s.id === slide.id);
    const accessible = isSlideAccessible(slideIndex);
    const isCompleted = completedSlides.has(slide.id);
    
    if (!accessible) {
      return { status: 'locked', icon: HiLockClosed, color: '#9CA3AF', bgColor: '#F3F4F6' };
    } else if (isCompleted) {
      return { status: 'completed', icon: HiCheckCircle, color: '#10B981', bgColor: '#D1FAE5' };
    } else {
      return { status: 'available', icon: HiLockOpen, color: BRAND_COLORS.deepRed, bgColor: '#FEE2E2' };
    }
  };

  // Get video progress text
  const getVideoProgressText = (slideId: string, fileId: string): string => {
    const key = `${slideId}_${fileId}`;
    const progress = videoProgress[key];
    if (!progress) return 'Not started';
    
    const watched = Math.floor(progress.lastPosition);
    const remaining = Math.floor(progress.duration - progress.lastPosition);
    
    if (progress.completed) return '✅ Completed';
    if (watched > 0) {
      return `📺 Watched: ${Math.floor(watched / 60)}:${(watched % 60).toString().padStart(2, '0')} • Remaining: ${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, '0')}`;
    }
    return 'Not started';
  };

  // Render slide grid view
  const renderSlideGrid = () => {
    if (slides.length === 0) {
      return (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-gray-500">No lessons available yet.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {slides.map((slide, index) => {
          const status = getSlideStatus(slide);
          const StatusIcon = status.icon;
          const isSelected = selectedSlide?.id === slide.id;
          const slideFiles = slideContents.get(slide.id) || [];
          const hasVideo = slideFiles.some(f => f.type.includes('video'));
          const simpleQuiz = quizzes.get(slide.id);
          const hasValidQuiz = simpleQuiz && simpleQuiz.questions && simpleQuiz.questions.length > 0;
          const attempt = hasValidQuiz ? quizAttempts.get(slide.id) : null;
          const advancedAttempted = advancedQuizAttempts.has(slide.id);
          const hasAssignment = assignments.some(a => a.slideId === slide.id);
          const completedFilesCount = slideFiles.filter(f => completedContent.has(`${slide.id}_${f.id}`)).length;
          const videoCompleted = hasVideo ? isVideoCompleted(slide.id) : true;
          const quizCompleted = (!hasValidQuiz && !advancedAttempted) || 
                                (hasValidQuiz && attempt !== null) || 
                                (advancedAttempted);
          const slideComplete = videoCompleted && quizCompleted;
          
          return (
            <div
              key={slide.id}
              onClick={() => setSelectedSlide(slide)}
              className={`bg-white rounded-xl border-2 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected ? 'border-red-600 ring-2 ring-red-200' : 'border-gray-200 hover:border-red-300'
              }`}
            >
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

              <div className="p-4">
                {/* Requirements summary */}
                <div className="mb-3 text-xs space-y-1">
                  {hasVideo && (
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${videoCompleted ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                      <span className={videoCompleted ? 'text-green-600' : 'text-gray-500'}>
                        {videoCompleted ? '✓ Video watched' : 'Video pending'}
                      </span>
                    </div>
                  )}
                  {(hasValidQuiz || advancedAttempted) && (
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${quizCompleted ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                      <span className={quizCompleted ? 'text-green-600' : 'text-gray-500'}>
                        {quizCompleted ? '✓ Quiz completed' : 'Quiz pending'}
                      </span>
                    </div>
                  )}
                 {slideComplete && !(status as any).completed && (
                    <div className="text-green-600 text-xs mt-1">✓ Ready to complete!</div>
                  )}
                </div>

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

                {hasValidQuiz && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Quiz ({simpleQuiz.questions.length} Qs)</span>
                      {attempt && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          attempt.passed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>Score: {attempt.score}%</span>
                      )}
                    </div>
                  </div>
                )}

                {advancedAttempted && (
                  <div className="mb-3">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Advanced Quiz Completed</span>
                  </div>
                )}

                {slideFiles.length > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium">{completedFilesCount}/{slideFiles.length}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-300" style={{ 
                        width: `${(completedFilesCount / slideFiles.length) * 100}%`,
                        backgroundColor: BRAND_COLORS.deepRed
                      }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render slide list view
  const renderSlideList = () => {
    if (slides.length === 0) {
      return (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-gray-500">No lessons available yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {slides.map((slide) => {
          const isCompleted = completedSlides.has(slide.id);
          const isExpanded = expandedSlides.has(slide.id);
          const slideFiles = slideContents.get(slide.id) || [];
          const hasVideo = slideFiles.some(f => f.type.includes('video'));
          const simpleQuiz = quizzes.get(slide.id);
          const hasValidSimpleQuiz = simpleQuiz && simpleQuiz.questions && simpleQuiz.questions.length > 0;
          const simpleAttempt = hasValidSimpleQuiz ? quizAttempts.get(slide.id) : null;
          const advancedAttempted = advancedQuizAttempts.has(slide.id);
          const slideAssignments = assignments.filter(a => a.slideId === slide.id);
          const hasAssignment = slideAssignments.length > 0;
          const canComplete = canMarkSlideComplete(slide.id);
          const completedFilesCount = slideFiles.filter(f => completedContent.has(`${slide.id}_${f.id}`)).length;
          const isMarking = markingComplete[slide.id];
          const videoCompleted = hasVideo ? isVideoCompleted(slide.id) : true;
          const quizCompleted = (!hasValidSimpleQuiz && !advancedAttempted) || 
                                (hasValidSimpleQuiz && simpleAttempt !== null) || 
                                (advancedAttempted);

          return (
            <div key={slide.id} className={`border rounded-lg overflow-hidden ${isCompleted ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
              {/* Slide Header */}
              <div 
                className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleSlideExpansion(slide.id)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div>{isCompleted ? <HiCheckCircle className="w-6 h-6 text-green-600" /> : <IoMdRadioButtonOff className="w-6 h-6 text-gray-400" />}</div>
                  <div className="flex-1 text-left">
                    <h3 className={`font-medium ${isCompleted ? 'text-gray-700' : 'text-gray-900'}`}>
                      Lesson {slide.slideNumber}: {slide.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span>{slideFiles.length} file(s)</span>
                      {slideFiles.length > 0 && <span className="text-blue-600">{completedFilesCount}/{slideFiles.length} viewed</span>}
                      {hasValidSimpleQuiz && <span>• Quiz ({simpleQuiz.questions.length} questions)</span>}
                      {advancedAttempted && <span>• Advanced Quiz Done</span>}
                      {hasAssignment && <span>• {slideAssignments.length} assignment(s)</span>}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {(hasValidSimpleQuiz && simpleAttempt) && (
                    <span className={`text-xs px-2 py-1 rounded-full ${simpleAttempt.passed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      Quiz: {simpleAttempt.score}%
                    </span>
                  )}
                  {advancedAttempted && (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                      Advanced Quiz Done
                    </span>
                  )}
                  <button className="p-1 hover:bg-gray-200 rounded-full">
                    {isExpanded ? <HiChevronUp className="w-5 h-5" /> : <HiChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 space-y-4">
                  {/* Files Section with enhanced video player */}
                  {slideFiles.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Lesson Materials</h4>
                      <div className="space-y-2">
                        {slideFiles.map((file) => {
                          const isContentViewed = completedContent.has(`${slide.id}_${file.id}`);
                          const isVideo = file.type.includes('video');
                          const key = `${slide.id}_${file.id}`;
                          const showView = showViewButton[key] || isContentViewed;
                          const videoProgressData = videoProgress[key];
                          const progressPercent = videoProgressData?.progress || 0;
                          const isVideoPlaying = activeVideo?.fileId === file.id;
                          const videoProgressText = getVideoProgressText(slide.id, file.id);
                          
                          return (
                            <div key={file.id} className="flex flex-col space-y-2">
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3 flex-1">
                                  {getFileIcon(file.type)}
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-700">{file.name}</p>
                                    <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>
                                    {isVideo && (
                                      <p className="text-xs text-blue-600 mt-1">{videoProgressText}</p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {isVideo ? (
                                    <>
                                      {!showView ? (
                                        <button
                                          onClick={() => handleWatchVideo(slide.id, file)}
                                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all cursor-pointer flex items-center gap-2"
                                        >
                                          <HiPlay className="w-4 h-4" />
                                          {isVideoPlaying ? 'Close Video' : 'Watch Video'}
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => handleViewClick(slide.id, file.id)}
                                          disabled={trackingContent[key] || isContentViewed}
                                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ${
                                            isContentViewed 
                                              ? 'bg-green-100 text-green-700 cursor-default'
                                              : 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                                          } disabled:opacity-50`}
                                        >
                                          {trackingContent[key] ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                          ) : isContentViewed ? (
                                            <>
                                              <HiCheckCircle className="w-4 h-4" />
                                              Viewed
                                            </>
                                          ) : (
                                            <>
                                              <HiEye className="w-4 h-4" />
                                              View
                                            </>
                                          )}
                                        </button>
                                      )}
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => handleViewClick(slide.id, file.id)}
                                      disabled={trackingContent[key] || isContentViewed}
                                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ${
                                        isContentViewed 
                                          ? 'bg-green-100 text-green-700 cursor-default'
                                          : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                                      } disabled:opacity-50`}
                                    >
                                      {trackingContent[key] ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : isContentViewed ? (
                                        <>
                                          <HiCheckCircle className="w-4 h-4" />
                                          Viewed
                                        </>
                                      ) : (
                                        <>
                                          <HiEye className="w-4 h-4" />
                                          View
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                              
                              {/* Enhanced Inline Video Player with progress display and backward button */}
                              {isVideo && isVideoPlaying && (
                                <div className="mt-2 p-3 bg-black rounded-lg">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-white text-sm">Now Playing: {file.name}</span>
                                    <button 
                                      onClick={closeVideoPlayer}
                                      className="text-white hover:text-gray-300 cursor-pointer"
                                    >
                                      <HiX className="w-5 h-5" />
                                    </button>
                                  </div>
                                  
                                  {/* Video Progress Display */}
                                  {videoProgressData && (
                                    <div className="mb-2 text-center">
                                      <p className="text-white text-xs">
                                        {videoProgressData.completed 
                                          ? '✅ Video completed!' 
                                          : `📺 Progress: ${Math.round(videoProgressData.progress)}%`}
                                      </p>
                                      <p className="text-gray-400 text-xs mt-1">
                                        {videoProgressData.lastPosition > 0 && !videoProgressData.completed && (
                                          <>
                                            Watched: {Math.floor(videoProgressData.lastPosition / 60)}:{(Math.floor(videoProgressData.lastPosition) % 60).toString().padStart(2, '0')} / 
                                            Total: {Math.floor(videoProgressData.duration / 60)}:{(Math.floor(videoProgressData.duration) % 60).toString().padStart(2, '0')}
                                          </>
                                        )}
                                      </p>
                                    </div>
                                  )}
                                  
                                  <video
                                    ref={videoRef}
                                    src={file.url}
                                    controls
                                    controlsList="nodownload noplaybackrate nofullscreen"
                                    disablePictureInPicture
                                    onTimeUpdate={handleVideoTimeUpdate}
                                    onLoadedMetadata={handleVideoLoadedMetadata}
                                    onSeeking={handleVideoSeeking}
                                    onEnded={handleVideoEnded}
                                    className="w-full rounded-lg"
                                    style={{ maxHeight: '400px' }}
                                  >
                                    Your browser does not support the video tag.
                                  </video>
                                  
                                  {/* Backward Button and Info */}
                                  <div className="mt-3 flex items-center justify-between">
                                    <button
                                      onClick={handleBackward}
                                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-all cursor-pointer flex items-center gap-2"
                                    >
                                      <HiRewind className="w-4 h-4" />
                                      Backward 10 sec
                                    </button>
                                    <div className="text-center text-xs text-gray-400">
                                      <p>⚠️ You cannot skip forward. Only backward seeking is allowed.</p>
                                      <p>Watch sequentially to complete the video.</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ✅ Simple Quiz Component - Only if has questions */}
                  {hasValidSimpleQuiz && (
                    <SimpleQuiz
                      quiz={simpleQuiz}
                      slideId={slide.id}
                      courseId={courseId}
                      enrollmentId={enrollmentId}
                      studentEmail={user?.email || ''}
                      attempt={simpleAttempt}
                      onQuizSubmit={handleSimpleQuizSubmit}
                      onCancel={() => setActiveQuiz(null)}
                      formatDate={formatDate}
                    />
                  )}

                  {/* ✅ Advanced Quiz Component - Always show */}
                  <div className="mt-4">
                    <StudentAdvancedQuiz
                      slideId={slide.id}
                      courseId={courseId}
                      enrollmentId={enrollmentId}
                      studentEmail={user?.email || ''}
                      onQuizComplete={handleAdvancedQuizComplete}
                    />
                  </div>

                  {/* Assignments Section */}
                  {hasAssignment && (
                    <div className={(slideFiles.length > 0 || hasValidSimpleQuiz) ? 'border-t pt-4' : ''}>
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
                                  <a href={assignment.file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline cursor-pointer">
                                    <HiPaperClip className="w-4 h-4" />
                                    {assignment.file.name}
                                    <HiEye className="w-4 h-4 ml-1" />
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
                                    <p className="text-xs text-gray-500">{formatDate(submission.submittedAt)}</p>
                                  </div>
                                </div>
                              </div>
                            ) : activeAssignment === assignment.id ? (
                              <div className="border border-gray-200 rounded-lg p-4">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                  <input type="file" multiple onChange={(e) => setAssignmentFiles(Array.from(e.target.files || []))} className="hidden" id={`assignment-${assignment.id}`} />
                                  <label htmlFor={`assignment-${assignment.id}`} className="cursor-pointer block text-center">
                                    <HiDocumentText className="w-8 h-8 mx-auto text-gray-400" />
                                    <p className="text-sm text-gray-600 mt-2">Click to upload files</p>
                                    {assignmentFiles.map((file, idx) => <p key={idx} className="text-xs text-green-600 mt-1">{file.name}</p>)}
                                  </label>
                                </div>
                                <div className="flex gap-2 mt-4">
                                  <button onClick={() => handleAssignmentSubmit(assignment.id, slide.id)} disabled={uploadingAssignment || assignmentFiles.length === 0} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 cursor-pointer">
                                    {uploadingAssignment ? 'Uploading...' : 'Submit'}
                                  </button>
                                  <button onClick={() => { setActiveAssignment(null); setAssignmentFiles([]); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer">Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <button onClick={() => setActiveAssignment(assignment.id)} className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer">Start Assignment</button>
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
                      disabled={isMarking}
                      className="mt-3 w-full py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isMarking ? (
                        <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      ) : (
                        <HiCheckCircle className="w-4 h-4 inline mr-2" />
                      )}
                      {isMarking ? 'Completing...' : 'Mark Lesson as Complete'}
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
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-bold mb-2 text-gray-900">Error Loading Course</h2>
          <p className="text-gray-600 mb-6">{error || 'Course not found'}</p>
          <div className="space-y-3">
            <Link
              href="/lms/Student_Portal/my-courses"
              className="inline-block w-full px-6 py-3 rounded-lg text-white text-center cursor-pointer"
              style={{ backgroundColor: BRAND_COLORS.deepRed }}
            >
              Back to My Courses
            </Link>
            <button
              onClick={() => loadCourseData()}
              className="inline-block w-full px-6 py-3 rounded-lg border border-gray-300 text-gray-700 text-center hover:bg-gray-50 cursor-pointer"
            >
              Try Again
            </button>
          </div>
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
        <Link href="/lms/Student_Portal/my-courses" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
          <HiArrowLeft className="w-5 h-5 mr-2" />
          Back to Courses
        </Link>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button onClick={() => handleViewModeChange('grid')} className={`p-2 rounded-lg transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'}`} title="Grid View">
              <HiViewGrid className="w-5 h-5" />
            </button>
            <button onClick={() => handleViewModeChange('list')} className={`p-2 rounded-lg transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'}`} title="List View">
              <HiViewList className="w-5 h-5" />
            </button>
          </div>
          
          <button onClick={() => loadCourseData(true)} disabled={refreshing} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer" title="Refresh">
            <HiRefresh className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Course Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>
        <p className="text-gray-600 mb-4">{course.description}</p>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <span className="flex items-center"><HiClock className="w-4 h-4 mr-1" />{course.duration || 'Self-paced'}</span>
          <span className="flex items-center"><HiDocumentText className="w-4 h-4 mr-1" />{totalCount} {totalCount === 1 ? 'lesson' : 'lessons'}</span>
          {course.level && <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{course.level}</span>}
          {course.instructorName && <span className="flex items-center">Instructor: {course.instructorName}</span>}
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress ({completedSlides.size}/{totalCount} lessons)</span>
            <span className="text-sm font-semibold" style={{ color: BRAND_COLORS.deepRed }}>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: BRAND_COLORS.deepRed }} />
          </div>
        </div>

        {/* ✅ Performance Summary - Only Completion */}
        <div className="mt-4 bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PerformanceIcon className="w-5 h-5" style={{ color: overallPerformance.performanceColor }} />
              <span className="text-sm font-medium text-gray-700">Course Progress</span>
            </div>
            <span className="text-sm font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: `${overallPerformance.performanceColor}20`, color: overallPerformance.performanceColor }}>
              {overallPerformance.completionRate}% Complete
            </span>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Lessons Completed</span>
              <span className="font-semibold">{overallPerformance.completedSlides}/{overallPerformance.totalSlides}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Toggle */}
      <button onClick={() => setShowPerformance(!showPerformance)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer">
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
                <th className="text-left py-2 text-xs font-medium text-gray-500">Video</th>
                <th className="text-left py-2 text-xs font-medium text-gray-500">Quiz</th>
                <th className="text-left py-2 text-xs font-medium text-gray-500">Assignment</th>
              </tr>
            </thead>
            <tbody>
              {getSlidePerformance().map((perf) => (
                <tr key={perf.slideId} className="border-b border-gray-100">
                  <td className="py-3"><p className="text-sm font-medium text-gray-900">Lesson {perf.slideNumber}: {perf.title}</p></td>
                  <td className="py-3">{perf.completed ? <span className="flex items-center gap-1 text-xs text-green-600"><HiCheckCircle className="w-4 h-4" />Completed</span> : <span className="text-xs text-gray-400">In Progress</span>}</td>
                  <td className="py-3">
                    {perf.hasVideo ? (
                      perf.videoCompleted ? (
                        <span className="text-xs text-green-600">✓ Watched</span>
                      ) : (
                        <span className="text-xs text-yellow-600">Pending</span>
                      )
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
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

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Course Lessons</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{slides.length} lessons available</span>
          </div>
        </div>
        
        {viewMode === 'grid' ? renderSlideGrid() : renderSlideList()}
      </div>
    </div>
  );
}