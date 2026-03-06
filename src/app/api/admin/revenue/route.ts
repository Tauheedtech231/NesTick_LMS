// /app/api/admin/revenue/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function GET(request: NextRequest) {
  let connection;
  try {
    connection = await getConnection();

    // Your exact working query
    const [rows] = await connection.execute(`
      SELECT 
          COALESCE(SUM(course_price), 0) as total_revenue,
          COALESCE(AVG(course_price), 0) as avg_course_price,
          COUNT(DISTINCT student_email) as paying_students,
          COUNT(*) as verified_enrollments
      FROM enrollments
      WHERE payment_status = 'verified'
        AND status = 'active'
    `);

    const revenue = (rows as any[])[0] || {
      total_revenue: 0,
      avg_course_price: 0,
      paying_students: 0,
      verified_enrollments: 0
    };

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: parseFloat(revenue.total_revenue),
        averagePrice: parseFloat(revenue.avg_course_price),
        payingStudents: parseInt(revenue.paying_students),
        verifiedEnrollments: parseInt(revenue.verified_enrollments)
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching revenue:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}