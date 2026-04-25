import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */

export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
   console.log("yahi call hroahi ha")
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    const [rows] = await connection.execute(
      `SELECT 
        e.id,
        e.student_id,
        e.student_name,
        e.student_email,
        e.course_id,
        e.course_title,
        e.enrollment_date,
        e.status,
        e.payment_status,
        c.image AS course_image,
        c.duration,
        c.level,
        c.category,
        c.description AS course_description
      FROM enrollments e
      LEFT JOIN instructor_course c ON e.course_id = c.id
      WHERE e.student_email = ? AND e.payment_status = 'verified' AND e.status = 'active'
      ORDER BY e.enrollment_date DESC`,
      [email]
    );

    // Transform data to include full course details
    const transformedData = (rows as any[]).map(row => ({
      id: row.id,
      student_id: row.student_id,
      student_name: row.student_name,
      student_email: row.student_email,
      course_id: row.course_id,
      course_title: row.course_title,
      course_image: row.course_image || null,
      course_duration: row.duration || 'Self-paced',
      course_level: row.level || 'All Levels',
      course_category: row.category || 'Professional Development',
      course_description: row.course_description || row.course_title,
      enrollment_date: row.enrollment_date,
      status: row.status,
      payment_status: row.payment_status
    }));

    return NextResponse.json({
      success: true,
      data: transformedData
    });

  } catch (error: any) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}