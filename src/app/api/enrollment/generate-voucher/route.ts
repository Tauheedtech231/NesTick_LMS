// app/api/enrollment/generate-voucher/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dfp9qc0gu',
  api_key: process.env.CLOUDINARY_API_KEY || '256561399931126',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'IDsMlP2lOykGLgLWKGgrhxiy01w',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { enrollmentId, studentDetails, courses, totalAmount } = body;

    if (!enrollmentId || !studentDetails || !courses) {
      return NextResponse.json(
        { success: false, error: 'Missing required information' },
        { status: 400 }
      );
    }

    // Generate PDF Voucher
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    
    // Add content to PDF
    // Header
    doc.fontSize(20)
      .font('Helvetica-Bold')
      .fillColor('#0B1C3D')
      .text('ENROLLMENT VOUCHER', { align: 'center' });
    
    doc.moveDown();
    doc.fontSize(10)
      .fillColor('#666666')
      .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    
    doc.moveDown(2);
    
    // Border line
    doc.strokeColor('#1FB6CB')
      .lineWidth(2)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();
    
    doc.moveDown();
    
    // Student Information Section
    doc.fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#0B1C3D')
      .text('STUDENT INFORMATION', { underline: true });
    
    doc.moveDown(0.5);
    doc.fontSize(10)
      .font('Helvetica')
      .fillColor('#333333')
      .text(`Enrollment ID: ${enrollmentId}`)
      .text(`Student Name: ${studentDetails.student_name}`)
      .text(`Email: ${studentDetails.student_email}`)
      .text(`Phone: ${studentDetails.student_phone}`)
      .text(`CNIC: ${studentDetails.student_cnic}`);
    
    if (studentDetails.student_address) {
      doc.text(`Address: ${studentDetails.student_address}`);
    }
    
    doc.moveDown();
    
    // Course Details Section
    doc.fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#0B1C3D')
      .text('COURSE DETAILS', { underline: true });
    
    doc.moveDown(0.5);
    
    // Table Header
    const startX = 50;
    let currentY = doc.y;
    
    doc.fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#FFFFFF');
    
    // Draw table header background
    doc.rect(startX, currentY, 500, 20)
      .fillColor('#1FB6CB')
      .fill();
    
    doc.fillColor('#FFFFFF')
      .text('S.No', startX + 10, currentY + 5)
      .text('Course Title', startX + 60, currentY + 5)
      .text('Fee (PKR)', startX + 400, currentY + 5, { align: 'right' });
    
    currentY += 20;
    
    // Table rows
    doc.font('Helvetica')
      .fillColor('#333333');
    
    let serialNo = 1;
    courses.forEach((course: any, index: number) => {
      const yPosition = currentY + (index * 25);
      
      // Draw row background for alternating rows
      if (index % 2 === 0) {
        doc.rect(startX, yPosition, 500, 22)
          .fillColor('#F9F9F9')
          .fill();
      }
      
      doc.fillColor('#333333')
        .text(serialNo.toString(), startX + 10, yPosition + 5)
        .text(course.course_title, startX + 60, yPosition + 5, { width: 330 })
        .text(`Rs. ${course.course_price.toLocaleString()}`, startX + 490, yPosition + 5, { align: 'right' });
      
      serialNo++;
    });
    
    currentY += courses.length * 25;
    
    // Total Section
    currentY += 10;
    doc.rect(startX, currentY, 500, 30)
      .fillColor('#F0F0F0')
      .fill();
    
    doc.fillColor('#B11217')
      .font('Helvetica-Bold')
      .fontSize(12)
      .text('TOTAL AMOUNT:', startX + 350, currentY + 8)
      .text(`Rs. ${totalAmount.toLocaleString()}`, startX + 470, currentY + 8, { align: 'right' });
    
    currentY += 40;
    
    // Payment Instructions
    doc.fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#0B1C3D')
      .text('PAYMENT INSTRUCTIONS', { underline: true });
    
    doc.moveDown(0.5);
    doc.fontSize(9)
      .font('Helvetica')
      .fillColor('#666666')
      .text('1. Please pay the total amount to the following bank account:')
      .text('   Bank: [Your Bank Name]')
      .text('   Account Title: [Your Account Title]')
      .text('   Account Number: [Your Account Number]')
      .text('   IBAN: [Your IBAN Number]')
      .moveDown(0.5)
      .text('2. After payment, upload the payment slip/screenshot in the next step.')
      .text('3. Your enrollment will be activated after payment verification (24-48 hours).')
      .text('4. Keep this voucher for future reference.');
    
    doc.moveDown();
    
    // Footer
    doc.fontSize(8)
      .fillColor('#999999')
      .text('This is a computer-generated voucher. No signature required.', { align: 'center' });
    
    doc.end();
    
    // Wait for PDF to be generated
    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });
    
    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'enrollment_vouchers',
          resource_type: 'auto',
          public_id: `voucher_${enrollmentId}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(pdfBuffer);
    });
    
    // Save voucher URL to database
    let connection;
    try {
      connection = await getConnection();
      await connection.execute(
        `UPDATE enrollments SET 
          voucher_generated = TRUE,
          updated_at = NOW()
         WHERE id = ?`,
        [enrollmentId]
      );
    } catch (dbError) {
      console.error('Error updating voucher status:', dbError);
    } finally {
      if (connection) connection.release();
    }
    
    return NextResponse.json({
      success: true,
      data: {
        voucherUrl: (uploadResult as any).secure_url,
        publicId: (uploadResult as any).public_id,
        enrollmentId,
      },
      message: 'Voucher generated successfully'
    });
    
  } catch (error: any) {
    console.error('Error generating voucher:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate voucher' },
      { status: 500 }
    );
  }
}