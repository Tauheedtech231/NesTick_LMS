'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
/* eslint-disable */
import Link from 'next/link';
import {
  HiUser,
  HiAcademicCap,
  HiCheckCircle,
  HiBookOpen,
  HiOutlineAcademicCap as HiAward,
  HiPencil,
  HiCamera,
  HiRefresh,
  HiChartBar,
  HiSave,
  HiX,
  HiEye,
  HiEyeOff,
  HiKey,
  HiLockClosed,
  HiAtSymbol
} from 'react-icons/hi';
import { Loader2 } from 'lucide-react';

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

interface StudentProfile {
  id: string;
  studentId: string;
  email: string;
  name: string;
  phone: string;
  cnic: string;
  address: string;
  education: string;
  experience: string;
  profileImage: string;
  username: string;
  lastLogin: string;
  stats: {
    totalEnrollments: number;
    activeEnrollments: number;
    certificatesEarned: number;
    memberSince: string;
  };
}

export default function StudentProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Edit mode
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<StudentProfile>>({});
  const [showCnic, setShowCnic] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Password/Username change states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [usernameForm, setUsernameForm] = useState({
    newUsername: ''
  });
  const [changingUsername, setChangingUsername] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Fix hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load user from localStorage
  useEffect(() => {
    if (isMounted) {
      loadUserData();
    }
  }, [isMounted]);

  const loadUserData = async () => {
    try {
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) {
        router.push('/lms/auth/login?type=student');
        return;
      }

      const userData = JSON.parse(currentUserStr);
      if (userData.role !== 'student') {
        router.push('/lms/auth/login?type=student');
        return;
      }

      setUser(userData);
      await fetchProfile(userData.email);
      
    } catch (error) {
      console.error('Error loading user:', error);
      setError('Failed to load user data');
      setLoading(false);
    }
  };

  const fetchProfile = async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/students/profile?email=${encodeURIComponent(email)}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch profile');
      }

      if (result.success) {
        setProfile(result.data);
        setEditForm({
          name: result.data.name,
          phone: result.data.phone,
          address: result.data.address,
          education: result.data.education,
          experience: result.data.experience
        });
        setPreviewImage(result.data.profileImage);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError(error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (user?.email) {
      setRefreshing(true);
      fetchProfile(user.email).finally(() => setRefreshing(false));
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // Real-time profile picture update
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('email', user.email);

      const response = await fetch('/api/students/profile/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      if (result.success) {
        // Update profile with new image URL
        const updatedProfile = { ...profile, profileImage: result.data.url };
        setProfile(updatedProfile as StudentProfile);
        setPreviewImage(result.data.url);
        
        // Update localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        currentUser.profileImage = result.data.url;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        showSuccess('Profile picture updated!');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setError(error.message || 'Failed to upload image');
      // Revert preview
      setPreviewImage(profile?.profileImage || null);
    } finally {
      setUploading(false);
    }
  };

  // Change Username
  const handleChangeUsername = async () => {
    if (!usernameForm.newUsername.trim()) {
      setError('Please enter a username');
      return;
    }

    if (usernameForm.newUsername.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setChangingUsername(true);
    setError(null);

    try {
      const response = await fetch('/api/students/profile/update-username', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          newUsername: usernameForm.newUsername
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update username');
      }

      if (result.success) {
        // Update profile
        const updatedProfile = { ...profile, username: result.data.username };
        setProfile(updatedProfile as StudentProfile);
        
        // Update localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        currentUser.username = result.data.username;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        showSuccess('Username updated successfully!');
        setShowUsernameModal(false);
        setUsernameForm({ newUsername: '' });
      }
    } catch (error: any) {
      console.error('Error updating username:', error);
      setError(error.message || 'Failed to update username');
    } finally {
      setChangingUsername(false);
    }
  };

  // Change Password
  const handleChangePassword = async () => {
    // Validate
    if (!passwordForm.currentPassword) {
      setError('Please enter current password');
      return;
    }
    if (!passwordForm.newPassword) {
      setError('Please enter new password');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setChangingPassword(true);
    setError(null);

    try {
      const response = await fetch('/api/students/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to change password');
      }

      if (result.success) {
        showSuccess('Password changed successfully!');
        setShowPasswordModal(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      setError(error.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Cancel edit - reset form
      setEditForm({
        name: profile?.name,
        phone: profile?.phone,
        address: profile?.address,
        education: profile?.education,
        experience: profile?.experience
      });
    }
    setEditMode(!editMode);
    setError(null);
    setSuccessMessage(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user?.email || !profile) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/students/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: editForm.name,
          phone: editForm.phone,
          address: editForm.address,
          education: editForm.education,
          experience: editForm.experience
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }

      if (result.success) {
        // Update profile state
        const updatedProfile = {
          ...profile,
          name: editForm.name || profile.name,
          phone: editForm.phone || profile.phone,
          address: editForm.address || profile.address,
          education: editForm.education || profile.education,
          experience: editForm.experience || profile.experience
        };
        setProfile(updatedProfile);

        // Update localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        currentUser.name = editForm.name || currentUser.name;
        currentUser.phone = editForm.phone || currentUser.phone;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        showSuccess('Profile updated successfully!');
        setEditMode(false);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const maskCNIC = (cnic: string) => {
    if (!cnic) return '';
    if (showCnic) return cnic;
    return cnic.replace(/(\d{5})(\d{7})(\d{1})/, '$1-*******-$2');
  };

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: BRAND_COLORS.deepRed }} />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <HiUser className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold mb-2 text-gray-900">Profile Not Found</h3>
          <p className="text-gray-600 mb-6">Unable to load your profile information.</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 text-white rounded-lg hover:bg-red-700 transition-colors"
            style={{ backgroundColor: BRAND_COLORS.deepRed }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 animate-slideIn">
          <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 flex items-center gap-3">
            <HiCheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-800">{successMessage}</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="fixed top-4 right-4 z-50 animate-slideIn">
          <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 flex items-center gap-3">
            <HiX className="w-5 h-5 text-red-600" />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div 
          className="rounded-xl p-6 text-white"
          style={{ 
            background: `linear-gradient(135deg, ${BRAND_COLORS.deepRed} 0%, ${BRAND_COLORS.darkRoyalBlue} 100%)`
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="p-3 rounded-xl"
                style={{ backgroundColor: `${BRAND_COLORS.white}20` }}
              >
                <HiUser className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">My Profile</h1>
                <p style={{ color: `${BRAND_COLORS.white}CC` }}>Manage your personal information</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
              style={{ backgroundColor: `${BRAND_COLORS.white}20` }}
            >
              <HiRefresh className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Profile Image */}
            <div 
              className="h-32 relative"
              style={{ 
                background: `linear-gradient(135deg, ${BRAND_COLORS.deepRed} 0%, ${BRAND_COLORS.darkRoyalBlue} 100%)`
              }}
            >
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white">
                    {previewImage ? (
                      <img 
                        src={previewImage} 
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <HiUser className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleImageClick}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 p-1.5 text-white rounded-full hover:bg-red-700 transition-colors disabled:opacity-50"
                    style={{ backgroundColor: BRAND_COLORS.deepRed }}
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <HiCamera className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </div>
              </div>
            </div>

            <div className="pt-16 pb-6 px-6 text-center">
              <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
              <p className="text-sm text-gray-500 mb-2">{profile.email}</p>
              
              {/* ✅ Username Display */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <HiAtSymbol className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">@{profile.username || 'Not set'}</span>
                <button
                  onClick={() => setShowUsernameModal(true)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Change
                </button>
              </div>

              <div className="flex justify-center gap-2 mb-4">
                <span 
                  className="px-3 py-1 text-xs font-medium rounded-full"
                  style={{ 
                    backgroundColor: `${BRAND_COLORS.darkRoyalBlue}20`,
                    color: BRAND_COLORS.darkRoyalBlue
                  }}
                >
                  Student
                </span>
                <span 
                  className="px-3 py-1 text-xs font-medium rounded-full"
                  style={{ 
                    backgroundColor: `${BRAND_COLORS.teal}20`,
                    color: BRAND_COLORS.teal
                  }}
                >
                  Active
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Member Since</span>
                    <span className="font-medium text-gray-900">{profile.stats.memberSince}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last Login</span>
                    <span className="font-medium text-gray-900">
                      {new Date(profile.lastLogin).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Student ID</span>
                    <span className="font-medium text-gray-900">{profile.studentId || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              {/* ✅ Change Password Button */}
              <button
                onClick={() => setShowPasswordModal(true)}
                className="mt-4 w-full py-2 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-colors"
                style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue }}
              >
                <HiKey className="w-4 h-4" />
                Change Password
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <HiBookOpen className="w-5 h-5 mx-auto mb-1" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
              <p className="text-lg font-bold text-gray-900">{profile.stats.totalEnrollments}</p>
              <p className="text-xs text-gray-500">Enrolled</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <HiAcademicCap className="w-5 h-5 mx-auto mb-1" style={{ color: BRAND_COLORS.teal }} />
              <p className="text-lg font-bold text-gray-900">{profile.stats.activeEnrollments}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <HiAward className="w-5 h-5 mx-auto mb-1" style={{ color: BRAND_COLORS.deepRed }} />
              <p className="text-lg font-bold text-gray-900">{profile.stats.certificatesEarned}</p>
              <p className="text-xs text-gray-500">Certificates</p>
            </div>
          </div>
        </div>

        {/* Right Column - Profile Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            {/* Header with Edit Button */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
              <button
                onClick={handleEditToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  editMode
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'text-white hover:opacity-90'
                }`}
                style={!editMode ? { backgroundColor: BRAND_COLORS.darkRoyalBlue } : {}}
              >
                {editMode ? (
                  <>
                    <HiX className="w-4 h-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <HiPencil className="w-4 h-4" />
                    Edit Profile
                  </>
                )}
              </button>
            </div>

            {/* Profile Form */}
            <div className="p-6">
              {editMode ? (
                // Edit Mode Form
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={editForm.phone || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={editForm.address || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Education
                    </label>
                    <select
                      name="education"
                      value={editForm.education || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Education</option>
                      <option value="Matric">Matric</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Bachelor's">Bachelor's</option>
                      <option value="Master's">Master's</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Experience
                    </label>
                    <input
                      type="text"
                      name="experience"
                      value={editForm.experience || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 2 years in construction"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={handleEditToggle}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2 disabled:opacity-50"
                      style={{ backgroundColor: BRAND_COLORS.deepRed }}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <HiSave className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Full Name</p>
                      <p className="text-base font-medium text-gray-900">{profile.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email Address</p>
                      <p className="text-base font-medium text-gray-900">{profile.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                      <p className="text-base font-medium text-gray-900">{profile.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">CNIC</p>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-medium text-gray-900">
                          {maskCNIC(profile.cnic || 'Not provided')}
                        </p>
                        {profile.cnic && (
                          <button
                            onClick={() => setShowCnic(!showCnic)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            {showCnic ? (
                              <HiEyeOff className="w-4 h-4" style={{ color: BRAND_COLORS.darkGrey }} />
                            ) : (
                              <HiEye className="w-4 h-4" style={{ color: BRAND_COLORS.darkGrey }} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-500 mb-1">Address</p>
                    <p className="text-base font-medium text-gray-900">
                      {profile.address || 'Not provided'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Education</p>
                      <p className="text-base font-medium text-gray-900">
                        {profile.education || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Experience</p>
                      <p className="text-base font-medium text-gray-900">
                        {profile.experience || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
            <Link
              href="/lms/Student_Portal/my-courses"
              className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-shadow"
            >
              <HiBookOpen className="w-6 h-6 mx-auto mb-2" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
              <p className="text-sm font-medium text-gray-900">My Courses</p>
              <p className="text-xs text-gray-500 mt-1">{profile.stats.activeEnrollments} Active</p>
            </Link>
            <Link
              href="/lms/Student_Portal/certificates"
              className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-shadow"
            >
              <HiAward className="w-6 h-6 mx-auto mb-2" style={{ color: BRAND_COLORS.deepRed }} />
              <p className="text-sm font-medium text-gray-900">Certificates</p>
              <p className="text-xs text-gray-500 mt-1">{profile.stats.certificatesEarned} Earned</p>
            </Link>
            <Link
              href="/lms/Student_Portal/progress"
              className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-shadow"
            >
              <HiChartBar className="w-6 h-6 mx-auto mb-2" style={{ color: BRAND_COLORS.teal }} />
              <p className="text-sm font-medium text-gray-900">Progress</p>
              <p className="text-xs text-gray-500 mt-1">Track Learning</p>
            </Link>
          </div>
        </div>
      </div>

      {/* ✅ Change Username Modal */}
      {showUsernameModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Change Username</h3>
              <button onClick={() => setShowUsernameModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <HiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Username
              </label>
              <p className="text-gray-900 font-medium">@{profile?.username}</p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Username
              </label>
              <input
                type="text"
                value={usernameForm.newUsername}
                onChange={(e) => setUsernameForm({ newUsername: e.target.value })}
                placeholder="Enter new username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Username must be at least 3 characters</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowUsernameModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeUsername}
                disabled={changingUsername}
                className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: BRAND_COLORS.deepRed }}
              >
                {changingUsername ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <HiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.current ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword.current ? <HiEyeOff className="w-4 h-4 text-gray-400" /> : <HiEye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword.new ? <HiEyeOff className="w-4 h-4 text-gray-400" /> : <HiEye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword.confirm ? <HiEyeOff className="w-4 h-4 text-gray-400" /> : <HiEye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: BRAND_COLORS.deepRed }}
              >
                {changingPassword ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Change Password'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}