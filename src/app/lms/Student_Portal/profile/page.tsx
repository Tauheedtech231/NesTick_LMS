// app/profile/page.tsx (FIXED VERSION - actual courses now show)
'use client';

import { useState, useEffect } from 'react';
import { 
  HiUser, 
  HiMail, 
  HiPhone, 
  HiCalendar, 
  HiAcademicCap,
  HiCheckCircle,
  HiPencilAlt,
  HiSave,
  HiX,
  HiCamera,
  HiTrash,
  HiDocumentText,
  HiDocumentDuplicate,
  HiLockClosed,
  HiEye,
  HiEyeOff,
  HiShieldCheck,
  HiDownload,
  HiStar,
  HiExclamationCircle,
  HiClock,
  HiPlay,
  HiOutlineCheckCircle,
  HiArrowLeft
} from 'react-icons/hi';
import Link from 'next/link';
/* eslint-disable */
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
  role: 'student';
  course: string;
  courseId: string;
  registrationDate: string;
  status: 'active' | 'inactive';
  paymentVerified: boolean;
  learnerId: string;
  profileImage?: string;
};

// Types for courses and certificates
interface StudentCourse {
  id: string;
  studentId: string;
  studentEmail: string;
  courseId: string;
  courseName: string;
  courseTitle?: string;
  instructorName?: string;
  enrolledDate: string;
  progress: number;
  completedModules: number;
  totalModules: number;
  status: 'not_started' | 'in_progress' | 'completed';
  completionPercentage?: number;
  completedDate?: string;
}

interface Certificate {
  id: string;
  certificateId: string;
  studentId: string;
  studentEmail: string;
  studentName: string;
  courseId: string;
  courseName: string;
  issueDate: string;
  expiryDate?: string;
  grade?: string;
  score?: number;
  certificateUrl?: string;
  downloadUrl?: string;
}

interface Enrollment {
  id: string;
  studentId: string;
  studentEmail: string;
  studentName: string;
  courseId: string;
  courseName: string;
  instructorName?: string;
  enrolledDate: string;
  status: 'active' | 'completed' | 'expired';
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'personal' | 'courses' | 'certificates' | 'settings'>('personal');
  
