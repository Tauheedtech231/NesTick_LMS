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
  HiX,
  HiClock,
  HiUserGroup,
  HiStar,
  HiArrowRight
} from 'react-icons/hi';
/* eslint-disable */

// ✅ Add Brand Colors
const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  white: '#FFFFFF',
  lightGrey: '#F4F6F8',
  softGrey: '#E5E7EB',
  darkGrey: '#1F2933',
  teal: '#1FB6CB'
};

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
  description?: string;
  category: string;
  duration: string;
  instructorId: string;
  instructorName: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  enrolledDate: string;
  studyHours: number;
  price?: string;
  image?: string;
  rating?: number;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [activeTab, setActiveTab] = useState<'profile' | 'courses' | 'settings'>('profile');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      try {
        // ✅ Load user data
        const currentUserStr = localStorage.getItem('currentUser');
        console.log('Loaded user from localStorage:', currentUserStr);
        
        if (currentUserStr) {
          const userData = JSON.parse(currentUserStr);
          setUser(userData);
          setEditForm({
            fullName: userData.fullName,
            email: userData.email,
            phone: userData.phone || '',
            address: userData.address || '',
            dateOfBirth: userData.dateOfBirth || ''
          });

          // ✅ Load ALL enrolled courses for this student
          loadStudentCourses(userData);
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ✅ NEW FUNCTION: Load student's enrolled courses with real data
  const loadStudentCourses = (studentData: User) => {
    try {
      // Method 1: Check studentCredentials (admin sent data)
      const studentCredentials = JSON.parse(localStorage.getItem('studentCredentials') || '[]');
      
      // Method 2: Check uploadedFiles (payment submissions)
      const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
      
      // Method 3: Check studentAuth (existing logins)
      const studentAuth = JSON.parse(localStorage.getItem('studentAuth') || '[]');
      
      // Method 4: Check industrial_training_courses (all available courses)
      const allCourses = JSON.parse(localStorage.getItem('industrial_training_courses') || '[]');
      
      // Method 5: Check lms_courses (admin portal courses)
      const lmsCourses = JSON.parse(localStorage.getItem('lms_courses') || '[]');

      // Find student's courses from all sources
      let enrolledCourses: Course[] = [];

      // 🔍 Source 1: studentCredentials (Most reliable - admin assigned)
      const credentialCourses = studentCredentials
        .filter((cred: any) => 
          cred.studentEmail === studentData.email || 
          cred.username === studentData.username
        )
        .map((cred: any) => {
          const courseInfo = allCourses.find((c: any) => c.id === cred.courseId) || 
                           lmsCourses.find((c: any) => c.id === cred.courseId);
          
          if (courseInfo) {
            return {
              id: cred.courseId,
              title: courseInfo.title || cred.course,
              description: courseInfo.description,
              category: courseInfo.category,
              duration: courseInfo.duration || '8 Weeks',
              instructorId: 'instructor_001', // Default
              instructorName: courseInfo.instructor || 'Instructor',
              progress: 0,
              status: 'not_started' as const,
              enrolledDate: cred.sentDate || new Date().toISOString(),
              studyHours: 0,
              price: courseInfo.price,
              image: courseInfo.image,
              rating: courseInfo.rating
            };
          }
          return null;
        })
        .filter(Boolean);

      enrolledCourses = [...credentialCourses];

      // 🔍 Source 2: uploadedFiles (Payment submissions)
      const paymentCourses = uploadedFiles
        .filter((file: any) => file.email === studentData.email)
        .map((file: any) => {
          const courseInfo = allCourses.find((c: any) => c.title === file.course) || 
                           lmsCourses.find((c: any) => c.title === file.course);
          
          if (courseInfo) {
            return {
              id: courseInfo.id || file.courseId || `course_${Date.now()}`,
              title: file.course,
              description: courseInfo.description,
              category: courseInfo.category || 'Technical Training',
              duration: courseInfo.duration || '8 Weeks',
              instructorId: 'instructor_001',
              instructorName: courseInfo.instructor || 'Instructor',
              progress: 0,
              status: 'not_started' as const,
              enrolledDate: file.paymentDate || file.uploadDate || new Date().toISOString(),
              studyHours: 0,
              price: file.amount,
              image: courseInfo.image
            };
          }
          return null;
        })
        .filter(Boolean);

      enrolledCourses = [...enrolledCourses, ...paymentCourses];

      // 🔍 Source 3: If no courses found, use current user's course
      if (enrolledCourses.length === 0 && studentData.course) {
        const courseInfo = allCourses.find((c: any) => c.title === studentData.course);
        
        if (courseInfo) {
          enrolledCourses.push({
            id: courseInfo.id || studentData.courseId,
            title: studentData.course,
            description: courseInfo.description,
            category: courseInfo.category,
            duration: courseInfo.duration,
            instructorId: 'instructor_001',
            instructorName: courseInfo.instructor || 'Instructor',
            progress: 0,
            status: 'not_started' as const,
            enrolledDate: studentData.registrationDate,
            studyHours: 0,
            price: courseInfo.price,
            image: courseInfo.image,
            rating: courseInfo.rating
          });
        }
      }

      // Remove duplicates
      const uniqueCourses = Array.from(
        new Map(enrolledCourses.map(course => [course.id, course])).values()
      );

      console.log('Loaded student courses:', uniqueCourses);
      setCourses(uniqueCourses);

      // Save to localStorage for future reference
      localStorage.setItem('studentCourses', JSON.stringify(uniqueCourses));
    } catch (error) {
      console.error('Error loading student courses:', error);
    }
  };

  // ✅ Get instructor details from localStorage
  const getInstructorDetails = (instructorId: string) => {
    try {
      const lmsInstructors = JSON.parse(localStorage.getItem('lms_instructors') || '[]');
      const instructor = lmsInstructors.find((inst: any) => inst.id === instructorId);
      
      if (instructor) {
        return {
          name: instructor.name,
          email: instructor.email,
          specialization: instructor.specialization,
          rating: instructor.rating
        };
      }
    } catch (error) {
      console.error('Error getting instructor details:', error);
    }
    
    return {
      name: 'Instructor',
      email: '',
      specialization: 'Technical Training',
      rating: 4.5
    };
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div 
            className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
            style={{ borderColor: BRAND_COLORS.deepRed }}
          ></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold mb-2" style={{ color: BRAND_COLORS.darkNavy }}>
          No User Found
        </h2>
        <p className="text-gray-600">Please login to view your profile.</p>
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
    <div className="space-y-6 p-4 sm:p-6">
      {/* ✅ UPDATED: Profile Header with Brand Colors */}
      <div 
        className="rounded-2xl p-4 sm:p-6 text-white w-full"
        style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.darkNavy} 0%, ${BRAND_COLORS.darkRoyalBlue} 100%)` }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
          {/* Left Section */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-md"
              style={{ backgroundColor: BRAND_COLORS.white }}
            >
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.fullName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
                />
              ) : (
                <HiUser className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
              )}
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-bold">{user.fullName}</h1>
              <p className="text-xs sm:text-sm opacity-90">
                {user.learnerId} • {user.course}
              </p>
              <p className="text-xs opacity-75 mt-1">
                Member since {new Date(user.registrationDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Right Section */}
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

      {/* ✅ UPDATED: Tabs with Brand Colors */}
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
              style={activeTab === 'profile' ? { borderColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.deepRed } : {}}
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
              style={activeTab === 'courses' ? { borderColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.deepRed } : {}}
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
              style={activeTab === 'settings' ? { borderColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.deepRed } : {}}
            >
              <HiLockClosed className="w-3 h-3 sm:w-4 sm:h-4" /> Settings
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* ✅ Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h2 className="text-sm sm:text-lg font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                  Personal Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 sm:gap-2 px-3 py-1 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors"
                    style={{ 
                      backgroundColor: BRAND_COLORS.deepRed,
                      color: BRAND_COLORS.white 
                    }}
                  >
                    <HiPencilAlt className="w-3 h-3 sm:w-4 sm:h-4" /> Edit
                  </button>
                ) : (
                  <div className="flex gap-1 sm:gap-2 flex-wrap">
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-1 sm:gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg text-xs sm:text-sm hover:bg-green-700"
                    >
                      <HiSave className="w-3 h-3 sm:w-4 sm:h-4" /> Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-1 sm:gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-gray-100 text-gray-700 rounded-lg text-xs sm:text-sm hover:bg-gray-200"
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
                    <label className="block text-xs sm:text-sm font-medium mb-1 flex items-center gap-1 sm:gap-2">
                      <HiUser className="w-3 h-3 sm:w-4 sm:h-4" /> Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.fullName || ''}
                        onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                        className="w-full px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-xs sm:text-sm"
                        style={{ borderColor: BRAND_COLORS.softGrey }}
                      />
                    ) : (
                      <p className="font-medium text-xs sm:text-sm">{user.fullName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1 flex items-center gap-1 sm:gap-2">
                      <HiMail className="w-3 h-3 sm:w-4 sm:h-4" /> Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="w-full px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-xs sm:text-sm"
                        style={{ borderColor: BRAND_COLORS.softGrey }}
                      />
                    ) : (
                      <p className="font-medium text-xs sm:text-sm">{user.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1 flex items-center gap-1 sm:gap-2">
                      <HiPhone className="w-3 h-3 sm:w-4 sm:h-4" /> Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        className="w-full px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-xs sm:text-sm"
                        style={{ borderColor: BRAND_COLORS.softGrey }}
                      />
                    ) : (
                      <p className="font-medium text-xs sm:text-sm">{user.phone || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                  {/* Date of Birth */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1 flex items-center gap-1 sm:gap-2">
                      <HiCalendar className="w-3 h-3 sm:w-4 sm:h-4" /> Date of Birth
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editForm.dateOfBirth || ''}
                        onChange={(e) => setEditForm({...editForm, dateOfBirth: e.target.value})}
                        className="w-full px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-xs sm:text-sm"
                        style={{ borderColor: BRAND_COLORS.softGrey }}
                      />
                    ) : (
                      <p className="font-medium text-xs sm:text-sm">
                        {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1 flex items-center gap-1 sm:gap-2">
                      <HiLocationMarker className="w-3 h-3 sm:w-4 sm:h-4" /> Address
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editForm.address || ''}
                        onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                        rows={2}
                        className="w-full px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-xs sm:text-sm"
                        style={{ borderColor: BRAND_COLORS.softGrey }}
                      />
                    ) : (
                      <p className="font-medium text-xs sm:text-sm">{user.address || 'Not provided'}</p>
                    )}
                  </div>

                  {/* Learner ID */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1 flex items-center gap-1 sm:gap-2">
                      <HiAcademicCap className="w-3 h-3 sm:w-4 sm:h-4" /> Learner ID
                    </label>
                    <p className="font-medium text-xs sm:text-sm">{user.learnerId}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ NEW: Courses Tab with Real Data */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                  Enrolled Courses ({courses.length})
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadStudentCourses(user)}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {/* Courses Statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border p-4" style={{ borderColor: BRAND_COLORS.softGrey }}>
                  <p className="text-sm text-gray-600">Total Courses</p>
                  <h3 className="text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
                    {courses.length}
                  </h3>
                </div>
                <div className="bg-white rounded-lg border p-4" style={{ borderColor: BRAND_COLORS.softGrey }}>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <h3 className="text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
                    {inProgressCourses}
                  </h3>
                </div>
                <div className="bg-white rounded-lg border p-4" style={{ borderColor: BRAND_COLORS.softGrey }}>
                  <p className="text-sm text-gray-600">Completed</p>
                  <h3 className="text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
                    {completedCourses}
                  </h3>
                </div>
                <div className="bg-white rounded-lg border p-4" style={{ borderColor: BRAND_COLORS.softGrey }}>
                  <p className="text-sm text-gray-600">Avg. Progress</p>
                  <h3 className="text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkNavy }}>
                    {averageProgress}%
                  </h3>
                </div>
              </div>

              {/* Courses List */}
              {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => {
                    const instructorDetails = getInstructorDetails(course.instructorId);
                    
                    return (
                      <div 
                        key={course.id} 
                        className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-shadow"
                        style={{ borderColor: BRAND_COLORS.softGrey }}
                      >
                        {/* Course Image */}
                        {course.image && (
                          <div className="h-40 overflow-hidden">
                            <img 
                              src={course.image} 
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="p-4">
                          {/* Course Category */}
                          <div className="flex justify-between items-start mb-3">
                            <span 
                              className="text-xs font-semibold px-2 py-1 rounded"
                              style={{ 
                                backgroundColor: `${BRAND_COLORS.teal}20`,
                                color: BRAND_COLORS.teal
                              }}
                            >
                              {course.category}
                            </span>
                            {course.rating && (
                              <div className="flex items-center">
                                <HiStar className="w-3 h-3 text-yellow-400 mr-1" />
                                <span className="text-xs font-medium">{course.rating}</span>
                              </div>
                            )}
                          </div>

                          {/* Course Title */}
                          <h3 className="font-bold text-gray-900 mb-2">{course.title}</h3>
                          
                          {/* Course Description */}
                          {course.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {course.description}
                            </p>
                          )}

                          {/* Instructor Info */}
                          <div className="flex items-center gap-2 mb-3 p-2 rounded bg-gray-50">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <HiUser className="w-4 h-4 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {instructorDetails.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {instructorDetails.specialization}
                                {instructorDetails.rating && ` • ${instructorDetails.rating}★`}
                              </p>
                            </div>
                          </div>

                          {/* Course Details */}
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="flex items-center text-xs text-gray-600">
                              <HiClock className="w-3 h-3 mr-1" />
                              {course.duration}
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <HiCalendar className="w-3 h-3 mr-1" />
                              Enrolled: {new Date(course.enrolledDate).toLocaleDateString()}
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium" style={{ color: BRAND_COLORS.deepRed }}>
                                {course.progress}%
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${course.progress}%`,
                                  backgroundColor: BRAND_COLORS.deepRed
                                }}
                              ></div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <button
                            className="w-full py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                            style={{ 
                              backgroundColor: BRAND_COLORS.deepRed,
                              color: BRAND_COLORS.white 
                            }}
                            onClick={() => window.location.href = `/courses/${course.id}`}
                          >
                            <span>Continue Learning</span>
                            <HiArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg" style={{ borderColor: BRAND_COLORS.softGrey }}>
                  <HiBookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.softGrey }} />
                  <h3 className="text-lg font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
                    No Courses Enrolled
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You haven't enrolled in any courses yet.
                  </p>
                  <button
                    className="px-6 py-2 rounded-lg font-medium transition-colors"
                    style={{ 
                      backgroundColor: BRAND_COLORS.deepRed,
                      color: BRAND_COLORS.white 
                    }}
                    onClick={() => window.location.href = '/courses'}
                  >
                    Browse Courses
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ✅ Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                Account Settings
              </h2>

              <div className="space-y-4">
                {/* Change Password */}
                <div className="bg-white rounded-lg border p-4" style={{ borderColor: BRAND_COLORS.softGrey }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Change Password</h3>
                      <p className="text-sm text-gray-600 mt-1">Update your account password</p>
                    </div>
                    <button
                      onClick={handleChangePassword}
                      className="px-4 py-2 text-sm rounded-lg font-medium transition-colors"
                      style={{ 
                        backgroundColor: BRAND_COLORS.deepRed,
                        color: BRAND_COLORS.white 
                      }}
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* Export Data */}
                <div className="bg-white rounded-lg border p-4" style={{ borderColor: BRAND_COLORS.softGrey }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Export Data</h3>
                      <p className="text-sm text-gray-600 mt-1">Download your profile data as JSON</p>
                    </div>
                    <button
                      onClick={handleExportData}
                      className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Export
                    </button>
                  </div>
                </div>

                {/* Account Status */}
                <div className="bg-white rounded-lg border p-4" style={{ borderColor: BRAND_COLORS.softGrey }}>
                  <h3 className="font-medium text-gray-900 mb-2">Account Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Account Status</span>
                      <span className={`text-sm font-medium ${user.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Payment Verification</span>
                      <span className={`text-sm font-medium ${user.paymentVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                        {user.paymentVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Member Since</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(user.registrationDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}