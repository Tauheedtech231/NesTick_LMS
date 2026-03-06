// /app/api/instructors/slides/add/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */
export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const { 
      courseId,
      slideNumber,
      title
    } = body;

    console.log('📝 Adding slide:', { courseId, slideNumber, title });

    // Validate required fields
    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'courseId is required' },
        { status: 400 }
      );
    }
    
    if (slideNumber === undefined || slideNumber === null) {
      return NextResponse.json(
        { success: false, error: 'slideNumber is required' },
        { status: 400 }
      );
    }
    
    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'title is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Check if course exists
    const [courseCheck] = await connection.execute(
      `SELECT id FROM instructor_course WHERE id = ?`,
      [courseId]
    );

    if ((courseCheck as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if slide number already exists for this course
    const [slideCheck] = await connection.execute(
      `SELECT id FROM course_slides WHERE course_id = ? AND slide_number = ?`,
      [courseId, slideNumber]
    );

    if ((slideCheck as any[]).length > 0) {
      return NextResponse.json(
        { success: false, error: `Slide number ${slideNumber} already exists for this course` },
        { status: 400 }
      );
    }

    // Generate slide ID
    const slideId = uuidv4();

    // Insert slide
    await connection.execute(
      `INSERT INTO course_slides 
       (id, course_id, slide_number, title, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [slideId, courseId, slideNumber, title.trim()]
    );

    console.log('✅ Slide added successfully:', slideId);

    // Fetch the created slide
    const [newSlide] = await connection.execute(
      `SELECT 
        id,
        course_id as courseId,
        slide_number as slideNumber,
        title,
        created_at as createdAt,
        updated_at as updatedAt
       FROM course_slides 
       WHERE id = ?`,
      [slideId]
    );

    const slide = (newSlide as any[])[0];

    return NextResponse.json({
      success: true,
      data: slide,
      message: 'Slide added successfully'
    });

  } catch (error: any) {
    console.error('❌ Error adding slide:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to add slide'
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}