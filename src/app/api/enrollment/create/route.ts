// app/api/enrollment/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { sendEnrollmentConfirmation } from '@/lib/email';
/* eslint-disable @typescript-eslint/no-explicit-any */

// Helper function to generate unique enrollment ID
async function generateUniqueEnrollmentId(connection: any): Promise<string> {
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
    const enrollmentId = `ENR-${timestamp}-${randomStr}`;
    
    const [existing] = await connection.execute(
      'SELECT id FROM enrollments WHERE id = ? LIMIT 1',
      [enrollmentId]
    );
    
    if ((existing as any[]).length === 0) {
      return enrollmentId;
    }
    
    attempts++;
  }
  
  return `ENR-${Date.now()}-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
}

// Helper function to generate payment ID
function generatePaymentId(): string {
  return `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
}

// Helper function to extract student details from dynamic fields
function extractStudentDetails(dynamicFields: any) {
  return {
    student_name: dynamicFields?.full_name || dynamicFields?.student_name || '',
    student_email: dynamicFields?.email || dynamicFields?.student_email || '',
    student_phone: dynamicFields?.phone || dynamicFields?.student_phone || '',
    student_cnic: dynamicFields?.cnic || dynamicFields?.student_cnic || '',
    student_address: dynamicFields?.address || dynamicFields?.student_address || '',
    student_education: dynamicFields?.education || dynamicFields?.student_education || '',
    student_experience: dynamicFields?.experience || dynamicFields?.student_experience || ''
  };
}

