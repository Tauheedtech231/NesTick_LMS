// /app/api/students/quiz/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */
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

    console.log('📝 Submitting quiz:', { 
      enrollmentId, 
      studentEmail, 
      courseId, 
      slideId,
      quizId: quizId?.substring(0, 30) + '...',
      answersCount: answers?.length || 0,
      score,
      passed
    });

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

    // 3. Save quiz attempt
    const attemptId = uuidv4();
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
        JSON.stringify(answers), 
        score || 0, 
        passed ? 1 : 0
      ]
    );

    console.log('✅ Quiz attempt saved:', { attemptId, score, passed });

    // 4. If quiz passed, update slide progress
    if (passed) {
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

      // 5. Get ALL completed slides from slide_progress
      const [completedRows] = await connection.execute(
        `SELECT slide_id FROM slide_progress 
         WHERE enrollment_id = ? AND status = 'completed'`,
        [enrollmentId]
      );
      
      const completedSlideIds = (completedRows as any[]).map(row => row.slide_id);
      console.log(`📊 Total completed slides from slide_progress: ${completedSlideIds.length}`);

      // 6. Get total slides count for this course
      const [slideRows] = await connection.execute(
        `SELECT COUNT(*) as count FROM course_slides WHERE course_id = ?`,
        [courseId]
      );
      const totalSlides = (slideRows as any[])[0]?.count || 1;

      // 7. Get current student_progress
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

      // 8. Calculate progress percentage based on ALL completed slides
      const progressPercentage = Math.round((completedSlideIds.length / totalSlides) * 100);
      const status = progressPercentage === 100 ? 'completed' : 'in_progress';

      // 9. Update student_progress with ALL completed slides
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

      console.log('✅ Student progress updated with ALL completed slides:', {
        completedSlides: completedSlideIds.length,
        totalSlides,
        progressPercentage,
        status
      });
    }

    // Commit transaction
    await connection.commit();

    return NextResponse.json({
      success: true,
      data: { 
        attemptId,
        score,
        passed 
      },
      message: passed ? '🎉 Quiz passed! Slide marked as complete.' : `Quiz submitted. Score: ${score}%`
    });

  } catch (error: any) {
    // Rollback on error
    if (connection) {
      await connection.rollback();
    }
    
    console.error('❌ Error submitting quiz:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to submit quiz'
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}