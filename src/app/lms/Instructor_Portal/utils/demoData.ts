// app/lms/Instructor_Portal/utils/demoData.ts
interface Course {
  id: string;
  title: string;
  description: string;
  category: 'Matric' | 'Intermediate';
  level: string;
  studentCount: number;
  completionRate: number;
  modulesCount: number;
  thumbnail: string;
  instructor: string;
  createdDate: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  avatar: string;
  enrolledCourses: string[];
  overallProgress: number;
  assignmentsSubmitted: number;
  assignmentsPending: number;
  lastActive: string;
}

interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  totalStudents: number;
  submitted: number;
  graded: number;
  averageScore: number;
}

interface Material {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'slides' | 'document';
  course: string;
  module: string;
  uploadDate: string;
  size: string;
  downloads: number;
}

interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  assignmentId: string;
  courseId: string;
  fileName: string;
  submittedDate: string;
  status: 'submitted' | 'graded' | 'late';
  score?: number;
  maxScore: number;
  feedback?: string;
}

export const initializeDemoData = () => {
  if (typeof window === 'undefined') return;

  // Initialize courses
  if (!localStorage.getItem('instructor_courses')) {
    const courses: Course[] = [
      {
        id: 'math-10',
        title: 'Mathematics - 10th Grade',
        description: 'Complete course covering algebra, geometry, and trigonometry for matric students.',
        category: 'Matric',
        level: '10th Grade',
        studentCount: 45,
        completionRate: 78,
        modulesCount: 12,
        thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb',
        instructor: 'Dr. Sarah Khan',
        createdDate: '2024-01-15',
      },
      {
        id: 'physics-10',
        title: 'Physics - 10th Grade',
        description: 'Fundamental concepts of mechanics, heat, and waves with practical applications.',
        category: 'Matric',
        level: '10th Grade',
        studentCount: 38,
        completionRate: 65,
        modulesCount: 10,
        thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d',
        instructor: 'Dr. Sarah Khan',
        createdDate: '2024-01-15',
      },
      {
        id: 'chemistry-11',
        title: 'Chemistry - 11th Grade',
        description: 'Introduction to organic and inorganic chemistry for intermediate students.',
        category: 'Intermediate',
        level: '11th Grade',
        studentCount: 32,
        completionRate: 42,
        modulesCount: 14,
        thumbnail: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6',
        instructor: 'Dr. Sarah Khan',
        createdDate: '2024-02-01',
      },
      {
        id: 'biology-12',
        title: 'Biology - 12th Grade',
        description: 'Advanced biology covering genetics, evolution, and human physiology.',
        category: 'Intermediate',
        level: '12th Grade',
        studentCount: 28,
        completionRate: 35,
        modulesCount: 16,
        thumbnail: 'https://images.unsplash.com/photo-1530021232320-687d8e3dba5f',
        instructor: 'Dr. Sarah Khan',
        createdDate: '2024-02-01',
      },
    ];
    localStorage.setItem('instructor_courses', JSON.stringify(courses));
  }

  // Initialize students
  if (!localStorage.getItem('instructor_students')) {
    const students: Student[] = [
      {
        id: '1',
        name: 'Ali Ahmed',
        email: 'ali.ahmed@student.edu.pk',
        studentId: 'STU2024001',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ali',
        enrolledCourses: ['math-10', 'physics-10'],
        overallProgress: 85,
        assignmentsSubmitted: 8,
        assignmentsPending: 2,
        lastActive: '2024-03-20',
      },
      {
        id: '2',
        name: 'Fatima Khan',
        email: 'fatima.khan@student.edu.pk',
        studentId: 'STU2024002',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima',
        enrolledCourses: ['math-10', 'chemistry-11'],
        overallProgress: 72,
        assignmentsSubmitted: 7,
        assignmentsPending: 3,
        lastActive: '2024-03-19',
      },
      {
        id: '3',
        name: 'Bilal Hassan',
        email: 'bilal.hassan@student.edu.pk',
        studentId: 'STU2024003',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bilal',
        enrolledCourses: ['physics-10', 'biology-12'],
        overallProgress: 68,
        assignmentsSubmitted: 6,
        assignmentsPending: 4,
        lastActive: '2024-03-18',
      },
      {
        id: '4',
        name: 'Sara Raza',
        email: 'sara.raza@student.edu.pk',
        studentId: 'STU2024004',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara',
        enrolledCourses: ['chemistry-11', 'biology-12'],
        overallProgress: 55,
        assignmentsSubmitted: 5,
        assignmentsPending: 5,
        lastActive: '2024-03-17',
      },
    ];
    localStorage.setItem('instructor_students', JSON.stringify(students));
  }

  // Initialize assignments
  if (!localStorage.getItem('instructor_assignments')) {
    const assignments: Assignment[] = [
      {
        id: '1',
        title: 'Algebra Basics Assignment',
        course: 'Mathematics - 10th Grade',
        dueDate: '2024-04-01',
        totalStudents: 45,
        submitted: 38,
        graded: 32,
        averageScore: 82,
      },
      {
        id: '2',
        title: 'Newton\'s Laws Lab Report',
        course: 'Physics - 10th Grade',
        dueDate: '2024-04-05',
        totalStudents: 38,
        submitted: 28,
        graded: 20,
        averageScore: 75,
      },
      {
        id: '3',
        title: 'Periodic Table Quiz',
        course: 'Chemistry - 11th Grade',
        dueDate: '2024-04-03',
        totalStudents: 32,
        submitted: 25,
        graded: 18,
        averageScore: 68,
      },
      {
        id: '4',
        title: 'Genetics Research Paper',
        course: 'Biology - 12th Grade',
        dueDate: '2024-04-10',
        totalStudents: 28,
        submitted: 15,
        graded: 10,
        averageScore: 72,
      },
    ];
    localStorage.setItem('instructor_assignments', JSON.stringify(assignments));
  }

  // Initialize materials
  if (!localStorage.getItem('instructor_materials')) {
    const materials: Material[] = [
      {
        id: '1',
        title: 'Algebra Introduction PDF',
        type: 'pdf',
        course: 'Mathematics - 10th Grade',
        module: 'Module 1: Algebra Basics',
        uploadDate: '2024-03-15',
        size: '2.4 MB',
        downloads: 125,
      },
      {
        id: '2',
        title: 'Mechanics Video Lecture',
        type: 'video',
        course: 'Physics - 10th Grade',
        module: 'Module 2: Newton\'s Laws',
        uploadDate: '2024-03-10',
        size: '45.2 MB',
        downloads: 98,
      },
      {
        id: '3',
        title: 'Organic Chemistry Slides',
        type: 'slides',
        course: 'Chemistry - 11th Grade',
        module: 'Module 3: Organic Compounds',
        uploadDate: '2024-03-05',
        size: '8.7 MB',
        downloads: 76,
      },
      {
        id: '4',
        title: 'Genetics Study Guide',
        type: 'document',
        course: 'Biology - 12th Grade',
        module: 'Module 4: Genetic Inheritance',
        uploadDate: '2024-03-01',
        size: '3.2 MB',
        downloads: 64,
      },
    ];
    localStorage.setItem('instructor_materials', JSON.stringify(materials));
  }

  // Initialize instructor profile
  if (!localStorage.getItem('instructor_profile')) {
    const profile = {
      id: '1',
      name: 'Dr. Sarah Khan',
      email: 'sarah.khan@instructor.edu.pk',
      avatar: 'SK',
      department: 'Science & Mathematics',
      bio: 'Senior Instructor with 10+ years of experience in teaching Mathematics and Physics. Passionate about innovative teaching methods.',
      phone: '+92 300 1234567',
      joinDate: '2018-08-15',
      notificationPreferences: {
        email: true,
        push: true,
        assignmentSubmissions: true,
        studentQuestions: true,
      },
    };
    localStorage.setItem('instructor_profile', JSON.stringify(profile));
  }
};

