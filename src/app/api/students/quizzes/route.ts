// /app/api/student/quizzes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const studentEmail = searchParams.get('studentId') || searchParams.get('studentEmail');

    console.log('📚 Fetching all mock quizzes for student:', { studentEmail });

    if (!studentEmail) {
      return NextResponse.json(
        { success: false, error: 'Student email is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Base query with correct column names
    const query = `
      SELECT 
        q.id,
        q.title,
        q.description,
        q.duration,
        q.total_questions,
        q.total_points,
        q.start_date,
        q.end_date,
        q.status,
        q.instructor_id,
        q.instructor_name,
        q.course_id,
        q.course_title,
        q.attempts,
        q.average_score,
        q.created_at,
        q.updated_at,
        -- Student attempt information using student_email
        (SELECT COUNT(*) FROM quiz_attempts WHERE quiz_id = q.id AND student_email = ?) as student_attempts,
        (SELECT score FROM quiz_attempts WHERE quiz_id = q.id AND student_email = ? ORDER BY created_at DESC LIMIT 1) as last_score,
        (SELECT created_at FROM quiz_attempts WHERE quiz_id = q.id AND student_email = ? ORDER BY created_at DESC LIMIT 1) as last_attempt_date
      FROM quizzes q
      WHERE q.status = 'published'
      ORDER BY 
        CASE 
          WHEN q.start_date > NOW() THEN 1  -- Upcoming first
          WHEN q.end_date < NOW() THEN 3     -- Expired last
          ELSE 2                              -- Available in middle
        END,
        q.created_at DESC
    `;

    const params = [studentEmail, studentEmail, studentEmail];
    const [rows] = await connection.execute(query, params);

    // Process each quiz
    const quizzes = (rows as any[]).map(quiz => {
      const now = new Date();
      let startDate = null;
      let endDate = null;
      
      try {
        startDate = quiz.start_date ? new Date(quiz.start_date) : null;
        endDate = quiz.end_date ? new Date(quiz.end_date) : null;
      } catch (e) {
        console.warn('⚠️ Invalid date format for quiz:', quiz.id);
      }
      
      // Determine availability
      let availability = 'available';
      let timeRemaining = null;
      let statusMessage = '';

      if (startDate && startDate > now) {
        availability = 'upcoming';
        const daysUntil = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const hoursUntil = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60));
        
        if (daysUntil === 0) {
          timeRemaining = `Starts in ${hoursUntil} hours`;
        } else if (daysUntil === 1) {
          timeRemaining = 'Starts tomorrow';
        } else {
          timeRemaining = `Starts in ${daysUntil} days`;
        }
        statusMessage = 'Not started yet';
      } 
      else if (endDate && endDate < now) {
        availability = 'expired';
        const daysAgo = Math.ceil((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
        timeRemaining = daysAgo === 1 ? 'Ended yesterday' : `Ended ${daysAgo} days ago`;
        statusMessage = 'Quiz expired';
      } 
      else if (endDate) {
        const hoursLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60));
        const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (hoursLeft <= 1) {
          timeRemaining = 'Less than 1 hour left';
        } else if (hoursLeft < 24) {
          timeRemaining = `${hoursLeft} hours left`;
        } else {
          timeRemaining = `${daysLeft} days left`;
        }
        statusMessage = 'Available now';
      }

      return {
        id: quiz.id,
        title: quiz.title || 'Untitled Quiz',
        description: quiz.description || 'No description available',
        duration: quiz.duration || 30,
        totalQuestions: quiz.total_questions || 0,
        totalPoints: quiz.total_points || 0,
        instructorName: quiz.instructor_name || 'Instructor',
        courseTitle: quiz.course_title || 'General Knowledge',
        attempts: quiz.attempts || 0,
        averageScore: parseFloat(quiz.average_score) || 0,
        studentAttempts: quiz.student_attempts || 0,
        lastScore: quiz.last_score || null,
        lastAttemptDate: quiz.last_attempt_date,
        availability,
        timeRemaining,
        statusMessage,
        startDate: quiz.start_date,
        endDate: quiz.end_date,
        createdAt: quiz.created_at,
        updatedAt: quiz.updated_at,
        canAttempt: availability === 'available' && (quiz.student_attempts || 0) === 0,
        hasAttempted: (quiz.student_attempts || 0) > 0
      };
    });

    return NextResponse.json({
      success: true,
      data: quizzes,
      total: quizzes.length,
      summary: {
        total: quizzes.length,
        available: quizzes.filter(q => q.availability === 'available').length,
        upcoming: quizzes.filter(q => q.availability === 'upcoming').length,
        expired: quizzes.filter(q => q.availability === 'expired').length,
        completed: quizzes.filter(q => q.hasAttempted).length
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching quizzes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quizzes' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}