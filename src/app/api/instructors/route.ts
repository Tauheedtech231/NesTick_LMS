import { NextRequest, NextResponse } from 'next/server';
import { query, getConnection } from '@/lib/db';
import { hashPassword, generateRandomPassword } from '@/lib/password';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */
export async function POST(request: NextRequest) {
  const connection = await getConnection();
  
  try {
    const body = await request.json();
    const { 
      name, email, phone, specialization, experience, 
      qualification, bio, status, rating, courseId 
    } = body;

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
    const password = generateRandomPassword();
    const passwordHash = await hashPassword(password);

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
      [credentialsId, instructorId, email, passwordHash, 'instructor', 'active']
    );

    // Commit transaction
    await connection.commit();

    // Return success with instructor data and plain password (for email sending)
    return NextResponse.json({
      success: true,
      data: {
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
        courseDetails,
        password, // Send plain password for email
        credentialsId
      },
      message: 'Instructor added successfully'
    });

  } catch (error: any) {
    // Rollback transaction on error
    await connection.rollback();
    console.error('Error adding instructor:', error);
    
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