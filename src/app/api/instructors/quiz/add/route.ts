/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const { slideId, courseId, question, options, correctAnswer, points, questionType } = body;

    if (!slideId || !courseId || !question) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Get or create quiz_id from course_quizzes
    const [quizRows] = await connection.execute(
      `SELECT id FROM course_quizzes WHERE slide_id = ? AND course_id = ?`,
      [slideId, courseId]
    ) as any[];

    let quizId;
    if (quizRows.length === 0) {
      quizId = uuidv4();
      await connection.execute(
        `INSERT INTO course_quizzes (id, slide_id, course_id, created_at, updated_at)
         VALUES (?, ?, ?, NOW(), NOW())`,
        [quizId, slideId, courseId]
      );
    } else {
      quizId = quizRows[0].id;
    }

    // Determine question_type
    const finalQuestionType = questionType || (options && options.length > 0 ? 'mcq' : 'text');

    // Insert question into quiz_questions
    const questionId = uuidv4();
    const optionsJson = JSON.stringify(options || []);

    await connection.execute(
      `INSERT INTO quiz_questions 
       (id, quiz_id, question, options, correct_answer, points, question_type, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [questionId, quizId, question, optionsJson, correctAnswer || 0, points || 1, finalQuestionType]
    );

    const [newQuestion] = await connection.execute(
      `SELECT 
        id,
        quiz_id as quizId,
        question,
        options,
        correct_answer as correctAnswer,
        points,
        question_type as questionType,
        created_at as createdAt,
        updated_at as updatedAt
      FROM quiz_questions WHERE id = ?`,
      [questionId]
    ) as any[];

    if (newQuestion && newQuestion.options) {
      newQuestion.options = typeof newQuestion.options === 'string' 
        ? JSON.parse(newQuestion.options) 
        : newQuestion.options;
    }

    return NextResponse.json({
      success: true,
      data: newQuestion
    });

  } catch (error: any) {
    console.error('Error adding quiz question:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add question' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}