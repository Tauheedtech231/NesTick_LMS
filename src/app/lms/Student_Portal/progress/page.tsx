// app/lms/Student_Portal/progress/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, Target, Award, Download,
  BookOpen, CheckCircle, Clock, ArrowUpRight, ArrowDownRight,
  Activity, Users, FileText,
} from 'lucide-react';
/* eslint-disable */

interface CourseProgress {
  courseId: string;
  title: string;
  progress: number;
  totalModules: number;
  completedModules: number;
  assignmentsSubmitted: number;
  assignmentsTotal: number;
  quizzesCompleted: number;
  quizzesTotal: number;
  lastActivity: string;
}

interface StudentProgress {
  overallProgress: number;
  totalStudyHours: number;
  averageQuizScore: number;
  assignmentCompletionRate: number;
  attendanceRate: number;
  streakDays: number;
}

interface ActivityLog {
  id: string;
  type: 'module' | 'assignment' | 'quiz' | 'material';
  title: string;
  courseId: string;
  courseName: string;
  date: string;
  score?: number;
  total?: number;
}

export default function ProgressReportsPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('month');
  const [student, setStudent] = useState<any>(null);
  const [coursesProgress, setCoursesProgress] = useState<CourseProgress[]>([]);
  const [progressData, setProgressData] = useState<StudentProgress>({
    overallProgress: 0,
    totalStudyHours: 0,
    averageQuizScore: 0,
    assignmentCompletionRate: 0,
    attendanceRate: 0,
    streakDays: 0
  });
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
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
      setStudent(currentStudent);

      loadProgressData(currentStudent.id);
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const loadProgressData = (studentId: string) => {
    try {
      // Get student details
      const allStudents = JSON.parse(localStorage.getItem('students') || '[]');
      const studentDetails = allStudents.find((s: any) => s.id === studentId);
      
      // Get enrolled courses
      const allCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      const enrolledCourseIds: string[] = [];
      
      if (studentDetails?.courseId) {
        enrolledCourseIds.push(studentDetails.courseId);
      } else if (studentDetails?.enrolledCourses) {
        enrolledCourseIds.push(...(Array.isArray(studentDetails.enrolledCourses) 
          ? studentDetails.enrolledCourses 
          : [studentDetails.enrolledCourses]));
      }

      const courses: CourseProgress[] = [];
      let totalProgress = 0;
      let totalStudyHours = 0;
      let totalQuizScores = 0;
      let quizCount = 0;
      let completedAssignments = 0;
      let totalAssignments = 0;
      
      // Process each enrolled course
      enrolledCourseIds.forEach(courseId => {
        const course = allCourses.find((c: any) => c.id === courseId);
        if (course) {
          // Calculate course progress
          const progress = studentDetails?.progress?.overall || 0;
          totalProgress += progress;
          
          // Get module data
          const allModules = JSON.parse(localStorage.getItem('courseModules') || '[]');
          const courseModules = allModules.filter((m: any) => m.courseId === courseId);
          const completedModules = courseModules.filter((m: any) => m.completed).length;
          const totalModules = courseModules.length;
          
          // Calculate study hours (1.5 hours per completed module)
          const studyHours = completedModules * 1.5;
          totalStudyHours += studyHours;
          
          // Get assignment data
          const allAssignments = JSON.parse(localStorage.getItem('assignments') || '[]');
          const courseAssignments = allAssignments.filter((a: any) => 
            a.courseId === courseId && a.type === 'assignment'
          );
          const assignmentSubmissions = JSON.parse(localStorage.getItem('assignmentSubmissions') || '[]');
          const submittedAssignments = assignmentSubmissions.filter((s: any) => 
            s.studentId === studentId && courseAssignments.some((a: any) => a.id === s.assignmentId)
          ).length;
          
          completedAssignments += submittedAssignments;
          totalAssignments += courseAssignments.length;
          
          // Get quiz data
          const allQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
          const courseQuizzes = allQuizzes.filter((q: any) => q.courseId === courseId);
          const quizSubmissions = JSON.parse(localStorage.getItem('quizSubmissions') || '[]');
          const studentQuizSubmissions = quizSubmissions.filter((s: any) => 
            s.studentId === studentId && courseQuizzes.some((q: any) => q.id === s.quizId)
          );
          
          studentQuizSubmissions.forEach((sub: any) => {
            if (sub.percentage) {
              totalQuizScores += sub.percentage;
              quizCount++;
            }
          });
          
          courses.push({
            courseId: course.id,
            title: course.title || course.name,
            progress,
            totalModules: totalModules || course.totalModules || 10,
            completedModules: completedModules || studentDetails?.progress?.completedModules || 0,
            assignmentsSubmitted: submittedAssignments,
            assignmentsTotal: courseAssignments.length,
            quizzesCompleted: studentQuizSubmissions.length,
            quizzesTotal: courseQuizzes.length,
            lastActivity: getLatestActivity(courseId, studentId)
          });
        }
      });
      
      // Calculate overall statistics
      const avgProgress = courses.length > 0 ? Math.round(totalProgress / courses.length) : 0;
      const assignmentCompletionRate = totalAssignments > 0 
        ? Math.round((completedAssignments / totalAssignments) * 100) 
        : 0;
      const averageQuizScore = quizCount > 0 ? Math.round(totalQuizScores / quizCount) : 0;
      
      setCoursesProgress(courses);
      setProgressData({
        overallProgress: avgProgress,
        totalStudyHours: Math.round(totalStudyHours),
        averageQuizScore,
        assignmentCompletionRate,
        attendanceRate: 92, // Default value
        streakDays: calculateStreakDays(studentId)
      });
      
      // Load recent activities
      loadRecentActivities(studentId);
      
    } catch (error) {
      console.error('Error in loadProgressData:', error);
    }
  };

  const getLatestActivity = (courseId: string, studentId: string): string => {
    try {
      const submissionKeys = ['assignmentSubmissions', 'quizSubmissions'];
      let latestDate = new Date(0);
      
      submissionKeys.forEach(key => {
        const submissions = JSON.parse(localStorage.getItem(key) || '[]');
        const courseSubmissions = submissions.filter((s: any) => 
          s.studentId === studentId
        );
        
        courseSubmissions.forEach((sub: any) => {
          const subDate = new Date(sub.submittedAt);
          if (subDate > latestDate) {
            latestDate = subDate;
          }
        });
      });
      
      if (latestDate.getTime() > 0) {
        return formatActivityDate(latestDate.toISOString());
      }
    } catch (error) {
      console.error('Error getting latest activity:', error);
    }
    
    return 'No recent activity';
  };

  const calculateStreakDays = (studentId: string): number => {
    // Simplified streak calculation
    // In a real app, this would track daily logins or activity
    return Math.floor(Math.random() * 7) + 1;
  };

  const loadRecentActivities = (studentId: string) => {
    try {
      const activities: ActivityLog[] = [];
      
      // Load assignment submissions
      const assignmentSubmissions = JSON.parse(localStorage.getItem('assignmentSubmissions') || '[]');
      const studentAssignmentSubmissions = assignmentSubmissions.filter((s: any) => s.studentId === studentId);
      
      studentAssignmentSubmissions.slice(0, 3).forEach((sub: any) => {
        // Get assignment details
        const allAssignments = JSON.parse(localStorage.getItem('assignments') || '[]');
        const assignment = allAssignments.find((a: any) => a.id === sub.assignmentId);
        const course = JSON.parse(localStorage.getItem('courses') || '[]').find((c: any) => c.id === assignment?.courseId);
        
        activities.push({
          id: sub.id,
          type: 'assignment',
          title: assignment?.title || 'Assignment Submitted',
          courseId: assignment?.courseId || '',
          courseName: course?.title || 'Course',
          date: sub.submittedAt,
          score: sub.marks,
          total: assignment?.totalMarks
        });
      });
      
      // Load quiz submissions
      const quizSubmissions = JSON.parse(localStorage.getItem('quizSubmissions') || '[]');
      const studentQuizSubmissions = quizSubmissions.filter((s: any) => s.studentId === studentId);
      
      studentQuizSubmissions.slice(0, 2).forEach((sub: any) => {
        // Get quiz details
        const allQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
        const quiz = allQuizzes.find((q: any) => q.id === sub.quizId);
        const course = JSON.parse(localStorage.getItem('courses') || '[]').find((c: any) => c.id === quiz?.courseId);
        
        activities.push({
          id: sub.id,
          type: 'quiz',
          title: quiz?.title || 'Quiz Completed',
          courseId: quiz?.courseId || '',
          courseName: course?.title || 'Course',
          date: sub.submittedAt || new Date().toISOString(),
          score: sub.percentage || sub.totalMarksObtained,
          total: quiz?.totalMarks || sub.totalMarks
        });
      });
      
      // Load module completions
      const allModules = JSON.parse(localStorage.getItem('courseModules') || '[]');
      const completedModules = allModules.filter((m: any) => m.completed);
      
      completedModules.slice(0, 2).forEach((module: any) => {
        const course = JSON.parse(localStorage.getItem('courses') || '[]').find((c: any) => c.id === module.courseId);
        
        activities.push({
          id: module.id,
          type: 'module',
          title: module.title || 'Module Completed',
          courseId: module.courseId,
          courseName: course?.title || 'Course',
          date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      });
      
      // Sort by date (newest first) and take top 5
      const sortedActivities = activities
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
      
      setRecentActivities(sortedActivities);
    } catch (error) {
      console.error('Error loading recent activities:', error);
    }
  };

  const formatActivityDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <FileText className="w-4 h-4 text-blue-600" />;
      case 'quiz': return <Award className="w-4 h-4 text-green-600" />;
      case 'module': return <CheckCircle className="w-4 h-4 text-purple-600" />;
      case 'material': return <BookOpen className="w-4 h-4 text-amber-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendIndicator = (current: number, previous: number) => {
    if (current > previous) {
      return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    } else if (current < previous) {
      return <ArrowDownRight className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-blue-600';
    if (progress >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProgressBgColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-50 border-green-200';
    if (progress >= 60) return 'bg-blue-50 border-blue-200';
    if (progress >= 40) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#F59E0B] border-t-transparent"></div>
          <p className="mt-4 text-gray-600 text-sm">Loading progress data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Progress Overview</h1>
            <p className="text-gray-600 text-sm mt-1">Track your learning journey and achievements</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#F59E0B] to-[#F59E0B]/90 hover:from-[#F59E0B]/90 hover:to-[#F59E0B] text-white rounded-lg text-sm font-medium transition-all">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            {getTrendIndicator(progressData.overallProgress, 65)}
          </div>
          <div className="text-lg font-bold text-gray-900">{progressData.overallProgress}%</div>
          <div className="text-xs text-gray-500">Overall Progress</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            {getTrendIndicator(progressData.totalStudyHours, 12)}
          </div>
          <div className="text-lg font-bold text-gray-900">{progressData.totalStudyHours}h</div>
          <div className="text-xs text-gray-500">Study Hours</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <Award className="w-4 h-4 text-green-600" />
            </div>
            {getTrendIndicator(progressData.averageQuizScore, 75)}
          </div>
          <div className="text-lg font-bold text-gray-900">{progressData.averageQuizScore}%</div>
          <div className="text-xs text-gray-500">Quiz Avg</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-amber-600" />
            </div>
            {getTrendIndicator(progressData.assignmentCompletionRate, 70)}
          </div>
          <div className="text-lg font-bold text-gray-900">{progressData.assignmentCompletionRate}%</div>
          <div className="text-xs text-gray-500">Assignments</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-red-600" />
            </div>
            {getTrendIndicator(progressData.attendanceRate, 90)}
          </div>
          <div className="text-lg font-bold text-gray-900">{progressData.attendanceRate}%</div>
          <div className="text-xs text-gray-500">Attendance</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-gray-600" />
            </div>
            {getTrendIndicator(progressData.streakDays, 5)}
          </div>
          <div className="text-lg font-bold text-gray-900">{progressData.streakDays} days</div>
          <div className="text-xs text-gray-500">Streak</div>
        </div>
      </div>

      {/* Course Progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Course Progress</h2>
          <div className="text-sm text-gray-500">
            {coursesProgress.length} course{coursesProgress.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="space-y-4">
          {coursesProgress.length > 0 ? (
            coursesProgress.map((course) => (
              <div key={course.courseId} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getProgressColor(course.progress).replace('text-', 'bg-')}`}></div>
                    <h3 className="font-medium text-gray-900 text-sm">{course.title}</h3>
                    <span className="text-xs text-gray-500">• Last: {course.lastActivity}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{course.progress}%</div>
                      <div className="text-xs text-gray-500">{course.completedModules}/{course.totalModules} modules</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {course.assignmentsSubmitted}/{course.assignmentsTotal} assignments
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {course.quizzesCompleted}/{course.quizzesTotal} quizzes
                    </span>
                  </div>
                </div>
                
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(course.progress).replace('text-', 'bg-')}`}
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-gray-200">
                <BookOpen className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-600 text-sm">No course progress data available</p>
              <p className="text-xs text-gray-500 mt-1">Enroll in courses to track progress</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
          <span className="text-sm text-gray-500">Last 7 days</span>
        </div>
        
        <div className="space-y-4">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getProgressBgColor(activity.score || 0)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 text-sm">{activity.title}</h4>
                    <span className="text-xs text-gray-500">{activity.courseName}</span>
                  </div>
                  {activity.score !== undefined && activity.total !== undefined && (
                    <div className="text-xs text-gray-600">
                      Score: <span className="font-medium">{activity.score}/{activity.total}</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-600">{formatActivityDate(activity.date)}</div>
                  <div className="text-xs text-gray-500 capitalize">{activity.type}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-gray-200">
                <Activity className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-600 text-sm">No recent activity</p>
              <p className="text-xs text-gray-500 mt-1">Complete tasks to see activity here</p>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-[#F59E0B]/10 to-white border border-[#F59E0B]/20 rounded-xl p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Study Recommendations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-medium text-gray-900 text-sm">Focus Areas</h3>
            </div>
            <ul className="space-y-2 text-xs text-gray-700">
              {coursesProgress
                .filter(c => c.progress < 60)
                .map(course => (
                  <li key={course.courseId} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Improve {course.title} progress</span>
                  </li>
                ))}
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Increase study consistency</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 text-sm">Progress Goals</h3>
            </div>
            <ul className="space-y-2 text-xs text-gray-700">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Complete 2 more modules this week</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Submit pending assignments</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Study 15+ hours weekly</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 text-sm">Next Milestones</h3>
            </div>
            <ul className="space-y-2 text-xs text-gray-700">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Reach 75% overall progress</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Achieve 80%+ in next quiz</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Maintain 5-day study streak</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {coursesProgress.reduce((sum, c) => sum + c.completedModules, 0)}
              </div>
              <div className="text-xs text-gray-500">Modules Completed</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {coursesProgress.reduce((sum, c) => sum + c.assignmentsSubmitted, 0)}
              </div>
              <div className="text-xs text-gray-500">Assignments Submitted</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <Award className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {coursesProgress.reduce((sum, c) => sum + c.quizzesCompleted, 0)}
              </div>
              <div className="text-xs text-gray-500">Quizzes Completed</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {progressData.totalStudyHours}h
              </div>
              <div className="text-xs text-gray-500">Total Study Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}