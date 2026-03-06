import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, generateRandomPassword } from '@/lib/password';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
/* eslint-disable */
// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tauheeddeveloper13@gmail.com',
    pass: 'ramo reiv jlsy ogsg' // Your App Password
  }
});

export async function POST(request: NextRequest) {
  try {
    const { instructorId, email: providedEmail, resetPassword, name, course } = await request.json();

    console.log('🔧 Resetting credentials for instructor:', instructorId);

    if (!instructorId) {
      return NextResponse.json(
        { success: false, error: 'Instructor ID is required' },
        { status: 400 }
      );
    }

    // Get instructor details
    const instructors = await query<any[]>(
      `SELECT i.id, i.name, i.email, i.course_id, c.title as course_title
       FROM instructors i
       LEFT JOIN courses c ON i.course_id = c.id
       WHERE i.id = ?`,
      [instructorId]
    );

    if (!instructors || instructors.length === 0) {
      console.log('❌ Instructor not found:', instructorId);
      return NextResponse.json(
        { success: false, error: 'Instructor not found' },
        { status: 404 }
      );
    }

    const instructor = instructors[0];
    const targetEmail = providedEmail || instructor.email;

    // Check if credentials exist
    const existingCreds = await query<any[]>(
      'SELECT * FROM instructor_credentials WHERE instructor_id = ?',
      [instructorId]
    );

    let newPassword = '';
    let passwordHash = '';

    if (resetPassword) {
      // Generate new password
      newPassword = generateRandomPassword();
      passwordHash = await hashPassword(newPassword);

      if (existingCreds.length > 0) {
        // Update existing credentials
        await query(
          `UPDATE instructor_credentials 
           SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
           WHERE instructor_id = ?`,
          [passwordHash, instructorId]
        );
        console.log('✅ Password updated for existing credentials');
      } else {
        // Create new credentials
        await query(
          `INSERT INTO instructor_credentials (id, instructor_id, email, password_hash, role, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, 'instructor', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [uuidv4(), instructorId, instructor.email, passwordHash]
        );
        console.log('✅ New credentials created');
      }
    } else {
      // Get existing password hash
      if (existingCreds.length > 0) {
        passwordHash = existingCreds[0].password_hash;
        console.log('📋 Using existing password hash');
      } else {
        // Create new credentials with random password if none exist
        newPassword = generateRandomPassword();
        passwordHash = await hashPassword(newPassword);
        
        await query(
          `INSERT INTO instructor_credentials (id, instructor_id, email, password_hash, role, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, 'instructor', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [uuidv4(), instructorId, instructor.email, passwordHash]
        );
        console.log('✅ New credentials created with random password');
      }
    }

    // Prepare email content
    const passwordText = resetPassword ? newPassword : 'your existing password';
    const loginUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #B11217 0%, #D32F2F 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
            margin: -20px -20px 20px -20px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 20px;
          }
          .credentials-box {
            background-color: #f8f9fa;
            border-left: 4px solid #B11217;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .credentials-box p {
            margin: 10px 0;
          }
          .label {
            font-weight: bold;
            color: #555;
            display: inline-block;
            width: 100px;
          }
          .value {
            color: #B11217;
            font-weight: 600;
            font-size: 16px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #B11217 0%, #D32F2F 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: 600;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #888;
            font-size: 14px;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeeba;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Nestick LMS - Instructor Credentials</h1>
          </div>
          
          <div class="content">
            <p>Dear <strong>${instructor.name}</strong>,</p>
            
            <p>Your instructor account credentials for Nestick LMS are ready. Please find your login details below:</p>
            
            <div class="credentials-box">
              <p>
                <span class="label">Email:</span>
                <span class="value">${instructor.email}</span>
              </p>
              <p>
                <span class="label">Password:</span>
                <span class="value">${passwordText}</span>
              </p>
              ${instructor.course_title ? `
              <p>
                <span class="label">Course:</span>
                <span class="value">${instructor.course_title}</span>
              </p>
              ` : ''}
            </div>
            
            <div style="text-align: center;">
              <a href="${loginUrl}/lms/auth/login?type=instructor" class="button">
                Login to Instructor Portal
              </a>
            </div>
            
            <div class="warning">
              ⚠️ <strong>Important:</strong> Please keep your credentials secure and do not share them with anyone. 
              For security reasons, we recommend changing your password after first login.
            </div>
            
            <p><strong>Login Instructions:</strong></p>
            <ul style="color: #666; padding-left: 20px;">
              <li>Visit: <a href="${loginUrl}/lms/auth/login?type=instructor">${loginUrl}/lms/auth/login</a></li>
              <li>Select "Instructor" as login type</li>
              <li>Enter your email and password provided above</li>
              <li>You'll be redirected to your instructor dashboard</li>
            </ul>
            
            <p>If you have any issues logging in, please contact the administrator immediately.</p>
            
            <p>Best regards,<br>
            <strong>Nestick LMS Team</strong></p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Nestick LMS. All rights reserved.</p>
            <p style="font-size: 12px;">This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
      Nestick LMS - Instructor Credentials

      Dear ${instructor.name},

      Your instructor account credentials for Nestick LMS are ready.

      LOGIN CREDENTIALS:
      Email: ${instructor.email}
      Password: ${passwordText}
      ${instructor.course_title ? `Course: ${instructor.course_title}` : ''}

      LOGIN URL: ${loginUrl}/lms/auth/login?type=instructor

      INSTRUCTIONS:
      1. Go to ${loginUrl}/lms/auth/login
      2. Select "Instructor" as login type
      3. Enter your email and password
      4. Access your instructor dashboard

      IMPORTANT: Keep your credentials secure. Change password after first login.

      Best regards,
      Nestick LMS Team
    `;

    // Send email
    console.log('📧 Sending email to:', targetEmail);
    
    const mailOptions = {
      from: '"Nestick LMS" <tauheeddeveloper13@gmail.com>',
      to: targetEmail,
      subject: resetPassword 
        ? '🔐 Your New Instructor Login Credentials - Nestick LMS' 
        : '📧 Your Instructor Login Credentials - Nestick LMS',
      html: emailHtml,
      text: emailText
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);
    } catch (emailError) {
      console.error('❌ Failed to send email:', emailError);
      
      // Still return success but indicate email failed
      return NextResponse.json({
        success: true,
        warning: 'Password reset but email failed to send. Please check email configuration.',
        message: resetPassword 
          ? 'Password reset successfully! But email delivery failed.'
          : 'Credentials updated but email delivery failed.',
        data: {
          emailFailed: true,
          // Only include password in development
          ...(process.env.NODE_ENV === 'development' && { newPassword })
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: resetPassword 
        ? '✅ Password reset successfully! New credentials have been sent to instructor email.'
        : '✅ Credentials resent successfully to instructor email!',
      data: {
        emailSent: true,
        email: targetEmail,
        // Only include password in development mode for debugging
        ...(process.env.NODE_ENV === 'development' && resetPassword && { newPassword })
      }
    });

  } catch (error: any) {
    console.error('❌ Error resetting password:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reset password' },
      { status: 500 }
    );
  }
}