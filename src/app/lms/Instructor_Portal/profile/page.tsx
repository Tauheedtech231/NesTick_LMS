// app/lms/Instructor_Portal/profile/page.tsx
'use client';
/* eslint-disable */

import { useEffect, useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Book, 
  Award, 
  GraduationCap, 
  Briefcase,
  Star,
  CheckCircle,
  XCircle,
  Users,
  Clock,
  MapPin
} from 'lucide-react';

// Brand Colors
const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  white: '#FFFFFF',
  lightGrey: '#F4F6F8',
  softGrey: '#E5E7EB',
  darkGrey: '#1F2933',
  teal: '#1FB6C9',
  brightRed: '#D32F2F'
}

export default function ProfilePage() {
  const [instructor, setInstructor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assignedCourse, setAssignedCourse] = useState<any>(null);

  useEffect(() => {
    // Fetch current logged-in instructor from localStorage
    const fetchInstructorData = () => {
      try {
        const userData = localStorage.getItem('currentUser');
        
        if (userData) {
          const user = JSON.parse(userData);
          console.log('Profile - Current user:', user);
          
          if (user.role === 'instructor') {
            // Get instructor credentials from instructor_users
            const instructorUsers = JSON.parse(localStorage.getItem('instructor_users') || '[]');
            const instructorUser = instructorUsers.find((inst: any) => 
              inst.email === user.email || inst.id === user.id
            );
            
            // Get instructor profile from lms_instructors
            const lmsInstructors = JSON.parse(localStorage.getItem('lms_instructors') || '[]');
            const instructorProfile = lmsInstructors.find((inst: any) => 
              inst.email === user.email || inst.id === user.id
            );
            
            // Merge both data sources
            let instructorData = {
              // From instructor_users (login credentials)
              id: instructorUser?.id || user.id,
              email: instructorUser?.email || user.email,
              password: instructorUser?.password || user.password,
              name: instructorUser?.name || user.name || user.email.split('@')[0],
              phone: instructorUser?.phone || 'Not available',
              courseId: instructorUser?.courseId,
              status: instructorUser?.status || 'active',
              createdAt: instructorUser?.createdAt || new Date().toISOString(),
              lastLogin: instructorUser?.lastLogin || user.loginTime,
              
              // From lms_instructors (profile data)
              specialization: instructorProfile?.specialization || 'Not specified',
              experience: instructorProfile?.experience || 'Not specified',
              qualification: instructorProfile?.qualification || 'Not specified',
              bio: instructorProfile?.bio || 'No biography available.',
              rating: instructorProfile?.rating || 'N/A',
              assignedCourse: instructorProfile?.assignedCourse,
              totalStudents: instructorProfile?.totalStudents || 0,
              
              // Demo account check
              isDemoAccount: user.email === 'instructor@gmail.com',
              role: 'instructor'
            };
            
            // Get assigned course details from lms_courses
            if (instructorData.courseId) {
              const courses = JSON.parse(localStorage.getItem('lms_courses') || '[]');
              const course = courses.find((c: any) => c.id === instructorData.courseId);
              if (course) {
                setAssignedCourse(course);
              }
            }
            
            console.log('Instructor data loaded:', instructorData);
            setInstructor(instructorData);
          }
        } else {
          // No user logged in
          console.log('No user logged in');
          setInstructor(null);
        }
      } catch (error) {
        console.error('Error fetching instructor data:', error);
        // Set default demo instructor
        setInstructor({
          name: 'Demo Instructor',
          email: 'instructor@gmail.com',
          phone: '+92 300 1234567',
          specialization: 'Technical Training',
          qualification: 'PhD in Engineering',
          experience: '5+ years',
          status: 'active',
          rating: 4.8,
          bio: 'Experienced instructor with 5+ years of teaching experience.',
          assignedCourse: {
            id: 'pipe-fitter',
            title: 'Pipe Fitter',
            category: 'Technical Training',
            duration: '8 Weeks',
            students: 'Max 20 per batch'
          },
          totalStudents: 45,
          isDemoAccount: true,
          role: 'instructor'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-darkRoyalBlue"></div>
            <p className="mt-4 text-darkGrey">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="text-center py-8 sm:py-12">
          <User className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.softGrey }} />
          <h3 className="text-base sm:text-lg font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>No profile data found</h3>
          <p className="text-darkGrey/70 text-sm sm:text-base">Please log in as an instructor to view profile.</p>
        </div>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-lightGrey rounded-xl p-4 sm:p-6 border border-softGrey">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                Instructor Profile
              </h1>
              <p className="text-sm sm:text-base text-darkGrey mt-1">
                View your instructor information, assigned courses, and performance
              </p>
            </div>
          </div>
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: BRAND_COLORS.deepRed }}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column - Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-lg border border-softGrey p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold"
                  style={{ 
                    backgroundColor: BRAND_COLORS.deepRed,
                    color: BRAND_COLORS.white 
                  }}>
                  {getInitials(instructor.name)}
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-darkGrey">{instructor.name}</h2>
                  {instructor.isDemoAccount && (
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                      Demo Account
                    </span>
                  )}
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white`} style={{
                    backgroundColor: instructor.status === 'active' 
                      ? BRAND_COLORS.teal
                      : BRAND_COLORS.brightRed
                  }}>
                    {instructor.status === 'active' ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactive
                      </>
                    )}
                  </span>
                </div>
                <p className="text-darkGrey/70 text-sm sm:text-base">{instructor.specialization}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3">
                  {instructor.rating && instructor.rating !== 'N/A' && (
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(instructor.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-darkGrey ml-1">
                        {instructor.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}10` }}>
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-darkGrey/70">Email Address</p>
                    <p className="font-medium text-darkGrey text-sm sm:text-base truncate">{instructor.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${BRAND_COLORS.teal}10` }}>
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: BRAND_COLORS.teal }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-darkGrey/70">Phone Number</p>
                    <p className="font-medium text-darkGrey text-sm sm:text-base truncate">{instructor.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}10` }}>
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-darkGrey/70">Member Since</p>
                    <p className="font-medium text-darkGrey text-sm sm:text-base">
                      {formatDate(instructor.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${BRAND_COLORS.teal}10` }}>
                    <Award className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: BRAND_COLORS.teal }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-darkGrey/70">Qualification</p>
                    <p className="font-medium text-darkGrey text-sm sm:text-base truncate">{instructor.qualification}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}10` }}>
                    <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-darkGrey/70">Experience</p>
                    <p className="font-medium text-darkGrey text-sm sm:text-base truncate">{instructor.experience}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${BRAND_COLORS.teal}10` }}>
                    <Book className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: BRAND_COLORS.teal }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-darkGrey/70">Specialization</p>
                    <p className="font-medium text-darkGrey text-sm sm:text-base truncate">{instructor.specialization}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Biography */}
            <div className="pt-4 sm:pt-6 border-t border-softGrey">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: BRAND_COLORS.darkGrey }} />
                <h3 className="font-semibold text-darkGrey text-sm sm:text-base">Biography</h3>
              </div>
              <div className="bg-lightGrey rounded-lg p-3 sm:p-4 border border-softGrey">
                <p className="text-darkGrey/80 text-sm sm:text-base whitespace-pre-line">
                  {instructor.bio}
                </p>
              </div>
            </div>
          </div>

          {/* Assigned Course Details */}
          {assignedCourse && (
            <div className="bg-white rounded-lg border border-softGrey p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-darkGrey">Assigned Course</h3>
                <div className="px-3 py-1 text-xs sm:text-sm rounded-full bg-lightGrey text-darkGrey self-start sm:self-auto">
                  Primary Course
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h4 className="font-medium text-darkGrey text-sm sm:text-base mb-2">{assignedCourse.title}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <Book className="w-4 h-4 text-darkGrey/70 flex-shrink-0" />
                      <span className="text-darkGrey/70">Category:</span>
                      <span className="text-darkGrey">{assignedCourse.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <Clock className="w-4 h-4 text-darkGrey/70 flex-shrink-0" />
                      <span className="text-darkGrey/70">Duration:</span>
                      <span className="text-darkGrey">{assignedCourse.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <Users className="w-4 h-4 text-darkGrey/70 flex-shrink-0" />
                      <span className="text-darkGrey/70">Students Capacity:</span>
                      <span className="text-darkGrey">{assignedCourse.students}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-darkGrey text-sm sm:text-base mb-2">Course Description</h4>
                  <p className="text-darkGrey/70 text-xs sm:text-sm">
                    {assignedCourse.description || 'No description available for this course.'}
                  </p>
                  
                  <div className="mt-3 sm:mt-4">
                    <span className="text-sm font-medium" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                      {assignedCourse.price}
                    </span>
                    {assignedCourse.originalPrice && (
                      <span className="text-xs sm:text-sm line-through text-darkGrey/70 ml-2">
                        {assignedCourse.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Stats & Info */}
        <div className="space-y-6">
          {/* Account Stats */}
          <div className="bg-white rounded-lg border border-softGrey p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
              Account Statistics
            </h3>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}10` }}>
                    <Book className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                  </div>
                  <span className="text-xs sm:text-sm text-darkGrey">Assigned Course</span>
                </div>
                <span className="font-medium text-darkNavy text-sm sm:text-base">
                  {assignedCourse ? '1' : 'None'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${BRAND_COLORS.teal}10` }}>
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: BRAND_COLORS.teal }} />
                  </div>
                  <span className="text-xs sm:text-sm text-darkGrey">Total Students</span>
                </div>
                <span className="font-medium text-darkNavy text-sm sm:text-base">{instructor.totalStudents}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}10` }}>
                    <Star className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                  </div>
                  <span className="text-xs sm:text-sm text-darkGrey">Rating</span>
                </div>
                <span className="font-medium text-darkNavy text-sm sm:text-base">{instructor.rating}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${BRAND_COLORS.teal}10` }}>
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: BRAND_COLORS.teal }} />
                  </div>
                  <span className="text-xs sm:text-sm text-darkGrey">Last Login</span>
                </div>
                <span className="text-xs sm:text-sm text-darkGrey">
                  {instructor.lastLogin ? formatDate(instructor.lastLogin) : 'Never'}
                </span>
              </div>
            </div>
          </div>

          {/* Account Type */}
          <div className="bg-white rounded-lg border border-softGrey p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
              Account Type
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-darkGrey">Role</span>
                <span className="px-3 py-1 text-xs font-medium rounded-full"
                  style={{ 
                    backgroundColor: `${BRAND_COLORS.deepRed}10`,
                    color: BRAND_COLORS.deepRed 
                  }}>
                  Instructor
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-darkGrey">Account Status</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white`} style={{
                  backgroundColor: instructor.status === 'active' 
                    ? BRAND_COLORS.teal
                    : BRAND_COLORS.brightRed
                }}>
                  {instructor.status.charAt(0).toUpperCase() + instructor.status.slice(1)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-darkGrey">Account Type</span>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  instructor.isDemoAccount 
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {instructor.isDemoAccount ? 'Demo Account' : 'Regular Account'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-darkGrey">Instructor ID</span>
                <span className="text-xs font-mono text-darkGrey/70 truncate max-w-[120px]">
                  {instructor.id}
                </span>
              </div>
            </div>
          </div>

          {/* Demo Account Notice */}
          {instructor.isDemoAccount && (
            <div className="bg-lightGrey rounded-lg p-4 border border-softGrey">
              <h4 className="font-medium text-darkGrey text-sm sm:text-base mb-2">Demo Account Notice</h4>
              <p className="text-xs sm:text-sm text-darkGrey/70">
                This is a demo instructor account. Contact admin for full access.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}