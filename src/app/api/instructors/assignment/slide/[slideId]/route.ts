// /app/api/instructors/assignment/slide/[slideId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slideId: string }> }
) {
  let connection;
  try {
    const { slideId } = await params;

    if (!slideId) {
      return NextResponse.json(
        { success: false, error: 'Slide ID is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    const [assignmentRows] = await connection.execute(
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
       WHERE slide_id = ?
       ORDER BY created_at DESC`,
      [slideId]
    );

    const assignments = (assignmentRows as any[]).map(a => ({
      id: a.id,
      slideId: a.slideId,
      courseId: a.courseId,
      title: a.title,
      description: a.description,
      dueDate: a.dueDate,
      totalMarks: a.totalMarks,
      passingMarks: a.passingMarks,
      file: a.fileUrl ? {
        name: a.fileName,
        type: a.fileType,
        size: a.fileSize,
        url: a.fileUrl,
        publicId: a.publicId,
        uploadedAt: a.createdAt
      } : null,
      status: a.status,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: assignments
    });

  } catch (error: any) {
    console.error('❌ Error fetching assignments:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch assignments'
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}