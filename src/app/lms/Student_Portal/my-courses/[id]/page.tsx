// app/lms/Student_Portal/my-courses/[id]/page.tsx (UPDATED with assignment files)
'use client';

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
  HiRefresh,
  HiChartBar,
  HiTrendingUp,
  HiTrendingDown,
  HiStar,
  HiDocumentReport,
  HiPaperClip
} from 'react-icons/hi';
import { IoMdRadioButtonOff } from 'react-icons/io';
/* eslint-disable */

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

// Types
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

interface QuizAttempt {
  quizId: string;
  slideId: string;
  courseId: string;
  answers: number[];
  score: number;
  passed: boolean;
  attemptedAt: string;
  studentId?: string;
  studentEmail?: string;
  studentName?: string;
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
  courseId?: string;
  studentId: string;
  studentEmail: string;
  studentName: string;
  files: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    publicId: string;
    uploadedAt: string;
  }[];
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
  instructorImage?: string;
  price?: string;
  level?: string;
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
  hasAssignment?: boolean;
  assignmentSubmitted?: boolean;
  assignmentScore?: number;
  completedAt?: string;
}

// ========== DEMO DATA FOR HARDCODED COURSES (only for demo user) ==========
const DEMO_SLIDES: Record<string, Slide[]> = {
  'pipe-fitter': [
    { id: 'pf-1', courseId: 'pipe-fitter', slideNumber: 1, title: 'Introduction to Pipe Fitting', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'pf-2', courseId: 'pipe-fitter', slideNumber: 2, title: 'Pipe Materials and Specifications', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'pf-3', courseId: 'pipe-fitter', slideNumber: 3, title: 'Cutting and Threading Techniques', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'pf-4', courseId: 'pipe-fitter', slideNumber: 4, title: 'Installation and Assembly', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'pf-5', courseId: 'pipe-fitter', slideNumber: 5, title: 'Safety and Quality Standards', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ],
  'safety-inspector': [
    { id: 'si-1', courseId: 'safety-inspector', slideNumber: 1, title: 'Role of a Safety Inspector', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'si-2', courseId: 'safety-inspector', slideNumber: 2, title: 'OSHA Standards and Regulations', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'si-3', courseId: 'safety-inspector', slideNumber: 3, title: 'Hazard Identification and Risk Assessment', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'si-4', courseId: 'safety-inspector', slideNumber: 4, title: 'Inspection Procedures and Reporting', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'si-5', courseId: 'safety-inspector', slideNumber: 5, title: 'Emergency Preparedness', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ],
  'welding': [
    { id: 'w-1', courseId: 'welding', slideNumber: 1, title: 'Welding Basics and Safety', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'w-2', courseId: 'welding', slideNumber: 2, title: 'MIG Welding Techniques', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'w-3', courseId: 'welding', slideNumber: 3, title: 'TIG Welding Fundamentals', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'w-4', courseId: 'welding', slideNumber: 4, title: 'Arc Welding and Equipment', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'w-5', courseId: 'welding', slideNumber: 5, title: 'Welding Inspection and Quality Control', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ]
};

const DEMO_SLIDE_CONTENTS: Record<string, SlideContent[]> = {
  'pipe-fitter': [
    {
      slideId: 'pf-1',
      courseId: 'pipe-fitter',
      files: [
        { id: 'pf-1-file1', name: 'Pipe Fitting Overview.pdf', type: 'application/pdf', size: 245760, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', publicId: 'dummy', uploadedAt: new Date().toISOString() },
        { id: 'pf-1-file2', name: 'Introduction Video.mp4', type: 'video/mp4', size: 5242880, url: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4', publicId: 'dummy', uploadedAt: new Date().toISOString() }
      ]
    },
    {
      slideId: 'pf-2',
      courseId: 'pipe-fitter',
      files: [
        { id: 'pf-2-file1', name: 'Pipe Materials Chart.pdf', type: 'application/pdf', size: 102400, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', publicId: 'dummy', uploadedAt: new Date().toISOString() },
        { id: 'pf-2-file2', name: 'Specifications Guide.pdf', type: 'application/pdf', size: 204800, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', publicId: 'dummy', uploadedAt: new Date().toISOString() }
      ]
    },
    {
      slideId: 'pf-3',
      courseId: 'pipe-fitter',
      files: [
        { id: 'pf-3-file1', name: 'Cutting Techniques.pdf', type: 'application/pdf', size: 307200, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', publicId: 'dummy', uploadedAt: new Date().toISOString() },
        { id: 'pf-3-file2', name: 'Threading Demo.mp4', type: 'video/mp4', size: 6291456, url: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4', publicId: 'dummy', uploadedAt: new Date().toISOString() }
      ]
    },
    {
      slideId: 'pf-4',
      courseId: 'pipe-fitter',
      files: [
        { id: 'pf-4-file1', name: 'Assembly Guide.pdf', type: 'application/pdf', size: 409600, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', publicId: 'dummy', uploadedAt: new Date().toISOString() }
      ]
    },
    {
      slideId: 'pf-5',
      courseId: 'pipe-fitter',
      files: [
        { id: 'pf-5-file1', name: 'Safety Checklist.pdf', type: 'application/pdf', size: 153600, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', publicId: 'dummy', uploadedAt: new Date().toISOString() }
      ]
    }
  ],
  'safety-inspector': [
    {
      slideId: 'si-1',
      courseId: 'safety-inspector',
      files: [
        { id: 'si-1-file1', name: 'Role Description.pdf', type: 'application/pdf', size: 204800, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', publicId: 'dummy', uploadedAt: new Date().toISOString() }
      ]
    },
    {
      slideId: 'si-2',
      courseId: 'safety-inspector',
      files: [
        { id: 'si-2-file1', name: 'OSHA Quick Reference.pdf', type: 'application/pdf', size: 307200, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', publicId: 'dummy', uploadedAt: new Date().toISOString() },
        { id: 'si-2-file2', name: 'Regulations Video.mp4', type: 'video/mp4', size: 5242880, url: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4', publicId: 'dummy', uploadedAt: new Date().toISOString() }
      ]
    },
    {
      slideId: 'si-3',
      courseId: 'safety-inspector',
      files: [
        { id: 'si-3-file1', name: 'Hazard ID Worksheet.pdf', type: 'application/pdf', size: 409600, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', publicId: 'dummy', uploadedAt: new Date().toISOString() }
      ]
    },
    {
      slideId: 'si-4',
      courseId: 'safety-inspector',
      files: [
        { id: 'si-4-file1', name: 'Inspection Form.pdf', type: 'application/pdf', size: 256000, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', publicId: 'dummy', uploadedAt: new Date().toISOString() }
      ]
    },
    {
      slideId: 'si-5',
      courseId: 'safety-inspector',
      files: [
        { id: 'si-5-file1', name: 'Emergency Plan.pdf', type: 'application/pdf', size: 204800, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', publicId: 'dummy', uploadedAt: new Date().toISOString() }
      ]
    }
  ],
  'welding': [
    {
      slideId: 'w-1',
      courseId: 'welding',
      files: [
        { id: 'w-1-file1', name: 'Welding Safety Manual.pdf', type: 'application/pdf', size: 307200, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', publicId: 'dummy', uploadedAt: new Date().toISOString() },
        { id: 'w-1-file2', name: 'Safety Video.mp4', type: 'video/mp4', size: 6291456, url: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4', publicId: 'dummy', uploadedAt: new Date().toISOString() }
      ]
    },
    {
      slideId: 'w-2',
      courseId: 'welding',
      files: [
        { id: 'w-2-file1', name: 'MIG Guide.pdf', type: 'application/pdf', size: 409600, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', publicId: 'dummy', uploadedAt: new Date().toISOString() },
        { id: 'w-2-file2', name: 'MIG Demo.mp4', type: 'video/mp4', size: 7340032, url: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4', publicId: 'dummy', uploadedAt: new Date().toISOString() }
      ]
    },
    {
      slideId: 'w-3',
      courseId: 'welding',
      files: [
        { id: 'w-3-file1', name: 'TIG Techniques.pdf', type: 'application/pdf', size: 512000, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', publicId: 'dummy', uploadedAt: new Date().toISOString() }
      ]
    },
    {
      slideId: 'w-4',
      courseId: 'welding',
      files: [
        { id: 'w-4-file1', name: 'Arc Welding.pdf', type: 'application/pdf', size: 409600, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', publicId: 'dummy', uploadedAt: new Date().toISOString() },
        { id: 'w-4-file2', name: 'Equipment Setup.mp4', type: 'video/mp4', size: 8388608, url: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4', publicId: 'dummy', uploadedAt: new Date().toISOString() }
      ]
    },
    {
      slideId: 'w-5',
      courseId: 'welding',
      files: [
        { id: 'w-5-file1', name: 'Inspection Checklist.pdf', type: 'application/pdf', size: 256000, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', publicId: 'dummy', uploadedAt: new Date().toISOString() }
      ]
    }
  ]
};

const DEMO_QUIZZES: Record<string, Quiz[]> = {
  'pipe-fitter': [
    {
      slideId: 'pf-2',
      courseId: 'pipe-fitter',
      questions: [
        { id: 'pf-q1', question: 'What is the most common material for residential plumbing?', options: ['Copper', 'PVC', 'Steel', 'Cast Iron'], correctAnswer: 1 },
        { id: 'pf-q2', question: 'Which standard specifies pipe fitting dimensions?', options: ['ISO 9001', 'ASME B16.9', 'ASTM A53', 'ANSI B16.5'], correctAnswer: 1 }
      ]
    },
    {
      slideId: 'pf-4',
      courseId: 'pipe-fitter',
      questions: [
        { id: 'pf-q3', question: 'When joining pipes, what should be applied to threads?', options: ['Glue', 'Teflon tape', 'Grease', 'Paint'], correctAnswer: 1 }
      ]
    }
  ],
  'safety-inspector': [
    {
      slideId: 'si-2',
      courseId: 'safety-inspector',
      questions: [
        { id: 'si-q1', question: 'OSHA stands for?', options: ['Occupational Safety and Health Administration', 'Organization for Safety and Health Affairs', 'Office of Safety and Hazard Assessment', 'None'], correctAnswer: 0 },
        { id: 'si-q2', question: 'What is the general duty clause?', options: ['Employers must provide a workplace free from recognized hazards', 'Employees must wear PPE', 'Inspections must be announced', 'All accidents must be reported'], correctAnswer: 0 }
      ]
    }
  ],
  'welding': [
    {
      slideId: 'w-2',
      courseId: 'welding',
      questions: [
        { id: 'w-q1', question: 'MIG stands for?', options: ['Metal Inert Gas', 'Manual Inert Gas', 'Metallic Induction Gun', 'Multiple Ignition Generator'], correctAnswer: 0 },
        { id: 'w-q2', question: 'What shielding gas is commonly used in MIG welding?', options: ['Oxygen', 'Argon/CO2 mix', 'Helium', 'Nitrogen'], correctAnswer: 1 }
      ]
    },
    {
      slideId: 'w-3',
      courseId: 'welding',
      questions: [
        { id: 'w-q3', question: 'TIG welding uses which type of electrode?', options: ['Consumable', 'Non-consumable', 'Flux-cored', 'Stick'], correctAnswer: 1 }
      ]
    }
  ]
};

const DEMO_ASSIGNMENTS: Record<string, Assignment[]> = {
  'pipe-fitter': [
    {
      id: 'pf-assign-1',
      slideId: 'pf-3',
      courseId: 'pipe-fitter',
      title: 'Pipe Cutting and Threading Exercise',
      description: 'Submit a video or photos of you cutting and threading a pipe following the techniques shown.',
      dueDate: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
      totalMarks: 100,
      passingMarks: 70,
      file: {
        name: 'Pipe Cutting Instructions.pdf',
        type: 'application/pdf',
        size: 512000,
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        publicId: 'dummy',
        uploadedAt: new Date().toISOString()
      },
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  'safety-inspector': [
    {
      id: 'si-assign-1',
      slideId: 'si-4',
      courseId: 'safety-inspector',
      title: 'Workplace Inspection Report',
      description: 'Conduct a mock inspection of a workspace and submit a report using the provided form.',
      dueDate: new Date(Date.now() + 5*24*60*60*1000).toISOString(),
      totalMarks: 100,
      passingMarks: 75,
      file: {
        name: 'Inspection Form Template.docx',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 256000,
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        publicId: 'dummy',
        uploadedAt: new Date().toISOString()
      },
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  'welding': [
    {
      id: 'w-assign-1',
      slideId: 'w-4',
      courseId: 'welding',
      title: 'Arc Welding Practice',
      description: 'Submit a video of you performing an arc weld, along with a photo of the finished bead.',
      dueDate: new Date(Date.now() + 10*24*60*60*1000).toISOString(),
      totalMarks: 100,
      passingMarks: 70,
      file: {
        name: 'Welding Techniques Reference.pdf',
        type: 'application/pdf',
        size: 1024000,
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        publicId: 'dummy',
        uploadedAt: new Date().toISOString()
      },
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
};

export default function StudentCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [slideContents, setSlideContents] = useState<Map<string, SlideContent>>(new Map());
  const [quizzes, setQuizzes] = useState<Map<string, Quiz>>(new Map());
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<Map<string, AssignmentSubmission>>(new Map());
  const [completedSlides, setCompletedSlides] = useState<Set<string>>(new Set());
  const [completedContent, setCompletedContent] = useState<Set<string>>(new Set());
  const [quizAttempts, setQuizAttempts] = useState<Map<string, QuizAttempt>>(new Map());
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [expandedSlides, setExpandedSlides] = useState<Set<string>>(new Set());
  const [quizFeedback, setQuizFeedback] = useState<{show: boolean; message: string; type: 'success' | 'error'} | null>(null);
  const [showPerformance, setShowPerformance] = useState(false);
  
  // Assignment submission states
  const [activeAssignment, setActiveAssignment] = useState<string | null>(null);
  const [assignmentFiles, setAssignmentFiles] = useState<File[]>([]);
  const [uploadingAssignment, setUploadingAssignment] = useState(false);
  const [assignmentFeedback, setAssignmentFeedback] = useState<{show: boolean; message: string; type: 'success' | 'error'} | null>(null);

  // ========== 📋 LOAD ALL COURSES (HARDCODED + LOCALSTORAGE) ==========
  const loadAllCourses = () => {
    try {
      // Hardcoded courses from instructor file
      const hardcodedCourses = [
        {
          id: 'pipe-fitter',
          title: 'Pipe Fitter',
          description: 'Master industrial pipe fitting techniques with hands-on training on cutting, threading, and installation following international standards.',
          category: 'Technical Training',
          duration: '8 Weeks',
          instructorName: 'System Instructor',
          level: 'Beginner to Advanced',
          image: "https://images.pexels.com/photos/6124242/pexels-photo-6124242.jpeg",
        },
        {
          id: 'safety-inspector',
          title: 'Safety Inspector',
          description: 'Professional safety inspection training for construction and industrial environments with OSHA certification preparation.',
          category: 'Safety Training',
          duration: '6 Weeks',
          instructorName: 'System Instructor',
          level: 'Intermediate',
          image: "https://images.pexels.com/photos/34082713/pexels-photo-34082713.jpeg",
        },
        {
          id: 'welding',
          title: 'Professional Welding',
          description: 'Comprehensive welding training covering MIG, TIG, and Arc welding techniques for industrial applications.',
          category: 'Technical Training',
          duration: '10 Weeks',
          instructorName: 'System Instructor',
          level: 'Beginner to Professional',
          image: "https://images.pexels.com/photos/7650512/pexels-photo-7650512.jpeg",
        }
      ];
      
      // Get courses from localStorage (instructor created courses)
      const localStorageCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      
      // Combine all courses
      const allCourses = [...hardcodedCourses, ...localStorageCourses];
      
      // Remove duplicates by id
      const uniqueCourses = allCourses.filter((course, index, self) => 
        index === self.findIndex((c) => c.id === course.id)
      );
      
      return uniqueCourses;
      
    } catch (error) {
      console.error('Error loading courses:', error);
      return [];
    }
  };

  // ========== 📥 LOAD ALL DATA ==========
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading data for course:', courseId);
        
        // Get current user
        const currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) {
          router.push('/login');
          return;
        }
        const userData = JSON.parse(currentUserStr);
        setUser(userData);
        console.log('Current user:', userData);

        // Determine if this is the demo user (only student@gmail.com gets demo content)
        const isDemoUser = userData.email === 'student@gmail.com';
        console.log('Is demo user:', isDemoUser);

        // Load course from all courses (hardcoded + localStorage)
        const allCourses = loadAllCourses();
        const foundCourse = allCourses.find((c: any) => c.id === courseId);
        
        if (!foundCourse) {
          console.error('Course not found:', courseId);
          router.push('/lms/Student_Portal/my-courses');
          return;
        }
        setCourse(foundCourse);
        console.log('Found course:', foundCourse);

        // Check if it's a demo course (hardcoded id)
        const isDemoCourse = ['pipe-fitter', 'safety-inspector', 'welding'].includes(courseId);

        // ========== LOAD SLIDES (from localStorage, fallback to demo only if demo user) ==========
        let courseSlides: Slide[] = [];
        const allSlides = JSON.parse(localStorage.getItem('slides') || '[]');
        const localStorageSlides = allSlides
          .filter((s: Slide) => s.courseId === courseId)
          .sort((a: Slide, b: Slide) => a.slideNumber - b.slideNumber);
        
        if (localStorageSlides.length > 0) {
          // Always prefer slides from localStorage (instructor created)
          courseSlides = localStorageSlides;
        } else if (isDemoCourse && isDemoUser) {
          // Only use demo slides for demo user and demo course
          courseSlides = DEMO_SLIDES[courseId] || [];
        }
        setSlides(courseSlides);

        // ========== LOAD SLIDE CONTENTS ==========
        const contentsMap = new Map<string, SlideContent>();
        const allContents = JSON.parse(localStorage.getItem('slideContent') || '[]');
        const localStorageContents = allContents.filter((c: SlideContent) => c.courseId === courseId);
        localStorageContents.forEach((content: SlideContent) => {
          contentsMap.set(content.slideId, content);
        });

        if (contentsMap.size === 0 && isDemoCourse && isDemoUser) {
          const demoContents = DEMO_SLIDE_CONTENTS[courseId] || [];
          demoContents.forEach((content: SlideContent) => {
            contentsMap.set(content.slideId, content);
          });
        }
        setSlideContents(contentsMap);

        // ========== LOAD QUIZZES ==========
        const quizzesMap = new Map<string, Quiz>();
        const allQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
        const localStorageQuizzes = allQuizzes.filter((q: Quiz) => q.courseId === courseId);
        localStorageQuizzes.forEach((quiz: Quiz) => {
          quizzesMap.set(quiz.slideId, quiz);
        });

        if (quizzesMap.size === 0 && isDemoCourse && isDemoUser) {
          const demoQuizzes = DEMO_QUIZZES[courseId] || [];
          demoQuizzes.forEach((quiz: Quiz) => {
            quizzesMap.set(quiz.slideId, quiz);
          });
        }
        setQuizzes(quizzesMap);

        // ========== LOAD ASSIGNMENTS ==========
        let courseAssignments: Assignment[] = [];
        const allAssignments = JSON.parse(localStorage.getItem('assignments') || '[]');
        const localStorageAssignments = allAssignments.filter((a: Assignment) => 
          a.courseId === courseId && a.status === 'published'
        );
        
        if (localStorageAssignments.length > 0) {
          courseAssignments = localStorageAssignments;
        } else if (isDemoCourse && isDemoUser) {
          courseAssignments = DEMO_ASSIGNMENTS[courseId] || [];
        }
        setAssignments(courseAssignments);

        // ========== LOAD ASSIGNMENT SUBMISSIONS ==========
        const allSubmissions = JSON.parse(localStorage.getItem('assignmentSubmissions') || '[]');
        const submissionsMap = new Map<string, AssignmentSubmission>();
        allSubmissions.forEach((sub: AssignmentSubmission) => {
          if (sub.studentId === userData.id || sub.studentEmail === userData.email) {
            submissionsMap.set(sub.assignmentId, sub);
          }
        });
        setAssignmentSubmissions(submissionsMap);

        // ========== LOAD COMPLETED SLIDES ==========
        const completedKey = `completedSlides_${userData.id}_${courseId}`;
        const savedCompleted = localStorage.getItem(completedKey);
        console.log('Completed slides key:', completedKey, 'value:', savedCompleted);
        
        if (savedCompleted) {
          setCompletedSlides(new Set(JSON.parse(savedCompleted)));
        }

        // ========== LOAD COMPLETED CONTENT ==========
        const completedContentKey = `completedContent_${userData.id}_${courseId}`;
        const savedContent = localStorage.getItem(completedContentKey);
        if (savedContent) {
          setCompletedContent(new Set(JSON.parse(savedContent)));
        }

        // ========== LOAD QUIZ ATTEMPTS ==========
        const attemptsKey = `quizAttempts_${userData.id}`;
        const savedAttempts = localStorage.getItem(attemptsKey);
        console.log('Quiz attempts key:', attemptsKey, 'value:', savedAttempts);
        
        if (savedAttempts) {
          const attempts = JSON.parse(savedAttempts);
          const attemptsMap = new Map<string, QuizAttempt>();
          Object.entries(attempts).forEach(([quizId, attempt]: [string, any]) => {
            if (attempt.courseId === courseId) {
              attemptsMap.set(quizId, attempt);
            }
          });
          setQuizAttempts(attemptsMap);
        }

        // ========== UPDATE STUDENT COURSES PROGRESS ==========
        updateStudentCoursesProgress(
          userData.id, 
          courseId, 
          courseSlides, 
          savedCompleted ? JSON.parse(savedCompleted) : []
        );

        // ========== AUTO-EXPAND FIRST INCOMPLETE SLIDE ==========
        if (courseSlides.length > 0) {
          const completed = new Set(savedCompleted ? JSON.parse(savedCompleted) : []);
          const firstIncomplete = courseSlides.find((s: { id: unknown; }) => !completed.has(s.id));
          if (firstIncomplete) {
            setExpandedSlides(new Set([firstIncomplete.id]));
          } else {
            setExpandedSlides(new Set([courseSlides[0].id]));
          }
        }

        // ========== SHOW SUMMARY ==========
        console.log('===== LOAD SUMMARY =====');
        console.log('Total slides:', courseSlides.length);
        console.log('Slides with content:', contentsMap.size);
        console.log('Slides with quizzes:', quizzesMap.size);
        console.log('Total assignments:', courseAssignments.length);
        console.log('========================');

      } catch (error) {
        console.error('Error loading course details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [courseId, router]);

  // Update studentCourses progress
  const updateStudentCoursesProgress = (
    studentId: string, 
    cId: string, 
    allSlides: Slide[], 
    completedIds: string[]
  ) => {
    const studentCoursesStr = localStorage.getItem('studentCourses');
    if (!studentCoursesStr) return;

    try {
      const studentCourses = JSON.parse(studentCoursesStr);
      const courseIndex = studentCourses.findIndex((c: any) => c.id === cId);
      if (courseIndex === -1) return;

      const progress = allSlides.length > 0 
        ? Math.round((completedIds.length / allSlides.length) * 100) 
        : 0;
      const status = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started';

      studentCourses[courseIndex] = {
        ...studentCourses[courseIndex],
        progress,
        status,
        completedModules: completedIds.length,
        totalModules: allSlides.length
      };

      localStorage.setItem('studentCourses', JSON.stringify(studentCourses));
    } catch (error) {
      console.error('Error updating student courses:', error);
    }
  };

  // Check if slide can be marked complete
  const canMarkSlideComplete = (slideId: string): boolean => {
    const slideContent = slideContents.get(slideId);
    const quiz = quizzes.get(slideId);
    const quizId = `${courseId}_${slideId}`;
    const quizAttempt = quizAttempts.get(quizId);
    
    // Check if all content is completed
    const allContentCompleted = slideContent?.files.every(f => 
      completedContent.has(`${slideId}_${f.id}`)
    ) ?? true;
    
    // Check if quiz is attempted (if exists)
    const quizAttempted = quiz ? !!quizAttempt : true;
    
    // Check if all assignments for this slide are submitted
    const slideAssignments = assignments.filter(a => a.slideId === slideId);
    const allAssignmentsSubmitted = slideAssignments.length === 0 || 
      slideAssignments.every(a => assignmentSubmissions.has(a.id));
    
    return allContentCompleted && quizAttempted && allAssignmentsSubmitted;
  };

  // Mark slide as complete (only if all conditions are met)
  const markSlideComplete = (slideId: string) => {
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

    setCompletedSlides(prev => {
      if (prev.has(slideId)) return prev; // Already completed
      
      const newSet = new Set(prev);
      newSet.add(slideId);

      // Save to localStorage
      const completedKey = `completedSlides_${user.id}_${courseId}`;
      localStorage.setItem(completedKey, JSON.stringify(Array.from(newSet)));

      // Update studentCourses
      updateStudentCoursesProgress(user.id, courseId, slides, Array.from(newSet));

      // Show feedback
      setQuizFeedback({
        show: true,
        message: `✓ Lesson ${slides.find(s => s.id === slideId)?.slideNumber} completed!`,
        type: 'success'
      });
      setTimeout(() => setQuizFeedback(null), 2000);

      return newSet;
    });
  };

  // Mark content as complete (videos/pdfs only)
  const markContentComplete = (slideId: string, contentId: string) => {
    if (!user) return;

    setCompletedContent(prev => {
      const newSet = new Set(prev);
      const contentKey = `${slideId}_${contentId}`;
      
      if (newSet.has(contentKey)) {
        newSet.delete(contentKey);
      } else {
        newSet.add(contentKey);
      }

      // Save to localStorage
      const completedContentKey = `completedContent_${user.id}_${courseId}`;
      localStorage.setItem(completedContentKey, JSON.stringify(Array.from(newSet)));

      return newSet;
    });
  };

  // Toggle slide expansion
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

  // Handle quiz submission (no retake)
  const handleQuizSubmit = (slideId: string) => {
    const quiz = quizzes.get(slideId);
    if (!quiz || !user) return;

    // Check if all questions answered
    if (quizAnswers.some(a => a === -1 || a === undefined)) {
      setQuizFeedback({
        show: true,
        message: 'Please answer all questions before submitting',
        type: 'error'
      });
      setTimeout(() => setQuizFeedback(null), 3000);
      return;
    }

    // Check if quiz already attempted (no retake)
    const quizId = `${courseId}_${slideId}`;
    if (quizAttempts.has(quizId)) {
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
    quiz.questions.forEach((q, index) => {
      if (quizAnswers[index] === q.correctAnswer) {
        correctCount++;
      }
    });
    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= 70;

    const attempt: QuizAttempt = {
      quizId,
      slideId,
      courseId,
      answers: [...quizAnswers],
      score,
      passed,
      attemptedAt: new Date().toISOString(),
      studentId: user.id,
      studentEmail: user.email,
      studentName: user.fullName || user.name || 'Student'
    };

    // Save attempt
    const attemptsKey = `quizAttempts_${user.id}`;
    const existingAttemptsStr = localStorage.getItem(attemptsKey) || '{}';
    const existingAttempts = JSON.parse(existingAttemptsStr);
    existingAttempts[quizId] = attempt;
    localStorage.setItem(attemptsKey, JSON.stringify(existingAttempts));

    // Update state
    setQuizAttempts(new Map([...quizAttempts, [quizId, attempt]]));

    // Show feedback
    setQuizFeedback({
      show: true,
      message: passed 
        ? `🎉 Quiz completed! You scored ${score}%` 
        : `You scored ${score}%. Review the material.`,
      type: passed ? 'success' : 'error'
    });
    setTimeout(() => setQuizFeedback(null), 4000);

    // Reset active quiz
    setActiveQuiz(null);
    setQuizAnswers([]);
  };

  // Handle assignment submission
  const handleAssignmentSubmit = async (assignmentId: string) => {
    if (!user) return;
    
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
      
      for (let i = 0; i < assignmentFiles.length; i++) {
        const file = assignmentFiles[i];
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'assignment_submission');

        const response = await fetch('/api/upload/cloudinary', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
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

      if (uploadedFiles.length > 0) {
        const submission: AssignmentSubmission = {
          assignmentId,
          courseId: courseId,
          studentId: user.id,
          studentEmail: user.email,
          studentName: user.fullName || user.name || 'Student',
          files: uploadedFiles,
          submittedAt: new Date().toISOString(),
          status: 'submitted'
        };

        // Save submission
        const existingSubmissions = JSON.parse(localStorage.getItem('assignmentSubmissions') || '[]');
        const updatedSubmissions = [...existingSubmissions.filter((s: AssignmentSubmission) => s.assignmentId !== assignmentId), submission];
        localStorage.setItem('assignmentSubmissions', JSON.stringify(updatedSubmissions));

        // Update state
        setAssignmentSubmissions(new Map([...assignmentSubmissions, [assignmentId, submission]]));

        setAssignmentFeedback({
          show: true,
          message: '✓ Assignment submitted successfully!',
          type: 'success'
        });
        setTimeout(() => setAssignmentFeedback(null), 3000);

        // Reset
        setActiveAssignment(null);
        setAssignmentFiles([]);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setAssignmentFeedback({
        show: true,
        message: 'Failed to submit assignment. Please try again.',
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
      const quizId = `${courseId}_${slide.id}`;
      const attempt = quizAttempts.get(quizId);
      const slideAssignments = assignments.filter(a => a.slideId === slide.id);
      const hasAssignment = slideAssignments.length > 0;
      const assignmentSubmitted = hasAssignment && slideAssignments.some(a => assignmentSubmissions.has(a.id));
      const assignment = hasAssignment ? slideAssignments[0] : undefined;
      const submission = assignment ? assignmentSubmissions.get(assignment.id) : undefined;
      
      return {
        slideId: slide.id,
        title: slide.title,
        slideNumber: slide.slideNumber,
        completed: completedSlides.has(slide.id),
        hasQuiz: !!quiz,
        quizAttempted: !!attempt,
        quizScore: attempt?.score,
        quizPassed: attempt?.passed,
        hasAssignment,
        assignmentSubmitted,
        assignmentScore: submission?.score
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
    
    // Determine overall performance level
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
    if (fileType.includes('word') || fileType.includes('document')) return <HiDocumentText className="w-5 h-5 text-blue-700" />;
    if (fileType.includes('image')) return <HiDocumentText className="w-5 h-5 text-green-500" />;
    if (fileType.includes('sheet') || fileType.includes('excel')) return <HiDocumentText className="w-5 h-5 text-green-600" />;
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return <HiDocumentText className="w-5 h-5 text-orange-500" />;
    return <HiDocumentText className="w-5 h-5 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div 
            className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" 
            style={{ borderColor: BRAND_COLORS.deepRed }}
          ></div>
          <p className="mt-4 text-gray-600">Loading course materials...</p>
        </div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-5xl mx-auto">
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

      {/* Back button */}
      <Link
        href="/lms/Student_Portal/my-courses"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors group"
      >
        <HiArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to My Courses
      </Link>

      {/* Course header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {course.image && (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
              <img 
                src={course.image} 
                alt={course.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-sm text-gray-600 mt-1">{course.description}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center">
                <HiClock className="w-4 h-4 mr-1" />
                {course.duration || 'Self-paced'}
              </span>
              <span className="flex items-center">
                <HiDocumentText className="w-4 h-4 mr-1" />
                {totalCount} {totalCount === 1 ? 'lesson' : 'lessons'}
              </span>
              {course.level && (
                <span className="flex items-center px-2 py-1 bg-gray-100 rounded-full text-xs">
                  {course.level}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Overall progress and performance */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Progress */}
          <div>
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
                className="h-full rounded-full transition-all duration-500 ease-out" 
                style={{ 
                  width: `${progress}%`, 
                  backgroundColor: BRAND_COLORS.deepRed 
                }}
              ></div>
            </div>
          </div>

          {/* Performance */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PerformanceIcon className="w-5 h-5" style={{ color: overallPerformance.performanceColor }} />
                <span className="text-sm font-medium text-gray-700">Overall Performance</span>
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

        {/* Completion message */}
        {progress === 100 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 flex items-center gap-2">
              <HiCheckCircle className="w-5 h-5" />
              🎉 Congratulations! You have completed all lessons in this course.
            </p>
          </div>
        )}
      </div>

      {/* Performance Toggle */}
      <button
        onClick={() => setShowPerformance(!showPerformance)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <HiChartBar className="w-4 h-4" />
        {showPerformance ? 'Hide' : 'Show'} Detailed Performance
        {showPerformance ? <HiChevronUp className="w-4 h-4" /> : <HiChevronDown className="w-4 h-4" />}
      </button>

      {/* Detailed Performance Table */}
      {showPerformance && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
            Lesson Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-xs font-medium text-gray-500">Lesson</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-500">Status</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-500">Quiz</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-500">Quiz Score</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-500">Assignment</th>
                  <th className="text-left py-2 text-xs font-medium text-gray-500">Assignment Score</th>
                </tr>
              </thead>
              <tbody>
                {getSlidePerformance().map((perf) => (
                  <tr key={perf.slideId} className="border-b border-gray-100 last:border-0">
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
                          <span className={`flex items-center gap-1 text-xs ${
                            perf.quizPassed ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {perf.quizPassed ? (
                              <HiCheckCircle className="w-4 h-4" />
                            ) : (
                              <HiOutlineXCircle className="w-4 h-4" />
                            )}
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
                        <span className={`text-sm font-medium ${
                          perf.quizScore >= 70 ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {perf.quizScore}%
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3">
                      {perf.hasAssignment ? (
                        perf.assignmentSubmitted ? (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <HiCheckCircle className="w-4 h-4" />
                            Submitted
                          </span>
                        ) : (
                          <span className="text-xs text-yellow-600">Pending</span>
                        )
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3">
                      {perf.assignmentScore ? (
                        <span className={`text-sm font-medium ${
                          perf.assignmentScore >= 70 ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {perf.assignmentScore}%
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slides list */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
          Course Lessons
        </h2>
        
        {slides.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <HiDocumentText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No lessons available for this course yet.</p>
            <p className="text-sm text-gray-400 mt-2">Check back later for updates.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {slides.map((slide) => {
              const isCompleted = completedSlides.has(slide.id);
              const isExpanded = expandedSlides.has(slide.id);
              const slideContent = slideContents.get(slide.id);
              const quiz = quizzes.get(slide.id);
              const quizId = `${courseId}_${slide.id}`;
              const attempt = quiz ? quizAttempts.get(quizId) : null;
              const hasFiles = slideContent && slideContent.files.length > 0;
              const allContentCompleted = slideContent?.files.every(f => 
                completedContent.has(`${slide.id}_${f.id}`)
              ) ?? true;
              const quizAttempted = quiz ? !!attempt : true;
              const slideAssignments = assignments.filter(a => a.slideId === slide.id);
              const hasAssignment = slideAssignments.length > 0;
              const assignmentSubmitted = hasAssignment && slideAssignments.some(a => assignmentSubmissions.has(a.id));
              const canComplete = canMarkSlideComplete(slide.id);

              return (
                <div 
                  key={slide.id} 
                  className={`border rounded-lg overflow-hidden transition-all ${
                    isCompleted ? 'border-green-200 bg-green-50/30' : 'border-gray-200'
                  }`}
                >
                  {/* Slide header with completion status and expand/collapse */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="relative">
                        {isCompleted ? (
                          <HiCheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <IoMdRadioButtonOff className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <button
                        onClick={() => toggleSlideExpansion(slide.id)}
                        className="flex items-center gap-2 flex-1 text-left"
                      >
                        <div>
                          <h3 className={`font-medium ${isCompleted ? 'text-gray-700' : 'text-gray-900'}`}>
                            Lesson {slide.slideNumber}: {slide.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-500">
                              {hasFiles && `${slideContent?.files.length || 0} file(s)`}
                              {hasFiles && quiz && ' • '}
                              {quiz && '1 quiz'}
                              {(hasFiles || quiz) && hasAssignment && ' • '}
                              {hasAssignment && `${slideAssignments.length} assignment(s)`}
                            </p>
                            {canComplete && !isCompleted && (
                              <span className="text-xs text-blue-600">Ready to complete</span>
                            )}
                          </div>
                        </div>
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Performance indicators */}
                      {quiz && attempt && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          attempt.passed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          Quiz: {attempt.score}%
                        </span>
                      )}
                      {hasAssignment && assignmentSubmitted && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                          Assignment ✓
                        </span>
                      )}
                      <button
                        onClick={() => toggleSlideExpansion(slide.id)}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        {isExpanded ? (
                          <HiChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <HiChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="p-4 space-y-4">
                      {/* Slide content (files) */}
                      {hasFiles && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <HiDocumentText className="w-4 h-4" />
                            Lesson Materials
                          </h4>
                          <div className="grid gap-2">
                            {slideContent?.files.map((file) => {
                              const contentKey = `${slide.id}_${file.id}`;
                              const isContentCompleted = completedContent.has(contentKey);
                              
                              return (
                                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    {getFileIcon(file.type)}
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm text-gray-700 truncate">{file.name}</p>
                                      <p className="text-xs text-gray-400">
                                        {(file.size / 1024).toFixed(0)} KB
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    {/* Mark as complete button (only for non-quiz content) */}
                                    <button
                                      onClick={() => markContentComplete(slide.id, file.id)}
                                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                        isContentCompleted
                                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                      }`}
                                    >
                                      {isContentCompleted ? '✓ Completed' : 'Mark Complete'}
                                    </button>

                                    {/* View/Download button */}
                                    {file.type.startsWith('video') ? (
                                      <button
                                        onClick={() => window.open(file.url, '_blank')}
                                        className="text-sm text-blue-600 hover:underline px-3 py-1 flex-shrink-0"
                                      >
                                        Watch
                                      </button>
                                    ) : (
                                      <a
                                        href={file.url}
                                        download={file.name}
                                        className="text-sm text-blue-600 hover:underline px-3 py-1 flex-shrink-0"
                                      >
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

                      {/* Quiz section - No retake option */}
                      {quiz && (
                        <div className={hasFiles ? 'border-t pt-4' : ''}>
                          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                            Knowledge Check - Quiz
                          </h4>
                          
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
                                    {attempt.passed ? 'Passed' : 'Failed'} – Score: {attempt.score}%
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Attempted on {new Date(attempt.attemptedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : activeQuiz === slide.id ? (
                            <div className="space-y-4">
                              {quiz.questions.map((q, qIndex) => (
                                <div key={q.id} className="border border-gray-200 rounded-lg p-4">
                                  <p className="text-sm font-medium mb-3">
                                    Question {qIndex + 1}: {q.question}
                                  </p>
                                  <div className="space-y-2 ml-2">
                                    {q.options.map((opt, optIndex) => (
                                      <label key={optIndex} className="flex items-center gap-3 text-sm p-2 rounded hover:bg-gray-50 cursor-pointer">
                                        <input
                                          type="radio"
                                          name={`q-${q.id}`}
                                          value={optIndex}
                                          checked={quizAnswers[qIndex] === optIndex}
                                          onChange={() => {
                                            const newAnswers = [...quizAnswers];
                                            newAnswers[qIndex] = optIndex;
                                            setQuizAnswers(newAnswers);
                                          }}
                                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700">{opt}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              ))}
                              <div className="flex gap-2 pt-2">
                                <button
                                  onClick={() => handleQuizSubmit(slide.id)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                  Submit Quiz
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveQuiz(null);
                                    setQuizAnswers([]);
                                  }}
                                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setActiveQuiz(slide.id);
                                setQuizAnswers(new Array(quiz.questions.length).fill(-1));
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                            >
                              <span>Start Quiz</span>
                              <HiArrowLeft className="w-4 h-4 rotate-180" />
                            </button>
                          )}
                        </div>
                      )}

                      {/* Assignment section */}
                      {hasAssignment && (
                        <div className={(hasFiles || quiz) ? 'border-t pt-4' : ''}>
                          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <HiDocumentReport className="w-4 h-4" />
                            Assignment
                          </h4>
                          
                          {slideAssignments.map((assignment) => {
                            const submission = assignmentSubmissions.get(assignment.id);
                            
                            return (
                              <div key={assignment.id} className="space-y-3">
                                {/* Assignment details with instructor's file */}
                                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                  <h5 className="font-medium text-gray-900">{assignment.title}</h5>
                                  <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                                  
                                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <HiClock className="w-3 h-3" />
                                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                    </span>
                                    <span>Total Marks: {assignment.totalMarks}</span>
                                    <span>Passing: {assignment.passingMarks}</span>
                                  </div>

                                  {/* Instructor's attached file - NEW SECTION */}
                                  {assignment.file && (
                                    <div className="mt-3 p-2 bg-white rounded-lg border border-gray-200">
                                      <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                                        <HiPaperClip className="w-3 h-3" />
                                        Assignment File from Instructor:
                                      </p>
                                      <a
                                        href={assignment.file.url}
                                        download={assignment.file.name}
                                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                      >
                                        {getFileIcon(assignment.file.type)}
                                        <span className="text-sm text-blue-600 hover:underline flex-1">
                                          {assignment.file.name}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                          ({(assignment.file.size / 1024).toFixed(0)} KB)
                                        </span>
                                        <HiDownload className="w-4 h-4 text-gray-400" />
                                      </a>
                                    </div>
                                  )}
                                </div>

                                {/* Submission section */}
                                {submission ? (
                                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <HiCheckCircle className="w-6 h-6 text-green-600" />
                                      <div>
                                        <p className="text-sm font-medium text-green-700">
                                          Assignment Submitted
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
                                        </p>
                                        {submission.files && submission.files.length > 0 && (
                                          <div className="mt-2">
                                            <p className="text-xs font-medium text-gray-600 mb-1">Your submissions:</p>
                                            {submission.files.map((file, idx) => (
                                              <a
                                                key={idx}
                                                href={file.url}
                                                download={file.name}
                                                className="flex items-center gap-2 text-xs text-blue-600 hover:underline mt-1"
                                              >
                                                {getFileIcon(file.type)}
                                                {file.name}
                                              </a>
                                            ))}
                                          </div>
                                        )}
                                        {submission.score && (
                                          <p className="text-sm font-medium text-green-600 mt-2">
                                            Score: {submission.score}%
                                            {submission.feedback && ` - Feedback: ${submission.feedback}`}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ) : activeAssignment === assignment.id ? (
                                  <div className="border border-gray-200 rounded-lg p-4">
                                    <div className="mb-4">
                                      <p className="text-sm text-gray-600">Upload your assignment files:</p>
                                    </div>

                                    {/* File upload */}
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                      <input
                                        type="file"
                                        multiple
                                        onChange={(e) => setAssignmentFiles(Array.from(e.target.files || []))}
                                        className="hidden"
                                        id={`assignment-${assignment.id}`}
                                        disabled={uploadingAssignment}
                                      />
                                      <label
                                        htmlFor={`assignment-${assignment.id}`}
                                        className="cursor-pointer block"
                                      >
                                        <div className="text-center">
                                          <HiDocumentText className="w-8 h-8 mx-auto text-gray-400" />
                                          <p className="text-sm text-gray-600 mt-2">
                                            Click to upload files
                                          </p>
                                          {assignmentFiles.length > 0 && (
                                            <div className="mt-2">
                                              {assignmentFiles.map((file, idx) => (
                                                <p key={idx} className="text-xs text-green-600">
                                                  {file.name}
                                                </p>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </label>
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                      <button
                                        onClick={() => handleAssignmentSubmit(assignment.id)}
                                        disabled={uploadingAssignment || assignmentFiles.length === 0}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {uploadingAssignment ? 'Uploading...' : 'Submit Assignment'}
                                      </button>
                                      <button
                                        onClick={() => {
                                          setActiveAssignment(null);
                                          setAssignmentFiles([]);
                                        }}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setActiveAssignment(assignment.id)}
                                    className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                  >
                                    Start Assignment
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Complete lesson button (appears when all requirements met) */}
                      {canComplete && !isCompleted && (
                        <button
                          onClick={() => markSlideComplete(slide.id)}
                          className="mt-3 w-full py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <HiCheckCircle className="w-4 h-4" />
                          Mark Lesson as Complete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center pt-4">
        <Link
          href="/lms/Student_Portal/my-courses"
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Back to Courses
        </Link>
        
        {progress === 100 && (
          <Link
            href="/lms/Student_Portal/certificates"
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <HiCheckCircle className="w-4 h-4" />
            View Certificate
          </Link>
        )}
      </div>

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}