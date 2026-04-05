// /app/api/students/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */

// Helper function to find correct course ID
async function findCorrectCourseId(connection: any, courseId: string, enrollmentId: string) {
    try {
        // First, check if course exists by ID
        const [courseById] = await connection.execute(
            `SELECT id FROM instructor_course WHERE id = ?`,
            [courseId]
        );
        
        if ((courseById as any[]).length > 0) {
            return courseId;
        }
        
        // If not found by ID, get course title from enrollment
        const [enrollment] = await connection.execute(
            `SELECT course_title FROM enrollments WHERE id = ?`,
            [enrollmentId]
        );
        
        if ((enrollment as any[]).length > 0) {
            const courseTitle = (enrollment as any[])[0].course_title;
            console.log(`🔍 Analytics - Course not found by ID: ${courseId}, searching by title: "${courseTitle}"`);
            
            // Search by title
            const [courseByTitle] = await connection.execute(
                `SELECT id FROM instructor_course WHERE title = ? OR title LIKE ? LIMIT 1`,
                [courseTitle, `%${courseTitle}%`]
            );
            
            if ((courseByTitle as any[]).length > 0) {
                const correctId = (courseByTitle as any[])[0].id;
                console.log(`✅ Analytics - Found correct course ID: ${correctId} (was: ${courseId})`);
                return correctId;
            }
        }
        
        return courseId;
        
    } catch (error) {
        console.error('Error finding course:', error);
        return courseId;
    }
}

export async function GET(request: NextRequest) {
    let connection;
    try {
        const { searchParams } = new URL(request.url);
        const enrollmentId = searchParams.get('enrollmentId');
        const studentEmail = searchParams.get('studentEmail');
        const courseId = searchParams.get('courseId');

        if (!enrollmentId || !studentEmail) {
            return NextResponse.json(
                { success: false, error: 'enrollmentId and studentEmail are required' },
                { status: 400 }
            );
        }

        console.log('📊 Fetching analytics:', { enrollmentId, studentEmail, courseId });

        connection = await getConnection();

        // ✅ FIX: Get enrollment with correct course ID mapping
        let enrollment = null;
        let actualCourseId = courseId;

        // First get enrollment details
        const [enrollmentRows] = await connection.execute(
            `SELECT * FROM enrollments WHERE id = ?`,
            [enrollmentId]
        );
        
        if ((enrollmentRows as any[]).length === 0) {
            return NextResponse.json(
                { success: false, error: 'Enrollment not found' },
                { status: 404 }
            );
        }
        
        enrollment = (enrollmentRows as any[])[0];
        
        // ✅ FIX: Find correct course ID if courseId is provided, otherwise use from enrollment
        if (courseId) {
            actualCourseId = await findCorrectCourseId(connection, courseId, enrollmentId);
        } else {
            actualCourseId = enrollment.course_id;
        }
        
        console.log(`✅ Analytics - Using actual course ID: ${actualCourseId}`);

        // 1. Get course info with actualCourseId
        const [courseRows] = await connection.execute(
            `SELECT 
                id,
                title,
                duration,
                description
             FROM instructor_course 
             WHERE id = ?`,
            [actualCourseId]
        );
        
        const course = (courseRows as any[])[0] || {
            id: actualCourseId,
            title: enrollment.course_title || 'Course',
            duration: 'Self-paced',
            description: ''
        };

        // 2. Get overall progress
        const [progressRows] = await connection.execute(
            `SELECT 
                progress_percentage,
                status,
                study_hours,
                last_accessed
             FROM student_progress 
             WHERE enrollment_id = ?`,
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
                SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completedViews,
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
                SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) as passedQuizzes
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

        // Safe date handling for enrolledAt
        let enrolledAt = enrollment.enrollment_date || enrollment.created_at || enrollment.enrolled_at;
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
                    id: course.id,
                    title: course.title,
                    duration: course.duration || 'Self-paced',
                    description: course.description || ''
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
                    totalTimeSpent: Math.round((stats.totalTimeSpent || 0) / 60)
                },
                content: {
                    totalViews: content.totalViews || 0,
                    completedViews: content.completedViews || 0,
                    completionRate: content.totalViews > 0 
                        ? Math.round(((content.completedViews || 0) / content.totalViews) * 100) 
                        : 0,
                    totalWatchTime: Math.round((content.totalWatchTime || 0) / 60)
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
                    totalTimeInvested: Math.round(((stats.totalTimeSpent || 0) + (content.totalWatchTime || 0)) / 60),
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
                data: getDefaultAnalyticsData()
            },
            { status: 200 }
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
    
    // Sort dates in ascending order for streak calculation
    const sortedActivity = [...activity].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    for (let i = 1; i < sortedActivity.length; i++) {
        const prevDate = new Date(sortedActivity[i-1].date);
        const currDate = new Date(sortedActivity[i].date);
        const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
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

// Safe prediction function with proper date handling
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
            duration: 'Self-paced',
            description: ''
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