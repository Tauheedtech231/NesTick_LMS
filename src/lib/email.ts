// lib/email.ts
import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'tauheeddeveloper13@gmail.com',
    pass: process.env.EMAIL_PASS || 'ramo reiv jlsy ogsg', // Use the app password
  },
});
export interface EnrollmentEmailData {
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  enrollmentId: string;
  enrollmentIds?: string[]; // Add support for multiple enrollment IDs
  paymentId?: string; // Add payment ID
  courses: Array<{
    course_title: string;
    course_price: number;
  }>;
  totalAmount: number;
  enrollmentDate: string;
  status: string;
}

// Send enrollment confirmation email
export async function sendEnrollmentConfirmation(data: EnrollmentEmailData) {
  try {
    const courseList = data.courses.map((course, index) => 
      `${index + 1}. ${course.course_title} - Rs. ${course.course_price.toLocaleString()}`
    ).join('<br>');

    const mailOptions = {
      from: `"LMS Education System" <${process.env.EMAIL_USER}>`,
      to: data.studentEmail,
      subject: `Enrollment Confirmation - ${data.enrollmentId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Enrollment Confirmation</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f6f8;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #0B1C3D 0%, #1E3A8A 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .header p {
              margin: 10px 0 0;
              opacity: 0.9;
            }
            .content {
              padding: 30px;
            }
            .section {
              margin-bottom: 25px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 20px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #0B1C3D;
              margin-bottom: 15px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              padding: 8px 0;
            }
            .info-label {
              font-weight: 600;
              color: #6b7280;
            }
            .info-value {
              color: #1f2937;
              font-weight: 500;
            }
            .course-item {
              padding: 10px 0;
              border-bottom: 1px solid #f3f4f6;
              display: flex;
              justify-content: space-between;
            }
            .course-name {
              color: #374151;
            }
            .course-price {
              font-weight: bold;
              color: #B11217;
            }
            .total-row {
              margin-top: 15px;
              padding-top: 15px;
              border-top: 2px solid #e5e7eb;
              display: flex;
              justify-content: space-between;
              font-size: 18px;
              font-weight: bold;
            }
            .total-label {
              color: #0B1C3D;
            }
            .total-amount {
              color: #B11217;
              font-size: 20px;
            }
            .status-badge {
              display: inline-block;
              padding: 5px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              background-color: #FEF3C7;
              color: #92400E;
            }
            .instructions {
              background-color: #f9fafb;
              padding: 15px;
              border-radius: 8px;
              margin-top: 20px;
            }
            .instructions h4 {
              margin: 0 0 10px 0;
              color: #0B1C3D;
            }
            .instructions ul {
              margin: 0;
              padding-left: 20px;
            }
            .instructions li {
              margin-bottom: 8px;
              color: #4b5563;
            }
            .footer {
              background-color: #f9fafb;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #9ca3af;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #B11217;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              margin-top: 20px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Enrollment Confirmation</h1>
              <p>Thank you for choosing LMS Education System</p>
            </div>
            
            <div class="content">
              <div class="section">
                <div class="section-title">
                  📋 Enrollment Details
                </div>
                <div class="info-row">
                  <span class="info-label">Enrollment ID:</span>
                  <span class="info-value">${data.enrollmentId}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Date:</span>
                  <span class="info-value">${data.enrollmentDate}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Status:</span>
                  <span class="status-badge">Pending Payment</span>
                </div>
              </div>

              <div class="section">
                <div class="section-title">
                  👤 Student Information
                </div>
                <div class="info-row">
                  <span class="info-label">Full Name:</span>
                  <span class="info-value">${data.studentName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email Address:</span>
                  <span class="info-value">${data.studentEmail}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Phone Number:</span>
                  <span class="info-value">${data.studentPhone}</span>
                </div>
              </div>

              <div class="section">
                <div class="section-title">
                  📚 Courses Enrolled
                </div>
                ${courseList}
                <div class="total-row">
                  <span class="total-label">Total Amount:</span>
                  <span class="total-amount">Rs. ${data.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div class="instructions">
                <h4>📌 Next Steps:</h4>
                <ul>
                  <li>Your enrollment is currently pending payment verification</li>
                  <li>Please complete the payment using the bank details provided in your voucher</li>
                  <li>Upload the payment slip through your dashboard</li>
                  <li>Once verified, you'll receive access to all course materials within 24-48 hours</li>
                  <li>For any questions, contact our support team at support@lmseducation.com</li>
                </ul>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">
                  Go to Dashboard
                </a>
              </div>
            </div>

            <div class="footer">
              <p>© ${new Date().getFullYear()} LMS Education System. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Enrollment confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Error sending enrollment confirmation email:', error);
    return { success: false, error };
  }
}

// Send payment verification email
export async function sendPaymentVerificationEmail(
  studentEmail: string,
  studentName: string,
  enrollmentId: string,
  status: 'pending' | 'verified' | 'rejected'
) {
  try {
    let subject = '';
    let html = '';

    if (status === 'pending') {
      subject = `Payment Received - ${enrollmentId}`;
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Received</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f6f8;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #0B1C3D 0%, #1E3A8A 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .content {
              padding: 30px;
            }
            .info-box {
              background-color: #f9fafb;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .status-badge {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: bold;
              background-color: #FEF3C7;
              color: #92400E;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #B11217;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              margin-top: 20px;
              font-weight: bold;
            }
            .footer {
              background-color: #f9fafb;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #9ca3af;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 Payment Received</h1>
            </div>
            <div class="content">
              <h2>Dear ${studentName},</h2>
              <p>We have received your payment for enrollment <strong>${enrollmentId}</strong>.</p>
              
              <div class="info-box">
                <p><strong>Status:</strong> <span class="status-badge">Pending Verification</span></p>
                <p><strong>Enrollment ID:</strong> ${enrollmentId}</p>
              </div>
              
              <p>Our team will verify your payment within 24-48 hours. You will receive another email once verified.</p>
              <p>If you have any questions, please contact our support team.</p>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">
                  Track Enrollment
                </a>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} LMS Education System. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (status === 'verified') {
      subject = `Payment Verified - ${enrollmentId}`;
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Verified</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f6f8;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #0B1C3D 0%, #1E3A8A 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .content {
              padding: 30px;
            }
            .success-box {
              background-color: #f0fdf4;
              border: 1px solid #bbf7d0;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              text-align: center;
            }
            .status-badge {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: bold;
              background-color: #10B981;
              color: white;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #B11217;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              margin-top: 20px;
              font-weight: bold;
            }
            .footer {
              background-color: #f9fafb;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #9ca3af;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Payment Verified</h1>
            </div>
            <div class="content">
              <h2>Dear ${studentName},</h2>
              <p>Great news! Your payment for enrollment <strong>${enrollmentId}</strong> has been verified.</p>
              
              <div class="success-box">
                <span class="status-badge">✓ Payment Confirmed</span>
                <p style="margin-top: 10px;"><strong>Enrollment ID:</strong> ${enrollmentId}</p>
              </div>
              
              <p>You now have full access to all your enrolled courses. You can start learning immediately!</p>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">
                  Start Learning
                </a>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} LMS Education System. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (status === 'rejected') {
      subject = `Payment Issue - ${enrollmentId}`;
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Issue</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f6f8;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #B11217 0%, #991b1b 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .content {
              padding: 30px;
            }
            .warning-box {
              background-color: #fef9e3;
              border: 1px solid #fde047;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #B11217;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              margin-top: 20px;
              font-weight: bold;
            }
            .footer {
              background-color: #f9fafb;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #9ca3af;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Payment Issue</h1>
            </div>
            <div class="content">
              <h2>Dear ${studentName},</h2>
              <p>We encountered an issue while verifying your payment for enrollment <strong>${enrollmentId}</strong>.</p>
              
              <div class="warning-box">
                <p><strong>Please check:</strong></p>
                <ul>
                  <li>Ensure the payment amount matches your voucher total</li>
                  <li>Verify the bank account details used for payment</li>
                  <li>Upload a clear screenshot of the payment confirmation</li>
                </ul>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">
                  Upload Again
                </a>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} LMS Education System. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    const mailOptions = {
      from: `"LMS Education System" <${process.env.EMAIL_USER}>`,
      to: studentEmail,
      subject: subject,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Payment verification email sent (${status}):`, info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Error sending payment verification email:', error);
    return { success: false, error };
  }
}

// Send payment received confirmation email (alias for sendPaymentVerificationEmail with pending status)
export async function sendPaymentReceivedEmail(
  studentEmail: string,
  studentName: string,
  enrollmentId: string
) {
  return sendPaymentVerificationEmail(studentEmail, studentName, enrollmentId, 'pending');
}