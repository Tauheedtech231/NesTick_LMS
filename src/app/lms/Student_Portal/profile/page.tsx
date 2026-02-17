// app/profile/page.tsx
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
  HiTrash
} from 'react-icons/hi';

// Brand Colors
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
  profileImage?: string; // new field for profile image URL
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    const loadUser = () => {
      try {
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
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
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // ========== IMAGE UPLOAD HANDLER ==========
  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary via API route
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'profile_image');

      const response = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && user) {
        // Update user object with new image URL
        const updatedUser = { ...user, profileImage: result.data.secure_url };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image. Please try again.');
      // Revert preview if upload fails
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

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      {/* Profile Header with Image */}
      <div 
        className="rounded-2xl p-6 text-white mb-6 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.darkNavy} 0%, ${BRAND_COLORS.darkRoyalBlue} 100%)` }}
      >
        <div className="flex items-center gap-4">
          {/* Profile Image with Upload */}
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-white/30">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <HiUser className="w-10 h-10" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
              )}
            </div>
            {uploadingImage && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              </div>
            )}
            {/* Image upload button (visible on hover) */}
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

          <div>
            <h1 className="text-xl font-bold">{user.fullName}</h1>
            <p className="text-sm opacity-90">{user.learnerId}</p>
            <p className="text-xs opacity-75 mt-1">
              Member since {new Date(user.registrationDate).toLocaleDateString()}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
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

      {/* Profile Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
            Personal Information
          </h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm"
              style={{ backgroundColor: BRAND_COLORS.deepRed }}
            >
              <HiPencilAlt className="w-4 h-4" /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
              >
                <HiSave className="w-4 h-4" /> Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm"
              >
                <HiX className="w-4 h-4" /> Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
              <HiUser className="w-4 h-4" /> Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.fullName || ''}
                onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deepRed/20 focus:border-deepRed"
              />
            ) : (
              <p className="font-medium">{user.fullName}</p>
            )}
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
              <HiMail className="w-4 h-4" /> Email
            </label>
            <p className="font-medium">{user.email}</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
              <HiPhone className="w-4 h-4" /> Phone
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={editForm.phone || ''}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deepRed/20 focus:border-deepRed"
                placeholder="+92 XXX XXXXXXX"
              />
            ) : (
              <p className="font-medium">{user.phone || 'Not provided'}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
              <HiAcademicCap className="w-4 h-4" /> Address
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.address || ''}
                onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deepRed/20 focus:border-deepRed"
                placeholder="Your address"
              />
            ) : (
              <p className="font-medium">{user.address || 'Not provided'}</p>
            )}
          </div>

          {/* Learner ID (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
              <HiAcademicCap className="w-4 h-4" /> Learner ID
            </label>
            <p className="font-medium">{user.learnerId}</p>
          </div>

          {/* Registration Date (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
              <HiCalendar className="w-4 h-4" /> Registration Date
            </label>
            <p className="font-medium">
              {new Date(user.registrationDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Status info (read-only) */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Account Status</p>
              <p className={`font-medium ${user.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                {user.status.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment</p>
              <p className={`font-medium ${user.paymentVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                {user.paymentVerified ? 'Verified' : 'Pending'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}