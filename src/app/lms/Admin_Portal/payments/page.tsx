'use client'


import { useState, useEffect } from 'react'
import { 
  HiSearch,  HiDocumentDownload,
  HiCheckCircle, HiClock, HiXCircle, HiX,
  HiCurrencyDollar,  HiEye, HiEyeOff,
  HiPhotograph, HiDownload, HiExternalLink,
  HiCreditCard,
  HiOutlineRefresh
} from 'react-icons/hi'
/* eslint-disable */

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

interface RealPayment {
  id: string
  enrollmentId: string
  studentId: string
  studentName: string
  email: string
  phone: string
  cnic: string
  address: string
  education: string
  experience: string
  course: string
  courseId: string
  amount: number
  amountFormatted: string
  paymentDate: string
  paymentMethod: string
  transactionId: string
  status: 'pending' | 'verified' | 'rejected'
  screenshotUrl: string
  uploadedAt: string
  cnicFrontUrl: string
  cnicBackUrl: string
  educationalDocUrl: string
  voucherGenerated: boolean
  slipUploaded: boolean
}

interface PaymentStats {
  totalPayments: number
  verifiedPayments: number
  pendingPayments: number
  rejectedPayments: number
  totalRevenue: number
  recentPayments: number
}

export default function PaymentsList() {
  const [payments, setPayments] = useState<RealPayment[]>([])
  const [stats, setStats] = useState<PaymentStats>({
    totalPayments: 0,
    verifiedPayments: 0,
    pendingPayments: 0,
    rejectedPayments: 0,
    totalRevenue: 0,
    recentPayments: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState<'basic' | 'detailed'>('basic')
  const [expandedPayments, setExpandedPayments] = useState<string[]>([])
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<RealPayment | null>(null)
  const [showScreenshotModal, setShowScreenshotModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load real data from API
  const loadRealPaymentsData = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)
    
    try {
      // STEP 1: Fetch revenue data first
      const revenueResponse = await fetch('/api/admin/revenue')
      const revenueData = await revenueResponse.json()
      
      // STEP 2: Fetch enrollments from API
      const response = await fetch('/api/admin/enrollments')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch enrollments')
      }

      if (data.success && data.data) {
        // Map API data to payment format
        const mappedPayments: RealPayment[] = data.data.map((item: any) => ({
          id: item.id,
          enrollmentId: item.id,
          studentId: item.student_id,
          studentName: item.student_name,
          email: item.student_email,
          phone: item.student_phone || 'Not provided',
          cnic: item.student_cnic || '',
          address: item.student_address || '',
          education: item.student_education || '',
          experience: item.student_experience || '',
          course: item.course_title,
          courseId: item.course_id,
          amount: item.payment_amount || 0,
          amountFormatted: item.payment_amount ? `PKR ${Number(item.payment_amount).toLocaleString()}` : 'PKR 0',
          paymentDate: item.payment_date || item.enrollment_date,
          paymentMethod: item.payment_method || 'Bank Transfer',
          transactionId: item.transaction_id || `TXN-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          status: item.payment_status || 'pending',
          screenshotUrl: item.slip_url || '',
          uploadedAt: item.enrollment_date,
          cnicFrontUrl: item.cnic_front_url || '',
          cnicBackUrl: item.cnic_back_url || '',
          educationalDocUrl: item.educational_doc_url || '',
          voucherGenerated: item.voucher_generated || false,
          slipUploaded: item.slip_uploaded || false
        }))

        setPayments(mappedPayments)

        // Calculate statistics (all except totalRevenue which comes from revenue API)
        const totalPayments = mappedPayments.length
        const verifiedPayments = mappedPayments.filter(p => p.status === 'verified').length
        const pendingPayments = mappedPayments.filter(p => p.status === 'pending').length
        const rejectedPayments = mappedPayments.filter(p => p.status === 'rejected').length
        const recentPayments = mappedPayments.filter(p => {
          const paymentDate = new Date(p.uploadedAt)
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          return paymentDate > thirtyDaysAgo
        }).length

        // STEP 3: Update stats - ONLY totalRevenue comes from revenue API
        setStats({
          totalPayments,
          verifiedPayments,
          pendingPayments,
          rejectedPayments,
          totalRevenue: revenueData.success ? revenueData.data.totalRevenue : 0, // ONLY THIS LINE CHANGED
          recentPayments
        })
      }
    } catch (error: any) {
      console.error('Error loading payments:', error)
      setError(error.message || 'Failed to load payments')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadRealPaymentsData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => loadRealPaymentsData(true), 30000)
    return () => clearInterval(interval)
  }, [])

  // Handle verify payment
  const handleVerifyPayment = async (enrollmentId: string) => {
    try {
      const response = await fetch('/api/admin/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          enrollmentId, 
          status: 'verified' 
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Update local state
        setPayments(prev => prev.map(p => 
          p.enrollmentId === enrollmentId ? { ...p, status: 'verified' } : p
        ))
        
        // Refresh data
        await loadRealPaymentsData(true)
        
        alert('Payment verified successfully!')
        setShowScreenshotModal(false)
      } else {
        throw new Error(data.error || 'Verification failed')
      }
    } catch (error: any) {
      console.error('Error verifying payment:', error)
      alert(`❌ Failed to verify payment: ${error.message}`)
    }
  }

  // Handle reject payment
  const handleRejectPayment = async (enrollmentId: string) => {
    if (!confirm('Are you sure you want to reject this payment?')) return

    try {
      const response = await fetch('/api/admin/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          enrollmentId, 
          status: 'rejected' 
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setPayments(prev => prev.map(p => 
          p.enrollmentId === enrollmentId ? { ...p, status: 'rejected' } : p
        ))
        alert('Payment rejected!')
        setShowScreenshotModal(false)
      } else {
        throw new Error(data.error || 'Rejection failed')
      }
    } catch (error: any) {
      console.error('Error rejecting payment:', error)
      alert(`❌ Failed to reject payment: ${error.message}`)
    }
  }

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.enrollmentId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = 
      statusFilter === 'ALL' || payment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <HiCheckCircle className="w-5 h-5 text-green-500" />
      case 'pending': return <HiClock className="w-5 h-5 text-amber-500" />
      case 'rejected': return <HiXCircle className="w-5 h-5 text-red-500" />
      default: return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'jazzcash': return 'text-purple-600'
      case 'easypaisa': return 'text-blue-600'
      case 'bank transfer': return 'text-green-600'
      case 'cash': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified': return 'VERIFIED'
      case 'pending': return 'PENDING'
      case 'rejected': return 'REJECTED'
      default: return status.toUpperCase()
    }
  }

  const togglePaymentDetails = (id: string) => {
    setExpandedPayments(prev => 
      prev.includes(id) 
        ? prev.filter(paymentId => paymentId !== id)
        : [...prev, id]
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('PKR', 'PKR')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const viewScreenshot = (payment: RealPayment) => {
    if (payment.screenshotUrl) {
      setSelectedScreenshot(payment.screenshotUrl)
      setSelectedPayment(payment)
      setShowScreenshotModal(true)
    } else {
      alert('No screenshot available for this payment.')
    }
  }

  const downloadScreenshot = (payment: RealPayment) => {
    if (payment.screenshotUrl) {
      const link = document.createElement('a')
      link.href = payment.screenshotUrl
      link.download = `payment-proof-${payment.enrollmentId}.jpg`
      link.click()
    } else {
      alert('No screenshot available to download.')
    }
  }

  const refreshData = () => {
    loadRealPaymentsData(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Stats */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                Payment Management
              </h1>
              <p className="text-darkGrey/70 mt-2">Real-time payment data from database</p>
            </div>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 text-sm transition-colors disabled:opacity-50"
              style={{ backgroundColor: BRAND_COLORS.deepRed }}
            >
              <HiOutlineRefresh className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-softGrey p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-darkGrey/70">Total Payments</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkRoyalBlue }}>{stats.totalPayments}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}20` }}>
                  <HiCurrencyDollar className="w-5 h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                </div>
              </div>
              <div className="mt-2 text-xs text-darkGrey/50">
                {stats.recentPayments} in last 30 days
              </div>
            </div>

            <div className="bg-white rounded-xl border border-softGrey p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-darkGrey/70">Verified</p>
                  <p className="text-2xl font-bold mt-1 text-green-600">{stats.verifiedPayments}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-100">
                  <HiCheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="mt-2 text-xs text-darkGrey/50">
                {stats.totalPayments > 0 ? Math.round((stats.verifiedPayments / stats.totalPayments) * 100) : 0}% success rate
              </div>
            </div>

            <div className="bg-white rounded-xl border border-softGrey p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-darkGrey/70">Pending</p>
                  <p className="text-2xl font-bold mt-1 text-amber-600">{stats.pendingPayments}</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-100">
                  <HiClock className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <div className="mt-2 text-xs text-darkGrey/50">
                Needs verification
              </div>
            </div>

            <div className="bg-white rounded-xl border border-softGrey p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-darkGrey/70">Total Revenue</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}20` }}>
                  <HiCreditCard className="w-5 h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                </div>
              </div>
              <div className="mt-2 text-xs text-darkGrey/50">
                From verified payments only
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-softGrey">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-darkGrey/50" />
                  <input
                    type="text"
                    placeholder="Search by name, email, course, or transaction ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:ring-2 focus:ring-darkRoyalBlue/20 focus:border-darkRoyalBlue"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-darkGrey/50 hover:text-darkGrey"
                    >
                      <HiX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:ring-2 focus:ring-darkRoyalBlue/20 focus:border-darkRoyalBlue min-w-[140px] text-sm"
                >
                  <option value="ALL">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
                <div className="inline-flex items-center bg-lightGrey rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('basic')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      viewMode === 'basic'
                        ? 'bg-white text-darkGrey shadow-sm'
                        : 'text-darkGrey/60 hover:text-darkGrey'
                    }`}
                  >
                    <HiEyeOff className="w-4 h-4 inline mr-1" />
                    Basic
                  </button>
                  <button
                    onClick={() => setViewMode('detailed')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      viewMode === 'detailed'
                        ? 'bg-white text-darkGrey shadow-sm'
                        : 'text-darkGrey/60 hover:text-darkGrey'
                    }`}
                  >
                    <HiEye className="w-4 h-4 inline mr-1" />
                    Detailed
                  </button>
                </div>
                <button 
                  onClick={() => {
                    setStatusFilter('ALL')
                    setSearchTerm('')
                    setExpandedPayments([])
                  }}
                  className="px-4 py-2.5 border border-softGrey rounded-lg hover:bg-lightGrey text-darkGrey transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-darkGrey/70">
              Showing {filteredPayments.length} of {payments.length} payments
              {searchTerm && ` matching "${searchTerm}"`}
              {error && (
                <span className="ml-2 text-red-600">Error: {error}</span>
              )}
            </p>
          </div>
        </div>

        {/* Screenshot Modal */}
        {showScreenshotModal && selectedScreenshot && selectedPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-softGrey">
              <div className="p-4 border-b border-softGrey flex justify-between items-center bg-lightGrey">
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
                    Payment Screenshot - {selectedPayment.studentName}
                  </h3>
                  <p className="text-sm text-darkGrey/70">
                    Transaction ID: {selectedPayment.transactionId} • {selectedPayment.course}
                  </p>
                </div>
                <button
                  onClick={() => setShowScreenshotModal(false)}
                  className="text-darkGrey/70 hover:text-darkGrey p-2 rounded-lg hover:bg-white transition-colors"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-auto max-h-[70vh]">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="lg:w-2/3">
                    <div className="border border-softGrey rounded-lg overflow-hidden bg-lightGrey">
                      <img
                        src={selectedScreenshot}
                        alt="Payment Screenshot"
                        className="w-full h-auto max-h-[500px] object-contain"
                      />
                    </div>
                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                      <button
                        onClick={() => downloadScreenshot(selectedPayment)}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium flex items-center"
                      >
                        <HiDownload className="w-4 h-4 mr-2" />
                        Download
                      </button>
                      <button
                        onClick={() => window.open(selectedScreenshot, '_blank')}
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium flex items-center"
                      >
                        <HiExternalLink className="w-4 h-4 mr-2" />
                        Open Full Size
                      </button>
                    </div>
                  </div>
                  
                  <div className="lg:w-1/3">
                    <div className="bg-lightGrey rounded-lg p-4 border border-softGrey">
                      <h4 className="font-semibold mb-3" style={{ color: BRAND_COLORS.darkNavy }}>Payment Details</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-darkGrey/70">Student Name</p>
                          <p className="font-medium text-darkGrey">{selectedPayment.studentName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-darkGrey/70">Email</p>
                          <p className="font-medium text-sm text-darkGrey">{selectedPayment.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-darkGrey/70">Course</p>
                          <p className="font-medium text-darkGrey">{selectedPayment.course}</p>
                        </div>
                        <div>
                          <p className="text-xs text-darkGrey/70">Amount</p>
                          <p className="font-medium text-green-600">{selectedPayment.amountFormatted}</p>
                        </div>
                        <div>
                          <p className="text-xs text-darkGrey/70">Payment Method</p>
                          <p className={`font-medium ${getMethodColor(selectedPayment.paymentMethod)}`}>
                            {selectedPayment.paymentMethod}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-darkGrey/70">Transaction ID</p>
                          <p className="font-mono text-sm bg-white px-2 py-1 rounded border border-softGrey text-darkGrey break-all">
                            {selectedPayment.transactionId}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-darkGrey/70">Status</p>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedPayment.status)}`}>
                            {getStatusText(selectedPayment.status)}
                          </span>
                        </div>
                      </div>
                      
                      {selectedPayment.status === 'pending' && (
                        <div className="mt-6 space-y-3">
                          <button
                            onClick={() => handleVerifyPayment(selectedPayment.enrollmentId)}
                            className="w-full py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                          >
                            ✓ Verify Payment
                          </button>
                          <button
                            onClick={() => handleRejectPayment(selectedPayment.enrollmentId)}
                            className="w-full py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                          >
                            ✗ Reject Payment
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payments List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-softGrey p-6 animate-pulse">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-softGrey">
            <HiCurrencyDollar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'No payments match your search criteria' : 'No payment records found in database'}
            </p>
            <button
              onClick={refreshData}
              className="px-6 py-3 rounded-lg text-white font-medium transition-colors"
              style={{ backgroundColor: BRAND_COLORS.deepRed }}
            >
              Refresh Data
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment) => {
              const isExpanded = expandedPayments.includes(payment.id)
              const showDetails = viewMode === 'detailed' || isExpanded

              return (
                <div 
                  key={payment.id}
                  className="bg-white rounded-xl shadow-sm border border-softGrey hover:border-gray-300 transition-colors overflow-hidden"
                >
                  {/* Basic Info Row */}
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left Column */}
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                               style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue }}>
                            <span className="text-white text-sm font-bold">
                              {payment.studentName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 truncate">{payment.studentName}</h3>
                            <div className="text-sm text-gray-500 truncate">
                              {payment.email} • {payment.course}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Center Column */}
                      <div className="space-y-1">
                        <div className="text-sm text-gray-600">Amount</div>
                        <div className="font-bold text-gray-900 text-lg">
                          {payment.amountFormatted}
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(payment.status)}`}>
                          {getStatusText(payment.status)}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => togglePaymentDetails(payment.id)}
                            className="px-3 py-1.5 border border-softGrey rounded-lg hover:bg-lightGrey text-darkGrey text-sm transition-colors"
                          >
                            {isExpanded ? 'Hide Details' : 'View Details'}
                          </button>
                          {payment.screenshotUrl && (
                            <button
                              onClick={() => viewScreenshot(payment)}
                              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm flex items-center transition-colors"
                            >
                              <HiPhotograph className="w-4 h-4 mr-1" />
                              Screenshot
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-4 pt-4 border-t border-softGrey grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Payment Date</div>
                        <div className="font-medium text-gray-900">
                          {formatDate(payment.paymentDate)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Transaction ID</div>
                        <div className="font-medium text-gray-900 text-sm font-mono truncate">
                          {payment.transactionId}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Payment Method</div>
                        <div className={`font-medium ${getMethodColor(payment.paymentMethod)}`}>
                          {payment.paymentMethod}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Status</div>
                        <div className="flex items-center">
                          {getStatusIcon(payment.status)}
                          <span className="ml-2 font-medium text-gray-900">
                            {getStatusText(payment.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Information */}
                    {showDetails && (
                      <div className="mt-6 pt-6 border-t border-softGrey">
                        <div className="bg-lightGrey rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Complete Payment Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-gray-600 mb-1">Student Information</div>
                              <div className="font-medium text-gray-900">{payment.studentName}</div>
                              <div className="text-sm text-gray-600">{payment.email}</div>
                              <div className="text-sm text-gray-600">{payment.phone}</div>
                              <div className="text-sm text-gray-600">CNIC: {payment.cnic || 'Not provided'}</div>
                              <div className="text-sm text-gray-600">Education: {payment.education || 'Not provided'}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 mb-1">Course Information</div>
                              <div className="font-medium text-gray-900">{payment.course}</div>
                              <div className="text-sm text-gray-600">Course ID: {payment.courseId}</div>
                              <div className="text-sm text-gray-600">Enrollment ID: {payment.enrollmentId}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 mb-1">Payment Breakdown</div>
                              <div className="font-medium text-gray-900">
                                {payment.amountFormatted}
                              </div>
                              <div className="text-sm text-gray-600">
                                Paid via {payment.paymentMethod}
                              </div>
                              <div className="text-sm text-gray-600">
                                Voucher Generated: {payment.voucherGenerated ? 'Yes' : 'No'}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 mb-1">Transaction Details</div>
                              <div className="text-sm text-gray-600">ID: {payment.transactionId}</div>
                              <div className="text-sm text-gray-600">Date: {formatDate(payment.paymentDate)}</div>
                              <div className="text-sm text-gray-600">
                                Slip Uploaded: {payment.slipUploaded ? 'Yes' : 'No'}
                              </div>
                            </div>
                          </div>
                          
                          {/* Document Links */}
                          {(payment.cnicFrontUrl || payment.cnicBackUrl || payment.educationalDocUrl) && (
                            <div className="mt-4 pt-4 border-t border-softGrey">
                              <div className="text-sm text-gray-600 mb-2">Student Documents</div>
                              <div className="flex flex-wrap gap-3">
                                {payment.cnicFrontUrl && (
                                  <a 
                                    href={payment.cnicFrontUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-xs flex items-center"
                                  >
                                    <HiExternalLink className="w-3 h-3 mr-1" />
                                    CNIC Front
                                  </a>
                                )}
                                {payment.cnicBackUrl && (
                                  <a 
                                    href={payment.cnicBackUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-xs flex items-center"
                                  >
                                    <HiExternalLink className="w-3 h-3 mr-1" />
                                    CNIC Back
                                  </a>
                                )}
                                {payment.educationalDocUrl && (
                                  <a 
                                    href={payment.educationalDocUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-xs flex items-center"
                                  >
                                    <HiExternalLink className="w-3 h-3 mr-1" />
                                    Educational Doc
                                  </a>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="mt-4 pt-4 border-t border-softGrey flex flex-wrap gap-3">
                            {payment.screenshotUrl && (
                              <>
                                <button
                                  onClick={() => viewScreenshot(payment)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center transition-colors"
                                >
                                  <HiPhotograph className="w-4 h-4 mr-2" />
                                  View Screenshot
                                </button>
                                <button
                                  onClick={() => downloadScreenshot(payment)}
                                  className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 text-sm flex items-center transition-colors"
                                >
                                  <HiDownload className="w-4 h-4 mr-2" />
                                  Download Proof
                                </button>
                              </>
                            )}
                            {payment.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleVerifyPayment(payment.enrollmentId)}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
                                >
                                  ✓ Verify Payment
                                </button>
                                <button
                                  onClick={() => handleRejectPayment(payment.enrollmentId)}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition-colors"
                                >
                                  ✗ Reject Payment
                                </button>
                              </>
                            )}
                            <button className="px-4 py-2 border border-softGrey rounded-lg hover:bg-lightGrey text-darkGrey text-sm flex items-center transition-colors">
                              <HiDocumentDownload className="w-4 h-4 mr-2" />
                              Download Receipt
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-softGrey">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-darkGrey/70">
              <div className="flex items-center">
                <HiCurrencyDollar className="w-4 h-4 mr-2" />
                Real payment data from database
              </div>
              <div className="mt-1 text-xs text-darkGrey/50">
                {payments.length} total records • Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="px-4 py-2 border border-softGrey rounded-lg hover:bg-lightGrey text-darkGrey text-sm flex items-center transition-colors disabled:opacity-50"
              >
                <HiOutlineRefresh className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}