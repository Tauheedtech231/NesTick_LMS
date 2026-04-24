/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const { slideId, courseId, title, description, dueDate, totalMarks, passingMarks, file, status } = body;

    if (!slideId || !courseId || !title || !description || !dueDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    const assignmentId = uuidv4();

    await connection.execute(
      `INSERT INTO course_assignments 
       (id, slide_id, course_id, title, description, due_date, total_marks, passing_marks, 
        file_name, file_type, file_size, file_url, public_id, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        assignmentId, slideId, courseId, title, description, dueDate, 
        totalMarks || 100, passingMarks || 70,
        file?.name || null, file?.type || null, file?.size || null, 
        file?.url || null, file?.publicId || null,
        status || 'draft'
      ]
    );

    const [newAssignment] = await connection.execute(
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

    const result = newAssignment[0];
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
    console.error('Error adding assignment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add assignment' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}