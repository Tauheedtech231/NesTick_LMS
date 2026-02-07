// app/progress/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  HiChartBar, 
  HiClock, 
  HiCalendar, 
  HiTrendingUp, 
  HiTrendingDown,
  HiCheckCircle,
  HiDocumentText,
  HiAcademicCap
} from 'react-icons/hi';
import ProgressBar from '../components/ProgressBar';

type CourseProgress = {
  courseId: string;
  courseName: string;
  progress: number;
  completedModules: number;
  totalModules: number;
  lastActivity: string;
  averageScore: number;
};

type WeeklyData = {
  week: string;
  studyHours: number;
  modulesCompleted: number;
  averageScore: number;
};

export default function ProgressPage() {
  const [courses, setCourses] = useState<CourseProgress[]>([
    {
      courseId: 'pipe-fitter',
      courseName: 'Industrial Pipe Fitting',
      progress: 75,
      completedModules: 6,
      totalModules: 8,
      lastActivity: '2024-03-15T10:30:00Z',
      averageScore: 88
    },
    {
      courseId: 'welding',
      courseName: 'Professional Welding',
      progress: 30,
      completedModules: 3,
      totalModules: 10,
      lastActivity: '2024-03-10T14:20:00Z',
      averageScore: 85
    },
    {
      courseId: 'safety-inspector',
      courseName: 'Safety Inspector Certification',
      progress: 100,
      completedModules: 6,
      totalModules: 6,
      lastActivity: '2024-01-20T09:15:00Z',
      averageScore: 90
    }
  ]);

  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([
    { week: 'Week 1', studyHours: 12, modulesCompleted: 2, averageScore: 85 },
    { week: 'Week 2', studyHours: 15, modulesCompleted: 3, averageScore: 88 },
    { week: 'Week 3', studyHours: 10, modulesCompleted: 1, averageScore: 82 },
    { week: 'Week 4', studyHours: 14, modulesCompleted: 2, averageScore: 90 },
    { week: 'Week 5', studyHours: 16, modulesCompleted: 3, averageScore: 87 },
    { week: 'Week 6', studyHours: 11, modulesCompleted: 2, averageScore: 85 },
    { week: 'Week 7', studyHours: 20, modulesCompleted: 4, averageScore: 92 }
  ]);

  const [overallStats, setOverallStats] = useState({
    totalStudyHours: 98,
    totalCourses: 3,
    completedCourses: 1,
    averageScore: 88,
    consistencyStreak: 14,
    assignmentsCompleted: 15,
    quizzesPassed: 8
  });

  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    // Load progress data from localStorage
    const savedProgress = localStorage.getItem('studentProgress');
    if (savedProgress) {
      const progressData = JSON.parse(savedProgress);
      setCourses(progressData.courses || courses);
      setWeeklyData(progressData.weeklyData || weeklyData);
      setOverallStats(progressData.overallStats || overallStats);
    }
  }, []);

  const saveProgressData = () => {
    const progressData = {
      courses,
      weeklyData,
      overallStats,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('studentProgress', JSON.stringify(progressData));
  };

  const getWeekData = () => {
    switch (timeRange) {
      case 'week':
        return weeklyData.slice(-1);
      case 'month':
        return weeklyData.slice(-4);
      case 'all':
        return weeklyData;
    }
  };

  const currentWeekData = getWeekData();
  const totalStudyHours = currentWeekData.reduce((sum, week) => sum + week.studyHours, 0);
  const totalModulesCompleted = currentWeekData.reduce((sum, week) => sum + week.modulesCompleted, 0);
  const weeklyAverageScore = currentWeekData.length > 0 
    ? Math.round(currentWeekData.reduce((sum, week) => sum + week.averageScore, 0) / currentWeekData.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
    <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-5 md:p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-0">
    {/* Title and description */}
    <div className="flex flex-col">
      <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold mb-1 sm:mb-2">
        Learning Progress Dashboard
      </h1>
      <p className="text-purple-200 text-xs sm:text-sm">
        Track your learning journey and achievements
      </p>
    </div>

    {/* Stats section */}
    <div className="flex items-center space-x-2 md:space-x-3 mt-2 md:mt-0">
      <div className="bg-purple-700/30 p-2.5 rounded-lg flex items-center justify-center">
        <HiChartBar className="w-5 h-5 sm:w-6 sm:h-7 text-white" />
      </div>
      <div className="flex flex-col text-right">
        <span className="text-lg sm:text-xl md:text-2xl font-bold">
          {overallStats.averageScore}%
        </span>
        <span className="text-xs sm:text-sm text-purple-200">Avg. Score</span>
      </div>
    </div>
  </div>
</div>


      {/* Time Range Selector */}
     <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-0">
    {/* Title */}
    <h2 className="font-semibold text-gray-900 text-lg md:text-xl">
      Learning Analytics
    </h2>

    {/* Time range buttons */}
    <div className="flex flex-wrap gap-2">
      {(['week', 'month', 'all'] as const).map(range => (
        <button
          key={range}
          onClick={() => setTimeRange(range)}
          className={`px-3 py-1.5 rounded-lg font-medium text-sm sm:text-base transition-colors duration-200 ${
            timeRange === range
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {range.charAt(0).toUpperCase() + range.slice(1)}
        </button>
      ))}
    </div>
  </div>
</div>


      {/* Stats Overview */}
     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
  {/* Study Hours Card */}
  <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-md hover:shadow-lg transition-shadow duration-300">
    <div className="flex items-center justify-between mb-3">
      <div>
        <p className="text-xs sm:text-sm text-gray-500">Study Hours ({timeRange})</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalStudyHours}h</p>
      </div>
      <div className="p-2.5 sm:p-3 rounded-full bg-blue-100 text-blue-600">
        <HiClock className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
    </div>
    <div className="flex items-center text-xs sm:text-sm">
      <HiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
      <span className="text-green-600 font-medium">+12% from last {timeRange}</span>
    </div>
  </div>

  {/* Modules Completed Card */}
  <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-md hover:shadow-lg transition-shadow duration-300">
    <div className="flex items-center justify-between mb-3">
      <div>
        <p className="text-xs sm:text-sm text-gray-500">Modules Completed</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalModulesCompleted}</p>
      </div>
      <div className="p-2.5 sm:p-3 rounded-full bg-green-100 text-green-600">
        <HiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
    </div>
    <div className="flex items-center text-xs sm:text-sm">
      <HiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
      <span className="text-green-600 font-medium">+3 from last {timeRange}</span>
    </div>
  </div>

  {/* Average Score Card */}
  <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-md  transition-shadow duration-300">
    <div className="flex items-center justify-between mb-3">
      <div>
        <p className="text-xs sm:text-sm text-gray-500">Average Score</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{weeklyAverageScore}%</p>
      </div>
      <div className="p-2.5 sm:p-3 rounded-full bg-purple-100 text-purple-600">
        <HiChartBar className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
    </div>
    <div className="flex items-center text-xs sm:text-sm">
      <HiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
      <span className="text-green-600 font-medium">+5% from last {timeRange}</span>
    </div>
  </div>
</div>


     

      {/* Course-wise Progress */}
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Course Progress Card */}
  <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-5">Course Progress</h2>
    <div className="space-y-5">
      {courses.map(course => (
        <div key={course.courseId} className="space-y-2.5">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{course.courseName}</h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs sm:text-sm text-gray-500">
                {course.completedModules}/{course.totalModules} modules
              </span>
              <span className="text-lg sm:text-xl font-bold text-gray-900">{course.progress}%</span>
            </div>
          </div>
          <ProgressBar progress={course.progress} size="md" />
          <div className="flex justify-between text-xs sm:text-sm text-gray-500">
            <span>Avg Score: {course.averageScore}%</span>
            <span>Last active: {new Date(course.lastActivity).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Overall Statistics Card */}
  <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-5">Overall Statistics</h2>
    <div className="space-y-5">
      {/* Quick Stats Grid */}
     <div className="space-y-3 w-full max-w-md mx-auto">
  {[
    { label: 'Total Study Hours', value: overallStats.totalStudyHours + 'h', color: 'bg-purple-600' },
    { label: 'Completed Courses', value: overallStats.completedCourses, color: 'bg-green-600' },
    { label: 'Assignments Completed', value: overallStats.assignmentsCompleted, color: 'bg-blue-600' },
    { label: 'Quizzes Passed', value: overallStats.quizzesPassed, color: 'bg-yellow-600' },
  ].map((stat, idx) => (
    <div key={idx} className="flex items-center justify-between space-x-3">
      {/* Dot */}
      <div className={`w-3 h-3 rounded-full ${stat.color} flex-shrink-0`} />

      {/* Stat Info */}
      <div className="flex justify-between w-full">
        <span className="text-sm text-gray-700 break-words">{stat.label}</span>
        <span className="text-sm font-medium text-gray-900 ml-2 flex-shrink-0">{stat.value}</span>
      </div>
    </div>
  ))}
</div>


    

      {/* Learning Goals */}
      <div className="p-4 bg-gray-50 rounded-xl space-y-4">
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-3">Learning Goals</h3>
        {[
          { label: 'Daily Study Hours (2h target)', progress: 75, color: 'bg-green-500', current: '1.5h', target: '2h' },
          { label: 'Weekly Modules (2 modules target)', progress: 100, color: 'bg-blue-500', current: '3', target: '2' },
          { label: 'Monthly Certifications (1 target)', progress: 0, color: 'bg-purple-500', current: '0', target: '1' },
        ].map((goal, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-xs sm:text-sm text-gray-700 mb-1">
              <span>{goal.label}</span>
              <span className="font-medium">{goal.current} / {goal.target}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className={`${goal.color} h-2 rounded-full`} style={{ width: `${goal.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>


  
    </div>
  );
}