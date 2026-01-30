// app/lms/Student_Portal/dashboard/page.tsx - Complete updated file
'use client'

import { useEffect, useState } from 'react'
import { BookOpen, CheckCircle, Clock, Target, TrendingUp } from 'lucide-react'
import StatsCard from './components/StatsCard'
import ProgressBar from './components/ProgressBar'
import CourseCard from './components/CourseCard'

// Direct type definitions matching CourseCard
interface Course {
  id: string;
  title: string;
  description: string;
  teacher: string;
  instructor?: string;
  progress: number;
  completion?: number;
  totalModules: number;
  completedModules: number;
  color: string;
  category?: 'Matric' | 'Intermediate';
  level?: string;
  duration?: string;
  thumbnail?: string;
}

interface DashboardStats {
  totalCourses: number;
  completedModules: number;
  pendingTasks: number;
  totalStudyHours: number;
  overallProgress: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  level: 'Matric' | 'Intermediate';
  totalStudyHours: number;
}

const initialData = {
  student: {
    id: "STU001",
    name: "Ali Ahmed",
    email: "ali.ahmed@student.com",
    level: "Intermediate" as 'Matric' | 'Intermediate',
    totalStudyHours: 156
  },
  
  courses: [
    {
      id: "MATH101",
      title: "Mathematics",
      description: "Advanced Algebra and Calculus",
      teacher: "Dr. Saima Khan",
      progress: 75,
      totalModules: 8,
      completedModules: 6,
      color: "#6B21A8",
      category: "Intermediate" as 'Matric' | 'Intermediate',
      level: "12th Grade",
      duration: "16 weeks"
    },
    {
      id: "PHY101",
      title: "Physics",
      description: "Mechanics and Thermodynamics",
      teacher: "Prof. Ahmed Raza",
      progress: 60,
      totalModules: 10,
      completedModules: 6,
      color: "#F59E0B",
      category: "Intermediate" as 'Matric' | 'Intermediate',
      level: "12th Grade",
      duration: "20 weeks"
    },
    {
      id: "CHEM101",
      title: "Chemistry",
      description: "Organic and Inorganic Chemistry",
      teacher: "Dr. Fatima Shah",
      progress: 45,
      totalModules: 12,
      completedModules: 5,
      color: "#10B981",
      category: "Intermediate" as 'Matric' | 'Intermediate',
      level: "12th Grade",
      duration: "24 weeks"
    },
    {
      id: "ENG101",
      title: "English",
      description: "Literature and Composition",
      teacher: "Ms. Sara Malik",
      progress: 90,
      totalModules: 6,
      completedModules: 5,
      color: "#EF4444",
      category: "Intermediate" as 'Matric' | 'Intermediate',
      level: "12th Grade",
      duration: "12 weeks"
    },
    {
      id: "CS101",
      title: "Computer Science",
      description: "Programming Fundamentals",
      teacher: "Mr. Usman Ali",
      progress: 30,
      totalModules: 10,
      completedModules: 3,
      color: "#3B82F6",
      category: "Intermediate" as 'Matric' | 'Intermediate',
      level: "12th Grade",
      duration: "20 weeks"
    }
  ]
}

export default function DashboardPage() {
  const [student, setStudent] = useState<Student>(initialData.student)
  const [courses, setCourses] = useState<Course[]>(initialData.courses)
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    completedModules: 0,
    pendingTasks: 0,
    totalStudyHours: 0,
    overallProgress: 0
  })

  useEffect(() => {
    // Load data from localStorage or use initial data
    const savedData = localStorage.getItem('studentPortalData')
    if (savedData) {
      const parsedData = JSON.parse(savedData)
      setStudent(parsedData.student)
      setCourses(parsedData.courses)
    } else {
      // Save initial data to localStorage
      localStorage.setItem('studentPortalData', JSON.stringify(initialData))
    }

    // Calculate stats
    const totalCourses = initialData.courses.length
    const completedModules = initialData.courses.reduce((sum, course) => sum + course.completedModules, 0)
    const totalModules = initialData.courses.reduce((sum, course) => sum + course.totalModules, 0)
    const pendingTasks = initialData.courses.reduce((sum, course) => sum + (course.totalModules - course.completedModules), 0)
    const overallProgress = Math.round((completedModules / totalModules) * 100)

    setStats({
      totalCourses,
      completedModules,
      pendingTasks,
      totalStudyHours: student.totalStudyHours,
      overallProgress
    })
  }, [])

  // Prepare courses for CourseCard
  const preparedCourses = courses.map(course => ({
    ...course,
    instructor: course.teacher,
    completion: course.progress,
    thumbnail: `https://images.unsplash.com/photo-${course.id === 'MATH101' ? '1635070041078' : 
      course.id === 'PHY101' ? '1532094349884' : 
      course.id === 'CHEM101' ? '1603126857599' :
      course.id === 'ENG101' ? '1524990775538' :
      '1555066931'}-e363dbe005cb?w=400&h=225&fit=crop`
  }))

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {student.name}! 👋</h1>
            <p className="text-purple-200 mt-2">
              {student.level} Level Student • {courses.length} Enrolled Courses
            </p>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-purple-200">Student ID</p>
            <p className="text-xl font-bold">{student.id}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Courses"
          value={stats.totalCourses}
          icon={BookOpen}
          color="purple"
          change="+2 this semester"
        />
        <StatsCard
          title="Completed Modules"
          value={`${stats.completedModules}`}
          icon={CheckCircle}
          color="emerald"
          change={`${stats.overallProgress}% overall`}
        />
        <StatsCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          icon={Target}
          color="amber"
          change="Assignments & Quizzes"
        />
        <StatsCard
          title="Study Hours"
          value={`${student.totalStudyHours}h`}
          icon={Clock}
          color="red"
          change="This semester"
        />
      </div>

      {/* Overall Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Overall Progress</h2>
            <p className="text-gray-600 mt-1">Across all enrolled courses</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-700">{stats.overallProgress}%</div>
            <div className="text-sm text-gray-500">Completion Rate</div>
          </div>
        </div>
        <ProgressBar progress={stats.overallProgress} height={12} showLabel />
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span>0%</span>
          <span className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            {stats.completedModules} modules completed
          </span>
          <span>100%</span>
        </div>
      </div>

      {/* Courses Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Courses</h2>
          <a 
            href="/lms/Student_Portal/courses" 
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            View All Courses
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {preparedCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {courses.slice(0, 3).map((course) => (
            <div key={course.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-purple-300 flex items-center justify-center text-white font-bold">
                  {course.title.charAt(0)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{course.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Completed {course.completedModules} of {course.totalModules} modules
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-700">{course.progress}%</div>
                <div className="text-sm text-gray-500">Progress</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}