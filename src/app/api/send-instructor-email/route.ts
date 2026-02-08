import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
/* eslint-disable */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      to, 
      instructorName, 
      email, 
      password, 
      courseName,
      loginUrl 
    } = body

    // Validate required fields
    if (!to || !instructorName || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create transporter with your Gmail configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'tauheeddeveloper13@gmail.com', // Your Gmail
        pass: 'ramo reiv jlsy ogsg' // Your App Password
      }
    })

    // Email content
    const mailOptions = {
      from: '"LMS Admin Portal" <tauheeddeveloper13@gmail.com>',
      to: to,
      subject: `Welcome ${instructorName}! Your LMS Instructor Credentials`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #0B1C3D; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f4f6f8; padding: 30px; border-radius: 0 0 8px 8px; }
                .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #B11217; }
                .button { display: inline-block; background: #B11217; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
                .info-box { background: #e5e7eb; padding: 15px; border-radius: 6px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>LMS Instructor Portal</h1>
                </div>
                <div class="content">
                    <h2>Welcome, ${instructorName}!</h2>
                    <p>You have been added as an instructor to the Learning Management System.</p>
                    
                    <div class="credentials">
                        <h3>Your Login Credentials:</h3>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Password:</strong> <code>${password}</code></p>
                        <p><strong>Assigned Course:</strong> ${courseName || 'Not Assigned'}</p>
                    </div>
                    
                    <div class="info-box">
                        <p><strong>Important:</strong> Please login and change your password immediately.</p>
                    </div>
                    
                    <a href="${loginUrl}" class="button">Login to Instructor Portal</a>
                    
                    <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
                        If you did not expect this email, please contact the system administrator.
                    </p>
                </div>
            </div>
        </body>
        </html>
      `
    }

    // Send email
    await transporter.sendMail(mailOptions)

    return NextResponse.json(
      { 
        success: true, 
        message: 'Credentials sent successfully',
        email: to 
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('Email sending error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to send email' 
      },
      { status: 500 }
    )
  }
}