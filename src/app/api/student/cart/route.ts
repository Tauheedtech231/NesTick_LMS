/* eslint-disable @typescript-eslint/no-explicit-any */
// /app/api/student/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const studentEmail = searchParams.get('email');

    if (!studentEmail) {
      return NextResponse.json(
        { success: false, error: 'Student email is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // ✅ Updated query to include bundle fields
    const [rows] = await connection.execute(
      `SELECT 
        id, 
        course_id, 
        course_title, 
        course_price, 
        created_at,
        is_bundle_item,
        bundle_id,
        bundle_name,
        bundle_discounted_price,
        bundle_original_price,
        bundle_discount_percentage
       FROM cart_bucket
       WHERE student_email = ?
       ORDER BY created_at DESC`,
      [studentEmail]
    );

    // Process items to handle bundle pricing correctly
    const items = (rows as any[]).map((item) => {
      const isBundle = item.is_bundle_item === 1 || item.is_bundle_item === true;
      
      return {
        id: item.id,
        course_id: item.course_id,
        course_title: item.course_title,
        // ✅ For bundle items, use bundle_discounted_price instead of course_price
        course_price: isBundle ? (item.bundle_discounted_price || 0) : (Number(item.course_price) || 0),
        created_at: item.created_at,
        is_bundle_item: isBundle,
        bundle_id: item.bundle_id,
        bundle_name: item.bundle_name,
        bundle_discounted_price: item.bundle_discounted_price,
        bundle_original_price: item.bundle_original_price,
        bundle_discount_percentage: item.bundle_discount_percentage
      };
    });

    // Calculate total (bundle items already have their discounted price)
    const total = items.reduce((sum, item) => sum + (Number(item.course_price) || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        items,
        total,
        count: items.length
      }
    });

  } catch (error: any) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}