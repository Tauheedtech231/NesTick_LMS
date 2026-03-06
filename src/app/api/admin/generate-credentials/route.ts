// /app/api/admin/generate-credentials/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import nodemailer from 'nodemailer';
/* eslint-disable */
export async function POST(request: NextRequest) {
  let connection;
  try {
    const { studentId, enrollmentId, studentName, studentEmail, course, courseId } = await request.json();

    console.log('🔍 Generating credentials for:', { enrollmentId, studentEmail });

    if (!enrollmentId || !studentEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Check if enrollment exists and is verified
    const [enrollment] = await connection.execute(
      'SELECT payment_status FROM enrollments WHERE id = ?',
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

    // Generate credentials
    const username = studentEmail.split('@')[0] + Math.floor(Math.random() * 1000);
    const password = Math.random().toString(36).slice(-8) + Math.floor(Math.random() * 100);

    // ✅ Store directly in enrollments table
    await connection.execute(
      `UPDATE enrollments 
       SET username = ?,
           password = ?,
           credentials_sent = TRUE,
           credentials_sent_at = NOW()
       WHERE id = ?`,
      [username, password, enrollmentId]
    );

    // Send email
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: '"Nestick LMS" <tauheeddeveloper13@gmail.com>',
        to: studentEmail,
        subject: 'Your Login Credentials - Nestick LMS',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1E3A8A;">Welcome to Nestick LMS!</h2>
            <p>Dear ${studentName},</p>
            <p>Your enrollment for <strong>${course}</strong> has been confirmed.</p>
            
            <div style="background-color: #F4F6F8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #0B1C3D; margin-top: 0;">Your Login Credentials</h3>
              <p><strong>Username:</strong> <span style="font-family: monospace;">${username}</span></p>
              <p><strong>Password:</strong> <span style="font-family: monospace;">${password}</span></p>
              <p><strong>Login URL:</strong> <a href="${process.env.NEXT_PUBLIC_APP_URL}/lms/auth/login?type=student">${process.env.NEXT_PUBLIC_APP_URL}/lms/auth/login</a></p>
            </div>
            
            <p style="color: #B11217; font-size: 14px;">
              ⚠️ Please change your password after first login for security.
            </p>
            
            <p>Best regards,<br>Nestick LMS Team</p>
          </div>
        `
      });
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
        password,
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