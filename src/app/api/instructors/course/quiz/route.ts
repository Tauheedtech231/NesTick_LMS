import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */
export async function POST(request: NextRequest) {
  try {
    const { slideId, courseId, questions } = await request.json();

    if (!slideId || !courseId || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('📝 Saving quiz for slide:', slideId);

    // Check if quiz exists
    const existingQuiz = await query<any[]>(
      'SELECT id FROM course_quizzes WHERE slide_id = ?',
      [slideId]
    );

    let quizId;

    if (existingQuiz.length > 0) {
      quizId = existingQuiz[0].id;
      // Delete existing questions
      await query('DELETE FROM quiz_questions WHERE quiz_id = ?', [quizId]);
    } else {
      quizId = uuidv4();
      await query(
        `INSERT INTO course_quizzes (id, slide_id, course_id, created_at, updated_at)
         VALUES (?, ?, ?, NOW(), NOW())`,
        [quizId, slideId, courseId]
      );
    }

    // Insert new questions
    for (const q of questions) {
      await query(
        `INSERT INTO quiz_questions (id, quiz_id, question, options, correct_answer, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [q.id || uuidv4(), quizId, q.question, JSON.stringify(q.options), q.correctAnswer]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Quiz saved successfully'
    });

  } catch (error: any) {
    console.error('Error saving quiz:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save quiz' },
      { status: 500 }
    );
  }
}