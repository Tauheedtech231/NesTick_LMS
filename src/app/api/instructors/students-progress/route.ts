// /app/api/instructors/students-progress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get('instructorId');

    console.log('📊 Fetching students progress for instructor:', instructorId);

    if (!instructorId) {
      return NextResponse.json(
        { success: false, error: 'Instructor ID is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Query 1: Detailed student progress (YOUR WORKING QUERY)
    const [studentRows] = await connection.execute(
      `SELECT 
        e.student_email,
        e.student_name,
        e.student_phone,
        e.enrollment_date,
        e.course_id,
        ic.title as course_title,
        COUNT(DISTINCT cs.id) as total_slides,
        COUNT(DISTINCT CASE WHEN sp.status = 'completed' THEN sp.slide_id END) as completed_slides,
        ROUND(COUNT(DISTINCT CASE WHEN sp.status = 'completed' THEN sp.slide_id END) * 100 / COUNT(DISTINCT cs.id)) as progress_percentage,
        CASE 
            WHEN c.id IS NOT NULL THEN 'Yes'
            ELSE 'No'
        END as certificate_issued,
        c.issue_date as certificate_issue_date,
        c.certificate_number,
        MAX(sp.last_accessed) as last_active
      FROM enrollments e
      JOIN instructor_course ic ON e.course_id = ic.id
      LEFT JOIN course_slides cs ON ic.id = cs.course_id
      LEFT JOIN slide_progress sp ON cs.id = sp.slide_id AND sp.student_email = e.student_email
      LEFT JOIN certificates c ON e.student_email = c.student_email AND e.course_id = c.course_id
      WHERE ic.instructor_id = ?
      GROUP BY 
        e.student_email, 
        e.student_name, 
        e.student_phone, 
        e.enrollment_date, 
        e.course_id, 
        ic.title,
        c.id,
        c.issue_date,
        c.certificate_number
      ORDER BY e.student_name, ic.title`,
      [instructorId]
    );

    // Query 2: Summary statistics (SIMPLIFIED - NO COMPLEX AGGREGATION)
    const [summaryRows] = await connection.execute(
      `SELECT 
        COUNT(DISTINCT e.student_email) as total_students,
        COUNT(DISTINCT e.course_id) as total_courses,
        COUNT(DISTINCT CASE WHEN c.id IS NOT NULL THEN e.student_email END) as students_with_certificates,
        COUNT(DISTINCT CASE WHEN sp.status = 'completed' THEN e.student_email END) as students_completed,
        MAX(e.enrollment_date) as latest_enrollment,
        MIN(e.enrollment_date) as earliest_enrollment
      FROM enrollments e
      JOIN instructor_course ic ON e.course_id = ic.id
      LEFT JOIN slide_progress sp ON e.student_email = sp.student_email
      LEFT JOIN certificates c ON e.student_email = c.student_email AND e.course_id = c.course_id
      WHERE ic.instructor_id = ?`,
      [instructorId]
    );

    const summary = (summaryRows as any[])[0] || {
      total_students: 0,
      total_courses: 0,
      students_with_certificates: 0,
      students_completed: 0,
      latest_enrollment: null,
      earliest_enrollment: null
    };

    // Calculate average progress from the detailed data
    const students = (studentRows as any[]).map(student => ({
      student_email: student.student_email || '',
      student_name: student.student_name || 'Unknown Student',
      student_phone: student.student_phone || '',
      enrollment_date: student.enrollment_date || '',
      course_id: student.course_id || '',
      course_title: student.course_title || 'Unknown Course',
      total_slides: parseInt(student.total_slides) || 0,
      completed_slides: parseInt(student.completed_slides) || 0,
      progress_percentage: parseInt(student.progress_percentage) || 0,
      certificate_issued: student.certificate_issued || 'No',
      certificate_issue_date: student.certificate_issue_date || null,
      certificate_number: student.certificate_number || null,
      last_active: student.last_active || null
    }));

    // Calculate average progress from students data
    const totalProgress = students.reduce((sum, s) => sum + s.progress_percentage, 0);
    const averageProgress = students.length > 0 ? Math.round(totalProgress / students.length) : 0;

    return NextResponse.json({
      success: true,
      data: {
        students,
        summary: {
          totalStudents: parseInt(summary.total_students) || 0,
          totalCourses: parseInt(summary.total_courses) || 0,
          studentsWithCertificates: parseInt(summary.students_with_certificates) || 0,
          studentsCompleted: parseInt(summary.students_completed) || 0,
          averageProgress: averageProgress,
          latestEnrollment: summary.latest_enrollment || null,
          earliestEnrollment: summary.earliest_enrollment || null
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching students progress:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch students progress',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}