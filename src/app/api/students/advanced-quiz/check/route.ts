import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
/* eslint-disable */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slideId = searchParams.get('slideId');
    const studentEmail = searchParams.get('studentEmail');

    if (!slideId || !studentEmail) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Get quiz_id from course_quizzes
    const quizRecord = await query<any[]>(
      `SELECT id FROM course_quizzes WHERE slide_id = ?`,
      [slideId]
    );

    if (!quizRecord || quizRecord.length === 0) {
      return NextResponse.json({ success: true, data: { hasAttempted: false } });
    }

    const quizId = quizRecord[0].id;

    // Check if attempted
    const attempt = await query<any[]>(
      `SELECT score, total_possible, percentage, passed, answers 
       FROM quiz_attempts_new 
       WHERE quiz_id = ? AND student_email = ? AND status = 'completed'
       ORDER BY completed_at DESC LIMIT 1`,
      [quizId, studentEmail]
    );

    if (attempt && attempt.length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          hasAttempted: true,
          score: attempt[0].score,
          total: attempt[0].total_possible,
          percentage: attempt[0].percentage,
          passed: attempt[0].passed === 1,
          answers: attempt[0].answers
        }
      });
    }

    return NextResponse.json({ success: true, data: { hasAttempted: false } });

  } catch (error: any) {
    console.error('Error checking attempt:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}