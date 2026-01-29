'use client'

import { useState, useEffect } from 'react'
import { 
  HiDownload, HiFilter, HiCalendar, 
  HiChartBar, HiAcademicCap, HiUsers,
  HiCurrencyDollar, HiDocumentReport
} from 'react-icons/hi'

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
    // Generate sample report data
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">Generate detailed reports and analyze system performance</p>
      </div>

      {/* Report Controls */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              className="w-full px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Export Report As:</h3>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
              <HiCurrencyDollar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Enrollments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalEnrollments}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
              <HiUsers className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Avg. Completion</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{avgCompletionRate}%</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
              <HiAcademicCap className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Avg. Engagement</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{avgEngagement}%</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center">
              <HiChartBar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Report Data Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-bold text-gray-900">Report Data</h3>
          <p className="text-gray-600 text-sm mt-1">Detailed analysis by period</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completion Rate
                </th>
                <th className="px6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Top Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Top Instructor
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.map((data, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <HiCalendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{data.period}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-gray-900">
                      ${data.revenue.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {data.enrollments} students
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            data.completionRate >= 70 ? 'bg-green-500' :
                            data.completionRate >= 50 ? 'bg-amber-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${data.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="font-medium text-gray-900">{data.completionRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                          style={{ width: `${data.avgEngagement}%` }}
                        ></div>
                      </div>
                      <span className="font-medium text-gray-900">{data.avgEngagement}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900 truncate max-w-xs">{data.topCourse}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900 truncate max-w-xs">{data.topInstructor}</div>
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