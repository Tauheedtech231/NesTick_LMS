// app/lms/Student_Portal/progress/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Target, Award, BarChart3, Calendar, Download } from 'lucide-react';

export default function ProgressReportsPage() {
  const [timeRange, setTimeRange] = useState('month');
  const [progressData, setProgressData] = useState({
    overallProgress: 65,
    weeklyStudyTime: 14.5,
    assignmentCompletion: 75,
    quizPerformance: 78,
    attendance: 92,
  });

  const courses = [
    { name: 'Mathematics', progress: 85, trend: 'up', target: 90 },
    { name: 'Physics', progress: 60, trend: 'up', target: 75 },
    { name: 'Chemistry', progress: 45, trend: 'stable', target: 70 },
    { name: 'Biology', progress: 30, trend: 'up', target: 60 },
  ];

  const weeklyData = [
    { day: 'Mon', studyTime: 2.5, completed: 3 },
    { day: 'Tue', studyTime: 3, completed: 4 },
    { day: 'Wed', studyTime: 2, completed: 2 },
    { day: 'Thu', studyTime: 3.5, completed: 5 },
    { day: 'Fri', studyTime: 2.5, completed: 3 },
    { day: 'Sat', studyTime: 4, completed: 6 },
    { day: 'Sun', studyTime: 2, completed: 2 },
  ];

  const achievements = [
    { title: 'Consistent Learner', description: 'Studied 5 days in a row', date: '2024-03-15', icon: '🏆' },
    { title: 'Quiz Master', description: 'Scored 90%+ in 3 quizzes', date: '2024-03-10', icon: '🎯' },
    { title: 'Early Bird', description: 'Completed assignments 2 days early', date: '2024-03-05', icon: '⭐' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Progress Reports</h1>
          <p className="text-gray-600 mt-2">Track your learning progress and achievements</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overall Progress</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{progressData.overallProgress}%</p>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-emerald-600">+5% this month</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Weekly Study Time</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{progressData.weeklyStudyTime}h</p>
              <div className="flex items-center gap-2 mt-2">
                <Target className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-amber-600">Goal: 20h/week</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
              <Target className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Assignment Completion</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{progressData.assignmentCompletion}%</p>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-emerald-600">+12% this month</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quiz Performance</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{progressData.quizPerformance}%</p>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-600">+8% this month</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Course Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Course Progress</h3>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h4 className="font-medium text-gray-900">{course.name}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    course.trend === 'up' ? 'bg-emerald-100 text-emerald-800' :
                    course.trend === 'down' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {course.trend === 'up' ? '↗ Improving' : 
                     course.trend === 'down' ? '↘ Needs attention' : '→ Stable'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-purple-700">{course.progress}%</span>
                  <span className="text-sm text-gray-500 ml-2">Target: {course.target}%</span>
                </div>
              </div>
              <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`absolute left-0 top-0 h-full rounded-full ${
                    course.progress >= course.target ? 'bg-emerald-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Weekly Activity</h3>
          
          <div className="space-y-4">
            {weeklyData.map((day) => (
              <div key={day.day} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <span className="font-semibold text-purple-600">{day.day}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{day.studyTime}h Study Time</p>
                    <p className="text-sm text-gray-600">{day.completed} tasks completed</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  day.studyTime >= 3 ? 'bg-emerald-100 text-emerald-800' :
                  day.studyTime >= 2 ? 'bg-amber-100 text-amber-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {day.studyTime >= 3 ? 'Excellent' : day.studyTime >= 2 ? 'Good' : 'Needs Improvement'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Achievements</h3>
          
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div key={achievement.title} className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-purple-900">{achievement.title}</h4>
                  <p className="text-sm text-purple-700 mt-1">{achievement.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span className="text-xs text-purple-600">{achievement.date}</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                  <Award className="w-4 h-4 text-purple-500" />
                </div>
              </div>
            ))}
          </div>

          {/* Progress Chart Placeholder */}
          <div className="mt-8">
            <h4 className="font-medium text-gray-900 mb-4">Performance Trend</h4>
            <div className="h-48 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-gray-200 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Performance chart visualization</p>
                <p className="text-sm text-gray-500">Monthly progress over time</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-amber-900 mb-4">Study Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-amber-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-600" />
              </div>
              <h4 className="font-semibold text-amber-900">Focus Areas</h4>
            </div>
            <ul className="space-y-2 text-amber-800">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Improve Physics problem-solving</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Increase study consistency</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Complete Chemistry assignments on time</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-amber-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="font-semibold text-emerald-900">Progress Goals</h4>
            </div>
            <ul className="space-y-2 text-emerald-800">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Reach 75% overall progress</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Study 20+ hours weekly</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Complete all pending quizzes</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-amber-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-blue-900">Next Milestones</h4>
            </div>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Complete 3 more modules this week</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Achieve 85% in next Mathematics quiz</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Submit all assignments 1 day early</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}