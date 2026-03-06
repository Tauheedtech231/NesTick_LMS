// /app/api/student/certificate/check-eligibility/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const studentEmail = searchParams.get('studentEmail');
    const courseId = searchParams.get('courseId');

    if (!studentEmail || !courseId) {
      return NextResponse.json(
        { success: false, error: 'Student email and course ID required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Check if certificate already exists
    const [existingCert] = await connection.execute(
      `SELECT id FROM certificates WHERE student_email = ? AND course_id = ?`,
      [studentEmail, courseId]
    );

    if ((existingCert as any[]).length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          eligible: true,
          hasCertificate: true,
          certificateId: (existingCert as any[])[0].id
        }
      });
    }

    // Check completion status
    const [completionCheck] = await connection.execute(
      `SELECT 
        COUNT(DISTINCT cs.id) as total_slides,
        COUNT(DISTINCT CASE WHEN sp.status = 'completed' THEN sp.slide_id END) as completed_slides
      FROM enrollments e
      JOIN instructor_course ic ON e.course_id = ic.id
      LEFT JOIN course_slides cs ON ic.id = cs.course_id
      LEFT JOIN slide_progress sp ON cs.id = sp.slide_id AND sp.student_email = ?
      WHERE e.student_email = ? AND e.course_id = ?`,
      [studentEmail, studentEmail, courseId]
    );

    const completion = (completionCheck as any[])[0];
    const isEligible = completion && completion.completed_slides === completion.total_slides;

    return NextResponse.json({
      success: true,
      data: {
        eligible: isEligible,
        hasCertificate: false,
        completed: completion?.completed_slides || 0,
        total: completion?.total_slides || 0,
        progress: completion ? Math.round((completion.completed_slides / completion.total_slides) * 100) : 0
      }
    });

  } catch (error: any) {
    console.error('❌ Error checking eligibility:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check eligibility' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}