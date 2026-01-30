// app/lms/Student_Portal/utils/demoData.ts
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: string;
  duration: string;
  category: 'Matric' | 'Intermediate';
  level: '9th' | '10th' | '11th' | '12th';
  modules: Module[];
  completion: number;
  enrolledDate: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  duration: string;
  materials: StudyMaterial[];
  quiz: Quiz | null;
  assignment: Assignment | null;
  completed: boolean;
  completedDate?: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'slides' | 'document';
  url: string;
  duration?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  totalQuestions: number;
  passingScore: number;
  timeLimit: number;
  attempts: number;
  questions: QuizQuestion[];
  completed: boolean;
  score?: number;
  attemptDate?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  submitted: boolean;
  submissionDate?: string;
  score?: number;
  fileUrl?: string;
  submittedFile?: string;
}

export interface StudySession {
  id: string;
  courseId: string;
  moduleId: string;
  date: string;
  duration: number;
  notes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  studentId: string;
  grade: string;
  institution: string;
  avatar?: string;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    assignmentReminders: boolean;
    quizReminders: boolean;
  };
}

export const initializeDemoData = () => {
  if (typeof window === 'undefined') return;

  // Initialize user profile
  if (!localStorage.getItem('lms_user_profile')) {
    const profile: UserProfile = {
      id: '1',
      name: 'Ali Ahmed',
      email: 'ali.ahmed@student.edu.pk',
      studentId: 'STU2024001',
      grade: '10th Grade',
      institution: 'Government College Lahore',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ali',
      notificationPreferences: {
        email: true,
        push: true,
        assignmentReminders: true,
        quizReminders: true,
      },
    };
    localStorage.setItem('lms_user_profile', JSON.stringify(profile));
  }

  // Initialize courses if not exists
  if (!localStorage.getItem('lms_courses')) {
    const courses: Course[] = [
      {
        id: 'math-10',
        title: 'Mathematics - 10th Grade',
        description: 'Complete course covering algebra, geometry, and trigonometry for matric students.',
        thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h-225&fit=crop',
        instructor: 'Dr. Sarah Khan',
        duration: '36 weeks',
        category: 'Matric',
        level: '10th',
        modules: [],
        completion: 65,
        enrolledDate: '2024-01-15',
      },
      {
        id: 'physics-10',
        title: 'Physics - 10th Grade',
        description: 'Fundamental concepts of mechanics, heat, and waves.',
        thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=225&fit=crop',
        instructor: 'Prof. Ahmed Raza',
        duration: '32 weeks',
        category: 'Matric',
        level: '10th',
        modules: [],
        completion: 45,
        enrolledDate: '2024-01-15',
      },
      {
        id: 'chemistry-11',
        title: 'Chemistry - 11th Grade',
        description: 'Introduction to organic and inorganic chemistry for intermediate.',
        thumbnail: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=400&h=225&fit=crop',
        instructor: 'Dr. Fatima Shah',
        duration: '40 weeks',
        category: 'Intermediate',
        level: '11th',
        modules: [],
        completion: 30,
        enrolledDate: '2024-02-01',
      },
      {
        id: 'biology-12',
        title: 'Biology - 12th Grade',
        description: 'Advanced biology covering genetics, evolution, and human physiology.',
        thumbnail: 'https://images.unsplash.com/photo-1530021232320-687d8e3dba5f?w=400&h=225&fit=crop',
        instructor: 'Prof. Bilal Hassan',
        duration: '38 weeks',
        category: 'Intermediate',
        level: '12th',
        modules: [],
        completion: 20,
        enrolledDate: '2024-02-01',
      },
    ];
    localStorage.setItem('lms_courses', JSON.stringify(courses));
  }

  // Initialize modules if not exists
  if (!localStorage.getItem('lms_modules')) {
    const modules: Module[] = [
      // Math modules
      {
        id: 'math-mod-1',
        courseId: 'math-10',
        title: 'Algebra Basics',
        description: 'Introduction to algebraic expressions and equations',
        order: 1,
        duration: '4 hours',
        materials: [
          { id: '1', title: 'Algebra Introduction PDF', type: 'pdf', url: '#', duration: '45 min' },
          { id: '2', title: 'Solving Equations Video', type: 'video', url: '#', duration: '30 min' },
        ],
        quiz: {
          id: 'math-quiz-1',
          title: 'Algebra Quiz',
          description: 'Test your understanding of basic algebra',
          totalQuestions: 10,
          passingScore: 70,
          timeLimit: 30,
          attempts: 3,
          questions: [],
          completed: true,
          score: 85,
          attemptDate: '2024-03-15',
        },
        assignment: {
          id: 'math-assign-1',
          title: 'Algebraic Expressions',
          description: 'Solve the given algebraic expressions',
          dueDate: '2024-04-01',
          maxScore: 100,
          submitted: true,
          submissionDate: '2024-03-28',
          score: 92,
          fileUrl: '#',
        },
        completed: true,
        completedDate: '2024-03-15',
      },
      // Add more modules as needed
    ];
    localStorage.setItem('lms_modules', JSON.stringify(modules));
  }

  // Initialize study sessions if not exists
  if (!localStorage.getItem('lms_study_sessions')) {
    const sessions: StudySession[] = [
      {
        id: '1',
        courseId: 'math-10',
        moduleId: 'math-mod-1',
        date: '2024-03-15',
        duration: 120,
        notes: 'Focused on quadratic equations',
      },
    ];
    localStorage.setItem('lms_study_sessions', JSON.stringify(sessions));
  }

  // Initialize assignments if not exists
  if (!localStorage.getItem('lms_assignments')) {
    const assignments: Assignment[] = [];
    localStorage.setItem('lms_assignments', JSON.stringify(assignments));
  }

  // Initialize quizzes if not exists
  if (!localStorage.getItem('lms_quizzes')) {
    const quizzes: Quiz[] = [];
    localStorage.setItem('lms_quizzes', JSON.stringify(quizzes));
  }
};

