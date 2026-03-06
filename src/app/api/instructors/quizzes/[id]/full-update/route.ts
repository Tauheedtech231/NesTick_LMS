import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */
/* =====================================================
   GET SINGLE QUIZ
===================================================== */
export async function GET(
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

    connection = await getConnection();

    // Get quiz details
    const [quizRows] = await connection.execute(
      `SELECT * FROM quizzes WHERE id = ?`,
      [id]
    );

    if (!quizRows || (quizRows as any[]).length === 0) {
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

    // Parse options safely
    const questions = (questionRows as any[]).map(q => {
      let parsedOptions = ['', '', '', ''];
      
      try {
        if (q.options) {
          if (typeof q.options === 'string') {
            parsedOptions = JSON.parse(q.options);
          } else if (Array.isArray(q.options)) {
            parsedOptions = q.options;
          }
        }
        if (!Array.isArray(parsedOptions) || parsedOptions.length !== 4) {
          parsedOptions = ['', '', '', ''];
        }
      } catch (e) {
        console.error('Error parsing options:', e);
        parsedOptions = ['', '', '', ''];
      }

      return {
        id: q.id,
        question: q.question || '',
        options: parsedOptions,
        correctAnswer: q.correct_answer || 0,
        points: q.points || 1
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description || '',
        duration: quiz.duration,
        totalQuestions: quiz.total_questions,
        totalPoints: quiz.total_points,
        startDate: quiz.start_date,
        endDate: quiz.end_date,
        status: quiz.status,
        instructorId: quiz.instructor_id,
        instructorName: quiz.instructor_name,
        courseId: quiz.course_id,
        courseTitle: quiz.course_title,
        attempts: quiz.attempts || 0,
        averageScore: quiz.average_score || 0,
        createdAt: quiz.created_at,
        updatedAt: quiz.updated_at,
        questions
      }
    });

  } catch (error: any) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

/* =====================================================
   UPDATE QUIZ - PUT METHOD
===================================================== */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  try {
    const { id } = await params;
    const body = await request.json();

    console.log('🔄 Updating quiz:', id);
    console.log('📦 Request body:', body);

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Quiz ID required' },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      duration,
      startDate,
      endDate,
      status,
      questions
    } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Quiz title is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();
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
        // Ensure options is always a valid array of 4 strings
        let optionsArray = ['', '', '', ''];
        
        if (Array.isArray(q.options) && q.options.length === 4) {
          optionsArray = q.options.map((opt: string) => opt || '');
        }

        const questionId = q.id || uuidv4();
        await connection.execute(
          `INSERT INTO quiz_questions (
            id, quiz_id, question, options, correct_answer, points, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            questionId,
            id,
            q.question || '',
            JSON.stringify(optionsArray),
            q.correctAnswer || 0,
            q.points || 1
          ]
        );
      }
      console.log(`✅ ${questions.length} questions updated`);
    }

    await connection.commit();
    console.log('🎉 Quiz updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Quiz updated successfully',
      data: {
        id,
        totalQuestions,
        totalPoints
      }
    });

  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error('❌ Error updating quiz:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update quiz' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

/* =====================================================
   DELETE QUIZ - DELETE METHOD
===================================================== */
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

    connection = await getConnection();

    // Check if quiz exists
    const [quizRows] = await connection.execute(
      'SELECT id FROM quizzes WHERE id = ?',
      [id]
    );

    if (!quizRows || (quizRows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Delete quiz (questions will be deleted via CASCADE)
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
    if (connection) connection.release();
  }
}