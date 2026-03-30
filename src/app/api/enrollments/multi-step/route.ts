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

export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();

    console.log('📦 Multi-step enrollment data:', body);

    const {
      studentEmail,
      fullName,
      phone,
      cnic,
      address,
      education,
      experience,
      cnicFrontUrl,
      cnicBackUrl,
      educationalDocUrl,
      paymentSlipUrl
    } = body;

    // Validation
    if (!studentEmail || !fullName || !phone || !cnic || !address || !education) {
      return NextResponse.json({
        success: false,
        error: 'Missing required student information'
      }, { status: 400 });
    }

    if (!cnicFrontUrl || !cnicBackUrl || !educationalDocUrl || !paymentSlipUrl) {
      return NextResponse.json({
        success: false,
        error: 'All document uploads are required'
      }, { status: 400 });
    }

    connection = await getConnection();

    // Get cart items for the student
    const [cartRows] = await connection.execute(
      'SELECT course_id, course_title, course_price FROM cart_bucket WHERE student_email = ? ORDER BY created_at ASC',
      [studentEmail]
    );

    const cartItems = cartRows as any[];

    if (!cartItems.length) {
      return NextResponse.json({
        success: false,
        error: 'No courses in cart to enroll'
      }, { status: 400 });
    }

    // Check for existing enrollments
    const enrollmentIds: string[] = [];
    const enrolledCourses: any[] = [];

    for (const item of cartItems) {
      const [existing] = await connection.execute(
        'SELECT id FROM enrollments WHERE student_email = ? AND course_id = ? AND status != "cancelled"',
        [studentEmail, item.course_id]
      );

      if ((existing as any[]).length > 0) {
        return NextResponse.json({
          success: false,
          error: `Already enrolled in ${item.course_title}`
        }, { status: 400 });
      }

      // Create enrollment for each course
      const enrollmentId = uuidv4();

      await connection.execute(
        `INSERT INTO enrollments (
          id, student_id, student_email, student_name, student_phone, student_cnic,
          student_address, student_education, student_experience,
          cnic_front_url, cnic_back_url, educational_doc_url,
          course_id, course_title, course_price,
          payment_amount, slip_uploaded,
          status, enrollment_date, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW(), NOW())`,
        [
          enrollmentId,
          null, // student_id
          studentEmail,
          fullName,
          phone,
          cnic,
          address,
          education,
          experience || '',
          cnicFrontUrl,
          cnicBackUrl,
          educationalDocUrl,
          item.course_id,
          item.course_title,
          item.course_price,
          item.course_price, // payment_amount
          true // slip_uploaded
        ]
      );

      // Insert payment slip record
      await connection.execute(
        `INSERT INTO payment_slips (
          id, enrollment_id, student_id, slip_url, status, uploaded_at
        ) VALUES (?, ?, ?, ?, 'pending', NOW())`,
        [
          uuidv4(),
          enrollmentId,
          null, // student_id
          paymentSlipUrl
        ]
      );

      enrollmentIds.push(enrollmentId);
      enrolledCourses.push({
        id: enrollmentId,
        courseTitle: item.course_title,
        coursePrice: item.course_price
      });
    }

    // Clear the cart
    await connection.execute(
      'DELETE FROM cart_bucket WHERE student_email = ?',
      [studentEmail]
    );

    // Send confirmation emails
    const totalAmount = cartItems.reduce((sum, item) => sum + Number(item.course_price || 0), 0);

    try {
      // Email to student
      const studentMailOptions = {
        from: '"Mansol Hab School of Skills" <tauheeddeveloper13@gmail.com>',
        to: studentEmail,
        subject: `✅ Enrollment Confirmed: ${cartItems.length} Course${cartItems.length > 1 ? 's' : ''}`,
        html: generateStudentEmailHTML(fullName, enrolledCourses, totalAmount, enrollmentIds[0])
      };

      // Email to admin
      const adminMailOptions = {
        from: '"Mansol Hab LMS" <tauheeddeveloper13@gmail.com>',
        to: ADMIN_EMAIL,
        subject: `🔔 New Multi-Course Enrollment: ${fullName}`,
        html: generateAdminEmailHTML(fullName, studentEmail, enrolledCourses, totalAmount, enrollmentIds)
      };

      await Promise.all([
        transporter.sendMail(studentMailOptions),
        transporter.sendMail(adminMailOptions)
      ]);

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the enrollment if email fails
    }

    return NextResponse.json({
      success: true,
      data: {
        enrollmentIds,
        enrolledCourses,
        totalAmount,
        message: 'Enrollment completed successfully. Documents will be verified within 24-48 hours.'
      }
    });

  } catch (error) {
    console.error('Multi-step enrollment error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to complete enrollment'
    }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

function generateStudentEmailHTML(studentName: string, courses: any[], totalAmount: number, enrollmentId: string) {
  const currentDate = new Date().toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const coursesList = courses.map(course =>
    `<li>${course.courseTitle} - PKR ${course.coursePrice?.toLocaleString() || '0'}</li>`
  ).join('');

  return `
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
        .courses-list { margin: 15px 0; }
        .courses-list li { margin-bottom: 8px; }
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

          <p>Thank you for enrolling in ${courses.length} course${courses.length > 1 ? 's' : ''} at Mansol Hab School of Skills. We're excited to have you on board!</p>

          <div class="info-box">
            <h3 style="margin-top: 0; color: #0B1C3D;">📋 Enrollment Details</h3>
            <div class="info-item">
              <span class="info-label">Enrollment ID:</span> ${enrollmentId}
            </div>
            <div class="info-item">
              <span class="info-label">Courses Enrolled:</span>
              <ul class="courses-list">${coursesList}</ul>
            </div>
            <div class="info-item">
              <span class="info-label">Date:</span> ${currentDate}
            </div>
            <div class="info-item">
              <span class="info-label">Total Amount:</span> <span class="amount">PKR ${totalAmount?.toLocaleString() || '0'}</span>
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
  `;
}

function generateAdminEmailHTML(studentName: string, studentEmail: string, courses: any[], totalAmount: number, enrollmentIds: string[]) {
  const currentDate = new Date().toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const coursesList = courses.map(course =>
    `<li>${course.courseTitle} - PKR ${course.coursePrice?.toLocaleString() || '0'} (ID: ${course.id})</li>`
  ).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Multi-Course Enrollment</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0B1C3D 0%, #1E3A8A 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #B11217; }
        .courses-list { margin: 15px 0; }
        .courses-list li { margin-bottom: 8px; }
        .amount { font-size: 18px; color: #B11217; font-weight: bold; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 14px; }
        .action-button { display: inline-block; padding: 12px 24px; background-color: #1E3A8A; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📢 New Multi-Course Enrollment</h1>
        </div>
        <div class="content">
          <p><strong>Student:</strong> ${studentName}</p>
          <p><strong>Email:</strong> ${studentEmail}</p>
          <p><strong>Enrollment Date:</strong> ${currentDate}</p>

          <div class="info-box">
            <h3 style="margin-top: 0; color: #0B1C3D;">📚 Enrolled Courses</h3>
            <ul class="courses-list">${coursesList}</ul>
            <p><strong>Total Amount:</strong> <span class="amount">PKR ${totalAmount?.toLocaleString() || '0'}</span></p>
          </div>

          <p>This student has uploaded all required documents and payment slip. Please verify them in the admin panel.</p>

          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/lms/admin" class="action-button">View in Admin Panel</a>
          </div>

          <div class="footer">
            <p>Mansol Hab School of Skills - Enrollment System</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}