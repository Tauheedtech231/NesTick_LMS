// app/lms/Instructor_Portal/profile/page.tsx
'use client';
/* eslint-disable */


import { useEffect, useState } from 'react';
import { User, Mail, Phone, Calendar, Book, Award, MapPin, GraduationCap } from 'lucide-react';

export default function ProfilePage() {
  const [instructor, setInstructor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch current logged-in instructor from localStorage
    const fetchInstructorData = () => {
      try {
        const userData = localStorage.getItem('currentUser');
        const allInstructors = JSON.parse(localStorage.getItem('instructors') || '[]');
        
        console.log('Profile - Current user:', userData);
        console.log('Profile - All instructors:', allInstructors);

        if (userData) {
          const user = JSON.parse(userData);
          
          // Find instructor details
          let instructorDetails = null;
          
          if (user.email === 'instructor@gmail.com') {
            // Demo instructor
            instructorDetails = {
              name: 'Demo Instructor',
              email: 'instructor@gmail.com',
              phone: 'N/A',
              specialization: 'Computer Science',
              qualification: 'PhD in Computer Science',
              experience: '5+ years',
              status: 'active',
              rating: 4.5,
              students: 0,
              bio: 'Demo instructor account for testing purposes.',
              isDemoAccount: true
            };
          } else if (user.role === 'instructor') {
            // Real instructor - find by email or instructorId
            instructorDetails = allInstructors.find((instr: any) => 
              instr.email === user.email || 
              instr.id === user.instructorId
            );
          }

          if (instructorDetails) {
            setInstructor(instructorDetails);
          } else {
            // Fallback to basic info
            setInstructor({
              name: user.name || user.email.split('@')[0],
              email: user.email,
              phone: 'Not available',
              specialization: 'Not specified',
              qualification: 'Not specified',
              experience: 'Not specified',
              status: 'active',
              bio: 'No biography available.',
              isDemoAccount: user.email === 'instructor@gmail.com'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching instructor data:', error);
        // Set default demo instructor
        setInstructor({
          name: 'Demo Instructor',
          email: 'instructor@gmail.com',
          phone: 'N/A',
          specialization: 'Computer Science',
          qualification: 'PhD in Computer Science',
          experience: '5+ years',
          status: 'active',
          bio: 'Demo instructor account for testing purposes.',
          isDemoAccount: true
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#6B21A8] border-t-transparent"></div>
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No profile data found</h3>
        <p className="text-gray-600">Please log in as an instructor to view profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Instructor Profile</h1>
          <p className="text-gray-600 mt-2">View your instructor information and details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#6B21A8] to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {instructor.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-gray-900">
                  {instructor.name}
                  {instructor.isDemoAccount && (
                    <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full align-middle">
                      Demo
                    </span>
                  )}
                </h4>
                <p className="text-gray-600">{instructor.specialization}</p>
                <p className="text-gray-500 text-sm mt-1">
                  {instructor.qualification}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-[#6B21A8]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="font-medium text-gray-900">{instructor.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium text-gray-900">{instructor.phone || 'Not available'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Award className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Qualification</p>
                      <p className="font-medium text-gray-900">{instructor.qualification || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Book className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Specialization</p>
                      <p className="font-medium text-gray-900">{instructor.specialization || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="font-medium text-gray-900">{instructor.experience || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          instructor.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <p className="font-medium text-gray-900">
                          {instructor.status === 'active' ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="w-5 h-5 text-gray-400" />
                  <h4 className="font-semibold text-gray-900">Biography</h4>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-line">
                    {instructor.bio || 'No biography available.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Assigned Courses & Stats */}
        <div className="space-y-6">
          {/* Account Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Role</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded">
                  Instructor
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Account Type</span>
                <span className="font-medium text-gray-900">
                  {instructor.isDemoAccount ? 'Demo Account' : 'Regular Account'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Rating</span>
                <div className="flex items-center">
                  <span className="text-amber-500 mr-1">★</span>
                  <span className="font-medium text-gray-900">
                    {instructor.rating || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Assigned Students</span>
                <span className="font-medium text-gray-900">
                  {instructor.students || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Assigned Courses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Courses</h3>
            <div className="space-y-3">
              {instructor.assignedCourses?.length > 0 ? (
                instructor.assignedCourses.slice(0, 3).map((course: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">{course.name || 'Unnamed Course'}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-600">Course ID: {course.id}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">No courses assigned yet</p>
                </div>
              )}
              
              {instructor.assignedCourses?.length > 3 && (
                <p className="text-sm text-gray-500 text-center">
                  +{instructor.assignedCourses.length - 3} more courses
                </p>
              )}
            </div>
          </div>

          {/* Important Note */}
          {instructor.isDemoAccount && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Demo Account Notice</h4>
              <p className="text-sm text-yellow-700">
                This is a demo instructor account. For a full-featured account, please contact the system administrator.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}