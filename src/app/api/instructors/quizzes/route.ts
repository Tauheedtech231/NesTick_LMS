import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */
export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const {
      title,
      description,
      duration,
      startDate,
      endDate,
      status,
      instructorId,
      instructorName,
      courseId,
      courseTitle,
      questions
    } = body;

    console.log('📝 Creating new quiz:', { title, instructorId });

    if (!title || !instructorId) {
      return NextResponse.json(
        { success: false, error: 'Title and instructor ID are required' },
        { status: 400 }
      );
    }

    connection = await getConnection();
    await connection.beginTransaction();

    // Calculate totals
    const totalQuestions = questions?.length || 0;
    const totalPoints = questions?.reduce((sum: number, q: any) => sum + (q.points || 1), 0) || 0;

    // Generate quiz ID
    const quizId = uuidv4();

    // Insert quiz
    await connection.execute(
      `INSERT INTO quizzes (
        id, title, description, duration, total_questions, total_points,
        start_date, end_date, status, instructor_id, instructor_name,
        course_id, course_title, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        quizId,
        title,
        description || null,
        duration || 30,
        totalQuestions,
        totalPoints,
        startDate || null,
        endDate || null,
        status || 'draft',
        instructorId,
        instructorName || null,
        courseId || null,
        courseTitle || null
      ]
    );

    // Insert questions
    if (questions && questions.length > 0) {
      for (const q of questions) {
        const questionId = uuidv4();
        await connection.execute(
          `INSERT INTO quiz_questions (
            id, quiz_id, question, options, correct_answer, points, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            questionId,
            quizId,
            q.question || '',
            JSON.stringify(q.options || ['', '', '', '']),
            q.correctAnswer || 0,
            q.points || 1
          ]
        );
      }
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      data: { quizId },
      message: status === 'published' ? 'Quiz published successfully' : 'Quiz saved as draft'
    });

  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error('Error creating quiz:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create quiz' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

/* =====================================================
   GET QUIZZES - FIXED VERSION
===================================================== */
export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get('instructorId');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    connection = await getConnection();

    // DEBUG: Check if quiz_attempts table exists and has percentage column
    console.log('🔍 Checking database structure...');
    
    // Check tables
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
    `);
    console.log('📋 Available tables:', tables);

    // Check quiz_attempts columns
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'quiz_attempts' 
      AND TABLE_SCHEMA = DATABASE()
    `);
    console.log('📊 quiz_attempts columns:', columns);

    // Check if there's any data in quiz_attempts
    const [sampleData] = await connection.execute('SELECT * FROM quiz_attempts LIMIT 1');
    console.log('📝 Sample quiz_attempts data:', sampleData);

    // Check quizzes table structure
    const [quizColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'quizzes' 
      AND TABLE_SCHEMA = DATABASE()
    `);
    console.log('📊 quizzes columns:', quizColumns);

    // Now build the query based on actual structure
    let sql = `
      SELECT 
        q.*,
        (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as questions_count,
        (SELECT COUNT(*) FROM quiz_attempts WHERE quiz_id = q.id) as attempts_count,
    `;

    // Check if percentage column exists
    const hasPercentage = (columns as any[]).some(col => col.COLUMN_NAME === 'percentage');
    
    if (hasPercentage) {
      // Use percentage if it exists
      sql += `(SELECT COALESCE(AVG(percentage), 0) FROM quiz_attempts WHERE quiz_id = q.id) as avg_percentage`;
    } else {
      // Try other possible column names
      const hasScore = (columns as any[]).some(col => col.COLUMN_NAME === 'score');
      if (hasScore) {
        sql += `(SELECT COALESCE(AVG(score), 0) FROM quiz_attempts WHERE quiz_id = q.id) as avg_percentage`;
      } else {
        // If no score column, just use 0
        sql += `0 as avg_percentage`;
      }
    }
    
    sql += ` FROM quizzes q WHERE 1=1`;
    
    const params: any[] = [];

    // Apply filters
    if (instructorId) {
      sql += ' AND q.instructor_id = ?';
      params.push(instructorId);
    }

    if (status && status !== 'all') {
      sql += ' AND q.status = ?';
      params.push(status);
    }

    // Order by most recent first
    sql += ' ORDER BY q.created_at DESC';

    // Add pagination if needed
    if (limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(limit));
      
      if (offset) {
        sql += ' OFFSET ?';
        params.push(parseInt(offset));
      }
    }

    console.log('📊 Final query:', sql);
    console.log('📦 With params:', params);

    const [rows] = await connection.execute(sql, params);

    // Format the data for frontend
    const quizzes = (rows as any[]).map(row => {
      // Get average score from whatever column we used
      let avgScore = 0;
      if (row.avg_percentage !== undefined) {
        avgScore = row.avg_percentage;
      } else if (row.average_score) {
        avgScore = row.average_score;
      }
      
      return {
        id: row.id,
        title: row.title,
        description: row.description || '',
        courseId: row.course_id,
        courseTitle: row.course_title || 'General',
        instructorId: row.instructor_id,
        instructorName: row.instructor_name || 'Instructor',
        duration: row.duration,
        totalQuestions: row.total_questions || row.questions_count || 0,
        totalPoints: row.total_points || 0,
        attempts: row.attempts_count || 0,
        averageScore: Math.round(Number(avgScore) || 0),
        status: row.status,
        startDate: row.start_date,
        endDate: row.end_date,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    });

    // Get total count for pagination
    let countSql = 'SELECT COUNT(*) as total FROM quizzes WHERE 1=1';
    const countParams: any[] = [];

    if (instructorId) {
      countSql += ' AND instructor_id = ?';
      countParams.push(instructorId);
    }

    if (status && status !== 'all') {
      countSql += ' AND status = ?';
      countParams.push(status);
    }

    const [countResult] = await connection.execute(countSql, countParams);
    const total = (countResult as any[])[0]?.total || 0;

    return NextResponse.json({
      success: true,
      data: quizzes,
      pagination: {
        total,
        limit: limit ? parseInt(limit) : null,
        offset: offset ? parseInt(offset) : null
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching quizzes:', error);
    
    // Send detailed error for debugging
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        sqlMessage: error.sqlMessage,
        sql: error.sql,
        code: error.code
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}