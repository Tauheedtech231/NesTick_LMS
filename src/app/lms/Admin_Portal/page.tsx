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
  Image as ImageIcon,
  RefreshCw,
  X,
  FileText,
  Send,
  Key,
  Mail
} from 'lucide-react'

type PaymentStudent = {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  amount: string;
  paymentDate: string;
  paymentMethod: string;
  transactionId: string;
  status: 'pending' | 'verified' | 'rejected';
  screenshotUrl: string;
  uploadedAt: string;
}

type StudentCredentials = {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  course: string;
  username: string;
  password: string;
  sentDate: string;
  status: 'sent' | 'failed';
}

export default function AdminDashboard() {
  const [paymentStudents, setPaymentStudents] = useState<PaymentStudent[]>([])
  const [studentCredentials, setStudentCredentials] = useState<StudentCredentials[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSendingCredentials, setIsSendingCredentials] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showScreenshotModal, setShowScreenshotModal] = useState(false)
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null)
  const [selectedStudentDetails, setSelectedStudentDetails] = useState<PaymentStudent | null>(null)
  const [showCredentialsModal, setShowCredentialsModal] = useState(false)
  const [selectedCredentials, setSelectedCredentials] = useState<StudentCredentials | null>(null)

  // Load data function
  const loadDataFromLocalStorage = () => {
    setIsLoading(true);
    
    try {
      console.log("🔍 Loading payment data from localStorage...");
      
      const studentsWithPayments: PaymentStudent[] = [];
      
      // Check for uploadedFiles
      const uploadedFilesStr = localStorage.getItem('uploadedFiles');
      if (uploadedFilesStr) {
        try {
          const uploadedFiles = JSON.parse(uploadedFilesStr);
          console.log("📁 Uploaded files:", uploadedFiles);
          
          if (uploadedFiles && uploadedFiles.length > 0) {
            uploadedFiles.forEach((file: any) => {
              if (file && file.studentName && file.thumbnail) {
                console.log("✅ Found file with thumbnail:", {
                  name: file.studentName,
                  thumbnailExists: !!file.thumbnail,
                  thumbnailLength: file.thumbnail?.length || 0
                });
                
                studentsWithPayments.push({
                  id: file.id || `file-${Date.now()}`,
                  name: file.studentName,
                  email: file.email || 'Not available',
                  phone: file.phone || 'Not available',
                  course: file.course || 'Unknown Course',
                  amount: file.amount || 'PKR 25,000',
                  paymentDate: file.uploadDate ? new Date(file.uploadDate).toLocaleDateString() : new Date().toLocaleDateString(),
                  paymentMethod: file.paymentMethod || 'JazzCash',
                  transactionId: file.transactionId || `TXN-${Math.random().toString(36).substr(2, 8)}`,
                  status: 'pending',
                  screenshotUrl: file.thumbnail || '',
                  uploadedAt: file.uploadDate || new Date().toISOString()
                });
              }
            });
          }
        } catch (error) {
          console.error("❌ Error parsing uploadedFiles:", error);
        }
      }
      
      // Check for paymentSubmission
      const paymentSubmissionStr = localStorage.getItem('paymentSubmission');
      if (paymentSubmissionStr) {
        try {
          const paymentSubmission = JSON.parse(paymentSubmissionStr);
          console.log("💰 Payment submission:", paymentSubmission);
          
          if (paymentSubmission && paymentSubmission.studentName) {
            const exists = studentsWithPayments.some(s => 
              s.transactionId === paymentSubmission.transactionId
            );
            
            if (!exists) {
              studentsWithPayments.push({
                id: `payment-${Date.now()}`,
                name: paymentSubmission.studentName,
                email: 'Not available',
                phone: 'Not available',
                course: paymentSubmission.course || 'Unknown Course',
                amount: paymentSubmission.amount || 'PKR 25,000',
                paymentDate: paymentSubmission.paymentDate || new Date().toLocaleDateString(),
                paymentMethod: paymentSubmission.paymentMethod || 'JazzCash',
                transactionId: paymentSubmission.transactionId || `TXN-${Math.random().toString(36).substr(2, 8)}`,
                status: 'pending',
                screenshotUrl: paymentSubmission.screenshotUrl || '',
                uploadedAt: paymentSubmission.uploadedAt || new Date().toISOString()
              });
            }
          }
        } catch (error) {
          console.error("❌ Error parsing paymentSubmission:", error);
        }
      }
      
      console.log("🎯 Final loaded students:", studentsWithPayments);
      setPaymentStudents(studentsWithPayments);
      
      // Load credentials from localStorage
      const credentialsStr = localStorage.getItem('studentCredentials');
      if (credentialsStr) {
        try {
          const credentials = JSON.parse(credentialsStr);
          setStudentCredentials(credentials);
          console.log("🔑 Loaded credentials:", credentials);
        } catch (error) {
          console.error("❌ Error parsing credentials:", error);
        }
      }
      
    } catch (error) {
      console.error("❌ Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadDataFromLocalStorage();
  }, [])

  // Handle verify payment
  const handleVerifyPayment = (studentId: string) => {
    setPaymentStudents(prev => prev.map(student => 
      student.id === studentId ? { ...student, status: 'verified' as const } : student
    ));
  }

  // Handle reject payment
  const handleRejectPayment = (studentId: string) => {
    setPaymentStudents(prev => prev.map(student => 
      student.id === studentId ? { ...student, status: 'rejected' as const } : student
    ));
    alert('Payment rejected!');
  }

  // Send credentials to student
  const sendCredentialsToStudent = async (student: PaymentStudent) => {
    if (!student.email || student.email === 'Not available') {
      alert('Student email is required to send credentials. Please make sure the student provided an email.');
      return;
    }

    setIsSendingCredentials(student.id);
    
    try {
      const response = await fetch('/api/send-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentEmail: student.email,
          studentName: student.name,
          courseName: student.course,
          amount: student.amount,
          paymentMethod: student.paymentMethod
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Save credentials to localStorage
        const newCredential: StudentCredentials = {
          id: `cred-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          studentId: student.id,
          studentName: student.name,
          studentEmail: student.email,
          course: student.course,
          username: result.credentials.username,
          password: result.credentials.password,
          sentDate: new Date().toISOString(),
          status: 'sent'
        };

        const existingCredentials = JSON.parse(localStorage.getItem('studentCredentials') || '[]');
        const updatedCredentials = [...existingCredentials, newCredential];
        
        localStorage.setItem('studentCredentials', JSON.stringify(updatedCredentials));
        setStudentCredentials(updatedCredentials);

        // Verify the payment
        handleVerifyPayment(student.id);
        
        alert(`✅ Credentials sent successfully to ${student.email}!\n\nUsername: ${result.credentials.username}\nPassword: ${result.credentials.password}\n\nCredentials have been saved to localStorage.`);
      } else {
        throw new Error(result.message || 'Failed to send credentials');
      }
    } catch (error: any) {
      console.error('❌ Error sending credentials:', error);
      alert(`❌ Failed to send credentials: ${error.message}`);
      
      // Save failed attempt
      const failedCredential: StudentCredentials = {
        id: `cred-failed-${Date.now()}`,
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        course: student.course,
        username: 'FAILED',
        password: 'FAILED',
        sentDate: new Date().toISOString(),
        status: 'failed'
      };

      const existingCredentials = JSON.parse(localStorage.getItem('studentCredentials') || '[]');
      const updatedCredentials = [...existingCredentials, failedCredential];
      
      localStorage.setItem('studentCredentials', JSON.stringify(updatedCredentials));
      setStudentCredentials(updatedCredentials);
    } finally {
      setIsSendingCredentials(null);
    }
  }

  // View screenshot
  const viewScreenshot = (student: PaymentStudent) => {
    console.log("👁️ Viewing screenshot for:", {
      name: student.name,
      screenshotUrl: student.screenshotUrl,
      hasScreenshot: !!student.screenshotUrl,
      screenshotLength: student.screenshotUrl?.length || 0
    });
    
    if (student.screenshotUrl && student.screenshotUrl.length > 100) {
      setSelectedScreenshot(student.screenshotUrl);
      setSelectedStudentDetails(student);
      setShowScreenshotModal(true);
    } else {
      alert('No valid screenshot available for this student.');
    }
  }

  // Download screenshot
  const downloadScreenshot = (student: PaymentStudent) => {
    if (student.screenshotUrl) {
      const link = document.createElement('a');
      link.href = student.screenshotUrl;
      link.download = `payment-${student.name}-${student.transactionId}.jpg`;
      link.click();
    } else {
      alert('No screenshot available to download.');
    }
  }

  // View credentials
  const viewCredentials = (credential: StudentCredentials) => {
    setSelectedCredentials(credential);
    setShowCredentialsModal(true);
  }

  // Resend credentials
  const resendCredentials = async (credential: StudentCredentials) => {
    if (confirm(`Resend credentials to ${credential.studentEmail}?`)) {
      try {
        const response = await fetch('/api/send-credentials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentEmail: credential.studentEmail,
            studentName: credential.studentName,
            courseName: credential.course,
            username: credential.username,
            password: credential.password,
            isResend: true
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          alert(`✅ Credentials resent successfully to ${credential.studentEmail}!`);
        } else {
          throw new Error(result.message);
        }
      } catch (error: any) {
        alert(`❌ Failed to resend credentials: ${error.message}`);
      }
    }
  }

  // Filter students
  const filteredStudents = paymentStudents.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Filter credentials
  const filteredCredentials = studentCredentials.filter(cred => 
    cred.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cred.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cred.studentEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const totalSubmissions = paymentStudents.length;
  const pendingVerifications = paymentStudents.filter(s => s.status === 'pending').length;
  const verifiedPayments = paymentStudents.filter(s => s.status === 'verified').length;
  const rejectedPayments = paymentStudents.filter(s => s.status === 'rejected').length;
  const totalRevenue = paymentStudents.reduce((sum, student) => {
    const amountStr = student.amount.replace('PKR ', '').replace(/,/g, '');
    const amount = parseFloat(amountStr) || 25000;
    return sum + amount;
  }, 0);
  const sentCredentials = studentCredentials.filter(c => c.status === 'sent').length;
  const failedCredentials = studentCredentials.filter(c => c.status === 'failed').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading payment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Submissions</h1>
          <p className="text-gray-600 mt-1">Manage student payment verifications</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (confirm('Clear all localStorage data?')) {
                localStorage.removeItem('studentCredentials');
                localStorage.removeItem('uploadedFiles');
                localStorage.removeItem('paymentSubmission');
                alert('LocalStorage cleared!');
                loadDataFromLocalStorage();
              }
            }}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
          >
            Clear Data
          </button>
          <button
            onClick={loadDataFromLocalStorage}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Submissions</p>
              <p className="text-2xl font-bold mt-2">{totalSubmissions}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Verification</p>
              <p className="text-2xl font-bold mt-2">{pendingVerifications}</p>
            </div>
            <div className="p-3 rounded-full bg-amber-100 text-amber-600">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Verified Payments</p>
              <p className="text-2xl font-bold mt-2">{verifiedPayments}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold mt-2">PKR {totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Credentials Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Sent Credentials</p>
              <p className="text-2xl font-bold mt-2">{sentCredentials}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Mail className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Failed Credentials</p>
              <p className="text-2xl font-bold mt-2">{failedCredentials}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Rejected Payments</p>
              <p className="text-2xl font-bold mt-2">{rejectedPayments}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <X className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, course, email, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
              />
            </div>
          </div>
          
          <div className="w-full md:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Students Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Payment Submissions</h2>
          <span className="text-sm text-gray-500">
            Showing {filteredStudents.length} of {paymentStudents.length} students
          </span>
        </div>
        
        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Student</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Course</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Transaction ID</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Screenshot</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                        <p className="text-xs text-gray-400">{student.phone}</p>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <span className="font-medium">{student.course}</span>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-bold text-green-600">{student.amount}</p>
                        <p className="text-sm text-gray-500">{student.paymentMethod}</p>
                        <p className="text-xs text-gray-400">{student.paymentDate}</p>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {student.transactionId}
                      </p>
                    </td>
                    
                    <td className="py-4 px-6">
                      {student.screenshotUrl && student.screenshotUrl.length > 100 ? (
                        <button
                          onClick={() => viewScreenshot(student)}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <ImageIcon className="w-4 h-4" />
                          <span className="text-sm font-medium">View Screenshot</span>
                        </button>
                      ) : (
                        <span className="text-sm text-gray-500">No screenshot</span>
                      )}
                    </td>
                    
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        student.status === 'verified' 
                          ? 'bg-green-100 text-green-800'
                          : student.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </span>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        {student.screenshotUrl && student.screenshotUrl.length > 100 && (
                          <>
                            <button
                              onClick={() => viewScreenshot(student)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Screenshot"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => downloadScreenshot(student)}
                              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                              title="Download Screenshot"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {student.status === 'pending' && (
                          <button
                            onClick={() => sendCredentialsToStudent(student)}
                            disabled={isSendingCredentials === student.id}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSendingCredentials === student.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4" />
                                Verify & Send Credentials
                              </>
                            )}
                          </button>
                        )}
                        
                        {student.status === 'pending' && (
                          <button
                            onClick={() => {
                              if (confirm(`Reject payment from ${student.name}?`)) {
                                handleRejectPayment(student.id);
                              }
                            }}
                            className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                          >
                            Reject
                          </button>
                        )}
                        
                        {student.status === 'verified' && (
                          <span className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg font-medium">
                            ✓ Verified
                          </span>
                        )}
                        
                        {student.status === 'rejected' && (
                          <span className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg font-medium">
                            ✗ Rejected
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No matching payments found' : 'No payment submissions yet'}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm 
                ? 'Try a different search term' 
                : 'Students will appear here after they upload payment screenshots'}
            </p>
            
            {!searchTerm && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <h4 className="font-medium text-blue-800 mb-2">How to test the system:</h4>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal pl-4">
                  <li>Go to any course page</li>
                  <li>Click &quot;Enroll Now&quot; button</li>
                  <li>Fill the enrollment form</li>
                  <li>Download payment voucher</li>
                  <li>Upload payment screenshot (JPG/PNG)</li>
                  <li>Come back here and click &ldquo;Refresh&ldquo;</li>
                </ol>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sent Credentials Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Sent Credentials</h2>
          <span className="text-sm text-gray-500">
            {studentCredentials.length} credentials stored
          </span>
        </div>
        
        {studentCredentials.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Student</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Course</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Credentials</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Sent Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              
              <tbody>
                {filteredCredentials.map((credential) => (
                  <tr key={credential.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{credential.studentName}</p>
                        <p className="text-sm text-gray-500">{credential.studentEmail}</p>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <span className="font-medium">{credential.course}</span>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="text-gray-500">Username: </span>
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">{credential.username}</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-gray-500">Password: </span>
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">{credential.password}</span>
                        </p>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-600">
                        {new Date(credential.sentDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(credential.sentDate).toLocaleTimeString()}
                      </p>
                    </td>
                    
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        credential.status === 'sent' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {credential.status.charAt(0).toUpperCase() + credential.status.slice(1)}
                      </span>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewCredentials(credential)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {credential.status === 'sent' && (
                          <button
                            onClick={() => resendCredentials(credential)}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                            title="Resend Credentials"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            if (confirm(`Copy credentials for ${credential.studentName} to clipboard?`)) {
                              const text = `Username: ${credential.username}\nPassword: ${credential.password}`;
                              navigator.clipboard.writeText(text);
                              alert('Credentials copied to clipboard!');
                            }
                          }}
                          className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Copy Credentials"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Key className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No credentials sent yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Verify a payment to send login credentials to students
            </p>
          </div>
        )}
      </div>

      {/* Screenshot Modal */}
      {showScreenshotModal && selectedScreenshot && selectedStudentDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Payment Screenshot - {selectedStudentDetails.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Transaction ID: {selectedStudentDetails.transactionId}
                </p>
              </div>
              <button
                onClick={() => setShowScreenshotModal(false)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
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
                      onError={(e) => {
                        console.error("❌ Image failed to load:", selectedScreenshot?.substring(0, 100));
                        e.currentTarget.src = 'https://via.placeholder.com/500x300?text=Image+Failed+to+Load';
                      }}
                    />
                  </div>
                  <div className="mt-4 flex justify-center space-x-4">
                    <button
                      onClick={() => downloadScreenshot(selectedStudentDetails)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Screenshot
                    </button>
                  </div>
                </div>
                
                <div className="lg:w-1/3">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Payment Details</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Student Name</p>
                        <p className="font-medium">{selectedStudentDetails.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Course</p>
                        <p className="font-medium">{selectedStudentDetails.course}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-medium text-green-600">{selectedStudentDetails.amount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Payment Method</p>
                        <p className="font-medium">{selectedStudentDetails.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Transaction ID</p>
                        <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {selectedStudentDetails.transactionId}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          selectedStudentDetails.status === 'verified' 
                            ? 'bg-green-100 text-green-800'
                            : selectedStudentDetails.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {selectedStudentDetails.status.charAt(0).toUpperCase() + selectedStudentDetails.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      {selectedStudentDetails.status === 'pending' && (
                        <button
                          onClick={() => {
                            sendCredentialsToStudent(selectedStudentDetails);
                            setShowScreenshotModal(false);
                          }}
                          disabled={isSendingCredentials === selectedStudentDetails.id}
                          className="w-full py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isSendingCredentials === selectedStudentDetails.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Sending Credentials...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Verify & Send Credentials
                            </>
                          )}
                        </button>
                      )}
                      
                      {selectedStudentDetails.status === 'pending' && (
                        <button
                          onClick={() => {
                            if (confirm(`Reject payment from ${selectedStudentDetails.name}?`)) {
                              handleRejectPayment(selectedStudentDetails.id);
                              setShowScreenshotModal(false);
                            }
                          }}
                          className="w-full py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                          ✗ Reject Payment
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Details Modal */}
      {showCredentialsModal && selectedCredentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Credentials Details
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedCredentials.studentName}
                </p>
              </div>
              <button
                onClick={() => setShowCredentialsModal(false)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Student Name</p>
                  <p className="font-medium">{selectedCredentials.studentName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedCredentials.studentEmail}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Course</p>
                  <p className="font-medium">{selectedCredentials.course}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Login Credentials</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Username</p>
                      <p className="font-mono text-lg bg-white px-3 py-2 rounded border">
                        {selectedCredentials.username}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Password</p>
                      <p className="font-mono text-lg bg-white px-3 py-2 rounded border">
                        {selectedCredentials.password}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Sent Date</p>
                  <p className="font-medium">
                    {new Date(selectedCredentials.sentDate).toLocaleDateString()} at{' '}
                    {new Date(selectedCredentials.sentDate).toLocaleTimeString()}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    selectedCredentials.status === 'sent' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedCredentials.status.charAt(0).toUpperCase() + selectedCredentials.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    const text = `Username: ${selectedCredentials.username}\nPassword: ${selectedCredentials.password}`;
                    navigator.clipboard.writeText(text);
                    alert('Credentials copied to clipboard!');
                  }}
                  className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  Copy Credentials
                </button>
                
                {selectedCredentials.status === 'sent' && (
                  <button
                    onClick={() => {
                      resendCredentials(selectedCredentials);
                      setShowCredentialsModal(false);
                    }}
                    className="flex-1 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Resend
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}