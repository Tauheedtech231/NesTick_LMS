// /app/api/public/verify-certificate/[number]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  let connection;
  try {
    const { number } = await params;

    console.log('🔍 Verifying certificate:', number);

    if (!number) {
      return NextResponse.json(
        { success: false, error: 'Certificate number is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    const [certRows] = await connection.execute(
      `SELECT 
        c.certificate_number,
        c.student_name,
        c.course_title,
        c.instructor_name,
        c.issue_date,
        c.status,
        c.course_duration,
        ic.image as course_image,
        ic.level as course_level
      FROM certificates c
      LEFT JOIN instructor_course ic ON c.course_id = ic.id
      WHERE c.certificate_number = ?`,
      [number]
    );

    if ((certRows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Certificate not found' },
        { status: 404 }
      );
    }

    const cert = (certRows as any[])[0];

    // Update view count (optional)
    await connection.execute(
      `UPDATE certificates 
       SET download_count = download_count + 1
       WHERE certificate_number = ?`,
      [number]
    );

    return NextResponse.json({
      success: true,
      data: {
        certificateNumber: cert.certificate_number,
        studentName: cert.student_name,
        courseName: cert.course_title,
        instructorName: cert.instructor_name,
        issueDate: cert.issue_date,
        courseDuration: cert.course_duration,
        courseLevel: cert.course_level,
        courseImage: cert.course_image,
        status: cert.status,
        isValid: cert.status === 'issued'
      }
    });

  } catch (error: any) {
    console.error('❌ Error verifying certificate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify certificate' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}