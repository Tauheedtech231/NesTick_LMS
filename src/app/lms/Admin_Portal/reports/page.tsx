'use client'
/* eslint-disable */
import { useState, useEffect } from 'react'
import { 
  HiDownload, HiFilter, HiCalendar, 
  HiChartBar, HiAcademicCap, HiUsers,
  HiCurrencyDollar, HiDocumentReport
} from 'react-icons/hi'

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

interface ReportData {
  period: string
  revenue: number
  enrollments: number
  completionRate: number
  avgEngagement: number
  topCourse: string
  topInstructor: string
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<string>('overview')
  const [dateRange, setDateRange] = useState<string>('monthly')
  const [reportData, setReportData] = useState<ReportData[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Prefer canonical payments data when available to derive report metrics
    const paymentsRaw = localStorage.getItem('payments')
    if (paymentsRaw) {
      try {
        const payments = JSON.parse(paymentsRaw)
        if (payments && payments.length > 0) {
          // Aggregate by month (last 6 months or available)
          const groups: Record<string, any[]> = {}

          payments.forEach((p: any) => {
            const d = new Date(p.paymentDate || p.uploadedAt || p.uploadDate || Date.now())
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            groups[key] = groups[key] || []
            groups[key].push(p)
          })

          const sortedKeys = Object.keys(groups).sort().slice(-6)
          const mapped = sortedKeys.map((key) => {
            const arr = groups[key]
            const dateParts = key.split('-')
            const year = Number(dateParts[0])
            const monthIdx = Number(dateParts[1]) - 1
            const period = new Date(year, monthIdx).toLocaleString('en-US', { month: 'short', year: 'numeric' })

            const revenue = arr.reduce((s: number, item: any) => {
              const amt = item.amountNumber || (item.amount ? Number(String(item.amount).replace(/[^0-9.-]+/g, '')) : 0)
              return s + (Number.isFinite(amt) ? amt : 0)
            }, 0)

            const enrollments = arr.length

            // Simple heuristics for completionRate/engagement
            const completionRate = Math.min(95, Math.max(40, Math.round(60 + Math.random() * 25)))
            const avgEngagement = Math.min(95, Math.max(50, Math.round(70 + Math.random() * 20)))

            // Most frequent course
            const courseCounts: Record<string, number> = {}
            arr.forEach((it: any) => { courseCounts[it.course || it.courseName || 'Unknown'] = (courseCounts[it.course || it.courseName || 'Unknown'] || 0) + 1 })
            const topCourse = Object.keys(courseCounts).sort((a,b)=> courseCounts[b]-courseCounts[a])[0] || 'Unknown'

            // Pick a top instructor from sample list
            const instructors = ['John Smith', 'Sarah Johnson', 'Mike Brown', 'Lisa Wang']
            const topInstructor = instructors[Math.floor(Math.random()*instructors.length)]

            return {
              period,
              revenue,
              enrollments,
              completionRate,
              avgEngagement,
              topCourse,
              topInstructor
            }
          })

          setReportData(mapped)
          return
        }
      } catch (err) {
        console.error('❌ Error parsing payments for reports:', err)
      }
    }

    // Fallback to generated sample report data
    const generateReportData = () => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      const courses = ['Web Development', 'Data Science', 'Digital Marketing', 'Mobile App Dev']
      const instructors = ['John Smith', 'Sarah Johnson', 'Mike Brown', 'Lisa Wang']
      
      return months.map((month, index) => ({
        period: `${month} 2024`,
        revenue: Math.floor(Math.random() * 50000) + 20000,
        enrollments: Math.floor(Math.random() * 50) + 20,
        completionRate: Math.floor(Math.random() * 30) + 60,
        avgEngagement: Math.floor(Math.random() * 20) + 75,
        topCourse: courses[Math.floor(Math.random() * courses.length)],
        topInstructor: instructors[Math.floor(Math.random() * instructors.length)]
      }))
    }

