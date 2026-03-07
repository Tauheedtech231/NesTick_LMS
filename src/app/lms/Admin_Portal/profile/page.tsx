'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  HiUserCircle,
  HiMail,
  HiLockClosed,
  HiCamera,
  HiSave,
  HiArrowLeft,
  HiCheckCircle,
  HiXCircle,
  HiEye,
  HiEyeOff,
  HiUser,
  HiKey
} from 'react-icons/hi';
import { Loader2 } from 'lucide-react';
/* eslint-disable */
const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  teal: '#1FB6C9'
};

interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  profileImage: string | null;
  lastLogin: string | null;
  createdAt: string;
}

export default function AdminProfilePage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // UI states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [changingPassword, setChangingPassword] = useState(false); // NEW

  useEffect(() => {
    loadAdminProfile();
  }, []);

  const loadAdminProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const userStr = localStorage.getItem('currentUser');
      
      if (!userStr) {
        router.push('/lms/auth/login?type=admin');
        return;
      }

      const userData = JSON.parse(userStr);
      
      if (userData.role !== 'admin' && userData.role !== 'super_admin') {
        router.push('/lms/auth/login?type=admin');
        return;
      }

      const response = await fetch(`/api/admin/profile?id=${userData.id}`);
      const result = await response.json();

      if (result.success) {
        setAdmin(result.data);
        setName(result.data.name || '');
        setEmail(result.data.email);
        setProfileImage(result.data.profileImage);
      } else {
        throw new Error(result.error || 'Failed to load profile');
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !admin) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB');
      return;
    }

    setUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('adminId', admin.id);

      const response = await fetch('/api/admin/profile', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setProfileImage(result.data.url);
        setSuccess('Image uploaded successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(result.error || 'Failed to upload image');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setError(error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!admin) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate email
      if (!email.includes('@')) {
        throw new Error('Please enter a valid email');
      }

      // If changing password, validate
      if (changingPassword) {
        if (!currentPassword) {
          throw new Error('Current password is required');
        }
        if (newPassword.length < 6) {
          throw new Error('New password must be at least 6 characters');
        }
        if (newPassword !== confirmPassword) {
          throw new Error('New passwords do not match');
        }
      }

      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: admin.id,
          name,
          email,
          // Only send password fields if changing password
          ...(changingPassword && {
            currentPassword,
            newPassword
          }),
          profileImage: profileImage !== admin.profileImage ? profileImage : undefined
        })
      });

      const result = await response.json();

      if (result.success) {
        setAdmin(result.data);
        setSuccess('Profile updated successfully');
        
        // Clear password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setChangingPassword(false); // Turn off password change mode

        // Update localStorage
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
          const userData = JSON.parse(userStr);
          userData.name = result.data.name;
          userData.email = result.data.email;
          localStorage.setItem('currentUser', JSON.stringify(userData));
        }

        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: BRAND_COLORS.deepRed }} />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <HiArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
            Admin Profile
          </h1>
          <p className="text-gray-600 mt-1">Manage your profile information and security settings</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <HiXCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <HiCheckCircle className="w-5 h-5 flex-shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <HiUser className="inline w-4 h-4 mr-2" />
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'security'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <HiLockClosed className="inline w-4 h-4 mr-2" />
              Security
            </button>
          </div>

          <div className="p-6">
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Profile Image */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt={name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <HiUserCircle className="w-20 h-20 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <label
                      htmlFor="profile-image"
                      className="absolute bottom-0 right-0 p-2 bg-red-600 text-white rounded-full cursor-pointer hover:bg-red-700 transition-colors shadow-lg"
                    >
                      <HiCamera className="w-4 h-4" />
                      <input
                        type="file"
                        id="profile-image"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                    {uploadingImage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Click camera icon to change photo (Max 2MB)
                  </p>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {/* Account Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Account Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Role</p>
                      <p className="font-medium text-gray-900 capitalize">{admin?.role}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Last Login</p>
                      <p className="font-medium text-gray-900">{formatDate(admin?.lastLogin || null)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Member Since</p>
                      <p className="font-medium text-gray-900">{formatDate(admin?.createdAt || null)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Admin ID</p>
                      <p className="font-medium text-gray-900 text-xs truncate">{admin?.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                {/* Toggle Password Change Mode */}
                {!changingPassword ? (
                  <div className="text-center py-8">
                    <HiKey className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Password Settings</h3>
                    <p className="text-gray-500 mb-6">
                      Your password is securely stored. Click below to change it.
                    </p>
                    <button
                      onClick={() => setChangingPassword(true)}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Change Password
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                          placeholder="Enter your current password"
                          autoComplete="off"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showCurrentPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Enter your current password to verify it's you
                      </p>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                          placeholder="Enter new password (min 6 characters)"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showNewPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                          placeholder="Confirm new password"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Cancel Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setChangingPassword(false);
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}

                {/* Info Box */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Security Tip:</strong> Use a strong password that you don't use elsewhere.
                  </p>
                </div>
              </div>
            )}

            {/* Save Button - Only show if there are changes */}
            {(name !== admin?.name || 
              email !== admin?.email || 
              profileImage !== admin?.profileImage ||
              (changingPassword && currentPassword && newPassword)) && (
              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <HiSave className="w-4 h-4" />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}