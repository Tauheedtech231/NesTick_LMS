/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch footer section with all related data
export async function GET(request: NextRequest) {
  try {
    const footerResult = await query<any[]>(`
      SELECT * FROM footer_section ORDER BY created_at DESC LIMIT 1
    `);

    if (footerResult.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    const footer = footerResult[0];
    
    const socialLinks = await query<any[]>(
      `SELECT * FROM footer_social_links WHERE footer_id = ? ORDER BY display_order ASC`,
      [footer.id]
    );
    footer.socialLinks = socialLinks;

    const quickLinks = await query<any[]>(
      `SELECT * FROM footer_quick_links WHERE footer_id = ? ORDER BY display_order ASC`,
      [footer.id]
    );
    footer.quickLinks = quickLinks;

    const programs = await query<any[]>(
      `SELECT * FROM footer_programs WHERE footer_id = ? ORDER BY display_order ASC`,
      [footer.id]
    );
    footer.programs = programs;

    const contactInfo = await query<any[]>(
      `SELECT * FROM footer_contact_info WHERE footer_id = ? ORDER BY display_order ASC`,
      [footer.id]
    );
    footer.contactInfo = contactInfo;

    return NextResponse.json({ success: true, data: footer });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch footer' }, { status: 500 });
  }
}

// POST - Create new footer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      logo_url,
      about_text,
      copyright_text,
      socialLinks,
      quickLinks,
      programs,
      contactInfo
    } = body;

    const id = crypto.randomUUID();

    await query(
      `INSERT INTO footer_section (id, college_id, logo_url, about_text, copyright_text)
       VALUES (?, NULL, ?, ?, ?)`,
      [id, logo_url, about_text, copyright_text]
    );

    if (socialLinks && socialLinks.length > 0) {
      for (let i = 0; i < socialLinks.length; i++) {
        const item = socialLinks[i];
        await query(
          `INSERT INTO footer_social_links (id, footer_id, platform, url, icon_name, bg_color, display_order)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [crypto.randomUUID(), id, item.platform, item.url, item.icon_name, item.bg_color, i]
        );
      }
    }

    if (quickLinks && quickLinks.length > 0) {
      for (let i = 0; i < quickLinks.length; i++) {
        const item = quickLinks[i];
        await query(
          `INSERT INTO footer_quick_links (id, footer_id, title, url, display_order)
           VALUES (?, ?, ?, ?, ?)`,
          [crypto.randomUUID(), id, item.title, item.url, i]
        );
      }
    }

    if (programs && programs.length > 0) {
      for (let i = 0; i < programs.length; i++) {
        const item = programs[i];
        await query(
          `INSERT INTO footer_programs (id, footer_id, title, url, display_order)
           VALUES (?, ?, ?, ?, ?)`,
          [crypto.randomUUID(), id, item.title, item.url, i]
        );
      }
    }

    if (contactInfo && contactInfo.length > 0) {
      for (let i = 0; i < contactInfo.length; i++) {
        const item = contactInfo[i];
        await query(
          `INSERT INTO footer_contact_info (id, footer_id, contact_type, label, value, url, display_order)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [crypto.randomUUID(), id, item.contact_type, item.label, item.value, item.url || null, i]
        );
      }
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create footer' }, { status: 500 });
  }
}

// PUT - Update footer
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      logo_url,
      about_text,
      copyright_text,
      socialLinks,
      quickLinks,
      programs,
      contactInfo
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    await query(
      `UPDATE footer_section 
       SET logo_url = ?, about_text = ?, copyright_text = ?
       WHERE id = ?`,
      [logo_url, about_text, copyright_text, id]
    );

    if (socialLinks !== undefined) {
      await query(`DELETE FROM footer_social_links WHERE footer_id = ?`, [id]);
      if (socialLinks && socialLinks.length > 0) {
        for (let i = 0; i < socialLinks.length; i++) {
          const item = socialLinks[i];
          await query(
            `INSERT INTO footer_social_links (id, footer_id, platform, url, icon_name, bg_color, display_order)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [crypto.randomUUID(), id, item.platform, item.url, item.icon_name, item.bg_color, i]
          );
        }
      }
    }

    if (quickLinks !== undefined) {
      await query(`DELETE FROM footer_quick_links WHERE footer_id = ?`, [id]);
      if (quickLinks && quickLinks.length > 0) {
        for (let i = 0; i < quickLinks.length; i++) {
          const item = quickLinks[i];
          await query(
            `INSERT INTO footer_quick_links (id, footer_id, title, url, display_order)
             VALUES (?, ?, ?, ?, ?)`,
            [crypto.randomUUID(), id, item.title, item.url, i]
          );
        }
      }
    }

    if (programs !== undefined) {
      await query(`DELETE FROM footer_programs WHERE footer_id = ?`, [id]);
      if (programs && programs.length > 0) {
        for (let i = 0; i < programs.length; i++) {
          const item = programs[i];
          await query(
            `INSERT INTO footer_programs (id, footer_id, title, url, display_order)
             VALUES (?, ?, ?, ?, ?)`,
            [crypto.randomUUID(), id, item.title, item.url, i]
          );
        }
      }
    }

    if (contactInfo !== undefined) {
      await query(`DELETE FROM footer_contact_info WHERE footer_id = ?`, [id]);
      if (contactInfo && contactInfo.length > 0) {
        for (let i = 0; i < contactInfo.length; i++) {
          const item = contactInfo[i];
          await query(
            `INSERT INTO footer_contact_info (id, footer_id, contact_type, label, value, url, display_order)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [crypto.randomUUID(), id, item.contact_type, item.label, item.value, item.url || null, i]
          );
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Footer updated' });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update footer' }, { status: 500 });
  }
}

// DELETE - Delete footer
export async function DELETE(request: NextRequest) {
  try {
    await query(`DELETE FROM footer_section`);
    return NextResponse.json({ success: true, message: 'Footer deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete footer' }, { status: 500 });
  }
}