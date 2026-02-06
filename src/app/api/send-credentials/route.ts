import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
/* eslint-disable */

export async function POST(request: NextRequest) {
  try {
    const { 
      studentEmail, 
      studentName, 
      courseName, 
      amount = 'PKR 25,000',
      paymentMethod = 'JazzCash',
      username: customUsername,
      password: customPassword,
      isResend = false
    } = await request.json();

    // Validate required fields
    if (!studentEmail || !studentName) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Student email and name are required' 
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentEmail)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email format' 
        },
        { status: 400 }
      );
    }

    // Generate or use provided credentials
    let username: string;
    let password: string;

    if (isResend && customUsername && customPassword) {
      // Use provided credentials for resend
      username = customUsername;
      password = customPassword;
    } else {
      // Generate new credentials
      const cleanName = studentName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
      const randomNum = Math.floor(100 + Math.random() * 900); // 3-digit random number
      username = `${cleanName}${randomNum}`;
      
      // Generate strong password: 8 characters mix of letters, numbers, and special chars
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      password = '';
      for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'tauheeddeveloper13@gmail.com',
        pass: process.env.EMAIL_PASS || 'ramo reiv jlsy ogsg'
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify transporter connection
    try {
      await transporter.verify();
      console.log('✅ Email transporter is ready');
    } catch (verifyError) {
      console.error('❌ Email transporter verification failed:', verifyError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email service configuration error',
          error: verifyError 
        },
        { status: 500 }
      );
    }

    // Email content
    const mailOptions = {
      from: `"Course Portal" <${process.env.EMAIL_USER || 'tauheeddeveloper13@gmail.com'}>`,
      to: studentEmail,
      subject: `Your Login Credentials - ${courseName || 'Course Enrollment'}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Login Credentials</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9fafb;
            }
            .container {
              background-color: white;
              border-radius: 12px;
              padding: 30px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              color: #7C3AED;
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .greeting {
              color: #4B5563;
              margin-bottom: 25px;
            }
            .credentials-box {
              background-color: #f3f4f6;
              border-left: 4px solid #7C3AED;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .credential-item {
              margin-bottom: 15px;
            }
            .label {
              color: #6B7280;
              font-size: 14px;
              font-weight: 600;
              margin-bottom: 5px;
            }
            .value {
              font-family: 'Courier New', monospace;
              font-size: 18px;
              font-weight: bold;
              color: #111827;
              background-color: white;
              padding: 10px 15px;
              border-radius: 6px;
              border: 1px solid #D1D5DB;
            }
            .info-box {
              background-color: #E0E7FF;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
              font-size: 14px;
              color: #4B5563;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #E5E7EB;
              text-align: center;
              color: #6B7280;
              font-size: 12px;
            }
            .btn {
              display: inline-block;
              background-color: #7C3AED;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎓 Course Portal</div>
              <h1 style="color: #111827; margin-bottom: 10px;">Welcome to Your Course!</h1>
            </div>
            
            <p class="greeting">Dear <strong>${studentName}</strong>,</p>
            
            <p>Your payment has been verified successfully! 🎉</p>
            
            ${courseName ? `<p><strong>Course:</strong> ${courseName}</p>` : ''}
            ${amount ? `<p><strong>Amount:</strong> ${amount}</p>` : ''}
            ${paymentMethod ? `<p><strong>Payment Method:</strong> ${paymentMethod}</p>` : ''}
            
            <div class="credentials-box">
              <h2 style="color: #7C3AED; margin-top: 0;">Your Login Credentials</h2>
              <p style="color: #6B7280; margin-bottom: 20px;">Use these credentials to access your course portal:</p>
              
              <div class="credential-item">
                <div class="label">Username / Email</div>
                <div class="value">${username}</div>
              </div>
              
              <div class="credential-item">
                <div class="label">Password</div>
                <div class="value">${password}</div>
              </div>
            </div>
            
            <div class="info-box">
              <strong>🔒 Security Note:</strong>
              <p style="margin: 5px 0 0 0;">
                For security reasons, please:
                <ul style="margin: 5px 0 0 0; padding-left: 20px;">
                  <li>Change your password after first login</li>
                  <li>Do not share these credentials with anyone</li>
                  <li>Keep this email secure</li>
                </ul>
              </p>
            </div>
            
            <div style="text-align: center;">
              <a href="#" class="btn">Login to Portal</a>
            </div>
            
            <p>If you have any questions or need assistance, please contact our support team.</p>
            
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>© ${new Date().getFullYear()} Course Portal. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to Your Course Portal!

Dear ${studentName},

Your payment has been verified successfully!

Course: ${courseName || 'Course Enrollment'}
Amount: ${amount}
Payment Method: ${paymentMethod}

Your Login Credentials:
-------------------
Username/Email: ${username}
Password: ${password}
-------------------

For security reasons, please:
1. Change your password after first login
2. Do not share these credentials with anyone
3. Keep this email secure

Login to your portal using the above credentials.

If you have any questions or need assistance, please contact our support team.

This is an automated email. Please do not reply to this message.

© ${new Date().getFullYear()} Course Portal. All rights reserved.
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', {
      to: studentEmail,
      messageId: info.messageId,
      timestamp: new Date().toISOString()
    });

    // Return success response with credentials
    return NextResponse.json({
      success: true,
      message: 'Credentials sent successfully',
      emailInfo: {
        to: studentEmail,
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected
      },
      credentials: {
        username,
        password,
        studentEmail,
        studentName,
        courseName,
        sentAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Error sending credentials:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to send credentials',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to test email configuration
export async function GET(request: NextRequest) {
  try {
    // Test email configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'tauheeddeveloper13@gmail.com',
        pass: process.env.EMAIL_PASS || 'ramo reiv jlsy ogsg'
      }
    });

    await transporter.verify();
    
    return NextResponse.json({
      success: true,
      message: 'Email configuration is valid',
      emailUser: process.env.EMAIL_USER ? 'Set (hidden)' : 'Not set'
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Email configuration error',
      error: error.message
    }, { status: 500 });
  }
}