'use client'

import { useState, useEffect } from 'react'
import { 
  HiSearch, HiFilter, HiDocumentDownload,
  HiCheckCircle, HiClock, HiXCircle, HiX,
  HiCurrencyDollar, HiBookOpen, HiEye, HiEyeOff
} from 'react-icons/hi'

interface Payment {
  id: string
  studentId: string
  studentName: string
  course: string
  amount: number
  date: string
  status: 'PAID' | 'PENDING' | 'FAILED'
  method: 'Credit Card' | 'Bank Transfer' | 'PayPal' | 'Cash'
  reference: string
}

export default function PaymentsList() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'basic' | 'detailed'>('basic')
  const [expandedPayments, setExpandedPayments] = useState<string[]>([])

  useEffect(() => {
    // Load sample data
    const samplePayments: Payment[] = [
      {
        id: '1',
        studentId: 'STU001',
        studentName: 'John Doe',
        course: 'Web Development Bootcamp',
        amount: 2999,
        date: '2024-03-15',
        status: 'PAID',
        method: 'Credit Card',
        reference: 'PAY-001-2024'
      },
      {
        id: '2',
        studentId: 'STU002',
        studentName: 'Jane Smith',
        course: 'Data Science Fundamentals',
        amount: 2000,
        date: '2024-03-14',
        status: 'PENDING',
        method: 'Bank Transfer',
        reference: 'PAY-002-2024'
      },
      {
        id: '3',
        studentId: 'STU003',
        studentName: 'Bob Johnson',
        course: 'Digital Marketing Mastery',
        amount: 2499,
        date: '2024-03-12',
        status: 'PAID',
        method: 'PayPal',
        reference: 'PAY-003-2024'
      },
      {
        id: '4',
        studentId: 'STU004',
        studentName: 'Alice Brown',
        course: 'Mobile App Development',
        amount: 1500,
        date: '2024-03-10',
        status: 'PAID',
        method: 'Credit Card',
        reference: 'PAY-004-2024'
      },
      {
        id: '5',
        studentId: 'STU002',
        studentName: 'Jane Smith',
        course: 'Data Science Fundamentals',
        amount: 1499,
        date: '2024-03-05',
        status: 'FAILED',
        method: 'Credit Card',
        reference: 'PAY-005-2024'
      },
      {
        id: '6',
        studentId: 'STU005',
        studentName: 'Charlie Wilson',
        course: 'Cybersecurity Essentials',
        amount: 3499,
        date: '2024-03-01',
        status: 'PENDING',
        method: 'Bank Transfer',
        reference: 'PAY-006-2024'
      },
      {
        id: '7',
        studentId: 'STU006',
        studentName: 'David Lee',
        course: 'UI/UX Design Pro',
        amount: 1999,
        date: '2024-02-28',
        status: 'PAID',
        method: 'Cash',
        reference: 'PAY-007-2024'
      },
      {
        id: '8',
        studentId: 'STU007',
        studentName: 'Emma Garcia',
        course: 'Python for Data Science',
        amount: 1799,
        date: '2024-02-25',
        status: 'PAID',
        method: 'Credit Card',
        reference: 'PAY-008-2024'
      }
    ]

    setPayments(samplePayments)
    setLoading(false)
  }, [])

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return <HiCheckCircle className="w-5 h-5 text-green-500" />
      case 'PENDING': return <HiClock className="w-5 h-5 text-amber-500" />
      case 'FAILED': return <HiXCircle className="w-5 h-5 text-red-500" />
      default: return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'border-green-200 bg-green-50 text-green-700'
      case 'PENDING': return 'border-amber-200 bg-amber-50 text-amber-700'
      case 'FAILED': return 'border-red-200 bg-red-50 text-red-700'
      default: return 'border-gray-200 bg-gray-50 text-gray-700'
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'Credit Card': return 'text-purple-600'
      case 'Bank Transfer': return 'text-blue-600'
      case 'PayPal': return 'text-blue-400'
      case 'Cash': return 'text-green-600'
      default: return 'text-gray-600'
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600 mt-2">Manage and track student payments</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search payments..."
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
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
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
              Showing {filteredPayments.length} of {payments.length} payments
            </div>
          </div>
        </div>

        {/* Payments Table */}
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
            <p className="text-gray-600">
              {searchTerm ? 'No payments match your search criteria' : 'No payment records available'}
            </p>
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
                              {payment.studentId} • {payment.course}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Center Column */}
                      <div className="space-y-1">
                        <div className="text-sm text-gray-600">Amount</div>
                        <div className="font-bold text-gray-900 text-lg">
                          {formatCurrency(payment.amount)}
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => togglePaymentDetails(payment.id)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm"
                          >
                            {isExpanded ? 'Hide Details' : 'View Details'}
                          </button>
                          {payment.status === 'PENDING' && (
                            <button className="px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 text-sm">
                              Verify
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Date</div>
                        <div className="font-medium text-gray-900">
                          {new Date(payment.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Reference</div>
                        <div className="font-medium text-gray-900">{payment.reference}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Method</div>
                        <div className={`font-medium ${getMethodColor(payment.method)}`}>
                          {payment.method}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Status</div>
                        <div className="flex items-center">
                          {getStatusIcon(payment.status)}
                          <span className="ml-2 font-medium text-gray-900">
                            {payment.status}
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
                              <div className="text-sm text-gray-600">{payment.studentId}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 mb-1">Course Information</div>
                              <div className="font-medium text-gray-900">{payment.course}</div>
                              <div className="text-sm text-gray-600 flex items-center">
                                <HiBookOpen className="w-3 h-3 mr-1" />
                                Course Fee
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 mb-1">Payment Breakdown</div>
                              <div className="font-medium text-gray-900">
                                {formatCurrency(payment.amount)}
                              </div>
                              <div className="text-sm text-gray-600">Full amount paid</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 mb-1">Transaction Details</div>
                              <div className="font-medium text-gray-900">{payment.method}</div>
                              <div className="text-sm text-gray-600">Ref: {payment.reference}</div>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
                            {/* <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm">
                              Download Receipt
                            </button>
                            <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm">
                              Generate Invoice
                            </button> */}
                            {payment.status === 'PENDING' && (
                              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                                Mark as Paid
                              </button>
                            )}
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

        {/* Quick Actions Footer */}
        {/* <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Need help with payments? <a href="#" className="text-black hover:underline">Contact support</a>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm">
                <HiDocumentDownload className="w-4 h-4 inline mr-2" />
                Export List
              </button>
              <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm">
                <HiFilter className="w-4 h-4 inline mr-2" />
                Advanced Filters
              </button>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  )
}