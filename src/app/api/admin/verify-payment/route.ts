import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function POST(request: NextRequest) {
  let connection;
  try {
    const { enrollmentId, studentId, status } = await request.json();

    console.log('🔍 Verifying payment:', { enrollmentId, studentId, status });

    if (!enrollmentId || !status) {
      return NextResponse.json(
        { success: false, error: 'Enrollment ID and status are required' },
        { status: 400 }
      );
    }

    connection = await getConnection();
    await connection.beginTransaction();

    // ✅ FIX: Remove verified_at column since it doesn't exist
    await connection.execute(
      `UPDATE enrollments 
       SET payment_status = ?, 
           status = ?,
           payment_date = NOW()
       WHERE id = ?`,
      [status, status === 'verified' ? 'active' : 'pending', enrollmentId]
    );

    await connection.commit();

    console.log('✅ Payment verified successfully');

    return NextResponse.json({ 
      success: true, 
      message: `Payment ${status} successfully` 
    });

  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error('❌ Error verifying payment:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to verify payment' 
      }, 
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}