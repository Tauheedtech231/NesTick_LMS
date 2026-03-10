import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log("\n========== INSTRUCTOR VERIFICATION ==========");
    console.log("📧 Email:", email);

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // ✅ Aapke tables ke mutabik query - WITHOUT email_verified column
    const credentials = await query<any[]>(
      `SELECT 
        ic.id as credential_id,
        ic.instructor_id,
        ic.email,
        ic.password_hash,
        ic.role,
        ic.status as credential_status,
        ic.last_login,
        i.name,
        i.phone,
        i.specialization,
        i.qualification,
        i.experience,
        i.status as instructor_status,
        i.course_id,
        c.title as course_title
       FROM instructor_credentials ic
       INNER JOIN instructors i ON ic.instructor_id = i.id
       LEFT JOIN courses c ON i.course_id = c.id
       WHERE ic.email = ?`,
      [email]
    );

    console.log("📊 Records found:", credentials?.length || 0);

    // Check if instructor exists
    if (!credentials || credentials.length === 0) {
      console.log("❌ No instructor found");
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const instructor = credentials[0];
    console.log("✅ Instructor found:", instructor.name);

    // Check if account is active
    if (instructor.credential_status !== 'active' || instructor.instructor_status !== 'active') {
      console.log("❌ Account not active");
      return NextResponse.json(
        { success: false, error: 'Your account is not active. Please contact admin.' },
        { status: 403 }
      );
    }

    // Verify password
    console.log("🔄 Verifying password...");
    const isValidPassword = await bcrypt.compare(password, instructor.password_hash);
    
    if (!isValidPassword) {
      console.log("❌ Invalid password");
      
      // Track failed attempt (if column exists)
      try {
        await query(
          `UPDATE instructor_credentials 
           SET failed_attempts = IFNULL(failed_attempts, 0) + 1 
           WHERE id = ?`,
          [instructor.credential_id]
        );
      } catch (e) {
        // Ignore if column doesn't exist
      }
      
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log("✅ Password verified");

    // Update last login
    try {
      await query(
        `UPDATE instructor_credentials 
         SET last_login = NOW() 
         WHERE id = ?`,
        [instructor.credential_id]
      );
    } catch (e) {
      // Ignore if column doesn't exist
    }

    // Return success response (NO email_verified field)
    return NextResponse.json({
      success: true,
      message: 'Verification successful',
      data: {
        id: instructor.instructor_id,
        name: instructor.name,
        email: instructor.email,
        phone: instructor.phone || '',
        role: instructor.role || 'instructor',
        specialization: instructor.specialization || '',
        qualification: instructor.qualification || '',
        experience: instructor.experience || '',
        courseId: instructor.course_id,
        courseTitle: instructor.course_title,
        lastLogin: instructor.last_login
      }
    });

  } catch (error: any) {
    console.error("❌ Verification error:", error);
    
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}