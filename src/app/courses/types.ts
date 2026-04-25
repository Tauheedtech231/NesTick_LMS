/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  students: string;
  level: string;
  highlights: string[];
  price: string;
  originalPrice?: string | null;
  savings?: string | null;
  icon: any;
  color: string | null;
  image: string | null;
  courseImage?: string | null;
  featured: boolean;
  rating: number;
  reviews: number;
  isPublished: boolean;
  instructorId: string;
  instructorName: string;
  createdAt: string;
  numericPrice?: number;
}

export interface Bundle {
  id: string;
  title: string;
  description: string;
  discount_percentage: number;
  discounted_price: number;
  original_price: number;
  total_courses: number;
  status: 'active' | 'inactive';
  courses?: Course[];
}
