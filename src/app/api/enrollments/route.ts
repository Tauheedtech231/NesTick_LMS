import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */
/* =====================================================
   CREATE NEW ENROLLMENT
===================================================== */
export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const {
      studentName,
      studentEmail,
      studentPhone,
      studentCnic,
      studentAddress,
      studentEducation,
      studentExperience,
      cnicFrontUrl,
      cnicBackUrl,
      educationalDocUrl,
      courseId,
      courseTitle,
      coursePrice,
      enrollmentDate
    } = body;

    console.log('📝 Creating new enrollment:', { 
      studentEmail, 
      courseId,
      courseTitle 
    });

    // ============ VALIDATION ============
    if (!studentEmail || !courseId) {
      return NextResponse.json(
        { success: false, error: 'Student email and course ID are required' },
        { status: 400 }
      );
    }

    if (!studentName) {
      return NextResponse.json(
        { success: false, error: 'Student name is required' },
        { status: 400 }
      );
    }

    if (!cnicFrontUrl || !cnicBackUrl || !educationalDocUrl) {
      return NextResponse.json(
        { success: false, error: 'All documents (CNIC Front, CNIC Back, Educational) are required' },
        { status: 400 }
      );
    }

    // ============ CONNECT DATABASE ============
    connection = await getConnection();

    // ============ CHECK IF ALREADY ENROLLED ============
    const [existing] = await connection.execute(
      `SELECT id FROM enrollments 
       WHERE student_email = ? AND course_id = ? AND status != 'cancelled'`,
      [studentEmail, courseId]
    );

    if ((existing as any[]).length > 0) {
      return NextResponse.json(
        { success: false, error: 'You are already enrolled in this course' },
        { status: 400 }
      );
    }

    // ============ GENERATE ENROLLMENT ID ============
    const enrollmentId = uuidv4();

    // ============ CONVERT DATE FORMAT ============
    // Convert ISO date to MySQL format (YYYY-MM-DD HH:MM:SS)
    let mysqlDate = null;
    if (enrollmentDate) {
      const date = new Date(enrollmentDate);
      mysqlDate = date.toISOString().slice(0, 19).replace('T', ' ');
    }

    console.log('📅 Enrollment date:', mysqlDate || 'CURRENT_TIMESTAMP');

    // ============ INSERT ENROLLMENT ============
    await connection.execute(
      `INSERT INTO enrollments (
        id, 
        student_id, 
        student_email, 
        student_name, 
        student_phone,
        student_cnic, 
        student_address, 
        student_education, 
        student_experience,
        cnic_front_url, 
        cnic_back_url, 
        educational_doc_url,
        course_id, 
        course_title, 
        course_price, 
        enrollment_date,
        status, 
        payment_status, 
        created_at, 
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        enrollmentId,
        studentEmail, // student_id
        studentEmail,
        studentName,
        studentPhone || null,
        studentCnic || null,
        studentAddress || null,
        studentEducation || null,
        studentExperience || null,
        cnicFrontUrl,
        cnicBackUrl,
        educationalDocUrl,
        courseId,
        courseTitle || null,
        coursePrice || null,
        mysqlDate, // Use converted date or null (MySQL will use CURRENT_TIMESTAMP)
        'pending',
        'pending'
      ]
    );

    console.log('✅ Enrollment created successfully:', enrollmentId);

    // ============ RETURN SUCCESS ============
    return NextResponse.json({
      success: true,
      data: { 
        enrollmentId,
        message: 'Enrollment created successfully'
      },
      message: 'Your enrollment has been submitted successfully. Please upload payment slip.'
    });

  } catch (error: any) {
    console.error('❌ Error creating enrollment:', error);
    
    // Check for specific MySQL errors
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { success: false, error: 'This enrollment already exists' },
        { status: 400 }
      );
    }
    
    if (error.code === 'ER_NO_REFERENCED_ROW') {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create enrollment',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

/* =====================================================
   GET ENROLLMENTS (with filters)
===================================================== */
export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const studentEmail = searchParams.get('studentEmail');
    const courseId = searchParams.get('courseId');
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');

    connection = await getConnection();

    let sql = `
      SELECT 
        e.*,
        ps.id as slip_id,
        ps.slip_url,
        ps.status as slip_status,
        ps.uploaded_at as slip_uploaded_at,
        ps.file_name as slip_file_name
      FROM enrollments e
      LEFT JOIN payment_slips ps ON e.id = ps.enrollment_id
      WHERE 1=1
    `;
    
    const params: any[] = [];

    if (studentId) {
      sql += ' AND e.student_id = ?';
      params.push(studentId);
    }

    if (studentEmail) {
      sql += ' AND e.student_email = ?';
      params.push(studentEmail);
    }

    if (courseId) {
      sql += ' AND e.course_id = ?';
      params.push(courseId);
    }

    if (status) {
      sql += ' AND e.status = ?';
      params.push(status);
    }

    if (paymentStatus) {
      sql += ' AND e.payment_status = ?';
      params.push(paymentStatus);
    }

    sql += ' ORDER BY e.created_at DESC';

    console.log('📊 Executing query with params:', params);

    const [rows] = await connection.execute(sql, params);

    return NextResponse.json({
      success: true,
      data: rows,
      count: (rows as any[]).length
    });

  } catch (error: any) {
    console.error('❌ Error fetching enrollments:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

/* =====================================================
   UPDATE ENROLLMENT STATUS
===================================================== */
export async function PUT(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const enrollmentId = searchParams.get('id');
    const body = await request.json();
    const { status, paymentStatus, verifiedBy } = body;

    if (!enrollmentId) {
      return NextResponse.json(
        { success: false, error: 'Enrollment ID required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Check if enrollment exists
    const [existing] = await connection.execute(
      'SELECT id FROM enrollments WHERE id = ?',
      [enrollmentId]
    );

    if ((existing as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (status) {
      updates.push('status = ?');
      values.push(status);
    }

    if (paymentStatus) {
      updates.push('payment_status = ?');
      values.push(paymentStatus);
      
      if (paymentStatus === 'verified') {
        updates.push('payment_date = NOW()');
      }
    }

    if (verifiedBy) {
      updates.push('verified_by = ?');
      values.push(verifiedBy);
    }

    updates.push('updated_at = NOW()');
    values.push(enrollmentId);

    if (updates.length === 1) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    await connection.execute(
      `UPDATE enrollments SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // If payment verified, also update payment_slips status
    if (paymentStatus === 'verified') {
      await connection.execute(
        `UPDATE payment_slips SET status = 'verified' WHERE enrollment_id = ?`,
        [enrollmentId]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Enrollment updated successfully'
    });

  } catch (error: any) {
    console.error('❌ Error updating enrollment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}