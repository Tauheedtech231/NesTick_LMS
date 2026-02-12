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
  HiAcademicCap,
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
      averageScore: 88,
    },
    {
      courseId: 'welding',
      courseName: 'Professional Welding',
      progress: 30,
      completedModules: 3,
      totalModules: 10,
      lastActivity: '2024-03-10T14:20:00Z',
      averageScore: 85,
    },
    {
      courseId: 'safety-inspector',
      courseName: 'Safety Inspector Certification',
      progress: 100,
      completedModules: 6,
      totalModules: 6,
      lastActivity: '2024-01-20T09:15:00Z',
      averageScore: 90,
    },
  ]);

  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([
    { week: 'Week 1', studyHours: 12, modulesCompleted: 2, averageScore: 85 },
    { week: 'Week 2', studyHours: 15, modulesCompleted: 3, averageScore: 88 },
    { week: 'Week 3', studyHours: 10, modulesCompleted: 1, averageScore: 82 },
    { week: 'Week 4', studyHours: 14, modulesCompleted: 2, averageScore: 90 },
    { week: 'Week 5', studyHours: 16, modulesCompleted: 3, averageScore: 87 },
    { week: 'Week 6', studyHours: 11, modulesCompleted: 2, averageScore: 85 },
    { week: 'Week 7', studyHours: 20, modulesCompleted: 4, averageScore: 92 },
  ]);

  const [overallStats, setOverallStats] = useState({
    totalStudyHours: 98,
    totalCourses: 3,
    completedCourses: 1,
    averageScore: 88,
    consistencyStreak: 14,
    assignmentsCompleted: 15,
    quizzesPassed: 8,
  });

  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    const savedProgress = localStorage.getItem('studentProgress');
    if (savedProgress) {
      const progressData = JSON.parse(savedProgress);
      setCourses(progressData.courses || courses);
      setWeeklyData(progressData.weeklyData || weeklyData);
      setOverallStats(progressData.overallStats || overallStats);
    }
  }, []);

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
  const weeklyAverageScore =
    currentWeekData.length > 0
      ? Math.round(currentWeekData.reduce((sum, week) => sum + week.averageScore, 0) / currentWeekData.length)
      : 0;

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* ========== HEADER ========== */}
      <div
        className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-white shadow-md"
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-1">
              Learning Progress Dashboard
            </h1>
            <p className="text-purple-200 text-xs sm:text-sm">
              Track your learning journey and achievements
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 bg-purple-700/30 px-3 py-2 rounded-lg self-start sm:self-center">
            <HiChartBar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            <div>
              <span className="text-lg sm:text-xl md:text-2xl font-bold">{overallStats.averageScore}%</span>
              <span className="text-xs sm:text-sm text-purple-200 ml-2">Avg. Score</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========== TIME RANGE SELECTOR ========== */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h2 className="font-semibold text-gray-900 text-base sm:text-lg">Learning Analytics</h2>
          <div className="flex flex-wrap gap-2">
            {(['week', 'month', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
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

      {/* ========== STATS CARDS (Study Hours, Modules, Score) ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Study Hours */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Study Hours ({timeRange})</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalStudyHours}h</p>
            </div>
            <div className="p-2 sm:p-2.5 rounded-full bg-blue-100 text-blue-600">
              <HiClock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div className="flex items-center text-xs sm:text-sm">
            <HiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+12% from last {timeRange}</span>
          </div>
        </div>

        {/* Modules Completed */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Modules Completed</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalModulesCompleted}</p>
            </div>
            <div className="p-2 sm:p-2.5 rounded-full bg-green-100 text-green-600">
              <HiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div className="flex items-center text-xs sm:text-sm">
            <HiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+3 from last {timeRange}</span>
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Average Score</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{weeklyAverageScore}%</p>
            </div>
            <div className="p-2 sm:p-2.5 rounded-full bg-purple-100 text-purple-600">
              <HiChartBar className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div className="flex items-center text-xs sm:text-sm">
            <HiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+5% from last {timeRange}</span>
          </div>
        </div>
      </div>

      {/* ========== COURSE PROGRESS & OVERALL STATS SIDE BY SIDE ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Course Progress Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Course Progress</h2>
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.courseId} className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    {course.courseName}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-500">
                      {course.completedModules}/{course.totalModules}
                    </span>
                    <span className="text-base sm:text-lg font-bold text-gray-900">
                      {course.progress}%
                    </span>
                  </div>
                </div>
                <ProgressBar progress={course.progress} size="md" />
                <div className="flex flex-wrap justify-between text-xs sm:text-sm text-gray-500">
                  <span>Avg Score: {course.averageScore}%</span>
                  <span>
                    Last active: {new Date(course.lastActivity).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overall Statistics & Learning Goals */}
        <div className="space-y-4 sm:space-y-5">
          {/* Overall Statistics */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
              Overall Statistics
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm text-gray-500">Total Study Hours</span>
                <span className="text-lg sm:text-xl font-bold text-gray-900">
                  {overallStats.totalStudyHours}h
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm text-gray-500">Completed Courses</span>
                <span className="text-lg sm:text-xl font-bold text-gray-900">
                  {overallStats.completedCourses}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm text-gray-500">Assignments</span>
                <span className="text-lg sm:text-xl font-bold text-gray-900">
                  {overallStats.assignmentsCompleted}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm text-gray-500">Quizzes Passed</span>
                <span className="text-lg sm:text-xl font-bold text-gray-900">
                  {overallStats.quizzesPassed}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm text-gray-500">Consistency Streak</span>
                <span className="text-lg sm:text-xl font-bold text-gray-900">
                  {overallStats.consistencyStreak} days
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm text-gray-500">Avg. Score</span>
                <span className="text-lg sm:text-xl font-bold text-gray-900">
                  {overallStats.averageScore}%
                </span>
              </div>
            </div>
          </div>

          {/* Learning Goals */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
              Learning Goals
            </h3>
            <div className="space-y-4">
              {[
                {
                  label: 'Daily Study Hours (2h target)',
                  progress: 75,
                  color: 'bg-green-500',
                  current: '1.5h',
                  target: '2h',
                },
                {
                  label: 'Weekly Modules (2 modules target)',
                  progress: 100,
                  color: 'bg-blue-500',
                  current: '3',
                  target: '2',
                },
                {
                  label: 'Monthly Certifications (1 target)',
                  progress: 0,
                  color: 'bg-purple-500',
                  current: '0',
                  target: '1',
                },
              ].map((goal, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs sm:text-sm text-gray-700 mb-1">
                    <span>{goal.label}</span>
                    <span className="font-medium">
                      {goal.current} / {goal.target}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${goal.color} h-2 rounded-full`}
                      style={{ width: `${goal.progress}%` }}
                    />
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