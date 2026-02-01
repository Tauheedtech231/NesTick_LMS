import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
/* eslint-disable */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, name, subject, message, instructorName, courseName } = body

    // Create transporter with your Gmail credentials
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'tauheeddeveloper13@gmail.com', // Your Gmail
        pass: 'ramo reiv jlsy ogsg' // Your App Password
      }
    })

    // Email content
    const mailOptions = {
      from: `"LMS Instructor" <tauheeddeveloper13@gmail.com>`,
      to,
      subject: subject || 'Feedback from Instructor',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
                .message { background: #f0f9ff; padding: 20px; margin: 20px 0; border-left: 4px solid #3b82f6; border-radius: 4px; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 24px;">Instructor Feedback</h1>
                </div>
                <div class="content">
                    <h2 style="color: #333;">Dear ${name},</h2>
                    <p>Your instructor has provided feedback for your performance in the course:</p>
                    
                    <div class="message">
                        <h3 style="color: #1e40af; margin-top: 0;">📝 Feedback Message:</h3>
                        <p style="white-space: pre-line;">${message}</p>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Course:</strong> ${courseName || 'Not specified'}</p>
                        <p><strong>Instructor:</strong> ${instructorName || 'Your Instructor'}</p>
                        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                    </div>
                    
                    <p style="color: #6b7280;">
                        This is an automated message from the Learning Management System. 
                        Please do not reply to this email directly.
                    </p>
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} Learning Management System. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
      `
    }

    // Send email
    await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      message: 'Feedback email sent successfully'
    })

  } catch (error: any) {
    console.error('Error sending feedback email:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to send feedback email'
      },
      { status: 500 }
    )
  }
}