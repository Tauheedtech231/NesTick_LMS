'use client'
/* eslint-disable */

import { useState, useEffect } from 'react'
import { 
  CheckCircle,
  AlertCircle,
  DollarSign,
  Users,
  Eye,
  Search,
  RefreshCw,
  X,
  FileText,
  Send,
  Key,
  Mail,
  CreditCard,
  User,
  Loader2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  GraduationCap,
  TrendingUp,
  Download,
  FileJson,
  Printer,
  Calendar,
  Filter,
  ChevronDown,
  PieChart,
  BarChart3,
  Smartphone,
  Laptop,
  Tablet,
  Clock
} from 'lucide-react'

// Types
type PaymentStudent = {
  isBundleItem: boolean;
  id: string;
  enrollmentId: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  cnic: string;
  address: string;
  education: string;
  experience: string;
  course: string;
  courseId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  transactionId: string;
  status: 'pending' | 'verified' | 'rejected';
  screenshotUrl: string;
  uploadedAt: string;
  cnicFrontUrl: string;
  cnicBackUrl: string;
  educationalDocUrl: string;
  credentialsSent?: boolean;
  paymentId?: string;
  username?: string;
}

type StudentCredentials = {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  course: string;
  courseId: string;
  username: string;
  password: string;
  sentDate: string;
  amount: number;
  verifiedDate: string;
  credentialsSent: boolean;
}

type RevenueStats = {
  totalRevenue: number;
  averagePrice: number;
  payingStudents: number;
  verifiedEnrollments: number;
}

type Stats = {
  totalEnrollments: number;
  pendingPayments: number;
  verifiedPayments: number;
  rejectedPayments: number;
  totalRevenue: number;
  sentCredentials: number;
  failedCredentials: number;
  monthlyRevenue: {
    month: string;
    amount: number;
    count: number;
  }[];
  topCourses: {
    course: string;
    revenue: number;
    count: number;
  }[];
}

type ExportFormat = 'csv' | 'json' | 'pdf'

