// app/api/admin/resend-credentials/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
/* eslint-disable */

// Generate random password (8-10 characters)
function generateRandomPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    
    const { 
      studentEmail,
      studentName,
      studentPhone,
      courses,
      totalAmount,
      paymentId,
      isBulk
    } = body;

    console.log('🔍 Resend credentials for:', { 
      studentEmail, 
      coursesCount: courses?.length || 1
    });

    if (!studentEmail || !studentName) {
      return NextResponse.json(
        { success: false, error: 'Student name and email are required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Prepare courses list
    let coursesList = [];
    let totalAmountValue = totalAmount || 0;
    let paymentIdValue = paymentId || '';
    let allEnrollmentIds: string[] = [];

    if (courses && Array.isArray(courses) && courses.length > 0) {
      coursesList = courses;
      totalAmountValue = totalAmount || courses.reduce((sum, c) => sum + (c.course_price || 0), 0);
      allEnrollmentIds = courses.map(c => c.enrollmentId || c.enrollment_id).filter(Boolean);
    } else if (body.enrollmentId) {
      // Single mode fallback
      const [enrollment] = await connection.execute(
        `SELECT course_title, course_price FROM enrollments WHERE id = ?`,
        [body.enrollmentId]
      );
      coursesList = [{
        course_title: (enrollment as any[])[0]?.course_title || body.course,
        course_price: (enrollment as any[])[0]?.course_price || body.amount || 0,
        enrollmentId: body.enrollmentId
      }];
      totalAmountValue = coursesList[0].course_price;
      allEnrollmentIds = [body.enrollmentId];
    }

    // ✅ Check if student has existing credentials
    const [existingCredentials] = await connection.execute(
      `SELECT id, username, password_hash FROM instructor_credentials WHERE email = ? LIMIT 1`,
      [studentEmail]
    );

    let username: string;
    let newPassword: string;
    let isExistingUser = true;

    if ((existingCredentials as any[]).length > 0) {
      // ✅ Student exists - generate NEW password
      const existing = (existingCredentials as any[])[0];
      username = existing.username;
      newPassword = generateRandomPassword();
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password in database
      await connection.execute(
        `UPDATE instructor_credentials 
         SET password_hash = ?, updated_at = NOW()
         WHERE email = ?`,
        [hashedPassword, studentEmail]
      );
      
      console.log('✅ Updated password for existing user:', { username, email: studentEmail });
    } else {
      // ❌ Student doesn't exist - create new credentials
      isExistingUser = false;
      username = studentEmail.split('@')[0] + Math.floor(Math.random() * 1000);
      newPassword = generateRandomPassword();
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await connection.execute(
        `INSERT INTO instructor_credentials (id, instructor_id, email, username, password_hash, role, status, created_at, updated_at)
         VALUES (UUID(), ?, ?, ?, ?, 'instructor', 'active', NOW(), NOW())`,
        [studentEmail, studentEmail, username, hashedPassword]
      );
      
      console.log('✅ Created new credentials for:', { username, email: studentEmail });
    }

    // Get student phone if not provided
    let studentPhoneValue = studentPhone || '';
    if (!studentPhoneValue && studentEmail) {
      const [studentInfo] = await connection.execute(
        `SELECT student_phone FROM enrollments WHERE student_email = ? LIMIT 1`,
        [studentEmail]
      );
      if ((studentInfo as any[]).length > 0) {
        studentPhoneValue = (studentInfo as any[])[0]?.student_phone || '';
      }
    }

    // ✅ Send email with NEW credentials
    const emailHtml = buildResendEmailHtml({
      studentName,
      studentEmail: studentEmail,
      studentPhone: studentPhoneValue,
      username,
      password: newPassword,
      isExistingUser: true, // Always true for resend, we generated new password
      courses: coursesList.map(c => ({
        title: c.course_title,
        price: c.course_price,
        enrollmentId: c.enrollmentId
      })),
      totalAmount: totalAmountValue,
      paymentId: paymentIdValue,
      enrollmentIds: allEnrollmentIds,
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://neezamiyatesting.site'}/lms/auth/login?type=student`
    });

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER || 'tauheeddeveloper13@gmail.com',
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: '"Mansol Hab LMS" <tauheeddeveloper13@gmail.com>',
        to: studentEmail,
        subject: `🔐 Your Credentials Have Been Updated - Mansol Hab LMS`,
        html: emailHtml
      });

      console.log('✅ Resend email sent successfully to:', studentEmail);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      return NextResponse.json(
        { success: false, error: 'Email sending failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        studentEmail,
        studentName,
        username,
        password: newPassword,
        coursesCount: coursesList.length,
        courses: coursesList.map(c => c.course_title),
        enrollmentIds: allEnrollmentIds,
        status: 'resent',
        resentDate: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Error resending credentials:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to resend credentials' 
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

// Helper function to build resend email HTML
function buildResendEmailHtml(data: {
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  username: string;
  password: string;
  isExistingUser: boolean;
  courses: Array<{ title: string; price: number; enrollmentId: string }>;
  totalAmount: number;
  paymentId: string;
  enrollmentIds: string[];
  loginUrl: string;
}): string {
  const coursesListHtml = data.courses.map((course, index) => `
    <div style="padding: 12px; margin: 8px 0; background: #f8f9fa; border-left: 4px solid #B11217; border-radius: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-weight: bold; color: #1E3A8A;">${index + 1}. ${course.title}</span>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #666;">Enrollment ID: ${course.enrollmentId}</p>
        </div>
        <span style="background: #B11217; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">
          PKR ${(course.price || 0).toLocaleString()}
        </span>
      </div>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Credentials Updated</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f6f8; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #B11217 0%, #8B0000 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .alert-box { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .credentials-box { background: linear-gradient(135deg, #1E3A8A 0%, #0B1C3D 100%); padding: 20px; border-radius: 12px; margin: 20px 0; color: white; }
        .credentials-box h3 { margin: 0 0 15px 0; color: white; }
        .credentials-box span { background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; font-family: monospace; }
        .section-title { font-size: 18px; font-weight: bold; color: #1E3A8A; margin-bottom: 15px; border-bottom: 2px solid #B11217; padding-bottom: 8px; display: inline-block; }
        .total-box { background: linear-gradient(135deg, #B11217 0%, #8B0000 100%); color: white; padding: 15px; border-radius: 12px; text-align: center; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #B11217; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; border-top: 1px solid #eee; background: #f9fafb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Your Credentials Have Been Updated</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">New login credentials generated</p>
        </div>
        
        <div class="content">
          <h2>Dear ${data.studentName},</h2>
          
          <div class="alert-box">
            <p style="margin: 0; color: #92400E;">
              <strong>⚠️ Important:</strong> Your login credentials have been updated. 
              Please use the new password below to access your account.
            </p>
          </div>
          
          <div class="credentials-box">
            <h3>🔐 Your New Login Credentials</h3>
            <p style="margin: 8px 0;"><strong>Username:</strong> <span>${data.username}</span></p>
            <p style="margin: 8px 0;"><strong>New Password:</strong> <span>${data.password}</span></p>
            <p style="margin: 12px 0 0 0; font-size: 12px; opacity: 0.8;">
              ⚠️ Please change your password after login for security.
            </p>
          </div>
          
          <div style="margin: 25px 0;">
            <div class="section-title">📚 Your Courses (${data.courses.length} Course${data.courses.length > 1 ? 's' : ''})</div>
            ${coursesListHtml}
          </div>
          
          <div class="total-box">
            <strong style="font-size: 18px;">Total Amount: PKR ${(data.totalAmount || 0).toLocaleString()}</strong>
          </div>
          
          <div style="background: #f0f4f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>💳 Payment ID:</strong> ${data.paymentId || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>📌 Enrollment IDs:</strong> ${data.enrollmentIds.join(', ')}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.loginUrl}" class="button">Login to Your Dashboard →</a>
          </div>
          
          <div style="background: #f0f4f8; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; font-size: 13px; color: #666;">
              <strong>ℹ️ Need Help?</strong><br/>
              Contact our support team at support@mansolhab.com
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Mansol Hab LMS. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}