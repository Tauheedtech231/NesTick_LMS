// lms/Instructor_Portal/students-progress/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import {
  HiUserGroup,
  HiCheckCircle,
  HiRefresh,
  HiSearch,
  HiChevronDown,
  HiChevronUp,
  HiMail,
  HiPhone,
  HiBookOpen,
  HiStar,
  HiChartBar,
  HiXCircle,
  HiDownload,
  HiCalendar,
  HiFilter,
  HiDocumentDownload
} from 'react-icons/hi';
import { Loader2 } from 'lucide-react';
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
  emerald: '#10B981',
  purple: '#8B5CF6'
};

interface StudentProgress {
  student_email: string;
  student_name: string;
  student_phone: string;
  enrollment_date: string;
  course_id: string;
  course_title: string;
  total_slides: number;
  completed_slides: number;
  progress_percentage: number;
  certificate_issued: 'Yes' | 'No';
  certificate_issue_date: string | null;
  certificate_number: string | null;
  last_active: string | null;
}

interface SummaryStats {
  totalStudents: number;
  totalCourses: number;
  studentsWithCertificates: number;
  studentsCompleted: number;
  averageProgress: number;
  latestEnrollment: string | null;
  earliestEnrollment: string | null;
}

// Define the export data type
interface ExportDataRow {
  'Student Name': string;
  'Email': string;
  'Phone': string;
  'Course': string;
  'Enrollment Date': string;
  'Progress (%)': number;
  'Completed Lessons': string;
  'Certificate Issued': 'Yes' | 'No';
  'Certificate Number': string;
  'Certificate Date': string;
  'Last Active': string;
}

type ExportFormat = 'csv' | 'excel' | 'pdf';

