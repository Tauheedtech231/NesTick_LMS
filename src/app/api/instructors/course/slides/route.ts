import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/* eslint-disable */
export async function POST(request: NextRequest) {
  try {
    const { courseId, slides } = await request.json();

    if (!courseId || !slides || !Array.isArray(slides)) {
      return NextResponse.json(
        { success: false, error: 'Course ID and slides are required' },
        { status: 400 }
      );
    }

    console.log('📚 Saving slides for course:', courseId);

    // Delete existing slides
    await query('DELETE FROM course_slides WHERE course_id = ?', [courseId]);

    // Insert new slides
    for (const slide of slides) {
      await query(
        `INSERT INTO course_slides (id, course_id, slide_number, title, created_at, updated_at)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [slide.id, courseId, slide.slideNumber, slide.title]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Slides saved successfully'
    });

  } catch (error: any) {
    console.error('Error saving slides:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save slides' },
      { status: 500 }
    );
  }
}