  // Data states
  const [enrolledCourses, setEnrolledCourses] = useState<StudentCourse[]>([]);
  const [completedCourses, setCompletedCourses] = useState<StudentCourse[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  
  // Password change states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPasswordFields, setShowPasswordFields] = useState({ current: false, new: false, confirm: false });
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  // Security states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  // ========== HELPER FUNCTIONS (copied from dashboard) ==========
  const calculateRealProgress = (courseId: string, studentId: string) => {
    try {
      const completedSlidesKey = `completedSlides_${studentId}_${courseId}`;
      const completedSlidesStr = localStorage.getItem(completedSlidesKey);
      const completedSlides = completedSlidesStr ? JSON.parse(completedSlidesStr) : [];
      
      const allSlides = JSON.parse(localStorage.getItem('slides') || '[]');
      const courseSlides = allSlides.filter((s: any) => s.courseId === courseId);
      const totalSlides = courseSlides.length;
      
      const progress = totalSlides > 0 
        ? Math.round((completedSlides.length / totalSlides) * 100) 
        : 0;
      
      return {
        progress,
        completedSlides: completedSlides.length,
        totalSlides
      };
    } catch (error) {
      console.error('Error calculating progress:', error);
      return { progress: 0, completedSlides: 0, totalSlides: 0 };
    }
  };

  const loadAllCourses = () => {
    try {
      const hardcodedCourses = [
        {
          id: 'pipe-fitter',
          title: 'Pipe Fitter',
          category: 'Technical Training',
          description: 'Master industrial pipe fitting techniques',
          duration: '8 Weeks',
          image: "https://images.pexels.com/photos/6124242/pexels-photo-6124242.jpeg",
        },
        {
          id: 'safety-inspector',
          title: 'Safety Inspector',
          category: 'Safety Training',
          description: 'Professional safety inspection training',
          duration: '6 Weeks',
          image: "https://images.pexels.com/photos/34082713/pexels-photo-34082713.jpeg",
        },
        {
          id: 'welding',
          title: 'Professional Welding',
          category: 'Technical Training',
          description: 'Comprehensive welding training',
          duration: '10 Weeks',
          image: "https://images.pexels.com/photos/7650512/pexels-photo-7650512.jpeg",
        }
      ];
      
      const localStorageCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      const allCourses = [...hardcodedCourses, ...localStorageCourses];
      
      const uniqueCourses = allCourses.filter((course, index, self) => 
        index === self.findIndex((c) => c.id === course.id)
      );
      
      return uniqueCourses;
    } catch (error) {
      console.error('Error loading courses:', error);
      return [];
    }
  };

  const findStudentEnrollments = (studentData: any) => {
    try {
      const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
      
      const studentEnrollments = enrollments.filter((e: any) => {
        if (e.studentEmail && studentData.email && 
            e.studentEmail.toLowerCase() === studentData.email.toLowerCase()) {
          return true;
        }
        if (e.studentId && studentData.id && e.studentId === studentData.id) {
          return true;
        }
        if (e.studentId && studentData.userId && e.studentId === studentData.userId) {
          return true;
        }
        if (e.studentName && studentData.fullName && 
            e.studentName.toLowerCase().includes(studentData.fullName.toLowerCase())) {
          return true;
        }
        return false;
      });
      
      return studentEnrollments;
    } catch (error) {
      console.error('Error finding enrollments:', error);
      return [];
    }
  };

  const loadStudentCourses = (studentData: any) => {
    try {
      // Find enrollments
      const studentEnrollments = findStudentEnrollments(studentData);
      const allCourses = loadAllCourses();
      let enrolledCourseIds = studentEnrollments.map((e: any) => e.courseId);

      // Also check studentCourses backup
      const studentCoursesStr = localStorage.getItem('studentCourses');
      if (studentCoursesStr) {
        const studentCourses = JSON.parse(studentCoursesStr);
        studentCourses.forEach((sc: any) => {
          if (!enrolledCourseIds.includes(sc.id) && 
              (sc.studentId === studentData.id || sc.studentEmail === studentData.email)) {
            enrolledCourseIds.push(sc.id);
          }
        });
      }

      // If still no enrollments and this is demo user, create demo enrollments
      if (enrolledCourseIds.length === 0 && studentData.email === 'student@gmail.com') {
        console.log('No enrollments found, creating demo enrollments for demo user');
        const demoEnrollments = [
          {
            id: `enroll_demo_1_${studentData.id}`,
            courseId: 'pipe-fitter',
            courseTitle: 'Pipe Fitter',
            studentId: studentData.id,
            studentName: studentData.fullName || studentData.name,
            studentEmail: studentData.email,
            studentPhone: studentData.phone || '',
            enrollmentDate: new Date().toISOString(),
            status: 'active'
          },
          {
            id: `enroll_demo_2_${studentData.id}`,
            courseId: 'safety-inspector',
            courseTitle: 'Safety Inspector',
            studentId: studentData.id,
            studentName: studentData.fullName || studentData.name,
            studentEmail: studentData.email,
            studentPhone: studentData.phone || '',
            enrollmentDate: new Date().toISOString(),
            status: 'active'
          },
          {
            id: `enroll_demo_3_${studentData.id}`,
            courseId: 'welding',
            courseTitle: 'Professional Welding',
            studentId: studentData.id,
            studentName: studentData.fullName || studentData.name,
            studentEmail: studentData.email,
            studentPhone: studentData.phone || '',
            enrollmentDate: new Date().toISOString(),
            status: 'active'
          }
        ];

        const existingEnrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
        const updatedEnrollments = [...existingEnrollments, ...demoEnrollments];
        localStorage.setItem('enrollments', JSON.stringify(updatedEnrollments));

        enrolledCourseIds = ['pipe-fitter', 'safety-inspector', 'welding'];
        studentEnrollments.push(...demoEnrollments);
      }

      // Build enrolled courses with real progress
      const enrolled: StudentCourse[] = [];
      const completed: StudentCourse[] = [];

      enrolledCourseIds.forEach((courseId: string) => {
        const course = allCourses.find((c: any) => c.id === courseId);
        if (!course) return;

        const enrollment = studentEnrollments.find((e: any) => e.courseId === courseId);
        const { progress, completedSlides, totalSlides } = calculateRealProgress(courseId, studentData.id);
        const status = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started';

        const courseData: StudentCourse = {
          id: courseId,
          studentId: studentData.id,
          studentEmail: studentData.email,
          courseId: courseId,
          courseName: course.title,
          instructorName: course.instructorName || 'Instructor',
          enrolledDate: enrollment?.enrolledDate || new Date().toISOString(),
          progress,
          completedModules: completedSlides,
          totalModules: totalSlides || 1,
          status,
          completedDate: progress === 100 ? new Date().toISOString() : undefined
        };

        if (status === 'completed') {
          completed.push(courseData);
        } else {
          enrolled.push(courseData);
        }
      });

      setEnrolledCourses(enrolled);
      setCompletedCourses(completed);

      // Update studentCourses for consistency
      const allCoursesData = [...enrolled, ...completed];
      localStorage.setItem('studentCourses', JSON.stringify(allCoursesData));

    } catch (error) {
      console.error('Error loading student courses:', error);
    }
  };

  const loadCertificates = (studentData: any) => {
    try {
      const certificatesStr = localStorage.getItem('certificates') || '[]';
      let allCertificates = JSON.parse(certificatesStr);

      // If no certificates but have completed courses, create demo certificates
      if (allCertificates.length === 0 && completedCourses.length > 0) {
        allCertificates = completedCourses.map((course, index) => ({
          id: `cert-${Date.now()}-${index}`,
          certificateId: `CERT-${new Date().getFullYear()}-${String(index + 1).padStart(4, '0')}`,
          studentId: studentData.id,
          studentEmail: studentData.email,
          studentName: studentData.fullName,
          courseId: course.courseId,
          courseName: course.courseName,
          issueDate: course.completedDate || new Date().toISOString(),
          grade: 'A',
          score: 85 + Math.floor(Math.random() * 15),
          downloadUrl: '#'
        }));
        localStorage.setItem('certificates', JSON.stringify(allCertificates));
      }

      const userCertificates = allCertificates.filter((cert: Certificate) => 
        cert.studentEmail === studentData.email || cert.studentId === studentData.id
      );
      setCertificates(userCertificates);
    } catch (error) {
      console.error('Error loading certificates:', error);
    }
  };

  useEffect(() => {
    const loadUserData = () => {
      try {
        const currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) {
          setLoading(false);
          return;
        }
        
        const userData = JSON.parse(currentUserStr);
        setUser(userData);
        setEditForm({
          fullName: userData.fullName,
          phone: userData.phone || '',
          address: userData.address || ''
        });
        if (userData.profileImage) {
          setImagePreview(userData.profileImage);
        }

        // Load courses
        loadStudentCourses(userData);
        // Load certificates (after courses are loaded)
        setTimeout(() => {
          loadCertificates(userData);
        }, 100);

      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'enrollments' || 
          e.key?.startsWith('completedSlides_') || 
          e.key === 'studentCourses' ||
          e.key === 'currentUser') {
        loadUserData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('courseProgressUpdated', loadUserData);
    window.addEventListener('enrollmentUpdated', loadUserData);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('courseProgressUpdated', loadUserData);
      window.removeEventListener('enrollmentUpdated', loadUserData);
    };
  }, []);

  // ========== IMAGE UPLOAD HANDLER ==========
  const handleImageUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'profile_image');

