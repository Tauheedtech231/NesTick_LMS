import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */
export async function POST(request: NextRequest) {
  try {
    const { slideId, courseId, files } = await request.json();

    if (!slideId || !courseId || !files || !Array.isArray(files)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('📎 Saving files for slide:', slideId);

    // Delete existing files for this slide
    await query('DELETE FROM slide_files WHERE slide_id = ?', [slideId]);

    // Insert new files
    for (const file of files) {
      await query(
        `INSERT INTO slide_files 
         (id, slide_id, course_id, file_name, file_type, file_size, file_url, public_id, uploaded_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          file.id || uuidv4(),
          slideId,
          courseId,
          file.name,
          file.type,
          file.size,
          file.url,
          file.publicId
        ]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Files saved successfully'
    });

  } catch (error: any) {
    console.error('Error saving files:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save files' },
      { status: 500 }
    );
  }
}