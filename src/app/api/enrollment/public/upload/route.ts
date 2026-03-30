// app/api/payment/public/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';
import { sendPaymentVerificationEmail } from '@/lib/email';
/* eslint-disable */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dfp9qc0gu',
  api_key: process.env.CLOUDINARY_API_KEY || '256561399931126',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'IDsMlP2lOykGLgLWKGgrhxiy01w',
});

export async function POST(request: NextRequest) {
  let connection;
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const enrollmentId = formData.get('enrollmentId') as string;
    const studentEmail = formData.get('studentEmail') as string;

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

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'payment_slips',
          resource_type: 'auto',
          allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    connection = await getConnection();

    // Check if enrollment exists
    const [enrollmentCheck] = await connection.execute(
      'SELECT id, student_name, student_email FROM enrollments WHERE id = ?',
      [enrollmentId]
    );

    if ((enrollmentCheck as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    const enrollment = (enrollmentCheck as any[])[0];

    // Save payment slip
    const slipId = uuidv4();
    await connection.execute(
      `INSERT INTO payment_slips (
        id, enrollment_id, student_id, slip_url, slip_public_id,
        file_name, file_size, uploaded_at, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 'pending')`,
      [
        slipId,
        enrollmentId,
        enrollment.student_email,
        (uploadResult as any).secure_url,
        (uploadResult as any).public_id,
        file.name,
        file.size
      ]
    );

    // Update enrollment
    await connection.execute(
      `UPDATE enrollments SET
        slip_uploaded = TRUE,
        payment_status = 'pending',
        updated_at = NOW()
       WHERE id = ?`,
      [enrollmentId]
    );

    // Send confirmation email
    try {
      await sendPaymentVerificationEmail(
        enrollment.student_email,
        enrollment.student_name,
        enrollmentId,
        'pending'
      );
    } catch (emailError) {
      console.error('Email error:', emailError);
    }

    return NextResponse.json({
      success: true,
      data: {
        slipId,
        url: (uploadResult as any).secure_url,
        enrollmentId
      },
      message: 'Payment slip uploaded successfully. Your enrollment is pending verification.'
    });

  } catch (error: any) {
    console.error('Error uploading payment slip:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload slip' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}