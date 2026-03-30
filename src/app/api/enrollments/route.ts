// app/api/enrollments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
/* eslint-disable */

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tauheeddeveloper13@gmail.com',
    pass: 'ramo reiv jlsy ogsg' // Your App Password
  }
});

// Admin email for notifications
const ADMIN_EMAIL = 'tauheeddeveloper13@gmail.com';

// Helper function to send enrollment confirmation emails
async function sendEnrollmentEmails({
  studentName,
  studentEmail,
  courseTitle,
  coursePrice,
  enrollmentId,
  phone,
  cnic,
  education
}: any) {
  const currentDate = new Date().toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  try {
    // 1. Email to Student
    const studentMailOptions = {
      from: '"Mansol Hab School of Skills" <tauheeddeveloper13@gmail.com>',
      to: studentEmail,
      subject: `✅ Enrollment Confirmed: ${courseTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Enrollment Confirmation</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0B1C3D 0%, #1E3A8A 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #B11217; }
            .info-item { margin-bottom: 10px; }
            .info-label { font-weight: bold; color: #0B1C3D; }
            .amount { font-size: 20px; color: #B11217; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; color: #666; font-size: 14px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #B11217; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Enrollment Confirmed!</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${studentName}</strong>,</p>
              
              <p>Thank you for enrolling in <strong>${courseTitle}</strong> at Mansol Hab School of Skills. We're excited to have you on board!</p>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #0B1C3D;">📋 Enrollment Details</h3>
                <div class="info-item">
                  <span class="info-label">Enrollment ID:</span> ${enrollmentId}
                </div>
                <div class="info-item">
                  <span class="info-label">Course:</span> ${courseTitle}
                </div>
                <div class="info-item">
                  <span class="info-label">Date:</span> ${currentDate}
                </div>
                <div class="info-item">
                  <span class="info-label">Amount:</span> <span class="amount">PKR ${coursePrice?.toLocaleString() || '0'}</span>
                </div>
              </div>
              
              <h3 style="color: #0B1C3D;">⏳ What Happens Next?</h3>
              <ol style="margin-bottom: 20px;">
                <li>Your documents and payment slip are being verified by our team</li>
                <li>Verification typically takes 24-48 hours</li>
                <li>Once verified, you'll receive login credentials via email</li>
                <li>You'll then get full access to your course materials</li>
              </ol>
              
              <p>If you have any questions, please contact our support team:</p>
              <ul style="list-style: none; padding: 0;">
                <li>📧 support@mansolhab.edu.pk</li>
                <li>📞 +92 300 1234567</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="https://mansolhab.edu.pk/courses" class="button">Browse More Courses</a>
              </div>
              
              <div class="footer">
                <p>Best regards,<br><strong>Mansol Hab School of Skills Team</strong></p>
                <p style="font-size: 12px;">This is an automated message, please do not reply directly.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // 2. Email to Admin
    const adminMailOptions = {
      from: '"Mansol Hab LMS" <tauheeddeveloper13@gmail.com>',
      to: ADMIN_EMAIL,
      subject: `🔔 New Enrollment: ${studentName} - ${courseTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Enrollment Notification</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0B1C3D 0%, #1E3A8A 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #B11217; }
            .info-item { margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
            .info-label { font-weight: bold; color: #0B1C3D; width: 120px; display: inline-block; }
            .badge { background: #B11217; color: white; padding: 3px 8px; border-radius: 4px; font-size: 12px; }
            .amount { font-size: 18px; color: #B11217; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; color: #666; font-size: 14px; }
            .action-button { display: inline-block; padding: 12px 24px; background-color: #1E3A8A; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📢 New Enrollment Received</h1>
            </div>
            <div class="content">
              <p>Hello Admin,</p>
              
              <p>A new enrollment has been submitted and requires verification:</p>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #0B1C3D;">👤 Student Information</h3>
                <div class="info-item">
                  <span class="info-label">Name:</span> ${studentName}
                </div>
                <div class="info-item">
                  <span class="info-label">Email:</span> ${studentEmail}
                </div>
                <div class="info-item">
                  <span class="info-label">Phone:</span> ${phone || 'Not provided'}
                </div>
                <div class="info-item">
                  <span class="info-label">CNIC:</span> ${cnic || 'Not provided'}
                </div>
                <div class="info-item">
                  <span class="info-label">Education:</span> ${education || 'Not provided'}
                </div>
              </div>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #0B1C3D;">📚 Course Details</h3>
                <div class="info-item">
                  <span class="info-label">Enrollment ID:</span> <span class="badge">${enrollmentId}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Course:</span> ${courseTitle}
                </div>
                <div class="info-item">
                  <span class="info-label">Amount:</span> <span class="amount">PKR ${coursePrice?.toLocaleString() || '0'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Date:</span> ${currentDate}
                </div>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://mansolhab.edu.pk/lms/Admin_Portal/enrollments" class="action-button">View Enrollments</a>
                <a href="https://mansolhab.edu.pk/lms/Admin_Portal/payments" class="action-button" style="background-color: #B11217;">Verify Payment</a>
              </div>
              
              <div class="footer">
                <p>This is an automated notification from Mansol Hab LMS.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(studentMailOptions),
      transporter.sendMail(adminMailOptions)
    ]);

    console.log('✅ Enrollment emails sent successfully');
    return { success: true };

  } catch (error) {
    console.error('❌ Error sending emails:', error);
    throw error;
  }
}

/* =====================================================
   CREATE NEW ENROLLMENT
===================================================== */
export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    
    // Log received body for debugging
    console.log('📦 Received enrollment data:', {
      full_name: body.full_name,
      email: body.email,
      studentEmail: body.studentEmail,
      courseId: body.courseId,
      useCart: body.useCart || false,
      hasFiles: {
        cnic_front: !!body.cnic_frontUrl,
        cnic_back: !!body.cnic_backUrl,
        certificate: !!body.certificateUrl
      }
    });

    const {
      full_name,
      email,
      phone,
      cnic,
      address,
      education,
      experience,
      cnic_frontUrl,
      cnic_backUrl,
      certificateUrl,
      courseId,
      courseTitle,
      coursePrice,
      enrollmentDate,
      useCart
    } = body;

    const studentEmail = (body.studentEmail || email || '').toString().trim().toLowerCase();

    // CART-DRIVEN ENROLLMENT
    const cartFlow = useCart || (!!studentEmail && !courseId);

    if (cartFlow) {
      if (!studentEmail) {
        return NextResponse.json({ success: false, error: 'studentEmail is required for cart-based enrollment' }, { status: 400 });
      }

      connection = await getConnection();

      const [cartRows] = await connection.execute(
        'SELECT course_id, course_title, course_price FROM cart_bucket WHERE student_email = ? ORDER BY created_at ASC',
        [studentEmail]
      );

      const cartItems = cartRows as any[];

      if (!cartItems.length) {
        return NextResponse.json({ success: false, error: 'No courses in cart to create enrollment' }, { status: 400 });
      }

      const totalAmount = cartItems.reduce((sum, item) => sum + Number(item.course_price || 0), 0);
      const first = cartItems[0];

      const [existing] = await connection.execute(
        'SELECT id FROM enrollments WHERE student_email = ? AND course_id = ? AND status != "cancelled" LIMIT 1',
        [studentEmail, first.course_id]
      );

      if ((existing as any[]).length > 0) {
        return NextResponse.json({ success: false, error: 'You are already enrolled in this course' }, { status: 400 });
      }

      const enrollmentId = uuidv4();

      await connection.execute(
        `INSERT INTO enrollments (
          id, student_id, student_email, student_name, student_phone, student_cnic, student_address, student_education,
          student_experience, cnic_front_url, cnic_back_url, educational_doc_url, course_id, course_title, course_price,
          payment_amount, enrollment_date, status, payment_status, voucher_generated, slip_uploaded, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'pending', 'pending', FALSE, FALSE, NOW(), NOW())`,
        [
          enrollmentId,
          studentEmail,
          studentEmail,
          full_name || studentEmail,
          phone || null,
          cnic || null,
          address || null,
          education || null,
          experience || null,
          cnic_frontUrl || null,
          cnic_backUrl || null,
          certificateUrl || null,
          first.course_id,
          first.course_title,
          Number(first.course_price || 0),
          totalAmount
        ]
      );

      await connection.execute('DELETE FROM cart_bucket WHERE student_email = ?', [studentEmail]);

      return NextResponse.json({ success: true, data: { enrollmentId, totalAmount, courseCount: cartItems.length } });
    }

    // ============ VALIDATION ============
    if (!email || !courseId) {
      return NextResponse.json(
        { success: false, error: 'Student email and course ID are required' },
        { status: 400 }
      );
    }

    if (!full_name) {
      return NextResponse.json(
        { success: false, error: 'Student name is required' },
        { status: 400 }
      );
    }

    if (!cnic_frontUrl || !cnic_backUrl || !certificateUrl) {
      return NextResponse.json(
        { success: false, error: 'All documents (CNIC Front, CNIC Back, Educational) are required' },
        { status: 400 }
      );
    }

    // ============ CONNECT DATABASE ============
    connection = await getConnection();

    // ============ CHECK IF ALREADY ENROLLED ============
    const [existing] = await connection.execute(
      `SELECT id FROM enrollments 
       WHERE student_email = ? AND course_id = ? AND status != 'cancelled'`,
      [email, courseId]
    );

    if ((existing as any[]).length > 0) {
      return NextResponse.json(
        { success: false, error: 'You are already enrolled in this course' },
        { status: 400 }
      );
    }

    // ============ GENERATE ENROLLMENT ID ============
    const enrollmentId = uuidv4();

    // ============ CONVERT DATE FORMAT ============
    let mysqlDate = null;
    if (enrollmentDate) {
      const date = new Date(enrollmentDate);
      mysqlDate = date.toISOString().slice(0, 19).replace('T', ' ');
    }

    console.log('📅 Enrollment date:', mysqlDate || 'CURRENT_TIMESTAMP');

    // ============ INSERT ENROLLMENT ============
    // ✅ FIX: student_id = email (same as student_email)
    await connection.execute(
      `INSERT INTO enrollments (
        id, 
        student_id,          -- This is also the email
        student_email, 
        student_name, 
        student_phone,
        student_cnic, 
        student_address, 
        student_education, 
        student_experience,
        cnic_front_url, 
        cnic_back_url, 
        educational_doc_url,
        course_id, 
        course_title, 
        course_price, 
        enrollment_date,
        status, 
        payment_status, 
        created_at, 
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        enrollmentId,
        email,                // student_id = email
        email,                // student_email = email
        full_name,
        phone || null,
        cnic || null,
        address || null,
        education || null,
        experience || null,
        cnic_frontUrl,
        cnic_backUrl,
        certificateUrl,
        courseId,
        courseTitle || null,
        coursePrice || null,
        mysqlDate,
        'pending',
        'pending'
      ]
    );

    console.log('✅ Enrollment created successfully:', enrollmentId);

    // ============ SEND EMAIL NOTIFICATIONS (BACKGROUND) ============
    // Don't await - let it run in background
    setTimeout(() => {
      sendEnrollmentEmails({
        studentName: full_name,
        studentEmail: email,
        courseTitle: courseTitle || 'Course',
        coursePrice: coursePrice || 0,
        enrollmentId,
        phone: phone || 'Not provided',
        cnic: cnic || 'Not provided',
        education: education || 'Not provided'
      }).catch(emailError => {
        console.error('❌ Background email failed:', emailError);
      });
    }, 100);

    console.log('📧 Email sending initiated in background');

    // ============ RETURN SUCCESS IMMEDIATELY ============
    return NextResponse.json({
      success: true,
      data: { 
        enrollmentId,
        message: 'Enrollment created successfully'
      },
      message: 'Your enrollment has been submitted successfully. Please upload payment slip.'
    });

  } catch (error: any) {
    console.error('❌ Error creating enrollment:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { success: false, error: 'This enrollment already exists' },
        { status: 400 }
      );
    }
    
    if (error.code === 'ER_NO_REFERENCED_ROW') {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create enrollment',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

/* =====================================================
   GET ENROLLMENTS (with filters)
===================================================== */
export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const studentEmail = searchParams.get('studentEmail');
    const courseId = searchParams.get('courseId');
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');

    connection = await getConnection();

    let sql = `
      SELECT 
        e.*,
        ps.id as slip_id,
        ps.slip_url,
        ps.status as slip_status,
        ps.uploaded_at as slip_uploaded_at,
        ps.file_name as slip_file_name
      FROM enrollments e
      LEFT JOIN payment_slips ps ON e.id = ps.enrollment_id
      WHERE 1=1
    `;
    
    const params: any[] = [];

    if (studentId) {
      sql += ' AND e.student_id = ?';
      params.push(studentId);
    }

    if (studentEmail) {
      sql += ' AND e.student_email = ?';
      params.push(studentEmail);
    }

    if (courseId) {
      sql += ' AND e.course_id = ?';
      params.push(courseId);
    }

    if (status) {
      sql += ' AND e.status = ?';
      params.push(status);
    }

    if (paymentStatus) {
      sql += ' AND e.payment_status = ?';
      params.push(paymentStatus);
    }

    sql += ' ORDER BY e.created_at DESC';

    console.log('📊 Executing query with params:', params);

    const [rows] = await connection.execute(sql, params);

    return NextResponse.json({
      success: true,
      data: rows,
      count: (rows as any[]).length
    });

  } catch (error: any) {
    console.error('❌ Error fetching enrollments:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

/* =====================================================
   UPDATE ENROLLMENT STATUS
===================================================== */
export async function PUT(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const enrollmentId = searchParams.get('id');
    const body = await request.json();
    const { status, paymentStatus, verifiedBy } = body;

    if (!enrollmentId) {
      return NextResponse.json(
        { success: false, error: 'Enrollment ID required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Check if enrollment exists
    const [existing] = await connection.execute(
      'SELECT id FROM enrollments WHERE id = ?',
      [enrollmentId]
    );

    if ((existing as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (status) {
      updates.push('status = ?');
      values.push(status);
    }

    if (paymentStatus) {
      updates.push('payment_status = ?');
      values.push(paymentStatus);
      
      if (paymentStatus === 'verified') {
        updates.push('payment_date = NOW()');
      }
    }

    if (verifiedBy) {
      updates.push('verified_by = ?');
      values.push(verifiedBy);
    }

    updates.push('updated_at = NOW()');
    values.push(enrollmentId);

    if (updates.length === 1) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    await connection.execute(
      `UPDATE enrollments SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // If payment verified, also update payment_slips status
    if (paymentStatus === 'verified') {
      await connection.execute(
        `UPDATE payment_slips SET status = 'verified' WHERE enrollment_id = ?`,
        [enrollmentId]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Enrollment updated successfully'
    });

  } catch (error: any) {
    console.error('❌ Error updating enrollment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}