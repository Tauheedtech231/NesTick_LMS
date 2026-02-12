// app/lms/Student_Portal/materials/page.tsx
'use client';
/* eslint-disable */
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HiDocumentText,
  HiVideoCamera,
  HiDocument,
  HiPhotograph,
  HiDownload,
  HiEye,
  HiSearch,
  HiBookOpen,
  HiUser,
  HiClock,
  HiTag,
  HiFolder,
  HiCloudDownload,
} from 'react-icons/hi';
/* eslint-disable */

const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  white: '#FFFFFF',
  lightGrey: '#F4F6F8',
  softGrey: '#E5E7EB',
  darkGrey: '#1F2933',
  teal: '#1FB6CB',
};

interface MaterialFile {
  id?: string;
  name: string;
  url: string;
  cloudinary_url?: string;
  public_id?: string;
  type: 'slides' | 'video' | 'pdf' | 'document' | 'image' | 'other';
  size?: string;
  isVideo?: boolean;
  isDocument?: boolean;
  format?: string;
}

interface Material {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseTitle: string;
  moduleId?: string;
  moduleTitle?: string;
  instructorId: string;
  instructorName: string;
  type: 'slides' | 'video' | 'pdf' | 'document' | 'image' | 'other';
  files: MaterialFile[];
  tags: string[];
  status: 'published' | 'draft';
  downloads: number;
  createdAt: string;
  updatedAt: string;
  storage?: 'cloudinary' | 'local';
}

interface Course {
  id: string;
  title: string;
  instructorName: string;
  progress: number;
  materialCount?: number;
}

