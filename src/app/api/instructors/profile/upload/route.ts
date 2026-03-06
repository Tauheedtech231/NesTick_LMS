import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v2 as cloudinary } from 'cloudinary';
/* eslint-disable */
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dfp9qc0gu',
  api_key: process.env.CLOUDINARY_API_KEY || '256561399931126',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'IDsMlP2lOykGLgLWKGgrhxiy01w'
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const profileId = formData.get('profileId') as string;

    if (!file || !profileId) {
      return NextResponse.json(
        { success: false, error: 'File and profile ID are required' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'instructor_profiles',
          public_id: `instructor_${profileId}_${Date.now()}`,
          resource_type: 'image'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Update profile with new image URL
    await query(
      'UPDATE instructors_profile SET profile_picture = ?, updated_at = NOW() WHERE id = ?',
      [(result as any).secure_url, profileId]
    );

    return NextResponse.json({
      success: true,
      data: {
        url: (result as any).secure_url
      },
      message: 'Profile picture updated successfully'
    });

  } catch (error: any) {
    console.error('Error uploading profile picture:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}