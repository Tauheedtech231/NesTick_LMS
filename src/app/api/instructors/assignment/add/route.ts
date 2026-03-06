// /app/api/instructors/assignment/add/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */
export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const { 
      slideId,
      courseId,
      title,
      description,
      dueDate,
      totalMarks,
      passingMarks,
      file,
      status
    } = body;

    console.log('📝 Adding assignment:', { 
      slideId, 
      courseId, 
      title,
      hasFile: !!file
    });

    // Validate required fields
    if (!slideId) {
      return NextResponse.json(
        { success: false, error: 'slideId is required' },
        { status: 400 }
      );
    }
    
    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'courseId is required' },
        { status: 400 }
      );
    }
    
    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'title is required' },
        { status: 400 }
      );
    }
    
    if (!description || !description.trim()) {
      return NextResponse.json(
        { success: false, error: 'description is required' },
        { status: 400 }
      );
    }
    
    if (!dueDate) {
      return NextResponse.json(
        { success: false, error: 'dueDate is required' },
        { status: 400 }
      );
    }
    
    if (!totalMarks || totalMarks <= 0) {
      return NextResponse.json(
        { success: false, error: 'totalMarks must be greater than 0' },
        { status: 400 }
      );
    }
    
    if (!passingMarks || passingMarks <= 0) {
      return NextResponse.json(
        { success: false, error: 'passingMarks must be greater than 0' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Check if slide exists
    const [slideCheck] = await connection.execute(
      `SELECT id FROM course_slides WHERE id = ? AND course_id = ?`,
      [slideId, courseId]
    );

    if ((slideCheck as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Slide not found or does not belong to this course' },
        { status: 404 }
      );
    }

    // Generate assignment ID
    const assignmentId = uuidv4();

    // Insert assignment
    await connection.execute(
      `INSERT INTO course_assignments 
       (id, slide_id, course_id, title, description, due_date, 
        total_marks, passing_marks, file_name, file_type, file_size, 
        file_url, public_id, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        assignmentId,
        slideId,
        courseId,
        title.trim(),
        description.trim(),
        dueDate,
        totalMarks,
        passingMarks,
        file?.name || null,
        file?.type || null,
        file?.size || null,
        file?.url || null,
        file?.publicId || null,
        status || 'draft'
      ]
    );

    console.log('✅ Assignment added successfully:', assignmentId);

    // Fetch the created assignment
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
       FROM course_assignments 
       WHERE id = ?`,
      [assignmentId]
    );

    const assignment = (newAssignment as any[])[0];

    // Format response
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
      message: 'Assignment added successfully'
    });

  } catch (error: any) {
    console.error('❌ Error adding assignment:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to add assignment'
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}