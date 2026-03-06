'use client';

import { useState, useEffect } from 'react';
import {
  HiCurrencyDollar,
  HiTrendingUp,
  HiUsers,
  HiShoppingCart,
  HiRefresh,
  HiChartBar,
  HiCalendar,

  HiCheckCircle,
  HiClock,
  
} from 'react-icons/hi';
import { Loader2 } from 'lucide-react';
/* eslint-disable */
const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  teal: '#1FB6C9'
};

interface DashboardStats {
  totalEnrollments: number;
  totalStudents: number;
  verifiedCount: number;
  pendingCount: number;
  totalRevenue: number;
  avgRevenue: number;
  maxPayment: number;
  minPayment: number;
}

interface MonthlyData {
  month: string;
  transactions: number;
  students: number;
  revenue: number;
  average: number;
  payment_method: string;
}

interface CourseData {
  course_id: string;
  course_title: string;
  enrollments: number;
  unique_students: number;
  revenue: number;
  avg_price: number;
}

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [courseData, setCourseData] = useState<CourseData[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);

  const fetchReports = async (type: string = 'dashboard', showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    
    setError(null);

    try {
      const response = await fetch(`/api/admin/reports?type=${type}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch reports');
      }

      if (result.success) {
        if (type === 'dashboard') {
          setDashboardStats(result.data);
        } else if (type === 'monthly') {
          setMonthlyData(result.data || []);
        } else if (type === 'courses') {
          setCourseData(result.data || []);
        } else if (type === 'status') {
          setStatusData(result.data || []);
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports('dashboard');
    fetchReports('monthly');
    fetchReports('courses');
    fetchReports('status');
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReports(activeTab, true);
    fetchReports('monthly', true);
    fetchReports('courses', true);
    fetchReports('status', true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatMonth = (monthStr: string) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-PK', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: BRAND_COLORS.deepRed }} />
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                Reports & Analytics
              </h1>
              <p className="text-gray-600 mt-2">Real-time insights from your enrollment data</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 text-sm transition-colors disabled:opacity-50"
              style={{ backgroundColor: BRAND_COLORS.deepRed }}
            >
              <HiRefresh className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              Error: {error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <HiChartBar className="inline w-4 h-4 mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'monthly'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <HiCalendar className="inline w-4 h-4 mr-2" />
              Monthly Revenue
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'courses'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <HiShoppingCart className="inline w-4 h-4 mr-2" />
              Course Revenue
            </button>
          </div>
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && dashboardStats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                      {formatCurrency(dashboardStats.totalRevenue)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}20` }}>
                    <HiCurrencyDollar className="w-5 h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Enrollments</p>
                    <p className="text-2xl font-bold mt-1 text-green-600">{dashboardStats.totalEnrollments}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-100">
                    <HiShoppingCart className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Unique Students</p>
                    <p className="text-2xl font-bold mt-1 text-purple-600">{dashboardStats.totalStudents}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-100">
                    <HiUsers className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Average Revenue</p>
                    <p className="text-2xl font-bold mt-1 text-amber-600">{formatCurrency(dashboardStats.avgRevenue)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-100">
                    <HiTrendingUp className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>Payment Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <HiCheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Verified</span>
                    </div>
                    <span className="font-bold text-green-600">{dashboardStats.verifiedCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <HiClock className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium">Pending</span>
                    </div>
                    <span className="font-bold text-yellow-600">{dashboardStats.pendingCount}</span>
                  </div>
                </div>
              </div>

              {/* Payment Range */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>Payment Range</h3>
                <div className="space-y-4">
                  <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Highest Payment</span>
                    <span className="font-bold text-blue-600">{formatCurrency(dashboardStats.maxPayment)}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Lowest Payment</span>
                    <span className="font-bold text-gray-600">{formatCurrency(dashboardStats.minPayment)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MONTHLY TAB */}
        {activeTab === 'monthly' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>Monthly Revenue Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transactions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Average</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {monthlyData.length > 0 ? (
                    monthlyData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {formatMonth(item.month)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.transactions}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.students}</td>
                        <td className="px-6 py-4 text-sm font-medium text-green-600">
                          {formatCurrency(item.revenue)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatCurrency(item.average)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No monthly data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* COURSES TAB */}
        {activeTab === 'courses' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>Course-wise Revenue</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrollments</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {courseData.length > 0 ? (
                    courseData.map((course) => (
                      <tr key={course.course_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {course.course_title}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{course.enrollments}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{course.unique_students}</td>
                        <td className="px-6 py-4 text-sm font-medium text-green-600">
                          {formatCurrency(course.revenue)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatCurrency(course.avg_price)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No course data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}