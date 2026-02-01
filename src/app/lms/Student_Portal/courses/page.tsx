// app/lms/Student_Portal/courses/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, User, ChevronRight, Search } from 'lucide-react';
/* eslint-disable */

interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  instructorId: string;
  instructorName: string;
  progress: number;
  totalModules: number;
  completedModules: number;
  color: string;
  category: string;
  level: string;
  duration: string;
  fee: string;
  credits: number;
  awardingBody: string;
  enrollmentDate: string;
  status: 'active' | 'draft' | 'archived';
}

interface Instructor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  qualification: string;
  rating: number;
  experience: string;
  status: string;
  students: number;
  bio: string;
  assignedCourseIds: string[];
  assignedCourses: any[];
  createdAt: string;
}

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if student is logged in
    const studentData = localStorage.getItem('currentStudent');
    
    if (!studentData) {
      router.push('/student-login');
      return;
    }

    try {
      const currentStudent = JSON.parse(studentData);
      
      // Get all data from localStorage
      const allCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      console.log('All Courses:', allCourses);
      const allInstructors = JSON.parse(localStorage.getItem('instructors') || '[]');
      
      // Get student's enrolled course from students data
      const allStudents = JSON.parse(localStorage.getItem('students') || '[]');
      const studentDetails = allStudents.find((s: any) => s.id === currentStudent.id);

      let enrolledCourses: Course[] = [];

      if (studentDetails) {
        // Method 1: Check if student has courseId
        if (studentDetails.courseId) {
          const course = allCourses.find((c: any) => c.id === studentDetails.courseId);
          if (course) {
            // Find instructor who teaches this course
            const instructor = allInstructors.find((inst: Instructor) => 
              inst.assignedCourseIds && inst.assignedCourseIds.includes(course.id)
            );
            
            enrolledCourses.push({
              id: course.id,
              title: course.title || course.name || 'Unnamed Course',
              description: course.description || `${course.category || 'General'} Course`,
              image: course.image || 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&w=600',
              instructorId: instructor?.id || '',
              instructorName: instructor?.name || 'Instructor Not Assigned',
              progress: studentDetails.progress?.overall || 0,
              totalModules: course.modules?.length || 10,
              completedModules: studentDetails.progress?.completedModules || 0,
              color: '#6B21A8',
              category: course.category || studentDetails.category || 'General',
              level: course.level || studentDetails.level || 'Beginner',
              duration: course.duration || '4 hr',
              fee: course.fee ? `₹${course.fee}` : 'Free',
              credits: course.credits || 160,
              awardingBody: course.awardingBody || 'ABC',
              enrollmentDate: studentDetails.registrationDate || new Date().toISOString(),
              status: course.status || 'active'
            });
          }
        }
        
        // Method 2: If no courseId, check courseName
        if (enrolledCourses.length === 0 && studentDetails.courseName) {
          const course = allCourses.find((c: any) => 
            c.title?.toLowerCase() === studentDetails.courseName.toLowerCase() ||
            c.name?.toLowerCase() === studentDetails.courseName.toLowerCase()
          );
          
          if (course) {
            // Find instructor who teaches this course
            const instructor = allInstructors.find((inst: Instructor) => 
              inst.assignedCourseIds && inst.assignedCourseIds.includes(course.id)
            );
            
            enrolledCourses.push({
              id: course.id,
              title: course.title || course.name || studentDetails.courseName,
              description: course.description || `${studentDetails.category || 'General'} Course`,
              image: course.image || 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&w=600',
              instructorId: instructor?.id || '',
              instructorName: instructor?.name || 'Instructor Not Assigned',
              progress: studentDetails.progress?.overall || 0,
              totalModules: course.modules?.length || 10,
              completedModules: studentDetails.progress?.completedModules || 0,
              color: '#6B21A8',
              category: course.category || studentDetails.category || 'General',
              level: course.level || studentDetails.level || 'Beginner',
              duration: course.duration || '4 hr',
              fee: course.fee ? `₹${course.fee}` : 'Free',
              credits: course.credits || 160,
              awardingBody: course.awardingBody || 'ABC',
              enrollmentDate: studentDetails.registrationDate || new Date().toISOString(),
              status: course.status || 'active'
            });
          }
        }
        
        // Method 3: If still no course, use demo data
        if (enrolledCourses.length === 0) {
          // Find any course that has an instructor assigned
          const courseWithInstructor = allCourses.find((course: any) => {
            return allInstructors.some((inst: Instructor) => 
              inst.assignedCourseIds && inst.assignedCourseIds.includes(course.id)
            );
          });

          if (courseWithInstructor) {
            const instructor = allInstructors.find((inst: Instructor) => 
              inst.assignedCourseIds && inst.assignedCourseIds.includes(courseWithInstructor.id)
            );

            enrolledCourses.push({
              id: courseWithInstructor.id,
              title: courseWithInstructor.title || courseWithInstructor.name || studentDetails.course || 'testing',
              description: courseWithInstructor.description || 'Comprehensive program covering software engineering, algorithms, AI, and system design. Prepares students for careers in technology and innovation.',
              image: courseWithInstructor.image || 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&w=600',
              instructorId: instructor?.id || '',
              instructorName: instructor?.name || 'Instructor Not Assigned',
              progress: studentDetails.progress?.overall || 0,
              totalModules: courseWithInstructor.modules?.length || 10,
              completedModules: studentDetails.progress?.completedModules || 0,
              color: '#6B21A8',
              category: courseWithInstructor.category || studentDetails.category || 'Programming',
              level: courseWithInstructor.level || studentDetails.level || 'Beginner',
              duration: courseWithInstructor.duration || '4 hr',
              fee: courseWithInstructor.fee ? `₹${courseWithInstructor.fee}` : '₹2000',
              credits: courseWithInstructor.credits || 160,
              awardingBody: courseWithInstructor.awardingBody || 'ABC',
              enrollmentDate: studentDetails.registrationDate || new Date().toISOString(),
              status: courseWithInstructor.status || 'active'
            });
          } else {
            // If no courses with instructors, create a demo course
            const yourInstructor = allInstructors.find((inst: Instructor) => 
              inst.name === 'Tauheed khan'
            );

            enrolledCourses.push({
              id: 'demo_course',
              title: studentDetails.course || 'testing',
              description: 'Comprehensive program covering software engineering, algorithms, AI, and system design. Prepares students for careers in technology and innovation.',
              image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&w=600',
              instructorId: yourInstructor?.id || '',
              instructorName: yourInstructor?.name || 'Tauheed Khan',
              progress: studentDetails.progress?.overall || 0,
              totalModules: 10,
              completedModules: studentDetails.progress?.completedModules || 0,
              color: '#6B21A8',
              category: studentDetails.category || 'Programming',
              level: studentDetails.level || 'Beginner',
              duration: '4 hr',
              fee: '₹2000',
              credits: 160,
              awardingBody: 'ABC',
              enrollmentDate: studentDetails.registrationDate || new Date().toISOString(),
              status: 'active'
            });
          }
        }
      }

      setCourses(enrolledCourses);
      setFilteredCourses(enrolledCourses);
      
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Filter courses based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCourses(courses);
      return;
    }

    const filtered = courses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructorName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredCourses(filtered);
  }, [searchTerm, courses]);

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Not specified';
      return new Date(dateString).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Not specified';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            My Courses
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            See all your enrolled courses
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      </div>

      {/* Course Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">{filteredCourses.length}</span> course{filteredCourses.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-purple-300 transition-colors"
            >
              {/* Course Image */}
              <div className="w-full h-48 bg-gray-100 overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    course.status === 'active' ? 'bg-green-100 text-green-700' : 
                    course.status === 'draft' ? 'bg-gray-100 text-gray-500' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {course.status}
                  </span>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-5">
                {/* Title & Progress */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{course.title}</h3>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Progress</div>
                    <div className="text-lg font-bold text-purple-700">{course.progress}%</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

              

                {/* Course Info Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 mb-5">
                  <div>
                    <div className="text-gray-500">Instructor</div>
                    <div className="font-medium truncate">{course.instructorName}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Category</div>
                    <div className="font-medium">{course.category}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Level</div>
                    <div className="font-medium">{course.level}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Credits</div>
                    <div className="font-medium">{course.credits}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Duration</div>
                    <div className="font-medium">{course.duration}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Fee</div>
                    <div className="font-medium">{course.fee}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-gray-500">Awarding Body</div>
                    <div className="font-medium">{course.awardingBody}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                 
                  <button
                    onClick={() => router.push(`/lms/Student_Portal/materials`)}
                    className="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Materials
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600 text-sm mb-4">Try adjusting your search</p>
          <button
            onClick={() => setSearchTerm('')}
            className="px-4 py-2 text-purple-600 hover:text-purple-700 font-medium text-sm"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}