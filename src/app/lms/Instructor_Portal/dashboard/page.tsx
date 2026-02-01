// app/lms/Instructor_Portal/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Users, 
  FileText, 
  
  Calendar,
  ArrowRight,
  CheckCircle,
  MessageSquare,

  Star,
  Award,
  
  Upload,
  FileCheck,

  HelpCircle,
 
} from 'lucide-react';
import Link from 'next/link';
/* eslint-disable */

// Types
interface Course {
  id: string;
  name: string;
  code?: string;
  students?: number;
}

interface InstructorData {
  name?: string;
  email?: string;
  rating?: number;
  students?: number;
  assignedCourses?: Course[];
  assignedCourseIds?: string[];
  isDemoAccount?: boolean;
  role?: string;
  id?: string;
  instructorId?: string;
}

interface Stats {
  totalCourses: number;
  totalStudents: number;
  averageRating: number;
  completionRate: number;
  pendingAssignments: number;
}

interface QuickAction {
  label: string;
  description: string;
  color: string;
  iconColor: string;
  icon: any;
  href: string;
  isActive?: boolean; 
}

export default function DashboardPage() {
  const [instructorData, setInstructorData] = useState<InstructorData | null>(null);
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    totalStudents: 0,
    averageRating: 0,
    completionRate: 0,
    pendingAssignments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructorData = () => {
      try {
        // Get current logged in instructor
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        const allInstructors = JSON.parse(localStorage.getItem('instructors') || '[]');
        const allCourses = JSON.parse(localStorage.getItem('courses') || '[]');
        const allStudents = JSON.parse(localStorage.getItem('students') || '[]');
        const allAssignments = JSON.parse(localStorage.getItem('assignments') || '[]');
        
        let instructorDetails: InstructorData | null = null;
        
        if (currentUser?.email === 'instructor@gmail.com') {
          // Demo instructor
          instructorDetails = {
            name: 'Demo Instructor',
            email: 'instructor@gmail.com',
            rating: 4.5,
            students: 0,
            assignedCourses: [],
            isDemoAccount: true
          };
        } else if (currentUser?.role === 'instructor') {
          // Real instructor
          instructorDetails = allInstructors.find((instr: InstructorData) => 
            instr.email === currentUser.email || 
            instr.id === currentUser.instructorId
          ) || currentUser;
        }

        // Get assigned courses
        let coursesList: Course[] = [];
        if (instructorDetails?.assignedCourses) {
          coursesList = instructorDetails.assignedCourses;
        } else if (instructorDetails?.assignedCourseIds) {
          coursesList = instructorDetails.assignedCourseIds.map((courseId: string) => {
            const course = allCourses.find((c: any) => c.id === courseId);
            return course ? {
              id: course.id,
              name: course.title || course.name,
              code: course.code,
              students: allStudents.filter((s: any) => 
                s.courseId === courseId || s.enrolledCourses?.includes(courseId)
              ).length
            } : null;
          }).filter(Boolean) as Course[];
        }

        // Get pending assignments count
        const pendingAssignments = allAssignments.filter((assignment: any) => {
          const submissions = assignment.submissions || [];
          return submissions.some((sub: any) => sub.status === 'submitted' || sub.status === 'late');
        }).length;

        // Calculate stats
        const totalCourses = coursesList.length;
        const totalStudents = instructorDetails?.students || coursesList.reduce((sum: number, course: Course) => sum + (course.students || 0), 0);
        const averageRating = instructorDetails?.rating || 0;

        setInstructorData(instructorDetails);
        setAssignedCourses(coursesList);
        setStats({
          totalCourses,
          totalStudents,
          averageRating,
          completionRate: 85, // Default value
          pendingAssignments
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorData();
  }, []);

  const quickActions: QuickAction[] = [
    { 
      label: 'Create Assignment', 
      description: 'Set up new assignments',
      color: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
      iconColor: 'text-blue-600',
      icon: FileText,
      href: '/lms/Instructor_Portal/assignments/create'
    },
    { 
      label: 'Upload Materials', 
      description: 'Share course resources',
      color: 'border-green-200 bg-green-50 hover:bg-green-100',
      iconColor: 'text-green-600',
      icon: Upload,
      href: '/lms/Instructor_Portal/materials/add'
    },
    { 
      label: 'Grade Submissions', 
      description: 'Review student work',
      color: 'border-purple-200 bg-purple-50 hover:bg-purple-100',
      iconColor: 'text-purple-600',
      icon: FileCheck,
      href: '/lms/Instructor_Portal/assignments'
    },
    { 
      label: 'View Students', 
      description: 'Manage enrolled students',
      color: 'border-amber-200 bg-amber-50 hover:bg-amber-100',
      iconColor: 'text-amber-600',
      icon: Users,
      href: '/lms/Instructor_Portal/students'
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
              <p className="text-gray-600">
                {getGreeting()}, {instructorData?.name?.split(' ')[0] || 'Instructor'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
  {/* Courses Card */}
  <div className="bg-white rounded-xl p-5 border border-gray-200">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">Courses</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.totalCourses}</p>
      </div>
      <div className="p-3 bg-blue-50 rounded-full">
        <BookOpen className="w-6 h-6 text-blue-600" />
      </div>
    </div>
  </div>

  {/* Students Card */}
  <div className="bg-white rounded-xl p-5 border border-gray-200">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">Students</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
      </div>
      <div className="p-3 bg-green-50 rounded-full">
        <Users className="w-6 h-6 text-green-600" />
      </div>
    </div>
  </div>

  {/* Pending Assignments Card */}
  <div className="bg-white rounded-xl p-5 border border-gray-200">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">Pending</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.pendingAssignments}</p>
      </div>
      <div className="p-3 bg-yellow-50 rounded-full">
        <FileCheck className="w-6 h-6 text-yellow-600" />
      </div>
    </div>
  </div>

  {/* Rating Card */}
  <div className="bg-white rounded-xl p-5 border border-gray-200">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">Rating</p>
        <div className="flex items-center mt-1 gap-2">
          <p className="text-2xl font-semibold text-gray-900">{stats.averageRating.toFixed(1)}</p>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(stats.averageRating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="p-3 bg-purple-50 rounded-full">
        <Star className="w-6 h-6 text-purple-600" />
      </div>
    </div>
  </div>
</div>


        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Courses & Actions */}
         <div className="lg:col-span-2 space-y-6">
  {/* Quick Actions */}
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
    <div className="grid grid-cols-2 gap-4">
      {quickActions.map((action, index) => (
        <Link
          key={index}
          href={action.href}
          className={`group flex flex-col p-4 rounded-lg border ${
            action.isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`p-2 rounded-lg ${
                action.isActive ? 'bg-blue-100 border-blue-300' : 'bg-gray-50 border-gray-200'
              } border flex items-center justify-center`}
            >
              <action.icon className={`w-5 h-5 ${action.iconColor}`} />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-gray-600 transition-colors" />
          </div>
          <h3 className="font-medium text-gray-900 mb-1">{action.label}</h3>
          <p className="text-sm text-gray-500">{action.description}</p>
        </Link>
      ))}
    </div>
  </div>

  {/* Assigned Courses */}
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Your Courses</h2>
        <p className="text-gray-500 text-sm">Courses you are teaching</p>
      </div>
     
    </div>
    
    <div className="divide-y divide-gray-100">
      {assignedCourses.length > 0 ? (
        assignedCourses.map((course, index) => (
          <Link
            key={index}
            href={`/lms/Instructor_Portal/courses/${course.id}`}
            className="flex justify-between items-center p-4 rounded-lg group hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{course.name}</h3>
                <p className="text-sm text-gray-500">{course.code || 'No code'}</p>
              </div>
            </div>
           
          </Link>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">No courses assigned</h3>
          <p>Contact your administrator</p>
        </div>
      )}
    </div>
  </div>
</div>


          {/* Right Column - Stats & Info */}
          <div className="space-y-6">
            {/* Today's Schedule */}
           <div className="bg-white border border-gray-200 rounded-xl p-6">
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg font-semibold text-gray-900">Today</h2>
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Calendar className="w-4 h-4" />
      {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
    </div>
  </div>

  {/* Simple List */}
  <ul className="space-y-3">
    {/* Event Item */}
    <li className="flex items-start gap-3">
      <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
      <div>
        <p className="font-medium text-gray-900">Class at 10:00 AM</p>
        <p className="text-sm text-gray-600">Data Structures</p>
      </div>
    </li>

    <li className="flex items-start gap-3">
      <span className="mt-1 w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
      <div>
        <p className="font-medium text-gray-900">Deadline Today</p>
        <p className="text-sm text-gray-600">Assignment 3 submission</p>
      </div>
    </li>

    <li className="flex items-start gap-3">
      <span className="mt-1 w-2 h-2 rounded-full bg-purple-500 flex-shrink-0"></span>
      <div>
        <p className="font-medium text-gray-900">Student Meeting</p>
        <p className="text-sm text-gray-600">2:30 PM - Office hours</p>
      </div>
    </li>
  </ul>
</div>


            {/* Recent Activity */}
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-300">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Upload className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Uploaded material</p>
                    <p className="text-xs text-gray-600">Lecture 4 slides • 2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pb-4 border-b border-gray-300">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Graded assignments</p>
                    <p className="text-xs text-gray-600">15 submissions • 5 hours ago</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Student feedback</p>
                    <p className="text-xs text-gray-600">John Doe • Yesterday</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Performance</h2>
                <Award className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Course completion</span>
                    <span className="font-medium text-gray-900">{stats.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-green-600 h-1.5 rounded-full" 
                      style={{ width: `${stats.completionRate}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Student engagement</span>
                    <span className="font-medium text-gray-900">94%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full" 
                      style={{ width: '94%' }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Response time</span>
                    <span className="font-medium text-gray-900">2.4 hours</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-purple-600 h-1.5 rounded-full" 
                      style={{ width: '85%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Account Notice */}
        {instructorData?.isDemoAccount && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Demo Account</h3>
                <p className="text-sm text-gray-600">
                  You are using a demo account with limited access. Contact your administrator for full access.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}