// app/lms/Student_Portal/study-time/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock, Calendar, TrendingUp, Target, Award } from 'lucide-react';

export default function StudyTimeTrackerPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState('Mathematics - 10th Grade');
  const [notes, setNotes] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [studySessions, setStudySessions] = useState<any[]>([
    { date: '2024-03-15', duration: 120, course: 'Mathematics - 10th Grade', notes: 'Algebra basics' },
    { date: '2024-03-14', duration: 90, course: 'Physics - 10th Grade', notes: 'Newton\'s Laws' },
    { date: '2024-03-13', duration: 180, course: 'Chemistry - 11th Grade', notes: 'Periodic table' },
    { date: '2024-03-12', duration: 60, course: 'Mathematics - 10th Grade', notes: 'Quadratic equations' },
  ]);

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
      };
      setStudySessions([newSession, ...studySessions]);
      
      // Save to localStorage
      const sessions = JSON.parse(localStorage.getItem('lms_study_sessions') || '[]');
      sessions.push({
        id: Date.now(),
        ...newSession,
        date: new Date().toISOString(),
      });
      localStorage.setItem('lms_study_sessions', JSON.stringify(sessions));
      
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Study Time Tracker</h1>
        <p className="text-gray-600 mt-2">Track your study sessions and monitor progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Study Time</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{totalHours.toFixed(1)}h</p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today&apos;s Time</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {(todaySessions.reduce((total, s) => total + s.duration, 0) / 3600).toFixed(1)}h
              </p>
            </div>
            <Calendar className="w-8 h-8 text-amber-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Daily Average</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{dailyAverage.toFixed(1)}h</p>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{studySessions.length}</p>
            </div>
            <Award className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Timer */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-8 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-6">Study Timer</h2>
          <div className="text-6xl md:text-7xl font-bold font-mono mb-8">
            {formatTime(time)}
          </div>
          
          <div className="max-w-md mx-auto space-y-6">
            {/* Course Selection */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Select Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                disabled={isRunning}
              >
                <option>Mathematics - 10th Grade</option>
                <option>Physics - 10th Grade</option>
                <option>Chemistry - 11th Grade</option>
                <option>Biology - 12th Grade</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Session Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What are you studying? (Optional)"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 min-h-[100px]"
                disabled={isRunning}
              />
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleStartStop}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all ${
                  isRunning
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Start
                  </>
                )}
              </button>
              
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-8 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors"
                disabled={isRunning}
              >
                <Square className="w-5 h-5" />
                Reset
              </button>
            </div>

            {/* Save Session Button */}
            {time > 0 && !isRunning && (
              <button
                onClick={handleSaveSession}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 rounded-lg font-semibold transition-colors"
              >
                Save Study Session
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Study Statistics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Study Statistics</h3>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">Daily Goal: 2 hours</span>
          </div>
        </div>
        
        {/* Weekly Chart */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">This Week</span>
            <span className="text-sm text-gray-600">
              Total: {(totalStudyTime / 3600).toFixed(1)} hours
            </span>
          </div>
          
          <div className="flex items-end justify-between h-40">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
              const hours = [1.5, 2, 1, 2.5, 3, 1.5, 2][index];
              const percentage = (hours / 4) * 100; // 4 hours max for visualization
              return (
                <div key={day} className="flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-2">{day}</div>
                  <div className="relative w-10">
                    <div className="absolute bottom-0 w-10 bg-gray-200 rounded-t-lg" style={{ height: '100%' }}></div>
                    <div 
                      className={`absolute bottom-0 w-10 rounded-t-lg transition-all duration-500 ${
                        hours >= 2 ? 'bg-emerald-500' : 'bg-amber-500'
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

      {/* Recent Sessions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Study Sessions</h3>
        
        {studySessions.length > 0 ? (
          <div className="space-y-4">
            {studySessions.slice(0, 5).map((session, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{session.course}</h4>
                    <p className="text-sm text-gray-600 mt-1">{session.notes}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>{session.date}</span>
                      <span>•</span>
                      <span>{(session.duration / 60).toFixed(1)} minutes</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-700">
                    {(session.duration / 3600).toFixed(2)}h
                  </div>
                  <div className="text-sm text-gray-500">Study Time</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-10 h-10 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No study sessions yet</h4>
            <p className="text-gray-600">Start your first study session using the timer above</p>
          </div>
        )}
        
        {studySessions.length > 5 && (
          <div className="text-center mt-6">
            <button className="text-purple-600 hover:text-purple-700 font-medium">
              View All Sessions →
            </button>
          </div>
        )}
      </div>

      {/* Study Goals */}
      <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-amber-900 mb-4">Study Goals & Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-amber-800 mb-3">Daily Goals</h4>
            <ul className="space-y-2 text-amber-700">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Study at least 2 hours daily</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Complete 1 module per day</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Take regular breaks (Pomodoro technique)</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-amber-800 mb-3">Study Tips</h4>
            <ul className="space-y-2 text-amber-700">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Study in a quiet environment</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Review notes after each session</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Practice with quizzes regularly</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}