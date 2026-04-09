'use client'
/* eslint-disable */

import { useState, useEffect } from 'react'
import { 
  CheckCircle,
  AlertCircle,
  DollarSign,
  Users,
  Eye,
  Download,
  Search,
  RefreshCw,
  X,
  FileText,
  Send,
  Key,
  Mail,
  Bell,
  Shield,
  CreditCard,
  Trash2,
  User,
  Calendar,
  Phone,
  FileSpreadsheet,
  TrendingUp,
  BarChart3,
  UserPlus,
  List,
  LogOut,
  Loader2,
  Wallet,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import Link from 'next/link'

// Types
type PaymentStudent = {
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
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null)
  const [selectedStudentDetails, setSelectedStudentDetails] = useState<PaymentStudent | null>(null)
  const [showCredentialsModal, setShowCredentialsModal] = useState(false)
  const [selectedCredentials, setSelectedCredentials] = useState<StudentCredentials | null>(null)
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
      // Fetch all enrollments
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
          paymentId: item.payment_id || ''
        }))
        setPaymentStudents(students)
      }

      // Fetch credentials (verified students)
      const credentialsRes = await fetch('/api/admin/credentials')
      const credentialsData = await credentialsRes.json()
      
      if (credentialsData.success) {
        setStudentCredentials(credentialsData.data)
      }

      // Fetch revenue stats
      const revenueRes = await fetch('/api/admin/revenue')
      const revenueData = await revenueRes.json()
      
      if (revenueData.success) {
        setRevenueStats(revenueData.data)
      }

      // Fetch stats with revenue data
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

  // Handle verify payment only
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
        // Update local state
        setPaymentStudents(prev => prev.map(s => 
          s.enrollmentId === enrollmentId ? { ...s, status: 'verified' } : s
        ))
        
        // Refresh all data to update revenue
        await loadData()
        
        alert('Payment verified successfully!')
      } else {
        throw new Error(data.error || 'Verification failed')
      }
    } catch (error: any) {
      console.error('Error verifying payment:', error)
      alert(`❌ Failed to verify payment: ${error.message}`)
    } finally {
      setIsVerifying(null)
    }
  }

  // Send credentials to student (after verification)
  const sendCredentialsToStudent = async (student: PaymentStudent) => {
    if (!student.email) {
      alert('Student email is required')
      return
    }

    // First verify the payment
    await handleVerifyPayment(student.enrollmentId, student.studentId)
    
    // Then send credentials
    setIsSendingCredentials(student.enrollmentId)

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
          courseId: student.courseId
        })
      })

      const data = await response.json()

      if (data.success) {
        alert(`✅ Credentials sent successfully to ${student.email}!`)
        setShowScreenshotModal(false)
        await loadData()
      } else {
        throw new Error(data.error || 'Failed to send credentials')
      }
    } catch (error: any) {
      console.error('Error sending credentials:', error)
      alert(`❌ Failed to send credentials: ${error.message}`)
    } finally {
      setIsSendingCredentials(null)
    }
  }

  // ✅ NEW: Resend enrollment confirmation email
  const resendEnrollmentEmail = async (student: PaymentStudent) => {
    if (!student.email) {
      alert('Student email is required')
      return
    }

    setIsResendingEmail(student.enrollmentId)

    try {
      const response = await fetch('/api/admin/resend-enrollment-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId: student.enrollmentId,
          studentEmail: student.email,
          studentName: student.name,
          course: student.course,
          amount: student.amount,
          paymentId: student.paymentId
        })
      })

      const data = await response.json()

      if (data.success) {
        alert(`✅ Enrollment confirmation email resent successfully to ${student.email}!`)
      } else {
        throw new Error(data.error || 'Failed to resend email')
      }
    } catch (error: any) {
      console.error('Error resending email:', error)
      alert(`❌ Failed to resend email: ${error.message}`)
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
          {/* Total Enrollments */}
          <div className="bg-white rounded-xl shadow p-6 border border-indigo-100 hover:shadow-lg transition-all hover:-translate-y-1 min-h-[120px]">
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

          {/* Pending Verification */}
          <div className="bg-white rounded-xl shadow p-6 border border-amber-100 hover:shadow-lg transition-all hover:-translate-y-1 min-h-[120px]">
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

          {/* Verified Payments */}
          <div className="bg-white rounded-xl shadow p-6 border border-emerald-100 hover:shadow-lg transition-all hover:-translate-y-1 min-h-[120px]">
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

          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow p-6 border border-purple-100 hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  PKR {(totalVerifiedRevenue || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Average per student: PKR {(averageRevenuePerStudent || 0).toLocaleString()}
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
                  <ArrowUpRight className="w-3 h-3 inline text-emerald-600" /> From {(revenueStats?.payingStudents || 0)} students
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
                  <ArrowDownRight className="w-3 h-3 inline text-amber-600" /> Awaiting verification
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
                  <p className="text-xl font-bold text-indigo-600">
                    PKR {(averageRevenuePerStudent || 0).toLocaleString()}
                  </p>
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

          {/* Payments Table */}
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
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-indigo-600">
                            PKR {(Number(student.amount) || 0).toLocaleString()}
                          </span>
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
                                setSelectedScreenshot(student.screenshotUrl)
                                setShowScreenshotModal(true)
                              }} 
                              className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {/* ✅ Resend Email Button */}
                            <button 
                              onClick={() => resendEnrollmentEmail(student)}
                              disabled={isResendingEmail === student.enrollmentId}
                              className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
                              title="Resend Enrollment Email"
                            >
                              {isResendingEmail === student.enrollmentId ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Mail className="w-4 h-4" />
                              )}
                            </button>
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
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Verified Date</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white">Status</th>
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
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {cred.verifiedDate ? new Date(cred.verifiedDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white bg-emerald-600 shadow-sm">
                              {cred.credentialsSent ? 'Credentials Sent' : 'Verified'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <button 
                              onClick={() => {
                                // Resend credentials email for verified student
                                const student = paymentStudents.find(s => s.enrollmentId === cred.enrollmentId)
                                if (student) {
                                  resendEnrollmentEmail(student)
                                }
                              }}
                              disabled={isResendingEmail === cred.enrollmentId}
                              className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
                              title="Resend Email"
                            >
                              {isResendingEmail === cred.enrollmentId ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Mail className="w-4 h-4" />
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
            <div className="p-6 bg-gray-50 rounded-xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue Summary */}
                <div className="bg-white rounded-xl p-6 border border-indigo-100 shadow hover:shadow-md transition-all">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
                      <span className="text-gray-600">Verified Revenue</span>
                      <span className="font-bold text-lg text-emerald-600">PKR {(totalVerifiedRevenue || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
                      <span className="text-gray-600">Pending Revenue</span>
                      <span className="font-bold text-lg text-amber-600">PKR {(pendingRevenue || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
                      <span className="text-gray-600">Paying Students</span>
                      <span className="font-bold text-lg text-indigo-600">{(revenueStats?.payingStudents || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average per Student</span>
                      <span className="font-bold text-lg text-purple-600">PKR {(averageRevenuePerStudent || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Course-wise Revenue */}
                <div className="bg-white rounded-xl p-6 border border-purple-100 shadow hover:shadow-md transition-all">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Course-wise Revenue</h3>
                  <div className="space-y-3">
                    {paymentStudents
                      .filter(s => s.status === 'verified')
                      .reduce((acc: any[], student) => {
                        const existing = acc.find(c => c.course === student.course)
                        const amount = Number(student.amount) || 0
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
                      .map((course, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0 border-purple-100">
                          <div>
                            <p className="font-medium text-gray-900">{course.course}</p>
                            <p className="text-xs text-gray-500">{course.count} student{course.count > 1 ? 's' : ''}</p>
                          </div>
                          <span className="font-bold text-purple-600">PKR {(course.revenue || 0).toLocaleString()}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Recent Verified Payments */}
                <div className="md:col-span-2 bg-white rounded-xl p-6 border border-emerald-100 shadow hover:shadow-md transition-all">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Revenue</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse">
                      <thead className="bg-emerald-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-emerald-800">Student</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-emerald-800">Course</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-emerald-800">Amount</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-emerald-800">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-100">
                        {paymentStudents
                          .filter(s => s.status === 'verified')
                          .slice(0, 5)
                          .map(student => (
                            <tr key={student.enrollmentId} className="hover:bg-emerald-50 transition-colors">
                              <td className="px-4 py-3 text-sm text-gray-900">{student.name}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{student.course}</td>
                              <td className="px-4 py-3 text-sm font-bold text-emerald-600">PKR {(student.amount || 0).toLocaleString()}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{student.paymentDate ? new Date(student.paymentDate).toLocaleDateString() : 'N/A'}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Screenshot Modal */}
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
                        <p className="flex"><span className="text-sm text-gray-500 w-24">Name:</span> <span className="font-medium text-gray-900">{selectedStudentDetails.name}</span></p>
                        <p className="flex"><span className="text-sm text-gray-500 w-24">Email:</span> <span className="font-medium text-gray-900">{selectedStudentDetails.email}</span></p>
                        <p className="flex"><span className="text-sm text-gray-500 w-24">Phone:</span> <span className="font-medium text-gray-900">{selectedStudentDetails.phone}</span></p>
                        <p className="flex"><span className="text-sm text-gray-500 w-24">CNIC:</span> <span className="font-medium text-gray-900">{selectedStudentDetails.cnic}</span></p>
                        <p className="flex"><span className="text-sm text-gray-500 w-24">Address:</span> <span className="font-medium text-gray-900">{selectedStudentDetails.address}</span></p>
                        <p className="flex"><span className="text-sm text-gray-500 w-24">Education:</span> <span className="font-medium text-gray-900">{selectedStudentDetails.education}</span></p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-indigo-600" />
                        Course & Payment
                      </h4>
                      <div className="space-y-3">
                        <p className="flex"><span className="text-sm text-gray-500 w-24">Course:</span> <span className="font-medium text-gray-900">{selectedStudentDetails.course}</span></p>
                        <p className="flex"><span className="text-sm text-gray-500 w-24">Amount:</span> <span className="font-bold text-indigo-600">PKR {(selectedStudentDetails.amount || 0).toLocaleString()}</span></p>
                        <p className="flex"><span className="text-sm text-gray-500 w-24">Method:</span> <span className="font-medium text-gray-900">{selectedStudentDetails.paymentMethod}</span></p>
                        <p className="flex"><span className="text-sm text-gray-500 w-24">Transaction:</span> <span className="font-mono text-sm text-gray-700">{selectedStudentDetails.transactionId}</span></p>
                        <p className="flex"><span className="text-sm text-gray-500 w-24">Status:</span> 
                          <span className={`ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm`}
                            style={{ 
                              backgroundColor: selectedStudentDetails.status === 'verified' 
                                ? BRAND_COLORS.teal 
                                : selectedStudentDetails.status === 'rejected' 
                                  ? BRAND_COLORS.brightRed 
                                  : BRAND_COLORS.darkRoyalBlue 
                            }}>
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
                      <div className="space-y-3">
                        {selectedStudentDetails.cnicFrontUrl && (
                          <a href={selectedStudentDetails.cnicFrontUrl} target="_blank" rel="noopener noreferrer" 
                             className="flex items-center gap-2 text-sm text-indigo-600 hover:underline p-2 bg-indigo-50 rounded-lg">
                            <FileText className="w-4 h-4" />
                            View CNIC Front
                          </a>
                        )}
                        {selectedStudentDetails.cnicBackUrl && (
                          <a href={selectedStudentDetails.cnicBackUrl} target="_blank" rel="noopener noreferrer" 
                             className="flex items-center gap-2 text-sm text-indigo-600 hover:underline p-2 bg-indigo-50 rounded-lg">
                            <FileText className="w-4 h-4" />
                            View CNIC Back
                          </a>
                        )}
                        {selectedStudentDetails.educationalDocUrl && (
                          <a href={selectedStudentDetails.educationalDocUrl} target="_blank" rel="noopener noreferrer" 
                             className="flex items-center gap-2 text-sm text-indigo-600 hover:underline p-2 bg-indigo-50 rounded-lg">
                            <FileText className="w-4 h-4" />
                            View Educational Document
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment Slip */}
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
                          e.currentTarget.src = 'https://via.placeholder.com/500x300?text=Image+Failed+to+Load'
                        }}
                      />
                    </div>
                    
                    {selectedStudentDetails.status === 'pending' && (
                      <div className="mt-6 space-y-3">
                        <button
                          onClick={() => sendCredentialsToStudent(selectedStudentDetails)}
                          disabled={isSendingCredentials === selectedStudentDetails.enrollmentId || isVerifying === selectedStudentDetails.enrollmentId}
                          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                        >
                          {isSendingCredentials === selectedStudentDetails.enrollmentId || isVerifying === selectedStudentDetails.enrollmentId ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Verify & Send Credentials
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleRejectPayment(selectedStudentDetails.enrollmentId, selectedStudentDetails.studentId)}
                          disabled={isSendingCredentials === selectedStudentDetails.enrollmentId}
                          className="w-full py-3 border-2 border-red-600 text-red-600 rounded-xl hover:bg-red-50 font-medium disabled:opacity-50 transition-all"
                        >
                          Reject Payment
                        </button>
                      </div>
                    )}
                    
                    {selectedStudentDetails.status === 'verified' && (
                      <div className="mt-6 space-y-3">
                        <div className="p-6 bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-200 text-center">
                          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-600" />
                          <p className="text-emerald-800 font-medium">Payment Verified</p>
                          <p className="text-sm text-emerald-600 mt-2">
                            Amount: PKR {(selectedStudentDetails.amount || 0).toLocaleString()} added to revenue
                          </p>
                          {selectedStudentDetails.credentialsSent && (
                            <p className="text-xs text-emerald-600 mt-2 bg-emerald-100 p-2 rounded-lg">
                              ✓ Credentials sent successfully
                            </p>
                          )}
                        </div>
                        {/* Resend Email Button in Modal */}
                        <button
                          onClick={() => resendEnrollmentEmail(selectedStudentDetails)}
                          disabled={isResendingEmail === selectedStudentDetails.enrollmentId}
                          className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                        >
                          {isResendingEmail === selectedStudentDetails.enrollmentId ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Resending...
                            </>
                          ) : (
                            <>
                              <Mail className="w-4 h-4" />
                              Resend Enrollment Email
                            </>
                          )}
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