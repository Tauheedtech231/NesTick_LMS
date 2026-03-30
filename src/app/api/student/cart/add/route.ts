/* eslint-disable @typescript-eslint/no-explicit-any */
// /app/api/student/cart/add/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  let connection;
  try {
    const { studentEmail, courseId } = await request.json();

    // Validation
    if (!studentEmail || !courseId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Check if course exists in instructor_course
    const [courseRows] = await connection.execute(
      'SELECT title, price FROM instructor_course WHERE id = ? AND status = "published"',
      [courseId]
    );

    const courses = courseRows as any[];
    if (courses.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Course not found or not published' },
        { status: 404 }
      );
    }

    const course = courses[0];

    // Check if course already exists in cart
    const [existing] = await connection.execute(
      'SELECT id FROM cart_bucket WHERE student_email = ? AND course_id = ?',
      [studentEmail, courseId]
    );

    if ((existing as any[]).length > 0) {
      return NextResponse.json(
        { success: false, error: 'Course already in cart' },
        { status: 400 }
      );
    }

    // Insert into cart using correct price from instructor_course
    const cartId = uuidv4();
    await connection.execute(
      `INSERT INTO cart_bucket (id, student_email, course_id, course_title, course_price, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [cartId, studentEmail, courseId, course.title, course.price]
    );

    return NextResponse.json({
      success: true,
      message: 'Course added to cart successfully',
      data: { cartId }
    });

  } catch (error: any) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add to cart' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}