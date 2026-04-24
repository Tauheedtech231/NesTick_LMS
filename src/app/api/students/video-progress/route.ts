/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// ============ POST - Save Video Progress ============
export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const { 
      enrollmentId, 
      studentEmail, 
      courseId, 
      slideId, 
      videoId, 
      currentPosition,
      totalDuration,
      isCompleted 
    } = body;

    console.log('=========================================');
    console.log('📥 VIDEO PROGRESS POST REQUEST:');
    console.log('   enrollmentId:', enrollmentId);
    console.log('   studentEmail:', studentEmail);
    console.log('   courseId:', courseId);
    console.log('   slideId:', slideId);
    console.log('   videoId:', videoId);
    console.log('   currentPosition:', currentPosition);
    console.log('   totalDuration:', totalDuration);
    console.log('   isCompleted:', isCompleted);
    console.log('=========================================');

    if (!enrollmentId || !studentEmail || !courseId || !slideId || !videoId) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    connection = await getConnection();
    console.log('✅ Database connected');

    // Check if enrollment exists
    const [enrollmentCheck] = await connection.execute(
      `SELECT id FROM enrollments WHERE id = ?`,
      [enrollmentId]
    ) as any[];
    
    console.log('📋 Enrollment exists?', enrollmentCheck.length > 0 ? 'YES' : 'NO');
    if (enrollmentCheck.length === 0) {
      console.error('❌ Enrollment not found:', enrollmentId);
    }

    // Check if progress exists
    const [existingRows] = await connection.execute(
      `SELECT id, current_position, is_completed FROM video_watch_progress 
       WHERE enrollment_id = ? AND video_id = ?`,
      [enrollmentId, videoId]
    ) as any[];

    console.log('📋 Existing progress record?', existingRows.length > 0 ? 'YES' : 'NO');
    if (existingRows.length > 0) {
      console.log('   Existing record:', existingRows[0]);
    }

    let result;
    
    if (existingRows && existingRows.length > 0) {
      // UPDATE existing record
      const currentMax = existingRows[0].current_position || 0;
      const newPosition = currentPosition || 0;
      const updatePosition = newPosition > currentMax ? newPosition : currentMax;
      
      console.log('🔄 Updating existing record...');
      console.log('   currentMax:', currentMax);
      console.log('   newPosition:', newPosition);
      console.log('   updatePosition:', updatePosition);
      
      await connection.execute(
        `UPDATE video_watch_progress 
         SET current_position = ?, total_duration = ?, is_completed = ?, 
             last_watched_at = NOW()
         WHERE id = ?`,
        [updatePosition, totalDuration || 0, isCompleted || false, existingRows[0].id]
      );
      
      result = { id: existingRows[0].id, isCompleted: isCompleted || false };
      console.log('✅ Record UPDATED successfully:', result);
    } else {
      // INSERT new record
      const newId = uuidv4();
      console.log('🆕 Inserting new record...');
      console.log('   newId:', newId);
      
      await connection.execute(
        `INSERT INTO video_watch_progress 
         (id, student_email, enrollment_id, video_id, slide_id, course_id, 
          current_position, total_duration, is_completed, last_watched_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [newId, studentEmail, enrollmentId, videoId, slideId, courseId,
         currentPosition || 0, totalDuration || 0, isCompleted || false]
      );
      
      result = { id: newId, isCompleted: isCompleted || false };
      console.log('✅ Record INSERTED successfully:', result);
    }

    // Verify the record was saved
    const [verifyRecord] = await connection.execute(
      `SELECT id, current_position, is_completed FROM video_watch_progress WHERE id = ?`,
      [result.id]
    ) as any[];
    
    console.log('📋 Verification after save:', verifyRecord.length > 0 ? 'RECORD EXISTS' : 'RECORD NOT FOUND');
    console.log('=========================================');

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('=========================================');
    console.error('❌ ERROR saving video progress:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ SQL:', error.sql);
    console.error('=========================================');
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to save video progress',
        details: error.code || 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
      console.log('🔌 Database connection released');
    }
  }
}

// ============ GET - Fetch Video Progress ============
export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const enrollmentId = searchParams.get('enrollmentId');
    const courseId = searchParams.get('courseId');

    console.log('=========================================');
    console.log('📥 VIDEO PROGRESS GET REQUEST:');
    console.log('   enrollmentId:', enrollmentId);
    console.log('   courseId:', courseId);
    console.log('=========================================');

    if (!enrollmentId) {
      return NextResponse.json(
        { success: false, error: 'Enrollment ID is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();
    console.log('✅ Database connected');

    let query = `
      SELECT 
        id,
        video_id as videoId,
        slide_id as slideId,
        course_id as courseId,
        current_position as currentPosition,
        total_duration as totalDuration,
        is_completed as isCompleted,
        last_watched_at as lastWatchedAt
      FROM video_watch_progress 
      WHERE enrollment_id = ?
    `;
    
    const params = [enrollmentId];
    
    if (courseId) {
      query += ` AND course_id = ?`;
      params.push(courseId);
    }
    
    query += ` ORDER BY last_watched_at DESC`;

    console.log('📋 Query:', query);
    console.log('📋 Params:', params);

    const [progress] = await connection.execute(query, params) as any[];

    console.log('📋 Progress records found:', progress.length);
    if (progress.length > 0) {
      console.log('   First record:', progress[0]);
    }

    const progressMap: Record<string, any> = {};
    progress.forEach((p: any) => {
      const key = `${p.slideId}_${p.videoId}`;
      progressMap[key] = {
        videoId: p.videoId,
        slideId: p.slideId,
        currentPosition: p.currentPosition,
        totalDuration: p.totalDuration,
        isCompleted: p.isCompleted === 1,
        lastWatchedAt: p.lastWatchedAt
      };
    });

    console.log('📋 Progress map keys:', Object.keys(progressMap));
    console.log('=========================================');

    return NextResponse.json({
      success: true,
      data: progressMap
    });

  } catch (error: any) {
    console.error('=========================================');
    console.error('❌ Error fetching video progress:', error);
    console.error('❌ Error message:', error.message);
    console.error('=========================================');
    
    return NextResponse.json(
      { success: false, data: {}, error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}