import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
/* eslint-disable */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slideId = searchParams.get('slideId');

    console.log('📌 GET advanced quiz - slideId:', slideId);

    if (!slideId) {
      return NextResponse.json({ success: false, error: 'Slide ID required' }, { status: 400 });
    }

    // Fetch questions from database
    const result = await query<any[]>(
      `SELECT id, question_type, question_text, correct_answer, points
       FROM tf_fill_questions 
       WHERE slide_id = ? 
       ORDER BY created_at ASC`,
      [slideId]
    );

    console.log('📌 Database result:', result);
    console.log('📌 Is array?', Array.isArray(result));
    console.log('📌 Length:', result?.length);

    // Ensure result is an array
    const questions = result && Array.isArray(result) ? result : [];

    if (questions.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Don't send correct answers to students - just send question structure
    const safeQuestions = questions.map((q: any) => {
      let correctAnswerForType = null;
      
      if (q.question_type === 'true_false') {
        correctAnswerForType = [0, 1]; // Just indicate it's true/false
      } else if (q.question_type === 'fill_blanks') {
        try {
          const parsed = JSON.parse(q.correct_answer);
          correctAnswerForType = Array.isArray(parsed) ? parsed.map(() => '') : [''];
        } catch (e) {
          correctAnswerForType = [''];
        }
      }
      
      return {
        id: q.id,
        type: q.question_type,
        question: q.question_text,
        correctAnswer: correctAnswerForType,
        points: q.points || 1
      };
    });

    return NextResponse.json({ success: true, data: safeQuestions });

  } catch (error: any) {
    console.error('Error fetching advanced quiz:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}