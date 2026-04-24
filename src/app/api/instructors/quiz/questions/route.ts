/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const slideId = searchParams.get('slideId');
    const courseId = searchParams.get('courseId');

    console.log('📥 Fetching quiz questions for:', { slideId, courseId });

    if (!slideId || !courseId) {
      return NextResponse.json(
        { success: false, error: 'Slide ID and Course ID are required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Get quiz_id from course_quizzes
    const [quizRows] = await connection.execute(
      `SELECT id FROM course_quizzes WHERE slide_id = ? AND course_id = ?`,
      [slideId, courseId]
    ) as any[];

    console.log('📋 Quiz rows found:', quizRows);

    if (!quizRows || quizRows.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    const quizId = quizRows[0].id;
    console.log('🎯 Quiz ID:', quizId);

    // Get all questions for this quiz
    const [questions] = await connection.execute(
      `SELECT 
        id,
        quiz_id as quizId,
        question,
        options,
        correct_answer as correctAnswer,
        points,
        created_at as createdAt,
        updated_at as updatedAt
      FROM quiz_questions 
      WHERE quiz_id = ?
      ORDER BY created_at ASC`,
      [quizId]
    ) as any[];

    console.log('📝 Questions found:', questions?.length || 0);

    // Parse options JSON safely
    const parsedQuestions = (questions || []).map((q: any) => {
      let parsedOptions = [];
      let questionType = 'text';
      
      try {
        if (q.options) {
          if (typeof q.options === 'string') {
            parsedOptions = JSON.parse(q.options);
          } else {
            parsedOptions = q.options;
          }
        }
        questionType = parsedOptions && parsedOptions.length > 0 ? 'mcq' : 'text';
      } catch (e) {
        console.error('Error parsing options for question:', q.id, e);
        parsedOptions = [];
        questionType = 'text';
      }
      
      return {
        id: q.id,
        quizId: q.quizId,
        question: q.question || '',
        options: parsedOptions,
        correctAnswer: q.correctAnswer || 0,
        points: q.points || 1,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
        questionType: questionType
      };
    });

    return NextResponse.json({
      success: true,
      data: parsedQuestions
    });

  } catch (error: any) {
    console.error('❌ Error fetching quiz questions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch questions',
        details: error.toString()
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}