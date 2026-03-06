// /app/api/students/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const enrollmentId = searchParams.get('enrollmentId');
    const studentEmail = searchParams.get('studentEmail');
    // const courseId = searchParams.get('courseId');

    if (!enrollmentId || !studentEmail) {
      return NextResponse.json(
        { success: false, error: 'enrollmentId and studentEmail are required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // 1. Get basic enrollment info
    const [enrollmentRows] = await connection.execute(
      `SELECT 
        e.*,
        c.title as courseTitle,
        c.duration as courseDuration
       FROM enrollments e
       JOIN instructor_course c ON e.course_id = c.id
       WHERE e.id = ?`,
      [enrollmentId]
    );
    const enrollment = (enrollmentRows as any[])[0];

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // 2. Get overall progress
    const [progressRows] = await connection.execute(
      `SELECT * FROM student_progress WHERE enrollment_id = ?`,
      [enrollmentId]
    );
    const progress = (progressRows as any[])[0] || {
      progress_percentage: 0,
      status: 'not_started',
      study_hours: 0,
      last_accessed: null
    };

    // 3. Get slide progress stats
    const [slideStats] = await connection.execute(
      `SELECT 
        COUNT(*) as totalSlides,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedSlides,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as inProgressSlides,
        SUM(time_spent) as totalTimeSpent
       FROM slide_progress 
       WHERE enrollment_id = ?`,
      [enrollmentId]
    );
    const stats = (slideStats as any[])[0] || {
      totalSlides: 0,
      completedSlides: 0,
      inProgressSlides: 0,
      totalTimeSpent: 0
    };

    // 4. Get content views stats
    const [contentStats] = await connection.execute(
      `SELECT 
        COUNT(*) as totalViews,
        SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) as completedViews,
        SUM(duration_watched) as totalWatchTime
       FROM content_views 
       WHERE enrollment_id = ?`,
      [enrollmentId]
    );
    const content = (contentStats as any[])[0] || {
      totalViews: 0,
      completedViews: 0,
      totalWatchTime: 0
    };

    // 5. Get quiz performance
    const [quizRows] = await connection.execute(
      `SELECT 
        COUNT(*) as totalAttempts,
        AVG(score) as averageScore,
        SUM(CASE WHEN passed = true THEN 1 ELSE 0 END) as passedQuizzes
       FROM quiz_attempts 
       WHERE enrollment_id = ?`,
      [enrollmentId]
    );
    const quizzes = (quizRows as any[])[0] || {
      totalAttempts: 0,
      averageScore: 0,
      passedQuizzes: 0
    };

    // 6. Get daily activity for last 30 days
    const [activityRows] = await connection.execute(
      `SELECT 
        DATE(last_accessed) as date,
        COUNT(*) as slidesAccessed
       FROM slide_progress 
       WHERE enrollment_id = ? 
         AND last_accessed >= DATE_SUB(NOW(), INTERVAL 30 DAY)
         AND last_accessed IS NOT NULL
       GROUP BY DATE(last_accessed)
       ORDER BY date DESC`,
      [enrollmentId]
    );
    const activity = activityRows as any[];

    // 7. Get most active hours
    const [hourRows] = await connection.execute(
      `SELECT 
        HOUR(last_accessed) as hour,
        COUNT(*) as count
       FROM slide_progress 
       WHERE enrollment_id = ?
         AND last_accessed IS NOT NULL
       GROUP BY HOUR(last_accessed)
       ORDER BY count DESC
       LIMIT 3`,
      [enrollmentId]
    );
    const peakHours = hourRows as any[];

    // ✅ FIXED: Safe date handling for enrolledAt
    let enrolledAt = enrollment.enrolled_at;
    if (!enrolledAt) {
      enrolledAt = new Date().toISOString();
    }

    return NextResponse.json({
      success: true,
      data: {
        enrollment: {
          id: enrollment.id,
          studentName: enrollment.student_name || 'Student',
          studentEmail: enrollment.student_email,
          enrolledAt: enrolledAt,
          status: enrollment.status || 'active'
        },
        course: {
          id: enrollment.course_id,
          title: enrollment.courseTitle || 'Course',
          duration: enrollment.courseDuration || 'Self-paced'
        },
        progress: {
          overall: progress.progress_percentage || 0,
          status: progress.status || 'not_started',
          studyHours: Math.round((progress.study_hours || 0) * 10) / 10,
          lastAccessed: progress.last_accessed || null
        },
        slides: {
          total: stats.totalSlides || 0,
          completed: stats.completedSlides || 0,
          inProgress: stats.inProgressSlides || 0,
          completionRate: stats.totalSlides > 0 
            ? Math.round(((stats.completedSlides || 0) / stats.totalSlides) * 100) 
            : 0,
          totalTimeSpent: Math.round((stats.totalTimeSpent || 0) / 60) // minutes
        },
        content: {
          totalViews: content.totalViews || 0,
          completedViews: content.completedViews || 0,
          completionRate: content.totalViews > 0 
            ? Math.round(((content.completedViews || 0) / content.totalViews) * 100) 
            : 0,
          totalWatchTime: Math.round((content.totalWatchTime || 0) / 60) // minutes
        },
        quizzes: {
          totalAttempts: quizzes.totalAttempts || 0,
          averageScore: Math.round(quizzes.averageScore || 0),
          passedQuizzes: quizzes.passedQuizzes || 0,
          passRate: quizzes.totalAttempts > 0 
            ? Math.round(((quizzes.passedQuizzes || 0) / quizzes.totalAttempts) * 100) 
            : 0
        },
        activity: {
          daily: activity.map(a => ({
            date: a.date,
            slidesAccessed: a.slidesAccessed || 0
          })),
          peakHours: peakHours.map(h => ({
            hour: h.hour || 0,
            activityCount: h.count || 0
          })),
          totalActiveDays: activity.length
        },
        summary: {
          totalTimeInvested: Math.round(((stats.totalTimeSpent || 0) + (content.totalWatchTime || 0)) / 60), // minutes
          consistencyScore: calculateConsistencyScore(activity),
          predictedCompletion: predictCompletion(
            progress.progress_percentage || 0, 
            enrolledAt,
            stats.totalSlides || 0,
            stats.completedSlides || 0
          )
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching analytics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch analytics',
        data: getDefaultAnalyticsData() // Return default data on error
      },
      { status: 200 } // Return 200 with default data instead of 500
    );
  } finally {
    if (connection) connection.release();
  }
}

// Helper function to calculate consistency score (1-100)
function calculateConsistencyScore(activity: any[]): number {
  if (!activity || activity.length === 0) return 0;
  
  const daysWithActivity = activity.length;
  const totalDays = 30;
  const baseScore = Math.min(100, Math.round((daysWithActivity / totalDays) * 100));
  
  // Check for streaks
  let maxStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < activity.length; i++) {
    const prevDate = new Date(activity[i-1].date);
    const currDate = new Date(activity[i].date);
    const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  
  const streakBonus = Math.min(20, maxStreak * 2);
  return Math.min(100, baseScore + streakBonus);
}

// ✅ FIXED: Safe prediction function with proper date handling
function predictCompletion(
  currentProgress: number, 
  enrolledAt: string, 
  totalSlides: number,
  completedSlides: number
): string {
  if (currentProgress >= 100 || completedSlides >= totalSlides) {
    return 'Completed';
  }
  
  if (currentProgress === 0 || completedSlides === 0) {
    return 'Not enough data';
  }
  
  try {
    const enrolled = new Date(enrolledAt);
    if (isNaN(enrolled.getTime())) {
      return 'Insufficient data';
    }
    
    const now = new Date();
    const daysEnrolled = Math.max(1, Math.floor((now.getTime() - enrolled.getTime()) / (1000 * 60 * 60 * 24)));
    
    const slidesPerDay = completedSlides / daysEnrolled;
    if (slidesPerDay <= 0) {
      return 'Not progressing';
    }
    
    const remainingSlides = totalSlides - completedSlides;
    const remainingDays = Math.ceil(remainingSlides / slidesPerDay);
    
    if (remainingDays > 365) {
      return 'More than a year';
    }
    if (remainingDays > 30) {
      const months = Math.ceil(remainingDays / 30);
      return `≈ ${months} month${months > 1 ? 's' : ''}`;
    }
    
    return `≈ ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
    
  } catch (error) {
    console.error('Error predicting completion:', error);
    return 'Insufficient data';
  }
}

// Default data for error cases
function getDefaultAnalyticsData() {
  return {
    enrollment: {
      id: '',
      studentName: 'Student',
      studentEmail: '',
      enrolledAt: new Date().toISOString(),
      status: 'active'
    },
    course: {
      id: '',
      title: 'Course',
      duration: 'Self-paced'
    },
    progress: {
      overall: 0,
      status: 'not_started',
      studyHours: 0,
      lastAccessed: null
    },
    slides: {
      total: 0,
      completed: 0,
      inProgress: 0,
      completionRate: 0,
      totalTimeSpent: 0
    },
    content: {
      totalViews: 0,
      completedViews: 0,
      completionRate: 0,
      totalWatchTime: 0
    },
    quizzes: {
      totalAttempts: 0,
      averageScore: 0,
      passedQuizzes: 0,
      passRate: 0
    },
    activity: {
      daily: [],
      peakHours: [],
      totalActiveDays: 0
    },
    summary: {
      totalTimeInvested: 0,
      consistencyScore: 0,
      predictedCompletion: 'Insufficient data'
    }
  };
}