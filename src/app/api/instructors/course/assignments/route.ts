import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/* eslint-disable */
export async function POST(request: NextRequest) {
  try {
    const { assignments } = await request.json();

    if (!assignments || !Array.isArray(assignments)) {
      return NextResponse.json(
        { success: false, error: 'Assignments array is required' },
        { status: 400 }
      );
    }

    console.log('📚 Saving assignments, count:', assignments.length);

    for (const assignment of assignments) {
      // Check if assignment exists
      const existing = await query<any[]>(
        'SELECT id FROM course_assignments WHERE id = ?',
        [assignment.id]
      );

      if (existing.length > 0) {
        // Update
        await query(
          `UPDATE course_assignments SET
            title = ?, description = ?, due_date = ?, total_marks = ?,
            passing_marks = ?, file_name = ?, file_type = ?, file_size = ?,
            file_url = ?, public_id = ?, status = ?, updated_at = NOW()
           WHERE id = ?`,
          [
            assignment.title,
            assignment.description,
            assignment.dueDate,
            assignment.totalMarks,
            assignment.passingMarks,
            assignment.file?.name || null,
            assignment.file?.type || null,
            assignment.file?.size || null,
            assignment.file?.url || null,
            assignment.file?.publicId || null,
            assignment.status,
            assignment.id
          ]
        );
      } else {
        // Insert
        await query(
          `INSERT INTO course_assignments (
            id, slide_id, course_id, title, description, due_date,
            total_marks, passing_marks, file_name, file_type, file_size,
            file_url, public_id, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            assignment.id,
            assignment.slideId,
            assignment.courseId,
            assignment.title,
            assignment.description,
            assignment.dueDate,
            assignment.totalMarks,
            assignment.passingMarks,
            assignment.file?.name || null,
            assignment.file?.type || null,
            assignment.file?.size || null,
            assignment.file?.url || null,
            assignment.file?.publicId || null,
            assignment.status
          ]
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Assignments saved successfully'
    });

  } catch (error: any) {
    console.error('Error saving assignments:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save assignments' },
      { status: 500 }
    );
  }
}