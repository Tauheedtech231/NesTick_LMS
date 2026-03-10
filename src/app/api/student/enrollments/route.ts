// app/api/students/enrollments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('📚 Fetching enrollments for:', email);

    // Get all enrollments for the student
    const enrollments = await query<any[]>(`
      SELECT 
        e.id,
        e.student_email,
        e.student_name,
        e.course_id,
        e.enrollment_date,
        e.payment_status,
        e.payment_date,
        e.payment_method,
        e.transaction_id,
        e.last_accessed,
        e.completed_modules,
        e.progress_percentage,
        e.total_modules,
        e.slip_url,
        e.credentials_sent,
        e.created_at,
        e.updated_at,
        c.title as course_title,
        c.price as course_price,
        c.duration as course_duration,
        c.level as course_level,
        c.category as course_category,
        c.image as course_image,
        c.instructor_name
      FROM enrollments e
      LEFT JOIN courses c ON e.course_id = c.id
      WHERE e.student_email = ?
      ORDER BY e.created_at DESC
    `, [email]);

    console.log(`📊 Found ${enrollments?.length || 0} enrollments for ${email}`);

    return NextResponse.json({
      success: true,
      data: enrollments || []
    });

  } catch (error: any) {
    console.error('❌ Error fetching enrollments:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch enrollments'
      },
      { status: 500 }
    );
  }
}