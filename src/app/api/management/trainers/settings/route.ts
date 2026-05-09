/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch faculty settings
export async function GET(request: NextRequest) {
  try {
    const settings = await query<any[]>(`
      SELECT * FROM faculty_settings ORDER BY created_at DESC LIMIT 1
    `);

    if (settings.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ success: true, data: settings[0] });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT - Update faculty settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, badge_text, heading_prefix, heading_highlight, description } = body;

    if (!id) {
      // Create if not exists
      const newId = crypto.randomUUID();
      await query(
        `INSERT INTO faculty_settings (id, college_id, badge_text, heading_prefix, heading_highlight, description)
         VALUES (?, NULL, ?, ?, ?, ?)`,
        [newId, badge_text, heading_prefix, heading_highlight, description]
      );
    } else {
      await query(
        `UPDATE faculty_settings 
         SET badge_text = ?, heading_prefix = ?, heading_highlight = ?, description = ?
         WHERE id = ?`,
        [badge_text, heading_prefix, heading_highlight, description, id]
      );
    }

    return NextResponse.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
  }
}