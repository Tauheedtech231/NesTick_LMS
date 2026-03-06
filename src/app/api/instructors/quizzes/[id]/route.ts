import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Quiz ID required' },
        { status: 400 }
      );
    }

    const connection = await getConnection();

    // Get quiz details
    const [quizRows] = await connection.execute(
      `SELECT q.*, 
              (SELECT COUNT(*) FROM quiz_attempts WHERE quiz_id = q.id) as attempts_count,
              (SELECT AVG(percentage) FROM quiz_attempts WHERE quiz_id = q.id) as avg_percentage
       FROM quizzes q
       WHERE q.id = ?`,
      [id]
    );

    if (!quizRows || (quizRows as any[]).length === 0) {
      connection.release();
      return NextResponse.json(
        { success: false, error: 'Quiz not found' },
        { status: 404 }
      );
    }

    const quiz = (quizRows as any[])[0];

    // Get questions
    const [questionRows] = await connection.execute(
      `SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY created_at`,
      [id]
    );

    // Parse options for each question
    const questions = (questionRows as any[]).map(q => ({
      ...q,
      options: JSON.parse(q.options)
    }));

    connection.release();

    return NextResponse.json({
      success: true,
      data: {
        ...quiz,
        questions
      }
    });

  } catch (error: any) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      duration,
      startDate,
      endDate,
      status,
      questions
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Quiz ID required' },
        { status: 400 }
      );
    }

    const mysql = require('mysql2/promise');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '76.13.220.47',
      user: process.env.DB_USER || 'lms_user',
      password: process.env.DB_PASSWORD || 'StrongPass@456',
      database: process.env.DB_NAME || 'lms_db',
    });

    await connection.beginTransaction();

    // Calculate totals
    const totalQuestions = questions?.length || 0;
    const totalPoints = questions?.reduce((sum: number, q: any) => sum + (q.points || 1), 0) || 0;

    // Update quiz
    await connection.execute(
      `UPDATE quizzes SET
        title = ?,
        description = ?,
        duration = ?,
        total_questions = ?,
        total_points = ?,
        start_date = ?,
        end_date = ?,
        status = ?,
        updated_at = NOW()
       WHERE id = ?`,
      [
        title,
        description || null,
        duration || 30,
        totalQuestions,
        totalPoints,
        startDate || null,
        endDate || null,
        status || 'draft',
        id
      ]
    );

    // Delete existing questions
    await connection.execute('DELETE FROM quiz_questions WHERE quiz_id = ?', [id]);

    // Insert new questions
    if (questions && questions.length > 0) {
      for (const q of questions) {
        const questionId = q.id || require('uuid').v4();
        await connection.execute(
          `INSERT INTO quiz_questions (
            id, quiz_id, question, options, correct_answer, points, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            questionId,
            id,
            q.question || '',
            JSON.stringify(q.options || ['', '', '', '']),
            q.correctAnswer || 0,
            q.points || 1
          ]
        );
      }
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: 'Quiz updated successfully'
    });

  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error('Error updating quiz:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Quiz ID required' },
        { status: 400 }
      );
    }

    const mysql = require('mysql2/promise');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '76.13.220.47',
      user: process.env.DB_USER || 'lms_user',
      password: process.env.DB_PASSWORD || 'StrongPass@456',
      database: process.env.DB_NAME || 'lms_db',
    });

    // Delete quiz (cascades to questions and attempts)
    await connection.execute('DELETE FROM quizzes WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Quiz deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}