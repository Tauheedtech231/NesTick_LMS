/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// DELETE - Delete single trainer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const trainers = await query<any[]>(`SELECT id FROM trainers WHERE id = ?`, [id]);
    if (trainers.length === 0) {
      return NextResponse.json({ success: false, error: 'Trainer not found' }, { status: 404 });
    }

    await query(`DELETE FROM trainers WHERE id = ?`, [id]);
    
    return NextResponse.json({ success: true, message: 'Trainer deleted successfully' });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete trainer' }, { status: 500 });
  }
}