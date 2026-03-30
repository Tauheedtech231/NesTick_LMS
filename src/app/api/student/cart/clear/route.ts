// app/api/student/cart/clear/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable @typescript-eslint/no-explicit-any */
export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Clear cart items for the user from cart_bucket table
    await connection.execute(
      'DELETE FROM cart_bucket WHERE student_email = ?',
      [email]
    );

    return NextResponse.json({
      success: true,
      message: 'Cart cleared successfully'
    });

  } catch (error: any) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to clear cart' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}