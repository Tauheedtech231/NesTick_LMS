import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Types
interface InquiryRequest {
  name: string;
  email: string;
  phone?: string;
  message?: string;
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

    // Validate required fields
    if (!body.name || !body.email || !body.courseName) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and course name are required' },
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
        .demo-link {
            background: linear-gradient(135deg, #DA2F6B 0%, #F97316 100%);
            color: white;
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
            text-decoration: none;
            display: block;
            transition: transform 0.3s ease;
        }
        .demo-link:hover {
            transform: translateY(-2px);
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
                <p><strong>⚠️ Important Notice:</strong></p>
                <p>The official registration form is currently under development. For demonstration purposes, please use the following link to experience our registration process:</p>
            </div>

            <a href="https://demo-link.com" class="demo-link" target="_blank">
                <strong>👉 DEMO REGISTRATION LINK</strong><br>
                <small>Click here to experience the registration process</small>
            </a>

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
                </div>
            </div>

            <div class="section">
                <p><strong>📧 What's Next?</strong></p>
                <p>Our course advisor will contact you within 24-48 hours to discuss:</p>
                <ul>
                    <li>Course schedule and availability</li>
                    <li>Payment options and scholarships</li>
                    <li>Certification process</li>
                    <li>Any additional questions you may have</li>
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
${body.duration ? `- Duration: ${body.duration}\n` : ''}
${body.creditHours ? `- Credit Hours: ${body.creditHours}\n` : ''}
${body.fee ? `- Course Fee: ${body.fee}\n` : ''}

${body.entryRequirements ? `
ENTRY REQUIREMENTS:
${body.entryRequirements}
` : ''}

IMPORTANT NOTICE:
The official registration form is currently under development. For demonstration purposes, please use the following link to experience our registration process:

DEMO REGISTRATION LINK: https://demo-link.com

${body.message ? `
YOUR MESSAGE:
${body.message}
` : ''}

YOUR CONTACT INFORMATION:
- Name: ${body.name}
- Email: ${body.email}
${body.phone ? `- Phone: ${body.phone}\n` : ''}

WHAT'S NEXT?
Our course advisor will contact you within 24-48 hours to discuss course details, payment options, and certification process.

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
      subject: `Course Inquiry: ${body.courseName} - MANSOL HAB Trainings`,
      text: emailText,
      html: emailHtml,
    };

    console.log('Attempting to send email to:', body.email);
    console.log('Course:', body.courseName);

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);

    // Send confirmation to admin (optional)
    const adminMailOptions = {
      from: `"MANSOL HAB Trainings" <tauheeddeveloper13@gmail.com>`,
      to: 'tauheeddeveloper13@gmail.com',
      subject: `New Course Inquiry: ${body.courseName}`,
      text: `
NEW COURSE INQUIRY RECEIVED

Course: ${body.courseName}
User: ${body.name} (${body.email})
Phone: ${body.phone || 'Not provided'}
Time: ${new Date().toLocaleString()}

User Message: ${body.message || 'No message provided'}

Course Details:
- Duration: ${body.duration || 'Not specified'}
- Credit Hours: ${body.creditHours || 'Not specified'}
- Fee: ${body.fee || 'Not specified'}

Entry Requirements:
${body.entryRequirements || 'Not specified'}
      `,
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
        message: 'Email sent successfully',
        data: {
          to: body.email,
          course: body.courseName,
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