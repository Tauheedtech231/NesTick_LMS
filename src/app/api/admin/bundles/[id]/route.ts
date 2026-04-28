/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // IMPORTANT: In Next.js 15+, params is a Promise - need to await it
    const resolvedParams = await params;
    const bundleId = resolvedParams.id;

    console.log('Fetching bundle with ID:', bundleId);

    if (!bundleId) {
      return NextResponse.json(
        { success: false, error: 'Bundle ID is required' },
        { status: 400 }
      );
    }

    // Fetch bundle details from course_bundles table (correct table name)
    const bundleResult = await query(
      `SELECT 
        cb.id, 
        cb.title, 
        cb.description, 
        cb.original_price, 
        cb.discounted_price, 
        cb.discount_percentage, 
        cb.total_courses, 
        cb.status, 
        cb.image, 
        cb.created_at
      FROM course_bundles cb
      WHERE cb.id = ? AND cb.status = 'active'`,
      [bundleId]
    );

    console.log('Bundle query result:', bundleResult);

    // Check if bundle exists (handle array response from mysql2)
    const bundles = Array.isArray(bundleResult) ? bundleResult : (bundleResult as any).rows || [];
    
    if (bundles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Bundle not found' },
        { status: 404 }
      );
    }

    const bundle = bundles[0];

    // Fetch courses in this bundle from instructor_course table (correct table name)
    const coursesResult = await query(
      `SELECT 
        ic.id, 
        ic.title, 
        ic.description, 
        ic.duration, 
        ic.level, 
        ic.category,
        ic.price,
        ic.original_price,
        ic.image
      FROM bundle_courses bc
      JOIN instructor_course ic ON bc.course_id = ic.id
      WHERE bc.bundle_id = ? AND ic.status = 'published'
      ORDER BY bc.display_order ASC`,
      [bundleId]
    );

    // Handle courses result
    const courses = Array.isArray(coursesResult) ? coursesResult : (coursesResult as any).rows || [];
    
    bundle.courses = courses;
    bundle.total_courses = courses.length;

    // Calculate total original price if courses exist
    if (courses.length > 0 && !bundle.original_price) {
      bundle.original_price = courses.reduce((sum: number, course: any) => {
        return sum + (Number(course.price) || 0);
      }, 0);
    }

    // Calculate discount percentage if not set
    if (!bundle.discount_percentage && bundle.original_price && bundle.discounted_price) {
      bundle.discount_percentage = Math.round(
        ((bundle.original_price - bundle.discounted_price) / bundle.original_price) * 100
      );
    }

    return NextResponse.json({
      success: true,
      data: bundle
    });
  } catch (error) {
    console.error('Error fetching bundle:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}