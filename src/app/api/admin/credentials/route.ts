// /app/api/admin/credentials/route.ts
import {  NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function GET() {
  let connection;
  try {
    console.log('🔍 Fetching verified students with credentials...');

    connection = await getConnection();

    const [rows] = await connection.execute(`
      SELECT 
        e.id as enrollmentId,
        e.student_id as studentId,
        e.student_name as studentName,
        e.student_email as studentEmail,
        e.course_title as course,
        e.course_id as courseId,
        e.username,
        e.password,
        e.credentials_sent_at as sentDate,
        e.payment_amount as amount,
        e.payment_date as verifiedDate,
        COALESCE(e.credentials_sent, FALSE) as credentialsSent
      FROM enrollments e
      WHERE e.payment_status = 'verified'
      ORDER BY e.credentials_sent_at DESC
    `);

    console.log(`✅ Found ${(rows as unknown[]).length} verified students`);

    return NextResponse.json({ 
      success: true, 
      data: rows,
      count: (rows as unknown[]).length
    });

  } catch (error: unknown) {
    console.error('❌ Error fetching credentials:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: (error as any).message || 'Failed to fetch credentials',
        data: []
      }, 
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}