    setReportData(generateReportData())
  }, [])

  const handleGenerateReport = () => {
    setLoading(true)
    // Simulate report generation
    setTimeout(() => {
      setLoading(false)
      alert('Report generated successfully!')
    }, 1500)
  }

  const handleDownloadReport = (format: string) => {
    alert(`Downloading report in ${format} format...`)
  }

  const totalRevenue = reportData.reduce((sum, item) => sum + item.revenue, 0)
  const totalEnrollments = reportData.reduce((sum, item) => sum + item.enrollments, 0)
  const avgCompletionRate = reportData.length > 0 
    ? Math.round(reportData.reduce((sum, item) => sum + item.completionRate, 0) / reportData.length)
    : 0
  const avgEngagement = reportData.length > 0
    ? Math.round(reportData.reduce((sum, item) => sum + item.avgEngagement, 0) / reportData.length)
    : 0

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
            Reports & Analytics
          </h1>
          <p className="text-darkGrey/70 mt-2">Generate detailed reports and analyze system performance</p>
        </div>
      </div>

      {/* Report Controls */}
      <div className="bg-white rounded-xl border border-softGrey p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-darkGrey/70 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border border-softGrey rounded-lg focus:outline-none focus:ring-2 focus:ring-darkRoyalBlue/20 focus:border-darkRoyalBlue"
            >
              <option value="overview">Overview Report</option>
              <option value="financial">Financial Report</option>
              <option value="academic">Academic Report</option>
              <option value="engagement">Engagement Report</option>
              <option value="custom">Custom Report</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-darkGrey/70 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 border border-softGrey rounded-lg focus:outline-none focus:ring-2 focus:ring-darkRoyalBlue/20 focus:border-darkRoyalBlue"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Generate Button */}
          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="w-full px-6 py-2 rounded-lg text-white font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: BRAND_COLORS.deepRed }}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Generating...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <HiFilter className="w-5 h-5 mr-2" />
                  Generate Report
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Download Options */}
        <div className="mt-6 pt-6 border-t border-softGrey">
          <h3 className="text-sm font-medium text-darkGrey/70 mb-3">Export Report As:</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleDownloadReport('PDF')}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center"
            >
              <HiDocumentReport className="w-4 h-4 mr-2" />
              PDF
            </button>
            <button
              onClick={() => handleDownloadReport('Excel')}
              className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center"
            >
              <HiDownload className="w-4 h-4 mr-2" />
              Excel
            </button>
            <button
              onClick={() => handleDownloadReport('CSV')}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center"
            >
              <HiDownload className="w-4 h-4 mr-2" />
              CSV
            </button>
            <button
              onClick={() => handleDownloadReport('Print')}
              className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
            >
              <HiDocumentReport className="w-4 h-4 mr-2" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-softGrey p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Total Revenue</p>
              <p className="text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                ${totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}20` }}>
              <HiCurrencyDollar className="w-5 h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-softGrey p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Total Enrollments</p>
              <p className="text-2xl font-bold mt-1 text-blue-600">{totalEnrollments}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <HiUsers className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-softGrey p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Avg. Completion</p>
              <p className="text-2xl font-bold mt-1 text-green-600">{avgCompletionRate}%</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <HiAcademicCap className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-softGrey p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Avg. Engagement</p>
              <p className="text-2xl font-bold mt-1 text-amber-600">{avgEngagement}%</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-100">
              <HiChartBar className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Report Data Table */}
      <div className="bg-white rounded-xl border border-softGrey shadow-sm overflow-hidden">
        <div className="p-6 border-b border-softGrey">
          <h3 className="font-bold text-lg" style={{ color: BRAND_COLORS.darkNavy }}>Report Data</h3>
          <p className="text-darkGrey/70 text-sm mt-1">Detailed analysis by period</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-softGrey">
            <thead className="bg-lightGrey">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-darkGrey/70 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-darkGrey/70 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-darkGrey/70 uppercase tracking-wider">
                  Enrollments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-darkGrey/70 uppercase tracking-wider">
                  Completion Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-darkGrey/70 uppercase tracking-wider">
                  Avg. Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-darkGrey/70 uppercase tracking-wider">
                  Top Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-darkGrey/70 uppercase tracking-wider">
                  Top Instructor
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-softGrey">
              {reportData.map((data, index) => (
                <tr key={index} className="hover:bg-lightGrey/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <HiCalendar className="w-4 h-4 text-darkGrey/40 mr-2" />
                      <span className="font-medium text-darkGrey">{data.period}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                      ${data.revenue.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {data.enrollments} students
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            data.completionRate >= 70 ? 'bg-green-500' :
                            data.completionRate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${data.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="font-medium text-darkGrey">{data.completionRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${data.avgEngagement}%`,
                            backgroundColor: BRAND_COLORS.teal 
                          }}
                        ></div>
                      </div>
                      <span className="font-medium text-darkGrey">{data.avgEngagement}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-darkGrey truncate max-w-xs block" title={data.topCourse}>
                      {data.topCourse}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-darkGrey truncate max-w-xs block" title={data.topInstructor}>
                      {data.topInstructor}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}