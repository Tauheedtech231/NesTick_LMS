import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
/* eslint-disable @typescript-eslint/no-explicit-any */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentEmail, sessionUser } = body;

    if (sessionUser && sessionUser.email) {
      return NextResponse.json({ success: true, status: 'LOGGED_IN', message: 'User session valid' });
    }

    if (!studentEmail || typeof studentEmail !== 'string') {
      return NextResponse.json({ success: false, error: 'studentEmail is required' }, { status: 400 });
    }

    const existingUser = await query<any[]>(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [studentEmail.trim().toLowerCase()]
    );

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json({ success: true, status: 'USER_EXISTS', message: 'Email already registered. Please login or use another email.' });
    }

    return NextResponse.json({ success: true, status: 'GUEST_OK', message: 'Guest checkout allowed' });
  } catch (error: any) {
    console.error('Error in checkout API:', error);
    return NextResponse.json({ success: false, error: error.message || 'Checkout validation failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentEmail = searchParams.get('email');

    if (!studentEmail) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const cart = await query<any[]>(
      'SELECT id, course_id, course_title, course_price, created_at FROM cart_bucket WHERE student_email = ? ORDER BY created_at DESC',
      [studentEmail]
    );

    const items = cart || [];
    const total = items.reduce((sum: number, item: any) => sum + Number(item.course_price || 0), 0);

    return NextResponse.json({ success: true, data: { items, total, count: items.length } });
  } catch (error: any) {
    console.error('Error fetching checkout cart:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch cart' }, { status: 500 });
  }
}
