// /app/api/instructors/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
/* eslint-disable */
// Add this to prevent static generation for dynamic routes
export const dynamic = 'force-dynamic';

// --------------------- GET Handler ---------------------
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Await the params (Next.js 15+)
    const { id } = await params;

    if (!id) {
      console.warn('⚠️ Instructor ID not provided!');
      return NextResponse.json(
        { success: false, error: 'Instructor ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching instructor with ID:', id);

    const rows = await query(
      `SELECT 
         i.*,
         c.title AS course_title,
         c.duration AS course_duration,
         c.category AS course_category
       FROM instructors i
       LEFT JOIN courses c ON i.course_id = c.id
       WHERE i.id = ?`,
      [id]
    );

    if (!rows || (rows as any[]).length === 0) {
      console.warn('⚠️ Instructor not found for ID:', id);
      return NextResponse.json(
        { success: false, error: 'Instructor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: (rows as any[])[0],
    });

  } catch (error: any) {
    console.error('❌ Error fetching instructor:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch instructor' },
      { status: 500 }
    );
  }
}

// --------------------- PUT Handler ---------------------
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Await the params
    const { id } = await params;

    if (!id) {
      console.warn('⚠️ Instructor ID not provided for update!');
      return NextResponse.json(
        { success: false, error: 'Instructor ID is required' },
        { status: 400 }
      );
    }

    console.log('📝 Updating instructor ID:', id);

    const body = await request.json();
    const {
      name,
      phone,
      specialization,
      experience,
      qualification,
      bio,
      status,
      rating,
      courseId
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    // ✅ Check if instructor exists
    const existing = await query('SELECT id FROM instructors WHERE id = ?', [id]);
    if (!(existing as any[]).length) {
      console.warn('⚠️ Instructor not found for ID:', id);
      return NextResponse.json(
        { success: false, error: 'Instructor not found' },
        { status: 404 }
      );
    }

    // ✅ Update instructor
    const result = await query(
      `UPDATE instructors 
       SET name = ?, 
           phone = ?, 
           specialization = ?,
           experience = ?, 
           qualification = ?, 
           bio = ?, 
           status = ?,
           rating = ?, 
           course_id = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [
        name,
        phone || null,
        specialization || null,
        experience || null,
        qualification || null,
        bio || null,
        status || 'active',
        rating || 4.5,
        courseId || null,
        id
      ]
    );

    console.log('✅ Instructor updated:', id, result);

    // Fetch and return the updated instructor
    const updatedInstructor = await query(
      `SELECT 
         i.*,
         c.title AS course_title,
         c.duration AS course_duration,
         c.category AS course_category
       FROM instructors i
       LEFT JOIN courses c ON i.course_id = c.id
       WHERE i.id = ?`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: 'Instructor updated successfully',
      data: (updatedInstructor as any[])[0]
    });

  } catch (error: any) {
    console.error('❌ Error updating instructor:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update instructor' },
      { status: 500 }
    );
  }
}

// --------------------- DELETE Handler ---------------------
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Await the params
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Instructor ID is required' },
        { status: 400 }
      );
    }

    // Check if instructor exists
    const existing = await query('SELECT id FROM instructors WHERE id = ?', [id]);
    if (!(existing as any[]).length) {
      return NextResponse.json(
        { success: false, error: 'Instructor not found' },
        { status: 404 }
      );
    }

    // Delete instructor
    await query('DELETE FROM instructors WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Instructor deleted successfully'
    });

  } catch (error: any) {
    console.error('❌ Error deleting instructor:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete instructor' },
      { status: 500 }
    );
  }
}