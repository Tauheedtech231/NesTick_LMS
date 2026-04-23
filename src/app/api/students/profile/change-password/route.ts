/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';


export async function POST(request: NextRequest) {
  let connection;
  try {
    const { email, currentPassword, newPassword } = await request.json();

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // ✅ Get current password from enrollments table
    const [student] = await connection.execute(
      `SELECT password FROM enrollments WHERE student_email = ? LIMIT 1`,
      [email]
    );

    if ((student as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    const currentStoredPassword = (student as any[])[0].password;

    // ✅ Verify current password (plain text comparison - since passwords are stored plain in enrollments)
    if (currentPassword !== currentStoredPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // ✅ Update password in enrollments table (all enrollments of this student)
    await connection.execute(
      `UPDATE enrollments SET password = ? WHERE student_email = ?`,
      [newPassword, email]
    );

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error: any) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to change password' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}