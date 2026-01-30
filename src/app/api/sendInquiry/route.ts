import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Types
interface InquiryRequest {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  courseId: string;
  courseName: string;
  duration?: string;
  creditHours?: string;
  fee?: string;
  entryRequirements?: string;
}

// Nodemailer transporter configuration with direct credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tauheeddeveloper13@gmail.com', // Your email directly
    pass: 'ramo reiv jlsy ogsg' // Your app password directly
  },
});

// Validate email
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: InquiryRequest = await request.json();
    console.log('Received inquiry request:', body)

    // Validate required fields
    if (!body.name || !body.email || !body.courseName || !body.courseId) {
      return NextResponse.json(
        { success: false, message: 'Name, email, course name, and course ID are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(body.email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate name length
    if (body.name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'Name must be at least 2 characters long' },
        { status: 400 }
      );
    }

    // Generate registration link with course ID
    const registrationLink = `http://localhost:3000/lms/Registration?courseId=${encodeURIComponent(body.courseId)}`;

    // Create HTML email content
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Course Inquiry - MANSOL HAB Trainings</title>
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
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #6B21A8 0%, #7C3AED 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eaeaea;
        }
        .section-title {
            color: #6B21A8;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 12px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 12px;
        }
        @media (min-width: 480px) {
            .info-grid {
                grid-template-columns: 1fr 1fr;
            }
        }
        .info-item {
            background-color: #f8f9fa;
            padding: 12px;
            border-radius: 8px;
            border-left: 4px solid #6B21A8;
        }
        .label {
            font-size: 14px;
            color: #666;
            font-weight: 500;
            margin-bottom: 4px;
        }
        .value {
            font-size: 15px;
            color: #333;
            font-weight: 600;
        }
        .requirements {
            background-color: #f0f9ff;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            border-radius: 8px;
            margin-top: 10px;
        }
        .registration-link {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white;
            text-align: center;
            padding: 25px 20px;
            border-radius: 8px;
            margin: 25px 0;
            text-decoration: none;
            display: block;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);
        }
        .registration-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(16, 185, 129, 0.3);
        }
        .footer {
            text-align: center;
            padding: 20px;
            background-color: #f8f9fa;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #eaeaea;
        }
        .highlight {
            background-color: #fef3c7;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #f59e0b;
            margin: 20px 0;
        }
        .contact-info {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 15px;
        }
        .contact-item {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #4b5563;
            font-size: 14px;
        }
        .button-container {
            margin: 20px 0;
            text-align: center;
        }
        .register-button {
            display: inline-block;
            background: linear-gradient(135deg, #6B21A8 0%, #7C3AED 100%);
            color: white;
            padding: 14px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            box-shadow: 0 4px 6px rgba(107, 33, 168, 0.2);
            margin-top: 10px;
        }
        .register-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(107, 33, 168, 0.3);
        }
        .steps {
            background-color: #f0f9ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .step {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
        }
        .step-number {
            background-color: #6B21A8;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            flex-shrink: 0;
            font-weight: bold;
        }
        .step-content {
            flex: 1;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">MANSOL HAB</div>
            <div class="subtitle">Professional Safety Training</div>
        </div>
        
        <div class="content">
            <div class="section">
                <div class="section-title">🎯 Course Inquiry Received</div>
                <p>Dear <strong>${body.name}</strong>,</p>
                <p>Thank you for your interest in our safety training program. We have received your inquiry for the following course:</p>
            </div>

            <div class="section">
                <div class="section-title">📚 Course Details</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="label">Course Name</div>
                        <div class="value">${body.courseName}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Course ID</div>
                        <div class="value">${body.courseId}</div>
                    </div>
                    ${body.duration ? `
                    <div class="info-item">
                        <div class="label">Duration</div>
                        <div class="value">${body.duration}</div>
                    </div>
                    ` : ''}
                    ${body.creditHours ? `
                    <div class="info-item">
                        <div class="label">Credit Hours</div>
                        <div class="value">${body.creditHours}</div>
                    </div>
                    ` : ''}
                    ${body.fee ? `
                    <div class="info-item">
                        <div class="label">Course Fee</div>
                        <div class="value">${body.fee}</div>
                    </div>
                    ` : ''}
                </div>
            </div>

            ${body.entryRequirements ? `
            <div class="section">
                <div class="section-title">📋 Entry Requirements</div>
                <div class="requirements">
                    <p><strong>To enroll in this course, you need:</strong></p>
                    <ul>
                        ${body.entryRequirements.split('\n').map(req => `<li>${req.trim()}</li>`).join('')}
                    </ul>
                </div>
            </div>
            ` : ''}

            <div class="highlight">
                <p><strong>✅ Ready to Register?</strong></p>
                <p>Your course inquiry has been processed successfully! Now you can complete your registration using the link below. This link is personalized for your selected course:</p>
            </div>

            <div class="section">
                <div class="section-title">🚀 Complete Your Registration</div>
                <p>Click the button below to proceed with your registration. The form will be pre-filled with your course information.</p>
                
                <div class="button-container">
                    <a href="${registrationLink}" class="register-button" target="_blank">
                        📝 Complete Registration Now
                    </a>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 10px; text-align: center;">
                    <strong>Registration Link:</strong><br>
                    <a href="${registrationLink}" style="color: #6B21A8; word-break: break-all;">${registrationLink}</a>
                </p>
            </div>

            <div class="steps">
                <div class="section-title">📝 Registration Process</div>
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <strong>Click the registration link above</strong><br>
                        This will take you to our secure registration form
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <strong>Complete the registration form</strong><br>
                        Fill in your personal and academic information
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <strong>Upload required documents</strong><br>
                        Submit scanned copies of your academic documents
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">4</div>
                    <div class="step-content">
                        <strong>Receive your credentials</strong><br>
                        Get your LMS login details via email
                    </div>
                </div>
            </div>

            ${body.message ? `
            <div class="section">
                <div class="section-title">💬 Your Message</div>
                <div class="info-item">
                    <p>${body.message}</p>
                </div>
            </div>
            ` : ''}

            <div class="section">
                <div class="section-title">📞 Contact Information</div>
                <div class="contact-info">
                    <div class="contact-item">
                        <strong>Name:</strong> ${body.name}
                    </div>
                    <div class="contact-item">
                        <strong>Email:</strong> ${body.email}
                    </div>
                    ${body.phone ? `
                    <div class="contact-item">
                        <strong>Phone:</strong> ${body.phone}
                    </div>
                    ` : ''}
                    <div class="contact-item">
                        <strong>Course Selected:</strong> ${body.courseName}
                    </div>
                </div>
            </div>

            <div class="section">
                <p><strong>📧 Need Assistance?</strong></p>
                <p>If you encounter any issues with registration, our support team is here to help:</p>
                <ul>
                    <li>Technical support: support@mansolhab.com</li>
                    <li>Course inquiries: info@mansolhab.com</li>
                    <li>Phone support: 03224700200 (Mon-Fri, 9AM-5PM)</li>
                </ul>
            </div>
        </div>

        <div class="footer">
            <p><strong>MANSOL HAB Trainings</strong></p>
            <p>📍 Professional Safety Education Since 2005</p>
            <p>📞 Call: 03224700200 | ✉️ Email: info@mansolhab.com</p>
            <p>© ${new Date().getFullYear()} MANSOL HAB Trainings. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;

    // Create plain text version for email clients that don't support HTML
    const emailText = `
COURSE INQUIRY - MANSOL HAB TRAININGS

Dear ${body.name},

Thank you for your interest in our safety training program. We have received your inquiry for the following course:

COURSE DETAILS:
- Course Name: ${body.courseName}
- Course ID: ${body.courseId}
${body.duration ? `- Duration: ${body.duration}\n` : ''}
${body.creditHours ? `- Credit Hours: ${body.creditHours}\n` : ''}
${body.fee ? `- Course Fee: ${body.fee}\n` : ''}

${body.entryRequirements ? `
ENTRY REQUIREMENTS:
${body.entryRequirements}
` : ''}

✅ READY TO REGISTER?
Your course inquiry has been processed successfully! Now you can complete your registration using the link below:

🚀 COMPLETE YOUR REGISTRATION:
Click the link below to proceed with your registration. The form will be pre-filled with your course information.

Registration Link: ${registrationLink}

📝 REGISTRATION PROCESS:
1. Click the registration link above
2. Complete the registration form
3. Upload required documents
4. Receive your LMS login credentials via email

${body.message ? `
YOUR MESSAGE:
${body.message}
` : ''}

YOUR CONTACT INFORMATION:
- Name: ${body.name}
- Email: ${body.email}
${body.phone ? `- Phone: ${body.phone}\n` : ''}
- Course Selected: ${body.courseName}

📧 NEED ASSISTANCE?
If you encounter any issues with registration, our support team is here to help:
- Technical support: support@mansolhab.com
- Course inquiries: info@mansolhab.com
- Phone support: 03224700200 (Mon-Fri, 9AM-5PM)

---
MANSOL HAB Trainings
📞 Call: 03224700200
✉️ Email: info@mansolhab.com
📍 Professional Safety Education Since 2005
© ${new Date().getFullYear()} MANSOL HAB Trainings. All rights reserved.
    `;

    // Email options
    const mailOptions = {
      from: `"MANSOL HAB Trainings" <tauheeddeveloper13@gmail.com>`,
      to: body.email,
      subject: `🎓 Complete Your Registration: ${body.courseName} - MANSOL HAB Trainings`,
      text: emailText,
      html: emailHtml,
    };

    console.log('Attempting to send email to:', body.email);
    console.log('Course:', body.courseName);
    console.log('Registration Link:', registrationLink);

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);

    // Send confirmation to admin (optional)
    const adminMailOptions = {
      from: `"MANSOL HAB Trainings" <tauheeddeveloper13@gmail.com>`,
      to: 'tauheeddeveloper13@gmail.com',
      subject: `📋 New Course Inquiry: ${body.courseName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6B21A8;">New Course Inquiry Received</h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <h3 style="margin-top: 0;">User Information</h3>
            <p><strong>Name:</strong> ${body.name}</p>
            <p><strong>Email:</strong> ${body.email}</p>
            <p><strong>Phone:</strong> ${body.phone || 'Not provided'}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <h3 style="margin-top: 0;">Course Details</h3>
            <p><strong>Course Name:</strong> ${body.courseName}</p>
            <p><strong>Course ID:</strong> ${body.courseId}</p>
            ${body.duration ? `<p><strong>Duration:</strong> ${body.duration}</p>` : ''}
            ${body.creditHours ? `<p><strong>Credit Hours:</strong> ${body.creditHours}</p>` : ''}
            ${body.fee ? `<p><strong>Fee:</strong> ${body.fee}</p>` : ''}
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="margin-top: 0;">Registration Link Sent</h3>
            <p>The following registration link was sent to the user:</p>
            <p><strong>Link:</strong> ${registrationLink}</p>
          </div>
          
          ${body.message ? `
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="margin-top: 0;">User Message</h3>
            <p>${body.message}</p>
          </div>
          ` : ''}
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
            <p>Automated notification from MANSOL HAB LMS System</p>
          </div>
        </div>
      `,
      text: `
NEW COURSE INQUIRY RECEIVED

User Information:
- Name: ${body.name}
- Email: ${body.email}
- Phone: ${body.phone || 'Not provided'}
- Time: ${new Date().toLocaleString()}

Course Details:
- Course: ${body.courseName}
- Course ID: ${body.courseId}
${body.duration ? `- Duration: ${body.duration}\n` : ''}
${body.creditHours ? `- Credit Hours: ${body.creditHours}\n` : ''}
${body.fee ? `- Fee: ${body.fee}\n` : ''}

Registration Link Sent:
${registrationLink}

${body.message ? `User Message: ${body.message}\n` : ''}
---
Automated notification from MANSOL HAB LMS System
      `
    };

    // Send admin notification (non-blocking)
    transporter.sendMail(adminMailOptions).then(adminInfo => {
      console.log('Admin notification sent:', adminInfo.messageId);
    }).catch(adminError => {
      console.error('Admin notification failed:', adminError);
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Email sent successfully with registration link',
        data: {
          to: body.email,
          course: body.courseName,
          courseId: body.courseId,
          registrationLink: registrationLink,
          timestamp: new Date().toISOString()
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error sending inquiry:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to send inquiry. Please try again later.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
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
  });
}

// You can also add other HTTP methods if needed
export async function GET() {
  return NextResponse.json(
    { 
      message: 'Send inquiry API is running',
      status: 'OK',
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}