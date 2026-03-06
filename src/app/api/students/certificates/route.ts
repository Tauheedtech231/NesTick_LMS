// /app/api/student/certificates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    const [certRows] = await connection.execute(
      `SELECT 
        id,
        certificate_number,
        student_name,
        course_title,
        instructor_name,
        issue_date,
        download_count,
        last_downloaded,
        course_duration,
        status
      FROM certificates 
      WHERE student_email = ?
      ORDER BY issue_date DESC`,
      [email]
    );

    return NextResponse.json({
      success: true,
      data: certRows,
      count: (certRows as any[]).length
    });

  } catch (error: any) {
    console.error('❌ Error fetching certificates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch certificates' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}