export default function StudentMaterialsPage() {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = () => {
      try {
        const currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) {
          window.location.href = '/lms/auth/login?type=student';
          return;
        }

        const currentUser = JSON.parse(currentUserStr);
        if (currentUser.role !== 'student') {
          window.location.href = '/lms/auth/login?type=student';
          return;
        }

        setUser(currentUser);
        console.log('✅ Current student:', currentUser.email);

        // Get student's enrolled courses
        const studentCoursesStr = localStorage.getItem('studentCourses');
        let enrolledCourses: Course[] = [];

        if (studentCoursesStr) {
          enrolledCourses = JSON.parse(studentCoursesStr).map((c: any) => ({
            id: c.id,
            title: c.title,
            instructorName: c.instructorName || 'Not Assigned',
            progress: c.progress || 0,
            materialCount: 0,
          }));
          setCourses(enrolledCourses);
          console.log('📚 Enrolled courses:', enrolledCourses.map((c) => ({ id: c.id, title: c.title })));
        }

        // Get all materials
        const allMaterials = JSON.parse(localStorage.getItem('instructor_materials') || '[]');
        console.log(`📦 Total materials in system: ${allMaterials.length}`);

        // 🔥 FIX: Match by course ID OR course title (case‑insensitive trim)
        // 🔥 FALLBACK: If material.courseTitle === "General" and only 1 enrolled course → match that course
        const studentMaterials = allMaterials.filter((m: Material) => {
          if (m.status !== 'published') {
            console.log(`  - Skipping "${m.title}" (status: ${m.status})`);
            return false;
          }

          // 1. Normal matching by ID or title
          const exactMatch = enrolledCourses.some((course) => {
            const idMatch = m.courseId === course.id;
            const titleMatch =
              m.courseTitle?.toLowerCase().trim() === course.title?.toLowerCase().trim();
            return idMatch || titleMatch;
          });

          if (exactMatch) return true;

          // 2. FALLBACK: If material has "General" and student has only 1 course, assume it's for that course
          if (
            m.courseTitle?.toLowerCase().trim() === 'general' &&
            enrolledCourses.length === 1
          ) {
            console.log(
              `  ⚠️ FALLBACK: "${m.title}" has courseTitle "General" → assigning to "${enrolledCourses[0].title}"`
            );
            // Temporarily patch the material so it appears under the correct course
            m.courseTitle = enrolledCourses[0].title;
            m.courseId = enrolledCourses[0].id;
            return true;
          }

          console.log(
            `  ❌ No match: "${m.title}" (courseId: ${m.courseId}, courseTitle: "${m.courseTitle}")`
          );
          return false;
        });

        // Sort by newest first
        studentMaterials.sort(
          (a: { createdAt: string | number | Date; }, b: { createdAt: string | number | Date; }) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        console.log(`🎯 Final materials for student: ${studentMaterials.length}`);
        setMaterials(studentMaterials);
        setFilteredMaterials(studentMaterials);

        // Update materialCount for each course
        const coursesWithCount = enrolledCourses.map((course) => {
          const count = studentMaterials.filter(
            (m: { courseId: string; courseTitle: string; }) =>
              m.courseId === course.id ||
              m.courseTitle?.toLowerCase().trim() === course.title?.toLowerCase().trim()
          ).length;
          return { ...course, materialCount: count };
        });
        setCourses(coursesWithCount);
      } catch (error) {
        console.error('🔥 Error loading materials:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ========== 🔍 FILTER MATERIALS ==========
  useEffect(() => {
    let filtered = materials;

    if (selectedCourse !== 'all') {
      filtered = filtered.filter((m) => m.courseId === selectedCourse);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter((m) => m.type === selectedType);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.instructorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredMaterials(filtered);
  }, [selectedCourse, selectedType, searchTerm, materials]);

  // ========== 📥 DOWNLOAD FILE ==========
  const handleDownload = async (material: Material, file: MaterialFile) => {
    setDownloadingId(`${material.id}-${file.id}`);
    try {
      const fileUrl = file.cloudinary_url || file.url;
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = file.name || `material-${file.type}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleView = (file: MaterialFile) => {
    const fileUrl = file.cloudinary_url || file.url;
    window.open(fileUrl, '_blank');
  };

  const getTypeIcon = (type: Material['type']) => {
    switch (type) {
      case 'slides': return <HiDocumentText className="w-5 h-5" />;
      case 'video': return <HiVideoCamera className="w-5 h-5" />;
      case 'pdf': return <HiDocument className="w-5 h-5" />;
      case 'image': return <HiPhotograph className="w-5 h-5" />;
      default: return <HiDocumentText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: Material['type']) => {
    switch (type) {
      case 'slides': return 'bg-blue-100 text-blue-600';
      case 'video': return 'bg-red-100 text-red-600';
      case 'pdf': return 'bg-amber-100 text-amber-600';
      case 'image': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTypeLabel = (type: Material['type']) => {
    switch (type) {
      case 'slides': return 'Slides';
      case 'video': return 'Video';
      case 'pdf': return 'PDF';
      case 'image': return 'Image';
      case 'document': return 'Document';
      default: return 'File';
    }
  };

  const stats = {
    totalMaterials: materials.length,
    totalVideos: materials.filter((m) => m.type === 'video').length,
    totalSlides: materials.filter((m) => m.type === 'slides').length,
    totalPdfs: materials.filter((m) => m.type === 'pdf').length,
  };

  const uniqueCourses = Array.from(
    new Map(materials.map((m) => [m.courseId, { id: m.courseId, title: m.courseTitle }])).values()
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div
            className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent"
            style={{ borderColor: BRAND_COLORS.deepRed }}
          ></div>
          <p className="mt-4 text-gray-600">Loading materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white mb-4 sm:mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-1">📚 Course Materials</h1>
            <p className="text-purple-100 text-xs sm:text-sm">
              {user?.fullName?.split(' ')[0] || 'Student'} • {materials.length} materials available
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/20 rounded-lg px-3 py-2">
              <span className="text-xs sm:text-sm">Enrolled: </span>
              <span className="text-lg sm:text-xl font-bold ml-1">{courses.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========== ENROLLED COURSES LIST ========== */}
      {courses.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm">
          <h2 className="text-sm sm:text-base font-semibold mb-3 flex items-center gap-2" style={{ color: BRAND_COLORS.darkNavy }}>
            <HiBookOpen className="w-4 h-4" />
            Your Enrolled Courses
          </h2>
          <div className="flex overflow-x-auto pb-2 -mx-1 px-1 gap-2 scrollbar-thin scrollbar-thumb-gray-300">
            {courses.map((course) => (
              <div
                key={course.id}
                className="flex-shrink-0 bg-gray-50 border border-gray-200 rounded-lg p-3 min-w-[200px] hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="truncate flex-1">
                    <p className="font-medium text-sm truncate" style={{ color: BRAND_COLORS.darkNavy }}>
                      {course.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {course.instructorName}
                    </p>
                  </div>
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded-full ${
                      course.materialCount && course.materialCount > 0
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {course.materialCount || 0} files
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-purple-600 h-1.5 rounded-full"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{course.progress}% completed</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Materials are automatically matched to your courses by title.
          </p>
        </div>
      )}

      {/* Stats Cards */}
      {materials.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-lg sm:text-xl font-bold mt-1 text-gray-900">{stats.totalMaterials}</p>
              </div>
              <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                <HiFolder className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Videos</p>
                <p className="text-lg sm:text-xl font-bold mt-1 text-gray-900">{stats.totalVideos}</p>
              </div>
              <div className="p-2 rounded-full bg-red-100 text-red-600">
                <HiVideoCamera className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Slides</p>
                <p className="text-lg sm:text-xl font-bold mt-1 text-gray-900">{stats.totalSlides}</p>
              </div>
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                <HiDocumentText className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">PDFs</p>
                <p className="text-lg sm:text-xl font-bold mt-1 text-gray-900">{stats.totalPdfs}</p>
              </div>
              <div className="p-2 rounded-full bg-amber-100 text-amber-600">
                <HiDocument className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, course, instructor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
              />
            </div>
          </div>
          <div className="w-full lg:w-48">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 bg-white"
            >
              <option value="all">📚 All Courses</option>
              {uniqueCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full lg:w-40">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 bg-white"
            >
              <option value="all">📁 All Types</option>
              <option value="video">🎬 Videos</option>
              <option value="slides">📊 Slides</option>
              <option value="pdf">📄 PDFs</option>
              <option value="image">🖼️ Images</option>
              <option value="document">📝 Documents</option>
            </select>
          </div>
        </div>
      </div>

      {/* No courses */}
      {courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center shadow-sm">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <HiBookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">No Courses Enrolled</h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-6 max-w-md mx-auto">
            You haven't enrolled in any courses yet. Enroll in a course to access materials.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-purple-900 transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      ) : materials.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center shadow-sm">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <HiFolder className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">No Materials Yet</h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-2 max-w-md mx-auto">
            Your instructors haven't uploaded any materials for your enrolled courses yet.
          </p>
          <p className="text-xs text-gray-500">Check back later or contact your instructor.</p>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center shadow-sm">
          <HiSearch className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Matching Materials</h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-4">
            Try adjusting your search or filter criteria
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCourse('all');
              setSelectedType('all');
            }}
            className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredMaterials.map((material) => (
            <div
              key={material.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${getTypeColor(material.type)}`}>
                      {getTypeIcon(material.type)}
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">
                        {getTypeLabel(material.type)}
                      </span>
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-1 mt-0.5">
                        {material.title}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center text-xs text-gray-600">
                    <HiBookOpen className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                    <span className="truncate">{material.courseTitle}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <HiUser className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                    <span className="truncate">{material.instructorName}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <HiClock className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                    <span>Added {new Date(material.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {material.description && (
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{material.description}</p>
                )}

                {material.moduleTitle && (
                  <div className="mb-3">
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                      📌 {material.moduleTitle}
                    </span>
                  </div>
                )}

                {material.tags && material.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {material.tags.slice(0, 2).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full flex items-center"
                      >
                        <HiTag className="w-3 h-3 mr-0.5" />
                        {tag}
                      </span>
                    ))}
                    {material.tags.length > 2 && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        +{material.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {material.files && material.files.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
                      <HiCloudDownload className="w-3.5 h-3.5" />
                      Files ({material.files.length})
                    </p>
                    <div className="space-y-2">
                      {material.files.slice(0, 2).map((file, idx) => (
                        <div
                          key={file.id || idx}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div
                              className={`p-1 rounded flex-shrink-0 ${
                                file.type === 'video'
                                  ? 'bg-red-100 text-red-600'
                                  : file.type === 'slides'
                                  ? 'bg-blue-100 text-blue-600'
                                  : file.type === 'pdf'
                                  ? 'bg-amber-100 text-amber-600'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {file.type === 'video' ? (
                                <HiVideoCamera className="w-3.5 h-3.5" />
                              ) : file.type === 'slides' ? (
                                <HiDocumentText className="w-3.5 h-3.5" />
                              ) : file.type === 'pdf' ? (
                                <HiDocument className="w-3.5 h-3.5" />
                              ) : (
                                <HiDocumentText className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-gray-900 truncate">
                                {file.name || `${getTypeLabel(file.type)} File`}
                              </p>
                              {file.size && <p className="text-xs text-gray-500">{file.size}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                            <button
                              onClick={() => handleView(file)}
                              className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-white rounded transition-colors"
                              title={file.isVideo ? 'Watch Video' : 'View'}
                            >
                              <HiEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownload(material, file)}
                              disabled={downloadingId === `${material.id}-${file.id}`}
                              className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-white rounded transition-colors disabled:opacity-50"
                              title="Download"
                            >
                              {downloadingId === `${material.id}-${file.id}` ? (
                                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <HiDownload className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                      {material.files.length > 2 && (
                        <button
                          onClick={() =>
                            window.open(`/lms/Student_Portal/materials/${material.id}`, '_blank')
                          }
                          className="w-full py-1.5 text-xs text-purple-600 hover:text-purple-700 font-medium border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                        >
                          View all {material.files.length} files
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">📥 {material.downloads || 0} downloads</span>
                  <span className="text-xs text-gray-500">ID: {material.id.slice(-6)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}