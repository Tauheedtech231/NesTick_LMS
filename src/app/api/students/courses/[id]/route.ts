// /app/api/students/courses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const studentEmail = searchParams.get('studentEmail');
    const enrollmentId = searchParams.get('enrollmentId');

    console.log('📥 Fetching course details:', { courseId: id, studentEmail, enrollmentId });

    if (!id || !studentEmail) {
      return NextResponse.json(
        { success: false, error: 'Course ID and Student Email required' },
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
        image,
        instructor_name as instructorName,
        level,
        price
       FROM instructor_course 
       WHERE id = ?`,
      [id]
    );

    if ((courseRows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    const course = (courseRows as any[])[0];

    // 2. Get slides
    const [slideRows] = await connection.execute(
      `SELECT 
        id,
        course_id as courseId,
        slide_number as slideNumber,
        title,
        created_at as createdAt,
        updated_at as updatedAt
       FROM course_slides 
       WHERE course_id = ? 
       ORDER BY slide_number`,
      [id]
    );
    const slides = slideRows as any[];

    // 3. Get slide contents (files)
    const [contentRows] = await connection.execute(
      `SELECT 
        id,
        slide_id as slideId,
        course_id as courseId,
        file_name as name,
        file_type as type,
        file_size as size,
        file_url as url,
        public_id as publicId,
        uploaded_at as uploadedAt
       FROM slide_files 
       WHERE course_id = ?`,
      [id]
    );
    const contents = contentRows as any[];

    // Group contents by slideId
    const contentsBySlide: Record<string, any[]> = {};
    contents.forEach(content => {
      if (!contentsBySlide[content.slideId]) {
        contentsBySlide[content.slideId] = [];
      }
      contentsBySlide[content.slideId].push({
        id: content.id,
        name: content.name,
        type: content.type,
        size: content.size,
        url: content.url,
        publicId: content.publicId,
        uploadedAt: content.uploadedAt
      });
    });

    // 4. Get quizzes with questions - FIXED ✅
    const [quizRows] = await connection.execute(
      `SELECT 
        q.id as quiz_id,
        q.slide_id as slideId,
        q.course_id as courseId,
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

    // Group quizzes by slideId with proper JSON parsing
    const quizzesBySlide: Record<string, any> = {};
    const quizMap = new Map();

    quizzes.forEach(row => {
      if (!quizMap.has(row.quiz_id)) {
        quizMap.set(row.quiz_id, {
          quizId: row.quiz_id,
          slideId: row.slideId,
          courseId: row.courseId,
          questions: []
        });
      }
      
      if (row.question_id) {
        const quiz = quizMap.get(row.quiz_id);
        let options = [];
        
        // ✅ FIXED: Proper JSON parsing
        if (row.options) {
          try {
            // If it's already a string, try to parse it
            if (typeof row.options === 'string') {
              // Check if it's a JSON array
              if (row.options.trim().startsWith('[')) {
                options = JSON.parse(row.options);
              } else {
                // Handle comma-separated string
                options = row.options.split(',').map((opt: string) => opt.trim());
              }
            } else if (Array.isArray(row.options)) {
              options = row.options;
            }
          } catch (e) {
            console.error('❌ Error parsing quiz options:', e);
            options = [];
          }
        }
        
        quiz.questions.push({
          id: row.question_id,
          question: row.question || '',
          options: options,
          correctAnswer: row.correctAnswer || 0
        });
      }
    });

    quizMap.forEach((quiz, quizId) => {
      quizzesBySlide[quiz.slideId] = quiz;
    });

    // 5. Get assignments
    const [assignmentRows] = await connection.execute(
      `SELECT 
        id,
        slide_id as slideId,
        course_id as courseId,
        title,
        description,
        due_date as dueDate,
        total_marks as totalMarks,
        passing_marks as passingMarks,
        file_name as fileName,
        file_type as fileType,
        file_size as fileSize,
        file_url as fileUrl,
        public_id as publicId,
        created_at as uploadedAt,
        status,
        created_at as createdAt,
        updated_at as updatedAt
       FROM course_assignments 
       WHERE course_id = ? AND status = 'published'`,
      [id]
    );
    const assignments = assignmentRows as any[];

    const formattedAssignments = assignments.map(a => ({
      id: a.id,
      slideId: a.slideId,
      courseId: a.courseId,
      title: a.title || '',
      description: a.description || '',
      dueDate: a.dueDate,
      totalMarks: a.totalMarks || 100,
      passingMarks: a.passingMarks || 70,
      file: a.fileUrl ? {
        name: a.fileName || 'file',
        type: a.fileType || 'application/octet-stream',
        size: a.fileSize || 0,
        url: a.fileUrl,
        publicId: a.publicId,
        uploadedAt: a.uploadedAt
      } : null,
      status: a.status || 'draft',
      createdAt: a.createdAt,
      updatedAt: a.updatedAt
    }));

    // 6. Get or create student progress - FIXED ✅
    let progress = {
      completedSlides: [],
      completedContent: [],
      progressPercentage: 0,
      studyHours: 0,
      status: 'not_started'
    };

    if (enrollmentId) {
      try {
        // Check if progress table exists
        const [tableCheck] = await connection.execute(
          `SELECT COUNT(*) as count FROM information_schema.tables 
           WHERE table_schema = DATABASE() AND table_name = 'student_progress'`
        );
        
        if ((tableCheck as any[])[0].count > 0) {
          const [progressRows] = await connection.execute(
            `SELECT 
              completed_slides,
              completed_content,
              progress_percentage as progressPercentage,
              study_hours as studyHours,
              status
             FROM student_progress 
             WHERE enrollment_id = ?`,
            [enrollmentId]
          );

          if ((progressRows as any[]).length > 0) {
            const p = (progressRows as any[])[0];
            
            // ✅ FIXED: Safe parsing for completed_slides
            let completedSlides = [];
            if (p.completed_slides) {
              try {
                if (typeof p.completed_slides === 'string') {
                  if (p.completed_slides.trim().startsWith('[')) {
                    completedSlides = JSON.parse(p.completed_slides);
                  } else {
                    completedSlides = p.completed_slides ? [p.completed_slides] : [];
                  }
                } else if (Array.isArray(p.completed_slides)) {
                  completedSlides = p.completed_slides;
                }
              } catch (e) {
                console.error('❌ Error parsing completed_slides:', e);
                completedSlides = [];
              }
            }
            
            // ✅ FIXED: Safe parsing for completed_content
            let completedContent = [];
            if (p.completed_content) {
              try {
                if (typeof p.completed_content === 'string') {
                  if (p.completed_content.trim().startsWith('[')) {
                    completedContent = JSON.parse(p.completed_content);
                  } else {
                    completedContent = p.completed_content ? [p.completed_content] : [];
                  }
                } else if (Array.isArray(p.completed_content)) {
                  completedContent = p.completed_content;
                }
              } catch (e) {
                console.error('❌ Error parsing completed_content:', e);
                completedContent = [];
              }
            }
            
            progress = {
              completedSlides,
              completedContent,
              progressPercentage: p.progressPercentage || 0,
              studyHours: p.studyHours || 0,
              status: p.status || 'not_started'
            };
          } else {
            // Create new progress record
            try {
              const progressId = uuidv4();
              await connection.execute(
                `INSERT INTO student_progress 
                 (id, enrollment_id, student_email, course_id, completed_slides, completed_content, created_at, updated_at)
                 VALUES (?, ?, ?, ?, '[]', '[]', NOW(), NOW())`,
                [progressId, enrollmentId, studentEmail, id]
              );
            } catch (insertError) {
              console.error('❌ Error creating progress:', insertError);
            }
          }
        }
      } catch (tableError) {
        console.error('❌ Progress table error:', tableError);
      }
    }

    // 7. Get quiz attempts - FIXED ✅
    let quizAttemptsMap: Record<string, any> = {};
    try {
      // Check if quiz_attempts table exists
      const [tableCheck] = await connection.execute(
        `SELECT COUNT(*) as count FROM information_schema.tables 
         WHERE table_schema = DATABASE() AND table_name = 'quiz_attempts'`
      );
      
      if ((tableCheck as any[])[0].count > 0) {
        const [attemptRows] = await connection.execute(
          `SELECT 
            quiz_id as quizId,
            slide_id as slideId,
            course_id as courseId,
            answers,
            score,
            passed,
            attempted_at as attemptedAt
           FROM quiz_attempts 
           WHERE student_email = ? AND course_id = ?`,
          [studentEmail, id]
        );
        const attempts = attemptRows as any[];

        attempts.forEach(attempt => {
          let answers = [];
          if (attempt.answers) {
            try {
              if (typeof attempt.answers === 'string') {
                if (attempt.answers.trim().startsWith('[')) {
                  answers = JSON.parse(attempt.answers);
                } else {
                  answers = attempt.answers.split(',').map((a: string) => parseInt(a.trim()));
                }
              } else if (Array.isArray(attempt.answers)) {
                answers = attempt.answers;
              }
            } catch (e) {
              console.error('❌ Error parsing quiz answers:', e);
              answers = [];
            }
          }
          
          quizAttemptsMap[attempt.quizId] = {
            quizId: attempt.quizId,
            slideId: attempt.slideId,
            courseId: attempt.courseId,
            answers: answers,
            score: attempt.score || 0,
            passed: attempt.passed === 1,
            attemptedAt: attempt.attemptedAt
          };
        });
      }
    } catch (tableError) {
      console.error('❌ Quiz attempts table error:', tableError);
    }

    // 8. Get assignment submissions - FIXED ✅
    let submissionsMap: Record<string, any> = {};
    try {
      // Check if assignment_submissions table exists
      const [tableCheck] = await connection.execute(
        `SELECT COUNT(*) as count FROM information_schema.tables 
         WHERE table_schema = DATABASE() AND table_name = 'assignment_submissions'`
      );
      
      if ((tableCheck as any[])[0].count > 0) {
        const [submissionRows] = await connection.execute(
          `SELECT 
            assignment_id as assignmentId,
            course_id as courseId,
            student_email as studentEmail,
            student_name as studentName,
            files,
            submitted_at as submittedAt,
            status,
            score,
            feedback
           FROM assignment_submissions 
           WHERE student_email = ? AND course_id = ?`,
          [studentEmail, id]
        );
        const submissions = submissionRows as any[];

        submissions.forEach(sub => {
          let files = [];
          if (sub.files) {
            try {
              if (typeof sub.files === 'string') {
                if (sub.files.trim().startsWith('[')) {
                  files = JSON.parse(sub.files);
                } else {
                  files = [{ url: sub.files, name: 'file' }];
                }
              } else if (Array.isArray(sub.files)) {
                files = sub.files;
              }
            } catch (e) {
              console.error('❌ Error parsing submission files:', e);
              files = [];
            }
          }
          
          submissionsMap[sub.assignmentId] = {
            assignmentId: sub.assignmentId,
            courseId: sub.courseId,
            studentEmail: sub.studentEmail,
            studentName: sub.studentName || 'Student',
            files: files,
            submittedAt: sub.submittedAt,
            status: sub.status || 'submitted',
            score: sub.score,
            feedback: sub.feedback
          };
        });
      }
    } catch (tableError) {
      console.error('❌ Assignment submissions table error:', tableError);
    }

    // ✅ Calculate overall progress
    if (slides.length > 0 && progress.completedSlides.length > 0) {
      progress.progressPercentage = Math.round((progress.completedSlides.length / slides.length) * 100);
    }

    return NextResponse.json({
      success: true,
      data: {
        course: {
          id: course.id,
          title: course.title,
          description: course.description,
          category: course.category,
          duration: course.duration,
          image: course.image,
          instructorName: course.instructorName,
          level: course.level,
          price: course.price
        },
        slides: slides.map(s => ({
          id: s.id,
          courseId: s.courseId,
          slideNumber: s.slideNumber,
          title: s.title,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt
        })),
        contents: contentsBySlide,
        quizzes: quizzesBySlide,
        assignments: formattedAssignments,
        progress,
        quizAttempts: quizAttemptsMap,
        assignmentSubmissions: submissionsMap
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching course details:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch course details',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}