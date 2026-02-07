// app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  HiUser, 
  HiMail, 
  HiPhone, 
  HiCalendar, 
  HiLocationMarker,
  HiAcademicCap,
  HiBookOpen,
  HiCheckCircle,
  HiLockClosed,
  HiBell,
  HiGlobe,
  HiPencilAlt,
  HiSave,
  HiX
} from 'react-icons/hi';
/* eslint-disable */


type User = {
  id: string;
  email: string;
  username: string;
  fullName: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  role: 'student';
  course: string;
  courseId: string;
  registrationDate: string;
  status: 'active' | 'inactive';
  paymentVerified: boolean;
  learnerId: string;
  profileImage?: string;
};

type Course = {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  enrolledDate: string;
  studyHours: number;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [activeTab, setActiveTab] = useState<'profile' | 'courses' | 'settings'>('profile');

  useEffect(() => {
    // Load user data
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      try {
        const userData = JSON.parse(currentUserStr);
        setUser(userData);
        setEditForm({
          fullName: userData.fullName,
          email: userData.email,
          phone: userData.phone || '',
          address: userData.address || '',
          dateOfBirth: userData.dateOfBirth || ''
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Load courses data
    const studentCoursesStr = localStorage.getItem('studentCourses');
    if (studentCoursesStr) {
      try {
        const coursesData = JSON.parse(studentCoursesStr);
        setCourses(coursesData.map((course: any) => ({
          id: course.id,
          title: course.title,
          instructor: course.instructor,
          progress: course.progress,
          status: course.status,
          enrolledDate: course.enrolledDate,
          studyHours: course.studyHours
        })));
      } catch (error) {
        console.error('Error parsing courses:', error);
      }
    }
  }, []);

  const handleSaveProfile = () => {
    if (!user) return;

    const updatedUser = {
      ...user,
      ...editForm
    };

    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleCancelEdit = () => {
    if (user) {
      setEditForm({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth || ''
      });
    }
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    const oldPassword = prompt('Enter current password:');
    const newPassword = prompt('Enter new password:');
    const confirmPassword = prompt('Confirm new password:');

    if (newPassword === confirmPassword) {
      alert('Password changed successfully!');
      // In a real app, you would send this to the backend
    } else {
      alert('Passwords do not match!');
    }
  };

  const handleExportData = () => {
    const userData = {
      user,
      courses,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-profile-${user?.learnerId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const completedCourses = courses.filter(c => c.status === 'completed').length;
  const inProgressCourses = courses.filter(c => c.status === 'in_progress').length;
  const totalStudyHours = courses.reduce((sum, c) => sum + c.studyHours, 0);
  const averageProgress = courses.length > 0 
    ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
     <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-4 sm:p-6 text-white w-full">
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
    {/* Left Section: Profile Image + Info */}
    <div className="flex items-center space-x-3 sm:space-x-4">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center shadow-md">
        {user.profileImage ? (
          <img
            src={user.profileImage}
            alt={user.fullName}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
          />
        ) : (
          <HiUser className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
        )}
      </div>
      <div className="flex flex-col">
        <h1 className="text-lg sm:text-xl font-bold">{user.fullName}</h1>
        <p className="text-xs sm:text-sm text-purple-100">
          {user.learnerId} • {user.course}
        </p>
        <p className="text-xs text-purple-200 mt-1">
          Member since {new Date(user.registrationDate).toLocaleDateString()}
        </p>
      </div>
    </div>

    {/* Right Section: Status & Payment */}
    <div className="flex flex-col sm:items-end gap-2 text-right">
      <div className="flex items-center space-x-2 text-xs sm:text-sm">
        <span>Status:</span>
        <span
          className={`px-2 py-0.5 rounded-full font-bold text-xs sm:text-sm ${
            user.status === 'active'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {user.status.toUpperCase()}
        </span>
      </div>
      <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
        <HiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-300" />
        <span>
          {user.paymentVerified ? 'Payment Verified' : 'Payment Pending'}
        </span>
      </div>
    </div>
  </div>
</div>


      {/* Tabs */}
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm w-full">
  {/* Tabs Navigation */}
  <div className="border-b border-gray-200 overflow-x-auto">
    <nav className="flex -mb-px whitespace-nowrap">
      <button
        onClick={() => setActiveTab('profile')}
        className={`py-3 px-4 sm:px-6 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-1 sm:gap-2 ${
          activeTab === 'profile'
            ? 'border-purple-600 text-purple-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        }`}
      >
        <HiUser className="w-3 h-3 sm:w-4 sm:h-4" /> Profile
      </button>

      <button
        onClick={() => setActiveTab('courses')}
        className={`py-3 px-4 sm:px-6 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-1 sm:gap-2 ${
          activeTab === 'courses'
            ? 'border-purple-600 text-purple-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        }`}
      >
        <HiBookOpen className="w-3 h-3 sm:w-4 sm:h-4" /> Courses
      </button>

      <button
        onClick={() => setActiveTab('settings')}
        className={`py-3 px-4 sm:px-6 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-1 sm:gap-2 ${
          activeTab === 'settings'
            ? 'border-purple-600 text-purple-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        }`}
      >
        <HiLockClosed className="w-3 h-3 sm:w-4 sm:h-4" /> Settings
      </button>
    </nav>
  </div>

  {/* Tab Content */}
  <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
    {/* Profile Tab */}
    {activeTab === 'profile' && (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h2 className="text-sm sm:text-lg font-bold text-gray-900">Personal Information</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 sm:gap-2 px-3 py-1 sm:px-4 sm:py-2 text-purple-600 text-xs sm:text-sm hover:text-purple-800"
            >
              <HiPencilAlt className="w-3 h-3 sm:w-4 sm:h-4" /> Edit
            </button>
          ) : (
            <div className="flex gap-1 sm:gap-2 flex-wrap">
              <button
                onClick={handleSaveProfile}
                className="flex items-center gap-1 sm:gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-green-600 text-white rounded text-xs sm:text-sm hover:bg-green-700"
              >
                <HiSave className="w-3 h-3 sm:w-4 sm:h-4" /> Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-1 sm:gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-gray-100 text-gray-700 rounded text-xs sm:text-sm hover:bg-gray-200"
              >
                <HiX className="w-3 h-3 sm:w-4 sm:h-4" /> Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="space-y-3">
            {/* Full Name */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-1 sm:gap-2">
                <HiUser className="w-3 h-3 sm:w-4 sm:h-4" /> Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.fullName || ''}
                  onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                  className="w-full px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-sm"
                />
              ) : (
                <p className="text-gray-900 font-medium text-xs sm:text-sm">{user.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-1 sm:gap-2">
                <HiMail className="w-3 h-3 sm:w-4 sm:h-4" /> Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-sm"
                />
              ) : (
                <p className="text-gray-900 font-medium text-xs sm:text-sm">{user.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-1 sm:gap-2">
                <HiPhone className="w-3 h-3 sm:w-4 sm:h-4" /> Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  className="w-full px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-sm"
                />
              ) : (
                <p className="text-gray-900 font-medium text-xs sm:text-sm">{user.phone || 'Not provided'}</p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            {/* Date of Birth */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-1 sm:gap-2">
                <HiCalendar className="w-3 h-3 sm:w-4 sm:h-4" /> Date of Birth
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={editForm.dateOfBirth || ''}
                  onChange={(e) => setEditForm({...editForm, dateOfBirth: e.target.value})}
                  className="w-full px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-sm"
                />
              ) : (
                <p className="text-gray-900 font-medium text-xs sm:text-sm">
                  {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-1 sm:gap-2">
                <HiLocationMarker className="w-3 h-3 sm:w-4 sm:h-4" /> Address
              </label>
              {isEditing ? (
                <textarea
                  value={editForm.address || ''}
                  onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-sm"
                />
              ) : (
                <p className="text-gray-900 font-medium text-xs sm:text-sm">{user.address || 'Not provided'}</p>
              )}
            </div>

            {/* Learner ID */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-1 sm:gap-2">
                <HiAcademicCap className="w-3 h-3 sm:w-4 sm:h-4" /> Learner ID
              </label>
              <p className="text-gray-900 font-medium text-xs sm:text-sm">{user.learnerId}</p>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Courses and Settings tabs can be adjusted similarly with smaller fonts and responsive grid */}
  </div>
</div>


    
    </div>
  );
}