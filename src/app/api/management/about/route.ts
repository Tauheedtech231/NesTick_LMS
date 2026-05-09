/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch about section with why choose items
export async function GET(request: NextRequest) {
  try {
    // Fetch main about content
    const aboutResult = await query<any[]>(`
      SELECT * FROM about_section ORDER BY created_at DESC LIMIT 1
    `);

    if (aboutResult.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    const about = aboutResult[0];
    
    // Fetch why choose items
    const whyChooseItems = await query<any[]>(`
      SELECT * FROM why_choose_items 
      WHERE about_id = ? 
      ORDER BY display_order ASC
    `, [about.id]);

    about.why_choose_items = whyChooseItems;

    return NextResponse.json({ success: true, data: about });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch about section' }, { status: 500 });
  }
}

// POST - Create new about section
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      heading,
      description,
      mission_title,
      mission_description,
      vision_title,
      vision_description,
      cta_text,
      cta_link,
      background_image,
      why_choose_items
    } = body;

    const id = crypto.randomUUID();

    await query(
      `INSERT INTO about_section (
        id, college_id, heading, description, 
        mission_title, mission_description,
        vision_title, vision_description,
        cta_text, cta_link, background_image
      ) VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, heading, description, mission_title, mission_description, 
       vision_title, vision_description, cta_text, cta_link, background_image || null]
    );

    // Insert why choose items
    if (why_choose_items && why_choose_items.length > 0) {
      for (let i = 0; i < why_choose_items.length; i++) {
        const item = why_choose_items[i];
        await query(
          `INSERT INTO why_choose_items (id, about_id, title, description, display_order)
           VALUES (?, ?, ?, ?, ?)`,
          [crypto.randomUUID(), id, item.title, item.description, i]
        );
      }
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create about section' }, { status: 500 });
  }
}

// PUT - Update about section
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      heading,
      description,
      mission_title,
      mission_description,
      vision_title,
      vision_description,
      cta_text,
      cta_link,
      background_image,
      why_choose_items
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    // Update main about section
    await query(
      `UPDATE about_section 
       SET heading = ?, description = ?, 
           mission_title = ?, mission_description = ?,
           vision_title = ?, vision_description = ?,
           cta_text = ?, cta_link = ?, background_image = ?
       WHERE id = ?`,
      [heading, description, mission_title, mission_description, 
       vision_title, vision_description, cta_text, cta_link, background_image || null, id]
    );

    // Update why choose items - delete old and insert new
    if (why_choose_items !== undefined) {
      await query(`DELETE FROM why_choose_items WHERE about_id = ?`, [id]);

      if (why_choose_items && why_choose_items.length > 0) {
        for (let i = 0; i < why_choose_items.length; i++) {
          const item = why_choose_items[i];
          await query(
            `INSERT INTO why_choose_items (id, about_id, title, description, display_order)
             VALUES (?, ?, ?, ?, ?)`,
            [crypto.randomUUID(), id, item.title, item.description, i]
          );
        }
      }
    }

    return NextResponse.json({ success: true, message: 'About section updated' });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update about section' }, { status: 500 });
  }
}

// DELETE - Delete about section
export async function DELETE(request: NextRequest) {
  try {
    await query(`DELETE FROM about_section`);
    return NextResponse.json({ success: true, message: 'About section deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete about section' }, { status: 500 });
  }
}