// data/courses.ts
export const coursesData = [
  {
    id: 'pipe-fitter',
    title: 'Industrial Pipe Fitting',
    instructor: 'John Smith',
    description: 'Master industrial pipe fitting techniques with hands-on training on cutting, threading, and installation.',
    category: 'Technical Training',
    progress: 75,
    status: 'in_progress' as const,
    enrolledDate: '2024-01-15',
    totalModules: 8,
    completedModules: 6,
    studyHours: 32,
    lastAccessed: '2024-03-15T10:30:00Z',
    modules: [
      {
        id: 'module-1',
        title: 'Introduction to Pipe Fitting',
        description: 'Basic concepts and safety protocols',
        duration: '45',
        videoUrl: 'https://example.com/video1',
        assignment: {
          id: 'assign-1',
          title: 'Safety Protocol Assignment',
          description: 'Write about safety measures in pipe fitting',
          dueDate: '2024-01-25',
          maxScore: 100,
          studentScore: 95,
          submission: 'Submitted document about safety protocols',
          isSubmitted: true,
          submittedDate: '2024-01-24'
        },
        quiz: {
          id: 'quiz-1',
          title: 'Safety Quiz',
          description: 'Test your safety knowledge',
          questions: [
            {
              id: 'q1',
              question: 'What is the most important safety equipment?',
              options: ['Gloves', 'Helmet', 'Safety Glasses', 'All of the above'],
              correctAnswer: 3,
              explanation: 'All safety equipment is important for complete protection'
            }
          ],
          passingScore: 70,
          studentScore: 85,
          isPassed: true,
          attempts: 1,
          timeLimit: 30
        },
        isVideoWatched: true,
        isAssignmentSubmitted: true,
        isQuizPassed: true,
        isCompleted: true,
        order: 1
      },
      {
        id: 'module-2',
        title: 'Pipe Cutting Techniques',
        description: 'Learn different pipe cutting methods',
        duration: '60',
        videoUrl: 'https://example.com/video2',
        assignment: {
          id: 'assign-2',
          title: 'Cutting Techniques Report',
          description: 'Compare different cutting techniques',
          dueDate: '2024-02-10',
          maxScore: 100,
          studentScore: 88,
          submission: 'Submitted report on cutting techniques',
          isSubmitted: true,
          submittedDate: '2024-02-09'
        },
        quiz: {
          id: 'quiz-2',
          title: 'Cutting Techniques Quiz',
          description: 'Test your cutting knowledge',
          questions: [
            {
              id: 'q1',
              question: 'Which tool is best for precise cuts?',
              options: ['Hacksaw', 'Pipe Cutter', 'Angle Grinder', 'Plasma Cutter'],
              correctAnswer: 1,
              explanation: 'Pipe cutter provides the most precise cuts'
            }
          ],
          passingScore: 70,
          studentScore: 92,
          isPassed: true,
          attempts: 1,
          timeLimit: 30
        },
        isVideoWatched: true,
        isAssignmentSubmitted: true,
        isQuizPassed: true,
        isCompleted: true,
        order: 2
      },
      {
        id: 'module-3',
        title: 'Threading and Installation',
        description: 'Advanced threading techniques',
        duration: '75',
        videoUrl: 'https://example.com/video3',
        assignment: {
          id: 'assign-3',
          title: 'Threading Practice Assignment',
          description: 'Practice threading on sample pipes',
          dueDate: '2024-02-25',
          maxScore: 100,
          studentScore: 90,
          submission: 'Submitted threading samples',
          isSubmitted: true,
          submittedDate: '2024-02-24'
        },
        quiz: {
          id: 'quiz-3',
          title: 'Threading Quiz',
          description: 'Test your threading knowledge',
          questions: [
            {
              id: 'q1',
              question: 'What is the standard thread angle?',
              options: ['45°', '55°', '60°', '90°'],
              correctAnswer: 2,
              explanation: 'Standard thread angle is 60 degrees'
            }
          ],
          passingScore: 70,
          studentScore: 78,
          isPassed: true,
          attempts: 1,
          timeLimit: 30
        },
        isVideoWatched: true,
        isAssignmentSubmitted: true,
        isQuizPassed: true,
        isCompleted: true,
        order: 3
      },
      {
        id: 'module-4',
        title: 'Blueprint Reading',
        description: 'Learn to read industrial blueprints',
        duration: '90',
        videoUrl: 'https://example.com/video4',
        assignment: {
          id: 'assign-4',
          title: 'Blueprint Analysis',
          description: 'Analyze given blueprints',
          dueDate: '2024-03-10',
          maxScore: 100,
          studentScore: 85,
          submission: 'Blueprint analysis submitted',
          isSubmitted: true,
          submittedDate: '2024-03-09'
        },
        quiz: {
          id: 'quiz-4',
          title: 'Blueprint Quiz',
          description: 'Test blueprint reading skills',
          questions: [
            {
              id: 'q1',
              question: 'What does P&ID stand for?',
              options: [
                'Pipe and Instrument Diagram',
                'Pressure and Installation Document',
                'Piping and Industrial Design',
                'Process and Instrument Drawing'
              ],
              correctAnswer: 0,
              explanation: 'P&ID stands for Pipe and Instrument Diagram'
            }
          ],
          passingScore: 70,
          studentScore: 82,
          isPassed: true,
          attempts: 1,
          timeLimit: 30
        },
        isVideoWatched: true,
        isAssignmentSubmitted: true,
        isQuizPassed: true,
        isCompleted: true,
        order: 4
      },
      {
        id: 'module-5',
        title: 'System Design',
        description: 'Design complete pipe systems',
        duration: '120',
        videoUrl: 'https://example.com/video5',
        assignment: {
          id: 'assign-5',
          title: 'System Design Project',
          description: 'Design a complete pipe system',
          dueDate: '2024-03-25',
          maxScore: 100,
          studentScore: null,
          submission: '',
          isSubmitted: false,
          submittedDate: ''
        },
        quiz: {
          id: 'quiz-5',
          title: 'Design Principles Quiz',
          description: 'Test design knowledge',
          questions: [
            {
              id: 'q1',
              question: 'What is the most important factor in system design?',
              options: ['Cost', 'Efficiency', 'Safety', 'Aesthetics'],
              correctAnswer: 2,
              explanation: 'Safety is the most important factor'
            }
          ],
          passingScore: 70,
          studentScore: null,
          isPassed: false,
          attempts: 0,
          timeLimit: 30
        },
        isVideoWatched: true,
        isAssignmentSubmitted: false,
        isQuizPassed: false,
        isCompleted: false,
        order: 5
      },
      {
        id: 'module-6',
        title: 'Advanced Installation',
        description: 'Complex installation scenarios',
        duration: '100',
        videoUrl: 'https://example.com/video6',
        assignment: {
          id: 'assign-6',
          title: 'Installation Simulation',
          description: 'Simulate complex installation',
          dueDate: '2024-04-10',
          maxScore: 100,
          studentScore: null,
          submission: '',
          isSubmitted: false,
          submittedDate: ''
        },
        quiz: {
          id: 'quiz-6',
          title: 'Installation Quiz',
          description: 'Test installation knowledge',
          questions: [
            {
              id: 'q1',
              question: 'What is the first step in installation?',
              options: ['Cutting', 'Measuring', 'Planning', 'Welding'],
              correctAnswer: 2,
              explanation: 'Planning is always the first step'
            }
          ],
          passingScore: 70,
          studentScore: null,
          isPassed: false,
          attempts: 0,
          timeLimit: 30
        },
        isVideoWatched: false,
        isAssignmentSubmitted: false,
        isQuizPassed: false,
        isCompleted: false,
        order: 6
      },
      {
        id: 'module-7',
        title: 'Quality Control',
        description: 'Ensure installation quality',
        duration: '80',
        videoUrl: 'https://example.com/video7',
        assignment: {
          id: 'assign-7',
          title: 'Quality Inspection',
          description: 'Inspect sample installations',
          dueDate: '2024-04-25',
          maxScore: 100,
          studentScore: null,
          submission: '',
          isSubmitted: false,
          submittedDate: ''
        },
        quiz: {
          id: 'quiz-7',
          title: 'Quality Control Quiz',
          description: 'Test quality control knowledge',
          questions: [
            {
              id: 'q1',
              question: 'What is the acceptable pressure test duration?',
              options: ['10 minutes', '30 minutes', '1 hour', '2 hours'],
              correctAnswer: 2,
              explanation: 'Standard pressure test duration is 1 hour'
            }
          ],
          passingScore: 70,
          studentScore: null,
          isPassed: false,
          attempts: 0,
          timeLimit: 30
        },
        isVideoWatched: false,
        isAssignmentSubmitted: false,
        isQuizPassed: false,
        isCompleted: false,
        order: 7
      },
      {
        id: 'module-8',
        title: 'Certification Preparation',
        description: 'Prepare for industry certification',
        duration: '120',
        videoUrl: 'https://example.com/video8',
        assignment: {
          id: 'assign-8',
          title: 'Final Project',
          description: 'Complete end-to-end project',
          dueDate: '2024-05-10',
          maxScore: 100,
          studentScore: null,
          submission: '',
          isSubmitted: false,
          submittedDate: ''
        },
        quiz: {
          id: 'quiz-8',
          title: 'Certification Mock Test',
          description: 'Full certification mock test',
          questions: [
            {
              id: 'q1',
              question: 'What is the passing score for certification?',
              options: ['60%', '70%', '80%', '90%'],
              correctAnswer: 1,
              explanation: 'Passing score is typically 70%'
            }
          ],
          passingScore: 70,
          studentScore: null,
          isPassed: false,
          attempts: 0,
          timeLimit: 60
        },
        isVideoWatched: false,
        isAssignmentSubmitted: false,
        isQuizPassed: false,
        isCompleted: false,
        order: 8
      }
    ]
  },
  {
    id: 'welding',
    title: 'Professional Welding',
    instructor: 'Robert Johnson',
    description: 'Comprehensive welding training covering MIG, TIG, and Arc welding techniques.',
    category: 'Technical Training',
    progress: 30,
    status: 'in_progress' as const,
    enrolledDate: '2024-02-01',
    totalModules: 10,
    completedModules: 3,
    studyHours: 18,
    lastAccessed: '2024-03-10T14:20:00Z',
    modules: Array(10).fill(null).map((_, i) => ({
      id: `welding-module-${i + 1}`,
      title: `Welding Module ${i + 1}`,
      description: `Welding techniques module ${i + 1}`,
      duration: '60',
      videoUrl: `https://example.com/welding-video-${i + 1}`,
      assignment: {
        id: `welding-assign-${i + 1}`,
        title: `Welding Assignment ${i + 1}`,
        description: `Complete welding assignment ${i + 1}`,
        dueDate: `2024-0${Math.floor(i/3) + 3}-${(i%3)*10 + 10}`,
        maxScore: 100,
        studentScore: i < 3 ? 85 + i * 5 : null,
        submission: i < 3 ? 'Submitted' : '',
        isSubmitted: i < 3,
        submittedDate: i < 3 ? `2024-0${Math.floor(i/3) + 2}-${(i%3)*10 + 9}` : ''
      },
      quiz: {
        id: `welding-quiz-${i + 1}`,
        title: `Welding Quiz ${i + 1}`,
        description: `Test welding knowledge ${i + 1}`,
        questions: [
          {
            id: `welding-q${i + 1}`,
            question: `Welding question ${i + 1}?`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: i % 4,
            explanation: `Explanation for question ${i + 1}`
          }
        ],
        passingScore: 70,
        studentScore: i < 3 ? 80 + i * 5 : null,
        isPassed: i < 3,
        attempts: i < 3 ? 1 : 0,
        timeLimit: 30
      },
      isVideoWatched: i < 3,
      isAssignmentSubmitted: i < 3,
      isQuizPassed: i < 3,
      isCompleted: i < 3,
      order: i + 1
    }))
  },
  {
    id: 'safety-inspector',
    title: 'Safety Inspector Certification',
    instructor: 'Sarah Williams',
    description: 'Professional safety inspection training with OSHA certification preparation.',
    category: 'Safety Training',
    progress: 100,
    status: 'completed' as const,
    enrolledDate: '2023-11-10',
    totalModules: 6,
    completedModules: 6,
    studyHours: 48,
    lastAccessed: '2024-01-20T09:15:00Z',
    modules: Array(6).fill(null).map((_, i) => ({
      id: `safety-module-${i + 1}`,
      title: `Safety Module ${i + 1}`,
      description: `Safety inspection techniques module ${i + 1}`,
      duration: '80',
      videoUrl: `https://example.com/safety-video-${i + 1}`,
      assignment: {
        id: `safety-assign-${i + 1}`,
        title: `Safety Assignment ${i + 1}`,
        description: `Complete safety assignment ${i + 1}`,
        dueDate: `2023-1${Math.floor(i/2) + 1}-${(i%2)*15 + 10}`,
        maxScore: 100,
        studentScore: 90 + i * 2,
        submission: 'Submitted safety inspection report',
        isSubmitted: true,
        submittedDate: `2023-1${Math.floor(i/2) + 1}-${(i%2)*15 + 9}`
      },
      quiz: {
        id: `safety-quiz-${i + 1}`,
        title: `Safety Quiz ${i + 1}`,
        description: `Test safety knowledge ${i + 1}`,
        questions: [
          {
            id: `safety-q${i + 1}`,
            question: `Safety question ${i + 1}?`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: i % 4,
            explanation: `Explanation for safety question ${i + 1}`
          }
        ],
        passingScore: 70,
        studentScore: 85 + i * 3,
        isPassed: true,
        attempts: 1,
        timeLimit: 30
      },
      isVideoWatched: true,
      isAssignmentSubmitted: true,
      isQuizPassed: true,
      isCompleted: true,
      order: i + 1
    }))
  }
];

// Demo user data
export const demoUser = {
  id: 'student_123',
  email: 'demostudent@gmail.com',
  username: 'demostudent',
  fullName: 'Demo Student',
  role: 'student' as const,
  course: 'Industrial Pipe Fitting',
  courseId: 'pipe-fitter',
  registrationDate: '2024-01-01',
  status: 'active' as const,
  paymentVerified: true,
  learnerId: 'LRN2024001'
};