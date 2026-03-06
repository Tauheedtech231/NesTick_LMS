// /app/api/students/quizzes/[id]/attempt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log('📥 Received attempt data:', body);

    const { 
      studentEmail,
      studentName,
      answers
    } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Quiz ID is required' },
        { status: 400 }
      );
    }

    if (!studentEmail) {
      return NextResponse.json(
        { success: false, error: 'Student email is required' },
        { status: 400 }
      );
    }

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { success: false, error: 'Answers must be an array' },
        { status: 400 }
      );
    }

    console.log('📝 Submitting quiz attempt:', { 
      quizId: id, 
      studentEmail,
      answersCount: answers.length 
    });

    connection = await getConnection();
    await connection.beginTransaction();

    // 1. Get enrollment details (enrollment_id and course_id) from enrollments table
    const [enrollmentRows] = await connection.execute(
      `SELECT id as enrollment_id, course_id FROM enrollments WHERE student_email = ? LIMIT 1`,
      [studentEmail]
    );

    let enrollmentId, courseId;
    
    if ((enrollmentRows as any[]).length > 0) {
      enrollmentId = (enrollmentRows as any[])[0].enrollment_id;
      courseId = (enrollmentRows as any[])[0].course_id;
      console.log('✅ Found enrollment:', { enrollmentId, courseId });
    } else {
      // Create a minimal enrollment record with a default course
      // You might want to get a default course ID from somewhere
      const [defaultCourse] = await connection.execute(
        `SELECT id FROM instructor_course LIMIT 1`
      );
      
      const defaultCourseId = (defaultCourse as any[]).length > 0 
        ? (defaultCourse as any[])[0].id 
        : null;

      const newEnrollmentId = uuidv4();
      await connection.execute(
        `INSERT INTO enrollments 
         (id, student_email, student_name, course_id, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'active', NOW(), NOW())`,
        [newEnrollmentId, studentEmail, studentName || 'Student', defaultCourseId]
      );
      
      enrollmentId = newEnrollmentId;
      courseId = defaultCourseId;
      console.log('✅ Created new enrollment:', { enrollmentId, courseId });
    }

    // 2. Check if already attempted
    const [existingRows] = await connection.execute(
      `SELECT id FROM quiz_attempts WHERE quiz_id = ? AND student_email = ?`,
      [id, studentEmail]
    );

    if ((existingRows as any[]).length > 0) {
      await connection.rollback();
      return NextResponse.json(
        { 
          success: false, 
          error: 'You have already attempted this quiz',
          attemptId: (existingRows as any[])[0].id
        },
        { status: 400 }
      );
    }

    // 3. Get quiz details
    const [quizRows] = await connection.execute(
      `SELECT id, title, total_points FROM quizzes WHERE id = ?`,
      [id]
    );

    if ((quizRows as any[]).length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { success: false, error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // 4. Get quiz questions with correct answers
    const [questionRows] = await connection.execute(
      `SELECT id, correct_answer, points FROM quiz_questions WHERE quiz_id = ?`,
      [id]
    );

    const questions = questionRows as any[];
    
    if (questions.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { success: false, error: 'Quiz has no questions' },
        { status: 400 }
      );
    }

    // 5. Validate answers count matches questions count
    if (answers.length !== questions.length) {
      await connection.rollback();
      return NextResponse.json(
        { 
          success: false, 
          error: 'Answers count mismatch',
          expected: questions.length,
          received: answers.length
        },
        { status: 400 }
      );
    }

    // 6. Calculate score
    let correctCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    questions.forEach((q, index) => {
      const userAnswer = answers[index];
      const points = q.points || 1;
      totalPoints += points;
      
      if (userAnswer !== undefined && userAnswer !== null && userAnswer === q.correct_answer) {
        correctCount++;
        earnedPoints += points;
      }
    });

    const score = earnedPoints;
    const passed = totalPoints > 0 && (earnedPoints / totalPoints) * 100 >= 70 ? 1 : 0;

    // 7. Save attempt with all required fields
    const attemptId = uuidv4();
    await connection.execute(
      `INSERT INTO quiz_attempts 
       (id, enrollment_id, student_email, course_id, slide_id, quiz_id, answers, score, passed, attempted_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        attemptId,
        enrollmentId,
        studentEmail,
        courseId,        // ✅ Now course_id is NOT null (from enrollments)
        'no_slide',      // ✅ slide_id with a default value (NOT NULL)
        id,
        JSON.stringify(answers),
        score,
        passed
      ]
    );

    // 8. Update quiz stats
    const [attemptStats] = await connection.execute(
      `SELECT 
        COUNT(*) as totalAttempts,
        AVG(score) as avgScore
       FROM quiz_attempts 
       WHERE quiz_id = ?`,
      [id]
    );

    const stats = (attemptStats as any[])[0];
    
    await connection.execute(
      `UPDATE quizzes 
       SET attempts = ?,
           average_score = ?
       WHERE id = ?`,
      [stats.totalAttempts, stats.avgScore || 0, id]
    );

    await connection.commit();

    // 9. Calculate percentage for response
    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        attemptId,
        score: earnedPoints,
        totalPoints,
        percentage,
        correctCount,
        totalQuestions: questions.length,
        passed: passed === 1
      },
      message: passed ? '🎉 Congratulations! You passed the quiz!' : 'Quiz submitted successfully'
    });

  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error('❌ Error submitting quiz attempt:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to submit quiz',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}