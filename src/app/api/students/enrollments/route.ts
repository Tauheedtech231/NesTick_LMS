import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    const [rows] = await connection.execute(
      `SELECT 
        id,
        student_id,
        student_name,
        student_email,
        course_id,
        course_title,
        enrollment_date,
        status,
        payment_status
      FROM enrollments 
      WHERE student_email = ? AND payment_status = 'verified' AND status = 'active'
      ORDER BY enrollment_date DESC`,
      [email]
    );

    return NextResponse.json({
      success: true,
      data: rows
    });

  } catch (error: any) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}