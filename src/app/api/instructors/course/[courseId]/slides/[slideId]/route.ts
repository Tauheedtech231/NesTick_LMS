// app/api/instructors/course/[courseId]/slides/[slideId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; slideId: string }> }
) {
  let connection;
  try {
    const { courseId, slideId } = await params;

    console.log('🗑️ Deleting slide:', { courseId, slideId });

    if (!courseId || !slideId) {
      return NextResponse.json(
        { success: false, error: 'Course ID and Slide ID are required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Start transaction
    await connection.beginTransaction();

    // 1. First check if slide exists and belongs to the course
    const [slideCheck] = await connection.execute(
      `SELECT id FROM course_slides 
       WHERE id = ? AND course_id = ?`,
      [slideId, courseId]
    );

    if ((slideCheck as any[]).length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { success: false, error: 'Slide not found or does not belong to this course' },
        { status: 404 }
      );
    }

    console.log('✅ Slide found, proceeding with deletion');

    // 2. Delete quiz questions (cascade will handle this, but we'll do it explicitly for logging)
    const [quizzes] = await connection.execute(
      `SELECT id FROM course_quizzes WHERE slide_id = ?`,
      [slideId]
    );

    for (const quiz of (quizzes as any[])) {
      await connection.execute(
        `DELETE FROM quiz_questions WHERE quiz_id = ?`,
        [quiz.id]
      );
      console.log(`✅ Deleted questions for quiz: ${quiz.id}`);
    }

    // 3. Delete quiz
    await connection.execute(
      `DELETE FROM course_quizzes WHERE slide_id = ?`,
      [slideId]
    );

    // 4. Delete slide files
    await connection.execute(
      `DELETE FROM slide_files WHERE slide_id = ?`,
      [slideId]
    );

    // 5. Delete assignments
    await connection.execute(
      `DELETE FROM course_assignments WHERE slide_id = ?`,
      [slideId]
    );

    // 6. Finally delete the slide
    const [result] = await connection.execute(
      `DELETE FROM course_slides WHERE id = ? AND course_id = ?`,
      [slideId, courseId]
    );

    // Commit transaction
    await connection.commit();

    console.log('✅ Slide deleted successfully');

    // Get remaining slides count for this course
    const [countResult] = await connection.execute(
      `SELECT COUNT(*) as remaining FROM course_slides WHERE course_id = ?`,
      [courseId]
    );

    return NextResponse.json({
      success: true,
      message: 'Slide deleted successfully',
      data: {
        deletedSlideId: slideId,
        remainingSlides: (countResult as any[])[0]?.remaining || 0
      }
    });

  } catch (error: any) {
    // Rollback on error
    if (connection) {
      await connection.rollback();
    }
    
    console.error('❌ Error deleting slide:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to delete slide'
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}