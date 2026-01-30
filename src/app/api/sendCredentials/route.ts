import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, learnerId, username, password, courseName, courseDuration, courseFee } = body

    // Validate required fields
    if (!email || !name || !learnerId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Create transporter with your real credentials
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'tauheeddeveloper13@gmail.com', // Your actual Gmail
        pass: 'ramo reiv jlsy ogsg' // Your actual App Password
      }
    })

    // Test connection
    await transporter.verify()
    console.log('SMTP connection verified successfully')

    // Enhanced email content
    const mailOptions = {
      from: '"MANSOL HAB LMS" <tauheeddeveloper13@gmail.com>',
      to: email,
      subject: `🎓 LMS Registration Complete: ${courseName} - MANSOL HAB`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LMS Registration Confirmation</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #6B21A8 0%, #7C3AED 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 18px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .section {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eaeaea;
        }
        .section-title {
            color: #6B21A8;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .course-card {
            background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
            padding: 25px;
            border-radius: 10px;
            border-left: 5px solid #6B21A8;
            margin: 20px 0;
        }
        .credentials-card {
            background: linear-gradient(135deg, #fff8f6 0%, #fff0ee 100%);
            padding: 25px;
            border-radius: 10px;
            border-left: 5px solid #DA2F6B;
            margin: 20px 0;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .info-table td {
            padding: 12px 0;
            border-bottom: 1px solid #eee;
        }
        .label {
            color: #666;
            font-weight: 500;
            width: 40%;
        }
        .value {
            color: #333;
            font-weight: 600;
        }
        .password-box {
            background: #f8f9fa;
            border: 2px dashed #DA2F6B;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            font-family: 'Courier New', monospace;
            font-size: 18px;
            font-weight: bold;
            color: #DA2F6B;
            text-align: center;
            letter-spacing: 2px;
        }
        .warning-box {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .steps {
            display: grid;
            gap: 15px;
            margin: 25px 0;
        }
        .step {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .step-number {
            background: #6B21A8;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            flex-shrink: 0;
        }
        .step-text {
            flex: 1;
        }
        .login-button {
            display: inline-block;
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white;
            padding: 16px 40px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 18px;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }
        .login-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }
        .support-box {
            background: linear-gradient(135deg, #e6f7ff 0%, #d1ecff 100%);
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #1890ff;
            margin: 25px 0;
        }
        .footer {
            text-align: center;
            padding: 30px 20px;
            background-color: #1a1a2e;
            color: #a0a0b0;
            font-size: 14px;
        }
        .contact-info {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 20px;
            flex-wrap: wrap;
        }
        .contact-item {
            display: flex;
            align-items: center;
            gap: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">MANSOL HAB LMS</div>
            <div class="subtitle">Professional Safety Training Platform</div>
        </div>
        
        <div class="content">
            <div class="section">
                <h2 class="section-title">🎉 Welcome to MANSOL HAB, ${name}!</h2>
                <p>Your registration has been successfully completed. You are now officially enrolled in our safety training program.</p>
            </div>

            <div class="section">
                <h2 class="section-title">📚 Your Enrolled Course</h2>
                <div class="course-card">
                    <h3 style="color: #6B21A8; margin-top: 0; margin-bottom: 15px;">${courseName}</h3>
                    <table class="info-table">
                        <tr>
                            <td class="label">Duration:</td>
                            <td class="value">${courseDuration}</td>
                        </tr>
                        <tr>
                            <td class="label">Course Fee:</td>
                            <td class="value" style="color: #10B981; font-size: 18px;">${courseFee}</td>
                        </tr>
                        <tr>
                            <td class="label">Enrollment Date:</td>
                            <td class="value">${new Date().toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}</td>
                        </tr>
                    </table>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">🔐 Your LMS Access Credentials</h2>
                <div class="credentials-card">
                    <table class="info-table">
                        <tr>
                            <td class="label">LMS Learner ID:</td>
                            <td class="value" style="font-family: 'Courier New', monospace; font-size: 18px;">${learnerId}</td>
                        </tr>
                        <tr>
                            <td class="label">Username:</td>
                            <td class="value">${username}</td>
                        </tr>
                    </table>
                    
                    <div style="margin: 20px 0;">
                        <p style="font-weight: 500; color: #666; margin-bottom: 10px;">Your Password:</p>
                        <div class="password-box">${password}</div>
                    </div>
                    
                    <div class="warning-box">
                        <p style="margin: 0; color: #856404; font-weight: 500;">
                            ⚠️ <strong>Security Notice:</strong> This is your temporary password. Please change it immediately after first login.
                        </p>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">🚀 Getting Started Guide</h2>
                <div class="steps">
                    <div class="step">
                        <div class="step-number">1</div>
                        <div class="step-text">
                            <strong>Access the LMS Portal</strong><br>
                            Visit our learning management system
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">2</div>
                        <div class="step-text">
                            <strong>Login with Credentials</strong><br>
                            Use the username and password provided above
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">3</div>
                        <div class="step-text">
                            <strong>Navigate to Dashboard</strong><br>
                            Find your enrolled courses in the dashboard
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">4</div>
                        <div class="step-text">
                            <strong>Start Learning</strong><br>
                            Access course materials, assignments, and resources
                        </div>
                    </div>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:3000" class="login-button" target="_blank">
                        🔗 Click Here to Access LMS Portal
                    </a>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">📞 Need Assistance?</h2>
                <div class="support-box">
                    <p style="margin-top: 0; color: #1890ff; font-weight: 600;">Our support team is here to help you!</p>
                    <ul style="color: #333; line-height: 1.8;">
                        <li><strong>Technical Support:</strong> support@mansolhab.com</li>
                        <li><strong>Course Inquiries:</strong> info@mansolhab.com</li>
                        <li><strong>Phone Support:</strong> +92 322 4700200 (Mon-Fri, 9AM-5PM)</li>
                        <li><strong>LMS Help Desk:</strong> Available 24/7 in your dashboard</li>
                    </ul>
                </div>
            </div>

            <div class="section" style="border-bottom: none; padding-bottom: 0;">
                <h2 class="section-title">💡 Pro Tips for Success</h2>
                <ul style="color: #333; line-height: 1.8; padding-left: 20px;">
                    <li>Complete your profile with a professional photo</li>
                    <li>Set up email notifications for course updates</li>
                    <li>Download the course syllabus and schedule</li>
                    <li>Join the course discussion forum</li>
                    <li>Bookmark important resources and links</li>
                </ul>
            </div>
        </div>

        <div class="footer">
            <p><strong>MANSOL HAB Professional Safety Trainings</strong></p>
            <p>📍 Since 2005 | ISO Certified | International Accreditation</p>
            
            <div class="contact-info">
                <div class="contact-item">
                    📧 info@mansolhab.com
                </div>
                <div class="contact-item">
                    📱 +92 322 4700200
                </div>
                <div class="contact-item">
                    🌐 www.mansolhab.com
                </div>
            </div>
            
            <p style="margin-top: 25px; font-size: 12px; color: #888;">
                © ${new Date().getFullYear()} MANSOL HAB Trainings. All rights reserved.<br>
                This is an automated email, please do not reply directly.
            </p>
        </div>
    </div>
</body>
</html>
      `,
      // Plain text version for email clients that don't support HTML
      text: `
MANSOL HAB LMS - REGISTRATION CONFIRMATION

Dear ${name},

Welcome to MANSOL HAB Professional Safety Training Platform! 

YOUR COURSE DETAILS:
────────────────────────
Course: ${courseName}
Duration: ${courseDuration}
Fee: ${courseFee}
Enrollment Date: ${new Date().toLocaleDateString()}

YOUR LMS CREDENTIALS:
────────────────────────
LMS Learner ID: ${learnerId}
Username: ${username}
Password: ${password}

⚠️ SECURITY NOTICE:
This is your temporary password. Please change it immediately after first login.

GETTING STARTED:
────────────────────────
1. Visit: http://localhost:3000
2. Login with the credentials above
3. Navigate to your dashboard
4. Access course materials

NEED HELP?
────────────────────────
• Technical Support: support@mansolhab.com
• Course Inquiries: info@mansolhab.com
• Phone Support: +92 322 4700200
• LMS Help Desk: Available in your dashboard

PRO TIPS:
────────────────────────
• Complete your profile with a professional photo
• Set up email notifications for course updates
• Download the course syllabus
• Join the course discussion forum
• Bookmark important resources

────────────────────────
MANSOL HAB Professional Safety Trainings
📍 Since 2005 | ISO Certified
📧 info@mansolhab.com
📱 +92 322 4700200
🌐 www.mansolhab.com

© ${new Date().getFullYear()} MANSOL HAB Trainings. All rights reserved.
This is an automated email, please do not reply directly.
      `
    }

    console.log('Sending credentials email to:', email)
    console.log('Course:', courseName)
    console.log('Learner ID:', learnerId)

    // Send email
    const info = await transporter.sendMail(mailOptions)
    console.log('Credentials email sent successfully. Message ID:', info.messageId)

    // Send copy to admin (optional)
    const adminMailOptions = {
      from: '"MANSOL HAB LMS" <tauheeddeveloper13@gmail.com>',
      to: 'tauheeddeveloper13@gmail.com',
      subject: `📋 New Student Registration: ${name} - ${courseName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6B21A8;">New Student Registration Completed</h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <h3 style="margin-top: 0;">Student Information</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Learner ID:</strong> ${learnerId}</p>
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Registration Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <h3 style="margin-top: 0;">Course Details</h3>
            <p><strong>Course:</strong> ${courseName}</p>
            <p><strong>Duration:</strong> ${courseDuration}</p>
            <p><strong>Fee:</strong> ${courseFee}</p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="margin-top: 0;">Credentials Sent</h3>
            <p>Login credentials have been successfully sent to the student's email.</p>
            <p><strong>Password:</strong> ${password}</p>
          </div>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
            <p>Automated notification from MANSOL HAB LMS System</p>
          </div>
        </div>
      `
    }

    // Send admin notification (non-blocking)
    transporter.sendMail(adminMailOptions).then(adminInfo => {
      console.log('Admin notification sent. Message ID:', adminInfo.messageId)
    }).catch(adminError => {
      console.error('Admin notification failed:', adminError)
    })

    return NextResponse.json({
      success: true,
      message: 'Credentials email sent successfully',
      data: {
        emailSent: true,
        recipient: email,
        learnerId: learnerId,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Email sending error:', error)
    
    // Detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send credentials email. Please try again later.',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Add OPTIONS method for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}