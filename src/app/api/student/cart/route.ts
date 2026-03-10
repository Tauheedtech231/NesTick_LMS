// /app/api/student/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const studentEmail = searchParams.get('email');

    if (!studentEmail) {
      return NextResponse.json(
        { success: false, error: 'Student email is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    const [rows] = await connection.execute(
      `SELECT id, course_id, course_title, course_price, created_at
       FROM cart_bucket
       WHERE student_email = ?
       ORDER BY created_at DESC`,
      [studentEmail]
    );

    // Calculate total
    const items = rows as any[];
    const total = items.reduce((sum, item) => sum + (Number(item.course_price) || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        items,
        total,
        count: items.length
      }
    });

  } catch (error: any) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}