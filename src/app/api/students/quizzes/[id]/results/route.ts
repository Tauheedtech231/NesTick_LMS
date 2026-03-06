// /app/api/students/quizzes/[id]/results/route.ts
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

    console.log('📊 Fetching quiz results:', { quizId: id, studentEmail });

    if (!id || !studentEmail) {
      return NextResponse.json(
        { success: false, error: 'Quiz ID and Student Email are required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // 1. Get quiz details
    const [quizRows] = await connection.execute(
      `SELECT 
        id,
        title,
        description,
        total_questions,
        total_points,
        instructor_name,
        course_title
       FROM quizzes 
       WHERE id = ?`,
      [id]
    );

    if ((quizRows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Quiz not found' },
        { status: 404 }
      );
    }

    const quiz = (quizRows as any[])[0];

    // 2. Get student's quiz attempt
    const [attemptRows] = await connection.execute(
      `SELECT 
        id,
        answers,
        score,
        passed,
        attempted_at as attemptedAt,
        created_at as createdAt
       FROM quiz_attempts 
       WHERE quiz_id = ? AND student_email = ?
       ORDER BY attempted_at DESC
       LIMIT 1`,
      [id, studentEmail]
    );

    if ((attemptRows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No attempt found for this quiz' },
        { status: 404 }
      );
    }

    const attempt = (attemptRows as any[])[0];

    // 3. Get all questions with correct answers
    const [questionRows] = await connection.execute(
      `SELECT 
        id,
        question,
        options,
        correct_answer as correctAnswer,
        points
       FROM quiz_questions 
       WHERE quiz_id = ?
       ORDER BY created_at ASC`,
      [id]
    );

    // 4. ✅ FIXED: Parse user answers safely
    let userAnswers: any[] = [];
    try {
      if (attempt.answers) {
        // If it's already an array, use it
        if (Array.isArray(attempt.answers)) {
          userAnswers = attempt.answers;
        } 
        // If it's a string, try to parse it
        else if (typeof attempt.answers === 'string') {
          const parsed = JSON.parse(attempt.answers);
          userAnswers = Array.isArray(parsed) ? parsed : [parsed];
        }
        // If it's a number, make it an array
        else if (typeof attempt.answers === 'number') {
          userAnswers = [attempt.answers];
        }
      }
    } catch (e) {
      console.warn('⚠️ Failed to parse answers:', e);
      // If parsing fails, try to handle as comma-separated string
      if (typeof attempt.answers === 'string') {
        userAnswers = attempt.answers.split(',').map((a: string) => parseInt(a.trim()));
      } else {
        userAnswers = [];
      }
    }

    // Ensure userAnswers is always an array
    if (!Array.isArray(userAnswers)) {
      userAnswers = [];
    }

    console.log('📝 Parsed user answers:', userAnswers);

    // 5. Build questions with user answers
    const questions = (questionRows as any[]).map((q, index) => {
      const userAnswer = userAnswers[index] !== undefined ? userAnswers[index] : null;
      const isCorrect = userAnswer === q.correctAnswer;
      
      // Parse options safely
      let options = [];
      try {
        if (q.options) {
          if (Array.isArray(q.options)) {
            options = q.options;
          } else if (typeof q.options === 'string') {
            options = JSON.parse(q.options);
          }
        }
        if (!Array.isArray(options)) options = [];
      } catch (e) {
        options = [];
      }

      return {
        id: q.id,
        question: q.question,
        options: options,
        correctAnswer: q.correctAnswer,
        userAnswer: userAnswer,
        points: q.points || 1,
        isCorrect: isCorrect,
        optionsWithLetters: options.map((opt: string, idx: number) => ({
          letter: String.fromCharCode(65 + idx),
          text: opt,
          isCorrect: idx === q.correctAnswer,
          isSelected: idx === userAnswer
        }))
      };
    });

    // 6. Calculate statistics
    const totalQuestions = questions.length;
    const correctCount = questions.filter(q => q.isCorrect).length;
    const totalPossibleScore = questions.reduce((sum, q) => sum + q.points, 0);
    
    // Calculate percentage
    let percentage = 0;
    if (totalPossibleScore > 0) {
      percentage = Math.round((attempt.score / totalPossibleScore) * 100);
    }

    return NextResponse.json({
      success: true,
      debug: {
        answersType: typeof attempt.answers,
        answersRaw: attempt.answers,
        parsedAnswers: userAnswers,
        totalPossibleScore,
        studentScore: attempt.score
      },
      data: {
        quizId: quiz.id,
        quizTitle: quiz.title,
        quizDescription: quiz.description,
        instructorName: quiz.instructor_name,
        courseTitle: quiz.course_title,
        attemptId: attempt.id,
        attemptedAt: attempt.attemptedAt,
        score: attempt.score,
        totalPossibleScore: totalPossibleScore,
        percentage: percentage,
        passed: attempt.passed === 1,
        totalQuestions: totalQuestions,
        correctCount: correctCount,
        questions: questions
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching quiz results:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch quiz results',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}