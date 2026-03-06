// /app/api/instructor/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get('instructorId');

    console.log('📊 Fetching instructor dashboard data for:', instructorId);

    if (!instructorId) {
      return NextResponse.json(
        { success: false, error: 'Instructor ID is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // 1. Stats Query
    const [statsRows] = await connection.execute(
      `SELECT 
          COUNT(DISTINCT c.id) as total_courses,
          COUNT(DISTINCT CASE WHEN c.status = 'published' THEN c.id END) as active_courses,
          COUNT(DISTINCT e.student_email) as total_students,
          COUNT(DISTINCT q.id) as mock_quizzes
      FROM instructor_course c
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN quizzes q ON q.instructor_id = c.instructor_id
      WHERE c.instructor_id = ?
      GROUP BY c.instructor_id`,
      [instructorId]
    );

    // 2. Courses List Query
    const [coursesRows] = await connection.execute(
      `SELECT 
          c.id,
          c.title,
          c.description,
          c.category,
          c.duration,
          c.level,
          c.price,
          c.image,
          c.status,
          c.student_capacity,
          c.created_at,
          c.updated_at,
          COUNT(DISTINCT e.student_email) as enrolled_students,
          COUNT(DISTINCT cs.id) as total_slides,
          COUNT(DISTINCT q.id) as total_quizzes,
          COUNT(DISTINCT ca.id) as total_assignments
      FROM instructor_course c
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN course_slides cs ON c.id = cs.course_id
      LEFT JOIN quizzes q ON c.id = q.course_id
      LEFT JOIN course_assignments ca ON c.id = ca.course_id AND ca.status = 'published'
      WHERE c.instructor_id = ?
      GROUP BY c.id
      ORDER BY c.created_at DESC`,
      [instructorId]
    );

    // 3. Recent Activity Query
    const [activityRows] = await connection.execute(
      `(
          SELECT 
              'enrollment' as type,
              CONCAT(e.student_name, ' enrolled in ', c.title) as description,
              e.enrollment_date as time,
              e.student_name as user,
              c.title as course
          FROM enrollments e
          JOIN instructor_course c ON e.course_id = c.id
          WHERE c.instructor_id = ?
      )
      UNION ALL
      (
          SELECT 
              'quiz_attempt' as type,
              CONCAT('Student attempted quiz: ', q.title) as description,
              qa.attempted_at as time,
              'Student' as user,
              q.title as course
          FROM quiz_attempts qa
          JOIN quizzes q ON qa.quiz_id = q.id
          WHERE q.instructor_id = ?
      )
      UNION ALL
      (
          SELECT 
              'certificate' as type,
              CONCAT(cert.student_name, ' received certificate for ', cert.course_title) as description,
              cert.issue_date as time,
              cert.student_name as user,
              cert.course_title as course
          FROM certificates cert
          JOIN instructor_course c ON cert.course_id = c.id
          WHERE c.instructor_id = ?
      )
      ORDER BY time DESC
      LIMIT 10`,
      [instructorId, instructorId, instructorId]
    );

    const stats = (statsRows as any[])[0] || {
      total_courses: 0,
      active_courses: 0,
      total_students: 0,
      mock_quizzes: 0
    };

    // Format courses
    const courses = (coursesRows as any[]).map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      duration: course.duration,
      level: course.level,
      price: course.price,
      image: course.image,
      status: course.status,
      studentCapacity: parseInt(course.student_capacity) || 0,
      createdAt: course.created_at,
      updatedAt: course.updated_at,
      stats: {
        enrolledStudents: parseInt(course.enrolled_students) || 0,
        totalSlides: parseInt(course.total_slides) || 0,
        totalQuizzes: parseInt(course.total_quizzes) || 0,
        totalAssignments: parseInt(course.total_assignments) || 0
      }
    }));

    // Format activity
    const activity = (activityRows as any[]).map(act => ({
      type: act.type,
      description: act.description,
      time: act.time,
      user: act.user,
      course: act.course
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalCourses: parseInt(stats.total_courses) || 0,
          activeCourses: parseInt(stats.active_courses) || 0,
          totalStudents: parseInt(stats.total_students) || 0,
          mockQuizzes: parseInt(stats.mock_quizzes) || 0
        },
        courses,
        recentActivity: activity
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching dashboard data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard data',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}