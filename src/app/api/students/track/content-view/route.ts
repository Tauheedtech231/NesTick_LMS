// /app/api/students/track/content-view/route.ts
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
      contentId,
      durationWatched,
      completed 
    } = body;

    console.log('📝 Tracking content view:', { 
      enrollmentId, 
      slideId, 
      contentId, 
      durationWatched, 
      completed 
    });

    // Validate required fields
    if (!enrollmentId || !studentEmail || !courseId || !slideId || !contentId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Start transaction
    await connection.beginTransaction();

    // 1. Insert or update content view
    const [existingView] = await connection.execute(
      `SELECT id FROM content_views 
       WHERE enrollment_id = ? AND slide_id = ? AND content_id = ?`,
      [enrollmentId, slideId, contentId]
    );

    if ((existingView as any[]).length > 0) {
      // Update existing view
      await connection.execute(
        `UPDATE content_views 
         SET viewed_at = NOW(), 
             duration_watched = duration_watched + ?,
             completed = ?
         WHERE enrollment_id = ? AND slide_id = ? AND content_id = ?`,
        [durationWatched || 0, completed ? 1 : 0, enrollmentId, slideId, contentId]
      );
      console.log(`✅ Updated content view for ${contentId}`);
    } else {
      // Insert new view
      const viewId = uuidv4();
      await connection.execute(
        `INSERT INTO content_views 
         (id, enrollment_id, student_email, course_id, slide_id, content_id, duration_watched, completed, viewed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [viewId, enrollmentId, studentEmail, courseId, slideId, contentId, durationWatched || 0, completed ? 1 : 0]
      );
      console.log(`✅ Created content view for ${contentId}`);
    }

    // 2. Get total files for this slide
    const [totalFiles] = await connection.execute(
      `SELECT COUNT(*) as count FROM slide_files WHERE slide_id = ?`,
      [slideId]
    );
    const totalFilesCount = (totalFiles as any[])[0]?.count || 0;

    // 3. Get completed files for this slide
    const [completedFiles] = await connection.execute(
      `SELECT COUNT(*) as count FROM content_views 
       WHERE enrollment_id = ? AND slide_id = ? AND completed = true`,
      [enrollmentId, slideId]
    );
    const completedFilesCount = (completedFiles as any[])[0]?.count || 0;

    console.log(`📊 Slide ${slideId}: ${completedFilesCount}/${totalFilesCount} files completed`);

    // 4. Determine slide status
    const slideStatus = completedFilesCount === totalFilesCount ? 'completed' : 
                       completedFilesCount > 0 ? 'in_progress' : 'not_started';

    // 5. Update slide_progress
    const [existingProgress] = await connection.execute(
      `SELECT id FROM slide_progress WHERE enrollment_id = ? AND slide_id = ?`,
      [enrollmentId, slideId]
    );

    if ((existingProgress as any[]).length > 0) {
      // Update existing progress
      await connection.execute(
        `UPDATE slide_progress 
         SET status = ?,
             time_spent = time_spent + ?,
             last_accessed = NOW(),
             completed_at = CASE WHEN ? = 'completed' AND completed_at IS NULL THEN NOW() ELSE completed_at END,
             updated_at = NOW()
         WHERE enrollment_id = ? AND slide_id = ?`,
        [slideStatus, durationWatched || 0, slideStatus, enrollmentId, slideId]
      );
      console.log(`✅ Updated slide_progress for ${slideId} with status: ${slideStatus}`);
    } else {
      // Insert new progress
      const progressId = uuidv4();
      await connection.execute(
        `INSERT INTO slide_progress 
         (id, enrollment_id, student_email, course_id, slide_id, status, time_spent, last_accessed, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
        [progressId, enrollmentId, studentEmail, courseId, slideId, slideStatus, durationWatched || 0]
      );
      console.log(`✅ Created slide_progress for ${slideId} with status: ${slideStatus}`);
    }

    // 6. Get ALL completed slides from slide_progress
    const [completedRows] = await connection.execute(
      `SELECT slide_id FROM slide_progress 
       WHERE enrollment_id = ? AND status = 'completed'`,
      [enrollmentId]
    );
    
    const completedSlideIds = (completedRows as any[]).map(row => row.slide_id);
    console.log(`📊 Total completed slides from slide_progress: ${completedSlideIds.length}`);

    // 7. Get total slides count for course
    const [totalSlides] = await connection.execute(
      `SELECT COUNT(*) as count FROM course_slides WHERE course_id = ?`,
      [courseId]
    );
    const totalSlidesCount = (totalSlides as any[])[0]?.count || 1;

    // 8. Calculate course progress based on ALL completed slides
    const courseProgress = Math.round((completedSlideIds.length / totalSlidesCount) * 100);
    const courseStatus = courseProgress === 100 ? 'completed' : 'in_progress';

    // 9. Get current student_progress to preserve completed_content
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
        if (!Array.isArray(completedContent)) completedContent = [];
      } catch (e) {
        console.warn('⚠️ Failed to parse completed_content, using empty array');
        completedContent = [];
      }

      // Add or update current content in completed_content
      const contentKey = `${slideId}_${contentId}`;
      if (completed && !completedContent.includes(contentKey)) {
        completedContent.push(contentKey);
      } else if (!completed) {
        completedContent = completedContent.filter(key => key !== contentKey);
      }
    }

    // 10. Update student_progress with ALL completed slides
    if ((progressRows as any[]).length > 0) {
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
          courseProgress,
          courseStatus,
          enrollmentId
        ]
      );
      console.log(`✅ Updated student_progress with ${completedSlideIds.length} completed slides`);
    } else {
      // Create new student_progress record
      const newProgressId = uuidv4();
      const contentKey = `${slideId}_${contentId}`;
      const initialContent = completed ? [contentKey] : [];
      
      await connection.execute(
        `INSERT INTO student_progress 
         (id, enrollment_id, student_email, course_id, completed_slides, completed_content, progress_percentage, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          newProgressId, 
          enrollmentId, 
          studentEmail, 
          courseId, 
          JSON.stringify(completedSlideIds),
          JSON.stringify(initialContent),
          courseProgress,
          courseStatus
        ]
      );
      console.log(`✅ Created new student_progress record`);
    }

    // Commit transaction
    await connection.commit();

    return NextResponse.json({
      success: true,
      data: {
        contentTracked: true,
        slideProgress: {
          status: slideStatus,
          completedFiles: completedFilesCount,
          totalFiles: totalFilesCount,
          progress: totalFilesCount > 0 ? Math.round((completedFilesCount / totalFilesCount) * 100) : 0
        },
        courseProgress,
        completedSlides: completedSlideIds.length,
        totalSlides: totalSlidesCount,
        completedSlideIds // For debugging
      },
      message: completed ? 'Content marked as complete' : 'Progress updated'
    });

  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error('❌ Error tracking content view:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to track content view' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}