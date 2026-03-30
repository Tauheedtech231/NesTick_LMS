// /app/api/student/cart/remove/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable @typescript-eslint/no-explicit-any */
export async function DELETE(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get('id');
    const studentEmail = searchParams.get('email');
    const courseId = searchParams.get('courseId');

    if (!studentEmail) {
      return NextResponse.json(
        { success: false, error: 'Student email is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    let query = 'DELETE FROM cart_bucket WHERE student_email = ?';
    const params: any[] = [studentEmail];

    if (cartId) {
      query += ' AND id = ?';
      params.push(cartId);
    } else if (courseId) {
      query += ' AND course_id = ?';
      params.push(courseId);
    }

    await connection.execute(query, params);

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart'
    });

  } catch (error: any) {
    console.error('Error removing from cart:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}