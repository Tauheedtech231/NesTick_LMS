'use client'

import { useEffect, useState } from 'react'

import { BookOpen, CheckCircle, Clock, Target } from 'lucide-react'
import StatsCard from '../components/StatsCard';
import ProgressTracker from '../components/ProgressBar';
import CourseCard from '../components/CourseCard';

// Direct type definitions
interface Course {
  id: string;
  title: string;
  description: string;
  teacher: string;
  progress: number;
  totalModules: number;
  completedModules: number;
  color: string;
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
      color: "#6B21A8"
    },
    {
      id: "PHY101",
      title: "Physics",
      description: "Mechanics and Thermodynamics",
      teacher: "Prof. Ahmed Raza",
      progress: 60,
      totalModules: 10,
      completedModules: 6,
      color: "#F59E0B"
    },
    {
      id: "CHEM101",
      title: "Chemistry",
      description: "Organic and Inorganic Chemistry",
      teacher: "Dr. Fatima Shah",
      progress: 45,
      totalModules: 12,
      completedModules: 5,
      color: "#10B981"
    },
    {
      id: "ENG101",
      title: "English",
      description: "Literature and Composition",
      teacher: "Ms. Sara Malik",
      progress: 90,
      totalModules: 6,
      completedModules: 5,
      color: "#EF4444"
    },
    {
      id: "CS101",
      title: "Computer Science",
      description: "Programming Fundamentals",
      teacher: "Mr. Usman Ali",
      progress: 30,
      totalModules: 10,
      completedModules: 3,
      color: "#3B82F6"
    }
  ]
}

export default function HomePage() {
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

  const statsCards = [
    {
      title: "Total Courses",
      value: stats.totalCourses.toString(),
      icon: BookOpen,
      color: "bg-primary",
      change: "+2 this semester"
    },
    {
      title: "Completed Modules",
      value: stats.completedModules.toString(),
      icon: CheckCircle,
      color: "bg-success",
      change: `${stats.overallProgress}% overall`
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks.toString(),
      icon: Target,
      color: "bg-secondary",
      change: "Assignments & Quizzes"
    },
    {
      title: "Study Hours",
      value: `${student.totalStudyHours}h`,
      icon: Clock,
      color: "bg-accent",
      change: "This semester"
    }
  ]

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">
          Welcome back, {student.name}!
        </h1>
        <p className="text-text-secondary mt-2">
          {student.level} Level Student • {courses.length} Enrolled Courses
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Progress Tracker */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Overall Progress
        </h2>
        <ProgressTracker progress={stats.overallProgress} />
        <div className="mt-4 text-sm text-text-secondary">
          {stats.completedModules} out of {stats.totalCourses * 8} modules completed
        </div>
      </div>

      {/* Courses Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Your Courses</h2>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            View All Courses
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {courses.slice(0, 3).map((course) => (
            <div key={course.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-text-primary">{course.title}</p>
                <p className="text-sm text-text-secondary">
                  Completed {course.completedModules} of {course.totalModules} modules
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{course.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}