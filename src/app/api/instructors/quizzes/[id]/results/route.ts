// /app/api/instructor/quizzes/[id]/results/route.ts
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

    // Get quiz details
    const [quizRows] = await connection.execute(
      `SELECT 
        q.id,
        q.title,
        q.description,
        q.duration,
        q.total_questions,
        q.total_points,
        q.start_date,
        q.end_date,
        q.status,
        q.instructor_name,
        q.course_title
      FROM quizzes q
      WHERE q.id = ?`,
      [id]
    );

    if ((quizRows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Quiz not found' },
        { status: 404 }
      );
    }

    const quiz = (quizRows as any[])[0];

    // Get all attempts for this quiz
    const [attemptRows] = await connection.execute(
      `SELECT 
        qa.id as attempt_id,
        qa.student_email,
        qa.score,
        qa.passed,
        qa.attempted_at,
        qa.answers,
        e.student_name
      FROM quiz_attempts qa
      LEFT JOIN enrollments e ON qa.student_email = e.student_email
      WHERE qa.quiz_id = ?
      ORDER BY qa.score DESC, qa.attempted_at DESC`,
      [id]
    );

    const attempts = (attemptRows as any[]).map(attempt => ({
      id: attempt.attempt_id,
      student_email: attempt.student_email,
      student_name: attempt.student_name || attempt.student_email,
      score: attempt.score,
      total_points: quiz.total_points,
      passed: attempt.passed === 1,
      attempted_at: attempt.attempted_at,
      percentage: Math.round((attempt.score / quiz.total_points) * 100)
    }));

    // Calculate statistics
    const totalAttempts = attempts.length;
    const passedAttempts = attempts.filter(a => a.passed).length;
    const averageScore = totalAttempts > 0 
      ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts) 
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        quiz: {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          duration: quiz.duration,
          totalQuestions: quiz.total_questions,
          totalPoints: quiz.total_points,
          startDate: quiz.start_date,
          endDate: quiz.end_date,
          status: quiz.status,
          instructorName: quiz.instructor_name,
          courseTitle: quiz.course_title
        },
        stats: {
          totalAttempts,
          passedAttempts,
          averageScore,
          passRate: totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0
        },
        attempts
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching quiz details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quiz details' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}