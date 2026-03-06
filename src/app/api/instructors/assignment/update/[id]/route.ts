// /app/api/instructors/assignment/update/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      title,
      description,
      dueDate,
      totalMarks,
      passingMarks,
      file,
      status
    } = body;

    console.log('📝 Updating assignment:', { id, title });

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Check if assignment exists
    const [existing] = await connection.execute(
      `SELECT id FROM course_assignments WHERE id = ?`,
      [id]
    );

    if ((existing as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }

    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }

    if (dueDate !== undefined) {
      updateFields.push('due_date = ?');
      updateValues.push(dueDate);
    }

    if (totalMarks !== undefined) {
      updateFields.push('total_marks = ?');
      updateValues.push(totalMarks);
    }

    if (passingMarks !== undefined) {
      updateFields.push('passing_marks = ?');
      updateValues.push(passingMarks);
    }

    if (file !== undefined) {
      updateFields.push('file_name = ?, file_type = ?, file_size = ?, file_url = ?, public_id = ?');
      updateValues.push(file?.name || null, file?.type || null, file?.size || null, file?.url || null, file?.publicId || null);
    }

    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    updateFields.push('updated_at = NOW()');

    if (updateFields.length === 1) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    updateValues.push(id);

    await connection.execute(
      `UPDATE course_assignments SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Fetch updated assignment
    const [updated] = await connection.execute(
      `SELECT 
        id,
        slide_id as slideId,
        course_id as courseId,
        title,
        description,
        due_date as dueDate,
        total_marks as totalMarks,
        passing_marks as passingMarks,
        file_name as fileName,
        file_type as fileType,
        file_size as fileSize,
        file_url as fileUrl,
        public_id as publicId,
        status,
        created_at as createdAt,
        updated_at as updatedAt
       FROM course_assignments 
       WHERE id = ?`,
      [id]
    );

    const assignment = (updated as any[])[0];

    const formattedAssignment = {
      id: assignment.id,
      slideId: assignment.slideId,
      courseId: assignment.courseId,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      totalMarks: assignment.totalMarks,
      passingMarks: assignment.passingMarks,
      file: assignment.fileUrl ? {
        name: assignment.fileName,
        type: assignment.fileType,
        size: assignment.fileSize,
        url: assignment.fileUrl,
        publicId: assignment.publicId,
        uploadedAt: assignment.createdAt
      } : null,
      status: assignment.status,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt
    };

    return NextResponse.json({
      success: true,
      data: formattedAssignment,
      message: 'Assignment updated successfully'
    });

  } catch (error: any) {
    console.error('❌ Error updating assignment:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update assignment'
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}