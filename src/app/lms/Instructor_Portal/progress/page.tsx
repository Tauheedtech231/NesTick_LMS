// app/lms/Instructor_Portal/progress/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Users, FileText, CheckCircle, Clock, Calendar, Download, Filter } from 'lucide-react';
import { getCourses, getStudents, getAssignments } from '../utils/demoData';
import ProgressBar from '../components/ProgressBar';
/* eslint-disable */

export default function ProgressPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('month');
  const [courseFilter, setCourseFilter] = useState('all');

  useEffect(() => {
    const loadedCourses = getCourses();
    const loadedStudents = getStudents();
    const loadedAssignments = getAssignments();
    
    setCourses(loadedCourses);
    setStudents(loadedStudents);
    setAssignments(loadedAssignments);
  }, []);

  const filteredCourses = courseFilter === 'all' 
    ? courses 
    : courses.filter(course => course.id === courseFilter);

  const getEngagementScore = (course: any) => {
    // Simple engagement calculation
    const completion = course.completionRate;
    const assignmentRate = assignments
      .filter(a => a.course.includes(course.title.split('-')[0]))
      .reduce((sum, a) => sum + (a.submitted / a.totalStudents), 0) * 100;
    
    return Math.round((completion + assignmentRate) / 2);
  };

  const getStudentProgressData = () => {
    const ranges = [
      { range: '0-20%', count: 0 },
      { range: '21-40%', count: 0 },
      { range: '41-60%', count: 0 },
      { range: '61-80%', count: 0 },
      { range: '81-100%', count: 0 },
    ];

    students.forEach(student => {
      if (student.overallProgress <= 20) ranges[0].count++;
      else if (student.overallProgress <= 40) ranges[1].count++;
      else if (student.overallProgress <= 60) ranges[2].count++;
      else if (student.overallProgress <= 80) ranges[3].count++;
      else ranges[4].count++;
    });

    return ranges;
  };

  const studentProgressData = getStudentProgressData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Progress & Analytics</h1>
          <p className="text-gray-600 mt-2">Track student engagement and course performance</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#6B21A8] hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filter by Course:</span>
          </div>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="flex-1 max-w-xs px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Course Completion</p>
              <p className="text-2xl font-bold text-[#6B21A8] mt-1">
                {Math.round(filteredCourses.reduce((sum, c) => sum + c.completionRate, 0) / filteredCourses.length)}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-[#6B21A8]" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-[#10B981] mt-1">
                {students.filter(s => s.overallProgress > 50).length}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Users className="w-6 h-6 text-[#10B981]" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Assignment Submission Rate</p>
              <p className="text-2xl font-bold text-[#F59E0B] mt-1">
                {Math.round(assignments.reduce((sum, a) => sum + (a.submitted / a.totalStudents), 0) / assignments.length * 100)}%
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <FileText className="w-6 h-6 text-[#F59E0B]" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Assignment Score</p>
              <p className="text-2xl font-bold text-[#C4B5FD] mt-1">
                {Math.round(assignments.reduce((sum, a) => sum + a.averageScore, 0) / assignments.length)}%
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-[#C4B5FD]" />
            </div>
          </div>
        </div>
      </div>

      {/* Course Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Course Performance</h2>
          
          <div className="space-y-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-purple-300 flex items-center justify-center text-white font-bold">
                      {course.title.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{course.title}</h4>
                      <p className="text-sm text-gray-600">{course.studentCount} students</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[#6B21A8]">{course.completionRate}%</div>
                    <div className="text-sm text-gray-500">Completion</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">{course.completionRate}%</div>
                    <div className="text-xs text-gray-600">Progress</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">
                      {getEngagementScore(course)}%
                    </div>
                    <div className="text-xs text-gray-600">Engagement</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">
                      {assignments
                        .filter(a => a.course.includes(course.title.split('-')[0]))
                        .reduce((sum, a) => sum + a.averageScore, 0) / 
                        Math.max(assignments.filter(a => a.course.includes(course.title.split('-')[0])).length, 1)
                      }%
                    </div>
                    <div className="text-xs text-gray-600">Avg Score</div>
                  </div>
                </div>
                
                <ProgressBar 
                  progress={course.completionRate} 
                  color={course.completionRate >= 80 ? 'success' : course.completionRate >= 60 ? 'warning' : 'primary'}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Student Progress Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Student Progress Distribution</h2>
          
          <div className="space-y-4">
            {studentProgressData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.range}</span>
                  <span className="font-medium text-gray-900">{item.count} students</span>
                </div>
                <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`absolute left-0 top-0 h-full rounded-full ${
                      index === 4 ? 'bg-[#10B981]' :
                      index === 3 ? 'bg-[#F59E0B]' :
                      'bg-[#6B21A8]'
                    }`}
                    style={{ width: `${(item.count / students.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Key Insights</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                <span>{studentProgressData[4].count} students are excelling (81-100%)</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#F59E0B] rounded-full"></div>
                <span>{studentProgressData[3].count} students are on track (61-80%)</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#6B21A8] rounded-full"></div>
                <span>{studentProgressData[0].count + studentProgressData[1].count + studentProgressData[2].count} students need attention (0-60%)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Assignment Analytics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Assignment Analytics</h2>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-6">
          {assignments.map((assignment) => {
            const submissionRate = Math.round((assignment.submitted / assignment.totalStudents) * 100);
            const gradingRate = Math.round((assignment.graded / assignment.submitted) * 100);
            
            return (
              <div key={assignment.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                    <p className="text-sm text-gray-600">{assignment.course} • Due: {assignment.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{assignment.averageScore}%</div>
                    <div className="text-sm text-gray-500">Avg Score</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Submission Rate</span>
                      <span className="font-medium">{submissionRate}%</span>
                    </div>
                    <ProgressBar 
                      progress={submissionRate} 
                      color={submissionRate >= 80 ? 'success' : submissionRate >= 60 ? 'warning' : 'primary'}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Grading Progress</span>
                      <span className="font-medium">{gradingRate}%</span>
                    </div>
                    <ProgressBar 
                      progress={gradingRate} 
                      color="accent"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">{assignment.totalStudents}</div>
                    <div className="text-xs text-gray-600">Total Students</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">{assignment.submitted}</div>
                    <div className="text-xs text-gray-600">Submitted</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">{assignment.graded}</div>
                    <div className="text-xs text-gray-600">Graded</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Engagement Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Engagement</h2>
          
          <div className="space-y-4">
            {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, index) => {
              const engagement = [85, 78, 92, 88][index];
              return (
                <div key={week} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-900">{week}</span>
                    <span className="font-medium text-[#6B21A8]">{engagement}%</span>
                  </div>
                  <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`absolute left-0 top-0 h-full rounded-full ${
                        engagement >= 90 ? 'bg-[#10B981]' :
                        engagement >= 80 ? 'bg-[#F59E0B]' :
                        'bg-[#6B21A8]'
                      }`}
                      style={{ width: `${engagement}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recommendations</h2>
          
          <div className="space-y-4">
            {[
              { title: 'Improve Physics Engagement', description: 'Add more interactive content', priority: 'high' },
              { title: 'Schedule Office Hours', description: 'Students need more support', priority: 'medium' },
              { title: 'Update Chemistry Materials', description: 'Some resources are outdated', priority: 'low' },
            ].map((rec, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{rec.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                    rec.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
                <button className="w-full mt-4 py-2 text-center bg-[#6B21A8] hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
                  Take Action
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}