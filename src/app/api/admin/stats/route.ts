import {  NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function GET() {
  let connection;
  try {
    console.log('🔍 Fetching dashboard stats...');

    connection = await getConnection();

    const [rows] = await connection.execute(`
      SELECT 
        (SELECT COUNT(*) FROM enrollments) as totalEnrollments,
        (SELECT COUNT(*) FROM enrollments WHERE payment_status = 'pending') as pendingPayments,
        (SELECT COUNT(*) FROM enrollments WHERE payment_status = 'verified') as verifiedPayments,
        (SELECT COUNT(*) FROM enrollments WHERE payment_status = 'failed') as rejectedPayments,
        (SELECT COALESCE(SUM(payment_amount), 0) FROM enrollments WHERE payment_status = 'verified') as totalRevenue,
        (SELECT COUNT(*) FROM enrollments WHERE payment_status = 'verified') as sentCredentials,
        (SELECT COUNT(*) FROM enrollments WHERE payment_status = 'failed') as failedCredentials
    `);

    const stats = (rows as any[])[0] || {
      totalEnrollments: 0,
      pendingPayments: 0,
      verifiedPayments: 0,
      rejectedPayments: 0,
      totalRevenue: 0,
      sentCredentials: 0,
      failedCredentials: 0
    };

    console.log('✅ Stats fetched:', stats);

    return NextResponse.json({ 
      success: true, 
      data: stats
    });

  } catch (error: any) {
    console.error('❌ Error fetching stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch stats',
        data: {
          totalEnrollments: 0,
          pendingPayments: 0,
          verifiedPayments: 0,
          rejectedPayments: 0,
          totalRevenue: 0,
          sentCredentials: 0,
          failedCredentials: 0
        }
      }, 
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}