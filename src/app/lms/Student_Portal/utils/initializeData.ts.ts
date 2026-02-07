// utils/initializeData.ts
'use client';

export function initializeStudentData() {
  // Only initialize if data doesn't exist
  const currentUser = localStorage.getItem('currentUser');
  const studentCourses = localStorage.getItem('studentCourses');
  
  if (!currentUser) {
    // Create demo user
    const demoUser = {
      id: 'student_123',
      email: 'demostudent@gmail.com',
      username: 'demostudent',
      fullName: 'Demo Student',
      phone: '+92 300 1234567',
      address: 'Karachi, Pakistan',
      dateOfBirth: '1995-06-15',
      role: 'student' as const,
      course: 'Industrial Pipe Fitting',
      courseId: 'pipe-fitter',
      registrationDate: '2024-01-01',
      status: 'active' as const,
      paymentVerified: true,
      learnerId: 'LRN2024001'
    };
    
    localStorage.setItem('currentUser', JSON.stringify(demoUser));
  }
  
  if (!studentCourses) {
    // Create demo courses
    const demoCourses = [
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
          }
          // ... more modules would be here in a full implementation
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
        modules: []
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
        modules: []
      }
    ];
    
    localStorage.setItem('studentCourses', JSON.stringify(demoCourses));
  }
  
  // Initialize other data
  if (!localStorage.getItem('quizResults')) {
    localStorage.setItem('quizResults', JSON.stringify([]));
  }
  
  if (!localStorage.getItem('studentProgress')) {
    const progressData = {
      totalStudyHours: 98,
      weeklyStudyHours: {
        'Week 1': 12,
        'Week 2': 15,
        'Week 3': 10,
        'Week 4': 14,
        'Week 5': 16,
        'Week 6': 11,
        'Week 7': 20
      },
      assignmentsCompleted: 15,
      totalAssignments: 24,
      quizzesPassed: 8,
      totalQuizzes: 12,
      averageQuizScore: 85,
      consistencyStreak: 14,
      courses: [
        {
          courseId: 'pipe-fitter',
          courseName: 'Industrial Pipe Fitting',
          progress: 75,
          completedModules: 6,
          totalModules: 8,
          lastActivity: '2024-03-15T10:30:00Z',
          averageScore: 88
        },
        {
          courseId: 'welding',
          courseName: 'Professional Welding',
          progress: 30,
          completedModules: 3,
          totalModules: 10,
          lastActivity: '2024-03-10T14:20:00Z',
          averageScore: 85
        },
        {
          courseId: 'safety-inspector',
          courseName: 'Safety Inspector Certification',
          progress: 100,
          completedModules: 6,
          totalModules: 6,
          lastActivity: '2024-01-20T09:15:00Z',
          averageScore: 90
        }
      ]
    };
    
    localStorage.setItem('studentProgress', JSON.stringify(progressData));
  }
  
  if (!localStorage.getItem('studentCertificates')) {
    const certificates = [
      {
        id: 'cert-001',
        certificateId: 'CERT2024001',
        studentName: 'Demo Student',
        courseName: 'Safety Inspector Certification',
        completionDate: '2024-01-20',
        issueDate: '2024-01-25',
        certificateUrl: '/certificates/safety-inspector.pdf',
        verificationUrl: 'https://verify.mansolhab.com/cert-001'
      }
    ];
    
    localStorage.setItem('studentCertificates', JSON.stringify(certificates));
  }
}

// Also update the app/layout.tsx to initialize data