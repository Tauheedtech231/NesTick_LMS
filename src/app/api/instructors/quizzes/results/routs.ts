// /app/api/instructor/quizzes/results/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get('instructorId');

    console.log('📊 Fetching quiz results for instructor:', instructorId);

    if (!instructorId) {
      return NextResponse.json(
        { success: false, error: 'Instructor ID is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Query 1: Get all quizzes with attempt statistics (YOUR WORKING QUERY)
    const [quizRows] = await connection.execute(
      `SELECT 
        q.id as quiz_id,
        q.title as quiz_title,
        q.description,
        q.duration,
        q.total_questions,
        q.total_points,
        q.start_date,
        q.end_date,
        q.status,
        q.instructor_name,
        q.course_title,
        COUNT(DISTINCT qa.id) as total_attempts,
        COUNT(DISTINCT CASE WHEN qa.passed = 1 THEN qa.student_email END) as passed_attempts,
        ROUND(AVG(qa.score), 1) as average_score,
        MAX(qa.score) as highest_score,
        MIN(qa.score) as lowest_score,
        COUNT(DISTINCT qa.student_email) as unique_students,
        MAX(qa.attempted_at) as last_attempt
      FROM quizzes q
      LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
      WHERE q.instructor_id = ?
      GROUP BY q.id
      ORDER BY q.created_at DESC`,
      [instructorId]
    );

    // Query 2: Get detailed attempts for each quiz
    const [attemptRows] = await connection.execute(
      `SELECT 
        qa.id as attempt_id,
        qa.quiz_id,
        qa.student_email,
        qa.score,
        qa.passed,
        qa.attempted_at,
        qa.answers,
        q.title as quiz_title,
        q.total_questions,
        q.total_points,
        e.student_name
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      LEFT JOIN enrollments e ON qa.student_email = e.student_email
      WHERE q.instructor_id = ?
      ORDER BY qa.attempted_at DESC`,
      [instructorId]
    );

    // Group attempts by quiz_id
    const attemptsByQuiz: Record<string, any[]> = {};
    (attemptRows as any[]).forEach(attempt => {
      if (!attemptsByQuiz[attempt.quiz_id]) {
        attemptsByQuiz[attempt.quiz_id] = [];
      }
      attemptsByQuiz[attempt.quiz_id].push({
        attempt_id: attempt.attempt_id,
        student_email: attempt.student_email,
        student_name: attempt.student_name || attempt.student_email,
        score: attempt.score,
        total_points: attempt.total_points,
        passed: attempt.passed === 1,
        attempted_at: attempt.attempted_at,
        answers: attempt.answers,
        percentage: Math.round((attempt.score / attempt.total_points) * 100)
      });
    });

    // Format quizzes data
    const quizzes = (quizRows as any[]).map(quiz => ({
      id: quiz.quiz_id,
      title: quiz.quiz_title,
      description: quiz.description,
      duration: quiz.duration,
      totalQuestions: quiz.total_questions,
      totalPoints: quiz.total_points,
      startDate: quiz.start_date,
      endDate: quiz.end_date,
      status: quiz.status,
      instructorName: quiz.instructor_name,
      courseTitle: quiz.course_title,
      stats: {
        totalAttempts: parseInt(quiz.total_attempts) || 0,
        passedAttempts: parseInt(quiz.passed_attempts) || 0,
        averageScore: parseFloat(quiz.average_score) || 0,
        highestScore: parseInt(quiz.highest_score) || 0,
        lowestScore: parseInt(quiz.lowest_score) || 0,
        uniqueStudents: parseInt(quiz.unique_students) || 0,
        lastAttempt: quiz.last_attempt,
        passRate: quiz.total_attempts > 0 
          ? Math.round((parseInt(quiz.passed_attempts) / parseInt(quiz.total_attempts)) * 100) 
          : 0
      },
      attempts: attemptsByQuiz[quiz.quiz_id] || []
    }));

    return NextResponse.json({
      success: true,
      data: quizzes
    });

  } catch (error: any) {
    console.error('❌ Error fetching quiz results:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quiz results' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}