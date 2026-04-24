/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  let connection;
  try {
    const resolvedParams = await params;
    const assignmentId = resolvedParams.id;

    if (!assignmentId) {
      return NextResponse.json(
        { success: false, error: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    const [existingRows] = await connection.execute(
      `SELECT id FROM course_assignments WHERE id = ?`,
      [assignmentId]
    ) as any[];

    if (!existingRows || existingRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      );
    }

    await connection.execute(
      `DELETE FROM course_assignments WHERE id = ?`,
      [assignmentId]
    );

    return NextResponse.json({
      success: true,
      message: 'Assignment deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete assignment' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}