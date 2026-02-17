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
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Upload,
  Camera,
  Loader2,
  FileText,
  Building2,
  CalendarDays
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

interface InstructorProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  department: string;
  bio: string;
  profilePicture: string;
  qualifications: Qualification[];
  experience: Qualification[];
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const [instructor, setInstructor] = useState<any>(null);
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [assignedCourse, setAssignedCourse] = useState<any>(null);

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

  const [newExperience, setNewExperience] = useState<Qualification>({
    id: '',
    degree: '',
    institution: '',
    year: '',
    description: ''
  });

  const [showQualificationForm, setShowQualificationForm] = useState(false);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [editingQualification, setEditingQualification] = useState<string | null>(null);
  const [editingExperience, setEditingExperience] = useState<string | null>(null);

  useEffect(() => {
    fetchInstructorData();
  }, []);

  const fetchInstructorData = async () => {
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
          
          // Get or create instructor profile
          let instructorProfiles = JSON.parse(localStorage.getItem('instructor_profiles') || '[]');
          let instructorProfile = instructorProfiles.find((p: InstructorProfile) => 
            p.userId === user.id || p.email === user.email
          );

          if (!instructorProfile) {
            // Create default profile
            instructorProfile = {
              id: `profile_${Date.now()}`,
              userId: user.id,
              fullName: instructorUser?.name || user.name || user.email.split('@')[0],
              email: instructorUser?.email || user.email,
              phone: instructorUser?.phone || '',
              specialization: '',
              department: '',
              bio: 'No biography available.',
              profilePicture: '',
              qualifications: [],
              experience: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            instructorProfiles.push(instructorProfile);
            localStorage.setItem('instructor_profiles', JSON.stringify(instructorProfiles));
          }

          // Get assigned course
          if (instructorUser?.courseId) {
            const courses = JSON.parse(localStorage.getItem('lms_courses') || '[]');
            const course = courses.find((c: any) => c.id === instructorUser.courseId);
            setAssignedCourse(course);
          }

          setInstructor({
            ...user,
            ...instructorUser,
            isDemoAccount: user.email === 'instructor@gmail.com'
          });

          setProfile(instructorProfile);
          setEditForm({
            fullName: instructorProfile.fullName,
            email: instructorProfile.email,
            phone: instructorProfile.phone || '',
            specialization: instructorProfile.specialization || '',
            department: instructorProfile.department || '',
            bio: instructorProfile.bio || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching instructor data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============ PROFILE PICTURE UPLOAD ============
  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPEG, PNG)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size should be less than 2MB');
      return;
    }

    setUploading(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'profile');
      formData.append('userId', profile.userId);

      // Upload to Cloudinary via API route
      const response = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      if (result.success) {
        // Update profile with new image URL
        const updatedProfile = {
          ...profile,
          profilePicture: result.data.secure_url,
          updatedAt: new Date().toISOString()
        };

        // Save to localStorage
        const profiles = JSON.parse(localStorage.getItem('instructor_profiles') || '[]');
        const updatedProfiles = profiles.map((p: InstructorProfile) =>
          p.id === profile.id ? updatedProfile : p
        );
        localStorage.setItem('instructor_profiles', JSON.stringify(updatedProfiles));

        setProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // ============ PERSONAL INFO SAVE ============
  const handleSavePersonalInfo = () => {
    if (!profile) return;

    // Validate required fields
    if (!editForm.fullName.trim()) {
      alert('Full name is required');
      return;
    }

    if (!editForm.email.trim()) {
      alert('Email is required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      alert('Please enter a valid email address');
      return;
    }

    const updatedProfile = {
      ...profile,
      fullName: editForm.fullName,
      email: editForm.email,
      phone: editForm.phone,
      specialization: editForm.specialization,
      department: editForm.department,
      bio: editForm.bio,
      updatedAt: new Date().toISOString()
    };

    // Save to localStorage
    const profiles = JSON.parse(localStorage.getItem('instructor_profiles') || '[]');
    const updatedProfiles = profiles.map((p: InstructorProfile) =>
      p.id === profile.id ? updatedProfile : p
    );
    localStorage.setItem('instructor_profiles', JSON.stringify(updatedProfiles));

    setProfile(updatedProfile);
    setEditMode(false);
  };

  // ============ QUALIFICATIONS ============
  const handleAddQualification = () => {
    if (!profile) return;

    if (!newQualification.degree.trim() || !newQualification.institution.trim()) {
      alert('Degree and Institution are required');
      return;
    }

    const qualification: Qualification = {
      ...newQualification,
      id: editingQualification || `qual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    let updatedQualifications;
    if (editingQualification) {
      // Edit existing
      updatedQualifications = profile.qualifications.map(q =>
        q.id === editingQualification ? qualification : q
      );
    } else {
      // Add new
      updatedQualifications = [...profile.qualifications, qualification];
    }

    const updatedProfile = {
      ...profile,
      qualifications: updatedQualifications,
      updatedAt: new Date().toISOString()
    };

    // Save to localStorage
    const profiles = JSON.parse(localStorage.getItem('instructor_profiles') || '[]');
    const updatedProfiles = profiles.map((p: InstructorProfile) =>
      p.id === profile.id ? updatedProfile : p
    );
    localStorage.setItem('instructor_profiles', JSON.stringify(updatedProfiles));

    setProfile(updatedProfile);
    setNewQualification({ id: '', degree: '', institution: '', year: '', description: '' });
    setShowQualificationForm(false);
    setEditingQualification(null);
  };

  const handleEditQualification = (qualification: Qualification) => {
    setNewQualification(qualification);
    setEditingQualification(qualification.id);
    setShowQualificationForm(true);
  };

  const handleRemoveQualification = (id: string) => {
    if (!profile) return;
    if (!confirm('Are you sure you want to remove this qualification?')) return;

    const updatedProfile = {
      ...profile,
      qualifications: profile.qualifications.filter(q => q.id !== id),
      updatedAt: new Date().toISOString()
    };

    const profiles = JSON.parse(localStorage.getItem('instructor_profiles') || '[]');
    const updatedProfiles = profiles.map((p: InstructorProfile) =>
      p.id === profile.id ? updatedProfile : p
    );
    localStorage.setItem('instructor_profiles', JSON.stringify(updatedProfiles));

    setProfile(updatedProfile);
  };

  // ============ EXPERIENCE ============
  const handleAddExperience = () => {
    if (!profile) return;

    if (!newExperience.degree.trim() || !newExperience.institution.trim()) {
      alert('Position and Company are required');
      return;
    }

    const experience: Qualification = {
      ...newExperience,
      id: editingExperience || `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    let updatedExperience;
    if (editingExperience) {
      updatedExperience = profile.experience.map(e =>
        e.id === editingExperience ? experience : e
      );
    } else {
      updatedExperience = [...profile.experience, experience];
    }

    const updatedProfile = {
      ...profile,
      experience: updatedExperience,
      updatedAt: new Date().toISOString()
    };

    const profiles = JSON.parse(localStorage.getItem('instructor_profiles') || '[]');
    const updatedProfiles = profiles.map((p: InstructorProfile) =>
      p.id === profile.id ? updatedProfile : p
    );
    localStorage.setItem('instructor_profiles', JSON.stringify(updatedProfiles));

    setProfile(updatedProfile);
    setNewExperience({ id: '', degree: '', institution: '', year: '', description: '' });
    setShowExperienceForm(false);
    setEditingExperience(null);
  };

  const handleEditExperience = (experience: Qualification) => {
    setNewExperience(experience);
    setEditingExperience(experience.id);
    setShowExperienceForm(true);
  };

  const handleRemoveExperience = (id: string) => {
    if (!profile) return;
    if (!confirm('Are you sure you want to remove this experience?')) return;

    const updatedProfile = {
      ...profile,
      experience: profile.experience.filter(e => e.id !== id),
      updatedAt: new Date().toISOString()
    };

    const profiles = JSON.parse(localStorage.getItem('instructor_profiles') || '[]');
    const updatedProfiles = profiles.map((p: InstructorProfile) =>
      p.id === profile.id ? updatedProfile : p
    );
    localStorage.setItem('instructor_profiles', JSON.stringify(updatedProfiles));

    setProfile(updatedProfile);
  };

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
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

  if (!instructor || !profile) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="text-center py-8 sm:py-12">
          <User className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3" style={{ color: BRAND_COLORS.softGrey }} />
          <h3 className="text-base sm:text-lg font-medium mb-1" style={{ color: BRAND_COLORS.darkGrey }}>No profile data found</h3>
          <p className="text-darkGrey/70 text-sm">Please log in as an instructor to view profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
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
                      fullName: profile.fullName,
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
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ 
                    backgroundColor: BRAND_COLORS.deepRed,
                    color: BRAND_COLORS.white 
                  }}
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            )}
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
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={profile.fullName}
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
                    {getInitials(profile.fullName)}
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
                    <h2 className="text-xl sm:text-2xl font-bold text-darkGrey">{profile.fullName}</h2>
                  )}
                  {instructor.isDemoAccount && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                      Demo
                    </span>
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
                      {formatDate(profile.createdAt)}
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
                      {formatDate(profile.updatedAt)}
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
            {profile.qualifications.length > 0 ? (
              <div className="space-y-2">
                {profile.qualifications.map((qual) => (
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
              <p className="text-center text-darkGrey/70 py-4 text-sm">No qualifications added yet.</p>
            )}
          </div>

          {/* Experience Section */}
          <div className="bg-white rounded-lg border border-softGrey p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-semibold text-darkGrey">Work Experience</h3>
              <button
                onClick={() => {
                  setNewExperience({ id: '', degree: '', institution: '', year: '', description: '' });
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
                    value={newExperience.degree}
                    onChange={(e) => setNewExperience({ ...newExperience, degree: e.target.value })}
                    placeholder="Position / Job Title *"
                    className="w-full px-2 py-1.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue text-sm"
                  />
                  <input
                    type="text"
                    value={newExperience.institution}
                    onChange={(e) => setNewExperience({ ...newExperience, institution: e.target.value })}
                    placeholder="Company / Organization *"
                    className="w-full px-2 py-1.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue text-sm"
                  />
                  <input
                    type="text"
                    value={newExperience.year}
                    onChange={(e) => setNewExperience({ ...newExperience, year: e.target.value })}
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
                        setNewExperience({ id: '', degree: '', institution: '', year: '', description: '' });
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
            {profile.experience.length > 0 ? (
              <div className="space-y-2">
                {profile.experience.map((exp) => (
                  <div key={exp.id} className="flex items-start justify-between p-2 border border-softGrey rounded-lg hover:bg-lightGrey/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Briefcase className="w-4 h-4" style={{ color: BRAND_COLORS.teal }} />
                        <h4 className="font-medium text-darkGrey text-sm">{exp.degree}</h4>
                      </div>
                      <p className="text-xs text-darkGrey/70">{exp.institution}</p>
                      {exp.year && <p className="text-xs text-darkGrey/60 mt-0.5">{exp.year}</p>}
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
              <p className="text-center text-darkGrey/70 py-4 text-sm">No work experience added yet.</p>
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
                      <span className="text-darkGrey text-xs">{assignedCourse.students}</span>
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

            <ul className="list-disc list-inside space-y-1.5 text-sm text-darkGrey">
              <li>
                <span className="font-medium text-darkNavy">Assigned Course:</span>{" "}
                {assignedCourse ? "1" : "None"}
              </li>
              <li>
                <span className="font-medium text-darkNavy">Qualifications:</span>{" "}
                {profile.qualifications.length}
              </li>
              <li>
                <span className="font-medium text-darkNavy">Experience:</span>{" "}
                {profile.experience.length}
              </li>
              <li>
                <span className="font-medium text-darkNavy">Member Since:</span>{" "}
                {formatDate(profile.createdAt)}
              </li>
            </ul>
          </div>

          {/* Account Type */}
          <div className="bg-white rounded-lg border border-softGrey p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-semibold mb-3 text-darkBlue">
              Account Type
            </h3>

            <ol className="list-decimal list-inside space-y-1.5 text-sm text-darkGrey">
              <li>
                <span className="font-medium">Role:</span>{" "}
                <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-600">
                  Instructor
                </span>
              </li>
              <li>
                <span className="font-medium">Account Status:</span>{" "}
                <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                  Active
                </span>
              </li>
              <li>
                <span className="font-medium">Account Type:</span>{" "}
                <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${
                  instructor.isDemoAccount ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                }`}>
                  {instructor.isDemoAccount ? 'Demo Account' : 'Regular Account'}
                </span>
              </li>
              <li>
                <span className="font-medium">Profile ID:</span>{" "}
                <span className="text-xs font-mono text-darkGrey/70 truncate max-w-[120px]">
                  {profile.id}
                </span>
              </li>
            </ol>
          </div>

          {/* Profile Completion */}
          <div className="bg-white rounded-lg border border-softGrey p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-semibold mb-3" style={{ color: BRAND_COLORS.darkNavy }}>
              Profile Completion
            </h3>
            
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-sm mb-0.5">
                  <span className="text-darkGrey text-xs">Personal Info</span>
                  <span className="font-medium text-darkRoyalBlue text-xs">
                    {editForm.fullName && editForm.email ? '100%' : '50%'}
                  </span>
                </div>
                <div className="h-1.5 bg-lightGrey rounded-full overflow-hidden">
                  <div className="h-full bg-darkRoyalBlue rounded-full" style={{ width: editForm.fullName && editForm.email ? '100%' : '50%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-0.5">
                  <span className="text-darkGrey text-xs">Qualifications</span>
                  <span className="font-medium text-darkRoyalBlue text-xs">
                    {profile.qualifications.length > 0 ? '100%' : '0%'}
                  </span>
                </div>
                <div className="h-1.5 bg-lightGrey rounded-full overflow-hidden">
                  <div className="h-full bg-darkRoyalBlue rounded-full" style={{ width: profile.qualifications.length > 0 ? '100%' : '0%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-0.5">
                  <span className="text-darkGrey text-xs">Experience</span>
                  <span className="font-medium text-darkRoyalBlue text-xs">
                    {profile.experience.length > 0 ? '100%' : '0%'}
                  </span>
                </div>
                <div className="h-1.5 bg-lightGrey rounded-full overflow-hidden">
                  <div className="h-full bg-darkRoyalBlue rounded-full" style={{ width: profile.experience.length > 0 ? '100%' : '0%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-0.5">
                  <span className="text-darkGrey text-xs">Profile Picture</span>
                  <span className="font-medium text-darkRoyalBlue text-xs">
                    {profile.profilePicture ? '100%' : '0%'}
                  </span>
                </div>
                <div className="h-1.5 bg-lightGrey rounded-full overflow-hidden">
                  <div className="h-full bg-darkRoyalBlue rounded-full" style={{ width: profile.profilePicture ? '100%' : '0%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Account Notice */}
          {instructor.isDemoAccount && (
            <div className="bg-lightGrey rounded-lg p-3 border border-softGrey">
              <h4 className="font-medium text-darkGrey text-sm mb-1">Demo Account Notice</h4>
              <p className="text-xs text-darkGrey/70">
                This is a demo instructor account. Contact admin for full access.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}