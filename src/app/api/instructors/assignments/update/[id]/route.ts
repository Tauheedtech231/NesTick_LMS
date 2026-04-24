/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  let connection;
  try {
    const resolvedParams = await params;
    const assignmentId = resolvedParams.id;
    
    const body = await request.json();
    const { title, description, dueDate, totalMarks, passingMarks, file, status } = body;

    if (!title || !description || !dueDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    await connection.execute(
      `UPDATE course_assignments 
       SET title = ?, description = ?, due_date = ?, total_marks = ?, passing_marks = ?,
           file_name = ?, file_type = ?, file_size = ?, file_url = ?, public_id = ?,
           status = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        title, description, dueDate, totalMarks || 100, passingMarks || 70,
        file?.name || null, file?.type || null, file?.size || null, 
        file?.url || null, file?.publicId || null,
        status || 'draft', assignmentId
      ]
    );

    const [updatedAssignment] = await connection.execute(
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
      FROM course_assignments WHERE id = ?`,
      [assignmentId]
    ) as any[];

    const result = updatedAssignment[0];
    const parsedAssignment = {
      id: result.id,
      slideId: result.slideId,
      courseId: result.courseId,
      title: result.title,
      description: result.description,
      dueDate: result.dueDate,
      totalMarks: result.totalMarks,
      passingMarks: result.passingMarks,
      status: result.status,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      file: result.fileUrl ? {
        name: result.fileName,
        type: result.fileType,
        size: result.fileSize,
        url: result.fileUrl,
        publicId: result.publicId,
        uploadedAt: result.createdAt
      } : null
    };

    return NextResponse.json({
      success: true,
      data: parsedAssignment
    });

  } catch (error: any) {
    console.error('Error updating assignment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update assignment' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}