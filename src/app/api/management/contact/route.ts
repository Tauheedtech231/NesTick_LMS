/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch contact section with all related data
export async function GET(request: NextRequest) {
  try {
    // Fetch main contact section
    const contactResult = await query<any[]>(`
      SELECT * FROM contact_section ORDER BY created_at DESC LIMIT 1
    `);

    if (contactResult.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    const contact = contactResult[0];
    
    // Fetch contact cards
    const cards = await query<any[]>(`
      SELECT * FROM contact_cards 
      WHERE contact_id = ? 
      ORDER BY display_order ASC
    `, [contact.id]);
    contact.cards = cards;

    // Fetch contact info
    const info = await query<any[]>(`
      SELECT * FROM contact_info 
      WHERE contact_id = ? 
      ORDER BY display_order ASC
    `, [contact.id]);
    contact.info = info;

    return NextResponse.json({ success: true, data: contact });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch contact section' }, { status: 500 });
  }
}

// POST - Create new contact section
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      hero_heading,
      hero_description,
      hero_button_text,
      hero_background_image,
      map_embed_url,
      cards,
      info
    } = body;

    const id = crypto.randomUUID();

    await query(
      `INSERT INTO contact_section (
        id, college_id, hero_heading, hero_description, 
        hero_button_text, hero_background_image, map_embed_url
      ) VALUES (?, NULL, ?, ?, ?, ?, ?)`,
      [id, hero_heading, hero_description, hero_button_text, hero_background_image, map_embed_url]
    );

    // Insert cards
    if (cards && cards.length > 0) {
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        await query(
          `INSERT INTO contact_cards (id, contact_id, card_type, title, value, icon_name, display_order)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [crypto.randomUUID(), id, card.card_type, card.title, card.value, card.icon_name, i]
        );
      }
    }

    // Insert info
    if (info && info.length > 0) {
      for (let i = 0; i < info.length; i++) {
        const item = info[i];
        await query(
          `INSERT INTO contact_info (id, contact_id, info_type, title, value, display_order)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [crypto.randomUUID(), id, item.info_type, item.title, item.value, i]
        );
      }
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create contact section' }, { status: 500 });
  }
}

// PUT - Update contact section
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      hero_heading,
      hero_description,
      hero_button_text,
      hero_background_image,
      map_embed_url,
      cards,
      info
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    // Update main contact section
    await query(
      `UPDATE contact_section 
       SET hero_heading = ?, hero_description = ?, 
           hero_button_text = ?, hero_background_image = ?, map_embed_url = ?
       WHERE id = ?`,
      [hero_heading, hero_description, hero_button_text, hero_background_image, map_embed_url, id]
    );

    // Update cards
    if (cards !== undefined) {
      await query(`DELETE FROM contact_cards WHERE contact_id = ?`, [id]);
      if (cards && cards.length > 0) {
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          await query(
            `INSERT INTO contact_cards (id, contact_id, card_type, title, value, icon_name, display_order)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [crypto.randomUUID(), id, card.card_type, card.title, card.value, card.icon_name, i]
          );
        }
      }
    }

    // Update info
    if (info !== undefined) {
      await query(`DELETE FROM contact_info WHERE contact_id = ?`, [id]);
      if (info && info.length > 0) {
        for (let i = 0; i < info.length; i++) {
          const item = info[i];
          await query(
            `INSERT INTO contact_info (id, contact_id, info_type, title, value, display_order)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [crypto.randomUUID(), id, item.info_type, item.title, item.value, i]
          );
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Contact section updated' });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update contact section' }, { status: 500 });
  }
}

// DELETE - Delete contact section
export async function DELETE(request: NextRequest) {
  try {
    await query(`DELETE FROM contact_section`);
    return NextResponse.json({ success: true, message: 'Contact section deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete contact section' }, { status: 500 });
  }
}