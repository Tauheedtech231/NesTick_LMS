// app/api/instructors/course/preview/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Course ID required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // 1. Get course details
    const [courseRows] = await connection.execute(
      `SELECT 
        id,
        title,
        description,
        category,
        duration,
        level,
        instructor_name as instructorName,
        image,
        status,
        (SELECT COUNT(*) FROM course_slides WHERE course_id = ?) as slides_count,
        (SELECT COUNT(*) FROM slide_files WHERE course_id = ?) as files_count,
        (SELECT COUNT(*) FROM course_quizzes WHERE course_id = ?) as quizzes_count,
        (SELECT COUNT(*) FROM course_assignments WHERE course_id = ?) as assignments_count
       FROM instructor_course 
       WHERE id = ?`,
      [id, id, id, id, id]
    );

    if ((courseRows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    const course = (courseRows as any[])[0];

    // 2. Get all slides with their content
    const [slideRows] = await connection.execute(
      `SELECT 
        id,
        slide_number as slideNumber,
        title
       FROM course_slides 
       WHERE course_id = ? 
       ORDER BY slide_number ASC`,
      [id]
    );
    const slides = slideRows as any[];

    // 3. Get files for all slides
    const [fileRows] = await connection.execute(
      `SELECT 
        id,
        slide_id as slideId,
        file_name as name,
        file_type as type,
        file_size as size,
        file_url as url,
        uploaded_at as uploadedAt
       FROM slide_files 
       WHERE course_id = ?`,
      [id]
    );
    const files = fileRows as any[];

    // Group files by slideId
    const filesBySlide: Record<string, any[]> = {};
    files.forEach(file => {
      if (!filesBySlide[file.slideId]) {
        filesBySlide[file.slideId] = [];
      }
      filesBySlide[file.slideId].push({
        id: file.id,
        name: file.name,
        type: file.type,
        size: file.size,
        url: file.url,
        uploadedAt: file.uploadedAt
      });
    });

    // 4. Get quizzes with questions
    const [quizRows] = await connection.execute(
      `SELECT 
        q.id as quiz_id,
        q.slide_id as slideId,
        qq.id as question_id,
        qq.question,
        qq.options,
        qq.correct_answer as correctAnswer
       FROM course_quizzes q
       LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
       WHERE q.course_id = ?
       ORDER BY q.slide_id, qq.created_at`,
      [id]
    );
    const quizzes = quizRows as any[];

    // Group quizzes by slideId
    const quizzesBySlide: Record<string, any> = {};
    const quizMap = new Map();

    quizzes.forEach(row => {
      if (!quizMap.has(row.quiz_id)) {
        quizMap.set(row.quiz_id, {
          id: row.quiz_id,
          slideId: row.slideId,
          questions: []
        });
      }
      
      if (row.question_id) {
        const quiz = quizMap.get(row.quiz_id);
        let options = [];
        
        try {
          if (typeof row.options === 'string') {
            if (row.options.trim().startsWith('[')) {
              options = JSON.parse(row.options);
            } else {
              options = row.options.split(',').map((opt: string) => opt.trim());
            }
          } else if (Array.isArray(row.options)) {
            options = row.options;
          }
        } catch (e) {
          console.error('Error parsing quiz options:', e);
          options = [];
        }
        
        quiz.questions.push({
          id: row.question_id,
          question: row.question || '',
          options: options,
          correctAnswer: row.correctAnswer || 0
        });
      }
    });

    quizMap.forEach((quiz) => {
      if (quiz.questions.length > 0) {
        quizzesBySlide[quiz.slideId] = {
          id: quiz.id,
          slideId: quiz.slideId,
          questions: quiz.questions
        };
      }
    });

    // 5. Get assignments
    const [assignmentRows] = await connection.execute(
      `SELECT 
        id,
        slide_id as slideId,
        title,
        description,
        due_date as dueDate,
        total_marks as totalMarks,
        passing_marks as passingMarks,
        file_name as fileName,
        file_url as fileUrl,
        status
       FROM course_assignments 
       WHERE course_id = ?`,
      [id]
    );
    const assignments = assignmentRows as any[];

    // Group assignments by slideId
    const assignmentsBySlide: Record<string, any[]> = {};
    assignments.forEach(assignment => {
      if (!assignmentsBySlide[assignment.slideId]) {
        assignmentsBySlide[assignment.slideId] = [];
      }
      assignmentsBySlide[assignment.slideId].push({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        totalMarks: assignment.totalMarks,
        passingMarks: assignment.passingMarks,
        status: assignment.status,
        file: assignment.fileUrl ? {
          name: assignment.fileName || 'file',
          url: assignment.fileUrl
        } : null
      });
    });

    // 6. Build complete slides array
    const completeSlides = slides.map(slide => ({
      id: slide.id,
      slideNumber: slide.slideNumber,
      title: slide.title,
      files: filesBySlide[slide.id] || [],
      quiz: quizzesBySlide[slide.id] || null,
      assignments: assignmentsBySlide[slide.id] || []
    }));

    return NextResponse.json({
      success: true,
      data: {
        course: {
          id: course.id,
          title: course.title,
          description: course.description,
          category: course.category,
          duration: course.duration,
          level: course.level,
          instructorName: course.instructorName,
          image: course.image,
          status: course.status,
          stats: {
            slides: course.slides_count || 0,
            files: course.files_count || 0,
            quizzes: course.quizzes_count || 0,
            assignments: course.assignments_count || 0
          }
        },
        slides: completeSlides
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching preview:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch preview data'
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}