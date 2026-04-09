// app/api/instructors/course/update-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v2 as cloudinary } from 'cloudinary';
/* eslint-disable */

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dfp9qc0gu',
  api_key: process.env.CLOUDINARY_API_KEY || '256561399931126',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'IDsMlP2lOykGLgLWKGgrhxiy01w',
});

export async function PUT(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const { courseId, imageUrl, oldImagePublicId } = body;

    console.log('📝 Updating course image:', { courseId, imageUrl });

    if (!courseId || !imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Course ID and image URL are required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Check if course exists
    const [courses] = await connection.execute(
      'SELECT id, image FROM instructor_course WHERE id = ?',
      [courseId]
    );

    if ((courses as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    const oldImage = (courses as any[])[0].image;
    
    // Update course image in database
    await connection.execute(
      `UPDATE instructor_course SET image = ?, updated_at = NOW() WHERE id = ?`,
      [imageUrl, courseId]
    );

    // Delete old image from Cloudinary (if exists and different from new)
    if (oldImage && oldImage !== imageUrl && oldImagePublicId) {
      try {
        await cloudinary.uploader.destroy(oldImagePublicId);
        console.log('🗑️ Old image deleted from Cloudinary:', oldImagePublicId);
      } catch (cloudinaryError) {
        console.error('Error deleting old image from Cloudinary:', cloudinaryError);
        // Don't fail the request if Cloudinary delete fails
      }
    }

    console.log('✅ Course image updated successfully');

    return NextResponse.json({
      success: true,
      data: { imageUrl },
      message: 'Course image updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating course image:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update course image' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}