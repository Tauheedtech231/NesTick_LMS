// /app/api/instructors/assignment/delete/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  try {
    const { id } = await params;

    console.log('🗑️ Deleting assignment:', id);

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

    // Delete assignment
    await connection.execute(
      `DELETE FROM course_assignments WHERE id = ?`,
      [id]
    );

    console.log('✅ Assignment deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Assignment deleted successfully'
    });

  } catch (error: any) {
    console.error('❌ Error deleting assignment:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to delete assignment'
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}