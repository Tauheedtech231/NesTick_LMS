/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch all journey steps
export async function GET(request: NextRequest) {
  try {
    const steps = await query<any[]>(`
      SELECT * FROM journey_steps 
      WHERE is_active = true 
      ORDER BY display_order ASC
    `);

    return NextResponse.json({ success: true, data: steps });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch steps' }, { status: 500 });
  }
}

// POST - Create new journey step
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { step_number, title, description, display_order } = body;

    const id = crypto.randomUUID();

    await query(
      `INSERT INTO journey_steps (id, college_id, step_number, title, description, display_order, is_active)
       VALUES (?, NULL, ?, ?, ?, ?, true)`,
      [id, step_number, title, description, display_order || 0]
    );

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create step' }, { status: 500 });
  }
}

// PUT - Update journey step
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, step_number, title, description, display_order, is_active } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    await query(
      `UPDATE journey_steps 
       SET step_number = ?, title = ?, description = ?, display_order = ?, is_active = ?
       WHERE id = ?`,
      [step_number, title, description, display_order, is_active, id]
    );

    return NextResponse.json({ success: true, message: 'Step updated' });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update step' }, { status: 500 });
  }
}

// DELETE - Delete journey step
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    await query(`DELETE FROM journey_steps WHERE id = ?`, [id]);

    return NextResponse.json({ success: true, message: 'Step deleted' });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete step' }, { status: 500 });
  }
}