export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const { 
      dynamicFields,
      uploadedFiles,
      courses, 
      totalAmount, 
      voucherNumber, 
      sendEmail 
    } = body;

    console.log('📝 Enrollment request received:', { 
      coursesCount: courses?.length,
      totalAmount,
      dynamicFieldsKeys: dynamicFields ? Object.keys(dynamicFields) : []
    });

    // Extract student details from dynamic fields
    const studentDetails = extractStudentDetails(dynamicFields);

    // Validate required fields
    const missingFields = [];
    if (!studentDetails.student_name) missingFields.push('full_name');
    if (!studentDetails.student_email) missingFields.push('email');
    if (!studentDetails.student_phone) missingFields.push('phone');
    if (!studentDetails.student_cnic) missingFields.push('cnic');

    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentDetails.student_email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
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

    // ✅ DUPLICATE CHECK - Check if student already enrolled in any of these courses
    for (const course of courses) {
      const [existing] = await connection.execute(
        `SELECT id, status FROM enrollments 
         WHERE student_email = ? AND course_id = ? 
         AND status IN ('active', 'pending')
         LIMIT 1`,
        [studentDetails.student_email, course.course_id]  // Using real course_id
      );
      
      if ((existing as any[]).length > 0) {
        const existingEnrollment = (existing as any[])[0];
        return NextResponse.json({
          success: false,
          error: `You are already enrolled in "${course.course_title}". Duplicate enrollment is not allowed.`,
          duplicate: true,
          course: course.course_title,
          existingStatus: existingEnrollment.status
        }, { status: 409 });
      }
    }

    // ✅ STEP 1: Create PAYMENT record first
    const paymentId = generatePaymentId();
    const slipUrl = uploadedFiles?.payment_slip?.url || null;
    
    await connection.execute(
      `INSERT INTO payments (id, student_email, total_amount, status, slip_url, created_at)
       VALUES (?, ?, ?, 'pending', ?, NOW())`,
      [paymentId, studentDetails.student_email, totalAmount, slipUrl]
    );
    console.log('✅ Payment record created:', paymentId);

    // Start transaction
    await connection.beginTransaction();

    try {
      const enrollmentIds: string[] = [];
      const enrollmentRecords = [];

      // Extract document URLs from uploadedFiles
      const cnicFrontUrl = uploadedFiles?.cnic_front?.url || uploadedFiles?.cnic?.url || null;
      const cnicBackUrl = uploadedFiles?.cnic_back?.url || null;
      const educationalDocUrl = uploadedFiles?.educational_doc?.url || null;
      
      // ✅ STEP 2: Create SEPARATE enrollment for EACH course with its own ID
      for (let i = 0; i < courses.length; i++) {
        const course = courses[i];
        
        // Generate unique enrollment ID for each course
        const enrollmentId = await generateUniqueEnrollmentId(connection);
        enrollmentIds.push(enrollmentId);
        
        // ✅ FIXED: Using course.course_id instead of course.id
        await connection.execute(
          `INSERT INTO enrollments (
            id, student_id, student_email, student_name, student_phone,
            student_cnic, student_address, student_education, student_experience,
            cnic_front_url, cnic_back_url, educational_doc_url,
            course_id, course_title, course_price,
            enrollment_date, status, payment_status, payment_amount,
            slip_uploaded, voucher_generated, voucher_number, payment_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            enrollmentId,
            studentDetails.student_email,
            studentDetails.student_email,
            studentDetails.student_name,
            studentDetails.student_phone,
            studentDetails.student_cnic,
            studentDetails.student_address || null,
            studentDetails.student_education || null,
            studentDetails.student_experience || null,
            cnicFrontUrl,
            cnicBackUrl,
            educationalDocUrl,
            course.course_id,  // ✅ FIXED: Using real course ID instead of cart item ID
            course.course_title,
            parseFloat(course.course_price) || 0,
            'pending',
            'pending',
            parseFloat(totalAmount) || 0,
            0,
            1,
            voucherNumber || null,
            paymentId
          ]
        );
        
        console.log(`✅ [${i + 1}/${courses.length}] Enrollment created: ${enrollmentId} for course: ${course.course_title}`);
        enrollmentRecords.push({
          enrollmentId,
          courseId: course.course_id,  // ✅ FIXED: Using real course ID
          courseTitle: course.course_title
        });
      }

      await connection.commit();
      console.log(`✅ All ${courses.length} enrollments created. Payment ID: ${paymentId}`);

      // Send email notification with enrollment IDs
      let emailSent = false;
      if (sendEmail === true) {
        try {
          const emailResult = await sendEnrollmentConfirmation({
            studentName: studentDetails.student_name,
            studentEmail: studentDetails.student_email,
            studentPhone: studentDetails.student_phone,
            enrollmentId: enrollmentIds[0], // First enrollment ID for reference
            enrollmentIds: enrollmentIds, // All enrollment IDs
            paymentId: paymentId,
            courses: courses,
            totalAmount: parseFloat(totalAmount) || 0,
            enrollmentDate: new Date().toLocaleString(),
            status: 'pending'
          });
          
          if (emailResult.success) {
            emailSent = true;
            console.log('✅ Confirmation email sent to:', studentDetails.student_email);
          } else {
            console.error('❌ Failed to send email:', emailResult.error);
          }
        } catch (emailError) {
          console.error('❌ Email sending error:', emailError);
        }
      }

      // ✅ Return the PAYMENT ID and ENROLLMENT IDs to frontend
      return NextResponse.json({
        success: true,
        data: {
          paymentId: paymentId,
          enrollmentIds: enrollmentIds,
          primaryEnrollmentId: enrollmentIds[0], // Main enrollment ID for user reference
          studentName: studentDetails.student_name,
          studentEmail: studentDetails.student_email,
          totalAmount: parseFloat(totalAmount) || 0,
          coursesCount: courses.length,
          courses: courses.map((c: any) => ({
            id: c.course_id,  // ✅ FIXED: Return real course ID instead of cart item ID
            title: c.course_title,
            price: c.course_price
          })),
          voucherNumber: voucherNumber || null
        },
        emailSent: emailSent,
        message: emailSent 
          ? `Enrollment created successfully! Payment ID: ${paymentId}. Confirmation email sent.`
          : `Enrollment created successfully! Payment ID: ${paymentId}.`
      });

    } catch (error: any) {
      await connection.rollback();
      console.error('❌ Error during enrollment creation:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Unable to create enrollment. Please try again.',
            duplicate: true,
            shouldRetry: true
          },
          { status: 409 }
        );
      }
      
      throw error;
    }

  } catch (error: any) {
    console.error('❌ Error processing enrollment:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to process enrollment',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
      console.log('🔌 Database connection released');
    }
  }
}