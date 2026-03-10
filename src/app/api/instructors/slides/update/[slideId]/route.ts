import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slideId: string }> } // 👈 params is a Promise
) {
  let connection;
  
  try {
    console.log("\n========== 🔍 SLIDE UPDATE API CALLED ==========");
    
    // ✅ Await the params first (CRITICAL FIX)
    const { slideId } = await params;
    console.log("📍 Slide ID from params:", slideId);
    
    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log("📨 Request body:", body);
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const { title } = body;

    // Validation
    if (!slideId) {
      console.log("❌ Validation failed: Slide ID is missing");
      return NextResponse.json(
        { success: false, error: 'Slide ID is required' },
        { status: 400 }
      );
    }

    if (!title?.trim()) {
      console.log("❌ Validation failed: Title is missing or empty");
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    console.log("✅ Validation passed:");
    console.log("   - Slide ID:", slideId);
    console.log("   - Title:", title);

    // Get database connection
    console.log("🔌 Attempting to get database connection...");
    try {
      connection = await getConnection();
      console.log("✅ Database connection acquired successfully");
    } catch (connError) {
      console.error("❌ Failed to get database connection:", connError);
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Check if slide exists
    console.log("🔍 Checking if slide exists with ID:", slideId);
    let slides;
    try {
      [slides] = await connection.execute(
        `SELECT id, title, course_id, slide_number FROM course_slides WHERE id = ?`,
        [slideId]
      );
    } catch (queryError) {
      console.error("❌ Error checking slide existence:", queryError);
      return NextResponse.json(
        { success: false, error: 'Database query failed' },
        { status: 500 }
      );
    }

    if (!Array.isArray(slides) || slides.length === 0) {
      console.log("❌ Slide not found in database");
      connection.release();
      return NextResponse.json(
        { success: false, error: 'Slide not found' },
        { status: 404 }
      );
    }



    // Update slide title
    console.log("✏️ Attempting to update slide title...");
    let updateResult;
    try {
      [updateResult] = await connection.execute(
        `UPDATE course_slides 
         SET title = ?, updated_at = NOW() 
         WHERE id = ?`,
        [title.trim(), slideId]
      );
      
      console.log("📊 Update result - Affected rows:", (updateResult as any).affectedRows);
    } catch (updateError) {
      console.error("❌ Error updating slide:", updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update slide' },
        { status: 500 }
      );
    }

    // Check if update was successful
    if ((updateResult as any).affectedRows === 0) {
      console.log("⚠️ No rows affected by update");
      connection.release();
      return NextResponse.json(
        { success: false, error: 'No changes made to slide' },
        { status: 400 }
      );
    }

    // Get updated slide
    let updatedSlides;
    try {
      [updatedSlides] = await connection.execute(
        `SELECT * FROM course_slides WHERE id = ?`,
        [slideId]
      );
    } catch (fetchError) {
      console.error("❌ Error fetching updated slide:", fetchError);
      connection.release();
      return NextResponse.json(
        { success: true, message: 'Slide updated but failed to fetch updated data' },
        { status: 200 }
      );
    }

    const updatedSlide = Array.isArray(updatedSlides) ? updatedSlides[0] : null;
    
    console.log("✅ Update successful!");
    connection.release();
    console.log("✅ Database connection released");

    return NextResponse.json({
      success: true,
      message: 'Slide title updated successfully',
      data: updatedSlide
    });

  } catch (error: any) {
    console.error("\n========== ❌ UNEXPECTED ERROR ==========");
    console.error("Error:", error);
    
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error("❌ Error releasing connection:", releaseError);
      }
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}