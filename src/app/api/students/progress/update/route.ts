// /app/api/students/progress/update/route.ts
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
      contentType,
      contentId 
    } = body;

    console.log('📝 Updating progress:', { enrollmentId, studentEmail, courseId, slideId, contentType, contentId });

    if (!enrollmentId || !studentEmail || !courseId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Start transaction
    await connection.beginTransaction();

    // 1. Get or create student_progress
    const [progressRows] = await connection.execute(
      `SELECT * FROM student_progress WHERE enrollment_id = ?`,
      [enrollmentId]
    );

    let completedSlides: string[] = [];
    let completedContent: string[] = [];

    if ((progressRows as any[]).length === 0) {
      // Create new progress
      const progressId = uuidv4();
      await connection.execute(
        `INSERT INTO student_progress 
         (id, enrollment_id, student_email, course_id, completed_slides, completed_content, created_at, updated_at)
         VALUES (?, ?, ?, ?, '[]', '[]', NOW(), NOW())`,
        [progressId, enrollmentId, studentEmail, courseId]
      );
      console.log('✅ New progress record created');
    } else {
      const progress = (progressRows as any[])[0];
      
      // Parse existing data
      try {
        if (progress.completed_slides && progress.completed_slides !== 'null') {
          completedSlides = JSON.parse(progress.completed_slides);
        }
        if (!Array.isArray(completedSlides)) completedSlides = [];
      } catch (e) {
        console.log('⚠️ Failed to parse completed_slides, using empty array');
        completedSlides = [];
      }
      
      try {
        if (progress.completed_content && progress.completed_content !== 'null') {
          completedContent = JSON.parse(progress.completed_content);
        }
        if (!Array.isArray(completedContent)) completedContent = [];
      } catch (e) {
        console.log('⚠️ Failed to parse completed_content, using empty array');
        completedContent = [];
      }
    }

    // Get total slides count
    const [slideRows] = await connection.execute(
      `SELECT COUNT(*) as count FROM course_slides WHERE course_id = ?`,
      [courseId]
    );
    const totalSlides = (slideRows as any[])[0]?.count || 1;

    // 2. Handle slide completion
    if (contentType === 'slide' && slideId) {
      // Update slide_progress
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
      } else {
        const progressId = uuidv4();
        await connection.execute(
          `INSERT INTO slide_progress 
           (id, enrollment_id, student_email, course_id, slide_id, status, completed_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, 'completed', NOW(), NOW(), NOW())`,
          [progressId, enrollmentId, studentEmail, courseId, slideId]
        );
      }
      console.log(`✅ Updated slide_progress for ${slideId}`);

      // Get ALL completed slides from slide_progress
      const [completedRows] = await connection.execute(
        `SELECT slide_id FROM slide_progress 
         WHERE enrollment_id = ? AND status = 'completed'`,
        [enrollmentId]
      );
      
      completedSlides = (completedRows as any[]).map(row => row.slide_id);
      console.log(`📊 Total completed slides from slide_progress: ${completedSlides.length}`);
    }
    
    // 3. Handle content completion
    else if (contentType === 'content' && slideId && contentId) {
      const contentKey = `${slideId}_${contentId}`;
      if (!completedContent.includes(contentKey)) {
        completedContent.push(contentKey);
        console.log(`✅ Content ${contentKey} marked as complete`);

        // Update content_views
        const [existingView] = await connection.execute(
          `SELECT id FROM content_views 
           WHERE enrollment_id = ? AND slide_id = ? AND content_id = ?`,
          [enrollmentId, slideId, contentId]
        );

        if ((existingView as any[]).length > 0) {
          await connection.execute(
            `UPDATE content_views 
             SET completed = true,
                 viewed_at = NOW()
             WHERE enrollment_id = ? AND slide_id = ? AND content_id = ?`,
            [enrollmentId, slideId, contentId]
          );
        } else {
          const viewId = uuidv4();
          await connection.execute(
            `INSERT INTO content_views 
             (id, enrollment_id, student_email, course_id, slide_id, content_id, completed, viewed_at)
             VALUES (?, ?, ?, ?, ?, ?, true, NOW())`,
            [viewId, enrollmentId, studentEmail, courseId, slideId, contentId]
          );
        }

        // Check if all files for this slide are completed
        const [totalFiles] = await connection.execute(
          `SELECT COUNT(*) as count FROM slide_files WHERE slide_id = ?`,
          [slideId]
        );
        const totalFilesCount = (totalFiles as any[])[0]?.count || 0;

        const [completedFiles] = await connection.execute(
          `SELECT COUNT(*) as count FROM content_views 
           WHERE enrollment_id = ? AND slide_id = ? AND completed = true`,
          [enrollmentId, slideId]
        );
        const completedFilesCount = (completedFiles as any[])[0]?.count || 0;

        // If all files completed, mark slide as complete
        if (totalFilesCount > 0 && completedFilesCount === totalFilesCount) {
          // Update slide_progress
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
          } else {
            const progressId = uuidv4();
            await connection.execute(
              `INSERT INTO slide_progress 
               (id, enrollment_id, student_email, course_id, slide_id, status, completed_at, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, 'completed', NOW(), NOW(), NOW())`,
              [progressId, enrollmentId, studentEmail, courseId, slideId]
            );
          }

          // Get ALL completed slides
          const [completedRows] = await connection.execute(
            `SELECT slide_id FROM slide_progress 
             WHERE enrollment_id = ? AND status = 'completed'`,
            [enrollmentId]
          );
          
          completedSlides = (completedRows as any[]).map(row => row.slide_id);
          console.log(`✅ Slide ${slideId} auto-completed via content views`);
        }
      }
    }

    // 4. Calculate progress percentage based on ALL completed slides
    const progressPercentage = totalSlides > 0 
      ? Math.round((completedSlides.length / totalSlides) * 100) 
      : 0;

    const status = progressPercentage === 100 ? 'completed' : 
                   progressPercentage > 0 ? 'in_progress' : 'not_started';

    // 5. Update student_progress with ALL data
    const slidesJson = JSON.stringify(completedSlides);
    const contentJson = JSON.stringify(completedContent);

    console.log('📤 Updating student_progress:', { 
      completedSlides: completedSlides.length,
      completedContent: completedContent.length,
      progressPercentage,
      status
    });

    await connection.execute(
      `UPDATE student_progress 
       SET completed_slides = ?,
           completed_content = ?,
           progress_percentage = ?,
           status = ?,
           last_accessed = NOW(),
           updated_at = NOW()
       WHERE enrollment_id = ?`,
      [slidesJson, contentJson, progressPercentage, status, enrollmentId]
    );

    // Commit transaction
    await connection.commit();

    return NextResponse.json({
      success: true,
      data: {
        completedSlides,
        completedContent,
        progressPercentage,
        status
      },
      message: 'Progress updated successfully'
    });

  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error('❌ Error updating progress:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update progress' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}