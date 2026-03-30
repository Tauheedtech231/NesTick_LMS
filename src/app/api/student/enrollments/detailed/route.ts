// app/api/students/enrollments/detailed/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
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

    console.log('📚 Fetching detailed enrollments for:', email);

    // Single query to get all enrollments with course details
    const enrollments = await query<any[]>(`
      SELECT 
        e.id as enrollment_id,
        e.student_email,
        e.student_name,
        e.enrollment_date,
        e.payment_status,
        e.last_accessed,
        e.completed_modules,
        e.progress_percentage,
        e.total_modules as enrollment_total_modules,
        c.id as course_id,
        c.title as course_title,
        c.description as course_description,
        c.category,
        c.duration,
        c.level,
        c.image,
        c.instructor_name,
        c.instructor_id,
        c.modules as course_modules,
        c.total_modules as course_total_modules,
        c.status as course_status
      FROM enrollments e
      INNER JOIN courses c ON e.course_id = c.id
      WHERE e.student_email = ? 
      AND e.payment_status = 'verified'
      AND c.status = 'published'
      ORDER BY 
        COALESCE(e.last_accessed, e.enrollment_date) DESC,
        e.enrollment_date DESC
    `, [email]);

    console.log(`📊 Found ${enrollments?.length || 0} enrollments for ${email}`);

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No enrollments found'
      });
    }

    // Format the response with proper data structure
    const data = enrollments.map((enrollment: any) => {
      // Parse modules if they exist
      let modules = [];
      try {
        if (enrollment.course_modules) {
          modules = typeof enrollment.course_modules === 'string' 
            ? JSON.parse(enrollment.course_modules) 
            : enrollment.course_modules;
        }
      } catch (e) {
        console.error('Error parsing course modules:', e);
        modules = [];
      }

      // Calculate total modules
      const totalModules = enrollment.course_total_modules || 
                          modules.length || 
                          enrollment.enrollment_total_modules || 
                          10;

      // Calculate progress percentage
      const progressPercentage = enrollment.progress_percentage || 
        (enrollment.completed_modules > 0 
          ? Math.round((enrollment.completed_modules / totalModules) * 100) 
          : 0);

      return {
        enrollment: {
          id: enrollment.enrollment_id,
          student_email: enrollment.student_email,
          student_name: enrollment.student_name,
          enrollment_date: enrollment.enrollment_date,
          payment_status: enrollment.payment_status,
          last_accessed: enrollment.last_accessed,
          completed_modules: Number(enrollment.completed_modules) || 0,
          progress_percentage: Number(progressPercentage),
          total_modules: Number(totalModules)
        },
        course: {
          id: enrollment.course_id,
          title: enrollment.course_title,
          description: enrollment.course_description || enrollment.course_title,
          category: enrollment.category || 'General',
          duration: enrollment.duration || 'Self-paced',
          level: enrollment.level || 'All Levels',
          image: enrollment.image || '',
          instructor_name: enrollment.instructor_name || 'Instructor',
          instructor_id: enrollment.instructor_id,
          modules: modules,
          total_modules: Number(totalModules),
          status: enrollment.course_status
        }
      };
    });

    return NextResponse.json({
      success: true,
      data: data,
      count: data.length
    });

  } catch (error: any) {
    console.error('❌ Error fetching detailed enrollments:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch enrollments'
      },
      { status: 500 }
    );
  }
}