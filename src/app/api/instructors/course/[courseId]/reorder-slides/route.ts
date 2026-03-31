// app/api/instructors/course/[courseId]/reorder-slides/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  let connection;
  try {
    const { courseId } = await params;
    const body = await request.json();
    const { slides } = body;

    console.log('📤 Reordering slides for course:', courseId);
    console.log('Slides data:', JSON.stringify(slides, null, 2));

    if (!slides || !Array.isArray(slides)) {
      return NextResponse.json(
        { success: false, error: 'Invalid slides data' },
        { status: 400 }
      );
    }

    if (slides.length === 0) {
      return NextResponse.json(
        { success: true, message: 'No slides to reorder' },
        { status: 200 }
      );
    }

    // Validate each slide has required fields
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      if (!slide.id) {
        return NextResponse.json(
          { success: false, error: `Slide at position ${i + 1} has no ID` },
          { status: 400 }
        );
      }
      if (typeof slide.slideNumber !== 'number' || isNaN(slide.slideNumber)) {
        return NextResponse.json(
          { success: false, error: `Slide ${slide.id} has invalid slide number` },
          { status: 400 }
        );
      }
    }

    connection = await getConnection();
    
    await connection.beginTransaction();

    try {
      // Update each slide's order - ✅ ONLY update slide_number, NOT title
      for (const slide of slides) {
        console.log(`Updating slide ${slide.id} to position ${slide.slideNumber} (keeping title: "${slide.title}")`);
        
        const [result] = await connection.execute(
          `UPDATE course_slides SET 
            slide_number = ?,
            updated_at = NOW()
           WHERE id = ? AND course_id = ?`,
          [slide.slideNumber, slide.id, courseId]
        );
        
        // Check if update affected any rows
        const affectedRows = (result as any).affectedRows;
        if (affectedRows === 0) {
          console.warn(`⚠️ Slide ${slide.id} not found or not in course ${courseId}`);
        }
      }

      await connection.commit();

      console.log('✅ Slides reordered successfully');

      // Fetch updated slides to return
      const [updatedSlides] = await connection.execute(
        `SELECT id, slide_number, title FROM course_slides WHERE course_id = ? ORDER BY slide_number ASC`,
        [courseId]
      );

      return NextResponse.json({
        success: true,
        message: 'Slides reordered successfully',
        data: { slides: updatedSlides }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    }

  } catch (error: any) {
    console.error('❌ Error reordering slides:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reorder slides' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}