export default function InstructorStudentsProgressPage() {
  const router = useRouter();
  const [instructor, setInstructor] = useState<any>(null);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentProgress[]>([]);
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [certificateFilter, setCertificateFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Export states
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [progressRange, setProgressRange] = useState({ min: 0, max: 100 });
  const [isExporting, setIsExporting] = useState(false);

  // Get unique courses for filter
  const courses = [...new Set(students.map(s => s.course_title))];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      checkAuthAndLoadData();
    }
  }, [isMounted]);

  const checkAuthAndLoadData = async () => {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (!userStr) {
        router.push('/lms/auth/login?type=instructor');
        return;
      }

      const userData = JSON.parse(userStr);
      if (userData.role !== 'instructor') {
        router.push('/lms/auth/login?type=instructor');
        return;
      }

      setInstructor(userData);
      await fetchStudentsProgress(userData.id);
    } catch (error) {
      console.error('Error loading user:', error);
      setError('Failed to load user data');
      setLoading(false);
    }
  };

  const fetchStudentsProgress = async (instructorId: string, showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(`/api/instructors/students-progress?instructorId=${instructorId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      if (result.success) {
        setStudents(result.data.students || []);
        setFilteredStudents(result.data.students || []);
        setSummary(result.data.summary);
      }
    } catch (error: any) {
      console.error('Error fetching students progress:', error);
      setError(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter students based on search, course, certificate, date range, and progress
  useEffect(() => {
    if (students.length > 0) {
      let filtered = [...students];

      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(s =>
          (s.student_name || '').toLowerCase().includes(term) ||
          (s.student_email || '').toLowerCase().includes(term) ||
          (s.student_phone || '').toLowerCase().includes(term) ||
          (s.course_title || '').toLowerCase().includes(term)
        );
      }

      // Apply course filter
      if (selectedCourse !== 'all') {
        filtered = filtered.filter(s => s.course_title === selectedCourse);
      }

      // Apply certificate filter
      if (certificateFilter !== 'all') {
        filtered = filtered.filter(s => 
          certificateFilter === 'yes' ? s.certificate_issued === 'Yes' : s.certificate_issued === 'No'
        );
      }

      // Apply date range filter
      if (dateFrom) {
        filtered = filtered.filter(s => new Date(s.enrollment_date) >= new Date(dateFrom));
      }
      if (dateTo) {
        filtered = filtered.filter(s => new Date(s.enrollment_date) <= new Date(dateTo));
      }

      // Apply progress range filter
      filtered = filtered.filter(s => 
        s.progress_percentage >= progressRange.min && s.progress_percentage <= progressRange.max
      );

      setFilteredStudents(filtered);
    }
  }, [searchTerm, selectedCourse, certificateFilter, dateFrom, dateTo, progressRange, students]);

  const handleRefresh = () => {
    if (instructor?.id) {
      fetchStudentsProgress(instructor.id, true);
    }
  };

  // ==================== EXPORT FUNCTIONALITY ====================

  // Helper function to prepare export data
  const prepareExportData = (): ExportDataRow[] => {
    return filteredStudents.map(s => ({
      'Student Name': s.student_name,
      'Email': s.student_email,
      'Phone': s.student_phone || 'N/A',
      'Course': s.course_title,
      'Enrollment Date': formatDateForExport(s.enrollment_date),
      'Progress (%)': s.progress_percentage,
      'Completed Lessons': `${s.completed_slides}/${s.total_slides}`,
      'Certificate Issued': s.certificate_issued,
      'Certificate Number': s.certificate_number || 'N/A',
      'Certificate Date': s.certificate_issue_date ? formatDateForExport(s.certificate_issue_date) : 'N/A',
      'Last Active': s.last_active ? formatDateForExport(s.last_active) : 'Never'
    }));
  };

  const exportToCSV = () => {
    const exportData = prepareExportData();
    
    if (exportData.length === 0) {
      alert('No data to export');
      return;
    }

    // Get headers as a typed array
    const headers = Object.keys(exportData[0]) as Array<keyof ExportDataRow>;
    const csvRows: string[] = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    for (const row of exportData) {
      const values = headers.map(header => {
        const value = row[header]?.toString() || '';
        return `"${value.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `students_progress_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    const exportData = prepareExportData();
    
    if (exportData.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(exportData[0]) as Array<keyof ExportDataRow>;
    const csvRows: string[] = [];
    
    csvRows.push(headers.join(','));
    
    for (const row of exportData) {
      const values = headers.map(header => {
        const value = row[header]?.toString() || '';
        return `"${value.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `students_progress_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const exportData = prepareExportData();
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to generate PDF');
      return;
    }

    // Calculate summary for export
    const totalStudents = exportData.length;
    const completedStudents = exportData.filter(s => s['Progress (%)'] === 100).length;
    const certifiedStudents = exportData.filter(s => s['Certificate Issued'] === 'Yes').length;
    const avgProgress = exportData.reduce((sum, s) => sum + s['Progress (%)'], 0) / (totalStudents || 1);

    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Students Progress Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            margin: 40px;
            padding: 20px;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #1E3A8A;
          }
          .header h1 {
            color: #1E3A8A;
            font-size: 28px;
            margin-bottom: 10px;
          }
          .header p {
            color: #6B7280;
            font-size: 14px;
          }
          .summary {
            background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
          }
          .summary h3 {
            color: #1E3A8A;
            margin-bottom: 15px;
            font-size: 18px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
          }
          .summary-item {
            background: white;
            padding: 12px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .summary-item strong {
            color: #4B5563;
            display: block;
            font-size: 12px;
            margin-bottom: 5px;
          }
          .summary-item span {
            color: #1F2937;
            font-size: 18px;
            font-weight: bold;
          }
          .filters-applied {
            background: #EFF6FF;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 11px;
          }
          th, td {
            border: 1px solid #D1D5DB;
            padding: 8px;
            text-align: left;
          }
          th {
            background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%);
            color: white;
            font-weight: 600;
          }
          tr:nth-child(even) {
            background-color: #F9FAFB;
          }
          .progress-bar-container {
            width: 100%;
            background-color: #E5E7EB;
            border-radius: 4px;
            overflow: hidden;
          }
          .progress-bar {
            height: 6px;
            background-color: #10B981;
            border-radius: 4px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 11px;
            color: #9CA3AF;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
          }
          .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 500;
          }
          .badge-green {
            background-color: #D1FAE5;
            color: #065F46;
          }
          .badge-gray {
            background-color: #F3F4F6;
            color: #4B5563;
          }
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Students Progress Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <p>Instructor: ${instructor?.name || 'N/A'}</p>
        </div>
    `;

    // Add summary
    htmlContent += `
      <div class="summary">
        <h3>📊 Summary Statistics</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <strong>Total Students</strong>
            <span>${totalStudents}</span>
          </div>
          <div class="summary-item">
            <strong>Completed Courses</strong>
            <span>${completedStudents}</span>
          </div>
          <div class="summary-item">
            <strong>Certificates Issued</strong>
            <span>${certifiedStudents}</span>
          </div>
          <div class="summary-item">
            <strong>Average Progress</strong>
            <span>${avgProgress.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    `;

    // Add filters applied
    const filters = [];
    if (searchTerm) filters.push(`Search: "${searchTerm}"`);
    if (selectedCourse !== 'all') filters.push(`Course: ${selectedCourse}`);
    if (certificateFilter !== 'all') filters.push(`Certificate: ${certificateFilter === 'yes' ? 'Issued' : 'Not Issued'}`);
    if (dateFrom) filters.push(`From: ${new Date(dateFrom).toLocaleDateString()}`);
    if (dateTo) filters.push(`To: ${new Date(dateTo).toLocaleDateString()}`);
    if (progressRange.min > 0 || progressRange.max < 100) filters.push(`Progress: ${progressRange.min}% - ${progressRange.max}%`);

    if (filters.length > 0) {
      htmlContent += `
        <div class="filters-applied">
          <strong>🔍 Filters Applied:</strong> ${filters.join(' | ')}
        </div>
      `;
    }

    // Add table
    if (exportData.length > 0) {
      const headers = Object.keys(exportData[0]) as Array<keyof ExportDataRow>;
      htmlContent += `
        <table>
          <thead>
            <tr>
              ${headers.map(header => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
      `;

      exportData.forEach(row => {
        htmlContent += `
          <tr>
            ${headers.map(header => {
              let value = row[header]?.toString() || '-';
              // Add progress bar for Progress column
              if (header === 'Progress (%)') {
                const progress = parseFloat(value);
                value = `${value}% <div class="progress-bar-container"><div class="progress-bar" style="width: ${progress}%"></div></div>`;
              }
              // Add badge for Certificate Issued column
              if (header === 'Certificate Issued') {
                const badgeClass = value === 'Yes' ? 'badge-green' : 'badge-gray';
                value = `<span class="badge ${badgeClass}">${value === 'Yes' ? '✓ Issued' : '✗ Not Issued'}</span>`;
              }
              return `<td>${value}</td>`;
            }).join('')}
          </tr>
        `;
      });

      htmlContent += `
          </tbody>
        </table>
      `;
    } else {
      htmlContent += `<p style="text-align: center; padding: 40px;">No data available with current filters.</p>`;
    }

    htmlContent += `
        <div class="footer">
          <p>© ${new Date().getFullYear()} LMS - Students Progress Report</p>
          <p>This report is system generated and does not require signature</p>
        </div>
        <div class="no-print" style="position: fixed; bottom: 20px; right: 20px;">
          <button onclick="window.print();" style="padding: 10px 20px; background: #1E3A8A; color: white; border: none; border-radius: 8px; cursor: pointer;">🖨️ Print / Save as PDF</button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const formatDateForExport = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const handleExport = () => {
    const exportData = prepareExportData();
    if (exportData.length === 0) {
      alert('No data to export. Please adjust your filters.');
      return;
    }

    setIsExporting(true);
    try {
      if (exportFormat === 'csv') {
        exportToCSV();
      } else if (exportFormat === 'excel') {
        exportToExcel();
      } else if (exportFormat === 'pdf') {
        exportToPDF();
      }
      setShowExportModal(false);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error generating export. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCourse('all');
    setCertificateFilter('all');
    setDateFrom('');
    setDateTo('');
    setProgressRange({ min: 0, max: 100 });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBgColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-600';
    if (progress >= 50) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: BRAND_COLORS.deepRed }} />
          <p className="text-gray-600">Loading students progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <HiXCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div 
          className="rounded-xl p-6 text-white"
          style={{ 
            background: `linear-gradient(135deg, ${BRAND_COLORS.darkRoyalBlue} 0%, ${BRAND_COLORS.darkNavy} 100%)`
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div 
                className="p-3 rounded-xl"
                style={{ backgroundColor: `${BRAND_COLORS.white}20` }}
              >
                <HiUserGroup className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">Students Progress</h1>
                <p style={{ color: `${BRAND_COLORS.white}CC` }}>Track your students' learning journey</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: BRAND_COLORS.emerald }}
              >
                <HiDownload className="w-4 h-4" />
                Export
              </button>
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
      </div>

      {/* Summary Stats Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <HiUserGroup className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600">Total Students</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.totalStudents}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <HiBookOpen className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600">Total Courses</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.totalCourses}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <HiStar className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-gray-600">Certificates Issued</p>
            </div>
            <p className="text-2xl font-bold text-amber-600">{summary.studentsWithCertificates}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <HiChartBar className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-gray-600">Avg Progress</p>
            </div>
            <p className="text-2xl font-bold text-purple-600">{summary.averageProgress}%</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Course Filter */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Courses</option>
            {courses.map((course, index) => (
              <option key={index} value={course}>{course}</option>
            ))}
          </select>

          {/* Certificate Filter */}
          <select
            value={certificateFilter}
            onChange={(e) => setCertificateFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Certificates</option>
            <option value="yes">With Certificate</option>
            <option value="no">Without Certificate</option>
          </select>

          {/* Date From */}
          <div className="relative">
            <HiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="From Date"
            />
          </div>

          {/* Date To */}
          <div className="relative">
            <HiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="To Date"
            />
          </div>

          {/* Progress Range */}
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min %"
              value={progressRange.min}
              onChange={(e) => setProgressRange(prev => ({ ...prev, min: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) }))}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              placeholder="Max %"
              value={progressRange.max}
              onChange={(e) => setProgressRange(prev => ({ ...prev, max: Math.min(100, Math.max(0, parseInt(e.target.value) || 100)) }))}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Results Count & Reset */}
          <div className="flex items-center justify-between gap-2">
            <div className="px-4 py-2 bg-gray-100 rounded-lg flex-1 text-center">
              <span className="text-sm text-gray-600">
                Showing {filteredStudents.length} of {students.length}
              </span>
            </div>
            <button
              onClick={resetFilters}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              title="Reset Filters"
            >
              <HiFilter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <HiUserGroup className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
          <p className="text-gray-500">No students match your current filters.</p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredStudents.map((student, index) => (
            <div key={`${student.student_email}-${student.course_id}-${index}`} 
                 className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              
              {/* Student Header */}
              <div className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Student Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-semibold text-indigo-600">
                          {getInitials(student.student_name)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{student.student_name || 'Unknown'}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <HiMail className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{student.student_email}</span>
                          </span>
                          {student.student_phone && (
                            <span className="flex items-center gap-1">
                              <HiPhone className="w-4 h-4 flex-shrink-0" />
                              <span>{student.student_phone}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Course Info & Progress */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <HiBookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900 truncate">{student.course_title}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className={`font-semibold ${getProgressColor(student.progress_percentage)}`}>
                          {student.progress_percentage}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${getProgressBgColor(student.progress_percentage)}`}
                          style={{ width: `${student.progress_percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{student.completed_slides}/{student.total_slides} lessons</span>
                        <span>Last active: {formatDate(student.last_active)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Certificate Status & Actions */}
                  <div className="flex flex-col items-end gap-3">
                    {student.certificate_issued === 'Yes' ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <HiCheckCircle className="w-4 h-4" />
                        Certificate Issued
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        No Certificate
                      </span>
                    )}
                    
                    <button
                      onClick={() => setExpandedStudent(
                        expandedStudent === `${student.student_email}-${student.course_id}` 
                          ? null 
                          : `${student.student_email}-${student.course_id}`
                      )}
                      className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      {expandedStudent === `${student.student_email}-${student.course_id}` ? (
                        <>Hide Details <HiChevronUp className="w-4 h-4" /></>
                      ) : (
                        <>View Details <HiChevronDown className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedStudent === `${student.student_email}-${student.course_id}` && (
                <div className="border-t border-gray-200 bg-gray-50 p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Enrollment Details */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Enrollment Details</h4>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Enrollment Date:</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {formatDate(student.enrollment_date)}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Course:</dt>
                          <dd className="text-sm font-medium text-gray-900">{student.course_title}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Last Active:</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {formatDate(student.last_active)}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {/* Certificate Details */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Certificate Details</h4>
                      {student.certificate_issued === 'Yes' ? (
                        <dl className="space-y-2">
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Certificate #:</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {student.certificate_number}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Issue Date:</dt>
                            <dd className="text-sm font-medium text-gray-900">
                              {formatDate(student.certificate_issue_date)}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Status:</dt>
                            <dd className="text-sm">
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                Active
                              </span>
                            </dd>
                          </div>
                        </dl>
                      ) : (
                        <p className="text-sm text-gray-500">No certificate issued yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-emerald-600 to-teal-600">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <HiDocumentDownload className="w-5 h-5" />
                  Export Students Progress
                </h3>
              </div>
              <button 
                onClick={() => setShowExportModal(false)} 
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <HiXCircle className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 overflow-auto max-h-[calc(85vh-100px)] bg-gray-50">
              {/* Export Info */}
              <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>📊 Exporting:</strong> {filteredStudents.length} student records
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Based on current filters (search, course, certificate, date range, progress)
                </p>
              </div>

              {/* Export Format Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Export Format</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setExportFormat('csv')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      exportFormat === 'csv' 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                        : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300'
                    }`}
                  >
                    <HiDocumentDownload className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">CSV</span>
                    <p className="text-xs text-gray-400 mt-1">Excel compatible</p>
                  </button>
                  <button
                    onClick={() => setExportFormat('excel')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      exportFormat === 'excel' 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                        : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300'
                    }`}
                  >
                    <HiDocumentDownload className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">Excel</span>
                    <p className="text-xs text-gray-400 mt-1">.xls format</p>
                  </button>
                  <button
                    onClick={() => setExportFormat('pdf')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      exportFormat === 'pdf' 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                        : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300'
                    }`}
                  >
                    <HiDocumentDownload className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">PDF</span>
                    <p className="text-xs text-gray-400 mt-1">Print ready</p>
                  </button>
                </div>
              </div>

              {/* Current Filters Summary */}
              <div className="mb-6 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Current Filters Applied:</p>
                <div className="space-y-1 text-xs text-gray-600">
                  {searchTerm && <p>• Search: "{searchTerm}"</p>}
                  {selectedCourse !== 'all' && <p>• Course: {selectedCourse}</p>}
                  {certificateFilter !== 'all' && <p>• Certificate: {certificateFilter === 'yes' ? 'Issued' : 'Not Issued'}</p>}
                  {dateFrom && <p>• From Date: {new Date(dateFrom).toLocaleDateString()}</p>}
                  {dateTo && <p>• To Date: {new Date(dateTo).toLocaleDateString()}</p>}
                  {(progressRange.min > 0 || progressRange.max < 100) && (
                    <p>• Progress Range: {progressRange.min}% - {progressRange.max}%</p>
                  )}
                  {!searchTerm && selectedCourse === 'all' && certificateFilter === 'all' && !dateFrom && !dateTo && progressRange.min === 0 && progressRange.max === 100 && (
                    <p className="text-gray-400">No filters applied - exporting all data</p>
                  )}
                </div>
              </div>

              {/* Export Button */}
              <div className="flex gap-3">
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <HiDownload className="w-4 h-4" />
                      Export {filteredStudents.length} Records
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}