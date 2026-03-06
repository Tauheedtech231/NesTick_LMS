// /app/api/admin/certificates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const studentEmail = searchParams.get('studentEmail');
    const status = searchParams.get('status');

    connection = await getConnection();

    let query = `
      SELECT 
        c.*,
        ic.title as course_title,
        ic.instructor_name,
        e.student_name,
        e.student_email
      FROM certificates c
      JOIN instructor_course ic ON c.course_id = ic.id
      JOIN enrollments e ON c.enrollment_id = e.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (courseId) {
      query += ` AND c.course_id = ?`;
      params.push(courseId);
    }

    if (studentEmail) {
      query += ` AND c.student_email = ?`;
      params.push(studentEmail);
    }

    if (status) {
      query += ` AND c.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY c.issue_date DESC`;

    const [certRows] = await connection.execute(query, params);

    return NextResponse.json({
      success: true,
      data: certRows,
      count: (certRows as any[]).length
    });

  } catch (error: any) {
    console.error('❌ Error fetching certificates:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch certificates' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}