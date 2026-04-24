/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

// Next.js 15 - params is a Promise, so we need to await it
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  let connection;
  try {
    // IMPORTANT: Await params for Next.js 15
    const resolvedParams = await params;
    const questionId = resolvedParams.id;
    
    console.log('=========================================');
    console.log('🔵 UPDATE API CALLED FOR QUESTION ID:', questionId);
    console.log('=========================================');
    
    // Get raw body
    const rawBody = await request.text();
    console.log('📦 RAW REQUEST BODY:', rawBody);
    
    // Parse JSON
    let body;
    try {
      body = JSON.parse(rawBody);
      console.log('✅ JSON PARSED:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('❌ JSON PARSE ERROR:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON format' },
        { status: 400 }
      );
    }
    
    // Extract fields
    const { question, options, correctAnswer, points } = body;
    
    console.log('📝 EXTRACTED FIELDS:');
    console.log('   - question:', question);
    console.log('   - options:', options);
    console.log('   - options isArray:', Array.isArray(options));
    console.log('   - correctAnswer:', correctAnswer);
    console.log('   - points:', points);
    
    // Validate
    if (!question) {
      console.log('❌ Question missing');
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      );
    }
    
    // Prepare values - CRITICAL: No undefined values!
    const questionValue = question || '';
    const optionsValue = (options && Array.isArray(options)) ? options : [];
    const optionsJson = JSON.stringify(optionsValue);
    const correctAnswerValue = (correctAnswer !== undefined && correctAnswer !== null) ? Number(correctAnswer) : 0;
    const pointsValue = (points !== undefined && points !== null) ? Number(points) : 1;
    
    console.log('📊 FINAL VALUES FOR DB:');
    console.log('   - questionValue:', questionValue);
    console.log('   - optionsJson:', optionsJson);
    console.log('   - correctAnswerValue:', correctAnswerValue);
    console.log('   - pointsValue:', pointsValue);
    
    // Connect to database
    connection = await getConnection();
    console.log('✅ Database connected');
    
    // Check if question exists
    const [existingRows] = await connection.execute(
      `SELECT id FROM quiz_questions WHERE id = ?`,
      [questionId]
    ) as any[];
    
    if (!existingRows || existingRows.length === 0) {
      console.log('❌ Question not found');
      return NextResponse.json(
        { success: false, error: 'Question not found' },
        { status: 404 }
      );
    }
    
    // UPDATE query - Make sure no undefined values
    await connection.execute(
      `UPDATE quiz_questions 
       SET question = ?, options = ?, correct_answer = ?, points = ?, updated_at = NOW()
       WHERE id = ?`,
      [questionValue, optionsJson, correctAnswerValue, pointsValue, questionId]
    );
    console.log('✅ Database updated');
    
    // Fetch updated question
    const [updatedRows] = await connection.execute(
      `SELECT 
        id,
        quiz_id as quizId,
        question,
        options,
        correct_answer as correctAnswer,
        points,
        created_at as createdAt,
        updated_at as updatedAt
      FROM quiz_questions WHERE id = ?`,
      [questionId]
    ) as any[];
    
    // Parse options for response
    let parsedOptions = [];
    if (updatedRows && updatedRows[0]) {
      const updatedQuestion = updatedRows[0];
      try {
        if (updatedQuestion.options) {
          parsedOptions = typeof updatedQuestion.options === 'string'
            ? JSON.parse(updatedQuestion.options)
            : updatedQuestion.options;
        }
      } catch (e) {
        console.error('Error parsing options:', e);
        parsedOptions = [];
      }
      
      const responseData = {
        id: updatedQuestion.id,
        quizId: updatedQuestion.quizId,
        question: updatedQuestion.question,
        options: parsedOptions,
        correctAnswer: updatedQuestion.correctAnswer,
        points: updatedQuestion.points,
        createdAt: updatedQuestion.createdAt,
        updatedAt: updatedQuestion.updatedAt,
        questionType: parsedOptions.length > 0 ? 'mcq' : 'text'
      };
      
      console.log('✅ UPDATE COMPLETED');
      console.log('=========================================');
      
      return NextResponse.json({
        success: true,
        data: responseData
      });
    } else {
      throw new Error('Failed to fetch updated question');
    }
    
  } catch (error: any) {
    console.error('❌ ERROR:', error.message);
    console.error('❌ STACK:', error.stack);
    console.log('=========================================');
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update question'
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
      console.log('✅ Connection released');
    }
  }
}