export const getCourses = (): Course[] => {
  if (typeof window === 'undefined') return [];
  const courses = localStorage.getItem('lms_courses');
  return courses ? JSON.parse(courses) : [];
};

export const getModulesByCourse = (courseId: string): Module[] => {
  if (typeof window === 'undefined') return [];
  const modules = localStorage.getItem('lms_modules');
  const allModules = modules ? JSON.parse(modules) : [];
  return allModules.filter((module: Module) => module.courseId === courseId);
};

export const getUserProfile = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  const profile = localStorage.getItem('lms_user_profile');
  return profile ? JSON.parse(profile) : null;
};

export const updateModuleCompletion = (moduleId: string, completed: boolean) => {
  if (typeof window === 'undefined') return;
  const modules = localStorage.getItem('lms_modules');
  if (modules) {
    const allModules: Module[] = JSON.parse(modules);
    const updatedModules = allModules.map(module => 
      module.id === moduleId ? { 
        ...module, 
        completed, 
        completedDate: completed ? new Date().toISOString().split('T')[0] : undefined 
      } : module
    );
    localStorage.setItem('lms_modules', JSON.stringify(updatedModules));
  }
};

export const addStudySession = (session: Omit<StudySession, 'id'>) => {
  if (typeof window === 'undefined') return;
  const sessions = localStorage.getItem('lms_study_sessions');
  const allSessions: StudySession[] = sessions ? JSON.parse(sessions) : [];
  const newSession: StudySession = {
    ...session,
    id: Date.now().toString(),
  };
  allSessions.push(newSession);
  localStorage.setItem('lms_study_sessions', JSON.stringify(allSessions));
  return newSession;
};

export const getStudySessions = (): StudySession[] => {
  if (typeof window === 'undefined') return [];
  const sessions = localStorage.getItem('lms_study_sessions');
  return sessions ? JSON.parse(sessions) : [];
};