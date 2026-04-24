/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  let connection;
  try {
    // IMPORTANT: Await params for Next.js 15
    const resolvedParams = await params;
    const questionId = resolvedParams.id;
    
    console.log('🗑️ Deleting question:', questionId);
    
    if (!questionId) {
      return NextResponse.json(
        { success: false, error: 'Question ID is required' },
        { status: 400 }
      );
    }
    
    connection = await getConnection();
    
    const [existingRows] = await connection.execute(
      `SELECT id FROM quiz_questions WHERE id = ?`,
      [questionId]
    ) as any[];
    
    if (!existingRows || existingRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Question not found' },
        { status: 404 }
      );
    }
    
    await connection.execute(
      `DELETE FROM quiz_questions WHERE id = ?`,
      [questionId]
    );
    
    console.log('✅ Question deleted:', questionId);
    
    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully'
    });
    
  } catch (error: any) {
    console.error('❌ Delete error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete question' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}