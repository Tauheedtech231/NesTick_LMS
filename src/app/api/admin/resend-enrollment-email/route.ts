// app/api/admin/resend-enrollment-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { sendEnrollmentConfirmation } from '@/lib/email';
/* eslint-disable */

export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const { enrollmentId, studentEmail, studentName, course, amount, paymentId } = body;

    console.log('📧 Resending enrollment email to:', studentEmail);

    if (!enrollmentId || !studentEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Get enrollment details
    const [enrollments] = await connection.execute(
      `SELECT 
        e.id,
        e.student_name,
        e.student_email,
        e.student_phone,
        e.course_title,
        e.course_price,
        e.enrollment_date,
        e.voucher_number,
        e.payment_id
      FROM enrollments e
      WHERE e.id = ?`,
      [enrollmentId]
    );

    const enrollmentRows = enrollments as any[];
    
    if (enrollmentRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    const enrollment = enrollmentRows[0];

    // Get all courses for this enrollment (if multiple)
    const [allCourses] = await connection.execute(
      `SELECT course_title, course_price 
       FROM enrollments 
       WHERE id = ?`,
      [enrollmentId]
    );

    const courses = (allCourses as any[]).map(c => ({
      course_title: c.course_title,
      course_price: c.course_price
    }));

    // Send email
    const emailResult = await sendEnrollmentConfirmation({
      studentName: enrollment.student_name,
      studentEmail: enrollment.student_email,
      studentPhone: enrollment.student_phone || '',
      enrollmentId: enrollment.id,
      courses: courses,
      totalAmount: enrollment.course_price,
      enrollmentDate: enrollment.enrollment_date,
      status: 'pending'
    });

    if (emailResult.success) {
      console.log('✅ Resent enrollment email to:', studentEmail);
      return NextResponse.json({
        success: true,
        message: 'Email resent successfully'
      });
    } else {
      throw new Error('Failed to send email');
    }

  } catch (error: any) {
    console.error('Error resending email:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to resend email' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}