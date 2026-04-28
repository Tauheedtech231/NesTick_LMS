export type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED';

// Cart Item type - used across all cart-related components
export interface CartItem {
  id: string;
  course_id: string;
  course_title: string;
  course_price: number;
  created_at: string;
  is_bundle_item?: boolean;
  bundle_name?: string;
  bundle_id?: string;
  bundle_original_price?: number;
  bundle_discounted_price?: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g., "6 months"
  totalCredits: number;
  fee: number;
  awardingBody: string;
  entryRequirements: string;
  instructorIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  durationHours: number;
  materials: TeachingMaterial[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TeachingMaterial {
  id: string;
  moduleId: string;
  title: string;
  type: 'PDF' | 'VIDEO' | 'DOCUMENT' | 'PRESENTATION' | 'OTHER';
  url: string;
  uploadedAt: Date;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  enrolledCourses: string[]; // Course IDs
  lastLogin: Date | null;
  totalStudyHours: number;
  createdAt: Date;
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  assignedCourses: string[]; // Course IDs
  createdAt: Date;
}

export interface Payment {
  id: string;
  studentId: string;
  courseId: string;
  amount: number;
  status: PaymentStatus;
  paymentDate: Date | null;
  dueDate: Date;
  transactionId?: string;
  createdAt: Date;
}

export interface Assignment {
  id: string;
  studentId: string;
  courseId: string;
  moduleId: string;
  title: string;
  fileUrl: string;
  submittedAt: Date;
  grade?: number;
  feedback?: string;
  createdAt: Date;
}

export interface Quiz {
  id: string;
  studentId: string;
  courseId: string;
  moduleId: string;
  title: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  completedAt: Date;
  createdAt: Date;
}

export interface StudentModuleProgress {
  studentId: string;
  moduleId: string;
  completed: boolean;
  timeSpent: number; // hours
  lastAccessed: Date;
}