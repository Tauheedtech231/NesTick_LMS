// app/lms/Student_Portal/study-time/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock, Calendar, TrendingUp, Target, Award, BookOpen, Plus, MoreVertical } from 'lucide-react';

export default function StudyTimeTrackerPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState('Mathematics');
  const [notes, setNotes] = useState('');
  const [studySessions, setStudySessions] = useState([
    { date: '2024-03-15', duration: 120, course: 'Mathematics', notes: 'Algebra basics', time: '2:30 PM' },
    { date: '2024-03-14', duration: 90, course: 'Physics', notes: 'Newton\'s Laws', time: '4:00 PM' },
    { date: '2024-03-13', duration: 180, course: 'Chemistry', notes: 'Periodic table', time: '11:00 AM' },
    { date: '2024-03-12', duration: 60, course: 'Mathematics', notes: 'Quadratic equations', time: '3:15 PM' },
  ]);

  const courses = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setNotes('');
  };

  const handleSaveSession = () => {
    if (time > 0) {
      const newSession = {
        date: new Date().toISOString().split('T')[0],
        duration: time,
        course: selectedCourse,
        notes: notes || 'No notes',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setStudySessions([newSession, ...studySessions]);
      handleReset();
    }
  };

  const totalStudyTime = studySessions.reduce((total, session) => total + session.duration, 0);
  const dailyAverage = studySessions.length > 0 ? totalStudyTime / studySessions.length / 60 : 0;
  const totalHours = totalStudyTime / 3600;
  const todaySessions = studySessions.filter(s => s.date === new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Study Time</h1>
          <p className="text-gray-600 text-sm mt-1">Track and manage your study sessions</p>
        </div>
      </div>

      {/* Stats Cards - Simpler */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Time</p>
              <p className="font-bold text-gray-900">{totalHours.toFixed(1)}h</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Today</p>
              <p className="font-bold text-gray-900">
                {(todaySessions.reduce((total, s) => total + s.duration, 0) / 3600).toFixed(1)}h
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Daily Avg</p>
              <p className="font-bold text-gray-900">{dailyAverage.toFixed(1)}h</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sessions</p>
              <p className="font-bold text-gray-900">{studySessions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Timer Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Timer Display */}
          <div className="lg:w-1/2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Study Timer</h3>
              <div className="text-right">
                <div className="text-sm text-gray-500">Current Session</div>
                <div className="text-2xl font-bold text-gray-900 font-mono">{formatTime(time)}</div>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleStartStop}
                className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                  isRunning
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isRunning ? (
                  <span className="flex items-center justify-center gap-2">
                    <Pause className="w-4 h-4" />
                    Pause
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" />
                    Start
                  </span>
                )}
              </button>
              
              <button
                onClick={handleReset}
                disabled={isRunning}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                <Square className="w-4 h-4" />
              </button>
            </div>

            {/* Course Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isRunning}
              >
                {courses.map((course) => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What are you working on?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[80px]"
                disabled={isRunning}
              />
            </div>

            {/* Save Button */}
            {time > 0 && !isRunning && (
              <button
                onClick={handleSaveSession}
                className="w-full py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600"
              >
                Save Session
              </button>
            )}
          </div>

          {/* Study Sessions List */}
          <div className="lg:w-1/2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Recent Sessions</h3>
              <button className="text-sm text-purple-600 hover:text-purple-700">
                View all
              </button>
            </div>

            <div className="space-y-3">
              {studySessions.slice(0, 4).map((session, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{session.course}</div>
                        <div className="text-sm text-gray-500">{session.time} • {(session.duration / 60).toFixed(0)} min</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 text-sm">
                        {(session.duration / 3600).toFixed(1)}h
                      </div>
                      <div className="text-xs text-gray-500">{session.date}</div>
                    </div>
                  </div>
                  {session.notes && session.notes !== 'No notes' && (
                    <div className="mt-2 text-sm text-gray-600 border-t border-gray-200 pt-2">
                      {session.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Empty State */}
            {studySessions.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">No sessions yet</h4>
                <p className="text-gray-600 text-sm">Start a timer to track your first session</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Study Goals Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Study Goals</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Daily Goal</h4>
              <span className="text-sm text-gray-600">2 hours</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${Math.min((totalHours / studySessions.length) / 2 * 100, 100)}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {((totalHours / studySessions.length) / 2 * 100).toFixed(0)}% of target reached
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Weekly Target</h4>
              <span className="text-sm text-gray-600">14 hours</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${Math.min((totalHours / 14) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {((totalHours / 14) * 100).toFixed(0)}% completed
            </div>
          </div>
        </div>
      </div>

      {/* Study Hours Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Study Hours This Week</h3>
          <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
            <option>This Week</option>
            <option>Last Week</option>
            <option>This Month</option>
          </select>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-end justify-between h-32">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
              const hours = [1.5, 2, 1, 2.5, 3, 1.5, 2][index];
              const percentage = (hours / 4) * 100;
              return (
                <div key={day} className="flex flex-col items-center flex-1 px-1">
                  <div className="text-xs text-gray-500 mb-2">{day}</div>
                  <div className="relative w-full">
                    <div className="absolute bottom-0 w-full bg-gray-100 rounded-t-lg" style={{ height: '100%' }}></div>
                    <div 
                      className={`absolute bottom-0 w-full rounded-t-lg ${
                        hours >= 2 ? 'bg-purple-500' : 'bg-purple-300'
                      }`}
                      style={{ height: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs font-medium mt-2">{hours}h</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Study Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <Target className="w-4 h-4 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Set Clear Goals</h4>
            <p className="text-sm text-gray-600">Define what you want to achieve in each study session</p>
          </div>
          
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Take Regular Breaks</h4>
            <p className="text-sm text-gray-600">Study for 25-30 minutes, then take a 5-minute break</p>
          </div>
          
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <BookOpen className="w-4 h-4 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Review Regularly</h4>
            <p className="text-sm text-gray-600">Review your notes within 24 hours for better retention</p>
          </div>
        </div>
      </div>
    </div>
  );
}