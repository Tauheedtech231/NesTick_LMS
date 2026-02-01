// app/lms/Student_Portal/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X } from 'lucide-react';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Pakistan'
  });

  useEffect(() => {
    const studentData = localStorage.getItem('currentStudent');
    
    if (!studentData) {
      router.push('/student-login');
      return;
    }

    try {
      const currentStudent = JSON.parse(studentData);
      const allStudents = JSON.parse(localStorage.getItem('students') || '[]');
      const studentDetails = allStudents.find((s: any) => s.id === currentStudent.id);
      
      if (studentDetails) {
        setProfile(studentDetails);
        setEditData({
          firstName: studentDetails.firstName || '',
          lastName: studentDetails.lastName || '',
          email: studentDetails.email || '',
          phone: studentDetails.phone || '',
          address: studentDetails.address || '',
          city: studentDetails.city || '',
          country: studentDetails.country || 'Pakistan'
        });
      } else {
        setProfile(currentStudent);
        setEditData({
          firstName: currentStudent.firstName || '',
          lastName: currentStudent.lastName || '',
          email: currentStudent.email || '',
          phone: currentStudent.phone || '',
          address: currentStudent.address || '',
          city: currentStudent.city || '',
          country: currentStudent.country || 'Pakistan'
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleSave = () => {
    if (profile) {
      const allStudents = JSON.parse(localStorage.getItem('students') || '[]');
      const updatedStudents = allStudents.map((s: any) => 
        s.id === profile.id ? { ...s, ...editData } : s
      );
      localStorage.setItem('students', JSON.stringify(updatedStudents));
      
      const updatedProfile = { ...profile, ...editData };
      setProfile(updatedProfile);
      localStorage.setItem('currentStudent', JSON.stringify(updatedProfile));
      
      setIsEditing(false);
      alert('Profile updated successfully!');
    }
  };

  const handleCancel = () => {
    setEditData({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      city: profile?.city || '',
      country: profile?.country || 'Pakistan'
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Profile not found.</p>
      </div>
    );
  }

  const fullName = profile.fullName || 
    `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 
    'Student';

  return (
    <div className="w-full px-6">
      {/* Header - Full Width */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
            <p className="text-gray-600 text-sm mt-1">Manage your personal information</p>
          </div>
          
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isEditing 
                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
            }`}
          >
            {isEditing ? <X size={18} /> : <Edit2 size={18} />}
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Profile Header */}
        <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg w-full">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white text-lg font-semibold">
            {fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">{fullName}</h2>
            <p className="text-gray-600 text-sm mt-1">{profile.email}</p>
          </div>
        </div>
      </div>

      {/* Personal Information Form - Full Width */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <User size={20} />
          Personal Information
        </h3>

        <div className="space-y-6">
          {/* Name Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={editData.firstName}
                onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                disabled={!isEditing}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  isEditing 
                    ? 'border-gray-300 bg-white' 
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={editData.lastName}
                onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                disabled={!isEditing}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  isEditing 
                    ? 'border-gray-300 bg-white' 
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                }`}
              />
            </div>
          </div>

          {/* Contact Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Mail size={16} />
                Email Address
              </label>
              <input
                type="email"
                value={editData.email}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 text-gray-600 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-2">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Phone size={16} />
                Phone Number
              </label>
              <input
                type="tel"
                value={editData.phone}
                onChange={(e) => setEditData({...editData, phone: e.target.value})}
                disabled={!isEditing}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  isEditing 
                    ? 'border-gray-300 bg-white' 
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                }`}
                placeholder="03XX-XXXXXXX"
              />
            </div>
          </div>

          {/* Address Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <MapPin size={16} />
              Address
            </label>
            <input
              type="text"
              value={editData.address}
              onChange={(e) => setEditData({...editData, address: e.target.value})}
              disabled={!isEditing}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                isEditing 
                  ? 'border-gray-300 bg-white' 
                  : 'border-gray-200 bg-gray-50 text-gray-600'
              }`}
              placeholder="Enter your complete address"
            />
          </div>

          {/* City & Country */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={editData.city}
                onChange={(e) => setEditData({...editData, city: e.target.value})}
                disabled={!isEditing}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  isEditing 
                    ? 'border-gray-300 bg-white' 
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                }`}
                placeholder="e.g., Karachi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                value={editData.country}
                onChange={(e) => setEditData({...editData, country: e.target.value})}
                disabled={!isEditing}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  isEditing 
                    ? 'border-gray-300 bg-white' 
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                }`}
              >
                <option value="Pakistan">Pakistan</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Registration Info */}
          <div className="pt-6 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Calendar size={16} />
              Registration Information
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-gray-500">Registration Date</div>
                <div className="font-medium text-gray-900">
                  {profile.registrationDate ? 
                    new Date(profile.registrationDate).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    }) : 
                    'Not available'
                  }
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-gray-500">Student ID</div>
                <div className="font-medium text-gray-900">{profile.learnerId || 'Not assigned'}</div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                onClick={handleCancel}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                <Save size={18} />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Note Section */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg w-full">
        <p className="text-sm text-blue-700">
          <span className="font-medium">Note:</span> Your email and student ID cannot be changed. 
          For other modifications, contact support.
        </p>
      </div>
    </div>
  );
}