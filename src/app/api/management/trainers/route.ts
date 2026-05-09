/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch all trainers with certifications
export async function GET(request: NextRequest) {
  try {
    const trainers = await query<any[]>(`
      SELECT * FROM trainers 
      WHERE is_active = true 
      ORDER BY display_order ASC
    `);

    // Fetch certifications for each trainer
    for (const trainer of trainers) {
      const certifications = await query<any[]>(
        `SELECT certification FROM trainer_certifications 
         WHERE trainer_id = ? 
         ORDER BY display_order ASC`,
        [trainer.id]
      );
      trainer.certifications = certifications.map(c => c.certification);
    }

    return NextResponse.json({ success: true, data: trainers });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch trainers' }, { status: 500 });
  }
}

// POST - Create new trainer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      role,
      expertise,
      experience,
      image_url,
      students_trained,
      training_style,
      certifications,
      display_order
    } = body;

    const id = crypto.randomUUID();

    await query(
      `INSERT INTO trainers (id, college_id, name, role, expertise, experience, image_url, students_trained, training_style, display_order)
       VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, role, expertise, experience, image_url, students_trained, training_style, display_order || 0]
    );

    // Insert certifications
    if (certifications && certifications.length > 0) {
      for (let i = 0; i < certifications.length; i++) {
        await query(
          `INSERT INTO trainer_certifications (id, trainer_id, certification, display_order)
           VALUES (?, ?, ?, ?)`,
          [crypto.randomUUID(), id, certifications[i], i]
        );
      }
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create trainer' }, { status: 500 });
  }
}

// PUT - Update trainer
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      role,
      expertise,
      experience,
      image_url,
      students_trained,
      training_style,
      certifications,
      display_order,
      is_active
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    await query(
      `UPDATE trainers 
       SET name = ?, role = ?, expertise = ?, experience = ?, 
           image_url = ?, students_trained = ?, training_style = ?, 
           display_order = ?, is_active = ?
       WHERE id = ?`,
      [name, role, expertise, experience, image_url, students_trained, training_style, display_order, is_active, id]
    );

    // Update certifications
    if (certifications !== undefined) {
      await query(`DELETE FROM trainer_certifications WHERE trainer_id = ?`, [id]);
      if (certifications && certifications.length > 0) {
        for (let i = 0; i < certifications.length; i++) {
          await query(
            `INSERT INTO trainer_certifications (id, trainer_id, certification, display_order)
             VALUES (?, ?, ?, ?)`,
            [crypto.randomUUID(), id, certifications[i], i]
          );
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Trainer updated' });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update trainer' }, { status: 500 });
  }
}

// DELETE - Delete all trainers
export async function DELETE(request: NextRequest) {
  try {
    await query(`DELETE FROM trainers`);
    return NextResponse.json({ success: true, message: 'All trainers deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete trainers' }, { status: 500 });
  }
}