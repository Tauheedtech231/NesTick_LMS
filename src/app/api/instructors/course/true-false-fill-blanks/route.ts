import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slideId = searchParams.get('slideId');

    if (!slideId) {
      return NextResponse.json({ success: false, error: 'Slide ID required' }, { status: 400 });
    }

    const questions = await query<any[]>(
      `SELECT id, question_type, question_text, correct_answer, points
       FROM tf_fill_questions 
       WHERE slide_id = ? 
       ORDER BY created_at ASC`,
      [slideId]
    );

    const parsedQuestions = (questions || []).map(q => {
      // SAFE JSON parsing with error handling
      let correctAnswer;
      try {
        correctAnswer = typeof q.correct_answer === 'string' 
          ? JSON.parse(q.correct_answer) 
          : q.correct_answer;
      } catch (e) {
        console.error('Error parsing correct_answer:', q.correct_answer);
        correctAnswer = q.correct_answer;
      }
      
      return {
        id: q.id,
        type: q.question_type,
        question: q.question_text,
        correctAnswer: correctAnswer,
        points: q.points
      };
    });

    return NextResponse.json({ success: true, data: parsedQuestions });

  } catch (error: any) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slideId, courseId, questions } = body;

    console.log('📌 POST - slideId:', slideId);
    console.log('📌 POST - questions:', JSON.stringify(questions, null, 2));

    if (!slideId || !courseId || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    for (const q of questions) {
      // ENSURE correctAnswer is JSON stringified properly
      let correctAnswerJson;
      
      if (q.type === 'true_false') {
        // For true/false, store as number
        correctAnswerJson = JSON.stringify(q.correctAnswer);
      } else if (q.type === 'fill_blanks') {
        // For fill blanks, ensure it's an array
        const answersArray = Array.isArray(q.correctAnswer) 
          ? q.correctAnswer 
          : q.correctAnswer.split(',').map((s: string) => s.trim());
        correctAnswerJson = JSON.stringify(answersArray);
      }
      
      console.log('📌 Saving - correctAnswerJson:', correctAnswerJson);
      
      // Check if question exists
      const existing = await query<any[]>(
        `SELECT id FROM tf_fill_questions WHERE id = ? AND slide_id = ?`,
        [q.id, slideId]
      );

      if (existing && existing.length > 0) {
        // Update existing
        await query(
          `UPDATE tf_fill_questions 
           SET question_text = ?, correct_answer = ?, points = ?, updated_at = NOW()
           WHERE id = ? AND slide_id = ?`,
          [q.question, correctAnswerJson, q.points, q.id, slideId]
        );
      } else {
        // Insert new
        const newId = uuidv4();
        await query(
          `INSERT INTO tf_fill_questions 
           (id, slide_id, course_id, question_type, question_text, correct_answer, points)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [newId, slideId, courseId, q.type, q.question, correctAnswerJson, q.points]
        );
      }
    }

    return NextResponse.json({ success: true, message: 'Questions saved successfully' });

  } catch (error: any) {
    console.error('Error saving questions:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}