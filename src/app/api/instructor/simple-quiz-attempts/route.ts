/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'Course ID is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // ✅ Simple quiz attempts - Direct fetch (like student portal)
    const [attempts] = await connection.execute(
      `SELECT 
        qa.id,
        qa.student_email,
        qa.quiz_id,
        qa.score,
        qa.passed,
        qa.attempted_at AS completed_at,
        qa.answers,
        cq.id AS quiz_id,
        cs.slide_number,
        cs.title AS slide_title,
        100 AS total_possible,
        qa.score AS percentage,
        'simple' AS quiz_type
      FROM quiz_attempts qa
      INNER JOIN course_quizzes cq ON qa.quiz_id = cq.id
      LEFT JOIN course_slides cs ON cq.slide_id = cs.id
      WHERE cq.course_id = ?
      ORDER BY qa.attempted_at DESC`,
      [courseId]
    ) as any[];

    // Get student names
    for (const attempt of attempts) {
      const [student] = await connection.execute(
        `SELECT student_name FROM enrollments WHERE student_email = ? LIMIT 1`,
        [attempt.student_email]
      ) as any[];
      attempt.student_name = student[0]?.student_name || 'N/A';
      attempt.quiz_title = attempt.slide_title || 'Quiz';
    }

    console.log('✅ Simple quiz attempts found:', attempts.length);

    return NextResponse.json({
      success: true,
      data: attempts
    });

  } catch (error: any) {
    console.error('Error fetching simple quiz attempts:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch simple quiz attempts' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}