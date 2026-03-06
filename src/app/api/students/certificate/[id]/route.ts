// /app/api/student/certificate/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  try {
    const { id } = await params;

    connection = await getConnection();

    const [certRows] = await connection.execute(
      `SELECT 
        id,
        certificate_number,
        student_name,
        student_email,
        course_title,
        course_duration,
        instructor_name,
        issue_date,
        download_count,
        last_downloaded,
        status
      FROM certificates WHERE id = ?`,
      [id]
    );

    if ((certRows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Update download count
    await connection.execute(
      `UPDATE certificates 
       SET download_count = download_count + 1,
           last_downloaded = NOW(),
           updated_at = NOW()
       WHERE id = ?`,
      [id]
    );

    return NextResponse.json({
      success: true,
      data: (certRows as any[])[0]
    });

  } catch (error: any) {
    console.error('❌ Error fetching certificate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch certificate' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}