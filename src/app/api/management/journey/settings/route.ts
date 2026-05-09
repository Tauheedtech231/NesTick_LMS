/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch journey settings
export async function GET(request: NextRequest) {
  try {
    const settings = await query<any[]>(`
      SELECT * FROM journey_settings ORDER BY created_at DESC LIMIT 1
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

// PUT - Update journey settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, heading, heading_highlight, subheading } = body;

    if (!id) {
      const newId = crypto.randomUUID();
      await query(
        `INSERT INTO journey_settings (id, college_id, heading, heading_highlight, subheading)
         VALUES (?, NULL, ?, ?, ?)`,
        [newId, heading, heading_highlight, subheading]
      );
    } else {
      await query(
        `UPDATE journey_settings SET heading = ?, heading_highlight = ?, subheading = ? WHERE id = ?`,
        [heading, heading_highlight, subheading, id]
      );
    }

    return NextResponse.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
  }
}