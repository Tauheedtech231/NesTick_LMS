/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/instructor/course-quizzes-results/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'Course ID is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Get course title
    const [courseInfo] = await connection.execute(
      `SELECT title FROM instructor_course WHERE id = ?`,
      [courseId]
    ) as any[];
    
    const courseTitle = courseInfo[0]?.title || 'Unknown Course';

    // ✅ FIXED: Get ONLY quizzes that have questions AND have attempts
    const [quizzes] = await connection.execute(
      `SELECT 
        cq.id AS quiz_id,
        cs.slide_number,
        cs.title AS slide_title,
        (
          SELECT COUNT(*) FROM quiz_questions_new WHERE quiz_id = cq.id
        ) + (
          SELECT COUNT(*) FROM tf_fill_questions WHERE slide_id = cq.slide_id AND course_id = cq.course_id
        ) + (
          SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = cq.id
        ) AS total_questions,
        qa.id AS attempt_id,
        qa.student_email,
        qa.score,
        qa.total_possible,
        qa.percentage,
        qa.passed,
        qa.completed_at,
        qa.answers
      FROM course_quizzes cq
      LEFT JOIN course_slides cs ON cq.slide_id = cs.id
      INNER JOIN quiz_attempts_new qa ON cq.id = qa.quiz_id AND qa.status = 'completed'
      WHERE cq.course_id = ?
      HAVING total_questions > 0
      ORDER BY cs.slide_number, qa.completed_at DESC`,
      [courseId]
    ) as any[];

    // Get student names for all attempts
    const studentNamesMap = new Map();
    for (const quiz of quizzes) {
      if (quiz.student_email && !studentNamesMap.has(quiz.student_email)) {
        const [student] = await connection.execute(
          `SELECT student_name FROM enrollments WHERE student_email = ? LIMIT 1`,
          [quiz.student_email]
        ) as any[];
        studentNamesMap.set(quiz.student_email, student[0]?.student_name || 'N/A');
      }
    }

    // Group by quiz
    const quizMap = new Map();
    for (const row of quizzes) {
      if (!quizMap.has(row.quiz_id)) {
        quizMap.set(row.quiz_id, {
          quiz_id: row.quiz_id,
          slide_number: row.slide_number || 0,
          slide_title: row.slide_title || 'Quiz',
          total_questions: row.total_questions || 0,
          attempts: [],
          total_attempts: 0,
          unique_students: 0,
          avg_percentage: 0,
          highest_score: 0,
          lowest_score: 100,
          passed_count: 0,
          failed_count: 0,
          last_attempt_date: null
        });
      }

      const quizData = quizMap.get(row.quiz_id);
      
      if (row.attempt_id) {
        const studentName = studentNamesMap.get(row.student_email) || 'N/A';
        
        quizData.attempts.push({
          id: row.attempt_id,
          student_email: row.student_email,
          student_name: studentName,
          score: row.score,
          total_possible: row.total_possible,
          percentage: row.percentage,
          passed: row.passed === 1,
          completed_at: row.completed_at,
          answers: row.answers
        });
        
        quizData.total_attempts++;
        quizData.avg_percentage += row.percentage;
        quizData.highest_score = Math.max(quizData.highest_score, row.percentage);
        quizData.lowest_score = Math.min(quizData.lowest_score, row.percentage);
        
        if (row.passed === 1) {
          quizData.passed_count++;
        } else {
          quizData.failed_count++;
        }
        
        if (row.completed_at && (!quizData.last_attempt_date || row.completed_at > quizData.last_attempt_date)) {
          quizData.last_attempt_date = row.completed_at;
        }
      }
    }

    // Calculate averages
    for (const quizData of quizMap.values()) {
      if (quizData.total_attempts > 0) {
        quizData.avg_percentage = Math.round(quizData.avg_percentage / quizData.total_attempts);
        quizData.unique_students = new Set(quizData.attempts.map((a: any) => a.student_email)).size;
      } else {
        quizData.avg_percentage = 0;
        quizData.highest_score = 0;
        quizData.lowest_score = 0;
      }
    }

    const result = Array.from(quizMap.values());

    return NextResponse.json({
      success: true,
      data: result,
      course: {
        id: courseId,
        title: courseTitle
      },
      summary: {
        total_quizzes: result.length,
        total_attempts: result.reduce((sum, q) => sum + q.total_attempts, 0),
        total_students: new Set(result.flatMap(q => q.attempts.map((a: any) => a.student_email))).size
      }
    });

  } catch (error: any) {
    console.error('Error fetching course quizzes results:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch quiz results' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}