export default function AdminDashboard() {
  const [paymentStudents, setPaymentStudents] = useState<PaymentStudent[]>([])
  const [studentCredentials, setStudentCredentials] = useState<StudentCredentials[]>([])
  const [revenueStats, setRevenueStats] = useState<RevenueStats>({
    totalRevenue: 0,
    averagePrice: 0,
    payingStudents: 0,
    verifiedEnrollments: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSendingCredentials, setIsSendingCredentials] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState<string | null>(null)
  const [isResendingEmail, setIsResendingEmail] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'payments' | 'credentials' | 'revenue'>('payments')
  const [showScreenshotModal, setShowScreenshotModal] = useState(false)
  const [selectedStudentDetails, setSelectedStudentDetails] = useState<PaymentStudent | null>(null)
  const [stats, setStats] = useState<Stats>({
    totalEnrollments: 0,
    pendingPayments: 0,
    verifiedPayments: 0,
    rejectedPayments: 0,
    totalRevenue: 0,
    sentCredentials: 0,
    failedCredentials: 0,
    monthlyRevenue: [],
    topCourses: []
  })

  // Export related states
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv')
  const [exportType, setExportType] = useState<'students' | 'payments' | 'revenue' | 'single-student'>('students')
  const [selectedStudentForExport, setSelectedStudentForExport] = useState<PaymentStudent | null>(null)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [exportFilterStatus, setExportFilterStatus] = useState<string>('all')
  const [isExporting, setIsExporting] = useState(false)

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
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    indigo: '#6366F1'
  }

  // Load data from API
  const loadData = async () => {
    setIsLoading(true)
    try {
      const enrollmentsRes = await fetch('/api/admin/enrollments')
      const enrollmentsData = await enrollmentsRes.json()
      
      if (enrollmentsData.success) {
        const students = enrollmentsData.data.map((item: any) => ({
          id: item.student_id,
          enrollmentId: item.id,
          studentId: item.student_id,
          name: item.student_name,
          email: item.student_email,
          phone: item.student_phone || '',
          cnic: item.student_cnic || '',
          address: item.student_address || '',
          education: item.student_education || '',
          experience: item.student_experience || '',
          course: item.course_title,
          courseId: item.course_id,
          amount: Number(item.course_price) || 0,
          paymentDate: item.payment_date || item.enrollment_date,
          paymentMethod: item.payment_method || 'Bank Transfer',
          transactionId: item.transaction_id || `TXN-${Math.random().toString(36).substr(2, 8)}`,
          status: item.payment_status,
          screenshotUrl: item.slip_url || '',
          uploadedAt: item.enrollment_date,
          cnicFrontUrl: item.cnic_front_url || '',
          cnicBackUrl: item.cnic_back_url || '',
          educationalDocUrl: item.educational_doc_url || '',
          credentialsSent: item.credentials_sent || false,
          paymentId: item.payment_id || '',
          username: item.username || '',
          isBundleItem: item.is_bundle_item || false
        }))
        setPaymentStudents(students)
      }

      const credentialsRes = await fetch('/api/admin/credentials')
      const credentialsData = await credentialsRes.json()
      
      if (credentialsData.success) {
        setStudentCredentials(credentialsData.data)
      }

      const revenueRes = await fetch('/api/admin/revenue')
      const revenueData = await revenueRes.json()
      
      if (revenueData.success) {
        setRevenueStats(revenueData.data)
      }

      const statsRes = await fetch('/api/admin/stats')
      const statsData = await statsRes.json()
      
      if (statsData.success) {
        setStats(statsData.data)
      }

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // ==================== EXPORT FUNCTIONALITY ====================

  // Filter data by date range and status
  const filterDataByCriteria = (data: PaymentStudent[]) => {
    let filtered = [...data]

    if (exportFilterStatus !== 'all') {
      filtered = filtered.filter(s => s.status === exportFilterStatus)
    }

    if (dateRange.start) {
      filtered = filtered.filter(s => new Date(s.paymentDate) >= new Date(dateRange.start))
    }
    if (dateRange.end) {
      filtered = filtered.filter(s => new Date(s.paymentDate) <= new Date(dateRange.end))
    }

    return filtered
  }

  // Format date for CSV (clean format)
  const formatDateForCSV = (dateString: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'Invalid Date'
    }
  }

  // Escape CSV field (handle commas, quotes, newlines)
  const escapeCSVField = (field: any): string => {
    if (field === null || field === undefined) return '""'
    let stringField = String(field)
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n') || stringField.includes('\r')) {
      stringField = stringField.replace(/"/g, '""')
      return `"${stringField}"`
    }
    return stringField
  }

  // Export Single Student Data
  const exportSingleStudent = (student: PaymentStudent, format: ExportFormat) => {
    const studentData = {
      personalInfo: {
        name: student.name,
        email: student.email,
        phone: student.phone,
        cnic: student.cnic,
        address: student.address,
        education: student.education,
        experience: student.experience
      },
      courseInfo: {
        course: student.course,
        courseId: student.courseId,
        amount: student.isBundleItem ? 'Part of Bundle' : `PKR ${student.amount.toLocaleString()}`,
        paymentDate: formatDateForCSV(student.paymentDate),
        paymentMethod: student.paymentMethod,
        transactionId: student.transactionId,
        status: student.status,
        credentialsSent: student.credentialsSent ? 'Yes' : 'No',
        username: student.username || 'Not generated yet'
      },
      documents: {
        screenshotUrl: student.screenshotUrl,
        cnicFrontUrl: student.cnicFrontUrl,
        cnicBackUrl: student.cnicBackUrl,
        educationalDocUrl: student.educationalDocUrl
      },
      exportDate: new Date().toISOString()
    }

    if (format === 'json') {
      downloadJSON(studentData, `${student.name.replace(/\s/g, '_')}_details.json`)
    } else if (format === 'csv') {
      // Create clean CSV headers and data
      const csvRows = []
      // Personal Info Section
      csvRows.push('"Personal Information"')
      csvRows.push(`"Name","${escapeCSVField(student.name)}"`)
      csvRows.push(`"Email","${escapeCSVField(student.email)}"`)
      csvRows.push(`"Phone","${escapeCSVField(student.phone)}"`)
      csvRows.push(`"CNIC","${escapeCSVField(student.cnic)}"`)
      csvRows.push(`"Address","${escapeCSVField(student.address)}"`)
      csvRows.push(`"Education","${escapeCSVField(student.education)}"`)
      csvRows.push(`"Experience","${escapeCSVField(student.experience)}"`)
      csvRows.push('')
      // Course Info Section
      csvRows.push('"Course Information"')
      csvRows.push(`"Course","${escapeCSVField(student.course)}"`)
      csvRows.push(`"Course ID","${escapeCSVField(student.courseId)}"`)
      csvRows.push(`"Amount","${escapeCSVField(student.isBundleItem ? 'Part of Bundle' : `PKR ${student.amount}`)}"`)
      csvRows.push(`"Payment Date","${escapeCSVField(formatDateForCSV(student.paymentDate))}"`)
      csvRows.push(`"Payment Method","${escapeCSVField(student.paymentMethod)}"`)
      csvRows.push(`"Transaction ID","${escapeCSVField(student.transactionId)}"`)
      csvRows.push(`"Status","${escapeCSVField(student.status)}"`)
      csvRows.push(`"Credentials Sent","${escapeCSVField(student.credentialsSent ? 'Yes' : 'No')}"`)
      csvRows.push(`"Username","${escapeCSVField(student.username || 'N/A')}"`)
      
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.href = url
      link.setAttribute('download', `${student.name.replace(/\s/g, '_')}_details.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } else if (format === 'pdf') {
      generatePDFReport([{
        'Name': student.name,
        'Email': student.email,
        'Phone': student.phone,
        'Course': student.course,
        'Amount': student.isBundleItem ? 'Part of Bundle' : `PKR ${student.amount}`,
        'Status': student.status,
        'Payment Date': formatDateForCSV(student.paymentDate)
      }], `Student Details - ${student.name}`, `${student.name}_details`)
    }
  }

  // Export All Students Data
  const exportStudentsData = () => {
    let dataToExport = [...paymentStudents]
    
    if (exportFilterStatus !== 'all') {
      dataToExport = dataToExport.filter(s => s.status === exportFilterStatus)
    }
    if (dateRange.start) {
      dataToExport = dataToExport.filter(s => new Date(s.paymentDate) >= new Date(dateRange.start))
    }
    if (dateRange.end) {
      dataToExport = dataToExport.filter(s => new Date(s.paymentDate) <= new Date(dateRange.end))
    }

    const fileName = `students_export_${new Date().toISOString().split('T')[0]}`
    
    if (exportFormat === 'csv') {
      // Create clean CSV data with proper headers
      const headers = [
        'Student Name',
        'Email',
        'Phone',
        'CNIC',
        'Course',
        'Amount',
        'Payment Date',
        'Payment Method',
        'Transaction ID',
        'Status',
        'Credentials Sent',
        'Username',
        'Enrollment ID'
      ]
      
      const csvRows = [headers.map(h => escapeCSVField(h)).join(',')]
      
      for (const s of dataToExport) {
        const row = [
          s.name,
          s.email,
          s.phone,
          s.cnic,
          s.course,
          s.isBundleItem ? 'Part of Bundle' : `PKR ${s.amount}`,
          formatDateForCSV(s.paymentDate),
          s.paymentMethod,
          s.transactionId,
          s.status,
          s.credentialsSent ? 'Yes' : 'No',
          s.username || 'N/A',
          s.enrollmentId
        ]
        csvRows.push(row.map(field => escapeCSVField(field)).join(','))
      }
      
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.href = url
      link.setAttribute('download', `${fileName}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } else if (exportFormat === 'json') {
      downloadJSON(dataToExport, `${fileName}.json`)
    } else if (exportFormat === 'pdf') {
      const pdfData = dataToExport.map(s => ({
        'Student Name': s.name,
        'Email': s.email,
        'Course': s.course,
        'Amount': s.isBundleItem ? 'Part of Bundle' : `PKR ${s.amount}`,
        'Status': s.status,
        'Payment Date': formatDateForCSV(s.paymentDate)
      }))
      generatePDFReport(pdfData, 'Students Report', fileName)
    }
  }

  // Export Payments Data
  const exportPaymentsData = () => {
    let dataToExport = filterDataByCriteria(paymentStudents)
    
    const fileName = `payments_export_${new Date().toISOString().split('T')[0]}`
    
    if (exportFormat === 'csv') {
      const headers = [
        'Transaction ID',
        'Student Name',
        'Student Email',
        'Course',
        'Amount',
        'Payment Date',
        'Payment Method',
        'Status',
        'Verified Date',
        'Credentials Sent'
      ]
      
      const csvRows = [headers.map(h => escapeCSVField(h)).join(',')]
      
      for (const s of dataToExport) {
        const row = [
          s.transactionId,
          s.name,
          s.email,
          s.course,
          s.isBundleItem ? 'Part of Bundle' : `PKR ${s.amount}`,
          formatDateForCSV(s.paymentDate),
          s.paymentMethod,
          s.status,
          s.status === 'verified' ? formatDateForCSV(s.uploadedAt) : 'N/A',
          s.credentialsSent ? 'Yes' : 'No'
        ]
        csvRows.push(row.map(field => escapeCSVField(field)).join(','))
      }
      
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.href = url
      link.setAttribute('download', `${fileName}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } else if (exportFormat === 'json') {
      downloadJSON(dataToExport, `${fileName}.json`)
    } else if (exportFormat === 'pdf') {
      const pdfData = dataToExport.map(s => ({
        'Transaction ID': s.transactionId,
        'Student Name': s.name,
        'Course': s.course,
        'Amount': s.isBundleItem ? 'Part of Bundle' : `PKR ${s.amount}`,
        'Status': s.status,
        'Payment Date': formatDateForCSV(s.paymentDate)
      }))
      generatePDFReport(pdfData, 'Payments Report', fileName)
    }
  }

  // Export Revenue Data
  const exportRevenueData = () => {
    const verifiedPayments = paymentStudents.filter(s => s.status === 'verified')
    const pendingPayments = paymentStudents.filter(s => s.status === 'pending')
    
    const totalVerifiedRevenue = verifiedPayments.reduce((sum, s) => sum + (s.isBundleItem ? 0 : s.amount), 0)
    const totalPendingRevenue = pendingPayments.reduce((sum, s) => sum + (s.isBundleItem ? 0 : s.amount), 0)
    
    const courseRevenue = paymentStudents
      .filter(s => s.status === 'verified')
      .reduce((acc: any[], student) => {
        const existing = acc.find(c => c.course === student.course)
        const amount = student.isBundleItem ? 0 : (student.amount || 0)
        if (existing) {
          existing.revenue += amount
          existing.count++
        } else {
          acc.push({ course: student.course, revenue: amount, count: 1 })
        }
        return acc
      }, [])
      .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))

    const revenueReport = {
      summary: {
        totalRevenue: `PKR ${totalVerifiedRevenue.toLocaleString()}`,
        pendingRevenue: `PKR ${totalPendingRevenue.toLocaleString()}`,
        totalStudents: paymentStudents.length,
        verifiedStudents: verifiedPayments.length,
        pendingStudents: pendingPayments.length,
        rejectedStudents: paymentStudents.filter(s => s.status === 'rejected').length,
        averageRevenuePerStudent: verifiedPayments.length > 0 
          ? `PKR ${Math.round(totalVerifiedRevenue / verifiedPayments.length).toLocaleString()}`
          : 'PKR 0',
        exportDate: new Date().toLocaleString()
      },
      courseBreakdown: courseRevenue,
      monthlyBreakdown: stats.monthlyRevenue || []
    }

    const fileName = `revenue_report_${new Date().toISOString().split('T')[0]}`
    
    if (exportFormat === 'json') {
      downloadJSON(revenueReport, `${fileName}.json`)
    } else if (exportFormat === 'csv') {
      // Course breakdown CSV
      const headers = ['Course', 'Revenue', 'Students Enrolled']
      const csvRows = [headers.map(h => escapeCSVField(h)).join(',')]
      
      for (const c of courseRevenue) {
        const row = [c.course, `PKR ${c.revenue.toLocaleString()}`, c.count]
        csvRows.push(row.map(field => escapeCSVField(field)).join(','))
      }
      
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.href = url
      link.setAttribute('download', `${fileName}_course_breakdown.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } else if (exportFormat === 'pdf') {
      generatePDFReport(courseRevenue, 'Revenue Report', fileName, revenueReport.summary)
    }
  }

  // Helper: Download JSON
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

  // Helper: Generate PDF Report (using browser print)
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
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 13px;
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
        <table>
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
        <table>
      `
    } else {
      htmlContent += `<p style="text-align: center; padding: 40px; color: #6B7280;">No data available for export.</p>`
    }

    htmlContent += `
        <div class="footer">
          <p>© ${new Date().getFullYear()} Admin Dashboard - Confidential Report</p>
          <p>This report is system generated and does not require signature</p>
        </div>
        <div class="no-print" style="position: fixed; bottom: 20px; right: 20px;">
          <button onclick="window.print();" style="padding: 10px 20px; background: #1E3A8A; color: white; border: none; border-radius: 8px; cursor: pointer;">🖨️ Print / Save as PDF</button>
        </div>
        <script>
          setTimeout(() => {
            const btn = document.querySelector('.no-print button');
            if(btn) btn.style.display = 'block';
          }, 100);
        <\/script>
      </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  // Main export handler
  const handleExport = async () => {
    setIsExporting(true)
    try {
      if (exportType === 'single-student' && selectedStudentForExport) {
        exportSingleStudent(selectedStudentForExport, exportFormat)
      } else if (exportType === 'students') {
        exportStudentsData()
      } else if (exportType === 'payments') {
        exportPaymentsData()
      } else if (exportType === 'revenue') {
        exportRevenueData()
      }
      setShowExportModal(false)
      setDateRange({ start: '', end: '' })
      setExportFilterStatus('all')
    } catch (error) {
      console.error('Export error:', error)
      alert('Error generating export. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  // Verify payment only
  const handleVerifyPayment = async (enrollmentId: string, studentId: string) => {
    setIsVerifying(enrollmentId)
    try {
      const response = await fetch('/api/admin/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId, studentId, status: 'verified' })
      })

      const data = await response.json()
      
      if (data.success) {
        setPaymentStudents(prev => prev.map(s => 
          s.enrollmentId === enrollmentId ? { ...s, status: 'verified' } : s
        ))
        await loadData()
        return true
      } else {
        throw new Error(data.error || 'Verification failed')
      }
    } catch (error: any) {
      console.error('Error verifying payment:', error)
      alert(`❌ Failed to verify payment: ${error.message}`)
      return false
    } finally {
      setIsVerifying(null)
    }
  }

  // Send credentials (first time)
  const sendCredentialsToStudent = async (student: PaymentStudent) => {
    if (!student.email) {
      alert('Student email is required')
      return
    }

    setIsSendingCredentials(student.enrollmentId)

    try {
      const verified = await handleVerifyPayment(student.enrollmentId, student.studentId)
      if (!verified) return

      const response = await fetch('/api/admin/generate-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.studentId,
          enrollmentId: student.enrollmentId,
          studentName: student.name,
          studentEmail: student.email,
          course: student.course,
          courseId: student.courseId,
          amount: student.amount,
          paymentId: student.paymentId
        })
      })

      const data = await response.json()

      if (data.success) {
        if (data.data?.isExistingUser) {
          alert(`✅ Course "${student.course}" added to existing account!\n\nEmail sent to ${student.email}`)
        } else {
          alert(`✅ Credentials sent successfully to ${student.email}!\n\nUsername: ${data.data?.username}\nPassword: ${data.data?.password}`)
        }
        setShowScreenshotModal(false)
        await loadData()
      } else {
        throw new Error(data.error || 'Failed to send credentials')
      }
    } catch (error: any) {
      console.error('Error sending credentials:', error)
      alert(`❌ Failed: ${error.message}`)
    } finally {
      setIsSendingCredentials(null)
    }
  }

  // Resend credentials with loading state
  const resendCredentialsEmail = async (student: PaymentStudent) => {
    if (!student.email) {
      alert('Student email is required')
      return
    }

    setIsResendingEmail(student.email)

    try {
      const response = await fetch('/api/admin/generate-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.studentId,
          enrollmentId: student.enrollmentId,
          studentName: student.name,
          studentEmail: student.email,
          course: student.course,
          courseId: student.courseId,
          amount: student.amount,
          paymentId: student.paymentId,
          isResend: true
        })
      })

      const data = await response.json()

      if (data.success) {
        alert(`✅ New credentials sent to ${student.email}!\n\nNew Password: ${data.data?.password}`)
        await loadData()
      } else {
        throw new Error(data.error || 'Failed to resend credentials')
      }
    } catch (error: any) {
      console.error('Error resending credentials:', error)
      alert(`❌ Failed: ${error.message}`)
    } finally {
      setIsResendingEmail(null)
    }
  }

  // Handle reject payment
  const handleRejectPayment = async (enrollmentId: string, studentId: string) => {
    if (!confirm('Are you sure you want to reject this payment?')) return

    try {
      const response = await fetch('/api/admin/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId, studentId, status: 'rejected' })
      })

      const data = await response.json()
      
      if (data.success) {
        setPaymentStudents(prev => prev.map(s => 
          s.enrollmentId === enrollmentId ? { ...s, status: 'rejected' } : s
        ))
        alert('Payment rejected!')
        await loadData()
      }
    } catch (error: any) {
      console.error('Error rejecting payment:', error)
      alert(`❌ Failed to reject payment: ${error.message}`)
    }
  }

  // Filter students
  const filteredStudents = paymentStudents.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  const filteredCredentials = studentCredentials.filter(cred => 
    cred.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cred.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cred.studentEmail.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate revenue statistics
  const totalVerifiedRevenue = revenueStats?.totalRevenue || 0
  
  const pendingRevenue = paymentStudents
    .filter(s => s.status === 'pending')
    .reduce((sum, s) => {
      const amount = Number(s.amount) || 0
      return sum + amount
    }, 0)
  
  const averageRevenuePerStudent = (revenueStats?.payingStudents || 0) > 0 
    ? Math.round((revenueStats?.totalRevenue || 0) / (revenueStats?.payingStudents || 1)) 
    : 0

  const projectedTotal = (Number(totalVerifiedRevenue) || 0) + (Number(pendingRevenue) || 0)

  const calculatedStats = {
    totalEnrollments: paymentStudents?.length || 0,
    pendingPayments: paymentStudents?.filter(s => s.status === 'pending')?.length || 0,
    verifiedPayments: paymentStudents?.filter(s => s.status === 'verified')?.length || 0,
    rejectedPayments: paymentStudents?.filter(s => s.status === 'rejected')?.length || 0,
    totalRevenue: totalVerifiedRevenue,
    sentCredentials: studentCredentials?.filter(c => c.credentialsSent)?.length || 0,
    failedCredentials: 0,
    monthlyRevenue: stats?.monthlyRevenue || [],
    topCourses: stats?.topCourses || []
  }

  const displayStats = stats?.totalEnrollments ? stats : calculatedStats

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-white p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 mt-4 font-medium">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-indigo-100 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shadow-sm">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-400" />
          <input
            type="text"
            placeholder="Search payments, students, courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white/50 backdrop-blur-sm text-sm"
          />
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowExportModal(true)}
            className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition-all shadow-sm text-white"
            title="Export Data"
          >
            <Download className="w-5 h-5" />
          </button>
          <button 
            onClick={loadData}
            className="p-2.5 rounded-xl bg-white hover:bg-indigo-50 transition-colors shadow-sm border border-indigo-100"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-indigo-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
              A
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">Admin</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">Welcome back, Admin! 👋</h1>
              <p className="text-indigo-100 text-lg max-w-2xl">
                Manage student payments, track revenue, and send credentials from one dashboard.
              </p>
            </div>
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute right-20 bottom-0 w-32 h-32 bg-white/10 rounded-full"></div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 border border-indigo-100 hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Students Enrolled</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{displayStats.totalEnrollments || 0}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">Total number of enrollments so far</div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border border-amber-100 hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{displayStats.pendingPayments || 0}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-3 text-xs text-amber-600">Payments waiting for confirmation</div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border border-emerald-100 hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed Payments</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{displayStats.verifiedPayments || 0}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-3 text-xs text-emerald-600">Payments successfully verified</div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border border-purple-100 hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  PKR {(totalVerifiedRevenue || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Avg: PKR {(averageRevenuePerStudent || 0).toLocaleString()}/student
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl shadow-lg p-6 border border-emerald-100 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-700">Verified Revenue</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">PKR {(totalVerifiedRevenue || 0).toLocaleString()}</p>
                <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> From {(revenueStats?.payingStudents || 0)} students
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg shadow">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl shadow-lg p-6 border border-amber-100 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-700">Pending Revenue</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">PKR {(pendingRevenue || 0).toLocaleString()}</p>
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Awaiting verification
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg shadow">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-700">Projected Total</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  PKR {(projectedTotal || 0).toLocaleString()}
                </p>
                <p className="text-xs text-purple-600 mt-2">
                  If all pending are verified
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg shadow">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Credentials Status */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Sent Credentials</p>
                  <p className="text-xl font-bold text-gray-900">{displayStats.sentCredentials || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected Payments</p>
                  <p className="text-xl font-bold text-gray-900">{displayStats.rejectedPayments || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Revenue/Student</p>
                  <p className="text-xl font-bold text-indigo-600">PKR {(averageRevenuePerStudent || 0).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Paying Students</p>
                  <p className="text-xl font-bold text-gray-900">{revenueStats?.payingStudents || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4 border border-indigo-100">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-64">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-indigo-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="text-sm text-gray-500 self-center">
                Showing {filteredStudents.length} of {paymentStudents.length} submissions
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-indigo-100">
          <div className="flex border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-1">
            <button
              onClick={() => setActiveTab('payments')}
              className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'payments'
                  ? 'bg-white text-indigo-700 shadow-md'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
              }`}
            >
              Payment Submissions ({filteredStudents.length})
            </button>
            <button
              onClick={() => setActiveTab('credentials')}
              className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'credentials'
                  ? 'bg-white text-indigo-700 shadow-md'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
              }`}
            >
              Verified Students ({filteredCredentials.length})
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'revenue'
                  ? 'bg-white text-indigo-700 shadow-md'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
              }`}
            >
              Revenue Details
            </button>
          </div>

          {/* Payments Table - Same as before, keeping functionality intact */}
          {activeTab === 'payments' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-indigo-100">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Student</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Course</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-100 bg-white">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student.enrollmentId} className="hover:bg-indigo-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{student.course}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-indigo-600">
                          {student.isBundleItem ? 'Bundle Item' : `PKR ${(student.amount || 0).toLocaleString()}`}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm`}
                            style={{ 
                              backgroundColor: student.status === 'verified' 
                                ? BRAND_COLORS.teal 
                                : student.status === 'rejected' 
                                  ? BRAND_COLORS.brightRed 
                                  : BRAND_COLORS.darkRoyalBlue 
                            }}>
                            {student.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => {
                                setSelectedStudentDetails(student)
                                setShowScreenshotModal(true)
                              }} 
                              className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedStudentForExport(student)
                                setExportType('single-student')
                                setShowExportModal(true)
                              }}
                              className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                              title="Export Student Data"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {student.status === 'verified' && (
                              <button 
                                onClick={() => resendCredentialsEmail(student)}
                                disabled={isResendingEmail === student.email}
                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 transition-all"
                              >
                                {isResendingEmail === student.email ? (
                                  <span className="flex items-center gap-1">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Sending...
                                  </span>
                                ) : (
                                  'Resend'
                                )}
                              </button>
                            )}
                            {student.status === 'pending' && (
                              <button 
                                onClick={() => sendCredentialsToStudent(student)}
                                disabled={isSendingCredentials === student.enrollmentId}
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all"
                              >
                                {isSendingCredentials === student.enrollmentId ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  'Verify & Send'
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-indigo-300" />
                        <p>No payment submissions found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Credentials Table */}
          {activeTab === 'credentials' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-indigo-100">
                <thead className="bg-gradient-to-r from-emerald-600 to-teal-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Student</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Course</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Username</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Verified Date</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-100 bg-white">
                  {filteredCredentials.length > 0 ? (
                    filteredCredentials.map((cred) => (
                      <tr key={cred.enrollmentId} className="hover:bg-emerald-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{cred.studentName}</p>
                            <p className="text-xs text-gray-500">{cred.studentEmail}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{cred.course}</td>
                        <td className="px-6 py-4 text-sm font-mono text-gray-600">{cred.username || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {cred.verifiedDate ? new Date(cred.verifiedDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => {
                                const student = paymentStudents.find(s => s.enrollmentId === cred.enrollmentId)
                                if (student) {
                                  setSelectedStudentForExport(student)
                                  setExportType('single-student')
                                  setShowExportModal(true)
                                }
                              }}
                              className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                              title="Export Student Data"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                const student = paymentStudents.find(s => s.enrollmentId === cred.enrollmentId)
                                if (student) {
                                  resendCredentialsEmail(student)
                                }
                              }}
                              disabled={isResendingEmail === cred.studentEmail}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 transition-all"
                            >
                              {isResendingEmail === cred.studentEmail ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                'Resend Credentials'
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-500">
                        <Key className="w-12 h-12 mx-auto mb-4 text-emerald-300" />
                        <p>No verified students yet</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Revenue Details Tab */}
          {activeTab === 'revenue' && (
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-indigo-100 shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-indigo-600" />
                    Revenue Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-indigo-100 pb-3">
                      <span className="text-gray-600">Verified Revenue</span>
                      <span className="font-bold text-xl text-emerald-600">PKR {(totalVerifiedRevenue || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-indigo-100 pb-3">
                      <span className="text-gray-600">Pending Revenue</span>
                      <span className="font-bold text-xl text-amber-600">PKR {(pendingRevenue || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-indigo-100 pb-3">
                      <span className="text-gray-600">Total Students</span>
                      <span className="font-bold text-xl text-indigo-600">{paymentStudents.length}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-indigo-100 pb-3">
                      <span className="text-gray-600">Paying Students</span>
                      <span className="font-bold text-xl text-purple-600">{revenueStats?.payingStudents || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average per Student</span>
                      <span className="font-bold text-xl text-indigo-600">PKR {(averageRevenuePerStudent || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-purple-100 shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    Top Courses by Revenue
                  </h3>
                  <div className="space-y-3">
                    {paymentStudents
                      .filter(s => s.status === 'verified')
                      .reduce((acc: any[], student) => {
                        const existing = acc.find(c => c.course === student.course)
                        const amount = student.isBundleItem ? 0 : (student.amount || 0)
                        if (existing) {
                          existing.revenue += amount
                          existing.count++
                        } else {
                          acc.push({ course: student.course, revenue: amount, count: 1 })
                        }
                        return acc
                      }, [])
                      .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
                      .slice(0, 5)
                      .map((course, idx) => {
                        const maxRevenue = Math.max(...paymentStudents.filter(s => s.status === 'verified').map(s => s.amount), 0)
                        const percentage = maxRevenue > 0 ? (course.revenue / maxRevenue) * 100 : 0
                        return (
                          <div key={idx}>
                            <div className="flex justify-between items-center mb-1">
                              <p className="font-medium text-gray-900 text-sm">{course.course}</p>
                              <span className="font-bold text-purple-600 text-sm">PKR {(course.revenue || 0).toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{course.count} student{course.count > 1 ? 's' : ''}</p>
                          </div>
                        )
                      })}
                    {paymentStudents.filter(s => s.status === 'verified').length === 0 && (
                      <p className="text-center text-gray-500 py-4">No verified payments yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Export Modal - Updated with only CSV, JSON, PDF */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-indigo-100 flex justify-between items-center bg-gradient-to-r from-emerald-600 to-teal-600">
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Export Data
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
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setExportType('students')
                        setSelectedStudentForExport(null)
                      }}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        exportType === 'students' 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                          : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300'
                      }`}
                    >
                      <Users className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">All Students</span>
                    </button>
                    <button
                      onClick={() => {
                        setExportType('payments')
                        setSelectedStudentForExport(null)
                      }}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        exportType === 'payments' 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                          : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">Payments</span>
                    </button>
                    <button
                      onClick={() => {
                        setExportType('revenue')
                        setSelectedStudentForExport(null)
                      }}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        exportType === 'revenue' 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                          : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300'
                      }`}
                    >
                      <DollarSign className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">Revenue Report</span>
                    </button>
                    <button
                      onClick={() => {
                        setExportType('single-student')
                      }}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        exportType === 'single-student' 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                          : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300'
                      }`}
                    >
                      <User className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">Single Student</span>
                    </button>
                  </div>
                </div>

                {/* Single Student Selection */}
                {exportType === 'single-student' && (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Student</label>
                    <select
                      value={selectedStudentForExport?.enrollmentId || ''}
                      onChange={(e) => {
                        const student = paymentStudents.find(s => s.enrollmentId === e.target.value)
                        setSelectedStudentForExport(student || null)
                      }}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="">Choose a student...</option>
                      {paymentStudents.map(student => (
                        <option key={student.enrollmentId} value={student.enrollmentId}>
                          {student.name} - {student.course} ({student.status})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Filter Section for Bulk Exports */}
                {(exportType === 'students' || exportType === 'payments') && (
                  <>
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Status</label>
                      <select
                        value={exportFilterStatus}
                        onChange={(e) => setExportFilterStatus(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending Only</option>
                        <option value="verified">Verified Only</option>
                        <option value="rejected">Rejected Only</option>
                      </select>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Date Range (Optional)</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500">From Date</label>
                          <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">To Date</label>
                          <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Export Format Selection - Only CSV, JSON, PDF */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Export Format</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setExportFormat('csv')}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        exportFormat === 'csv' 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                          : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300'
                      }`}
                    >
                      <Download className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">CSV</span>
                      <p className="text-xs text-gray-400 mt-1">Excel compatible</p>
                    </button>
                    <button
                      onClick={() => setExportFormat('json')}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        exportFormat === 'json' 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                          : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300'
                      }`}
                    >
                      <FileJson className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">JSON</span>
                      <p className="text-xs text-gray-400 mt-1">Developer friendly</p>
                    </button>
                    <button
                      onClick={() => setExportFormat('pdf')}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        exportFormat === 'pdf' 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                          : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300'
                      }`}
                    >
                      <Printer className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">PDF</span>
                      <p className="text-xs text-gray-400 mt-1">Print ready</p>
                    </button>
                  </div>
                </div>

                {/* Export Button */}
                <div className="flex gap-3">
                  <button
                    onClick={handleExport}
                    disabled={isExporting || (exportType === 'single-student' && !selectedStudentForExport)}
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

        {/* Student Details Modal - Same as before */}
        {showScreenshotModal && selectedStudentDetails && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-indigo-100 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Student Details - {selectedStudentDetails.name}
                  </h3>
                </div>
                <button 
                  onClick={() => setShowScreenshotModal(false)} 
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="p-6 overflow-auto max-h-[calc(90vh-100px)] bg-gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Student Info */}
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-600" />
                        Personal Information
                      </h4>
                      <div className="space-y-3">
                        <p><span className="text-sm text-gray-500 w-24 inline-block">Name:</span> <span className="font-medium">{selectedStudentDetails.name}</span></p>
                        <p><span className="text-sm text-gray-500 w-24 inline-block">Email:</span> <span className="font-medium">{selectedStudentDetails.email}</span></p>
                        <p><span className="text-sm text-gray-500 w-24 inline-block">Phone:</span> <span className="font-medium">{selectedStudentDetails.phone}</span></p>
                        <p><span className="text-sm text-gray-500 w-24 inline-block">CNIC:</span> <span className="font-medium">{selectedStudentDetails.cnic}</span></p>
                        <p><span className="text-sm text-gray-500 w-24 inline-block">Address:</span> <span className="font-medium">{selectedStudentDetails.address}</span></p>
                        <p><span className="text-sm text-gray-500 w-24 inline-block">Education:</span> <span className="font-medium">{selectedStudentDetails.education}</span></p>
                        <p><span className="text-sm text-gray-500 w-24 inline-block">Experience:</span> <span className="font-medium">{selectedStudentDetails.experience}</span></p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-indigo-600" />
                        Course & Payment
                      </h4>
                      <div className="space-y-3">
                        <p><span className="text-sm text-gray-500 w-24 inline-block">Course:</span> <span className="font-medium">{selectedStudentDetails.course}</span></p>
                        {selectedStudentDetails.isBundleItem ? (
                          <p><span className="text-sm text-gray-500 w-24 inline-block">Amount:</span> <span className="font-medium text-green-600">✓ This course is part of a bundle</span></p>
                        ) : (
                          <p><span className="text-sm text-gray-500 w-24 inline-block">Amount:</span> <span className="font-bold text-indigo-600">PKR {(selectedStudentDetails.amount || 0).toLocaleString()}</span></p>
                        )}
                        <p><span className="text-sm text-gray-500 w-24 inline-block">Method:</span> <span className="font-medium">{selectedStudentDetails.paymentMethod}</span></p>
                        <p><span className="text-sm text-gray-500 w-24 inline-block">Transaction:</span> <span className="font-mono text-sm">{selectedStudentDetails.transactionId}</span></p>
                        <p><span className="text-sm text-gray-500 w-24 inline-block">Status:</span> 
                          <span className={`ml-2 inline-flex px-2 py-1 rounded-full text-xs font-medium text-white ${
                            selectedStudentDetails.status === 'verified' ? 'bg-emerald-600' : 
                            selectedStudentDetails.status === 'pending' ? 'bg-amber-600' : 'bg-red-600'
                          }`}>
                            {selectedStudentDetails.status}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Documents */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        Documents
                      </h4>
                      <div className="space-y-2">
                        {selectedStudentDetails.cnicFrontUrl && (
                          <a href={selectedStudentDetails.cnicFrontUrl} target="_blank" rel="noopener noreferrer" 
                             className="flex items-center gap-2 text-sm text-indigo-600 hover:underline p-2 bg-indigo-50 rounded-lg">
                            <FileText className="w-4 h-4" /> View CNIC Front
                          </a>
                        )}
                        {selectedStudentDetails.cnicBackUrl && (
                          <a href={selectedStudentDetails.cnicBackUrl} target="_blank" rel="noopener noreferrer" 
                             className="flex items-center gap-2 text-sm text-indigo-600 hover:underline p-2 bg-indigo-50 rounded-lg">
                            <FileText className="w-4 h-4" /> View CNIC Back
                          </a>
                        )}
                        {selectedStudentDetails.educationalDocUrl && (
                          <a href={selectedStudentDetails.educationalDocUrl} target="_blank" rel="noopener noreferrer" 
                             className="flex items-center gap-2 text-sm text-indigo-600 hover:underline p-2 bg-indigo-50 rounded-lg">
                            <FileText className="w-4 h-4" /> View Educational Document
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment Slip & Actions */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      Payment Slip
                    </h4>
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-indigo-100">
                      <img 
                        src={selectedStudentDetails.screenshotUrl} 
                        alt="Payment Slip" 
                        className="w-full h-auto"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x300?text=Image+Failed+to+Load'
                        }}
                      />
                    </div>
                    
                    {selectedStudentDetails.status === 'pending' && (
                      <div className="mt-6 space-y-3">
                        <button
                          onClick={() => sendCredentialsToStudent(selectedStudentDetails)}
                          disabled={isSendingCredentials === selectedStudentDetails.enrollmentId || isVerifying === selectedStudentDetails.enrollmentId}
                          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isSendingCredentials === selectedStudentDetails.enrollmentId || isVerifying === selectedStudentDetails.enrollmentId ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          Verify & Send Credentials
                        </button>
                        
                        <button
                          onClick={() => handleRejectPayment(selectedStudentDetails.enrollmentId, selectedStudentDetails.studentId)}
                          className="w-full py-3 border-2 border-red-600 text-red-600 rounded-xl hover:bg-red-50 font-medium"
                        >
                          Reject Payment
                        </button>
                      </div>
                    )}
                    
                    {selectedStudentDetails.status === 'verified' && (
                      <div className="mt-6 space-y-3">
                        <div className="p-4 bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-200 text-center">
                          <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-600" />
                          <p className="text-emerald-800 font-medium">Payment Verified</p>
                          {selectedStudentDetails.username && (
                            <p className="text-sm text-gray-600 mt-1">Username: {selectedStudentDetails.username}</p>
                          )}
                        </div>
                        <button
                          onClick={() => resendCredentialsEmail(selectedStudentDetails)}
                          disabled={isResendingEmail === selectedStudentDetails.email}
                          className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isResendingEmail === selectedStudentDetails.email ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            'Resend Credentials'
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudentForExport(selectedStudentDetails)
                            setExportType('single-student')
                            setShowExportModal(true)
                            setShowScreenshotModal(false)
                          }}
                          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Export Student Data
                        </button>
                      </div>
                    )}
                    
                    {selectedStudentDetails.status === 'rejected' && (
                      <div className="mt-6 p-6 bg-gradient-to-br from-red-50 to-white rounded-xl border border-red-200 text-center">
                        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-600" />
                        <p className="text-red-800 font-medium">Payment Rejected</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}