// /app/api/students/assignment/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */
export async function POST(request: NextRequest) {
  let connection;
  try {
    // ✅ Parse form data properly
    const formData = await request.formData();
    
    // Get all fields from form data
    const enrollmentId = formData.get('enrollmentId') as string;
    const studentEmail = formData.get('studentEmail') as string;
    const studentName = formData.get('studentName') as string;
    const courseId = formData.get('courseId') as string;
    const slideId = formData.get('slideId') as string;
    const assignmentId = formData.get('assignmentId') as string;
    const filesJson = formData.get('files') as string;

    console.log('📝 Assignment submission received:', { 
      enrollmentId, 
      studentEmail, 
      courseId, 
      slideId,
      assignmentId,
      hasFiles: !!filesJson
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
    
    if (!assignmentId) {
      return NextResponse.json(
        { success: false, error: 'assignmentId is required' },
        { status: 400 }
      );
    }

    if (!filesJson) {
      return NextResponse.json(
        { success: false, error: 'No files data provided' },
        { status: 400 }
      );
    }

    // Parse files JSON safely
    let files = [];
    try {
      files = JSON.parse(filesJson);
    } catch (e) {
      console.error('❌ Invalid files JSON:', filesJson);
      return NextResponse.json(
        { success: false, error: 'Invalid files data format' },
        { status: 400 }
      );
    }

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files uploaded' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Start transaction
    await connection.beginTransaction();

    // 1. Check if already submitted
    const [existing] = await connection.execute(
      `SELECT id FROM assignment_submissions WHERE enrollment_id = ? AND assignment_id = ?`,
      [enrollmentId, assignmentId]
    );

    const filesString = JSON.stringify(files);

    if ((existing as any[]).length > 0) {
      // Update existing
      await connection.execute(
        `UPDATE assignment_submissions 
         SET files = ?, 
             submitted_at = NOW(), 
             status = 'submitted', 
             updated_at = NOW()
         WHERE enrollment_id = ? AND assignment_id = ?`,
        [filesString, enrollmentId, assignmentId]
      );
      console.log('✅ Assignment submission updated');
    } else {
      // Insert new
      const submissionId = uuidv4();
      await connection.execute(
        `INSERT INTO assignment_submissions 
         (id, enrollment_id, student_email, student_name, course_id, slide_id, assignment_id, files, submitted_at, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'submitted', NOW(), NOW())`,
        [submissionId, enrollmentId, studentEmail, studentName || 'Student', courseId, slideId || null, assignmentId, filesString]
      );
      console.log('✅ New assignment submission created:', submissionId);
    }

    // 2. ✅ DIRECT DATABASE UPDATE for progress
    try {
      // Get total slides count for this course
      const [slideRows] = await connection.execute(
        `SELECT COUNT(*) as count FROM course_slides WHERE course_id = ?`,
        [courseId]
      );
      const totalSlides = (slideRows as any[])[0]?.count || 0;

      // Get current progress
      const [progressRows] = await connection.execute(
        `SELECT * FROM student_progress WHERE enrollment_id = ?`,
        [enrollmentId]
      );

      let completedSlides: string[] = [];
      let completedContent: string[] = [];

      if ((progressRows as any[]).length > 0) {
        const progress = (progressRows as any[])[0];
        
        // Parse existing data
        try {
          completedSlides = progress.completed_slides ? JSON.parse(progress.completed_slides) : [];
        } catch (e) {
          console.warn('⚠️ Failed to parse completed_slides, using empty array');
          completedSlides = [];
        }
        
        try {
          completedContent = progress.completed_content ? JSON.parse(progress.completed_content) : [];
        } catch (e) {
          console.warn('⚠️ Failed to parse completed_content, using empty array');
          completedContent = [];
        }
      } else {
        // Create new progress record if doesn't exist
        const progressId = uuidv4();
        await connection.execute(
          `INSERT INTO student_progress 
           (id, enrollment_id, student_email, course_id, completed_slides, completed_content, created_at, updated_at)
           VALUES (?, ?, ?, ?, '[]', '[]', NOW(), NOW())`,
          [progressId, enrollmentId, studentEmail, courseId]
        );
        console.log('✅ New progress record created');
      }

      // ✅ Add this slide to completed slides if not already
      // Note: Assignment submission usually doesn't mark slide complete,
      // but we'll keep it here for consistency. Remove if not needed.
      if (slideId && !completedSlides.includes(slideId)) {
        completedSlides.push(slideId);
        console.log(`✅ Slide ${slideId} marked as complete from assignment submission`);
      }

      // ✅ Add assignment completion to content tracking
      if (assignmentId) {
        const contentKey = `${slideId || 'no_slide'}_${assignmentId}`;
        if (!completedContent.includes(contentKey)) {
          completedContent.push(contentKey);
          console.log(`✅ Assignment ${assignmentId} marked as complete`);
        }
      }

      // Calculate progress percentage
      const progressPercentage = totalSlides > 0 
        ? Math.round((completedSlides.length / totalSlides) * 100) 
        : 0;

      const status = progressPercentage === 100 ? 'completed' : 
                     progressPercentage > 0 ? 'in_progress' : 'not_started';

      // Update progress
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
          JSON.stringify(completedSlides),
          JSON.stringify(completedContent),
          progressPercentage,
          status,
          enrollmentId
        ]
      );

      console.log('✅ Progress updated successfully:', {
        completedSlides: completedSlides.length,
        completedContent: completedContent.length,
        progressPercentage,
        status
      });

    } catch (progressError: any) {
      console.error('❌ Error updating progress:', progressError);
      // Don't rollback the main transaction - assignment is already saved
      // Just log the error and continue
    }

    // Commit transaction
    await connection.commit();

    return NextResponse.json({
      success: true,
      message: 'Assignment submitted successfully',
      data: {
        assignmentId,
        submittedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    // Rollback on error
    if (connection) {
      await connection.rollback();
    }
    
    console.error('❌ Error submitting assignment:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to submit assignment'
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}