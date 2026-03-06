import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */
export async function POST(request: NextRequest) {
  let connection;
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const enrollmentId = formData.get('enrollmentId') as string;
    const studentId = formData.get('studentId') as string;
    const studentEmail = formData.get('studentEmail') as string;

    // ============ VALIDATION ============
    if (!file || !enrollmentId) {
      return NextResponse.json(
        { success: false, error: 'File and enrollment ID are required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Only JPG, PNG, and PDF files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    console.log('📤 Uploading payment slip for enrollment:', enrollmentId);

    // ============ UPLOAD TO CLOUDINARY ============
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('type', 'payment_slip');

    const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/upload/cloudinary`, {
      method: 'POST',
      body: cloudinaryFormData
    });

    const uploadResult = await uploadResponse.json();

    if (!uploadResponse.ok || !uploadResult.success) {
      throw new Error(uploadResult.error || 'Failed to upload file');
    }

    console.log('✅ File uploaded to Cloudinary:', uploadResult.data.secure_url);

    // ============ CONNECT DATABASE ============
    connection = await getConnection();

    // Check if enrollment exists
    const [enrollmentCheck] = await connection.execute(
      'SELECT id FROM enrollments WHERE id = ?',
      [enrollmentId]
    );

    if ((enrollmentCheck as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // ============ SAVE PAYMENT SLIP RECORD ============
    const slipId = uuidv4();
    await connection.execute(
      `INSERT INTO payment_slips (
        id, enrollment_id, student_id, slip_url, slip_public_id,
        file_name, file_size, uploaded_at, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 'pending')`,
      [
        slipId,
        enrollmentId,
        studentId || studentEmail,
        uploadResult.data.secure_url,
        uploadResult.data.public_id,
        file.name,
        file.size
      ]
    );

    // ============ UPDATE ENROLLMENT ============
    await connection.execute(
      `UPDATE enrollments SET
        slip_uploaded = TRUE,
        updated_at = NOW()
       WHERE id = ?`,
      [enrollmentId]
    );

    console.log('✅ Payment slip saved to database:', slipId);

    return NextResponse.json({
      success: true,
      data: {
        slipId,
        url: uploadResult.data.secure_url,
        enrollmentId
      },
      message: 'Payment slip uploaded successfully. Your enrollment is pending verification.'
    });

  } catch (error: any) {
    console.error('❌ Error uploading payment slip:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload slip' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}