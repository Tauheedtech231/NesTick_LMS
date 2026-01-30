// app/lms/Instructor_Portal/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Users, 
  FileText, 
  TrendingUp,
  Clock,
  Calendar,
  ArrowUpRight,
  Upload,
  CheckCircle,
  MessageSquare
} from 'lucide-react';
import StatsCard from './components/StatsCard';


/* eslint-disable */

import ProgressBar from './components/ProgressBar';
import { getAssignments, getCourses, getStudents } from './utils/demoData';


export default function DashboardPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    pendingAssignments: 0,
    averageCompletion: 0,
  });

  useEffect(() => {
    const loadedCourses = getCourses();
    const loadedAssignments = getAssignments();
    const loadedStudents = getStudents();
    
    setCourses(loadedCourses);
    setAssignments(loadedAssignments.slice(0, 2));
    setStudents(loadedStudents);
    
    // Calculate stats
    const totalCourses = loadedCourses.length;
    const totalStudents = loadedStudents.length;
    const pendingAssignments = loadedAssignments.reduce((sum, assignment) => 
      sum + (assignment.totalStudents - assignment.graded), 0
    );
    const averageCompletion = loadedCourses.length > 0 
      ? Math.round(loadedCourses.reduce((sum, course) => sum + course.completionRate, 0) / loadedCourses.length)
      : 0;

    setStats({
      totalCourses,
      totalStudents,
      pendingAssignments,
      averageCompletion,
    });
  }, []);

  const quickActions = [
    { icon: Upload, label: 'Upload Materials', color: 'primary', href: '/materials' },
    { icon: CheckCircle, label: 'Grade Assignments', color: 'success', href: '/students' },
    { icon: MessageSquare, label: 'Provide Feedback', color: 'success', href: '/students' },
  ];

  const recentActivities = [
    { time: '2 hours ago', action: 'Graded Algebra assignments', course: 'Mathematics', student: '15 students' },
    { time: '4 hours ago', action: 'Updated Physics module', course: 'Physics', student: 'Module 3 materials' },
    { time: '1 day ago', action: 'Added new quiz', course: 'Chemistry', student: 'Periodic Table Quiz' },
    { time: '2 days ago', action: 'Responded to student query', course: 'Biology', student: 'Sara Raza' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, Dr. Sarah Khan. Here's your teaching overview.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#6B21A8] hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
            <Upload className="w-4 h-4" />
            Create New
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Courses"
          value={stats.totalCourses}
          icon={BookOpen}
          color="primary"
          change="+2 this month"
          trend="up"
        />
        <StatsCard
          title="Assigned Students"
          value={stats.totalStudents}
          icon={Users}
          color="secondary"
          change="+8 this month"
          trend="up"
        />
        <StatsCard
          title="Pending Evaluations"
          value={stats.pendingAssignments}
          icon={FileText}
          color="warning"
          change="12 need grading"
          trend="down"
        />
        <StatsCard
          title="Avg Completion"
          value={`${stats.averageCompletion}%`}
          icon={TrendingUp}
          color="success"
          change="+5% this week"
          trend="up"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          <Clock className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <a
              key={index}
              href={`/lms/Instructor_Portal${action.href}`}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-md ${
                action.color === 'primary' ? 'border-[#6B21A8] bg-purple-50 hover:bg-purple-100' :
                action.color === 'secondary' ? 'border-[#F59E0B] bg-amber-50 hover:bg-amber-100' :
                'border-[#10B981] bg-emerald-50 hover:bg-emerald-100'
              }`}
            >
              <div className={`p-3 rounded-lg ${
                action.color === 'primary' ? 'bg-[#6B21A8]' :
                action.color === 'secondary' ? 'bg-[#F59E0B]' :
                'bg-[#10B981]'
              }`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{action.label}</h3>
                <p className="text-sm text-gray-600">Click to get started</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 ml-auto" />
            </a>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Courses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Your Courses</h2>
            <a 
              href="/lms/Instructor_Portal/courses" 
              className="text-[#6B21A8] hover:text-purple-700 font-medium text-sm"
            >
              View All →
            </a>
          </div>
          <div className="space-y-4">
            {courses.slice(0, 3).map((course) => (
              <div key={course.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-purple-300 flex items-center justify-center text-white font-bold">
                    {course.title.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{course.title}</h4>
                    <p className="text-sm text-gray-600">{course.studentCount} students • {course.modulesCount} modules</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#6B21A8]">{course.completionRate}%</div>
                  <ProgressBar progress={course.completionRate} height={4} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Assignments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Pending Assignments</h2>
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              {assignments.filter(a => a.submitted > a.graded).length} Need Grading
            </span>
          </div>
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    assignment.submitted - assignment.graded > 10 ? 'bg-red-100 text-red-800' :
                    assignment.submitted - assignment.graded > 5 ? 'bg-amber-100 text-amber-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {assignment.submitted - assignment.graded} pending
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{assignment.course}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Due: {assignment.dueDate}</span>
                  <span>Avg Score: {assignment.averageScore}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          <button className="text-[#6B21A8] hover:text-purple-700 font-medium text-sm">
            View All Activity
          </button>
        </div>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-[#6B21A8] flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-gray-900">
                  <span className="font-medium">{activity.action}</span> in {activity.course}
                </p>
                <p className="text-sm text-gray-600 mt-1">{activity.student}</p>
              </div>
              <div className="text-sm text-gray-500">{activity.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Overall Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Course Progress Overview</h2>
          <div className="space-y-6">
            {courses.map((course) => (
              <div key={course.id}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-900">{course.title}</span>
                  <span className="font-medium text-[#6B21A8]">{course.completionRate}%</span>
                </div>
                <ProgressBar 
                  progress={course.completionRate} 
                  color={course.completionRate >= 80 ? 'success' : course.completionRate >= 60 ? 'accent' : 'primary'}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{course.studentCount} students enrolled</span>
                  <span>{course.modulesCount} modules</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Students */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top Performing Students</h2>
          <div className="space-y-4">
            {students.slice(0, 4).map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-300 flex items-center justify-center text-white font-bold">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{student.name}</h4>
                    <p className="text-xs text-gray-600">{student.studentId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    student.overallProgress >= 80 ? 'text-[#10B981]' :
                    student.overallProgress >= 60 ? 'text-[#F59E0B]' :
                    'text-[#6B21A8]'
                  }`}>
                    {student.overallProgress}%
                  </div>
                  <div className="text-xs text-gray-500">Progress</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}