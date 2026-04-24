/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'Course ID is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // ✅ Step 1: Get all quizzes in this course
    const [quizzes] = await connection.execute(
      `SELECT cq.id, cq.slide_id, cs.slide_number, cs.title as slide_title
       FROM course_quizzes cq
       JOIN course_slides cs ON cq.slide_id = cs.id
       WHERE cq.course_id = ?`,
      [courseId]
    ) as any[];

    if (quizzes.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // ✅ Step 2: Get ONLY MCQ questions (with non-empty options)
    const quizIds = quizzes.map((q: any) => `'${q.id}'`).join(',');
    const [questions] = await connection.execute(
      `SELECT 
        qq.id, 
        qq.quiz_id, 
        qq.question, 
        qq.options, 
        qq.correct_answer,
        qq.question_type
       FROM quiz_questions qq
       WHERE qq.quiz_id IN (${quizIds})
         AND (qq.question_type = 'mcq' OR JSON_LENGTH(qq.options) > 0)`,
      []
    ) as any[];

    // ✅ Step 3: Build map: quiz_id -> array of MCQ questions
    const questionsByQuiz: Record<string, any[]> = {};
    for (const q of questions) {
      if (!questionsByQuiz[q.quiz_id]) {
        questionsByQuiz[q.quiz_id] = [];
      }
      let parsedOptions = [];
      try {
        parsedOptions = q.options ? JSON.parse(q.options) : [];
      } catch(e) {
        parsedOptions = [];
      }
      
      questionsByQuiz[q.quiz_id].push({
        id: q.id,
        question: q.question,
        options: parsedOptions,
        correctAnswer: q.correct_answer,
        questionType: 'mcq'
      });
    }

    // ✅ Step 4: Fetch all attempts
    const allAttempts: any[] = [];

    for (const quiz of quizzes) {
      const [attempts] = await connection.execute(
        `SELECT id, student_email, quiz_id, score, passed, attempted_at AS completed_at, answers
         FROM quiz_attempts WHERE quiz_id = ?`,
        [quiz.id]
      ) as any[];

      for (const attempt of attempts) {
        const [student] = await connection.execute(
          `SELECT student_name FROM enrollments WHERE student_email = ? LIMIT 1`,
          [attempt.student_email]
        ) as any[];

        let parsedAnswers = attempt.answers;
        if (typeof parsedAnswers === 'string') {
          try {
            parsedAnswers = JSON.parse(parsedAnswers);
          } catch(e) {
            parsedAnswers = {};
          }
        }

        // Extract answers array
        let answersArray: any[] = [];
        if (parsedAnswers.processed && Array.isArray(parsedAnswers.processed)) {
          answersArray = parsedAnswers.processed;
        } else if (parsedAnswers.submitted && Array.isArray(parsedAnswers.submitted)) {
          answersArray = parsedAnswers.submitted;
        } else if (Array.isArray(parsedAnswers)) {
          answersArray = parsedAnswers;
        }

        const quizQuestions = questionsByQuiz[quiz.id] || [];
        
        // ✅ Create a map of MCQ question indices
        const mcqIndices = new Set();
        quizQuestions.forEach((_, idx) => {
          mcqIndices.add(idx);
        });
        
        // ✅ Filter answers - only keep MCQ answers
        const filteredAnswers = answersArray.filter((_, idx) => mcqIndices.has(idx));
        
        // ✅ Enrich filtered answers with options and correct values
        const enrichedAnswers = filteredAnswers.map((answer: any, idx: number) => {
          const question = quizQuestions[idx];
          
          if (question) {
            // Get user answer display from options
            let userAnswerDisplay = '';
            if (answer.selectedOption !== undefined && question.options[answer.selectedOption]) {
              userAnswerDisplay = question.options[answer.selectedOption];
            } else if (answer.textAnswer) {
              userAnswerDisplay = answer.textAnswer;
            } else {
              userAnswerDisplay = String(answer.selectedOption || 'No answer');
            }

            // Get correct answer display from options
            let correctAnswerDisplay = '';
            const correctIdx = question.correctAnswer;
            if (correctIdx !== undefined && correctIdx !== null && question.options[correctIdx]) {
              correctAnswerDisplay = question.options[correctIdx];
            } else {
              correctAnswerDisplay = String(correctIdx);
            }
            
            const isCorrect = answer.selectedOption === question.correctAnswer;

            return {
              questionIndex: idx,
              questionText: question.question,
              userAnswer: userAnswerDisplay,
              correctAnswer: correctAnswerDisplay,
              options: question.options,
              questionType: 'mcq',
              isCorrect: isCorrect,
              selectedOption: answer.selectedOption
            };
          }
          
          return null;
        }).filter(Boolean);

        // ✅ Only add if there are MCQ answers
        if (enrichedAnswers.length > 0) {
          allAttempts.push({
            id: attempt.id,
            student_email: attempt.student_email,
            student_name: student[0]?.student_name || 'N/A',
            quiz_id: quiz.id,
            quiz_title: quiz.slide_title || 'Quiz',
            course_id: courseId,
            slide_title: quiz.slide_title,
            slide_number: quiz.slide_number,
            score: attempt.score || 0,
            total_possible: 100,
            percentage: attempt.score || 0,
            passed: attempt.passed === 1,
            completed_at: attempt.completed_at,
            answers: enrichedAnswers,
            quiz_type: 'simple'
          });
        }
      }
    }

    console.log('✅ Simple quiz attempts (MCQ only) found:', allAttempts.length);

    return NextResponse.json({
      success: true,
      data: allAttempts
    });

  } catch (error: any) {
    console.error('Error fetching simple quiz attempts:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch simple quiz attempts' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}