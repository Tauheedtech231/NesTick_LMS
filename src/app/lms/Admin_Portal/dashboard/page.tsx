'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  BookOpen,
  Users,
  UserCircle,
  TrendingUp,
  Clock,
  MessageSquare,
  CheckCircle,
  ChevronRight,
  AlertCircle,
  DollarSign,
  FileText,
  BarChart3
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Graph component imports
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts'

// Type definitions
type Activity = {
  id: number;
  title: string;
  description: string;
  time: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
}

type MonthlyData = {
  month: string;
  students: number;
  revenue: number;
  courses: number;
}

type WeeklyEngagement = {
  day: string;
  engagement: number;
  completion: number;
}

type GraphData = {
  monthlyData: MonthlyData[];
  weeklyEngagement: WeeklyEngagement[];
}

type DashboardData = {
  totalCourses: number;
  totalStudents: number;
  totalInstructors: number;
  totalPayments: number;
  pendingPayments: number;
  completedModules: number;
  averageEngagement: number;
  recentActivities: Activity[];
}

type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any;
  }>;
}

// Custom Tooltip Components
const CustomBarTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-sm rounded-lg">
        <p className="font-medium text-gray-900">Monthly Revenue</p>
        <p className="text-sm text-gray-600">
          Amount: <span className="font-medium">₹{payload[0].value?.toLocaleString('en-IN')}</span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomLineTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-sm rounded-lg">
        <p className="font-medium text-gray-900 mb-2">Performance Metrics</p>
        {payload.map((entry, index: number) => (
          <p key={index} className="text-sm text-gray-600" style={{ color: entry.color }}>
            {entry.name}: <span className="font-medium">{entry.value}%</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalCourses: 12,
    totalStudents: 156,
    totalInstructors: 8,
    totalPayments: 42,
    pendingPayments: 5,
    completedModules: 87,
    averageEngagement: 78,
    recentActivities: []
  })

  const [isLoading, setIsLoading] = useState(false)
  const [graphData, setGraphData] = useState<GraphData>({
    monthlyData: [],
    weeklyEngagement: []
  })

  useEffect(() => {
    // Simulate data loading
    setIsLoading(true)
    const timer = setTimeout(() => {
      const activities: Activity[] = [
        {
          id: 1,
          title: 'New student registration',
          description: 'John Doe enrolled in Web Development',
          time: '10 minutes ago',
          icon: Users,
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-100'
        },
        {
          id: 2,
          title: 'Payment received',
          description: '₹5,000 payment from Sarah Smith',
          time: '1 hour ago',
          icon: DollarSign,
          iconColor: 'text-green-600',
          bgColor: 'bg-green-100'
        },
        {
          id: 3,
          title: 'Course published',
          description: 'React Advanced course now live',
          time: '2 hours ago',
          icon: BookOpen,
          iconColor: 'text-purple-600',
          bgColor: 'bg-purple-100'
        },
        {
          id: 4,
          title: 'Assignment submitted',
          description: '25 new submissions in Python 101',
          time: '3 hours ago',
          icon: FileText,
          iconColor: 'text-amber-600',
          bgColor: 'bg-amber-100'
        }
      ]

      // Graph data
      const monthlyData: MonthlyData[] = [
        { month: 'Jan', students: 120, revenue: 450000, courses: 8 },
        { month: 'Feb', students: 135, revenue: 520000, courses: 10 },
        { month: 'Mar', students: 142, revenue: 580000, courses: 11 },
        { month: 'Apr', students: 156, revenue: 620000, courses: 12 },
        { month: 'May', students: 165, revenue: 680000, courses: 13 },
        { month: 'Jun', students: 180, revenue: 750000, courses: 14 },
      ]

      const weeklyEngagement: WeeklyEngagement[] = [
        { day: 'Mon', engagement: 72, completion: 65 },
        { day: 'Tue', engagement: 78, completion: 70 },
        { day: 'Wed', engagement: 82, completion: 75 },
        { day: 'Thu', engagement: 85, completion: 78 },
        { day: 'Fri', engagement: 80, completion: 72 },
        { day: 'Sat', engagement: 75, completion: 68 },
        { day: 'Sun', engagement: 68, completion: 62 },
      ]

      setDashboardData(prev => ({
        ...prev,
        recentActivities: activities
      }))
      
      setGraphData({ 
        monthlyData, 
        weeklyEngagement 
      })
      
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const stats = [
    {
      title: 'Active Courses',
      value: dashboardData.totalCourses,
      icon: BookOpen,
      iconBgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      change: '+12%',
      changeType: 'increase' as const,
      trend: 'from last month'
    },
    {
      title: 'Active Students',
      value: dashboardData.totalStudents,
      icon: Users,
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      change: '+8%',
      changeType: 'increase' as const,
      trend: 'from last week'
    },
    {
      title: 'Instructors',
      value: dashboardData.totalInstructors,
      icon: UserCircle,
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      change: '+5%',
      changeType: 'increase' as const,
      trend: 'from last month'
    },
    {
      title: 'Total Revenue',
      value: `₹${(dashboardData.totalPayments * 5000).toLocaleString('en-IN')}`,
      icon: DollarSign,
      iconBgColor: 'bg-amber-100',
      iconColor: 'text-amber-600',
      change: '+15%',
      changeType: 'increase' as const,
      trend: 'from last quarter'
    }
  ]

  const quickActions = [
    {
      title: 'Add Course',
      description: 'Create new course',
      href: '/lms/Admin_Portal/courses/add',
      icon: BookOpen,
      iconBgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Manage Students',
      description: 'View all students',
      href: '/lms/Admin_Portal/students',
      icon: Users,
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Track Payments',
      description: 'Monitor transactions',
      href: '/lms/Admin_Portal/payments',
      icon: TrendingUp,
      iconBgColor: 'bg-amber-100',
      iconColor: 'text-amber-600'
    },
    {
      title: 'Generate Reports',
      description: 'Create insights',
      href: '/lms/Admin_Portal/reports',
      icon: BarChart3,
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    }
  ]

  const performanceMetrics = [
    {
      title: 'Student Engagement',
      value: `${dashboardData.averageEngagement}%`,
      percentage: dashboardData.averageEngagement,
      color: 'from-blue-500 to-blue-700',
      bgColor: 'bg-blue-50',
      icon: TrendingUp,
      iconColor: 'text-blue-600'
    },
    {
      title: 'Module Completion',
      value: `${dashboardData.completedModules}`,
      percentage: Math.min((dashboardData.completedModules / 100) * 100, 100),
      color: 'from-green-500 to-green-700',
      bgColor: 'bg-green-50',
      icon: CheckCircle,
      iconColor: 'text-green-600'
    }
  ]

  const summaryItems = [
    {
      title: 'Pending Approvals',
      value: dashboardData.pendingPayments,
      icon: AlertCircle,
      iconBgColor: 'bg-amber-100',
      iconColor: 'text-amber-600'
    },
    {
      title: 'New Messages',
      value: 8,
      icon: MessageSquare,
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Active Sessions',
      value: 156,
      icon: Clock,
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    }
  ]

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  {stats.map((stat, index) => {
    const IconComponent = stat.icon;
    return (
      <div 
        key={index} 
        className="bg-white rounded-xl border border-gray-200 p-5 shadow-md  transition-shadow duration-200"
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
          <div className={`p-2 rounded-lg ${stat.iconBgColor} flex items-center justify-center`}>
            <IconComponent className={`w-6 h-6 ${stat.iconColor}`} />
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
        <div className="flex items-center mt-2 text-sm">
          <span className={`mr-2 font-medium ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
            {stat.changeType === 'increase' ? '▲' : '▼'} {stat.change}
          </span>
          <span className="text-gray-500 text-xs">{stat.trend}</span>
        </div>
      </div>
    );
  })}
</div>


      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Actions & Performance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className=" rounded-xl border  p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            </div>
            
           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
  {quickActions.map((action, index) => (
    <Link
      key={index}
      href={action.href}
      className="flex justify-between items-center p-3 rounded-md hover:bg-purple-50 transition-colors duration-200 cursor-pointer"
    >
      <div>
        <h3 className="text-gray-900 font-medium text-base">{action.title}</h3>
        {action.description && (
          <p className="text-gray-500 text-sm mt-0.5">{action.description}</p>
        )}
      </div>
      <span className="text-purple-600 font-bold text-lg">{'>'}</span>
    </Link>
  ))}
</div>

          </div>

          {/* Performance Metrics with Graphs */}
          <div className=" rounded-xl border  p-6 ">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Metrics</h2>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {performanceMetrics.map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <div key={index} className={`p-4 rounded-lg ${metric.bgColor} border border-gray-100`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm text-gray-600">{metric.title}</p>
                        <p className="text-2xl font-semibold text-gray-900 mt-1">{metric.value}</p>
                      </div>
                      <IconComponent className={`w-8 h-8 ${metric.iconColor}`} />
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${metric.color}`}
                        style={{ width: `${metric.percentage}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">{metric.percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Graphs Section */}
            <div className="space-y-8">
              {/* Monthly Revenue */}
              <div className="p-4 border border-gray-100 rounded-lg">
                <h3 className="text-gray-900 font-medium mb-4">Monthly Revenue (₹)</h3>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={graphData.monthlyData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: '#6b7280' }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tickFormatter={(value) => `${value/1000}k`}
                        tick={{ fill: '#6b7280' }}
                      />
                      <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#f5f3ff' }} />
                      <Bar 
                        dataKey="revenue" 
                        fill="#8b5cf6" 
                        radius={[4, 4, 0, 0]} 
                        name="Revenue"
                        barSize={24}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weekly Engagement */}
              <div className="p-4 border border-gray-100 rounded-lg">
                <h3 className="text-gray-900 font-medium mb-4">Weekly Engagement & Completion (%)</h3>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={graphData.weeklyEngagement}
                      margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: '#6b7280' }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        domain={[0, 100]} 
                        tick={{ fill: '#6b7280' }}
                      />
                      <Tooltip content={<CustomLineTooltip />} cursor={{ stroke: '#f3f4f6', strokeWidth: 1 }} />
                      <Line 
                        type="monotone" 
                        dataKey="engagement" 
                        stroke="#8b5cf6" 
                        strokeWidth={2.5} 
                        dot={{ r: 3, fill: '#8b5cf6' }} 
                        activeDot={{ r: 5, fill: '#7c3aed' }} 
                        name="Engagement" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="completion" 
                        stroke="#22c55e" 
                        strokeWidth={2.5} 
                        dot={{ r: 3, fill: '#22c55e' }} 
                        activeDot={{ r: 5, fill: '#16a34a' }} 
                        name="Completion" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Recent Activities & Summary */}
        <div className="space-y-6">
          {/* Recent Activities */}
         <div className="bg-white p-6 rounded-xl">
  <div className="flex items-center justify-between mb-5">
    <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
    
  </div>

  <ul className="space-y-3">
    {dashboardData.recentActivities.length > 0 ? (
      dashboardData.recentActivities.map((activity) => (
        <li key={activity.id} className="flex items-start gap-3">
          {/* Dot as bullet */}
          <span className="w-2 h-2 mt-2 bg-purple-600 rounded-full flex-shrink-0"></span>
          <div>
            <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
            <p className="text-xs text-gray-600 mt-0.5">{activity.description}</p>
            <span className="text-xs text-gray-500 mt-1">{activity.time}</span>
          </div>
        </li>
      ))
    ) : (
      <div className="text-center py-8 text-gray-500 text-sm">
        No recent activities
      </div>
    )}
  </ul>
</div>


          {/* Quick Summary */}
          <div className="bg-white p-6 rounded-xl">
  <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Summary</h2>

  <ul className="space-y-3">
    {summaryItems.map((item, index) => (
      <li key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
        <div className="flex items-center gap-3">
          {/* Checkbox / checkmark */}
          <span className="w-4 h-4 flex items-center justify-center bg-purple-50 border border-purple-300 rounded-sm text-purple-600 font-bold text-xs">
            ✓
          </span>
          <span className="text-gray-700 text-sm">{item.title}</span>
        </div>
        <span className="font-semibold text-gray-900">{item.value}</span>
      </li>
    ))}
  </ul>

  <div className="mt-6">
    <Link href="/lms/Admin_Portal/reports">
      <button className="w-full py-3 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors font-medium text-sm border border-purple-200">
        View Detailed Reports
      </button>
    </Link>
  </div>
</div>

        </div>
      </div>
    </>
  )
}