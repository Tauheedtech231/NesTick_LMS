// /app/api/students/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    console.log('📥 Fetching profile for:', email);

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get connection with timeout
    connection = await getConnection();
    
    // Set connection timeout
    await connection.execute('SET SESSION wait_timeout = 28800');

    // Get student profile from enrollments table
    const [rows] = await connection.execute(
      `SELECT 
        id,
        student_id,
        student_email as email,
        student_name as name,
        student_phone as phone,
        student_cnic as cnic,
        student_address as address,
        student_education as education,
        student_experience as experience,
        profile_image as profileImage,
        created_at as createdAt,
        last_login as lastLogin
       FROM enrollments 
       WHERE student_email = ?
       LIMIT 1`,
      [email]
    );

    if ((rows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    const student = (rows as any[])[0];

    // Get additional stats with separate queries to avoid timeout
    const [enrollmentRows] = await connection.execute(
      `SELECT 
        COUNT(*) as totalEnrollments,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeEnrollments
       FROM enrollments 
       WHERE student_email = ?`,
      [email]
    );

    const [certificateRows] = await connection.execute(
      `SELECT COUNT(*) as certificatesEarned
       FROM certificates 
       WHERE student_email = ?`,
      [email]
    );

    const stats = {
      totalEnrollments: (enrollmentRows as any[])[0]?.totalEnrollments || 0,
      activeEnrollments: (enrollmentRows as any[])[0]?.activeEnrollments || 0,
      certificatesEarned: (certificateRows as any[])[0]?.certificatesEarned || 0,
      memberSince: student.createdAt 
        ? new Date(student.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'N/A'
    };

    // Release connection before sending response
    connection.release();

    return NextResponse.json({
      success: true,
      data: {
        id: student.id,
        studentId: student.student_id,
        email: student.email,
        name: student.name,
        phone: student.phone || '',
        cnic: student.cnic || '',
        address: student.address || '',
        education: student.education || '',
        experience: student.experience || '',
        profileImage: student.profileImage || '',
        lastLogin: student.lastLogin,
        stats
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching profile:', error);
    
    // Make sure to release connection if error occurs
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('Error releasing connection:', releaseError);
      }
    }

    // Return user-friendly error message
    return NextResponse.json(
      { 
        success: false, 
        error: 'Unable to load profile. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}