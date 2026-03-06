// /app/api/instructors/slides/update/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      title,
      slideNumber 
    } = body;

    console.log('📝 Updating slide:', { id, title, slideNumber });

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Slide ID is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Check if slide exists and get course_id
    const [existing] = await connection.execute(
      `SELECT id, course_id as courseId, slide_number as currentSlideNumber 
       FROM course_slides 
       WHERE id = ?`,
      [id]
    );

    if ((existing as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Slide not found' },
        { status: 404 }
      );
    }

    const slide = (existing as any[])[0];
    const courseId = slide.courseId;
    const currentSlideNumber = slide.currentSlideNumber;

    // Build update query
    const updateFields = [];
    const updateValues = [];

    // Update title if provided
    if (title !== undefined) {
      if (!title.trim()) {
        return NextResponse.json(
          { success: false, error: 'Title cannot be empty' },
          { status: 400 }
        );
      }
      updateFields.push('title = ?');
      updateValues.push(title.trim());
    }

    // Update slide number if provided and different from current
    if (slideNumber !== undefined && slideNumber !== currentSlideNumber) {
      if (slideNumber < 1) {
        return NextResponse.json(
          { success: false, error: 'Slide number must be greater than 0' },
          { status: 400 }
        );
      }

      // Check if new slide number already exists for this course
      const [slideCheck] = await connection.execute(
        `SELECT id FROM course_slides 
         WHERE course_id = ? AND slide_number = ? AND id != ?`,
        [courseId, slideNumber, id]
      );

      if ((slideCheck as any[]).length > 0) {
        return NextResponse.json(
          { success: false, error: `Slide number ${slideNumber} already exists for this course` },
          { status: 400 }
        );
      }

      updateFields.push('slide_number = ?');
      updateValues.push(slideNumber);
    }

    // Always update the updated_at timestamp
    updateFields.push('updated_at = NOW()');

    // Check if there's anything to update
    if (updateFields.length === 1) { // Only updated_at
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Add the slide ID to values array
    updateValues.push(id);

    // Execute update query
    await connection.execute(
      `UPDATE course_slides SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    console.log('✅ Slide updated successfully');

    // Fetch updated slide data
    const [updated] = await connection.execute(
      `SELECT 
        id,
        course_id as courseId,
        slide_number as slideNumber,
        title,
        created_at as createdAt,
        updated_at as updatedAt
       FROM course_slides 
       WHERE id = ?`,
      [id]
    );

    const slideData = (updated as any[])[0];

    return NextResponse.json({
      success: true,
      data: slideData,
      message: title ? 'Slide title updated successfully' : 'Slide updated successfully'
    });

  } catch (error: any) {
    console.error('❌ Error updating slide:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update slide'
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}