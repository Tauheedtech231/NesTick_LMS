/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  BookOpen,
  Users,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Award,
  User,
  RefreshCw,
  AlertCircle,
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  Printer,
  Filter,
  X,
  Loader2,
  Mail,
  Phone,
  GraduationCap,
  Briefcase
} from 'lucide-react'

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
  brightRed: '#D32F2F',
  emerald: '#10B981',
  purple: '#8B5CF6'
}

type ExportFormat = 'csv' | 'excel' | 'json' | 'pdf'

interface Instructor {
  id: string
  name: string
  email: string
  phone: string | null
  specialization: string
  experience: string
  qualification: string
  status: 'active' | 'inactive'
  rating: number | string
  course_id: string | null
  total_students: number
  created_at: string
  course_title?: string
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Export states
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv')
  const [exportType, setExportType] = useState<'all' | 'single' | 'filtered'>('all')
  const [selectedInstructorForExport, setSelectedInstructorForExport] = useState<Instructor | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // Fetch instructors from API
  const fetchInstructors = async () => {
    try {
      setError(null)
      setRefreshing(true)
      
      const response = await fetch('/api/instructors')
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch instructors')
      }
      
      if (result.success && result.data) {
        setInstructors(result.data)
      } else {
        setInstructors([])
      }
    } catch (error: any) {
      console.error('Error fetching instructors:', error)
      setError(error.message || 'Failed to load instructors')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchInstructors()
  }, [])

  // Filter instructors
  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = 
      instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (instructor.specialization?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (instructor.course_title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (instructor.qualification?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || instructor.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  // Get stats
  const activeInstructors = instructors.filter(i => i.status === 'active').length
  const inactiveInstructors = instructors.filter(i => i.status === 'inactive').length
  const totalStudents = instructors.reduce((sum, i) => sum + (i.total_students || 0), 0)
  const avgRating = instructors.reduce((sum, i) => {
    const rating = typeof i.rating === 'string' ? parseFloat(i.rating) : (i.rating || 0)
    return sum + rating
  }, 0) / (instructors.length || 1)

  // ==================== EXPORT FUNCTIONALITY ====================

  // Export Single Instructor
  const exportSingleInstructor = (instructor: Instructor, format: ExportFormat) => {
    const instructorData = {
      personalInfo: {
        name: instructor.name,
        email: instructor.email,
        phone: instructor.phone || 'N/A',
        status: instructor.status,
        joinedDate: new Date(instructor.created_at).toLocaleDateString()
      },
      professionalInfo: {
        specialization: instructor.specialization || 'N/A',
        qualification: instructor.qualification || 'N/A',
        experience: instructor.experience || 'N/A',
        rating: typeof instructor.rating === 'string' ? parseFloat(instructor.rating).toFixed(1) : (instructor.rating || 0),
        totalStudents: instructor.total_students || 0
      },
      courseInfo: {
        assignedCourse: instructor.course_title || 'Not assigned',
        courseId: instructor.course_id || 'N/A'
      },
      exportDate: new Date().toISOString()
    }

    const fileName = `${instructor.name.replace(/\s/g, '_')}_details`

    if (format === 'json') {
      downloadJSON(instructorData, `${fileName}.json`)
    } else if (format === 'csv') {
      const csvData = [{
        'Name': instructor.name,
        'Email': instructor.email,
        'Phone': instructor.phone || 'N/A',
        'Status': instructor.status,
        'Specialization': instructor.specialization || 'N/A',
        'Qualification': instructor.qualification || 'N/A',
        'Experience': instructor.experience || 'N/A',
        'Rating': typeof instructor.rating === 'string' ? parseFloat(instructor.rating).toFixed(1) : (instructor.rating || 0),
        'Total Students': instructor.total_students || 0,
        'Assigned Course': instructor.course_title || 'Not assigned',
        'Joined Date': new Date(instructor.created_at).toLocaleDateString()
      }]
      downloadCSV(csvData, `${fileName}.csv`)
    } else if (format === 'excel') {
      downloadExcel([csvRowToObject(instructor)], fileName)
    } else if (format === 'pdf') {
      generatePDFReport([{
        'Name': instructor.name,
        'Email': instructor.email,
        'Phone': instructor.phone || 'N/A',
        'Status': instructor.status,
        'Course': instructor.course_title || 'Not assigned',
        'Students': instructor.total_students || 0,
        'Rating': typeof instructor.rating === 'string' ? parseFloat(instructor.rating).toFixed(1) : (instructor.rating || 0)
      }], `Instructor Details - ${instructor.name}`, fileName)
    }
  }

  // Export All Instructors
  const exportAllInstructors = () => {
    let dataToExport = [...instructors]
    
    // Apply current filters
    if (filterStatus !== 'all') {
      dataToExport = dataToExport.filter(i => i.status === filterStatus)
    }
    if (searchTerm) {
      dataToExport = dataToExport.filter(i => 
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.course_title?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      )
    }

    const exportData = dataToExport.map(i => ({
      'Name': i.name,
      'Email': i.email,
      'Phone': i.phone || 'N/A',
      'Status': i.status,
      'Specialization': i.specialization || 'N/A',
      'Qualification': i.qualification || 'N/A',
      'Experience': i.experience || 'N/A',
      'Rating': typeof i.rating === 'string' ? parseFloat(i.rating).toFixed(1) : (i.rating || 0),
      'Total Students': i.total_students || 0,
      'Assigned Course': i.course_title || 'Not assigned',
      'Course ID': i.course_id || 'N/A',
      'Joined Date': new Date(i.created_at).toLocaleDateString()
    }))

    const fileName = `instructors_export_${new Date().toISOString().split('T')[0]}`
    
    if (exportFormat === 'csv') {
      downloadCSV(exportData, `${fileName}.csv`)
    } else if (exportFormat === 'json') {
      downloadJSON(dataToExport, `${fileName}.json`)
    } else if (exportFormat === 'excel') {
      downloadExcel(exportData, fileName)
    } else if (exportFormat === 'pdf') {
      generatePDFReport(exportData, 'Instructors Report', fileName, {
        'Total Instructors': dataToExport.length,
        'Active Instructors': dataToExport.filter(i => i.status === 'active').length,
        'Inactive Instructors': dataToExport.filter(i => i.status === 'inactive').length,
        'Total Students': dataToExport.reduce((sum, i) => sum + (i.total_students || 0), 0),
        'Average Rating': (dataToExport.reduce((sum, i) => {
          const rating = typeof i.rating === 'string' ? parseFloat(i.rating) : (i.rating || 0)
          return sum + rating
        }, 0) / (dataToExport.length || 1)).toFixed(1)
      })
    }
  }

  // Export Filtered/Current View
  const exportFilteredInstructors = () => {
    const exportData = filteredInstructors.map(i => ({
      'Name': i.name,
      'Email': i.email,
      'Phone': i.phone || 'N/A',
      'Status': i.status,
      'Specialization': i.specialization || 'N/A',
      'Qualification': i.qualification || 'N/A',
      'Experience': i.experience || 'N/A',
      'Rating': typeof i.rating === 'string' ? parseFloat(i.rating).toFixed(1) : (i.rating || 0),
      'Total Students': i.total_students || 0,
      'Assigned Course': i.course_title || 'Not assigned',
      'Joined Date': new Date(i.created_at).toLocaleDateString()
    }))

    const fileName = `instructors_filtered_${new Date().toISOString().split('T')[0]}`
    
    if (exportFormat === 'csv') {
      downloadCSV(exportData, `${fileName}.csv`)
    } else if (exportFormat === 'json') {
      downloadJSON(filteredInstructors, `${fileName}.json`)
    } else if (exportFormat === 'excel') {
      downloadExcel(exportData, fileName)
    } else if (exportFormat === 'pdf') {
      generatePDFReport(exportData, 'Filtered Instructors Report', fileName, {
        'Showing': `${filteredInstructors.length} of ${instructors.length} instructors`,
        'Active': filteredInstructors.filter(i => i.status === 'active').length,
        'Inactive': filteredInstructors.filter(i => i.status === 'inactive').length,
        'Search Filter': searchTerm || 'None',
        'Status Filter': filterStatus === 'all' ? 'All' : filterStatus
      })
    }
  }

  // Helper Functions
  const csvRowToObject = (instructor: Instructor) => ({
    'Name': instructor.name,
    'Email': instructor.email,
    'Phone': instructor.phone || 'N/A',
    'Status': instructor.status,
    'Specialization': instructor.specialization || 'N/A',
    'Qualification': instructor.qualification || 'N/A',
    'Experience': instructor.experience || 'N/A',
    'Rating': typeof instructor.rating === 'string' ? parseFloat(instructor.rating).toFixed(1) : (instructor.rating || 0),
    'Total Students': instructor.total_students || 0,
    'Assigned Course': instructor.course_title || 'Not assigned',
    'Joined Date': new Date(instructor.created_at).toLocaleDateString()
  })

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No data to export')
      return
    }
    
    const headers = Object.keys(data[0])
    const csvRows = []
    csvRows.push(headers.join(','))
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header]?.toString() || ''
        return `"${value.replace(/"/g, '""')}"`
      })
      csvRows.push(values.join(','))
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const downloadJSON = (data: any, filename: string) => {
    const jsonStr = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const downloadExcel = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No data to export')
      return
    }
    
    const headers = Object.keys(data[0])
    const csvRows = []
    csvRows.push(headers.join(','))
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header]?.toString() || ''
        return `"${value.replace(/"/g, '""')}"`
      })
      csvRows.push(values.join(','))
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.setAttribute('download', `${filename}.xls`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const generatePDFReport = (data: any[], title: string, filename: string, summary?: any) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Please allow pop-ups to generate PDF')
      return
    }

    const headers = data.length > 0 ? Object.keys(data[0]) : []
    
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
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
            border-left: 4px solid #10B981;
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
            font-size: 16px;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #D1D5DB;
            padding: 10px;
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
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #9CA3AF;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
          }
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none; }
            th { background: #1E3A8A !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .summary { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
    `

    if (summary) {
      htmlContent += `
        <div class="summary">
          <h3>📊 Summary Report</h3>
          <div class="summary-grid">
            ${Object.entries(summary).map(([key, value]) => `
              <div class="summary-item">
                <strong>${key.replace(/([A-Z])/g, ' $1').trim()}</strong>
                <span>${value}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `
    }

    if (data.length > 0) {
      htmlContent += `
        </table>
          <thead>
            <tr>
              ${headers.map(header => `<th>${header.replace(/([A-Z])/g, ' $1').trim()}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${headers.map(header => `<td>${row[header] || '-'}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
    } else {
      htmlContent += `<p style="text-align: center; padding: 40px; color: #6B7280;">No data available for export.</p>`
    }

    htmlContent += `
        <div class="footer">
          <p>© ${new Date().getFullYear()} LMS Admin - Instructors Report</p>
        </div>
        <div class="no-print" style="position: fixed; bottom: 20px; right: 20px;">
          <button onclick="window.print();" style="padding: 10px 20px; background: #1E3A8A; color: white; border: none; border-radius: 8px; cursor: pointer;">🖨️ Print / Save as PDF</button>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  const handleExport = () => {
    setIsExporting(true)
    try {
      if (exportType === 'single' && selectedInstructorForExport) {
        exportSingleInstructor(selectedInstructorForExport, exportFormat)
      } else if (exportType === 'filtered') {
        exportFilteredInstructors()
      } else {
        exportAllInstructors()
      }
      setShowExportModal(false)
      setSelectedInstructorForExport(null)
    } catch (error) {
      console.error('Export error:', error)
      alert('Error generating export. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  // Delete instructor
  const handleDeleteInstructor = async () => {
    if (!selectedInstructor) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/instructors/${selectedInstructor.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete instructor')
      }

      setInstructors(prev => prev.filter(i => i.id !== selectedInstructor.id))
      setShowDeleteModal(false)
      setSelectedInstructor(null)
      
      alert(`✅ Instructor ${selectedInstructor.name} deleted successfully!`)
      
    } catch (error: any) {
      console.error('Error deleting instructor:', error)
      alert(`❌ Error: ${error.message}`)
    } finally {
      setDeleting(false)
    }
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    return status === 'active' ? BRAND_COLORS.teal : BRAND_COLORS.brightRed
  }

  // Format rating safely
  const formatRating = (rating: number | string | undefined): string => {
    if (!rating) return '0.0'
    const numRating = typeof rating === 'string' ? parseFloat(rating) : rating
    return isNaN(numRating) ? '0.0' : numRating.toFixed(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
            <div 
              className="absolute top-0 left-0 w-16 h-16 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: BRAND_COLORS.deepRed }}
            ></div>
          </div>
          <p className="mt-4 text-darkGrey">Loading instructors...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <AlertCircle className="w-16 h-16 mb-4" style={{ color: BRAND_COLORS.brightRed }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: BRAND_COLORS.darkNavy }}>
            Error Loading Instructors
          </h3>
          <p className="text-darkGrey/70 mb-6 text-center max-w-md">{error}</p>
          <button
            onClick={fetchInstructors}
            className="px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue, color: BRAND_COLORS.white }}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl border border-softGrey p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                Instructors
              </h1>
              <p className="text-darkGrey mt-1">
                Manage instructors and their course assignments
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Export Button */}
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors"
                style={{ backgroundColor: BRAND_COLORS.emerald }}
              >
                <Download className="w-4 h-4" />
                Export
              </button>

              <button
                onClick={fetchInstructors}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 border border-softGrey rounded-lg hover:bg-lightGrey transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <Link
                href="/lms/Admin_Portal/instructors/add"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors"
                style={{ backgroundColor: BRAND_COLORS.deepRed }}
              >
                <Plus className="w-4 h-4" />
                Add Instructor
              </Link>
            </div>
          </div>

          <div className="h-1 w-20 rounded-full" style={{ backgroundColor: BRAND_COLORS.deepRed }}></div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}10` }}>
              <Users className="w-5 h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
            </div>
            <div>
              <p className="text-sm text-darkGrey/70">Total Instructors</p>
              <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                {instructors.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.teal}10` }}>
              <CheckCircle className="w-5 h-5" style={{ color: BRAND_COLORS.teal }} />
            </div>
            <div>
              <p className="text-sm text-darkGrey/70">Active</p>
              <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                {activeInstructors}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.brightRed}10` }}>
              <XCircle className="w-5 h-5" style={{ color: BRAND_COLORS.brightRed }} />
            </div>
            <div>
              <p className="text-sm text-darkGrey/70">Inactive</p>
              <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                {inactiveInstructors}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.purple}10` }}>
              <BookOpen className="w-5 h-5" style={{ color: BRAND_COLORS.purple }} />
            </div>
            <div>
              <p className="text-sm text-darkGrey/70">Total Students</p>
              <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                {totalStudents}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-darkGrey/40" />
          <input
            type="text"
            placeholder="Search by name, email, course, or qualification..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-softGrey rounded-lg focus:outline-none focus:ring-2 focus:ring-darkRoyalBlue/20"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-softGrey rounded-lg focus:outline-none focus:ring-2 focus:ring-darkRoyalBlue/20"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Instructors Table */}
      {filteredInstructors.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-softGrey">
          <table className="min-w-full divide-y divide-softGrey">
            <thead className="bg-darkRoyalBlue">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Instructor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Qualification</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Course</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-softGrey">
              {filteredInstructors.map((instructor) => (
                <tr key={instructor.id} className="hover:bg-lightGrey">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                        style={{ backgroundColor: `${BRAND_COLORS.deepRed}10` }}>
                        <User className="w-4 h-4" style={{ color: BRAND_COLORS.deepRed }} />
                      </div>
                      <span className="font-medium">{instructor.name}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-sm">{instructor.email}</div>
                    {instructor.phone && (
                      <div className="text-xs text-darkGrey/70">{instructor.phone}</div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                      <span>{instructor.qualification || '—'}</span>
                    </div>
                    <div className="text-xs text-darkGrey/70 mt-1">
                      {instructor.experience || '—'}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${getStatusColor(instructor.status)}20`,
                        color: getStatusColor(instructor.status)
                      }}
                    >
                      {instructor.status === 'active' ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {instructor.course_title ? (
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                        <span className="text-sm">{instructor.course_title}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-darkGrey/50">Not assigned</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedInstructorForExport(instructor)
                          setExportType('single')
                          setShowExportModal(true)
                        }}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        title="Export"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/lms/Admin_Portal/instructors/edit/${instructor.id}`}
                        className="p-1 text-darkGrey hover:text-darkRoyalBlue hover:bg-lightGrey rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedInstructor(instructor)
                          setShowDeleteModal(true)
                        }}
                        className="p-1 text-brightRed hover:bg-brightRed/5 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-softGrey">
          <User className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.softGrey }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
            {searchTerm || filterStatus !== 'all' ? 'No instructors found' : 'No instructors yet'}
          </h3>
          <p className="text-darkGrey/70 mb-6">
            {searchTerm || filterStatus !== 'all' ? 'Try a different search or clear filters' : 'Add your first instructor to get started'}
          </p>
          {(searchTerm || filterStatus !== 'all') ? (
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterStatus('all')
              }}
              className="px-4 py-2 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5"
            >
              Clear Filters
            </button>
          ) : (
            <Link
              href="/lms/Admin_Portal/instructors/add"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white"
              style={{ backgroundColor: BRAND_COLORS.deepRed }}
            >
              <Plus className="w-4 h-4" />
              Add Instructor
            </Link>
          )}
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-softGrey flex justify-between items-center bg-gradient-to-r from-emerald-600 to-teal-600">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export Instructors Data
                </h3>
              </div>
              <button 
                onClick={() => setShowExportModal(false)} 
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 overflow-auto max-h-[calc(85vh-100px)] bg-gray-50">
              {/* Export Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">What do you want to export?</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      setExportType('all')
                      setSelectedInstructorForExport(null)
                    }}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      exportType === 'all' 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                        : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300'
                    }`}
                  >
                    <Users className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">All Instructors</span>
                  </button>
                  <button
                    onClick={() => {
                      setExportType('filtered')
                      setSelectedInstructorForExport(null)
                    }}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      exportType === 'filtered' 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                        : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300'
                    }`}
                  >
                    <Filter className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">Current View ({filteredInstructors.length})</span>
                  </button>
                  <button
                    onClick={() => {
                      setExportType('single')
                    }}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      exportType === 'single' 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                        : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300'
                    }`}
                  >
                    <User className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">Single Instructor</span>
                  </button>
                </div>
              </div>

              {/* Single Instructor Selection */}
              {exportType === 'single' && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Instructor</label>
                  <select
                    value={selectedInstructorForExport?.id || ''}
                    onChange={(e) => {
                      const instructor = instructors.find(i => i.id === e.target.value)
                      setSelectedInstructorForExport(instructor || null)
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="">Choose an instructor...</option>
                    {instructors.map(instructor => (
                      <option key={instructor.id} value={instructor.id}>
                        {instructor.name} - {instructor.course_title || 'No Course'} ({instructor.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Current Filters Info */}
              {(exportType === 'filtered') && (
                <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Current Filters:</strong><br />
                    {searchTerm && `Search: "${searchTerm}" `}
                    {filterStatus !== 'all' && `Status: ${filterStatus} `}
                    {!searchTerm && filterStatus === 'all' && 'No filters applied'}
                  </p>
                </div>
              )}

              {/* Export Format Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Export Format</label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setExportFormat('csv')}
                    className={`p-2 rounded-lg text-sm font-medium transition-all ${
                      exportFormat === 'csv' 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => setExportFormat('excel')}
                    className={`p-2 rounded-lg text-sm font-medium transition-all ${
                      exportFormat === 'excel' 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Excel
                  </button>
                  <button
                    onClick={() => setExportFormat('json')}
                    className={`p-2 rounded-lg text-sm font-medium transition-all ${
                      exportFormat === 'json' 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    JSON
                  </button>
                  <button
                    onClick={() => setExportFormat('pdf')}
                    className={`p-2 rounded-lg text-sm font-medium transition-all ${
                      exportFormat === 'pdf' 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    PDF
                  </button>
                </div>
              </div>

              {/* Export Button */}
              <div className="flex gap-3">
                <button
                  onClick={handleExport}
                  disabled={isExporting || (exportType === 'single' && !selectedInstructorForExport)}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Export Data
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

      {/* Delete Modal */}
      {showDeleteModal && selectedInstructor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                Delete Instructor
              </h3>
              
              <p className="text-darkGrey mb-4">
                Are you sure you want to delete <strong>{selectedInstructor.name}</strong>?
              </p>
              
              <p className="text-sm text-darkGrey/70 mb-6">
                This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteInstructor}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg text-white flex items-center gap-2"
                  style={{ backgroundColor: BRAND_COLORS.brightRed }}
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}