// app/api/enrollment/create/route.ts - Updated Version with Duplicate Handling
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { sendEnrollmentConfirmation } from '@/lib/email';
/* eslint-disable @typescript-eslint/no-explicit-any */

export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const { 
      studentDetails, 
      courses, 
      totalAmount, 
      documents, 
      enrollmentId, 
      voucherNumber, 
      sendEmail,
      isUpdate 
    } = body;

    console.log('📝 Enrollment request:', { enrollmentId, isUpdate, coursesCount: courses?.length });

    // Validate required fields
    if (!studentDetails?.student_name || !studentDetails?.student_email || 
        !studentDetails?.student_phone || !studentDetails?.student_cnic) {
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

    // ============ CHECK IF ENROLLMENT EXISTS (for both update and duplicate prevention) ============
    let enrollmentExists = false;
    let existingEnrollmentId = null;
    
    if (enrollmentId && !isUpdate) {
      // Check if the provided enrollment ID already exists (duplicate prevention)
      const [existing] = await connection.execute(
        'SELECT id FROM enrollments WHERE id = ?',
        [enrollmentId]
      );
      enrollmentExists = (existing as any[]).length > 0;
      if (enrollmentExists) {
        existingEnrollmentId = enrollmentId;
        console.log('⚠️ Enrollment ID already exists, will treat as update:', enrollmentId);
      }
    }

    // ============ UPDATE EXISTING ENROLLMENT ============
    if ((isUpdate && enrollmentId) || (enrollmentExists && existingEnrollmentId)) {
      const updateId = enrollmentId || existingEnrollmentId;
      console.log('🔄 Updating existing enrollment:', updateId);
      
      // Check if enrollment exists
      const [existing] = await connection.execute(
        'SELECT id, payment_status, status FROM enrollments WHERE id = ?',
        [updateId]
      );

      if ((existing as any[]).length === 0) {
        return NextResponse.json(
          { success: false, error: 'Enrollment not found for update' },
          { status: 404 }
        );
      }

      // Start transaction for update
      await connection.beginTransaction();

      try {
        // Get existing documents to preserve if not updated
        const [existingDocs] = await connection.execute(
          `SELECT cnic_front_url, cnic_back_url, educational_doc_url 
           FROM enrollments WHERE id = ? LIMIT 1`,
          [updateId]
        );
        const existingData = (existingDocs as any[])[0] || {};

        // Update student information and documents
        await connection.execute(
          `UPDATE enrollments SET
            student_name = ?,
            student_phone = ?,
            student_cnic = ?,
            student_address = ?,
            student_education = ?,
            student_experience = ?,
            cnic_front_url = COALESCE(?, ?),
            cnic_back_url = COALESCE(?, ?),
            educational_doc_url = COALESCE(?, ?),
            voucher_number = COALESCE(?, voucher_number),
            voucher_generated = CASE WHEN ? IS NOT NULL THEN TRUE ELSE voucher_generated END,
            updated_at = NOW()
          WHERE id = ?`,
          [
            studentDetails.student_name,
            studentDetails.student_phone,
            studentDetails.student_cnic,
            studentDetails.student_address || null,
            studentDetails.student_education || null,
            studentDetails.student_experience || null,
            documents.cnic_front?.url || null, existingData.cnic_front_url,
            documents.cnic_back?.url || null, existingData.cnic_back_url,
            documents.educational_doc?.url || null, existingData.educational_doc_url,
            voucherNumber || null,
            voucherNumber || null,
            updateId
          ]
        );

        // Update payment amount if different
        const [currentEnrollment] = await connection.execute(
          'SELECT payment_amount FROM enrollments WHERE id = ?',
          [updateId]
        );
        const currentAmount = (currentEnrollment as any[])[0]?.payment_amount || 0;
        
        if (totalAmount && totalAmount !== currentAmount) {
          await connection.execute(
            `UPDATE enrollments SET
              payment_amount = ?,
              updated_at = NOW()
            WHERE id = ?`,
            [totalAmount, updateId]
          );
        }

        await connection.commit();

        // Send email notification
        let emailSent = false;
        if (sendEmail === true) {
          try {
            const emailResult = await sendEnrollmentConfirmation({
              studentName: studentDetails.student_name,
              studentEmail: studentDetails.student_email,
              studentPhone: studentDetails.student_phone,
              enrollmentId: updateId,
              courses: courses,
              totalAmount: totalAmount,
              enrollmentDate: new Date().toLocaleString(),
              status: 'pending'
            });
            
            if (emailResult.success) {
              emailSent = true;
              console.log('✅ Update confirmation email sent to:', studentDetails.student_email);
            } else {
              console.error('❌ Failed to send update email:', emailResult.error);
            }
          } catch (emailError) {
            console.error('❌ Email sending error:', emailError);
          }
        }

        return NextResponse.json({
          success: true,
          data: {
            enrollmentIds: [updateId],
            studentName: studentDetails.student_name,
            totalAmount,
            coursesCount: courses.length,
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
    }

    // ============ CREATE NEW ENROLLMENT ============
    console.log('📝 Creating new enrollment');
    
    // Generate a unique enrollment ID
    let finalEnrollmentId = enrollmentId;
    let isNewIdGenerated = false;
    
    if (!finalEnrollmentId) {
      finalEnrollmentId = `ENR-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      isNewIdGenerated = true;
    } else {
      // Double check that the ID doesn't exist (for safety)
      const [checkDuplicate] = await connection.execute(
        'SELECT id FROM enrollments WHERE id = ?',
        [finalEnrollmentId]
      );
      if ((checkDuplicate as any[]).length > 0) {
        // ID exists, generate a new one
        finalEnrollmentId = `ENR-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
        isNewIdGenerated = true;
        console.log('⚠️ Provided ID existed, using new ID:', finalEnrollmentId);
      }
    }

    await connection.beginTransaction();

    try {
      const enrollmentIds = [];
      
      // Insert enrollment record for EACH course with SAME enrollment ID (bundle)
      for (const course of courses) {
        enrollmentIds.push(finalEnrollmentId);
        
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
            finalEnrollmentId,
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

      // Send email notification
      let emailSent = false;
      if (sendEmail === true) {
        try {
          const emailResult = await sendEnrollmentConfirmation({
            studentName: studentDetails.student_name,
            studentEmail: studentDetails.student_email,
            studentPhone: studentDetails.student_phone,
            enrollmentId: finalEnrollmentId,
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
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          enrollmentIds,
          studentName: studentDetails.student_name,
          totalAmount,
          coursesCount: courses.length,
          isUpdate: false,
          isNewIdGenerated
        },
        emailSent: emailSent,
        message: emailSent 
          ? 'Enrollment created successfully! Confirmation email sent.'
          : 'Enrollment created successfully!'
      });

    } catch (error: any) {
      await connection.rollback();
      
      // Handle duplicate entry error specifically
      if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('Duplicate entry')) {
        console.error('❌ Duplicate entry error:', error.message);
        return NextResponse.json(
          { 
            success: false, 
            error: 'An enrollment with this ID already exists. Please use the "Continue Existing Enrollment" option.',
            duplicate: true
          },
          { status: 409 }
        );
      }
      
      throw error;
    }

  } catch (error: any) {
    console.error('Error creating/updating enrollment:', error);
    
    // Handle duplicate entry error at top level
    if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('Duplicate entry')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Duplicate enrollment detected. Please refresh and try again.',
          duplicate: true
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process enrollment' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}