// app/api/enrollment/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { sendEnrollmentConfirmation } from '@/lib/email';
/* eslint-disable */
export async function PUT(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const { 
      enrollmentId, 
      studentDetails, 
      courses, 
      totalAmount, 
      documents, 
      voucherNumber,
      sendEmail 
    } = body;

    if (!enrollmentId) {
      return NextResponse.json(
        { success: false, error: 'Enrollment ID is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Check if enrollment exists
    const [existing] = await connection.execute(
      'SELECT id, payment_status, status FROM enrollments WHERE id = ?',
      [enrollmentId]
    );

    if ((existing as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    const existingEnrollment = (existing as any[])[0];

    // Update enrollment details
    await connection.beginTransaction();

    try {
      // Update student information
      await connection.execute(
        `UPDATE enrollments SET
          student_name = ?,
          student_phone = ?,
          student_cnic = ?,
          student_address = ?,
          student_education = ?,
          student_experience = ?,
          cnic_front_url = COALESCE(?, cnic_front_url),
          cnic_back_url = COALESCE(?, cnic_back_url),
          educational_doc_url = COALESCE(?, educational_doc_url),
          voucher_number = COALESCE(?, voucher_number),
          voucher_generated = TRUE,
          updated_at = NOW()
        WHERE id = ?`,
        [
          studentDetails.student_name,
          studentDetails.student_phone,
          studentDetails.student_cnic,
          studentDetails.student_address || null,
          studentDetails.student_education || null,
          studentDetails.student_experience || null,
          documents.cnic_front?.url || null,
          documents.cnic_back?.url || null,
          documents.educational_doc?.url || null,
          voucherNumber || null,
          enrollmentId
        ]
      );

      // Update payment amount if different
      if (totalAmount && totalAmount !== existingEnrollment.payment_amount) {
        await connection.execute(
          `UPDATE enrollments SET
            payment_amount = ?,
            updated_at = NOW()
          WHERE id = ?`,
          [totalAmount, enrollmentId]
        );
      }

      await connection.commit();

      // Send confirmation email if requested
      let emailSent = false;
      if (sendEmail === true) {
        try {
          const emailResult = await sendEnrollmentConfirmation({
            studentName: studentDetails.student_name,
            studentEmail: studentDetails.student_email,
            studentPhone: studentDetails.student_phone,
            enrollmentId: enrollmentId,
            courses: courses || [],
            totalAmount: totalAmount,
            enrollmentDate: new Date().toLocaleString(),
            status: 'pending'
          });
          
          if (emailResult.success) {
            emailSent = true;
            console.log('✅ Update confirmation email sent to:', studentDetails.student_email);
          }
        } catch (emailError) {
          console.error('❌ Email sending error:', emailError);
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          enrollmentId,
          studentName: studentDetails.student_name,
          totalAmount,
          isUpdate: true
        },
        emailSent: emailSent,
        message: emailSent 
          ? 'Enrollment updated successfully and confirmation email sent!'
          : 'Enrollment updated successfully'
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    }

  } catch (error: any) {
    console.error('Error updating enrollment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update enrollment' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}