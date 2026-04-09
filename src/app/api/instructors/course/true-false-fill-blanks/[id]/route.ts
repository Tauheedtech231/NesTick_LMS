import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
/* eslint-disable */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('📌 DELETE - questionId:', id);

    if (!id) {
      return NextResponse.json({ success: false, error: 'Question ID required' }, { status: 400 });
    }

    await query('DELETE FROM tf_fill_questions WHERE id = ?', [id]);

    return NextResponse.json({ success: true, message: 'Question deleted successfully' });

  } catch (error: any) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}