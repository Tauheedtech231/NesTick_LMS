/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch single slide
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ← Promise type
) {
  try {
    const { id } = await params;  // ← await params
    
    const slides = await query<any[]>(
      `SELECT * FROM hero_slides WHERE id = ?`,
      [id]
    );

    if (slides.length === 0) {
      return NextResponse.json({ success: false, error: 'Slide not found' }, { status: 404 });
    }

    const slide = slides[0];
    const images = await query<any[]>(
      `SELECT * FROM hero_slide_images WHERE slide_id = ? ORDER BY image_type, display_order`,
      [id]
    );

    slide.desktop_images = images.filter((img: any) => img.image_type === 'desktop');
    slide.mobile_images = images.filter((img: any) => img.image_type === 'mobile');

    return NextResponse.json({ success: true, data: slide });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch slide' }, { status: 500 });
  }
}

// PUT - Update slide
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ← Promise type
) {
  try {
    const { id } = await params;  // ← await params
    const body = await request.json();
    const {
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

    // Check if slide exists
    const existingSlide = await query<any[]>(`SELECT id FROM hero_slides WHERE id = ?`, [id]);
    if (existingSlide.length === 0) {
      return NextResponse.json({ success: false, error: 'Slide not found' }, { status: 404 });
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

    return NextResponse.json({ success: true, message: 'Slide updated successfully' });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update slide',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Delete single slide
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ← Promise type
) {
  try {
    const { id } = await params;  // ← await params
    
    console.log('DELETE request for slide ID:', id);
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Slide ID is required' }, { status: 400 });
    }

    // Check if slide exists
    const slides = await query<any[]>(`SELECT id FROM hero_slides WHERE id = ?`, [id]);
    
    if (slides.length === 0) {
      console.log('Slide not found:', id);
      return NextResponse.json({ success: false, error: 'Slide not found' }, { status: 404 });
    }

    console.log('Slide found, proceeding to delete...');

    // Delete images first (manual cascade for safety)
    await query(`DELETE FROM hero_slide_images WHERE slide_id = ?`, [id]);

    // Then delete the slide
    await query(`DELETE FROM hero_slides WHERE id = ?`, [id]);

    return NextResponse.json({ 
      success: true, 
      message: 'Slide deleted successfully'
    });
  } catch (error) {
    console.error('DELETE error details:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete slide',
      details: error instanceof Error ? error.message : 'Unknown database error'
    }, { status: 500 });
  }
}