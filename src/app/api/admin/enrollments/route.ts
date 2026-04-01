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

    // Updated SQL to use payments table instead of payment_slips
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
        e.voucher_number,
        e.payment_id,
        e.created_at,
        e.updated_at,
        p.id as payment_id_from_payments,
        p.slip_url as payment_slip_url,
        p.status as payment_record_status,
        p.created_at as payment_created_at
      FROM enrollments e
      LEFT JOIN payments p ON e.payment_id = p.id
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

    // Transform data to match frontend expectations
    const transformedRows = (rows as any[]).map(row => ({
      ...row,
      // Map payment slip URL from payments table
      slip_url: row.payment_slip_url,
      // Keep compatibility with old field names
      screenshot_url: row.payment_slip_url,
      payment_record_id: row.payment_id_from_payments,
      payment_record_status: row.payment_record_status
    }));

    console.log(`✅ Found ${(rows as any[]).length} enrollments`);

    return NextResponse.json({ 
      success: true, 
      data: transformedRows,
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