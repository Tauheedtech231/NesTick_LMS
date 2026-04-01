// app/api/payment/upload-slip/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';
import { sendPaymentVerificationEmail } from '@/lib/email';
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
    const paymentId = formData.get('paymentId') as string;
    const studentEmail = formData.get('studentEmail') as string;
    const enrollmentId = formData.get('enrollmentId') as string;
    const isPublic = formData.get('isPublic') === 'true';

    console.log('Received data:', { 
      paymentId, 
      studentEmail, 
      enrollmentId, 
      fileName: file?.name, 
      fileSize: file?.size,
      fileType: file?.type,
      isPublic 
    });

    // Validation
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    if (!studentEmail) {
      return NextResponse.json(
        { success: false, error: 'Student email is required' },
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
            timeout: 60000,
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
        
        setTimeout(() => {
          uploadStream.destroy();
          reject(new Error('Upload timeout'));
        }, 55000);
      });
    } catch (cloudinaryError: any) {
      console.error('Cloudinary upload failed:', cloudinaryError);
      return NextResponse.json(
        { success: false, error: cloudinaryError.message || 'Failed to upload file to cloud storage' },
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

    // Start transaction
    await connection.beginTransaction();

    try {
      let paymentExists = false;
      let paymentStudentName = '';
      let paymentStudentEmail = '';
      
      // Check if payment record exists
      try {
        const [paymentCheck] = await connection.execute(
          'SELECT id, student_email, status FROM payments WHERE id = ?',
          [paymentId]
        );
        paymentExists = (paymentCheck as any[]).length > 0;
        
        if (paymentExists) {
          const payment = (paymentCheck as any[])[0];
          paymentStudentEmail = payment.student_email;
          paymentStudentName = studentEmail || paymentStudentEmail;
          console.log('✅ Payment record exists:', paymentId);
        }
      } catch (checkError) {
        console.error('Error checking payment:', checkError);
      }

      // If payment doesn't exist, create it
      if (!paymentExists) {
        console.log('📝 Payment record not found, creating new payment...');
        
        // Get total amount from enrollments or use default
        let totalAmount = 0;
        try {
          const [amountCheck] = await connection.execute(
            'SELECT SUM(payment_amount) as total FROM enrollments WHERE payment_id = ?',
            [paymentId]
          );
          totalAmount = (amountCheck as any[])[0]?.total || 0;
        } catch (e) {
          console.error('Error getting total amount:', e);
        }
        
        await connection.execute(
          `INSERT INTO payments (id, student_email, total_amount, status, slip_url, created_at, updated_at)
           VALUES (?, ?, ?, 'pending', ?, NOW(), NOW())`,
          [paymentId, studentEmail, totalAmount, (uploadResult as any).secure_url]
        );
        console.log('✅ Payment record created:', paymentId);
      } else {
        // Update existing payment with slip URL
        await connection.execute(
          `UPDATE payments SET 
            slip_url = ?,
            status = 'pending',
            updated_at = NOW()
           WHERE id = ?`,
          [(uploadResult as any).secure_url, paymentId]
        );
        console.log('✅ Payment record updated with slip:', paymentId);
      }

      // Update all enrollments linked to this payment
      const [enrollmentUpdate] = await connection.execute(
        `UPDATE enrollments SET 
          slip_uploaded = TRUE,
          payment_status = 'pending',
          updated_at = NOW()
         WHERE payment_id = ?`,
        [paymentId]
      );
      
      console.log(`✅ Updated ${(enrollmentUpdate as any).affectedRows} enrollment(s) for payment: ${paymentId}`);

      // Get student name for email
      let studentName = studentEmail;
      try {
        const [studentCheck] = await connection.execute(
          'SELECT student_name FROM enrollments WHERE payment_id = ? LIMIT 1',
          [paymentId]
        );
        if ((studentCheck as any[]).length > 0) {
          studentName = (studentCheck as any[])[0].student_name;
        }
      } catch (e) {
        console.error('Error getting student name:', e);
      }

      await connection.commit();

      console.log('✅ Payment slip processed successfully for payment:', paymentId);

      // Send email notification
      let emailSent = false;
      try {
        const emailResult = await sendPaymentVerificationEmail(
          studentEmail,
          studentName,
          paymentId,
          'pending'
        );
        
        if (emailResult.success) {
          emailSent = true;
          console.log('✅ Payment verification email sent to:', studentEmail);
        } else {
          console.error('❌ Failed to send email:', emailResult.error);
        }
      } catch (emailError) {
        console.error('❌ Email sending error:', emailError);
      }

      return NextResponse.json({
        success: true,
        data: {
          paymentId,
          slipUrl: (uploadResult as any).secure_url,
          enrollmentsUpdated: (enrollmentUpdate as any).affectedRows,
          emailSent
        },
        message: emailSent 
          ? 'Payment slip uploaded successfully. A confirmation email has been sent.'
          : 'Payment slip uploaded successfully.'
      });

    } catch (dbError: any) {
      await connection.rollback();
      console.error('Database error:', dbError);
      
      // Handle duplicate entry error
      if (dbError.code === 'ER_DUP_ENTRY' || dbError.message?.includes('Duplicate entry')) {
        return NextResponse.json(
          { success: false, error: 'Payment slip already uploaded for this payment.' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: 'Failed to save payment slip: ' + dbError.message },
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