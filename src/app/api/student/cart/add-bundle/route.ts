/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/student/cart/add-bundle/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// ============ POST - Add Bundle as Single Cart Item ============
export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const {
      studentEmail,
      bundleId,
      bundleTitle,
      bundlePrice,
      bundleOriginalPrice,
      bundleDiscountPercentage,
      coursesInBundle
    } = body;

    // Validation
    if (!studentEmail) {
      return NextResponse.json(
        { success: false, error: 'Student email is required' },
        { status: 400 }
      );
    }

    if (!bundleId) {
      return NextResponse.json(
        { success: false, error: 'Bundle ID is required' },
        { status: 400 }
      );
    }

    if (!bundleTitle) {
      return NextResponse.json(
        { success: false, error: 'Bundle title is required' },
        { status: 400 }
      );
    }

    if (!bundlePrice || bundlePrice <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid bundle price is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Check if bundle already exists in cart for this student
    const [existingRows] = await connection.execute(
      `SELECT id FROM cart_bucket 
       WHERE student_email = ? AND bundle_id = ? AND is_bundle_item = 1`,
      [studentEmail, bundleId]
    ) as any[];

    if (existingRows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Bundle already in cart' },
        { status: 400 }
      );
    }

    // ✅ Add bundle as a SINGLE cart item
    const cartItemId = uuidv4();
    
    await connection.execute(
      `INSERT INTO cart_bucket 
       (id, student_email, course_id, course_title, course_price, 
        is_bundle_item, bundle_id, bundle_name, bundle_discounted_price,
        bundle_original_price, bundle_discount_percentage, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        cartItemId,
        studentEmail,
        bundleId,  // course_id stores bundle_id for bundle items
        bundleTitle,
        0,  // course_price is 0 for bundle items (price is in bundle_discounted_price)
        1,  // is_bundle_item = TRUE
        bundleId,
        bundleTitle,
        bundlePrice,
        bundleOriginalPrice || bundlePrice,
        bundleDiscountPercentage || 0
      ]
    );

    // Get updated cart count
    const [cartCountResult] = await connection.execute(
      `SELECT COUNT(*) as count FROM cart_bucket WHERE student_email = ?`,
      [studentEmail]
    ) as any[];

    return NextResponse.json({
      success: true,
      data: {
        cartItemId,
        bundleId,
        bundleTitle,
        bundlePrice,
        cartCount: cartCountResult[0].count
      },
      message: `Bundle "${bundleTitle}" added to cart successfully!`
    });

  } catch (error: any) {
    console.error('Error adding bundle to cart:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add bundle to cart' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

// ============ DELETE - Remove Bundle from Cart ============
export async function DELETE(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get('id');
    const email = searchParams.get('email');

    if (!cartId) {
      return NextResponse.json(
        { success: false, error: 'Cart item ID is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Delete the cart item
    await connection.execute(
      `DELETE FROM cart_bucket WHERE id = ?`,
      [cartId]
    );

    // Get updated cart count
    let updatedCount = 0;
    if (email) {
      const [cartCountResult] = await connection.execute(
        `SELECT COUNT(*) as count FROM cart_bucket WHERE student_email = ?`,
        [email]
      ) as any[];
      updatedCount = cartCountResult[0].count;
    }

    return NextResponse.json({
      success: true,
      data: { cartCount: updatedCount },
      message: 'Bundle removed from cart'
    });

  } catch (error: any) {
    console.error('Error removing bundle from cart:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to remove bundle' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}