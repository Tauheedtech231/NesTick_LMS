// /app/api/student/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const studentEmail = searchParams.get('studentEmail');

    console.log('📊 Fetching dashboard data for:', studentEmail);

    if (!studentEmail) {
      return NextResponse.json(
        { success: false, error: 'Student email is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // 1. Quiz Statistics Query
    const [quizRows] = await connection.execute(
      `SELECT 
        COUNT(DISTINCT q.id) as total_quizzes,
        COUNT(DISTINCT qa.id) as attempted_quizzes,
        COUNT(DISTINCT CASE WHEN qa.passed = 1 THEN qa.id END) as passed_quizzes,
        COALESCE(ROUND(AVG(qa.score), 1), 0) as average_score,
        COALESCE(MAX(qa.score), 0) as highest_score,
        COUNT(DISTINCT CASE WHEN qa.id IS NULL AND q.status = 'published' THEN q.id END) as pending_quizzes
      FROM quizzes q
      LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id AND qa.student_email = ?
      WHERE q.status = 'published'`,
      [studentEmail]
    );

    // 2. Courses Progress Query
    const [courseRows] = await connection.execute(
      `SELECT 
        e.course_id,
        ic.title as course_title,
        ic.image as course_image,
        ic.duration,
        ic.level,
        COUNT(DISTINCT cs.id) as total_slides,
        COUNT(DISTINCT CASE WHEN sp.status = 'completed' THEN sp.slide_id END) as completed_slides,
        COALESCE(sp_progress.progress_percentage, 0) as progress_percentage,
        MAX(sp.last_accessed) as last_accessed,
        CASE 
          WHEN COUNT(DISTINCT CASE WHEN sp.status = 'completed' THEN sp.slide_id END) = COUNT(DISTINCT cs.id) 
          THEN 'completed'
          WHEN COUNT(DISTINCT sp.id) > 0 THEN 'in_progress'
          ELSE 'not_started'
        END as status
      FROM enrollments e
      JOIN instructor_course ic ON e.course_id = ic.id
      LEFT JOIN course_slides cs ON ic.id = cs.course_id
      LEFT JOIN slide_progress sp ON cs.id = sp.slide_id AND sp.student_email = ?
      LEFT JOIN student_progress sp_progress ON e.id = sp_progress.enrollment_id
      WHERE e.student_email = ?
      GROUP BY e.course_id, ic.title, ic.image, ic.duration, ic.level, sp_progress.progress_percentage
      ORDER BY last_accessed DESC`,
      [studentEmail, studentEmail]
    );

    // 3. Recent Activity Query
    const [activityRows] = await connection.execute(
      `(
        SELECT 
          'quiz_attempt' as activity_type,
          CONCAT('Attempted quiz: ', q.title) as description,
          qa.attempted_at as created_at,
          CASE WHEN qa.passed = 1 THEN 'passed' ELSE 'failed' END as status,
          qa.score as value
        FROM quiz_attempts qa
        JOIN quizzes q ON qa.quiz_id = q.id
        WHERE qa.student_email = ?
      )
      UNION ALL
      (
        SELECT 
          'slide_complete' as activity_type,
          CONCAT('Completed lesson: ', cs.title) as description,
          sp.completed_at as created_at,
          'completed' as status,
          NULL as value
        FROM slide_progress sp
        JOIN course_slides cs ON sp.slide_id = cs.id
        WHERE sp.student_email = ? AND sp.status = 'completed'
      )
      UNION ALL
      (
        SELECT 
          'course_enrolled' as activity_type,
          CONCAT('Enrolled in: ', ic.title) as description,
          e.enrollment_date as created_at,
          'enrolled' as status,
          NULL as value
        FROM enrollments e
        JOIN instructor_course ic ON e.course_id = ic.id
        WHERE e.student_email = ?
      )
      ORDER BY created_at DESC
      LIMIT 5`,
      [studentEmail, studentEmail, studentEmail]
    );

    // Format the response
    const quizStats = (quizRows as any[])[0] || {
      total_quizzes: 0,
      attempted_quizzes: 0,
      passed_quizzes: 0,
      average_score: 0,
      highest_score: 0,
      pending_quizzes: 0
    };

    return NextResponse.json({
      success: true,
      data: {
        quizStats: {
          totalQuizzes: quizStats.total_quizzes,
          attemptedQuizzes: quizStats.attempted_quizzes,
          passedQuizzes: quizStats.passed_quizzes,
          averageScore: parseFloat(quizStats.average_score),
          highestScore: quizStats.highest_score,
          pendingQuizzes: quizStats.pending_quizzes,
          passRate: quizStats.attempted_quizzes > 0 
            ? Math.round((quizStats.passed_quizzes / quizStats.attempted_quizzes) * 100)
            : 0
        },
        courses: (courseRows as any[]).map(course => ({
          id: course.course_id,
          title: course.course_title,
          image: course.course_image,
          duration: course.duration,
          level: course.level,
          totalSlides: course.total_slides || 0,
          completedSlides: course.completed_slides || 0,
          progressPercentage: course.progress_percentage || 0,
          lastAccessed: course.last_accessed,
          status: course.status
        })),
        recentActivity: (activityRows as any[]).map(activity => ({
          type: activity.activity_type,
          description: activity.description,
          createdAt: activity.created_at,
          status: activity.status,
          value: activity.value
        })),
        summary: {
          totalCourses: (courseRows as any[]).length,
          completedCourses: (courseRows as any[]).filter(c => c.status === 'completed').length,
          inProgressCourses: (courseRows as any[]).filter(c => c.status === 'in_progress').length,
          totalQuizzes: quizStats.total_quizzes,
          completedQuizzes: quizStats.attempted_quizzes,
          passRate: quizStats.attempted_quizzes > 0 
            ? Math.round((quizStats.passed_quizzes / quizStats.attempted_quizzes) * 100)
            : 0
        }
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