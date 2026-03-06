import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
/* eslint-disable */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching all courses with stats');

    // Get all courses with instructor details
    const courses = await query<any[]>(
      `SELECT 
         c.*,
         i.name as instructor_name,
         i.email as instructor_email
       FROM instructor_course c
       LEFT JOIN instructors i ON c.instructor_id = i.id
       ORDER BY c.created_at DESC`
    );

    // Get slides count for each course
    const slides = await query<any[]>(
      `SELECT course_id, COUNT(*) as count 
       FROM course_slides 
       GROUP BY course_id`
    );
    const slidesMap = new Map(slides.map(s => [s.course_id, s.count]));

    // Get files count for each course
    const files = await query<any[]>(
      `SELECT course_id, COUNT(*) as count 
       FROM slide_files 
       GROUP BY course_id`
    );
    const filesMap = new Map(files.map(f => [f.course_id, f.count]));

    // Get quizzes count for each course
    const quizzes = await query<any[]>(
      `SELECT q.course_id, COUNT(qq.id) as count 
       FROM course_quizzes q
       LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
       GROUP BY q.course_id`
    );
    const quizzesMap = new Map(quizzes.map(q => [q.course_id, q.count]));

    // Get assignments count for each course
    const assignments = await query<any[]>(
      `SELECT course_id, COUNT(*) as count 
       FROM course_assignments 
       GROUP BY course_id`
    );
    const assignmentsMap = new Map(assignments.map(a => [a.course_id, a.count]));

    // Combine all data
    const coursesWithStats = courses.map(course => ({
      ...course,
      stats: {
        slides: slidesMap.get(course.id) || 0,
        files: filesMap.get(course.id) || 0,
        quizzes: quizzesMap.get(course.id) || 0,
        assignments: assignmentsMap.get(course.id) || 0
      }
    }));

    console.log('✅ Courses fetched:', coursesWithStats.length);

    return NextResponse.json({
      success: true,
      data: coursesWithStats
    });

  } catch (error: any) {
    console.error('❌ Error fetching courses:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}