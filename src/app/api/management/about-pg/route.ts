/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch about section with all items
export async function GET(request: NextRequest) {
  try {
    const aboutResult = await query<any[]>(`
      SELECT * FROM about_section_pg ORDER BY created_at DESC LIMIT 1
    `);

    if (aboutResult.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    const about = aboutResult[0];
    
    const missionItems = await query<any[]>(
      `SELECT * FROM mission_items_pg WHERE about_id = ? ORDER BY display_order ASC`,
      [about.id]
    );
    about.mission_items = missionItems.map((i: any) => i.item_text);

    const visionItems = await query<any[]>(
      `SELECT * FROM vision_items_pg WHERE about_id = ? ORDER BY display_order ASC`,
      [about.id]
    );
    about.vision_items = visionItems.map((i: any) => i.item_text);

    const whyChooseItems = await query<any[]>(
      `SELECT * FROM why_choose_items_pg WHERE about_id = ? ORDER BY display_order ASC`,
      [about.id]
    );
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
      hero_heading,
      hero_description,
      hero_button_text,
      hero_button_link,
      hero_video_url,
      mission_title,
      vision_title,
      why_choose_heading,
      why_choose_subheading,
      mission_items,
      vision_items,
      why_choose_items
    } = body;

    const id = crypto.randomUUID();

    await query(
      `INSERT INTO about_section_pg (
        id, college_id, hero_heading, hero_description, hero_button_text, 
        hero_button_link, hero_video_url, mission_title, vision_title, 
        why_choose_heading, why_choose_subheading
      ) VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, hero_heading, hero_description, hero_button_text, hero_button_link, 
       hero_video_url, mission_title, vision_title, why_choose_heading, why_choose_subheading]
    );

    if (mission_items && mission_items.length > 0) {
      for (let i = 0; i < mission_items.length; i++) {
        await query(
          `INSERT INTO mission_items_pg (id, about_id, item_text, display_order) VALUES (?, ?, ?, ?)`,
          [crypto.randomUUID(), id, mission_items[i], i]
        );
      }
    }

    if (vision_items && vision_items.length > 0) {
      for (let i = 0; i < vision_items.length; i++) {
        await query(
          `INSERT INTO vision_items_pg (id, about_id, item_text, display_order) VALUES (?, ?, ?, ?)`,
          [crypto.randomUUID(), id, vision_items[i], i]
        );
      }
    }

    if (why_choose_items && why_choose_items.length > 0) {
      for (let i = 0; i < why_choose_items.length; i++) {
        const item = why_choose_items[i];
        await query(
          `INSERT INTO why_choose_items_pg (id, about_id, title, description, display_order) VALUES (?, ?, ?, ?, ?)`,
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
      hero_heading,
      hero_description,
      hero_button_text,
      hero_button_link,
      hero_video_url,
      mission_title,
      vision_title,
      why_choose_heading,
      why_choose_subheading,
      mission_items,
      vision_items,
      why_choose_items
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    await query(
      `UPDATE about_section_pg 
       SET hero_heading = ?, hero_description = ?, hero_button_text = ?, 
           hero_button_link = ?, hero_video_url = ?, mission_title = ?, 
           vision_title = ?, why_choose_heading = ?, why_choose_subheading = ?
       WHERE id = ?`,
      [hero_heading, hero_description, hero_button_text, hero_button_link, 
       hero_video_url, mission_title, vision_title, why_choose_heading, why_choose_subheading, id]
    );

    // Update mission items
    if (mission_items !== undefined) {
      await query(`DELETE FROM mission_items_pg WHERE about_id = ?`, [id]);
      if (mission_items && mission_items.length > 0) {
        for (let i = 0; i < mission_items.length; i++) {
          await query(
            `INSERT INTO mission_items_pg (id, about_id, item_text, display_order) VALUES (?, ?, ?, ?)`,
            [crypto.randomUUID(), id, mission_items[i], i]
          );
        }
      }
    }

    // Update vision items
    if (vision_items !== undefined) {
      await query(`DELETE FROM vision_items_pg WHERE about_id = ?`, [id]);
      if (vision_items && vision_items.length > 0) {
        for (let i = 0; i < vision_items.length; i++) {
          await query(
            `INSERT INTO vision_items_pg (id, about_id, item_text, display_order) VALUES (?, ?, ?, ?)`,
            [crypto.randomUUID(), id, vision_items[i], i]
          );
        }
      }
    }

    // Update why choose items
    if (why_choose_items !== undefined) {
      await query(`DELETE FROM why_choose_items_pg WHERE about_id = ?`, [id]);
      if (why_choose_items && why_choose_items.length > 0) {
        for (let i = 0; i < why_choose_items.length; i++) {
          const item = why_choose_items[i];
          await query(
            `INSERT INTO why_choose_items_pg (id, about_id, title, description, display_order) VALUES (?, ?, ?, ?, ?)`,
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
    await query(`DELETE FROM about_section_pg`);
    return NextResponse.json({ success: true, message: 'About section deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete about section' }, { status: 500 });
  }
}