import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      studentCapacity,
      category,
      status,
      instructorId,
      instructorName,
      instructorImage,
      image,
      price,
      originalPrice,
      duration,
      level
    } = body;

    console.log('📝 Creating new course for instructor:', instructorId);

    if (!title || !description || !instructorId) {
      return NextResponse.json(
        { success: false, error: 'Required fields missing' },
        { status: 400 }
      );
    }

    const courseId = uuidv4();

    await query(
      `INSERT INTO instructor_course (
        id, title, description, student_capacity, category, status,
        instructor_id, instructor_name, instructor_image, image,
        price, original_price, duration, level, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        courseId,
        title,
        description,
        studentCapacity || 30,
        category || null,
        status || 'draft',
        instructorId,
        instructorName || null,
        instructorImage || null,
        image || null,
        price ? parseFloat(price) : null,
        originalPrice ? parseFloat(originalPrice) : null,
        duration || null,
        level || 'Beginner'
      ]
    );

    return NextResponse.json({
      success: true,
      data: { courseId },
      message: 'Course created successfully'
    });

  } catch (error: any) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create course' },
      { status: 500 }
    );
  }
}