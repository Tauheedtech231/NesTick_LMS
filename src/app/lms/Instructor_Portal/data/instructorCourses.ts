export const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  white: '#FFFFFF',
  lightGrey: '#F4F6F8',
  softGrey: '#E5E7EB',
  darkGrey: '#1F2933',
  charcoal: '#111111',
  teal: '#1FB6CB',
  brightRed: '#D32F2F'
};

export type Course = {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  students: string;
  level: string;
  highlights: string[];
  price: string;
  originalPrice: string;
  savings: string;
  featured: boolean;
  rating: number;
  reviews: number;
  image: string;
  createdAt: string;
  updatedAt: string;
};

export const defaultCourses: Course[] = [
  {
    id: 'pipe-fitter',
    title: 'Pipe Fitter',
    category: 'Technical Training',
    description: 'Master industrial pipe fitting techniques with hands-on training on cutting, threading, and installation following international standards.',
    duration: '8 Weeks',
    students: 'Max 20 per batch',
    level: 'Beginner to Advanced',
    highlights: [
      'Learn pipe cutting, threading, and installation',
      'Blueprint reading and interpretation',
      'Pipe system design and layout',
      'Safety protocols and standards',
      'Hands-on workshop training',
      'Industry certification preparation'
    ],
    price: 'PKR 25,000',
    originalPrice: 'PKR 30,000',
    savings: 'Save PKR 5,000',
    featured: true,
    rating: 4.8,
    reviews: 124,
    image: "https://images.pexels.com/photos/6124242/pexels-photo-6124242.jpeg",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'safety-inspector',
    title: 'Safety Inspector',
    category: 'Safety Training',
    description: 'Professional safety inspection training for construction and industrial environments with OSHA certification preparation.',
    duration: '6 Weeks',
    students: 'Max 15 per batch',
    level: 'Intermediate',
    highlights: [
      'OSHA standards and regulations',
      'Site inspection methodologies',
      'Risk assessment techniques',
      'Safety documentation',
      'Emergency response planning',
      'Certification exam preparation'
    ],
    price: 'PKR 30,000',
    originalPrice: 'PKR 35,000',
    savings: 'Save PKR 5,000',
    featured: true,
    rating: 4.9,
    reviews: 89,
    image: "https://images.pexels.com/photos/34082713/pexels-photo-34082713.jpeg",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'welding',
    title: 'Professional Welding',
    category: 'Technical Training',
    description: 'Comprehensive welding training covering MIG, TIG, and Arc welding techniques for industrial applications.',
    duration: '10 Weeks',
    students: 'Max 12 per batch',
    level: 'Beginner to Professional',
    highlights: [
      'MIG, TIG, and Arc welding techniques',
      'Metal identification and preparation',
      'Weld quality inspection',
      'Safety equipment usage',
      'Industry-standard certification',
      'Portfolio development'
    ],
    price: 'PKR 35,000',
    originalPrice: 'PKR 40,000',
    savings: 'Save PKR 5,000',
    featured: true,
    rating: 4.7,
    reviews: 156,
    image: "https://images.pexels.com/photos/7650512/pexels-photo-7650512.jpeg",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];