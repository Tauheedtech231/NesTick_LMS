// data/progress.ts
export const progressData = {
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
  consistencyStreak: 14, // days
  learningGoals: {
    dailyStudyHours: 2,
    weeklyModules: 2,
    monthlyCertifications: 1
  },
  courseProgress: [
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

export const certificatesData = [
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