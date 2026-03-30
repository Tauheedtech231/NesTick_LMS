// app/api/enrollment/create/route.ts - Updated Version with Email
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { sendEnrollmentConfirmation } from '@/lib/email';
/* eslint-disable @typescript-eslint/no-explicit-any */
export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const { studentDetails, courses, totalAmount, documents, enrollmentId, voucherNumber, sendEmail } = body;

    // Validate required fields
    if (!studentDetails.student_name || !studentDetails.student_email || 
        !studentDetails.student_phone || !studentDetails.student_cnic) {
      return NextResponse.json(
        { success: false, error: 'Missing required student information' },
        { status: 400 }
      );
    }

    if (!courses || courses.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No courses selected for enrollment' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Start transaction
    await connection.beginTransaction();

    try {
      const enrollmentIds = []; // Store all enrollment IDs
      
      // Insert enrollment record for EACH course with UNIQUE ID
      for (const course of courses) {
        const newEnrollmentId = enrollmentId || uuidv4(); // Use provided ID or generate new
        enrollmentIds.push(newEnrollmentId);
        
        await connection.execute(
          `INSERT INTO enrollments (
            id, student_id, student_email, student_name, student_phone,
            student_cnic, student_address, student_education, student_experience,
            cnic_front_url, cnic_back_url, educational_doc_url,
            course_id, course_title, course_price,
            enrollment_date, status, payment_status, payment_amount,
            slip_uploaded, voucher_generated, voucher_number, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            newEnrollmentId,
            studentDetails.student_email,
            studentDetails.student_email,
            studentDetails.student_name,
            studentDetails.student_phone,
            studentDetails.student_cnic,
            studentDetails.student_address || null,
            studentDetails.student_education || null,
            studentDetails.student_experience || null,
            documents.cnic_front?.url || null,
            documents.cnic_back?.url || null,
            documents.educational_doc?.url || null,
            course.id,
            course.course_title,
            course.course_price,
            'pending',
            'pending',
            course.course_price,
            false,
            true,
            voucherNumber || null
          ]
        );
      }

      await connection.commit();

      // ✅ SEND EMAIL IF REQUESTED
      let emailSent = false;
      if (sendEmail === true) {
        try {
          const emailResult = await sendEnrollmentConfirmation({
            studentName: studentDetails.student_name,
            studentEmail: studentDetails.student_email,
            studentPhone: studentDetails.student_phone,
            enrollmentId: enrollmentIds[0], // First enrollment ID
            courses: courses,
            totalAmount: totalAmount,
            enrollmentDate: new Date().toLocaleString(),
            status: 'pending'
          });
          
          if (emailResult.success) {
            emailSent = true;
            console.log('✅ Confirmation email sent successfully to:', studentDetails.student_email);
          } else {
            console.error('❌ Failed to send email:', emailResult.error);
          }
        } catch (emailError) {
          console.error('❌ Email sending error:', emailError);
          // Don't fail the enrollment if email fails
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          enrollmentIds,
          studentName: studentDetails.student_name,
          totalAmount,
          coursesCount: courses.length
        },
        emailSent: emailSent,
        message: emailSent 
          ? 'Enrollments created successfully and confirmation email sent!'
          : 'Enrollments created successfully but email could not be sent.'
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    }

  } catch (error: any) {
    console.error('Error creating enrollment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create enrollment' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}