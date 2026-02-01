import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
/* eslint-disable */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, name, email, password, courses, totalStudents, loginUrl } = body

    // Create transporter with Gmail - FIXED CONFIGURATION
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'tauheeddeveloper13@gmail.com', // Your Gmail
        pass: 'ramo reiv jlsy ogsg' // Your App Password
      }
    })

    // Prepare course details HTML
    const courseDetails = Array.isArray(courses) && courses.length > 0 
      ? courses.map((course: any) => `
        <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-left: 4px solid #007bff;">
          <strong>${course.name || 'Unnamed Course'}</strong><br>
          Course ID: ${course.id || 'N/A'}<br>
          Students Enrolled: ${course.studentCount || 0}
        </div>
      `).join('')
      : '<p>No courses assigned yet.</p>'

    // Email content
    const mailOptions = {
      from: 'LMS System <tauheeddeveloper13@gmail.com>',
      to,
      subject: 'Your Instructor Account Credentials - LMS System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
                .credentials { background: #f0f9ff; padding: 20px; margin: 25px 0; border: 2px dashed #3b82f6; border-radius: 8px; }
                .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0; }
                .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; border-radius: 4px; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 28px;">Welcome to LMS Instructor Portal</h1>
                </div>
                <div class="content">
                    <h2 style="color: #333;">Dear ${name},</h2>
                    <p>Your instructor account has been created successfully in our Learning Management System.</p>
                    
                    <div class="credentials">
                        <h3 style="color: #1e40af; margin-top: 0;">🔐 Your Login Credentials:</h3>
                        <p><strong>📧 Email:</strong> ${email}</p>
                        <p><strong>🔑 Password:</strong> <code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 16px;">${password}</code></p>
                        <p><strong>🌐 Login URL:</strong> <a href="${loginUrl}" style="color: #3b82f6;">${loginUrl}</a></p>
                    </div>
                    
                    <h3 style="color: #333;">📚 Assigned Courses:</h3>
                    ${courseDetails}
                    
                    <p><strong>👥 Total Students Assigned:</strong> ${totalStudents || 0}</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${loginUrl}" class="button">🚀 Login to Your Account</a>
                    </div>
                    
                    <div class="warning">
                        <p style="margin: 0; color: #92400e; font-weight: bold;">
                            ⚠️ Important Security Notice: Please change your password after first login.
                        </p>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px;">
                        If you have any questions or need assistance, please contact the system administrator.
                    </p>
                </div>
                <div class="footer">
                    <p>This is an automated message. Please do not reply to this email.</p>
                    <p>© ${new Date().getFullYear()} Learning Management System. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
      `
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', info.messageId)

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
    })

  } catch (error: any) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to send email',
        details: error.toString()
      },
      { status: 500 }
    )
  }
}