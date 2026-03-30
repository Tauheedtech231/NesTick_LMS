// app/api/enrollment/public/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  try {
    // ✅ Await params to get the id (Next.js 15+)
    const { id: enrollmentId } = await params;

    console.log('🔍 Fetching enrollment:', enrollmentId);

    if (!enrollmentId) {
      return NextResponse.json(
        { success: false, error: 'Enrollment ID is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Get all enrollments with this ID (multiple courses possible)
    const [enrollments] = await connection.execute(
      `SELECT 
        id, 
        student_name, 
        student_email, 
        student_phone, 
        student_cnic, 
        student_address,
        student_education,
        student_experience,
        course_id,
        course_title,
        course_price,
        enrollment_date,
        status,
        payment_status,
        payment_amount,
        slip_uploaded,
        voucher_generated,
        voucher_number,
        created_at,
        updated_at
      FROM enrollments 
      WHERE id = ?`,
      [enrollmentId]
    );

    const enrollmentRows = enrollments as any[];

    if (enrollmentRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Get unique courses
    const uniqueCourses = [];
    const courseMap = new Map();
    
    for (const row of enrollmentRows) {
      if (!courseMap.has(row.course_id)) {
        courseMap.set(row.course_id, {
          id: row.course_id,
          course_id: row.course_id,
          course_title: row.course_title,
          course_price: row.course_price
        });
        uniqueCourses.push({
          id: row.course_id,
          course_id: row.course_id,
          course_title: row.course_title,
          course_price: row.course_price
        });
      }
    }

    const firstRow = enrollmentRows[0];

    // Get payment slips
    const [paymentSlips] = await connection.execute(
      `SELECT 
        id,
        slip_url, 
        file_name, 
        uploaded_at, 
        status
      FROM payment_slips 
      WHERE enrollment_id = ?
      ORDER BY uploaded_at DESC`,
      [enrollmentId]
    );

    console.log('✅ Enrollment found:', {
      id: firstRow.id,
      student_name: firstRow.student_name,
      courses_count: uniqueCourses.length,
      payment_slips_count: (paymentSlips as any[]).length
    });

    return NextResponse.json({
      success: true,
      data: {
        id: firstRow.id,
        student_name: firstRow.student_name,
        student_email: firstRow.student_email,
        student_phone: firstRow.student_phone,
        student_cnic: firstRow.student_cnic,
        student_address: firstRow.student_address,
        student_education: firstRow.student_education,
        student_experience: firstRow.student_experience,
        courses: uniqueCourses,
        total_amount: firstRow.payment_amount,
        status: firstRow.status,
        payment_status: firstRow.payment_status,
        slip_uploaded: firstRow.slip_uploaded === 1,
        voucher_generated: firstRow.voucher_generated === 1,
        voucher_number: firstRow.voucher_number,
        enrollment_date: firstRow.enrollment_date,
        created_at: firstRow.created_at,
        updated_at: firstRow.updated_at,
        payment_slips: paymentSlips as any[]
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching enrollment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch enrollment' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}