      const response = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);

      const result = await response.json();

      if (result.success && user) {
        const updatedUser = { ...user, profileImage: result.data.secure_url };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image. Please try again.');
      if (user?.profileImage) {
        setImagePreview(user.profileImage);
      } else {
        setImagePreview('');
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageRemove = () => {
    if (!user) return;
    const updatedUser = { ...user, profileImage: '' };
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setImagePreview('');
  };

  const handleSave = () => {
    if (!user) return;
    const updatedUser = { ...user, ...editForm };
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (user) {
      setEditForm({
        fullName: user.fullName,
        phone: user.phone || '',
        address: user.address || ''
      });
    }
    setIsEditing(false);
  };

  const handlePasswordChange = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setPasswordMessage({ type: 'error', message: 'All fields are required' });
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setPasswordMessage({ type: 'error', message: 'New passwords do not match' });
      return;
    }

    if (passwords.new.length < 8) {
      setPasswordMessage({ type: 'error', message: 'Password must be at least 8 characters' });
      return;
    }

    const storedPassword = localStorage.getItem('userPassword') || 'password123';
    if (passwords.current !== storedPassword) {
      setPasswordMessage({ type: 'error', message: 'Current password is incorrect' });
      return;
    }

    localStorage.setItem('userPassword', passwords.new);
    setPasswordMessage({ type: 'success', message: 'Password changed successfully' });
    setPasswords({ current: '', new: '', confirm: '' });
    setTimeout(() => {
      setShowPasswordForm(false);
      setPasswordMessage(null);
    }, 2000);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
        <Link 
          href="/login"
          className="inline-block mt-4 px-6 py-2 text-white rounded-lg"
          style={{ backgroundColor: BRAND_COLORS.deepRed }}
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 pb-12">
      {/* Profile Header */}
      <div 
        className="rounded-2xl p-6 text-white mb-6 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.darkNavy} 0%, ${BRAND_COLORS.darkRoyalBlue} 100%)` }}
      >
        <div className="flex items-center gap-4">
          {/* Profile Image */}
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-white/30">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {getInitials(user.fullName)}
                </div>
              )}
            </div>
            {uploadingImage && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 flex gap-1">
              <label className="cursor-pointer bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-100 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                  disabled={uploadingImage}
                />
                <HiCamera className="w-4 h-4" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
              </label>
              {imagePreview && (
                <button
                  onClick={handleImageRemove}
                  className="bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-100 transition-colors"
                  disabled={uploadingImage}
                >
                  <HiTrash className="w-4 h-4 text-red-600" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-xl font-bold">{user.fullName}</h1>
            <p className="text-sm opacity-90">{user.learnerId}</p>
            <p className="text-xs opacity-75 mt-1">
              Member since {new Date(user.registrationDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              user.status === 'active' ? 'bg-green-500' : 'bg-red-500'
            } text-white`}>
              {user.status.toUpperCase()}
            </span>
            {user.paymentVerified && (
              <span className="flex items-center gap-1 text-xs bg-green-600/30 px-2 py-1 rounded-full">
                <HiCheckCircle className="w-3 h-3" /> Payment Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'personal', label: 'Personal', icon: HiUser },
            { id: 'courses', label: 'Courses', icon: HiDocumentText },
            { id: 'certificates', label: 'Certificates', icon: HiDocumentDuplicate },
            { id: 'settings', label: 'Settings', icon: HiLockClosed }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-4 py-4 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-b-2 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                style={{ 
                  borderBottom: activeTab === tab.id ? `2px solid ${BRAND_COLORS.deepRed}` : 'none',
                  color: activeTab === tab.id ? BRAND_COLORS.deepRed : undefined
                }}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* ===== PERSONAL TAB ===== */}
          {activeTab === 'personal' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                  Personal Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: BRAND_COLORS.deepRed }}
                  >
                    <HiPencilAlt className="w-4 h-4" /> Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                    >
                      <HiSave className="w-4 h-4" /> Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
                    >
                      <HiX className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.fullName || ''}
                      onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deepRed/20"
                    />
                  ) : (
                    <p className="font-medium">{user.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                  <p className="font-medium">{user.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deepRed/20"
                      placeholder="+92 XXX XXXXXXX"
                    />
                  ) : (
                    <p className="font-medium">{user.phone || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.address || ''}
                      onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deepRed/20"
                      placeholder="Your address"
                    />
                  ) : (
                    <p className="font-medium">{user.address || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Learner ID</label>
                  <p className="font-medium">{user.learnerId}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Registration Date</label>
                  <p className="font-medium">
                    {new Date(user.registrationDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ===== COURSES TAB ===== */}
          {activeTab === 'courses' && (
            <div>
              <h2 className="text-lg font-bold mb-6" style={{ color: BRAND_COLORS.darkNavy }}>
                My Learning
              </h2>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-sm text-blue-600 mb-1">Total Courses</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {enrolledCourses.length + completedCourses.length}
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                  <p className="text-sm text-yellow-600 mb-1">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-700">{enrolledCourses.length}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <p className="text-sm text-green-600 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-green-700">{completedCourses.length}</p>
                </div>
              </div>

              {/* Enrolled Courses */}
              <div className="mb-8">
                <h3 className="text-md font-semibold mb-4 flex items-center gap-2" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                  <HiPlay className="w-5 h-5" /> Courses in Progress ({enrolledCourses.length})
                </h3>
                
                {enrolledCourses.length > 0 ? (
                  <div className="space-y-4">
                    {enrolledCourses.map((course, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{course.courseName}</h4>
                            <p className="text-sm text-gray-600 mt-1">Instructor: {course.instructorName || 'Course Instructor'}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <HiCalendar className="w-3 h-3" />
                                Enrolled: {new Date(course.enrolledDate).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <HiDocumentText className="w-3 h-3" />
                                {course.completedModules || 0}/{course.totalModules || 1} lessons
                              </span>
                            </div>
                          </div>
                          <div className="sm:text-right">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
                              <span className="text-xl font-bold" style={{ color: BRAND_COLORS.deepRed }}>
                                {course.progress || 0}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500" 
                            style={{ width: `${course.progress || 0}%`, backgroundColor: BRAND_COLORS.deepRed }}
                          ></div>
                        </div>
                        <div className="mt-4">
                          <Link
                            href={`/lms/Student_Portal/my-courses/${course.courseId}`}
                            className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                            style={{ color: BRAND_COLORS.deepRed }}
                          >
                            Continue Learning <HiArrowLeft className="w-4 h-4 rotate-180" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <HiDocumentText className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 mb-2">No enrolled courses yet</p>
                    <p className="text-sm text-gray-400">Browse courses to start learning!</p>
                    <Link
                      href="/lms/Student_Portal/available-courses"
                      className="inline-block mt-4 px-6 py-2 text-white rounded-lg text-sm"
                      style={{ backgroundColor: BRAND_COLORS.deepRed }}
                    >
                      Browse Courses
                    </Link>
                  </div>
                )}
              </div>

              {/* Completed Courses */}
              {completedCourses.length > 0 && (
                <div className="border-t pt-8">
                  <h3 className="text-md font-semibold mb-4 flex items-center gap-2" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                    <HiOutlineCheckCircle className="w-5 h-5 text-green-600" /> Completed Courses ({completedCourses.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {completedCourses.map((course, idx) => (
                      <div key={idx} className="border border-green-200 bg-green-50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <HiCheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="font-medium text-gray-900">{course.courseName}</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              Completed on {new Date(course.completedDate || course.enrolledDate).toLocaleDateString()}
                            </p>
                            <Link
                              href={`/lms/Student_Portal/certificates`}
                              className="inline-flex items-center gap-1 text-xs text-green-600 hover:underline mt-2"
                            >
                              <HiStar className="w-3 h-3" /> View Certificate
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== CERTIFICATES TAB ===== */}
          {activeTab === 'certificates' && (
            <div>
              <h2 className="text-lg font-bold mb-6" style={{ color: BRAND_COLORS.darkNavy }}>
                My Certificates
              </h2>

              {certificates.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {certificates.map((cert, idx) => (
                    <div 
                      key={idx} 
                      className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 hover:shadow-lg transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <HiStar className="w-6 h-6 text-yellow-500" />
                            <h3 className="font-bold text-lg text-gray-900">{cert.courseName}</h3>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">
                            <span className="font-medium">Certificate ID:</span> {cert.certificateId}
                          </p>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3 text-sm">
                            <div>
                              <p className="text-gray-500 text-xs">Issue Date</p>
                              <p className="font-medium">
                                {new Date(cert.issueDate).toLocaleDateString()}
                              </p>
                            </div>
                            {cert.grade && (
                              <div>
                                <p className="text-gray-500 text-xs">Grade</p>
                                <p className="font-medium text-green-600">{cert.grade}</p>
                              </div>
                            )}
                            {cert.score && (
                              <div>
                                <p className="text-gray-500 text-xs">Score</p>
                                <p className="font-medium text-blue-600">{cert.score}%</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex sm:flex-col gap-2">
                          <button
                            onClick={() => {
                              const certificateHTML = `
                                <!DOCTYPE html>
                                <html>
                                <head>
                                  <title>Certificate of Completion</title>
                                  <style>
                                    body { font-family: Arial, sans-serif; }
                                    .certificate { 
                                      max-width: 800px; 
                                      margin: 50px auto; 
                                      padding: 40px;
                                      border: 20px solid #B11217;
                                      text-align: center;
                                    }
                                  </style>
                                </head>
                                <body>
                                  <div class="certificate">
                                    <h1>Certificate of Completion</h1>
                                    <h2>${cert.courseName}</h2>
                                    <p>Presented to</p>
                                    <h3>${user.fullName}</h3>
                                    <p>Certificate ID: ${cert.certificateId}</p>
                                    <p>Issue Date: ${new Date(cert.issueDate).toLocaleDateString()}</p>
                                  </div>
                                </body>
                                </html>
                              `;
                              
                              const blob = new Blob([certificateHTML], { type: 'text/html' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `${cert.courseName}-Certificate.html`;
                              a.click();
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                          >
                            <HiDownload className="w-4 h-4" /> Download
                          </button>
                          
                          <button
                            onClick={() => window.print()}
                            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                          >
                            Print
                          </button>
                        </div>
                      </div>

                      {/* Certificate Preview */}
                      <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-400 mb-2">Certificate Preview</p>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center">
                            <HiStar className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Certificate of Achievement</p>
                            <p className="text-xs text-gray-500">Awarded to {user.fullName}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <HiDocumentDuplicate className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No Certificates Yet</h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    Complete courses to earn certificates. Each completed course will generate a unique certificate for you.
                  </p>
                  {completedCourses.length > 0 ? (
                    <p className="text-sm text-green-600 mt-4">
                      You have {completedCourses.length} completed course(s). Certificates will appear here soon!
                    </p>
                  ) : (
                    <Link
                      href="/lms/Student_Portal/my-courses"
                      className="inline-block mt-6 px-6 py-2 text-white rounded-lg text-sm"
                      style={{ backgroundColor: BRAND_COLORS.deepRed }}
                    >
                      Go to My Courses
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ===== SETTINGS TAB ===== */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                Account Settings
              </h2>

              {/* Password Change */}
              <div className="border rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-semibold flex items-center gap-2" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                    <HiLockClosed className="w-5 h-5" /> Password & Security
                  </h3>
                  {!showPasswordForm && (
                    <button
                      onClick={() => setShowPasswordForm(true)}
                      className="px-4 py-2 rounded-lg text-white text-sm flex items-center gap-2 hover:opacity-90"
                      style={{ backgroundColor: BRAND_COLORS.deepRed }}
                    >
                      <HiPencilAlt className="w-4 h-4" /> Change Password
                    </button>
                  )}
                </div>

                {showPasswordForm && (
                  <div className="space-y-4">
                    {passwordMessage && (
                      <div className={`p-3 rounded-lg flex items-center gap-2 ${
                        passwordMessage.type === 'success' 
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {passwordMessage.type === 'success' ? (
                          <HiCheckCircle className="w-5 h-5" />
                        ) : (
                          <HiExclamationCircle className="w-5 h-5" />
                        )}
                        {passwordMessage.message}
                      </div>
                    )}

                    {[
                      { label: 'Current Password', key: 'current' },
                      { label: 'New Password', key: 'new' },
                      { label: 'Confirm Password', key: 'confirm' }
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                        <div className="relative">
                          <input
                            type={showPasswordFields[field.key as keyof typeof showPasswordFields] ? 'text' : 'password'}
                            value={passwords[field.key as keyof typeof passwords]}
                            onChange={(e) => setPasswords({...passwords, [field.key]: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deepRed/20"
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswordFields({
                              ...showPasswordFields,
                              [field.key]: !showPasswordFields[field.key as keyof typeof showPasswordFields]
                            })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                          >
                            {showPasswordFields[field.key as keyof typeof showPasswordFields] ? (
                              <HiEyeOff className="w-4 h-4" />
                            ) : (
                              <HiEye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handlePasswordChange}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                      >
                        Update Password
                      </button>
                      <button
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswords({ current: '', new: '', confirm: '' });
                          setPasswordMessage(null);
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Security Settings */}
              <div className="border rounded-lg p-6">
                <h3 className="text-md font-semibold flex items-center gap-2 mb-4" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                  <HiShieldCheck className="w-5 h-5" /> Security Options
                </h3>

                <div className="space-y-6">
                  {/* Two-Factor Authentication */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <button
                      onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                        twoFactorEnabled ? 'bg-green-600' : 'bg-gray-400'
                      }`}
                    >
                      {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  {/* Session Timeout */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Session Timeout</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['15', '30', '60', '120'].map((mins) => (
                        <button
                          key={mins}
                          onClick={() => setSessionTimeout(mins)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            sessionTimeout === mins
                              ? 'text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          style={{ backgroundColor: sessionTimeout === mins ? BRAND_COLORS.deepRed : undefined }}
                        >
                          {mins} min
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                <h3 className="text-md font-semibold text-red-600 flex items-center gap-2 mb-4">
                  <HiLockClosed className="w-5 h-5" /> Danger Zone
                </h3>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">
                  Delete Account
                </button>
                <p className="text-sm text-gray-600 mt-2">This action cannot be undone.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}