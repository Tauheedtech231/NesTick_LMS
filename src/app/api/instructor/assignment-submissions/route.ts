import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */

export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get('instructorId');

    connection = await getConnection();

    // Get all assignment submissions with course and student details
    const [submissions] = await connection.execute(
      `SELECT 
        asub.id,
        asub.student_email,
        asub.student_name,
        asub.assignment_id,
        asub.course_id,
        asub.slide_id,
        asub.files,
        asub.submitted_at,
        asub.status,
        asub.score,
        asub.feedback,
        ca.title AS assignment_title,
        ca.total_marks,
        ca.passing_marks,
        ic.title AS course_title,
        cs.title AS slide_title
      FROM assignment_submissions asub
      JOIN course_assignments ca ON asub.assignment_id = ca.id
      JOIN instructor_course ic ON asub.course_id = ic.id
      LEFT JOIN course_slides cs ON asub.slide_id = cs.id
      ORDER BY asub.submitted_at DESC`
    );

    return NextResponse.json({
      success: true,
      data: submissions
    });

  } catch (error: any) {
    console.error('Error fetching assignment submissions:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch submissions' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}