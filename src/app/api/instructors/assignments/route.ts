/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const slideId = searchParams.get('slideId');
    const courseId = searchParams.get('courseId');

    if (!slideId || !courseId) {
      return NextResponse.json(
        { success: false, error: 'Slide ID and Course ID are required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    const [assignments] = await connection.execute(
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
      WHERE slide_id = ? AND course_id = ?
      ORDER BY created_at ASC`,
      [slideId, courseId]
    ) as any[];

    const parsedAssignments = assignments.map((a: any) => ({
      id: a.id,
      slideId: a.slideId,
      courseId: a.courseId,
      title: a.title,
      description: a.description,
      dueDate: a.dueDate,
      totalMarks: a.totalMarks,
      passingMarks: a.passingMarks,
      status: a.status,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      file: a.fileUrl ? {
        name: a.fileName,
        type: a.fileType,
        size: a.fileSize,
        url: a.fileUrl,
        publicId: a.publicId,
        uploadedAt: a.createdAt
      } : null
    }));
  console.log("The Total assignemnt for this course",parsedAssignments)
    return NextResponse.json({
      success: true,
      data: parsedAssignments
    });

  } catch (error: any) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch assignments' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}