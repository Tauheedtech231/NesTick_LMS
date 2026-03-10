// /app/api/students/quiz/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */

// Define types for better code clarity
enum QuestionType {
  MCQ = 'mcq',
  TEXT = 'text'
}

interface QuizAnswer {
  questionIndex: number;
  selectedOption?: number;  // For MCQ
  textAnswer?: string;      // For text questions
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  questionType?: QuestionType;
}

// Safe JSON parse function
function safeJsonParse(value: any, defaultValue: any = []) {
  if (!value) return defaultValue;
  
  // If it's already an array, return it
  if (Array.isArray(value)) return value;
  
  // If it's a string, try to parse it
  if (typeof value === 'string') {
    try {
      // Check if it's already a JSON string
      if (value.startsWith('[') || value.startsWith('{')) {
        return JSON.parse(value);
      }
      // If it's a comma-separated string, convert to array
      if (value.includes(',')) {
        return value.split(',').map(s => s.trim());
      }
      // Single value
      return [value];
    } catch (e) {
      console.warn('⚠️ Failed to parse JSON, returning as single-item array:', value);
      return [value];
    }
  }
  
  return defaultValue;
}

export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const { 
      enrollmentId,
      studentEmail,
      courseId,
      slideId,
      quizId,
      answers,
      score,
      passed 
    } = body;

    console.log('\n========== 📝 QUIZ SUBMISSION ==========');
    console.log('📍 Enrollment ID:', enrollmentId);
    console.log('📍 Student Email:', studentEmail);
    console.log('📍 Course ID:', courseId);
    console.log('📍 Slide ID:', slideId);
    console.log('📍 Quiz ID:', quizId);
    console.log('📍 Answers Count:', answers?.length || 0);
    console.log('📍 Score from frontend:', score);
    console.log('📍 Passed from frontend:', passed);

    // Validate required fields
    if (!enrollmentId) {
      return NextResponse.json(
        { success: false, error: 'enrollmentId is required' },
        { status: 400 }
      );
    }
    
    if (!studentEmail) {
      return NextResponse.json(
        { success: false, error: 'studentEmail is required' },
        { status: 400 }
      );
    }
    
    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'courseId is required' },
        { status: 400 }
      );
    }
    
    if (!slideId) {
      return NextResponse.json(
        { success: false, error: 'slideId is required' },
        { status: 400 }
      );
    }
    
    if (!quizId) {
      return NextResponse.json(
        { success: false, error: 'quizId is required' },
        { status: 400 }
      );
    }

    // Validate answers array
    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { success: false, error: 'answers must be an array' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Start transaction
    await connection.beginTransaction();

    // 1. Check if quiz already attempted
    const [existing] = await connection.execute(
      `SELECT id FROM quiz_attempts WHERE enrollment_id = ? AND quiz_id = ?`,
      [enrollmentId, quizId]
    );

    if ((existing as any[]).length > 0) {
      await connection.rollback();
      return NextResponse.json(
        { success: false, error: 'Quiz already attempted' },
        { status: 400 }
      );
    }

    // 2. Handle quiz ID length (max 36 chars for VARCHAR(36))
    let finalQuizId = quizId;
    if (quizId.length > 36) {
      if (quizId.includes('_')) {
        const parts = quizId.split('_');
        finalQuizId = parts[parts.length - 1]; // Take the last part (slideId)
        console.log('⚠️ Quiz ID extracted from combined format:', finalQuizId);
      } else {
        finalQuizId = quizId.substring(0, 36);
        console.log('⚠️ Quiz ID truncated to 36 chars:', finalQuizId);
      }
    }

    // 3. Fetch the quiz questions to verify answers and calculate actual score
    const [quizRows] = await connection.execute(
      `SELECT * FROM course_quizzes WHERE slide_id = ? AND course_id = ?`,
      [slideId, courseId]
    );

    if ((quizRows as any[]).length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { success: false, error: 'Quiz not found' },
        { status: 404 }
      );
    }

    const dbQuizId = (quizRows as any[])[0].id;

    // 4. Fetch questions for this quiz
    const [questionRows] = await connection.execute(
      `SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY created_at ASC`,
      [dbQuizId]
    );

    // Process questions with safe JSON parsing
    const questions = (questionRows as any[]).map(q => {
      // Safely parse options
      let options: string[] = [];
      try {
        options = safeJsonParse(q.options, []);
      } catch (e) {
        console.warn(`⚠️ Error parsing options for question ${q.id}:`, e);
        options = [];
      }

      return {
        id: q.id,
        question: q.question || '',
        options,
        correctAnswer: q.correct_answer !== null && q.correct_answer !== undefined ? q.correct_answer : -1,
        // Determine question type based on options array
        questionType: options.length > 0 ? QuestionType.MCQ : QuestionType.TEXT
      };
    });

    console.log(`📊 Found ${questions.length} questions in database`);

    // 5. Calculate actual score based on question types
    let mcqCorrectCount = 0;
    let mcqTotalCount = 0;
    let textQuestionCount = 0;

    // Validate answers match questions
    if (answers.length !== questions.length) {
      console.warn(`⚠️ Answer count mismatch: got ${answers.length}, expected ${questions.length}`);
    }

    // Process each answer
    const processedAnswers = [];
    for (let i = 0; i < Math.min(questions.length, answers.length); i++) {
      const question = questions[i];
      const answer = answers[i] || { questionIndex: i };
      
      if (question.questionType === QuestionType.MCQ) {
        // MCQ question
        mcqTotalCount++;
        
        // Get selected option from answer
        const selectedOption = answer.selectedOption !== undefined ? answer.selectedOption : -1;
        
        // Check if correct
        const isCorrect = selectedOption === question.correctAnswer;
        if (isCorrect) {
          mcqCorrectCount++;
        }
        
        console.log(`  Q${i+1} (MCQ): selected=${selectedOption}, correct=${question.correctAnswer}, ${isCorrect ? '✓' : '✗'}`);
        
        // Store processed answer
        processedAnswers.push({
          questionIndex: i,
          selectedOption,
          isCorrect
        });
      } else {
        // Text question
        textQuestionCount++;
        const textAnswer = answer.textAnswer || '';
        
        console.log(`  Q${i+1} (TEXT): answer length=${textAnswer.length} chars`);
        
        // Store processed answer (text answers are not auto-graded)
        processedAnswers.push({
          questionIndex: i,
          textAnswer,
          needsGrading: true
        });
      }
    }

    // Calculate MCQ score percentage
    const mcqScore = mcqTotalCount > 0 ? Math.round((mcqCorrectCount / mcqTotalCount) * 100) : 0;
    
    // Overall score is only from MCQ questions (text questions get 0)
    const calculatedScore = mcqScore;
    
    // A quiz is considered passed if MCQ score >= 70 (text questions are manually graded)
    const calculatedPassed = calculatedScore >= 70;

    console.log('\n📊 SCORE CALCULATION:');
    console.log(`  MCQ Questions: ${mcqCorrectCount}/${mcqTotalCount} correct`);
    console.log(`  Text Questions: ${textQuestionCount} (awaiting manual grading)`);
    console.log(`  Calculated Score: ${calculatedScore}%`);
    console.log(`  Calculated Passed: ${calculatedPassed}`);

    // 6. Save quiz attempt with detailed answers
    const attemptId = uuidv4();
    
    // Store answers with metadata
    const answersForStorage = {
      submitted: answers,
      processed: processedAnswers,
      summary: {
        mcqCorrect: mcqCorrectCount,
        mcqTotal: mcqTotalCount,
        textQuestions: textQuestionCount,
        timestamp: new Date().toISOString()
      }
    };

    await connection.execute(
      `INSERT INTO quiz_attempts 
       (id, enrollment_id, student_email, course_id, slide_id, quiz_id, answers, score, passed, attempted_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        attemptId, 
        enrollmentId, 
        studentEmail, 
        courseId, 
        slideId, 
        finalQuizId,
        JSON.stringify(answersForStorage), 
        calculatedScore, 
        calculatedPassed ? 1 : 0
      ]
    );

    console.log('\n✅ Quiz attempt saved:', { 
      attemptId, 
      score: calculatedScore, 
      passed: calculatedPassed,
      mcqCorrect: mcqCorrectCount,
      mcqTotal: mcqTotalCount,
      textQuestions: textQuestionCount
    });

    // 7. Check if slide should be marked as completed
    // Slide is completed if:
    // - MCQ questions are passed (score >= 70)
    // - All text questions are present (they will be graded later)
    const shouldMarkSlideComplete = calculatedPassed;

    if (shouldMarkSlideComplete) {
      // Update or insert slide_progress
      const [existingSlideProgress] = await connection.execute(
        `SELECT id FROM slide_progress WHERE enrollment_id = ? AND slide_id = ?`,
        [enrollmentId, slideId]
      );

      if ((existingSlideProgress as any[]).length > 0) {
        await connection.execute(
          `UPDATE slide_progress 
           SET status = 'completed',
               completed_at = NOW(),
               updated_at = NOW()
           WHERE enrollment_id = ? AND slide_id = ?`,
          [enrollmentId, slideId]
        );
        console.log(`✅ Updated slide_progress for ${slideId}`);
      } else {
        const progressId = uuidv4();
        await connection.execute(
          `INSERT INTO slide_progress 
           (id, enrollment_id, student_email, course_id, slide_id, status, completed_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, 'completed', NOW(), NOW(), NOW())`,
          [progressId, enrollmentId, studentEmail, courseId, slideId]
        );
        console.log(`✅ Created slide_progress for ${slideId}`);
      }

      // 8. Get ALL completed slides from slide_progress
      const [completedRows] = await connection.execute(
        `SELECT slide_id FROM slide_progress 
         WHERE enrollment_id = ? AND status = 'completed'`,
        [enrollmentId]
      );
      
      const completedSlideIds = (completedRows as any[]).map(row => row.slide_id);
      console.log(`📊 Total completed slides from slide_progress: ${completedSlideIds.length}`);

      // 9. Get total slides count for this course
      const [slideRows] = await connection.execute(
        `SELECT COUNT(*) as count FROM course_slides WHERE course_id = ?`,
        [courseId]
      );
      const totalSlides = (slideRows as any[])[0]?.count || 1;

      // 10. Get current student_progress
      const [progressRows] = await connection.execute(
        `SELECT * FROM student_progress WHERE enrollment_id = ?`,
        [enrollmentId]
      );

      let completedContent: string[] = [];

      if ((progressRows as any[]).length > 0) {
        const progress = (progressRows as any[])[0];
        
        // Parse existing completed_content
        try {
          completedContent = progress.completed_content ? JSON.parse(progress.completed_content) : [];
        } catch (e) {
          console.warn('⚠️ Failed to parse completed_content, using empty array');
          completedContent = [];
        }
      }

      // 11. Calculate progress percentage based on ALL completed slides
      const progressPercentage = Math.round((completedSlideIds.length / totalSlides) * 100);
      const status = progressPercentage === 100 ? 'completed' : 'in_progress';

      // 12. Update student_progress with ALL completed slides
      await connection.execute(
        `UPDATE student_progress 
         SET completed_slides = ?,
             completed_content = ?,
             progress_percentage = ?,
             status = ?,
             last_accessed = NOW(),
             updated_at = NOW()
         WHERE enrollment_id = ?`,
        [
          JSON.stringify(completedSlideIds),
          JSON.stringify(completedContent),
          progressPercentage,
          status,
          enrollmentId
        ]
      );

      console.log('✅ Student progress updated:', {
        completedSlides: completedSlideIds.length,
        totalSlides,
        progressPercentage,
        status
      });
    } else {
      console.log('⚠️ Quiz not passed, slide remains incomplete');
    }

    // Commit transaction
    await connection.commit();

    // Prepare response message based on question types
    let message = '';
    if (textQuestionCount > 0 && mcqTotalCount > 0) {
      message = `Quiz submitted! MCQ Score: ${calculatedScore}% (${mcqCorrectCount}/${mcqTotalCount} correct). ${textQuestionCount} text answer(s) will be graded by instructor.`;
    } else if (textQuestionCount > 0) {
      message = `Quiz submitted! ${textQuestionCount} text answer(s) will be graded by instructor.`;
    } else {
      message = calculatedPassed 
        ? `🎉 Quiz passed! Score: ${calculatedScore}%` 
        : `Quiz submitted. Score: ${calculatedScore}%`;
    }

    return NextResponse.json({
      success: true,
      data: { 
        attemptId,
        score: calculatedScore,
        passed: calculatedPassed,
        summary: {
          mcqCorrect: mcqCorrectCount,
          mcqTotal: mcqTotalCount,
          textQuestions: textQuestionCount
        }
      },
      message
    });

  } catch (error: any) {
    // Rollback on error
    if (connection) {
      await connection.rollback();
    }
    
    console.error('\n❌ Error submitting quiz:', error);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to submit quiz'
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
    console.log('========== QUIZ SUBMISSION COMPLETE ==========\n');
  }
}