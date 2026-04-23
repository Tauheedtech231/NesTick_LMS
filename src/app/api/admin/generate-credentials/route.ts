// app/api/admin/generate-credentials/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import nodemailer from 'nodemailer';
/* eslint-disable */

// Generate random password
function generateRandomPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Generate username from email
function generateUsername(email: string): string {
  const base = email.split('@')[0];
  const random = Math.floor(Math.random() * 999).toString().padStart(3, '0');
  return `${base}_${random}`;
}

export async function POST(request: NextRequest) {
  let connection;
  try {
    const { studentId, enrollmentId, studentName, studentEmail, course, courseId, isResend } = await request.json();

    console.log('🔍 Generating credentials for:', { enrollmentId, studentEmail, isResend });

    if (!enrollmentId || !studentEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // ✅ STEP 1: Check if enrollment exists
    const [enrollment] = await connection.execute(
      'SELECT payment_status, username FROM enrollments WHERE id = ?',
      [enrollmentId]
    );

    if ((enrollment as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    if ((enrollment as any[])[0]?.payment_status !== 'verified') {
      return NextResponse.json(
        { success: false, error: 'Payment must be verified first' },
        { status: 400 }
      );
    }

    // ✅ STEP 2: Check if student already has credentials from any enrollment
    const [existingEnrollment] = await connection.execute(
      `SELECT username, password FROM enrollments 
       WHERE student_email = ? AND username IS NOT NULL 
       LIMIT 1`,
      [studentEmail]
    );

    let username: string;
    let password: string;
    let isExistingUser = false;

    if ((existingEnrollment as any[]).length > 0) {
      // Student already has credentials - reuse them
      const existing = (existingEnrollment as any[])[0];
      username = existing.username;
      password = existing.password;
      isExistingUser = true;
      
      console.log('✅ Existing user, reusing credentials:', { username, studentEmail });
      
      // If resend requested, generate new password
      if (isResend) {
        password = generateRandomPassword();
        username = generateUsername(studentEmail);
        console.log('✅ Resend: Generating new credentials');
      }
    } else {
      // New student - generate new credentials
      username = generateUsername(studentEmail);
      password = generateRandomPassword();
      console.log('✅ New user, generating fresh credentials');
    }

    // ✅ STEP 3: Get ALL verified courses for this student
    const [allCourses] = await connection.execute(
      `SELECT id, course_title, course_price, payment_status
       FROM enrollments 
       WHERE student_email = ?`,
      [studentEmail]
    );

    const verifiedCourses = (allCourses as any[]).filter(c => c.payment_status === 'verified');
    const pendingCourses = (allCourses as any[]).filter(c => c.payment_status === 'pending');

    // ✅ STEP 4: Update ALL enrollments of this student with same credentials
    await connection.execute(
      `UPDATE enrollments 
       SET username = ?, password = ?, credentials_sent = TRUE, credentials_sent_at = NOW()
       WHERE student_email = ?`,
      [username, password, studentEmail]
    );

    // ✅ STEP 5: Calculate total amount
    const totalAmount = verifiedCourses.reduce((sum, c) => sum + (c.course_price || 0), 0);

    // ✅ STEP 6: Build courses list HTML for email
    const allCoursesList = [...verifiedCourses, ...pendingCourses];
    const coursesListHtml = allCoursesList.map((c, index) => `
      <div style="padding: 12px; margin: 8px 0; background: #f8f9fa; border-left: 4px solid ${c.payment_status === 'verified' ? '#10B981' : '#F59E0B'}; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="font-weight: bold; color: #1E3A8A;">${index + 1}. ${c.course_title}</span>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #666;">Enrollment ID: ${c.id}</p>
          </div>
          <div style="text-align: right;">
            <span style="background: #B11217; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">
              PKR ${(c.course_price || 0).toLocaleString()}
            </span>
            <p style="margin: 4px 0 0 0; font-size: 10px; color: ${c.payment_status === 'verified' ? '#10B981' : '#F59E0B'};">
              ${c.payment_status === 'verified' ? '✅ Verified' : '⏳ Pending Verification'}
            </p>
          </div>
        </div>
      </div>
    `).join('');

    // ✅ STEP 7: Send email
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const isFirstTime = !isExistingUser && !isResend;
      const isResendEmail = isResend === true;
      
      let subject = '';
      let emailHtml = '';

      if (isResendEmail) {
        subject = `🔐 Your Credentials Have Been Updated - Mansol Hab LMS`;
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1E3A8A;">🔐 Credentials Updated</h2>
            <p>Dear ${studentName},</p>
            <p>Your login credentials have been updated as requested.</p>
            
            <div style="background-color: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
              <h3 style="color: #0B1C3D; margin-top: 0;">Your New Login Credentials</h3>
              <p><strong>Username:</strong> <span style="font-family: monospace;">${username}</span></p>
              <p><strong>Password:</strong> <span style="font-family: monospace;">${password}</span></p>
              <p><strong>Login URL:</strong> <a href="${process.env.NEXT_PUBLIC_APP_URL}/lms/auth/login?type=student">${process.env.NEXT_PUBLIC_APP_URL}/lms/auth/login</a></p>
            </div>
            
            <div style="margin: 20px 0;">
              <h3 style="color: #1E3A8A;">📚 Your Courses</h3>
              ${coursesListHtml}
              <div style="background-color: #B11217; color: white; padding: 12px; border-radius: 8px; margin-top: 15px; text-align: center;">
                <strong>Total Amount: PKR ${totalAmount.toLocaleString()}</strong>
              </div>
            </div>
            
            <p style="color: #B11217; font-size: 14px;">⚠️ Please change your password after first login for security.</p>
            <p>Best regards,<br>Mansol Hab LMS Team</p>
          </div>
        `;
      } else if (isFirstTime) {
        subject = `🎓 Welcome to Mansol Hab LMS - Your Login Credentials`;
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1E3A8A;">Welcome to Mansol Hab LMS!</h2>
            <p>Dear ${studentName},</p>
            <p>Your enrollment has been confirmed. You can now access all your courses.</p>
            
            <div style="background-color: #F4F6F8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #0B1C3D; margin-top: 0;">Your Login Credentials</h3>
              <p><strong>Username:</strong> <span style="font-family: monospace;">${username}</span></p>
              <p><strong>Password:</strong> <span style="font-family: monospace;">${password}</span></p>
              <p><strong>Login URL:</strong> <a href="${process.env.NEXT_PUBLIC_APP_URL}/lms/auth/login?type=student">${process.env.NEXT_PUBLIC_APP_URL}/lms/auth/login</a></p>
            </div>
            
            <div style="margin: 20px 0;">
              <h3 style="color: #1E3A8A;">📚 Your Courses</h3>
              ${coursesListHtml}
              <div style="background-color: #B11217; color: white; padding: 12px; border-radius: 8px; margin-top: 15px; text-align: center;">
      
              </div>
            </div>
            
            <p style="color: #B11217; font-size: 14px;">⚠️ Please change your password after first login for security.</p>
            <p>Best regards,<br>Mansol Hab LMS Team</p>
          </div>
        `;
      } else {
        subject = `🎓 New Course Added to Your Account - Mansol Hab LMS`;
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1E3A8A;">🎓 New Course Added!</h2>
            <p>Dear ${studentName},</p>
            <p>The course <strong>"${course}"</strong> has been added to your account.</p>
            
            <div style="background-color: #D1FAE5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
              <h3 style="color: #0B1C3D; margin-top: 0;">Your Existing Credentials</h3>
              <p><strong>Username:</strong> <span style="font-family: monospace;">${username}</span></p>
              <p><strong>Password:</strong> Use your existing password</p>
              <p><strong>Login URL:</strong> <a href="${process.env.NEXT_PUBLIC_APP_URL}/lms/auth/login?type=student">${process.env.NEXT_PUBLIC_APP_URL}/lms/auth/login</a></p>
            </div>
            
            <div style="margin: 20px 0;">
              <h3 style="color: #1E3A8A;">📚 All Your Courses</h3>
              ${coursesListHtml}
              <div style="background-color: #B11217; color: white; padding: 12px; border-radius: 8px; margin-top: 15px; text-align: center;">
                
              </div>
            </div>
            
            <p>You can login with your existing credentials to access this new course.</p>
            <p>Best regards,<br>Mansol Hab LMS Team</p>
          </div>
        `;
      }

      await transporter.sendMail({
        from: '"Mansol Hab LMS" <tauheeddeveloper13@gmail.com>',
        to: studentEmail,
        subject: subject,
        html: emailHtml
      });
      
      console.log('✅ Email sent to:', studentEmail);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        enrollmentId,
        studentId,
        studentName,
        studentEmail,
        course,
        username,
        password: (isExistingUser && !isResend) ? null : password,
        isExistingUser: (isExistingUser && !isResend),
        isResend: isResend || false,
        coursesCount: verifiedCourses.length,
        status: 'sent',
        sentDate: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Error generating credentials:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate credentials' 
      }, 
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}