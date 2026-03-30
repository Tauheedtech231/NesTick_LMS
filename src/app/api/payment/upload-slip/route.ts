// app/api/payment/upload-slip/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';
/* eslint-disable @typescript-eslint/no-explicit-any */
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dfp9qc0gu',
  api_key: process.env.CLOUDINARY_API_KEY || '256561399931126',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'IDsMlP2lOykGLgLWKGgrhxiy01w',
});

export async function POST(request: NextRequest) {
  let connection;
  try {
    console.log('📤 Starting payment slip upload...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const enrollmentId = formData.get('enrollmentId') as string;
    const studentId = formData.get('studentId') as string;
    const studentEmail = formData.get('studentEmail') as string;
    const enrollmentData = formData.get('enrollmentData') as string; // New: Get enrollment data

    console.log('Received data:', { enrollmentId, studentId, studentEmail, fileName: file?.name, hasEnrollmentData: !!enrollmentData });

    // Validation
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!enrollmentId) {
      return NextResponse.json(
        { success: false, error: 'Enrollment ID is required' },
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

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('📤 Uploading to Cloudinary...');

    // Upload to Cloudinary
    let uploadResult;
    try {
      uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'payment_slips',
            resource_type: 'auto',
            allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
            max_bytes: 5 * 1024 * 1024,
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        
        uploadStream.end(buffer);
      });
    } catch (cloudinaryError) {
      console.error('Cloudinary upload failed:', cloudinaryError);
      return NextResponse.json(
        { success: false, error: 'Failed to upload file to cloud storage' },
        { status: 500 }
      );
    }

    console.log('✅ File uploaded to Cloudinary:', (uploadResult as any).secure_url);

    // Connect to database
    try {
      connection = await getConnection();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Check if enrollment exists in database
    let enrollmentExists = false;
    try {
      const [enrollmentCheck] = await connection.execute(
        'SELECT id, payment_status FROM enrollments WHERE id = ?',
        [enrollmentId]
      );
      enrollmentExists = (enrollmentCheck as any[]).length > 0;
      console.log('Enrollment exists in DB:', enrollmentExists);
    } catch (checkError) {
      console.error('Error checking enrollment:', checkError);
    }

    // Start transaction
    await connection.beginTransaction();

    try {
      let finalEnrollmentId = enrollmentId;

      // If enrollment doesn't exist in database, create it from the provided data
      if (!enrollmentExists && enrollmentData) {
        console.log('Creating enrollment from provided data...');
        const enrollmentDataObj = JSON.parse(enrollmentData);
        
        // Create enrollment records for each course
        for (const course of enrollmentDataObj.courses) {
          const newEnrollmentId = uuidv4();
          finalEnrollmentId = newEnrollmentId;
          
          await connection.execute(
            `INSERT INTO enrollments (
              id, student_id, student_email, student_name, student_phone,
              student_cnic, student_address, student_education, student_experience,
              cnic_front_url, cnic_back_url, educational_doc_url,
              course_id, course_title, course_price,
              enrollment_date, status, payment_status, payment_amount,
              slip_uploaded, voucher_generated, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
              newEnrollmentId,
              enrollmentDataObj.studentDetails.student_email,
              enrollmentDataObj.studentDetails.student_email,
              enrollmentDataObj.studentDetails.student_name,
              enrollmentDataObj.studentDetails.student_phone,
              enrollmentDataObj.studentDetails.student_cnic,
              enrollmentDataObj.studentDetails.student_address || null,
              enrollmentDataObj.studentDetails.student_education || null,
              enrollmentDataObj.studentDetails.student_experience || null,
              enrollmentDataObj.documents.cnic_front?.url || null,
              enrollmentDataObj.documents.cnic_back?.url || null,
              enrollmentDataObj.documents.educational_doc?.url || null,
              course.id,
              course.course_title,
              course.course_price,
              'pending',
              'pending',
              course.course_price,
              false,
              true
            ]
          );
        }
        
        console.log('✅ Enrollment created in database');
      }

      // Save payment slip record
      const slipId = uuidv4();
      await connection.execute(
        `INSERT INTO payment_slips (
          id, enrollment_id, student_id, slip_url, slip_public_id,
          file_name, file_size, uploaded_at, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 'pending')`,
        [
          slipId,
          finalEnrollmentId,
          studentId || studentEmail,
          (uploadResult as any).secure_url,
          (uploadResult as any).public_id,
          file.name,
          file.size
        ]
      );

      // Update enrollment to mark slip uploaded
      await connection.execute(
        `UPDATE enrollments SET
          slip_uploaded = TRUE,
          payment_status = 'pending',
          updated_at = NOW()
         WHERE id = ?`,
        [finalEnrollmentId]
      );

      await connection.commit();

      console.log('✅ Payment slip saved to database:', slipId);

      return NextResponse.json({
        success: true,
        data: {
          slipId,
          url: (uploadResult as any).secure_url,
          enrollmentId: finalEnrollmentId
        },
        message: 'Payment slip uploaded successfully. Your enrollment is pending verification.'
      });

    } catch (dbError) {
      await connection.rollback();
      console.error('Database insert error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Failed to save payment slip record: ' + (dbError as Error).message },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ Error uploading payment slip:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload slip' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('Error releasing connection:', releaseError);
      }
    }
  }
}