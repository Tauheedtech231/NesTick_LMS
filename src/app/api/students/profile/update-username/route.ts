/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function PUT(request: NextRequest) {
  let connection;
  try {
    const { email, newUsername } = await request.json();

    if (!email || !newUsername) {
      return NextResponse.json(
        { success: false, error: 'Email and new username are required' },
        { status: 400 }
      );
    }

    if (newUsername.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Username must be at least 3 characters' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // ✅ Check if username already exists in enrollments table
    const [existing] = await connection.execute(
      `SELECT id FROM enrollments WHERE username = ? AND student_email != ? LIMIT 1`,
      [newUsername, email]
    );

    if ((existing as any[]).length > 0) {
      return NextResponse.json(
        { success: false, error: 'Username already taken' },
        { status: 409 }
      );
    }

    // ✅ Update username in enrollments table (all enrollments of this student)
    await connection.execute(
      `UPDATE enrollments SET username = ? WHERE student_email = ?`,
      [newUsername, email]
    );

    return NextResponse.json({
      success: true,
      data: { username: newUsername },
      message: 'Username updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating username:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update username' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}