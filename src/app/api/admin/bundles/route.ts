/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// ============ GET - Fetch all bundles ============
export async function GET(request: NextRequest) {
  let connection;
  try {
    connection = await getConnection();

    const [bundles] = await connection.execute(
      `SELECT 
        cb.id,
        cb.title,
        cb.description,
        cb.image,
        cb.discount_percentage,
        cb.discounted_price,
        cb.original_price,
        cb.status,
        cb.created_by,
        cb.created_at,
        cb.updated_at,
        COUNT(bc.course_id) as total_courses
      FROM course_bundles cb
      LEFT JOIN bundle_courses bc ON cb.id = bc.bundle_id
      GROUP BY cb.id
      ORDER BY cb.created_at DESC`
    ) as any[];

    // Fetch courses for each bundle
    for (const bundle of bundles) {
      const [courses] = await connection.execute(
        `SELECT 
          ic.id,
          ic.title,
          ic.price,
          ic.image
        FROM bundle_courses bc
        JOIN instructor_course ic ON bc.course_id = ic.id
        WHERE bc.bundle_id = ?`,
        [bundle.id]
      ) as any[];
      bundle.courses = courses;
    }

    return NextResponse.json({
      success: true,
      data: bundles
    });

  } catch (error: any) {
    console.error('Error fetching bundles:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

// ============ POST - Create new bundle ============
export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const { title, description, image, discount_percentage, discounted_price, original_price, course_ids, status, created_by } = body;

    if (!title || !course_ids || course_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Title and at least one course are required' },
        { status: 400 }
      );
    }

    connection = await getConnection();
    const bundleId = uuidv4();

    // Insert bundle with image
    await connection.execute(
      `INSERT INTO course_bundles 
       (id, title, description, image, discount_percentage, discounted_price, original_price, total_courses, status, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [bundleId, title, description || '', image || null, discount_percentage || 0, discounted_price || 0, original_price || 0, course_ids.length, status || 'active', created_by || 'admin']
    );

    // Insert bundle courses
    for (let i = 0; i < course_ids.length; i++) {
      await connection.execute(
        `INSERT INTO bundle_courses (id, bundle_id, course_id, display_order, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [uuidv4(), bundleId, course_ids[i], i]
      );
    }

    // Fetch created bundle
    const [newBundleRows] = await connection.execute(
      `SELECT * FROM course_bundles WHERE id = ?`,
      [bundleId]
    ) as any[];

    const newBundle = newBundleRows[0];

    return NextResponse.json({
      success: true,
      data: newBundle,
      message: 'Bundle created successfully'
    });

  } catch (error: any) {
    console.error('Error creating bundle:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

// ============ PUT - Update existing bundle ============
export async function PUT(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const bundleId = searchParams.get('id');
    
    if (!bundleId) {
      return NextResponse.json(
        { success: false, error: 'Bundle ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, image, discount_percentage, discounted_price, original_price, course_ids, status } = body;

    if (!title || !course_ids || course_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Title and at least one course are required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Check if bundle exists
    const [existingRows] = await connection.execute(
      `SELECT id FROM course_bundles WHERE id = ?`,
      [bundleId]
    ) as any[];
    
    if (existingRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Bundle not found' },
        { status: 404 }
      );
    }

    // Update bundle with image
    await connection.execute(
      `UPDATE course_bundles 
       SET title = ?, description = ?, image = ?, discount_percentage = ?, discounted_price = ?, 
           original_price = ?, total_courses = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      [title, description || '', image || null, discount_percentage || 0, discounted_price || 0, original_price || 0, course_ids.length, status || 'active', bundleId]
    );

    // Delete existing bundle courses
    await connection.execute(
      `DELETE FROM bundle_courses WHERE bundle_id = ?`,
      [bundleId]
    );

    // Insert updated bundle courses
    for (let i = 0; i < course_ids.length; i++) {
      await connection.execute(
        `INSERT INTO bundle_courses (id, bundle_id, course_id, display_order, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [uuidv4(), bundleId, course_ids[i], i]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bundle updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating bundle:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

// ============ DELETE - Delete bundle ============
export async function DELETE(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const bundleId = searchParams.get('id');
    
    if (!bundleId) {
      return NextResponse.json(
        { success: false, error: 'Bundle ID is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Check if bundle exists
    const [existingRows] = await connection.execute(
      `SELECT id FROM course_bundles WHERE id = ?`,
      [bundleId]
    ) as any[];
    
    if (existingRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Bundle not found' },
        { status: 404 }
      );
    }

    // Delete bundle courses first (foreign key)
    await connection.execute(
      `DELETE FROM bundle_courses WHERE bundle_id = ?`,
      [bundleId]
    );

    // Delete bundle
    await connection.execute(
      `DELETE FROM course_bundles WHERE id = ?`,
      [bundleId]
    );

    return NextResponse.json({
      success: true,
      message: 'Bundle deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting bundle:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}