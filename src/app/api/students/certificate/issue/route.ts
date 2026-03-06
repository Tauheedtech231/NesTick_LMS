// /app/api/student/certificate/issue/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */
export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const { studentEmail, courseId } = body;

    console.log('📜 Certificate issuance requested:', { studentEmail, courseId });

    if (!studentEmail || !courseId) {
      return NextResponse.json(
        { success: false, error: 'Student email and course ID are required' },
        { status: 400 }
      );
    }

    connection = await getConnection();
    await connection.beginTransaction();

    // 1. Get enrollment_id from enrollments table
    const [enrollmentRows] = await connection.execute(
      `SELECT id as enrollment_id FROM enrollments 
       WHERE student_email = ? AND course_id = ? LIMIT 1`,
      [studentEmail, courseId]
    );

    if ((enrollmentRows as any[]).length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    const enrollmentId = (enrollmentRows as any[])[0].enrollment_id;

    // 2. Check if certificate already exists
    const [existingCert] = await connection.execute(
      `SELECT id, certificate_number FROM certificates 
       WHERE student_email = ? AND course_id = ?`,
      [studentEmail, courseId]
    );

    if ((existingCert as any[]).length > 0) {
      await connection.rollback();
      return NextResponse.json({
        success: true,
        data: (existingCert as any[])[0],
        message: 'Certificate already issued'
      });
    }

    // 3. Check if all slides are completed
    const [completionCheck] = await connection.execute(
      `SELECT 
        COUNT(DISTINCT cs.id) as total_slides,
        COUNT(DISTINCT CASE WHEN sp.status = 'completed' THEN sp.slide_id END) as completed_slides
      FROM enrollments e
      JOIN instructor_course ic ON e.course_id = ic.id
      LEFT JOIN course_slides cs ON ic.id = cs.course_id
      LEFT JOIN slide_progress sp ON cs.id = sp.slide_id AND sp.student_email = ?
      WHERE e.student_email = ? AND e.course_id = ?
      GROUP BY e.course_id`,
      [studentEmail, studentEmail, courseId]
    );

    const completion = (completionCheck as any[])[0];
    
    if (!completion || completion.completed_slides < completion.total_slides) {
      await connection.rollback();
      return NextResponse.json({
        success: false,
        error: 'Course not completed yet',
        data: {
          completed: completion?.completed_slides || 0,
          total: completion?.total_slides || 0,
          progress: completion ? Math.round((completion.completed_slides / completion.total_slides) * 100) : 0
        }
      }, { status: 400 });
    }

    // 4. Get student and course details
    const [detailsRows] = await connection.execute(
      `SELECT 
        e.student_name,
        e.student_id,
        ic.title as course_title,
        ic.duration as course_duration,
        ic.instructor_name,
        ic.image as course_image
      FROM enrollments e
      JOIN instructor_course ic ON e.course_id = ic.id
      WHERE e.student_email = ? AND e.course_id = ?`,
      [studentEmail, courseId]
    );

    const details = (detailsRows as any[])[0];

    // 5. Generate unique certificate number
    const year = new Date().getFullYear();
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const courseCode = courseId.substring(0, 4).toUpperCase();
    const certificateNumber = `CERT-${year}-${courseCode}-${randomPart}`;

    // 6. Create certificate record (matching your table structure)
    const certificateId = uuidv4();
    await connection.execute(
      `INSERT INTO certificates (
        id, certificate_number, enrollment_id, student_id, 
        student_email, student_name, course_id, course_title, 
        course_duration, instructor_name, issue_date, status,
        download_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'issued', 0, NOW(), NOW())`,
      [
        certificateId,
        certificateNumber,
        enrollmentId,
        details.student_id || null,
        studentEmail,
        details.student_name,
        courseId,
        details.course_title,
        details.course_duration || null,
        details.instructor_name || null
      ]
    );

    await connection.commit();

    // 7. Fetch the created certificate
    const [newCert] = await connection.execute(
      `SELECT 
        id, certificate_number, student_name, course_title, 
        instructor_name, issue_date, course_duration
      FROM certificates WHERE id = ?`,
      [certificateId]
    );

    console.log('✅ Certificate issued:', certificateNumber);

    return NextResponse.json({
      success: true,
      data: (newCert as any[])[0],
      message: 'Certificate issued successfully!'
    });

  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error('❌ Error issuing certificate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to issue certificate' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}