// /app/api/students/slide/auto-complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */
export async function POST(request: NextRequest) {
  let connection;
  try {
    const { enrollmentId, studentEmail, courseId, slideId } = await request.json();

    console.log('🤖 Auto-complete slide:', { enrollmentId, slideId, courseId });

    if (!enrollmentId || !studentEmail || !courseId || !slideId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    connection = await getConnection();
    await connection.beginTransaction();

    // 1. Check if slide exists
    const [slideCheck] = await connection.execute(
      `SELECT id FROM course_slides WHERE id = ? AND course_id = ?`,
      [slideId, courseId]
    );

    if ((slideCheck as any[]).length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { success: false, error: 'Slide not found' },
        { status: 404 }
      );
    }

    // 2. Update or insert slide_progress
    const [existingProgress] = await connection.execute(
      `SELECT id FROM slide_progress WHERE enrollment_id = ? AND slide_id = ?`,
      [enrollmentId, slideId]
    );

    if ((existingProgress as any[]).length > 0) {
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

    // 3. Get ALL completed slides from slide_progress
    const [completedRows] = await connection.execute(
      `SELECT slide_id FROM slide_progress 
       WHERE enrollment_id = ? AND status = 'completed'`,
      [enrollmentId]
    );
    
    const completedSlideIds = (completedRows as any[]).map(row => row.slide_id);
    console.log(`📊 Total completed slides: ${completedSlideIds.length}`);

    // 4. Get total slides count
    const [totalRows] = await connection.execute(
      `SELECT COUNT(*) as count FROM course_slides WHERE course_id = ?`,
      [courseId]
    );
    const totalSlides = (totalRows as any[])[0]?.count || 1;

    // 5. Calculate progress
    const progressPercentage = Math.round((completedSlideIds.length / totalSlides) * 100);
    const status = progressPercentage === 100 ? 'completed' : 'in_progress';

    // 6. Update student_progress with ALL completed slides
    const [studentProgress] = await connection.execute(
      `SELECT id FROM student_progress WHERE enrollment_id = ?`,
      [enrollmentId]
    );

    const slidesJson = JSON.stringify(completedSlideIds);

    if ((studentProgress as any[]).length > 0) {
      await connection.execute(
        `UPDATE student_progress 
         SET completed_slides = ?,
             progress_percentage = ?,
             status = ?,
             last_accessed = NOW(),
             updated_at = NOW()
         WHERE enrollment_id = ?`,
        [slidesJson, progressPercentage, status, enrollmentId]
      );
      console.log(`✅ Updated student_progress: ${completedSlideIds.length}/${totalSlides} slides`);
    } else {
      const progressId = uuidv4();
      await connection.execute(
        `INSERT INTO student_progress 
         (id, enrollment_id, student_email, course_id, completed_slides, progress_percentage, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [progressId, enrollmentId, studentEmail, courseId, slidesJson, progressPercentage, status]
      );
      console.log(`✅ Created student_progress record`);
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      data: {
        slideCompleted: true,
        completedSlides: completedSlideIds.length,
        totalSlides,
        progressPercentage,
        status
      },
      message: 'Slide completed successfully!'
    });

  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error('❌ Error in auto-complete:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to complete slide' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}