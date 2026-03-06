// app/lms/Instructor_Portal/profile/page.tsx
'use client';
/* eslint-disable */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Book, 
  Award, 
  Briefcase,
  Users,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Save,
  Camera,
  Loader2,
  FileText,
  Building2,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  XCircle
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

// Types
interface Qualification {
  id: string;
  degree: string;
  institution: string;
  year: string;
  description: string;
}

interface Experience {
  id: string;
  position: string;
  company: string;
  duration: string;
  description: string;
}

interface InstructorProfile {
  id: string;
  instructor_id: string;
  full_name: string;
  email: string;
  phone: string;
  specialization: string;
  department: string;
  bio: string;
  profile_picture: string;
  created_at: string;
  updated_at: string;
}

interface InstructorData {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Success Toast Component
function SuccessToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slideIn">
      <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <p className="text-sm font-medium text-green-800">{message}</p>
      </div>
    </div>
  );
}

// Error Toast Component
function ErrorToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slideIn">
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 flex items-center gap-3">
        <XCircle className="w-5 h-5 text-red-600" />
        <p className="text-sm font-medium text-red-800">{message}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [instructor, setInstructor] = useState<InstructorData | null>(null);
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [assignedCourse, setAssignedCourse] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Toast states
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialization: '',
    department: '',
    bio: ''
  });

  const [newQualification, setNewQualification] = useState<Qualification>({
    id: '',
    degree: '',
    institution: '',
    year: '',
    description: ''
  });

  const [newExperience, setNewExperience] = useState<Experience>({
    id: '',
    position: '',
    company: '',
    duration: '',
    description: ''
  });

  const [showQualificationForm, setShowQualificationForm] = useState(false);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [editingQualification, setEditingQualification] = useState<string | null>(null);
  const [editingExperience, setEditingExperience] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const showSuccessToast = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
  };

  const showErrorToast = (message: string) => {
    setErrorMessage(message);
    setShowError(true);
  };

  const checkAuthAndFetchData = async () => {
    try {
      const userData = localStorage.getItem('currentUser');
      if (!userData) {
        router.push('/lms/auth/login?type=instructor');
        return;
      }

      const user = JSON.parse(userData);
      if (user.role !== 'instructor') {
        router.push('/lms/auth/login?type=instructor');
        return;
      }

      setInstructor(user);
      await fetchProfileData(user.id);
      
    } catch (error) {
      console.error('Auth error:', error);
      setError('Authentication failed');
      setLoading(false);
    }
  };

  const fetchProfileData = async (instructorId: string, showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('🔍 Fetching profile for instructor:', instructorId);

      const response = await fetch(`/api/instructors/profile?instructorId=${instructorId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch profile');
      }

      if (result.success) {
        const { profile: profileData, qualifications: quals, experience: exp, assignedCourse: course } = result.data;
        
        setProfile(profileData);
        
        // Map qualifications
        const mappedQuals = (quals || []).map((q: any) => ({
          id: q.id,
          degree: q.degree,
          institution: q.institution,
          year: q.year || '',
          description: q.description || ''
        }));
        setQualifications(mappedQuals);
        
        // Map experience
        const mappedExp = (exp || []).map((e: any) => ({
          id: e.id,
          position: e.position,
          company: e.company,
          duration: e.duration || '',
          description: e.description || ''
        }));
        setExperience(mappedExp);
        
        setAssignedCourse(course);
        
        setEditForm({
          fullName: profileData.full_name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          specialization: profileData.specialization || '',
          department: profileData.department || '',
          bio: profileData.bio || 'No biography available.'
        });
      }
      
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError(error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (instructor) {
      fetchProfileData(instructor.id, true);
    }
  };

  // ============ PROFILE PICTURE UPLOAD ============
  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (!file.type.startsWith('image/')) {
      showErrorToast('Please upload an image file (JPEG, PNG)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showErrorToast('File size should be less than 2MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('profileId', profile.id);

      const response = await fetch('/api/instructors/profile/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      if (result.success) {
        setProfile({
          ...profile,
          profile_picture: result.data.url,
          updated_at: new Date().toISOString()
        });
        showSuccessToast('Profile picture updated successfully');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      showErrorToast(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  // ============ PERSONAL INFO SAVE ============
  const handleSavePersonalInfo = async () => {
    if (!profile) return;

    if (!editForm.fullName.trim()) {
      showErrorToast('Full name is required');
      return;
    }

    if (!editForm.email.trim()) {
      showErrorToast('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      showErrorToast('Please enter a valid email address');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/instructors/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: profile.id,
          data: editForm
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }

      if (result.success) {
        setProfile({
          ...profile,
          full_name: result.data.full_name,
          email: result.data.email,
          phone: result.data.phone || '',
          specialization: result.data.specialization || '',
          department: result.data.department || '',
          bio: result.data.bio || '',
          updated_at: result.data.updated_at
        });
        setEditMode(false);
        showSuccessToast('Profile updated successfully');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      showErrorToast(error.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // ============ QUALIFICATIONS - FIXED ============
  const handleAddQualification = async () => {
    if (!profile) {
      showErrorToast('Profile not found');
      return;
    }

    if (!newQualification.degree.trim() || !newQualification.institution.trim()) {
      showErrorToast('Degree and Institution are required');
      return;
    }

    try {
      // Prepare qualification object - NO ID for add action
      const qualificationData: any = {
        degree: newQualification.degree,
        institution: newQualification.institution,
        year: newQualification.year || '',
        description: newQualification.description || ''
      };

      // ONLY add id for update action
      if (editingQualification) {
        qualificationData.id = editingQualification;
      }

      const requestBody = {
        action: editingQualification ? 'update' : 'add',
        profileId: profile.id,
        qualification: qualificationData
      };

      console.log('📤 Sending qualification request:', requestBody);

      const response = await fetch('/api/instructors/profile/qualifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save qualification');
      }

      if (result.success) {
        // Update qualifications state with the returned data
        const updatedQuals = result.data.map((q: any) => ({
          id: q.id,
          degree: q.degree,
          institution: q.institution,
          year: q.year || '',
          description: q.description || ''
        }));
        
        setQualifications(updatedQuals);
        
        // Reset form
        setNewQualification({ id: '', degree: '', institution: '', year: '', description: '' });
        setShowQualificationForm(false);
        setEditingQualification(null);
        
        showSuccessToast(editingQualification ? 'Qualification updated successfully' : 'Qualification added successfully');
      }
    } catch (error: any) {
      console.error('Error saving qualification:', error);
      showErrorToast(error.message || 'Failed to save qualification');
    }
  };

  const handleEditQualification = (qualification: Qualification) => {
    setNewQualification(qualification);
    setEditingQualification(qualification.id);
    setShowQualificationForm(true);
  };

  const handleRemoveQualification = async (id: string) => {
    if (!profile || !confirm('Are you sure you want to remove this qualification?')) return;

    try {
      const response = await fetch('/api/instructors/profile/qualifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          profileId: profile.id,
          qualification: { id }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to remove qualification');
      }

      if (result.success) {
        // Update qualifications state with the returned data
        const updatedQuals = result.data.map((q: any) => ({
          id: q.id,
          degree: q.degree,
          institution: q.institution,
          year: q.year || '',
          description: q.description || ''
        }));
        
        setQualifications(updatedQuals);
        showSuccessToast('Qualification removed successfully');
      }
    } catch (error: any) {
      console.error('Error removing qualification:', error);
      showErrorToast(error.message || 'Failed to remove qualification');
    }
  };

  // ============ EXPERIENCE - FIXED ============
  const handleAddExperience = async () => {
    if (!profile) {
      showErrorToast('Profile not found');
      return;
    }

    if (!newExperience.position.trim() || !newExperience.company.trim()) {
      showErrorToast('Position and Company are required');
      return;
    }

    try {
      // Prepare experience object - NO ID for add action
      const experienceData: any = {
        position: newExperience.position,
        company: newExperience.company,
        duration: newExperience.duration || '',
        description: newExperience.description || ''
      };

      // ONLY add id for update action
      if (editingExperience) {
        experienceData.id = editingExperience;
      }

      const requestBody = {
        action: editingExperience ? 'update' : 'add',
        profileId: profile.id,
        experience: experienceData
      };

      console.log('📤 Sending experience request:', requestBody);

      const response = await fetch('/api/instructors/profile/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save experience');
      }

      if (result.success) {
        // Update experience state with the returned data
        const updatedExp = result.data.map((e: any) => ({
          id: e.id,
          position: e.position,
          company: e.company,
          duration: e.duration || '',
          description: e.description || ''
        }));
        
        setExperience(updatedExp);
        
        // Reset form
        setNewExperience({ id: '', position: '', company: '', duration: '', description: '' });
        setShowExperienceForm(false);
        setEditingExperience(null);
        
        showSuccessToast(editingExperience ? 'Experience updated successfully' : 'Experience added successfully');
      }
    } catch (error: any) {
      console.error('Error saving experience:', error);
      showErrorToast(error.message || 'Failed to save experience');
    }
  };

  const handleEditExperience = (exp: Experience) => {
    setNewExperience(exp);
    setEditingExperience(exp.id);
    setShowExperienceForm(true);
  };

  const handleRemoveExperience = async (id: string) => {
    if (!profile || !confirm('Are you sure you want to remove this experience?')) return;

    try {
      const response = await fetch('/api/instructors/profile/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          profileId: profile.id,
          experience: { id }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to remove experience');
      }

      if (result.success) {
        // Update experience state with the returned data
        const updatedExp = result.data.map((e: any) => ({
          id: e.id,
          position: e.position,
          company: e.company,
          duration: e.duration || '',
          description: e.description || ''
        }));
        
        setExperience(updatedExp);
        showSuccessToast('Experience removed successfully');
      }
    } catch (error: any) {
      console.error('Error removing experience:', error);
      showErrorToast(error.message || 'Failed to remove experience');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-darkRoyalBlue"></div>
            <p className="mt-3 text-sm text-darkGrey">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile || !instructor) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="max-w-md mx-auto text-center py-12">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2 text-darkGrey">Error Loading Profile</h3>
          <p className="text-darkGrey/70 mb-6">{error || 'Profile not found'}</p>
          <button
            onClick={() => router.push('/lms/Instructor_Portal/dashboard')}
            className="px-4 py-2 bg-darkRoyalBlue text-white rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      {/* Toasts */}
      {showSuccess && (
        <SuccessToast
          message={successMessage}
          onClose={() => setShowSuccess(false)}
        />
      )}
      {showError && (
        <ErrorToast
          message={errorMessage}
          onClose={() => setShowError(false)}
        />
      )}

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-lightGrey rounded-xl p-4 sm:p-5 border border-softGrey">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                Instructor Profile
              </h1>
              <p className="text-sm sm:text-base text-darkGrey mt-1">
                Manage your personal information, qualifications, and experience
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-darkGrey/30 hover:bg-lightGrey"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ 
                    backgroundColor: BRAND_COLORS.darkRoyalBlue,
                    color: BRAND_COLORS.white 
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setEditForm({
                        fullName: profile.full_name,
                        email: profile.email,
                        phone: profile.phone || '',
                        specialization: profile.specialization || '',
                        department: profile.department || '',
                        bio: profile.bio || ''
                      });
                    }}
                    className="px-4 py-2 border border-darkGrey/30 rounded-lg text-sm font-medium hover:bg-lightGrey transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePersonalInfo}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    style={{ 
                      backgroundColor: BRAND_COLORS.deepRed,
                      color: BRAND_COLORS.white 
                    }}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: BRAND_COLORS.deepRed }}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column - Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-lg border border-softGrey p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 mb-5 sm:mb-6">
              {/* Profile Picture with Upload */}
              <div className="relative group w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-lightGrey flex items-center justify-center">
                {profile.profile_picture ? (
                  <img
                    src={profile.profile_picture}
                    alt={profile.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center font-bold text-lg sm:text-xl md:text-2xl"
                    style={{
                      backgroundColor: BRAND_COLORS.deepRed,
                      color: BRAND_COLORS.white,
                    }}
                  >
                    {getInitials(profile.full_name)}
                  </div>
                )}

                {/* Upload Button */}
                <label className="absolute bottom-0 right-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-darkRoyalBlue text-white flex items-center justify-center cursor-pointer hover:bg-darkRoyalBlue/90 transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Camera className="w-3.5 h-3.5" />
                  )}
                </label>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  {editMode ? (
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      className="text-xl sm:text-2xl font-bold text-darkGrey border-b-2 border-darkRoyalBlue focus:outline-none px-1 py-0.5 w-full sm:w-auto"
                      placeholder="Full Name"
                    />
                  ) : (
                    <h2 className="text-xl sm:text-2xl font-bold text-darkGrey">{profile.full_name}</h2>
                  )}
                </div>
                
                {editMode ? (
                  <input
                    type="text"
                    value={editForm.specialization}
                    onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                    className="text-sm sm:text-base text-darkGrey/70 border-b border-softGrey focus:outline-none focus:border-darkRoyalBlue px-1 py-0.5 w-full sm:w-auto"
                    placeholder="Specialization (e.g., Web Development)"
                  />
                ) : (
                  <p className="text-darkGrey/70 text-sm sm:text-base">{profile.specialization || 'No specialization added'}</p>
                )}
              </div>
            </div>

            {/* Personal Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-5">
              <div className="space-y-3">
                {/* Email Section */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}10` }}
                  >
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-darkGrey/70">Email</p>
                    {editMode ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full text-sm font-medium text-darkGrey border-b border-softGrey focus:outline-none focus:border-darkRoyalBlue"
                      />
                    ) : (
                      <p className="truncate font-medium text-sm text-darkGrey">
                        {profile.email || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone Section */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${BRAND_COLORS.teal}10` }}
                  >
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: BRAND_COLORS.teal }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-darkGrey/70">Phone</p>
                    {editMode ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        placeholder="+92 XXX XXXXXXX"
                        className="w-full text-sm font-medium text-darkGrey border-b border-softGrey focus:outline-none focus:border-darkRoyalBlue"
                      />
                    ) : (
                      <p className="truncate font-medium text-sm text-darkGrey">
                        {profile.phone || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Department Section */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}10` }}
                  >
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-darkGrey/70">Department</p>
                    {editMode ? (
                      <input
                        type="text"
                        value={editForm.department}
                        onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                        placeholder="e.g., Computer Science"
                        className="w-full text-sm font-medium text-darkGrey border-b border-softGrey focus:outline-none focus:border-darkRoyalBlue"
                      />
                    ) : (
                      <p className="truncate font-medium text-sm text-darkGrey">
                        {profile.department || 'Not specified'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* Member Since */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${BRAND_COLORS.teal}10` }}
                  >
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: BRAND_COLORS.teal }} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-darkGrey/70">Member Since</p>
                    <p className="font-medium text-darkGrey text-sm">
                      {formatDate(profile.created_at)}
                    </p>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}10` }}
                  >
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-darkGrey/70">Last Updated</p>
                    <p className="font-medium text-darkGrey text-sm">
                      {formatDate(profile.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Biography */}
            <div className="pt-4 border-t border-softGrey">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" style={{ color: BRAND_COLORS.darkGrey }} />
                <h3 className="font-semibold text-darkGrey text-base">Biography</h3>
              </div>
              {editMode ? (
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue text-sm"
                  placeholder="Write a brief biography (max 500 characters)"
                  maxLength={500}
                />
              ) : (
                <div className="bg-lightGrey rounded-lg p-3 border border-softGrey">
                  <p className="text-darkGrey/80 text-sm whitespace-pre-line">
                    {profile.bio}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Qualifications Section */}
          <div className="bg-white rounded-lg border border-softGrey p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-semibold text-darkGrey">Qualifications</h3>
              <button
                onClick={() => {
                  setNewQualification({ id: '', degree: '', institution: '', year: '', description: '' });
                  setEditingQualification(null);
                  setShowQualificationForm(true);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{ 
                  backgroundColor: BRAND_COLORS.darkRoyalBlue,
                  color: BRAND_COLORS.white 
                }}
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Qualification Form */}
            {showQualificationForm && (
              <div className="mb-4 p-3 bg-lightGrey rounded-lg border border-softGrey">
                <h4 className="font-medium text-darkGrey mb-2 text-sm">
                  {editingQualification ? 'Edit Qualification' : 'New Qualification'}
                </h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newQualification.degree}
                    onChange={(e) => setNewQualification({ ...newQualification, degree: e.target.value })}
                    placeholder="Degree / Certification *"
                    className="w-full px-2 py-1.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue text-sm"
                  />
                  <input
                    type="text"
                    value={newQualification.institution}
                    onChange={(e) => setNewQualification({ ...newQualification, institution: e.target.value })}
                    placeholder="Institution *"
                    className="w-full px-2 py-1.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue text-sm"
                  />
                  <input
                    type="text"
                    value={newQualification.year}
                    onChange={(e) => setNewQualification({ ...newQualification, year: e.target.value })}
                    placeholder="Year (e.g., 2020)"
                    className="w-full px-2 py-1.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue text-sm"
                  />
                  <textarea
                    value={newQualification.description}
                    onChange={(e) => setNewQualification({ ...newQualification, description: e.target.value })}
                    placeholder="Description (optional)"
                    rows={2}
                    className="w-full px-2 py-1.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddQualification}
                      className="px-3 py-1.5 bg-darkRoyalBlue text-white rounded-lg text-sm font-medium"
                    >
                      {editingQualification ? 'Update' : 'Add'}
                    </button>
                    <button
                      onClick={() => {
                        setShowQualificationForm(false);
                        setEditingQualification(null);
                        setNewQualification({ id: '', degree: '', institution: '', year: '', description: '' });
                      }}
                      className="px-3 py-1.5 border border-darkGrey/30 rounded-lg text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Qualifications List */}
            {qualifications.length > 0 ? (
              <div className="space-y-2">
                {qualifications.map((qual) => (
                  <div key={qual.id} className="flex items-start justify-between p-2 border border-softGrey rounded-lg hover:bg-lightGrey/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Award className="w-4 h-4" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                        <h4 className="font-medium text-darkGrey text-sm">{qual.degree}</h4>
                      </div>
                      <p className="text-xs text-darkGrey/70">{qual.institution}</p>
                      {qual.year && <p className="text-xs text-darkGrey/60 mt-0.5">{qual.year}</p>}
                      {qual.description && (
                        <p className="text-xs text-darkGrey/70 mt-1">{qual.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditQualification(qual)}
                        className="p-1 text-darkRoyalBlue hover:bg-darkRoyalBlue/5 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveQualification(qual.id)}
                        className="p-1 text-brightRed hover:bg-brightRed/5 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Award className="w-8 h-8 mx-auto mb-2 text-darkGrey/30" />
                <p className="text-darkGrey/70 text-sm">No qualifications added yet.</p>
                <p className="text-xs text-darkGrey/50 mt-1">Click "Add" to add your qualifications</p>
              </div>
            )}
          </div>

          {/* Experience Section */}
          <div className="bg-white rounded-lg border border-softGrey p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-semibold text-darkGrey">Work Experience</h3>
              <button
                onClick={() => {
                  setNewExperience({ id: '', position: '', company: '', duration: '', description: '' });
                  setEditingExperience(null);
                  setShowExperienceForm(true);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{ 
                  backgroundColor: BRAND_COLORS.darkRoyalBlue,
                  color: BRAND_COLORS.white 
                }}
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Experience Form */}
            {showExperienceForm && (
              <div className="mb-4 p-3 bg-lightGrey rounded-lg border border-softGrey">
                <h4 className="font-medium text-darkGrey mb-2 text-sm">
                  {editingExperience ? 'Edit Experience' : 'New Experience'}
                </h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newExperience.position}
                    onChange={(e) => setNewExperience({ ...newExperience, position: e.target.value })}
                    placeholder="Position / Job Title *"
                    className="w-full px-2 py-1.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue text-sm"
                  />
                  <input
                    type="text"
                    value={newExperience.company}
                    onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                    placeholder="Company / Organization *"
                    className="w-full px-2 py-1.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue text-sm"
                  />
                  <input
                    type="text"
                    value={newExperience.duration}
                    onChange={(e) => setNewExperience({ ...newExperience, duration: e.target.value })}
                    placeholder="Duration (e.g., 2020-2023)"
                    className="w-full px-2 py-1.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue text-sm"
                  />
                  <textarea
                    value={newExperience.description}
                    onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                    placeholder="Description (optional)"
                    rows={2}
                    className="w-full px-2 py-1.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddExperience}
                      className="px-3 py-1.5 bg-darkRoyalBlue text-white rounded-lg text-sm font-medium"
                    >
                      {editingExperience ? 'Update' : 'Add'}
                    </button>
                    <button
                      onClick={() => {
                        setShowExperienceForm(false);
                        setEditingExperience(null);
                        setNewExperience({ id: '', position: '', company: '', duration: '', description: '' });
                      }}
                      className="px-3 py-1.5 border border-darkGrey/30 rounded-lg text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Experience List */}
            {experience.length > 0 ? (
              <div className="space-y-2">
                {experience.map((exp) => (
                  <div key={exp.id} className="flex items-start justify-between p-2 border border-softGrey rounded-lg hover:bg-lightGrey/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Briefcase className="w-4 h-4" style={{ color: BRAND_COLORS.teal }} />
                        <h4 className="font-medium text-darkGrey text-sm">{exp.position}</h4>
                      </div>
                      <p className="text-xs text-darkGrey/70">{exp.company}</p>
                      {exp.duration && <p className="text-xs text-darkGrey/60 mt-0.5">{exp.duration}</p>}
                      {exp.description && (
                        <p className="text-xs text-darkGrey/70 mt-1">{exp.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditExperience(exp)}
                        className="p-1 text-darkRoyalBlue hover:bg-darkRoyalBlue/5 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveExperience(exp.id)}
                        className="p-1 text-brightRed hover:bg-brightRed/5 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Briefcase className="w-8 h-8 mx-auto mb-2 text-darkGrey/30" />
                <p className="text-darkGrey/70 text-sm">No work experience added yet.</p>
                <p className="text-xs text-darkGrey/50 mt-1">Click "Add" to add your experience</p>
              </div>
            )}
          </div>

          {/* Assigned Course Details */}
          {assignedCourse && (
            <div className="bg-white rounded-lg border border-softGrey p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <h3 className="text-base sm:text-lg font-semibold text-darkGrey">Assigned Course</h3>
                <div className="px-2 py-0.5 text-xs rounded-full bg-lightGrey text-darkGrey self-start sm:self-auto">
                  Primary Course
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <h4 className="font-medium text-darkGrey text-sm mb-1.5">{assignedCourse.title}</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Book className="w-4 h-4 text-darkGrey/70" />
                      <span className="text-darkGrey/70 text-xs">Category:</span>
                      <span className="text-darkGrey text-xs">{assignedCourse.category}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Clock className="w-4 h-4 text-darkGrey/70" />
                      <span className="text-darkGrey/70 text-xs">Duration:</span>
                      <span className="text-darkGrey text-xs">{assignedCourse.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Users className="w-4 h-4 text-darkGrey/70" />
                      <span className="text-darkGrey/70 text-xs">Capacity:</span>
                      <span className="text-darkGrey text-xs">{assignedCourse.student_capacity || assignedCourse.students}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-darkGrey text-sm mb-1.5">Course Description</h4>
                  <p className="text-darkGrey/70 text-xs">
                    {assignedCourse.description || 'No description available.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Stats & Info */}
        <div className="space-y-6">
          {/* Account Stats */}
          <div className="bg-white rounded-lg border border-softGrey p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-semibold mb-3 text-darkBlue">
              Account Statistics
            </h3>

            <ul className="space-y-2 text-sm text-darkGrey">
              <li className="flex justify-between">
                <span className="text-darkGrey/70">Assigned Course:</span>
                <span className="font-medium">{assignedCourse ? "1" : "None"}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-darkGrey/70">Qualifications:</span>
                <span className="font-medium">{qualifications.length}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-darkGrey/70">Experience:</span>
                <span className="font-medium">{experience.length}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-darkGrey/70">Member Since:</span>
                <span className="font-medium">{formatDate(profile.created_at)}</span>
              </li>
            </ul>
          </div>

          {/* Account Type */}
          <div className="bg-white rounded-lg border border-softGrey p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-semibold mb-3 text-darkBlue">
              Account Type
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-darkGrey/70">Role:</span>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-600">
                  Instructor
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-darkGrey/70">Status:</span>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-darkGrey/70">Profile ID:</span>
                <span className="text-xs font-mono text-darkGrey/70 truncate max-w-[120px]">
                  {profile.id.substring(0, 8)}...
                </span>
              </div>
            </div>
          </div>

          {/* Profile Completion */}
          <div className="bg-white rounded-lg border border-softGrey p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-semibold mb-3" style={{ color: BRAND_COLORS.darkNavy }}>
              Profile Completion
            </h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-darkGrey">Personal Info</span>
                  <span className="font-medium text-darkRoyalBlue">
                    {editForm.fullName && editForm.email ? '100%' : '50%'}
                  </span>
                </div>
                <div className="h-1.5 bg-lightGrey rounded-full overflow-hidden">
                  <div className="h-full bg-darkRoyalBlue rounded-full" style={{ width: editForm.fullName && editForm.email ? '100%' : '50%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-darkGrey">Qualifications</span>
                  <span className="font-medium text-darkRoyalBlue">
                    {qualifications.length > 0 ? '100%' : '0%'}
                  </span>
                </div>
                <div className="h-1.5 bg-lightGrey rounded-full overflow-hidden">
                  <div className="h-full bg-darkRoyalBlue rounded-full" style={{ width: qualifications.length > 0 ? '100%' : '0%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-darkGrey">Experience</span>
                  <span className="font-medium text-darkRoyalBlue">
                    {experience.length > 0 ? '100%' : '0%'}
                  </span>
                </div>
                <div className="h-1.5 bg-lightGrey rounded-full overflow-hidden">
                  <div className="h-full bg-darkRoyalBlue rounded-full" style={{ width: experience.length > 0 ? '100%' : '0%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-darkGrey">Profile Picture</span>
                  <span className="font-medium text-darkRoyalBlue">
                    {profile.profile_picture ? '100%' : '0%'}
                  </span>
                </div>
                <div className="h-1.5 bg-lightGrey rounded-full overflow-hidden">
                  <div className="h-full bg-darkRoyalBlue rounded-full" style={{ width: profile.profile_picture ? '100%' : '0%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}