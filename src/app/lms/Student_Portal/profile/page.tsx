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
  HiPencilAlt,
  HiSave,
  HiX,
  HiClock,
  HiStar,
  HiArrowRight,
  HiRefresh
} from 'react-icons/hi';
/* eslint-disable */

// ✅ Brand Colors
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
  instructorEmail?: string;
  instructorSpecialization?: string;
  instructorRating?: number;
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
  const [refreshing, setRefreshing] = useState(false);

  // ========== 🔥 FIXED: REAL INSTRUCTOR FIND KARO - SIRF TITLE SE! ==========
  const findRealInstructorByCourseTitle = (courseTitle: string) => {
    try {
      if (!courseTitle) return null;
      
      console.log('\n🔍 SEARCHING REAL INSTRUCTOR FOR COURSE:', courseTitle);
      
      // Get all instructors
      const allInstructors = JSON.parse(localStorage.getItem('lms_instructors') || '[]');
      
      // 🔥 FILTER OUT DEMO INSTRUCTORS!
      const realInstructors = allInstructors.filter((inst: any) => 
        !inst.id?.includes('demo') && 
        !inst.name?.includes('Demo') &&
        !inst.name?.includes('demo') &&
        inst.name !== 'Instructor' &&
        inst.name !== 'Not Assigned'
      );
      
      console.log(`📋 REAL Instructors available: ${realInstructors.length}`);
      
      // 🔥 SIRF TITLE SE MATCH KARO - ID SE NAHI!
      const instructor = realInstructors.find((inst: any) => {
        const instCourseTitle = inst.assignedCourse?.title?.toLowerCase().trim();
        const searchTitle = courseTitle?.toLowerCase().trim();
        const isMatch = instCourseTitle === searchTitle;
        
        if (isMatch) {
          console.log(`✅ MATCH FOUND! REAL Instructor: ${inst.name} -> Course: ${inst.assignedCourse?.title}`);
        }
        
        return isMatch;
      });
      
      if (instructor) {
        console.log(`✅ SELECTED: ${instructor.name} for course: ${courseTitle}`);
        return instructor;
      }
      
      // 🔥 FALLBACK: Assignments se instructor dhundho
      console.log('⚠️ No direct match, checking assignments...');
      const allAssignments = JSON.parse(localStorage.getItem('instructor_assignments') || '[]');
      const assignment = allAssignments.find((a: any) => 
        a.courseTitle?.toLowerCase().trim() === courseTitle?.toLowerCase().trim()
      );
      
      if (assignment?.instructorId) {
        const instructorFromAssignment = realInstructors.find((inst: any) => 
          inst.id === assignment.instructorId
        );
        if (instructorFromAssignment) {
          console.log(`✅ Found via assignments: ${instructorFromAssignment.name}`);
          return instructorFromAssignment;
        }
      }
      
      console.log(`❌ NO REAL INSTRUCTOR found for course: ${courseTitle}`);
      return null;
    } catch (error) {
      console.error('Error finding instructor:', error);
      return null;
    }
  };

  // ========== 🔥 FIXED: STUDENT COURSES LOAD KARO - SIRF TITLE SE! ==========
  const loadStudentCourses = (studentData: User) => {
    try {
      console.log('\n========== 🚀 LOADING STUDENT COURSES ==========');
      console.log('📋 Student:', studentData.fullName, '- Course:', studentData.course);
      console.log('⚠️ WARNING: Student courseId "' + studentData.courseId + '" IGNORED! Using title match only.');

      // 📚 Get all courses
      const industrialCourses = JSON.parse(localStorage.getItem('industrial_training_courses') || '[]');
      const lmsCourses = JSON.parse(localStorage.getItem('lms_courses') || '[]');
      const allCourses = [...industrialCourses, ...lmsCourses];
      
      console.log('\n📚 Available courses in system:');
      allCourses.forEach(c => console.log(`   - ${c.title} (${c.id})`));

      // 🔥 FIX 1: SIRF TITLE SE COURSE DHUNDHO - STUDENT KI ID IGNORE KARO!
      const studentCourseTitle = studentData.course; // "Pipe Fitter"
      
      const courseInfo = allCourses.find((c: any) => 
        c.title?.toLowerCase().trim() === studentCourseTitle?.toLowerCase().trim()
      );

      if (!courseInfo) {
        console.log('❌ Course not found:', studentCourseTitle);
        return;
      }

      console.log(`\n✅ Course found: ${courseInfo.title} (${courseInfo.id})`);

      // 🔥 FIX 2: REAL INSTRUCTOR DHUNDHO - SIRF TITLE SE!
      const instructor = findRealInstructorByCourseTitle(courseInfo.title);
      
      // ✅ Create course with REAL instructor data
      const newCourse: Course = {
        id: courseInfo.id,                    // ✅ ORIGINAL ID: "pipe-fitter"
        title: courseInfo.title,              // ✅ "Pipe Fitter"
        description: courseInfo.description,
        category: courseInfo.category || 'Technical Training',
        duration: courseInfo.duration || '8 Weeks',
        instructorId: instructor?.id || '',    // ✅ REAL INSTRUCTOR ID
        instructorName: instructor?.name || 'Not Assigned', // ✅ REAL INSTRUCTOR NAME
        instructorEmail: instructor?.email || '',
        instructorSpecialization: instructor?.specialization || 'Technical Training',
        instructorRating: instructor?.rating || 0,
        progress: 0,
        status: 'not_started' as const,
        enrolledDate: studentData.registrationDate.split('T')[0],
        studyHours: 0,
        price: courseInfo.price,
        image: courseInfo.image,
        rating: courseInfo.rating
      };

      console.log('\n✅ COURSE CREATED WITH REAL INSTRUCTOR:');
      console.log(`   Course: ${newCourse.title}`);
      console.log(`   Instructor: ${newCourse.instructorName}`);
      console.log(`   Instructor ID: ${newCourse.instructorId}`);
      console.log(`   Course ID: ${newCourse.id}`);

      // 💾 Save to localStorage
      setCourses([newCourse]);
      localStorage.setItem('studentCourses', JSON.stringify([newCourse]));
      
      console.log('\n✅ StudentCourses saved to localStorage!');

    } catch (error) {
      console.error('Error loading student courses:', error);
    }
  };

  // ========== 📋 LOAD DATA ON MOUNT ==========
  useEffect(() => {
    const loadData = () => {
      try {
        const currentUserStr = localStorage.getItem('currentUser');
        
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

          // 🔥 FIX 3: PEHLE CHECK KARO AGAR REAL INSTRUCTOR DATA HAI?
          const studentCoursesStr = localStorage.getItem('studentCourses');
          if (studentCoursesStr) {
            const existingCourses = JSON.parse(studentCoursesStr);
            
            // Check if existing courses have REAL instructors
            const hasRealInstructor = existingCourses.some((c: any) => 
              !c.instructorName?.includes('Demo') && 
              !c.instructorName?.includes('demo') &&
              !c.instructorId?.includes('demo') &&
              c.instructorName !== 'Not Assigned' &&
              c.instructorName !== 'Instructor' &&
              c.instructorId !== ''
            );
            
            if (hasRealInstructor) {
              console.log('\n✅ Using existing REAL instructor data from localStorage');
              console.log('📚 Courses:', existingCourses.map((c: any) => ({
                title: c.title,
                instructor: c.instructorName
              })));
              setCourses(existingCourses);
              setLoading(false);
              return; // ✅ Don't reload - use existing data!
            } else {
              console.log('\n⚠️ Existing courses have DEMO instructors - reloading...');
              localStorage.removeItem('studentCourses'); // Clear demo data
            }
          }
          
          // Load fresh with REAL instructors
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

  // ========== 🔄 REFRESH COURSES ==========
  const refreshCourses = () => {
    if (user) {
      setRefreshing(true);
      // Clear existing data and reload
      localStorage.removeItem('studentCourses');
      loadStudentCourses(user);
      setTimeout(() => setRefreshing(false), 1000);
    }
  };

  // ========== 💾 SAVE PROFILE ==========
  const handleSaveProfile = () => {
    if (!user) return;
    const updatedUser = { ...user, ...editForm };
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
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
  const averageProgress = courses.length > 0 
    ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length)
    : 0;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Profile Header */}
      <div 
        className="rounded-2xl p-4 sm:p-6 text-white w-full"
        style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.darkNavy} 0%, ${BRAND_COLORS.darkRoyalBlue} 100%)` }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-md bg-white">
              <HiUser className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">{user.fullName}</h1>
              <p className="text-xs sm:text-sm opacity-90">
                {user.learnerId} • {user.course}
              </p>
              <p className="text-xs opacity-75 mt-1">
                Member since {new Date(user.registrationDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              user.status === 'active' ? 'bg-green-500' : 'bg-red-500'
            } text-white`}>
              {user.status.toUpperCase()}
            </span>
            {user.paymentVerified && (
              <HiCheckCircle className="w-5 h-5 text-green-300" />
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-3 px-6 text-sm font-medium border-b-2 flex items-center gap-2 ${
                activeTab === 'profile'
                  ? 'border-deepRed text-deepRed'
                  : 'border-transparent text-gray-500'
              }`}
              style={activeTab === 'profile' ? { borderColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.deepRed } : {}}
            >
              <HiUser className="w-4 h-4" /> Profile
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`py-3 px-6 text-sm font-medium border-b-2 flex items-center gap-2 ${
                activeTab === 'courses'
                  ? 'border-deepRed text-deepRed'
                  : 'border-transparent text-gray-500'
              }`}
              style={activeTab === 'courses' ? { borderColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.deepRed } : {}}
            >
              <HiBookOpen className="w-4 h-4" /> Courses ({courses.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3 px-6 text-sm font-medium border-b-2 flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'border-deepRed text-deepRed'
                  : 'border-transparent text-gray-500'
              }`}
              style={activeTab === 'settings' ? { borderColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.deepRed } : {}}
            >
              <HiLockClosed className="w-4 h-4" /> Settings
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                  Personal Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white"
                    style={{ backgroundColor: BRAND_COLORS.deepRed }}
                  >
                    <HiPencilAlt className="w-4 h-4" /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"
                    >
                      <HiSave className="w-4 h-4" /> Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
                    >
                      <HiX className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                      <HiUser className="w-4 h-4" /> Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.fullName || ''}
                        onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    ) : (
                      <p className="font-medium">{user.fullName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                      <HiMail className="w-4 h-4" /> Email
                    </label>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                      <HiPhone className="w-4 h-4" /> Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    ) : (
                      <p className="font-medium">{user.phone || 'Not provided'}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                      <HiAcademicCap className="w-4 h-4" /> Learner ID
                    </label>
                    <p className="font-medium">{user.learnerId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                      <HiCalendar className="w-4 h-4" /> Registration Date
                    </label>
                    <p className="font-medium">
                      {new Date(user.registrationDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ FIXED: Courses Tab - REAL INSTRUCTOR SHOW HOGA! */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                  My Courses ({courses.length})
                </h2>
                <button
                  onClick={refreshCourses}
                  disabled={refreshing}
                  className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                >
                  <HiRefresh className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <div key={course.id} className="bg-white rounded-xl border overflow-hidden hover:shadow-lg">
                      {course.image && (
                        <div className="h-40 overflow-hidden">
                          <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs font-semibold px-2 py-1 rounded bg-teal-100 text-teal-800">
                            {course.category}
                          </span>
                        </div>
                        
                        <h3 className="font-bold text-gray-900 mb-2">{course.title}</h3>
                        
                        {/* ✅ FIXED: REAL INSTRUCTOR NAME SHOW HOGA! */}
                        <div className="flex items-center gap-2 mb-3 p-2 rounded bg-gray-50">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <HiUser className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {course.instructorName !== 'Not Assigned' && !course.instructorName.includes('Demo')
                                ? course.instructorName 
                                : 'No instructor assigned'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {course.instructorSpecialization || 'Technical Training'}
                              {course.instructorRating ? ` • ${course.instructorRating}★` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                          <div className="flex items-center">
                            <HiClock className="w-3 h-3 mr-1" />
                            {course.duration}
                          </div>
                          <div>
                            Enrolled: {new Date(course.enrolledDate).toLocaleDateString()}
                          </div>
                        </div>

                        <button
                          className="w-full py-2 text-sm font-medium rounded-lg text-white flex items-center justify-center gap-2"
                          style={{ backgroundColor: BRAND_COLORS.deepRed }}
                          onClick={() => window.location.href = `/lms/Student_Portal/courses/${course.id}`}
                        >
                          <span>Continue Learning</span>
                          <HiArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <HiBookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No Courses Enrolled</h3>
                  <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet.</p>
                  <button
                    className="px-6 py-2 rounded-lg text-white"
                    style={{ backgroundColor: BRAND_COLORS.deepRed }}
                    onClick={() => window.location.href = '/courses'}
                  >
                    Browse Courses
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                Account Settings
              </h2>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Account Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className={`text-sm font-medium ${user.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                        {user.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Payment</span>
                      <span className={`text-sm font-medium ${user.paymentVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                        {user.paymentVerified ? 'Verified' : 'Pending'}
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