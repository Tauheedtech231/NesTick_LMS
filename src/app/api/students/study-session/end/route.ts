import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */
export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const { enrollmentId, studentEmail, courseId, slideId, durationMinutes } = body;

    if (!enrollmentId || !studentEmail || !courseId || !durationMinutes) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Save study session
    const sessionId = uuidv4();
    await connection.execute(
      `INSERT INTO study_sessions 
       (id, enrollment_id, student_email, course_id, slide_id, started_at, ended_at, duration_minutes, created_at)
       VALUES (?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? MINUTE), NOW(), ?, NOW())`,
      [sessionId, enrollmentId, studentEmail, courseId, slideId || null, durationMinutes, durationMinutes]
    );

    // Update total study hours in progress
    await connection.execute(
      `UPDATE student_progress 
       SET study_hours = study_hours + ?, updated_at = NOW()
       WHERE enrollment_id = ?`,
      [durationMinutes, enrollmentId]
    );

    return NextResponse.json({
      success: true,
      message: 'Study session recorded'
    });

  } catch (error: any) {
    console.error('Error recording study session:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}