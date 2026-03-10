'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiUser,
  HiMail,
  HiPhone,
  HiAcademicCap,
  HiBriefcase,
  HiStar,
  HiClock,
  HiCamera,
  HiSave,
  HiArrowLeft,
  HiCheckCircle,
  HiXCircle,
  HiEye,
  HiEyeOff,
  HiLockClosed,
  HiPlusCircle,
  HiTrash,
  HiOfficeBuilding as  HiBuildingOffice,
  HiCalendar,
  HiOutlineBriefcase,
  HiBadgeCheck
} from 'react-icons/hi';
import { Loader2 } from 'lucide-react';

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
};

interface Qualification {
  id?: string;
  degree: string;
  institution: string;
  year: string;
  description: string;
}

interface Experience {
  id?: string;
  position: string;
  company: string;
  duration: string;
  description: string;
}

interface InstructorData {
  id: string;
  name: string;
  email: string;
  status: string;
  rating: number;
  totalStudents: number;
  lastLogin: string | null;
  course: { id: string; title: string } | null;
}

interface ProfileData {
  id?: string;
  instructorId: string;
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  department: string;
  bio: string;
  profilePicture: string | null;
}

export default function InstructorProfilePage() {
  const router = useRouter();
  
  // Main data states
  const [instructor, setInstructor] = useState<InstructorData | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'qualifications' | 'experience' | 'security'>('profile');
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [department, setDepartment] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  
  // New item states
  const [newQualification, setNewQualification] = useState<Qualification>({
    degree: '',
    institution: '',
    year: '',
    description: ''
  });
  const [newExperience, setNewExperience] = useState<Experience>({
    position: '',
    company: '',
    duration: '',
    description: ''
  });
  const [showNewQualForm, setShowNewQualForm] = useState(false);
  const [showNewExpForm, setShowNewExpForm] = useState(false);

  // Load instructor data
  useEffect(() => {
    loadInstructorProfile();
  }, []);

  const loadInstructorProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get current user from localStorage
      const userStr = localStorage.getItem('currentUser');
      if (!userStr) {
        router.push('/lms/auth/login?type=instructor');
        return;
      }

      const userData = JSON.parse(userStr);
      console.log("User from localStorage:", userData);
      
      // Fetch complete profile
      const response = await fetch(`/api/instructor/profile?instructorId=${userData.id}`);
      const result = await response.json();
      console.log("API Response:", result);

      if (result.success) {
        // Set instructor data
        setInstructor(result.data.instructor);
        
        // Set profile data
        if (result.data.profile) {
          setProfile(result.data.profile);
          setFullName(result.data.profile.fullName || result.data.instructor.name);
          setPhone(result.data.profile.phone || '');
          setSpecialization(result.data.profile.specialization || '');
          setDepartment(result.data.profile.department || '');
          setBio(result.data.profile.bio || '');
          setProfilePicture(result.data.profile.profilePicture);
        } else {
          // If no profile, use instructor name
          setFullName(result.data.instructor.name);
        }
        
        // Set qualifications
        setQualifications(result.data.qualifications || []);
        
        // Set experiences
        setExperiences(result.data.experiences || []);
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

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !instructor) return;

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
      formData.append('action', 'upload_image');
      formData.append('file', file);
      formData.append('instructorId', instructor.id);

      const response = await fetch('/api/instructor/profile', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setProfilePicture(result.data.url);
        setSuccess('Profile picture updated successfully');
        
        // Update localStorage to refresh data
        setTimeout(() => {
          loadInstructorProfile();
        }, 1000);
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

  // Add qualification
  const handleAddQualification = () => {
    if (!newQualification.degree || !newQualification.institution) {
      setError('Degree and Institution are required');
      return;
    }

    setQualifications([...qualifications, { ...newQualification }]);
    setNewQualification({ degree: '', institution: '', year: '', description: '' });
    setShowNewQualForm(false);
    setSuccess('Qualification added');
    setTimeout(() => setSuccess(null), 2000);
  };

  // Remove qualification
  const handleRemoveQualification = (index: number) => {
    if (window.confirm('Are you sure you want to remove this qualification?')) {
      const updated = qualifications.filter((_, i) => i !== index);
      setQualifications(updated);
      setSuccess('Qualification removed');
      setTimeout(() => setSuccess(null), 2000);
    }
  };

  // Add experience
  const handleAddExperience = () => {
    if (!newExperience.position || !newExperience.company) {
      setError('Position and Company are required');
      return;
    }

    setExperiences([...experiences, { ...newExperience }]);
    setNewExperience({ position: '', company: '', duration: '', description: '' });
    setShowNewExpForm(false);
    setSuccess('Experience added');
    setTimeout(() => setSuccess(null), 2000);
  };

  // Remove experience
  const handleRemoveExperience = (index: number) => {
    if (window.confirm('Are you sure you want to remove this experience?')) {
      const updated = experiences.filter((_, i) => i !== index);
      setExperiences(updated);
      setSuccess('Experience removed');
      setTimeout(() => setSuccess(null), 2000);
    }
  };

  // Save all profile data
  const handleSaveAll = async () => {
    if (!instructor) return;

    if (!fullName) {
      setError('Full name is required');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/instructor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instructorId: instructor.id,
          fullName,
          phone,
          specialization,
          department,
          bio,
          profilePicture: profilePicture !== profile?.profilePicture ? profilePicture : undefined,
          qualifications: qualifications.map(q => ({
            degree: q.degree,
            institution: q.institution,
            year: q.year,
            description: q.description
          })),
          experiences: experiences.map(e => ({
            position: e.position,
            company: e.company,
            duration: e.duration,
            description: e.description
          }))
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('All changes saved successfully!');
        
        // Reload data after save
        setTimeout(() => {
          loadInstructorProfile();
        }, 1000);
      } else {
        throw new Error(result.error || 'Failed to save changes');
      }
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (!instructor) return;

    if (!currentPassword) {
      setError('Current password is required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/instructor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instructorId: instructor.id,
          currentPassword,
          newPassword
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(result.error || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
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
          <div className="w-16 h-16 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Display name from profile or instructor
  const displayName = fullName || instructor?.name || 'Instructor';
  const displayEmail = instructor?.email || '';
  const displayImage = profilePicture || null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-all hover:-translate-x-1"
          >
            <HiArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                Instructor Profile
              </h1>
              <p className="text-gray-600 mt-2">Manage your personal information, qualifications, and security settings</p>
            </div>
            
            {/* Save All Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveAll}
              disabled={saving}
              className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-md"
              style={{ backgroundColor: BRAND_COLORS.deepRed }}
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <HiSave className="w-5 h-5" />
                  Save All Changes
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 rounded-lg flex items-start gap-3 shadow-md"
              style={{ borderLeftColor: BRAND_COLORS.deepRed }}
            >
              <HiXCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-green-50 border-l-4 border-green-600 rounded-lg flex items-start gap-3 shadow-md"
            >
              <HiCheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-green-700">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden sticky top-6">
              {/* Profile Image Section */}
              <div className="p-6 text-center" style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue }}>
                <div className="relative inline-block">
                  <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                    {displayImage ? (
                      <img
                        key={displayImage} // Force re-render when image changes
                        src={displayImage}
                        alt={displayName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log("Image failed to load:", displayImage);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: BRAND_COLORS.softGrey }}>
                        <HiUser className="w-14 h-14" style={{ color: BRAND_COLORS.darkGrey }} />
                      </div>
                    )}
                  </div>
                  
                  {/* Upload Button */}
                  <label
                    htmlFor="profile-image"
                    className="absolute bottom-0 right-0 p-2 rounded-full cursor-pointer hover:scale-110 transition-all shadow-lg"
                    style={{ backgroundColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.white }}
                  >
                    {uploadingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <HiCamera className="w-4 h-4" />
                    )}
                    <input
                      type="file"
                      id="profile-image"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
                
                <h2 className="text-xl font-bold text-white mt-4">{displayName}</h2>
                <p className="text-blue-100 text-sm flex items-center justify-center gap-1">
                  <HiBadgeCheck className="w-4 h-4" />
                  {instructor?.status === 'active' ? 'Active Instructor' : 'Inactive'}
                </p>
              </div>

              {/* Stats */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-yellow-50 rounded-xl p-3 text-center">
                    <HiStar className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Rating</p>
                    <p className="font-bold text-gray-900">{instructor?.rating || 4.5}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <HiUser className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Students</p>
                    <p className="font-bold text-gray-900">{instructor?.totalStudents || 0}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <HiMail className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{displayEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <HiClock className="w-4 h-4 text-gray-400" />
                    <span>Last login: {formatDate(instructor?.lastLogin || null)}</span>
                  </div>
                  {instructor?.course && (
                    <div className="mt-3 p-3 rounded-xl" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
                      <p className="text-xs font-medium mb-1" style={{ color: BRAND_COLORS.darkRoyalBlue }}>Assigned Course</p>
                      <p className="text-sm font-medium" style={{ color: BRAND_COLORS.darkNavy }}>{instructor.course.title}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Tabs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              {/* Tabs */}
              <div className="flex flex-wrap border-b border-gray-200 p-2" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
                {[
                  { id: 'profile', label: 'Profile Info', icon: HiUser },
                  { id: 'qualifications', label: 'Qualifications', icon: HiAcademicCap },
                  { id: 'experience', label: 'Experience', icon: HiOutlineBriefcase },
                  { id: 'security', label: 'Security', icon: HiLockClosed }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                    style={activeTab === tab.id ? { color: BRAND_COLORS.deepRed } : {}}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* PROFILE TAB */}
                {activeTab === 'profile' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                          placeholder="e.g., +92 300 1234567"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Specialization
                        </label>
                        <input
                          type="text"
                          value={specialization}
                          onChange={(e) => setSpecialization(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                          placeholder="e.g., Welding, Pipe Fitting"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department
                        </label>
                        <input
                          type="text"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                          placeholder="e.g., Technical Training"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                        placeholder="Tell us about yourself, your teaching experience, and expertise..."
                      />
                    </div>
                  </motion.div>
                )}

                {/* QUALIFICATIONS TAB */}
                {activeTab === 'qualifications' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Academic Qualifications</h3>
                      <button
                        onClick={() => setShowNewQualForm(true)}
                        className="px-4 py-2 text-white rounded-xl hover:bg-red-700 transition-all flex items-center gap-2 text-sm font-medium shadow-md"
                        style={{ backgroundColor: BRAND_COLORS.deepRed }}
                      >
                        <HiPlusCircle className="w-4 h-4" />
                        Add Qualification
                      </button>
                    </div>

                    {/* New Qualification Form */}
                    <AnimatePresence>
                      {showNewQualForm && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="rounded-xl p-5 border"
                          style={{ backgroundColor: BRAND_COLORS.lightGrey, borderColor: BRAND_COLORS.softGrey }}
                        >
                          <h4 className="font-medium mb-4" style={{ color: BRAND_COLORS.darkNavy }}>Add New Qualification</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              type="text"
                              placeholder="Degree *"
                              value={newQualification.degree}
                              onChange={(e) => setNewQualification({...newQualification, degree: e.target.value})}
                              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                              style={{ borderColor: BRAND_COLORS.softGrey }}
                            />
                            <input
                              type="text"
                              placeholder="Institution *"
                              value={newQualification.institution}
                              onChange={(e) => setNewQualification({...newQualification, institution: e.target.value})}
                              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                              style={{ borderColor: BRAND_COLORS.softGrey }}
                            />
                            <input
                              type="text"
                              placeholder="Year"
                              value={newQualification.year}
                              onChange={(e) => setNewQualification({...newQualification, year: e.target.value})}
                              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                              style={{ borderColor: BRAND_COLORS.softGrey }}
                            />
                            <input
                              type="text"
                              placeholder="Description"
                              value={newQualification.description}
                              onChange={(e) => setNewQualification({...newQualification, description: e.target.value})}
                              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                              style={{ borderColor: BRAND_COLORS.softGrey }}
                            />
                          </div>
                          <div className="flex gap-3 mt-4">
                            <button
                              onClick={handleAddQualification}
                              className="px-4 py-2 text-white rounded-lg hover:bg-red-700 transition-all"
                              style={{ backgroundColor: BRAND_COLORS.deepRed }}
                            >
                              Add
                            </button>
                            <button
                              onClick={() => setShowNewQualForm(false)}
                              className="px-4 py-2 text-white rounded-lg hover:bg-gray-600 transition-all"
                              style={{ backgroundColor: BRAND_COLORS.darkGrey }}
                            >
                              Cancel
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Qualifications List */}
                    {qualifications.length === 0 ? (
                      <div className="text-center py-12 rounded-xl" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
                        <HiAcademicCap className="w-16 h-16 mx-auto mb-3" style={{ color: BRAND_COLORS.softGrey }} />
                        <p className="text-gray-500">No qualifications added yet</p>
                        <button
                          onClick={() => setShowNewQualForm(true)}
                          className="mt-2 text-sm font-medium hover:underline"
                          style={{ color: BRAND_COLORS.deepRed }}
                        >
                          Add your first qualification
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {qualifications.map((qual, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl p-4 border hover:shadow-md transition-all"
                            style={{ backgroundColor: BRAND_COLORS.lightGrey, borderColor: BRAND_COLORS.softGrey }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-gray-900">{qual.degree}</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  <HiBuildingOffice className="inline w-4 h-4 mr-1" />
                                  {qual.institution}
                                </p>
                                {qual.year && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    <HiCalendar className="inline w-4 h-4 mr-1" />
                                    {qual.year}
                                  </p>
                                )}
                                {qual.description && (
                                  <p className="text-sm text-gray-600 mt-2">{qual.description}</p>
                                )}
                              </div>
                              <button
                                onClick={() => handleRemoveQualification(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <HiTrash className="w-5 h-5" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* EXPERIENCE TAB */}
                {activeTab === 'experience' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Professional Experience</h3>
                      <button
                        onClick={() => setShowNewExpForm(true)}
                        className="px-4 py-2 text-white rounded-xl hover:bg-red-700 transition-all flex items-center gap-2 text-sm font-medium shadow-md"
                        style={{ backgroundColor: BRAND_COLORS.deepRed }}
                      >
                        <HiPlusCircle className="w-4 h-4" />
                        Add Experience
                      </button>
                    </div>

                    {/* New Experience Form */}
                    <AnimatePresence>
                      {showNewExpForm && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="rounded-xl p-5 border"
                          style={{ backgroundColor: BRAND_COLORS.lightGrey, borderColor: BRAND_COLORS.softGrey }}
                        >
                          <h4 className="font-medium mb-4" style={{ color: BRAND_COLORS.darkNavy }}>Add New Experience</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              type="text"
                              placeholder="Position *"
                              value={newExperience.position}
                              onChange={(e) => setNewExperience({...newExperience, position: e.target.value})}
                              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                              style={{ borderColor: BRAND_COLORS.softGrey }}
                            />
                            <input
                              type="text"
                              placeholder="Company *"
                              value={newExperience.company}
                              onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                              style={{ borderColor: BRAND_COLORS.softGrey }}
                            />
                            <input
                              type="text"
                              placeholder="Duration"
                              value={newExperience.duration}
                              onChange={(e) => setNewExperience({...newExperience, duration: e.target.value})}
                              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                              style={{ borderColor: BRAND_COLORS.softGrey }}
                            />
                            <input
                              type="text"
                              placeholder="Description"
                              value={newExperience.description}
                              onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                              style={{ borderColor: BRAND_COLORS.softGrey }}
                            />
                          </div>
                          <div className="flex gap-3 mt-4">
                            <button
                              onClick={handleAddExperience}
                              className="px-4 py-2 text-white rounded-lg hover:bg-red-700 transition-all"
                              style={{ backgroundColor: BRAND_COLORS.deepRed }}
                            >
                              Add
                            </button>
                            <button
                              onClick={() => setShowNewExpForm(false)}
                              className="px-4 py-2 text-white rounded-lg hover:bg-gray-600 transition-all"
                              style={{ backgroundColor: BRAND_COLORS.darkGrey }}
                            >
                              Cancel
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Experience List */}
                    {experiences.length === 0 ? (
                      <div className="text-center py-12 rounded-xl" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
                        <HiOutlineBriefcase className="w-16 h-16 mx-auto mb-3" style={{ color: BRAND_COLORS.softGrey }} />
                        <p className="text-gray-500">No experience added yet</p>
                        <button
                          onClick={() => setShowNewExpForm(true)}
                          className="mt-2 text-sm font-medium hover:underline"
                          style={{ color: BRAND_COLORS.deepRed }}
                        >
                          Add your first experience
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {experiences.map((exp, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl p-4 border hover:shadow-md transition-all"
                            style={{ backgroundColor: BRAND_COLORS.lightGrey, borderColor: BRAND_COLORS.softGrey }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  <HiBuildingOffice className="inline w-4 h-4 mr-1" />
                                  {exp.company}
                                </p>
                                {exp.duration && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    <HiClock className="inline w-4 h-4 mr-1" />
                                    {exp.duration}
                                  </p>
                                )}
                                {exp.description && (
                                  <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                                )}
                              </div>
                              <button
                                onClick={() => handleRemoveExperience(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <HiTrash className="w-5 h-5" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* SECURITY TAB */}
                {activeTab === 'security' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="max-w-md mx-auto space-y-6"
                  >
                    <div className="rounded-xl p-6" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <HiLockClosed className="w-5 h-5" style={{ color: BRAND_COLORS.deepRed }} />
                        Change Password
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? 'text' : 'password'}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showCurrentPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                              placeholder="Enter new password (min 6 characters)"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showNewPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                              placeholder="Confirm new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showConfirmPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={handleChangePassword}
                          disabled={saving}
                          className="w-full py-3 text-white rounded-xl font-medium hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                          style={{ backgroundColor: BRAND_COLORS.deepRed }}
                        >
                          {saving ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <HiLockClosed className="w-4 h-4" />
                              Update Password
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl p-4" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
                      <p className="text-sm flex items-start gap-2" style={{ color: BRAND_COLORS.darkNavy }}>
                        <HiBadgeCheck className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: BRAND_COLORS.deepRed }} />
                        <span>
                          For security, always use a strong password that you don't use elsewhere. 
                          Your password is encrypted and never stored in plain text.
                        </span>
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}