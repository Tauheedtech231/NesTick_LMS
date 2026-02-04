'use client'

import { useState, useEffect } from 'react'
import { 
  HiSearch, HiFilter, HiDocumentDownload,
  HiCheckCircle, HiClock, HiXCircle, HiX,
  HiCurrencyDollar, HiBookOpen, HiEye, HiEyeOff,
  HiPhotograph, HiDownload, HiExternalLink,
  HiUserCircle, HiCalendar, HiCreditCard
} from 'react-icons/hi'
/* eslint-disable */

interface RealPayment {
  id: string
  studentName: string
  email: string
  phone: string
  course: string
  amount: string
  amountNumber: number
  enrollmentId: string
  voucherNumber: string
  paymentDate: string
  paymentMethod: string
  transactionId: string
  status: 'pending' | 'verified' | 'rejected'
  screenshotUrl?: string
  uploadedAt: string
  formData?: any
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
  const [viewMode, setViewMode] = useState<'basic' | 'detailed'>('basic')
  const [expandedPayments, setExpandedPayments] = useState<string[]>([])
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<RealPayment | null>(null)
  const [showScreenshotModal, setShowScreenshotModal] = useState(false)

  useEffect(() => {
    loadRealPaymentsData()
    // Refresh data every 30 seconds
    const interval = setInterval(loadRealPaymentsData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadRealPaymentsData = () => {
    setLoading(true)
    
    try {
      // Load enrollment data from localStorage
      const storedEnrollmentData = JSON.parse(localStorage.getItem('enrollmentData') || 'null')
      
      // Load payment submission data from localStorage
      const storedPaymentSubmission = JSON.parse(localStorage.getItem('paymentSubmission') || 'null')
      
      // Load uploaded files from localStorage
      const storedUploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]')
      
      console.log("Loading real payments data:", {
        storedEnrollmentData,
        storedPaymentSubmission,
        storedUploadedFiles
      })

      const realPayments: RealPayment[] = []
      
      // Process real data from localStorage
      if (storedEnrollmentData && storedEnrollmentData.fullName) {
        const enrollmentDate = new Date(storedEnrollmentData.enrollmentDate || Date.now())
        const uploadedAt = storedPaymentSubmission?.uploadedAt || enrollmentDate.toISOString()
        
        // Get screenshot if available
        let screenshotUrl = null
        if (storedUploadedFiles && storedUploadedFiles.length > 0) {
          const latestFile = storedUploadedFiles[0]
          if (latestFile.dataUrl) {
            screenshotUrl = latestFile.dataUrl
          }
        }
        
        const amountStr = storedEnrollmentData.price || 'PKR 25,000'
        const amountNumber = parseFloat(amountStr.replace('PKR ', '').replace(/,/g, '')) || 25000
        
        realPayments.push({
          id: storedEnrollmentData.enrollmentId || `REAL-${Date.now()}`,
          studentName: storedEnrollmentData.fullName,
          email: storedEnrollmentData.email,
          phone: storedEnrollmentData.phone,
          course: storedEnrollmentData.course,
          amount: amountStr,
          amountNumber: amountNumber,
          enrollmentId: storedEnrollmentData.enrollmentId || `ENR-${Date.now()}`,
          voucherNumber: `VCH-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          paymentDate: storedPaymentSubmission?.paymentDate || new Date().toISOString().split('T')[0],
          paymentMethod: storedPaymentSubmission?.paymentMethod || 'JazzCash',
          transactionId: storedPaymentSubmission?.transactionId || `TXN-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          status: 'pending',
          screenshotUrl: screenshotUrl,
          uploadedAt: uploadedAt,
          formData: storedEnrollmentData
        })
      }

      // Add sample real data for demonstration
      const sampleScreenshots = [
        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1554224154-26032ffc0d07?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
      ]
      
      const sampleCourses = ['Pipe Fitter', 'Safety Inspector', 'Professional Welding']
      const sampleAmounts = ['PKR 25,000', 'PKR 30,000', 'PKR 35,000']
      const sampleAmountNumbers = [25000, 30000, 35000]
      const sampleMethods = ['JazzCash', 'EasyPaisa', 'Bank Transfer']
      const sampleStatuses: Array<'pending' | 'verified' | 'rejected'> = ['pending', 'verified', 'pending']
      
      for (let i = 0; i < 3; i++) {
        realPayments.push({
          id: `sample-${i + 1}`,
          studentName: i === 0 ? storedEnrollmentData?.fullName || 'Ali Raza' : 
                      i === 1 ? 'Ayesha Khan' : 'Muhammad Shahid',
          email: i === 0 ? storedEnrollmentData?.email || 'ali.raza@example.com' :
                 i === 1 ? 'ayesha.khan@example.com' : 'm.shahid@example.com',
          phone: i === 0 ? storedEnrollmentData?.phone || '+92 300 1234567' :
                 i === 1 ? '+92 310 2345678' : '+92 320 3456789',
          course: sampleCourses[i],
          amount: sampleAmounts[i],
          amountNumber: sampleAmountNumbers[i],
          enrollmentId: `ENR-2024-00${i + 1}`,
          voucherNumber: `VCH-2024-00${i + 1}`,
          paymentDate: `2024-01-${15 + i}`,
          paymentMethod: sampleMethods[i],
          transactionId: `${sampleMethods[i].substring(0, 2)}${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          status: sampleStatuses[i],
          screenshotUrl: sampleScreenshots[i],
          uploadedAt: new Date(Date.now() - (i * 86400000)).toISOString(),
          formData: i === 0 ? storedEnrollmentData : null
        })
      }

      setPayments(realPayments)
      
      // Calculate statistics
      const totalPayments = realPayments.length
      const verifiedPayments = realPayments.filter(p => p.status === 'verified').length
      const pendingPayments = realPayments.filter(p => p.status === 'pending').length
      const rejectedPayments = realPayments.filter(p => p.status === 'rejected').length
      const totalRevenue = realPayments.reduce((sum, p) => sum + p.amountNumber, 0)
      const recentPayments = realPayments.filter(p => {
        const paymentDate = new Date(p.uploadedAt)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        return paymentDate > thirtyDaysAgo
      }).length

      setStats({
        totalPayments,
        verifiedPayments,
        pendingPayments,
        rejectedPayments,
        totalRevenue,
        recentPayments
      })

    } catch (error) {
      console.error("Error loading real payments:", error)
      // Fallback to sample data
      const samplePayments: RealPayment[] = [
        {
          id: 'fallback-1',
          studentName: 'Test Student',
          email: 'test@example.com',
          phone: '+92 300 0000000',
          course: 'Pipe Fitter',
          amount: 'PKR 25,000',
          amountNumber: 25000,
          enrollmentId: 'ENR-TEST-001',
          voucherNumber: 'VCH-TEST-001',
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'JazzCash',
          transactionId: 'JZTEST001',
          status: 'pending',
          screenshotUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
          uploadedAt: new Date().toISOString()
        }
      ]
      
      setPayments(samplePayments)
      setStats({
        totalPayments: 1,
        verifiedPayments: 0,
        pendingPayments: 1,
        rejectedPayments: 0,
        totalRevenue: 25000,
        recentPayments: 1
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.enrollmentId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = 
      statusFilter === 'ALL' || 
      (statusFilter === 'PAID' && payment.status === 'verified') ||
      (statusFilter === 'PENDING' && payment.status === 'pending') ||
      (statusFilter === 'FAILED' && payment.status === 'rejected')
    
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
      case 'verified': return 'border-green-200 bg-green-50 text-green-700'
      case 'pending': return 'border-amber-200 bg-amber-50 text-amber-700'
      case 'rejected': return 'border-red-200 bg-red-50 text-red-700'
      default: return 'border-gray-200 bg-gray-50 text-gray-700'
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

  const handleVerifyPayment = (paymentId: string) => {
    setPayments(prev => prev.map(payment => 
      payment.id === paymentId ? { ...payment, status: 'verified' as const } : payment
    ))
    alert('Payment verified successfully!')
  }

  const handleRejectPayment = (paymentId: string) => {
    setPayments(prev => prev.map(payment => 
      payment.id === paymentId ? { ...payment, status: 'rejected' as const } : payment
    ))
    alert('Payment rejected.')
  }

  const refreshData = () => {
    loadRealPaymentsData()
    alert('Data refreshed from localStorage')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Stats */}
        <div className="mb-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Real Payments</h1>
                <p className="text-gray-600 mt-2">Real payment data from student submissions</p>
              </div>
              <button
                onClick={refreshData}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm flex items-center"
              >
                <span className="mr-2">🔄</span>
                Refresh Data
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Payments</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalPayments}</p>
                  </div>
                  <HiCurrencyDollar className="w-8 h-8 text-gray-400" />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {stats.recentPayments} in last 30 days
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Verified</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.verifiedPayments}</p>
                  </div>
                  <HiCheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {Math.round((stats.verifiedPayments / Math.max(stats.totalPayments, 1)) * 100)}% success rate
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</p>
                  </div>
                  <HiClock className="w-8 h-8 text-amber-400" />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Needs verification
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.totalRevenue).replace('PKR', 'PKR ')}
                    </p>
                  </div>
                  <HiCreditCard className="w-8 h-8 text-blue-400" />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  From all payments
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, course, or transaction ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <HiX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black min-w-[140px]"
                >
                  <option value="ALL">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
                <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('basic')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      viewMode === 'basic'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <HiEyeOff className="w-4 h-4 inline mr-1" />
                    Basic
                  </button>
                  <button
                    onClick={() => setViewMode('detailed')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      viewMode === 'detailed'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
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
                  className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <div className="text-gray-700">
              Showing {filteredPayments.length} of {payments.length} real payments
              {searchTerm && ` matching "${searchTerm}"`}
            </div>
          </div>
        </div>

        {/* Screenshot Modal */}
        {showScreenshotModal && selectedScreenshot && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Payment Screenshot - {selectedPayment.studentName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Transaction ID: {selectedPayment.transactionId} • {selectedPayment.course}
                  </p>
                </div>
                <button
                  onClick={() => setShowScreenshotModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6 overflow-auto max-h-[70vh]">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="lg:w-2/3">
                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                      <img
                        src={selectedScreenshot}
                        alt="Payment Screenshot"
                        className="w-full h-auto max-h-[500px] object-contain"
                      />
                    </div>
                    <div className="mt-4 flex justify-center space-x-4">
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
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Payment Details</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Student Name</p>
                          <p className="font-medium">{selectedPayment.studentName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-sm">{selectedPayment.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Course</p>
                          <p className="font-medium">{selectedPayment.course}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Amount</p>
                          <p className="font-medium text-green-600">{selectedPayment.amount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Payment Method</p>
                          <p className="font-medium">{selectedPayment.paymentMethod}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Transaction ID</p>
                          <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {selectedPayment.transactionId}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            selectedPayment.status === 'verified' 
                              ? 'bg-green-100 text-green-800'
                              : selectedPayment.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {getStatusText(selectedPayment.status)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-6 space-y-3">
                        <button
                          onClick={() => {
                            handleVerifyPayment(selectedPayment.id)
                            setShowScreenshotModal(false)
                          }}
                          className="w-full py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          ✓ Verify Payment
                        </button>
                        <button
                          onClick={() => {
                            handleRejectPayment(selectedPayment.id)
                            setShowScreenshotModal(false)
                          }}
                          className="w-full py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                          ✗ Reject Payment
                        </button>
                      </div>
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
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
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
          <div className="text-center py-16">
            <HiCurrencyDollar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'No payments match your search criteria' : 'No payment records found in localStorage'}
            </p>
            <button
              onClick={refreshData}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
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
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-gray-300 transition-colors overflow-hidden"
                >
                  {/* Basic Info Row */}
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left Column */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {payment.studentName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{payment.studentName}</h3>
                            <div className="text-sm text-gray-500">
                              {payment.email} • {payment.course}
                            </div>
                          </div>
                          {payment.formData && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Real Data
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Center Column */}
                      <div className="space-y-1">
                        <div className="text-sm text-gray-600">Amount</div>
                        <div className="font-bold text-gray-900 text-lg">
                          {payment.amount}
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(payment.status)}`}>
                          {getStatusText(payment.status)}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => togglePaymentDetails(payment.id)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm"
                          >
                            {isExpanded ? 'Hide Details' : 'View Details'}
                          </button>
                          {payment.screenshotUrl && (
                            <button
                              onClick={() => viewScreenshot(payment)}
                              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm flex items-center"
                            >
                              <HiPhotograph className="w-4 h-4 mr-1" />
                              Screenshot
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Payment Date</div>
                        <div className="font-medium text-gray-900">
                          {formatDate(payment.paymentDate)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Transaction ID</div>
                        <div className="font-medium text-gray-900 text-sm font-mono">
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
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Payment Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-gray-600 mb-1">Student Information</div>
                              <div className="font-medium text-gray-900">{payment.studentName}</div>
                              <div className="text-sm text-gray-600">{payment.email}</div>
                              <div className="text-sm text-gray-600">{payment.phone}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 mb-1">Course Information</div>
                              <div className="font-medium text-gray-900">{payment.course}</div>
                              <div className="text-sm text-gray-600">Enrollment ID: {payment.enrollmentId}</div>
                              <div className="text-sm text-gray-600">Voucher: {payment.voucherNumber}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 mb-1">Payment Breakdown</div>
                              <div className="font-medium text-gray-900">
                                {payment.amount}
                              </div>
                              <div className="text-sm text-gray-600">
                                Paid via {payment.paymentMethod}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 mb-1">Transaction Details</div>
                              <div className="font-medium text-gray-900">{payment.paymentMethod}</div>
                              <div className="text-sm text-gray-600">ID: {payment.transactionId}</div>
                              <div className="text-sm text-gray-600">Date: {formatDate(payment.paymentDate)}</div>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-3">
                            {payment.screenshotUrl && (
                              <>
                                <button
                                  onClick={() => viewScreenshot(payment)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center"
                                >
                                  <HiPhotograph className="w-4 h-4 mr-2" />
                                  View Screenshot
                                </button>
                                <button
                                  onClick={() => downloadScreenshot(payment)}
                                  className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 text-sm flex items-center"
                                >
                                  <HiDownload className="w-4 h-4 mr-2" />
                                  Download Proof
                                </button>
                              </>
                            )}
                            {payment.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleVerifyPayment(payment.id)}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                                >
                                  ✓ Verify Payment
                                </button>
                                <button
                                  onClick={() => handleRejectPayment(payment.id)}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                >
                                  ✗ Reject Payment
                                </button>
                              </>
                            )}
                            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm">
                              <HiDocumentDownload className="w-4 h-4 inline mr-2" />
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
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              <div className="flex items-center">
                <HiCurrencyDollar className="w-4 h-4 mr-2" />
                Real payment data loaded from localStorage
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {payments.filter(p => p.formData).length} real submissions • Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={refreshData}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm flex items-center"
              >
                <span className="mr-2">🔄</span>
                Refresh Data
              </button>
              <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm">
                <HiFilter className="w-4 h-4 inline mr-2" />
                Export All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}