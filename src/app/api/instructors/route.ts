import { NextRequest, NextResponse } from 'next/server';
import { query, getConnection } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';

// Email transporter setup
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

// Generate random password (BACKEND SIRF)
function generateRandomPassword(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Send email function
async function sendCredentialsEmail(instructorData: any, plainPassword: string) {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/lms/auth/login?type=instructor`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'tauheeddeveloper13@gmail.com',
    to: instructorData.email,
    subject: 'Welcome to LMS - Your Instructor Login Credentials',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1E3A8A; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background-color: #f9f9f9; }
          .credentials { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .password-box { background-color: #f0f0f0; padding: 15px; font-family: monospace; font-size: 18px; text-align: center; }
          .footer { text-align: center; padding: 20px; color: #666; }
          .button { background-color: #1E3A8A; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to LMS Platform</h1>
          </div>
          <div class="content">
            <h2>Hello ${instructorData.name},</h2>
            <p>You have been registered as an instructor on our LMS platform. Below are your login credentials:</p>
            
            <div class="credentials">
              <p><strong>Email:</strong> ${instructorData.email}</p>
              <div class="password-box">
                <strong>Password:</strong> ${plainPassword}
              </div>
              <p><small>Please change your password after first login.</small></p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" class="button">Login to Your Account</a>
            </div>

            <h3>Course Assignment:</h3>
            <p><strong>Course:</strong> ${instructorData.courseDetails?.title || 'Not Assigned'}</p>
            
            <hr style="margin: 30px 0;">
            
            <p><strong>Important Security Notes:</strong></p>
            <ul>
              <li>Keep your password secure and don't share it with anyone</li>
              <li>Use a strong password for better security</li>
              <li>Contact admin if you face any issues</li>
            </ul>
          </div>
          <div class="footer">
            <p>© 2024 LMS Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  return await transporter.sendMail(mailOptions);
}

export async function POST(request: NextRequest) {
  const connection = await getConnection();
  
  try {
    const body = await request.json();
    const { 
      name, email, phone, specialization, experience, 
      qualification, bio, status, rating, courseId 
    } = body;

    console.log("\n========== ADD INSTRUCTOR ==========");
    console.log("Name:", name);
    console.log("Email:", email);

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingInstructor = await query<any[]>(
      'SELECT id FROM instructors WHERE email = ?',
      [email]
    );

    if (existingInstructor.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Instructor with this email already exists' },
        { status: 400 }
      );
    }

    // Start transaction
    await connection.beginTransaction();

    // Generate IDs
    const instructorId = uuidv4();
    const credentialsId = uuidv4();
    
    // ✅ BACKEND GENERATES PASSWORD (SIRF YAHAN)
    const plainPassword = generateRandomPassword(10);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    console.log("✅ Password generated (backend):", plainPassword);

    // Get course details if courseId provided
    let courseDetails = null;
    if (courseId) {
      const courses = await query<any[]>(
        'SELECT id, title, duration, category, price, students FROM courses WHERE id = ?',
        [courseId]
      );
      courseDetails = courses[0] || null;
    }

    // Insert into instructors table
    await connection.execute(
      `INSERT INTO instructors (
        id, name, email, phone, specialization, experience, 
        qualification, bio, status, rating, course_id, total_students
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        instructorId, name, email, phone || null, specialization || null,
        experience || null, qualification || null, bio || null, 
        status || 'active', rating || 4.5, courseId || null,
        courseDetails ? parseInt(courseDetails.students?.replace(/[^0-9]/g, '') || '0') : 0
      ]
    );

    // Insert into instructor_credentials table
    await connection.execute(
      `INSERT INTO instructor_credentials (
        id, instructor_id, email, password_hash, role, status
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [credentialsId, instructorId, email, hashedPassword, 'instructor', 'active']
    );

    // Commit transaction
    await connection.commit();

    // Prepare instructor data for email
    const instructorData = {
      id: instructorId,
      name,
      email,
      phone,
      specialization,
      experience,
      qualification,
      bio,
      status,
      rating,
      courseId,
      courseDetails
    };

    // Send email with credentials
    try {
      await sendCredentialsEmail(instructorData, plainPassword);
      console.log("✅ Credentials email sent successfully");
      
      return NextResponse.json({
        success: true,
        data: {
          ...instructorData,
          password: plainPassword // Send to frontend for display
        },
        message: 'Instructor added successfully and email sent'
      });
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError);
      
      // Email failed but instructor added
      return NextResponse.json({
        success: true,
        data: {
          ...instructorData,
          password: plainPassword,
          emailSent: false
        },
        message: 'Instructor added but email delivery failed',
        warning: 'Email could not be sent. Please save password manually.'
      });
    }

  } catch (error: any) {
    // Rollback transaction on error
    await connection.rollback();
    console.error('❌ Error adding instructor:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to add instructor' 
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');
    const status = searchParams.get('status');

    let sql = `
      SELECT 
        i.*,
        c.title as course_title,
        c.duration as course_duration,
        c.category as course_category,
        ic.last_login,
        ic.status as credential_status
      FROM instructors i
      LEFT JOIN courses c ON i.course_id = c.id
      LEFT JOIN instructor_credentials ic ON i.id = ic.instructor_id
      WHERE 1=1
    `;
    
    const params: any[] = [];

    if (courseId) {
      sql += ' AND i.course_id = ?';
      params.push(courseId);
    }

    if (status) {
      sql += ' AND i.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY i.created_at DESC';

    const instructors = await query<any[]>(sql, params);

    return NextResponse.json({
      success: true,
      data: instructors,
      count: instructors.length
    });

  } catch (error) {
    console.error('Error fetching instructors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch instructors' },
      { status: 500 }
    );
  }
}