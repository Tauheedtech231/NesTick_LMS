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
    // ✅ Await params to get the id
    const { id } = await params;

    console.log('🔍 Fetching enrollment/payment details for ID:', id);

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // ✅ FIRST: Check if this is a Payment ID (starts with PAY-)
    if (id.startsWith('PAY-')) {
      console.log('✅ This is a Payment ID:', id);
      
      // Get payment record
      const [paymentRows] = await connection.execute(
        `SELECT 
          id,
          student_email,
          total_amount,
          status,
          slip_url,
          created_at
        FROM payments 
        WHERE id = ?`,
        [id]
      );

      const paymentData = (paymentRows as any[])[0];

      if (!paymentData) {
        return NextResponse.json(
          { success: false, error: 'Payment not found' },
          { status: 404 }
        );
      }

      // Get all enrollments linked to this payment
      const [enrollments] = await connection.execute(
        `SELECT 
          e.id,
          e.student_name,
          e.student_email,
          e.student_phone,
          e.student_cnic,
          e.student_address,
          e.student_education,
          e.student_experience,
          e.course_id,
          e.course_title,
          e.course_price,
          e.enrollment_date,
          e.status,
          e.payment_status,
          e.payment_amount,
          e.slip_uploaded,
          e.voucher_generated,
          e.voucher_number,
          e.created_at,
          e.updated_at
        FROM enrollments e
        WHERE e.payment_id = ?
        ORDER BY e.enrollment_date ASC`,
        [id]
      );

      const enrollmentRows = enrollments as any[];

      if (enrollmentRows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No enrollments found for this payment' },
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

      const firstEnrollment = enrollmentRows[0];

      console.log('✅ Payment found:', {
        paymentId: paymentData.id,
        student_email: paymentData.student_email,
        total_amount: paymentData.total_amount,
        courses_count: uniqueCourses.length,
        enrollments_count: enrollmentRows.length
      });

      return NextResponse.json({
        success: true,
        data: {
          id: paymentData.id,
          student_name: firstEnrollment.student_name,
          student_email: paymentData.student_email,
          student_phone: firstEnrollment.student_phone,
          student_cnic: firstEnrollment.student_cnic,
          student_address: firstEnrollment.student_address,
          student_education: firstEnrollment.student_education,
          student_experience: firstEnrollment.student_experience,
          courses: uniqueCourses,
          total_amount: paymentData.total_amount,
          status: paymentData.status,
          payment_status: paymentData.status,
          slip_uploaded: paymentData.slip_url ? true : false,
          voucher_generated: firstEnrollment.voucher_generated === 1,
          voucher_number: firstEnrollment.voucher_number,
          enrollment_date: firstEnrollment.enrollment_date,
          created_at: paymentData.created_at,
          updated_at: paymentData.created_at,
          slip_url: paymentData.slip_url,
          enrollments: enrollmentRows.map(row => ({
            id: row.id,
            course_id: row.course_id,
            course_title: row.course_title,
            course_price: row.course_price,
            enrollment_date: row.enrollment_date
          }))
        }
      });
    }

    // ✅ SECOND: If not Payment ID, treat as Enrollment ID (ENR-)
    console.log('📝 This is an Enrollment ID:', id);
    
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
        payment_id,
        created_at,
        updated_at
      FROM enrollments 
      WHERE id = ?`,
      [id]
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

    // Also get payment slip if exists
    let paymentSlipUrl = null;
    if (firstRow.payment_id) {
      const [paymentSlipRows] = await connection.execute(
        `SELECT slip_url FROM payments WHERE id = ?`,
        [firstRow.payment_id]
      );
      if ((paymentSlipRows as any[]).length > 0) {
        paymentSlipUrl = (paymentSlipRows as any[])[0].slip_url;
      }
    }

    console.log('✅ Enrollment found:', {
      id: firstRow.id,
      student_name: firstRow.student_name,
      courses_count: uniqueCourses.length,
      payment_id: firstRow.payment_id
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
        payment_id: firstRow.payment_id,
        slip_url: paymentSlipUrl
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching details:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch details' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}