export const getCourses = (): Course[] => {
  if (typeof window === 'undefined') return [];
  const courses = localStorage.getItem('instructor_courses');
  return courses ? JSON.parse(courses) : [];
};

export const getStudents = (): Student[] => {
  if (typeof window === 'undefined') return [];
  const students = localStorage.getItem('instructor_students');
  return students ? JSON.parse(students) : [];
};

export const getAssignments = (): Assignment[] => {
  if (typeof window === 'undefined') return [];
  const assignments = localStorage.getItem('instructor_assignments');
  return assignments ? JSON.parse(assignments) : [];
};

export const getMaterials = (): Material[] => {
  if (typeof window === 'undefined') return [];
  const materials = localStorage.getItem('instructor_materials');
  return materials ? JSON.parse(materials) : [];
};

export const getInstructorProfile = () => {
  if (typeof window === 'undefined') return null;
  const profile = localStorage.getItem('instructor_profile');
  return profile ? JSON.parse(profile) : null;
};

export const updateAssignmentGrade = (assignmentId: string, gradedCount: number) => {
  if (typeof window === 'undefined') return;
  const assignments = localStorage.getItem('instructor_assignments');
  if (assignments) {
    const allAssignments: Assignment[] = JSON.parse(assignments);
    const updatedAssignments = allAssignments.map(assignment => 
      assignment.id === assignmentId 
        ? { ...assignment, graded: gradedCount }
        : assignment
    );
    localStorage.setItem('instructor_assignments', JSON.stringify(updatedAssignments));
  }
};