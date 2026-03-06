import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'dashboard';

    connection = await getConnection();

    // DASHBOARD SUMMARY - All stats in one query
    if (reportType === 'dashboard') {
      const [dashboardStats] = await connection.execute(`
        SELECT 
          COUNT(*) as total_enrollments,
          COUNT(DISTINCT student_email) as total_students,
          SUM(CASE WHEN payment_status = 'verified' THEN 1 ELSE 0 END) as verified_count,
          SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending_count,
          SUM(CASE WHEN payment_status = 'verified' THEN payment_amount ELSE 0 END) as total_revenue,
          AVG(CASE WHEN payment_status = 'verified' THEN payment_amount END) as avg_revenue,
          MAX(payment_amount) as max_payment,
          MIN(payment_amount) as min_payment
        FROM enrollments 
        WHERE status = 'active'
      `);

      const stats = (dashboardStats as any[])[0] || {};
      
      return NextResponse.json({
        success: true,
        data: {
          totalEnrollments: stats.total_enrollments || 0,
          totalStudents: stats.total_students || 0,
          verifiedCount: stats.verified_count || 0,
          pendingCount: stats.pending_count || 0,
          totalRevenue: stats.total_revenue || 0,
          avgRevenue: Math.round(stats.avg_revenue || 0),
          maxPayment: stats.max_payment || 0,
          minPayment: stats.min_payment || 0
        }
      });
    }

    // MONTHLY REVENUE REPORT
    else if (reportType === 'monthly') {
      const [monthlyData] = await connection.execute(`
        SELECT 
          DATE_FORMAT(payment_date, '%Y-%m') as month,
          COUNT(DISTINCT id) as transactions,
          COUNT(DISTINCT student_email) as students,
          SUM(payment_amount) as revenue,
          AVG(payment_amount) as average,
          'Bank Transfer' as payment_method
        FROM enrollments 
        WHERE payment_status = 'verified' 
          AND status = 'active'
          AND payment_amount > 0
          AND payment_date IS NOT NULL
        GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
        ORDER BY month DESC
      `);

      return NextResponse.json({
        success: true,
        data: monthlyData
      });
    }

    // COURSE WISE REVENUE
    else if (reportType === 'courses') {
      const [courseData] = await connection.execute(`
        SELECT 
          course_id,
          course_title,
          COUNT(*) as enrollments,
          COUNT(DISTINCT student_email) as unique_students,
          SUM(payment_amount) as revenue,
          AVG(payment_amount) as avg_price
        FROM enrollments 
        WHERE payment_status = 'verified' 
          AND status = 'active'
        GROUP BY course_id, course_title
        ORDER BY revenue DESC
      `);

      return NextResponse.json({
        success: true,
        data: courseData
      });
    }

    // PAYMENT STATUS BREAKDOWN
    else if (reportType === 'status') {
      const [statusData] = await connection.execute(`
        SELECT 
          payment_status,
          COUNT(*) as transaction_count,
          COUNT(DISTINCT student_email) as unique_students,
          SUM(payment_amount) as total_revenue,
          AVG(payment_amount) as avg_amount
        FROM enrollments 
        WHERE status = 'active'
          AND payment_amount > 0
        GROUP BY payment_status
        ORDER BY total_revenue DESC
      `);

      return NextResponse.json({
        success: true,
        data: statusData
      });
    }

    // DAILY REVENUE (Last 30 days)
    else if (reportType === 'daily') {
      const [dailyData] = await connection.execute(`
        SELECT 
          DATE(payment_date) as date,
          COUNT(*) as enrollments,
          SUM(payment_amount) as revenue
        FROM enrollments 
        WHERE payment_status = 'verified' 
          AND status = 'active'
          AND payment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE(payment_date)
        ORDER BY date DESC
      `);

      return NextResponse.json({
        success: true,
        data: dailyData
      });
    }

    // DEFAULT: Return all reports
    else {
      const [dashboard] = await connection.execute(`
        SELECT 
          COUNT(*) as total_enrollments,
          COUNT(DISTINCT student_email) as total_students,
          SUM(CASE WHEN payment_status = 'verified' THEN 1 ELSE 0 END) as verified_count,
          SUM(CASE WHEN payment_status = 'verified' THEN payment_amount ELSE 0 END) as total_revenue
        FROM enrollments 
        WHERE status = 'active'
      `);

      const [monthly] = await connection.execute(`
        SELECT 
          DATE_FORMAT(payment_date, '%Y-%m') as month,
          SUM(payment_amount) as revenue
        FROM enrollments 
        WHERE payment_status = 'verified' 
          AND status = 'active'
          AND payment_date IS NOT NULL
        GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
        ORDER BY month DESC
        LIMIT 6
      `);

      return NextResponse.json({
        success: true,
        data: {
          summary: (dashboard as any[])[0] || {},
          recentMonths: monthly
        }
      });
    }

  } catch (error: any) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch reports',
        data: null 
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}