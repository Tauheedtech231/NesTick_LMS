// /app/api/student/quizzes/[id]/route.ts
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
    const { searchParams } = new URL(request.url);
    const studentEmail = searchParams.get('studentEmail') || searchParams.get('studentId');

    if (!id || !studentEmail) {
      return NextResponse.json(
        { success: false, error: 'Quiz ID and Student Email are required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Get quiz details
    const [quizRows] = await connection.execute(
      `SELECT 
        q.*,
        (SELECT COUNT(*) FROM quiz_attempts WHERE quiz_id = q.id AND student_email = ?) as student_attempts,
        (SELECT score FROM quiz_attempts WHERE quiz_id = q.id AND student_email = ? ORDER BY created_at DESC LIMIT 1) as last_score,
        (SELECT passed FROM quiz_attempts WHERE quiz_id = q.id AND student_email = ? ORDER BY created_at DESC LIMIT 1) as passed
       FROM quizzes q
       WHERE q.id = ? AND q.status = 'published'`,
      [studentEmail, studentEmail, studentEmail, id]
    );

    if ((quizRows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Quiz not found' },
        { status: 404 }
      );
    }

    const quiz = (quizRows as any[])[0];

    // Get quiz questions
    const [questionRows] = await connection.execute(
      `SELECT 
        id,
        question,
        options,
        points
       FROM quiz_questions 
       WHERE quiz_id = ?
       ORDER BY created_at ASC`,
      [id]
    );

    // Safely parse options
    const questions = (questionRows as any[]).map(q => ({
      id: q.id,
      question: q.question,
      options: parseJSON(q.options),
      points: q.points || 1
    }));

    // Check availability
    const now = new Date();
    const startDate = quiz.start_date ? new Date(quiz.start_date) : null;
    const endDate = quiz.end_date ? new Date(quiz.end_date) : null;
    
    let canAttempt = true;
    let cannotAttemptReason = '';

    if (quiz.student_attempts > 0) {
      canAttempt = false;
      cannotAttemptReason = 'You have already attempted this quiz';
    } else if (startDate && startDate > now) {
      canAttempt = false;
      cannotAttemptReason = 'Quiz has not started yet';
    } else if (endDate && endDate < now) {
      canAttempt = false;
      cannotAttemptReason = 'Quiz has expired';
    }

    return NextResponse.json({
      success: true,
      data: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        duration: quiz.duration,
        totalQuestions: questions.length,
        totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
        instructorName: quiz.instructor_name,
        courseTitle: quiz.course_title,
        startDate: quiz.start_date,
        endDate: quiz.end_date,
        questions,
        studentAttempts: quiz.student_attempts || 0,
        lastScore: quiz.last_score,
        passed: quiz.passed,
        canAttempt,
        cannotAttemptReason
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching quiz:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quiz' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

// Helper function to safely parse JSON
function parseJSON(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return data.split(',').map((item: string) => item.trim());
    }
  }
  return [];
}