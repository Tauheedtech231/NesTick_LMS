import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const student_email = searchParams.get('student_email');
    const video_id = searchParams.get('video_id');

    console.log('📊 GET video progress:', { student_email, video_id });

    if (!student_email || !video_id) {
      return NextResponse.json({
        success: true,
        data: { current_position: 0, max_position: 0, total_duration: 0, is_completed: false }
      });
    }

    try {
      const result: any = await query(
        `SELECT current_position, max_position, total_duration, is_completed 
         FROM video_watch_progress 
         WHERE student_email = ? AND video_id = ?`,
        [student_email, video_id]
      );

      console.log('📊 Query result:', result);

      // Check if result is array and has data
      if (result && Array.isArray(result) && result.length > 0) {
        return NextResponse.json({
          success: true,
          data: {
            current_position: result[0].current_position || 0,
            max_position: result[0].max_position || 0,
            total_duration: result[0].total_duration || 0,
            is_completed: result[0].is_completed === 1
          }
        });
      }
    } catch (err) {
      console.log('Query error:', err);
    }

    // Default return when no data found
    return NextResponse.json({
      success: true,
      data: {
        current_position: 0,
        max_position: 0,
        total_duration: 0,
        is_completed: false
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching video progress:', error);
    return NextResponse.json({
      success: true,
      data: {
        current_position: 0,
        max_position: 0,
        total_duration: 0,
        is_completed: false
      }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      student_email,
      enrollment_id,
      video_id,
      slide_id,
      course_id,
      current_position,
      total_duration
    } = body;

    console.log('📊 POST video progress:', { student_email, video_id, current_position, total_duration });

    if (!student_email || !video_id || !enrollment_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const isCompleted = (current_position / total_duration) >= 0.95;
    const completedAt = isCompleted ? new Date() : null;

    try {
      // Check if record exists
      const existing: any = await query(
        `SELECT id FROM video_watch_progress WHERE student_email = ? AND video_id = ?`,
        [student_email, video_id]
      );

      console.log('📊 Existing record:', existing);

      if (existing && Array.isArray(existing) && existing.length > 0) {
        // Update existing record
        await query(
          `UPDATE video_watch_progress 
           SET current_position = ?,
               max_position = GREATEST(max_position, ?),
               total_duration = ?,
               is_completed = ?,
               completed_at = ?,
               last_watched_at = NOW()
           WHERE student_email = ? AND video_id = ?`,
          [
            current_position,
            current_position,
            total_duration,
            isCompleted ? 1 : 0,
            completedAt,
            student_email,
            video_id
          ]
        );
        console.log('📊 Record updated');
      } else {
        // Insert new record
        await query(
          `INSERT INTO video_watch_progress 
           (id, student_email, enrollment_id, video_id, slide_id, course_id, 
            current_position, max_position, total_duration, is_completed, completed_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            student_email,
            enrollment_id,
            video_id,
            slide_id,
            course_id,
            current_position,
            current_position,
            total_duration,
            isCompleted ? 1 : 0,
            completedAt
          ]
        );
        console.log('📊 New record inserted');
      }
    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      // Don't throw, just log
    }

    return NextResponse.json({
      success: true,
      data: {
        is_completed: isCompleted,
        current_position
      }
    });

  } catch (error: any) {
    console.error('❌ Error saving video progress:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save video progress' },
      { status: 500 }
    );
  }
}