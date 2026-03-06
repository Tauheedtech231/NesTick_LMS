import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    console.log('🔍 Fetching enrollments with status:', status);

    connection = await getConnection();

    let sql = `
      SELECT 
        e.id,
        e.student_id,
        e.student_name,
        e.student_email,
        e.student_phone,
        e.student_cnic,
        e.student_address,
        e.student_education,
        e.student_experience,
        e.cnic_front_url,
        e.cnic_back_url,
        e.educational_doc_url,
        e.course_id,
        e.course_title,
        e.course_price,
        e.enrollment_date,
        e.status,
        e.payment_status,
        e.payment_amount,
        e.payment_date,
        e.voucher_generated,
        e.slip_uploaded,
        e.created_at,
        e.updated_at,
        ps.id as slip_id,
        ps.slip_url,
        ps.status as slip_status,
        ps.uploaded_at as slip_uploaded_at
      FROM enrollments e
      LEFT JOIN payment_slips ps ON e.id = ps.enrollment_id
      WHERE 1=1
    `;
    
    const params: any[] = [];

    if (status && status !== 'all') {
      sql += ' AND e.payment_status = ?';
      params.push(status);
    }

    sql += ' ORDER BY e.created_at DESC';

    console.log('📝 Executing SQL:', sql);
    console.log('📦 Params:', params);

    const [rows] = await connection.execute(sql, params);

    console.log(`✅ Found ${(rows as any[]).length} enrollments`);

    return NextResponse.json({ 
      success: true, 
      data: rows,
      count: (rows as any[]).length
    });

  } catch (error: any) {
    console.error('❌ Error fetching enrollments:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch enrollments',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}