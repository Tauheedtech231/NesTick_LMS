/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch all hero slides
export async function GET(request: NextRequest) {
  try {
    const slides = await query<any[]>(`
      SELECT hs.* FROM hero_slides hs 
      WHERE hs.is_active = true 
      ORDER BY hs.slide_order ASC
    `);

    for (const slide of slides) {
      const images = await query<any[]>(
        `SELECT * FROM hero_slide_images 
         WHERE slide_id = ? 
         ORDER BY image_type, display_order ASC`,
        [slide.id]
      );
      
      slide.desktop_images = images.filter((img: any) => img.image_type === 'desktop');
      slide.mobile_images = images.filter((img: any) => img.image_type === 'mobile');
    }

    return NextResponse.json({ success: true, data: slides });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch slides' }, { status: 500 });
  }
}

// POST - Create new hero slide
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      subtitle,
      description,
      cta_text,
      cta_link,
      slide_order,
      desktop_images,
      mobile_images
    } = body;

    const id = crypto.randomUUID();

    await query(
      `INSERT INTO hero_slides (id, college_id, title, subtitle, description, cta_text, cta_link, slide_order)
       VALUES (?, NULL, ?, ?, ?, ?, ?, ?)`,
      [id, title, subtitle, description, cta_text, cta_link, slide_order || 0]
    );

    if (desktop_images && desktop_images.length > 0) {
      for (let i = 0; i < desktop_images.length; i++) {
        await query(
          `INSERT INTO hero_slide_images (id, slide_id, image_url, image_type, display_order)
           VALUES (?, ?, ?, 'desktop', ?)`,
          [crypto.randomUUID(), id, desktop_images[i], i]
        );
      }
    }

    if (mobile_images && mobile_images.length > 0) {
      for (let i = 0; i < mobile_images.length; i++) {
        await query(
          `INSERT INTO hero_slide_images (id, slide_id, image_url, image_type, display_order)
           VALUES (?, ?, ?, 'mobile', ?)`,
          [crypto.randomUUID(), id, mobile_images[i], i]
        );
      }
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create slide' }, { status: 500 });
  }
}

// ✅ ADD THIS - PUT method for updating slides
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      subtitle,
      description,
      cta_text,
      cta_link,
      slide_order,
      is_active,
      desktop_images,
      mobile_images
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Slide ID is required' }, { status: 400 });
    }

    // Update slide text
    await query(
      `UPDATE hero_slides 
       SET title = ?, subtitle = ?, description = ?, 
           cta_text = ?, cta_link = ?, slide_order = ?, is_active = ?
       WHERE id = ?`,
      [title, subtitle, description, cta_text, cta_link, slide_order, is_active, id]
    );

    // Update images - delete old ones and insert new
    if (desktop_images !== undefined || mobile_images !== undefined) {
      await query(`DELETE FROM hero_slide_images WHERE slide_id = ?`, [id]);

      if (desktop_images && desktop_images.length > 0) {
        for (let i = 0; i < desktop_images.length; i++) {
          await query(
            `INSERT INTO hero_slide_images (id, slide_id, image_url, image_type, display_order)
             VALUES (?, ?, ?, 'desktop', ?)`,
            [crypto.randomUUID(), id, desktop_images[i], i]
          );
        }
      }

      if (mobile_images && mobile_images.length > 0) {
        for (let i = 0; i < mobile_images.length; i++) {
          await query(
            `INSERT INTO hero_slide_images (id, slide_id, image_url, image_type, display_order)
             VALUES (?, ?, ?, 'mobile', ?)`,
            [crypto.randomUUID(), id, mobile_images[i], i]
          );
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Slide updated' });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update slide' }, { status: 500 });
  }
}

// DELETE - Delete all slides
// DELETE - Delete all slides (with proper error handling)
export async function DELETE(request: NextRequest) {
  try {
    console.log('DELETE all slides request');
    
    // First delete all images
    await query(`DELETE FROM hero_slide_images`);
    console.log('All images deleted');
    
    // Then delete all slides
    const result = await query(`DELETE FROM hero_slides`);
    console.log('All slides deleted:', result);
    
    return NextResponse.json({ 
      success: true, 
      message: 'All slides deleted successfully' 
    });
  } catch (error) {
    console.error('DELETE all error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete slides',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}