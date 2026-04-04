// /app/api/student/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */

// Helper function to find correct course ID by title
async function getCorrectCourseId(connection: any, courseId: string, courseTitle: string): Promise<string> {
    try {
        // First try to find by exact ID
        const [exactMatch] = await connection.execute(
            `SELECT id FROM instructor_course WHERE id = ?`,
            [courseId]
        );
        
        if ((exactMatch as any[]).length > 0) {
            return courseId;
        }
        
        // If not found, try to find by title
        const [titleMatch] = await connection.execute(
            `SELECT id FROM instructor_course WHERE title LIKE ? OR title = ?`,
            [`%${courseTitle}%`, courseTitle]
        );
        
        if ((titleMatch as any[]).length > 0) {
            const correctId = (titleMatch as any[])[0].id;
            console.log(`✅ Auto-corrected course ID: ${courseId} -> ${correctId} for title: ${courseTitle}`);
            return correctId;
        }
        
        // If still not found, create a new course entry
        console.log(`📝 Creating new course in instructor_course: ${courseId} - ${courseTitle}`);
        await connection.execute(
            `INSERT INTO instructor_course (
                id, title, description, category, duration, instructor_name, level, price, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', NOW(), NOW())`,
            [
                courseId,
                courseTitle,
                `${courseTitle} - Course content is being prepared`,
                'Safety Training',
                'Self-paced',
                'Not Assigned',
                'Beginner',
                0
            ]
        );
        
        return courseId;
    } catch (error) {
        console.error('Error in getCorrectCourseId:', error);
        return courseId;
    }
}

export async function GET(request: NextRequest) {
    let connection;
    try {
        const { searchParams } = new URL(request.url);
        const studentEmail = searchParams.get('studentEmail');

        console.log('📊 Fetching dashboard data for:', studentEmail);

        if (!studentEmail) {
            return NextResponse.json(
                { success: false, error: 'Student email is required' },
                { status: 400 }
            );
        }

        connection = await getConnection();

        // First, get all enrollments
        const [enrollmentRows] = await connection.execute(
            `SELECT 
                id as enrollment_id,
                course_id,
                course_title,
                course_price,
                enrollment_date,
                status,
                payment_status
            FROM enrollments 
            WHERE student_email = ? AND status = 'active' AND payment_status = 'verified'`,
            [studentEmail]
        );

        const enrollments = enrollmentRows as any[];
        console.log(`📚 Found ${enrollments.length} enrollments`);

        // Process each enrollment and get/fix course details
        const coursesWithProgress = [];
        
        for (const enrollment of enrollments) {
            // Get or fix the correct course ID
            const actualCourseId = await getCorrectCourseId(
                connection, 
                enrollment.course_id, 
                enrollment.course_title
            );
            
            // Get course details from instructor_course
            const [courseDetails] = await connection.execute(
                `SELECT 
                    id,
                    title,
                    description,
                    category,
                    duration,
                    image,
                    instructor_name as instructorName,
                    level,
                    price,
                    status as course_status
                FROM instructor_course 
                WHERE id = ?`,
                [actualCourseId]
            );
            
            const course = (courseDetails as any[])[0];
            
            if (!course) {
                console.log(`⚠️ Course still not found after correction: ${actualCourseId}`);
                continue;
            }
            
            // Get slides count
            const [slideCount] = await connection.execute(
                `SELECT COUNT(*) as total FROM course_slides WHERE course_id = ?`,
                [actualCourseId]
            );
            const totalSlides = (slideCount as any[])[0]?.total || 0;
            
            // Get completed slides count
            const [completedSlides] = await connection.execute(
                `SELECT COUNT(DISTINCT sp.slide_id) as completed
                FROM slide_progress sp
                JOIN course_slides cs ON sp.slide_id = cs.id
                WHERE sp.student_email = ? AND cs.course_id = ? AND sp.status = 'completed'`,
                [studentEmail, actualCourseId]
            );
            const completedSlidesCount = (completedSlides as any[])[0]?.completed || 0;
            
            // Get progress percentage from student_progress table
            const [progressData] = await connection.execute(
                `SELECT progress_percentage, status, last_accessed
                FROM student_progress 
                WHERE enrollment_id = ?`,
                [enrollment.enrollment_id]
            );
            
            const progress = (progressData as any[])[0] || {};
            const progressPercentage = progress.progress_percentage || 
                (totalSlides > 0 ? Math.round((completedSlidesCount / totalSlides) * 100) : 0);
            
            // Determine course status
            let courseStatus = 'not_started';
            if (progressPercentage === 100) {
                courseStatus = 'completed';
            } else if (progressPercentage > 0) {
                courseStatus = 'in_progress';
            }
            
            coursesWithProgress.push({
                id: course.id,
                title: course.title,
                image: course.image,
                duration: course.duration || 'Self-paced',
                level: course.level || 'Beginner',
                totalSlides: totalSlides,
                completedSlides: completedSlidesCount,
                progressPercentage: progressPercentage,
                lastAccessed: progress.last_accessed || enrollment.enrollment_date,
                status: courseStatus,
                enrolledDate: enrollment.enrollment_date
            });
        }

        // Quiz Statistics Query
        const [quizRows] = await connection.execute(
            `SELECT 
                COUNT(DISTINCT q.id) as total_quizzes,
                COUNT(DISTINCT qa.id) as attempted_quizzes,
                COUNT(DISTINCT CASE WHEN qa.passed = 1 THEN qa.id END) as passed_quizzes,
                COALESCE(ROUND(AVG(qa.score), 1), 0) as average_score,
                COALESCE(MAX(qa.score), 0) as highest_score,
                COUNT(DISTINCT CASE WHEN qa.id IS NULL AND q.status = 'published' THEN q.id END) as pending_quizzes
            FROM quizzes q
            LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id AND qa.student_email = ?
            WHERE q.status = 'published'`,
            [studentEmail]
        );

        // Recent Activity Query
        const [activityRows] = await connection.execute(
            `(
                SELECT 
                    'quiz_attempt' as activity_type,
                    CONCAT('Attempted quiz: ', q.title) as description,
                    qa.attempted_at as created_at,
                    CASE WHEN qa.passed = 1 THEN 'passed' ELSE 'failed' END as status,
                    qa.score as value,
                    qa.attempted_at as sort_date
                FROM quiz_attempts qa
                JOIN quizzes q ON qa.quiz_id = q.id
                WHERE qa.student_email = ?
            )
            UNION ALL
            (
                SELECT 
                    'slide_complete' as activity_type,
                    CONCAT('Completed lesson: ', cs.title) as description,
                    sp.completed_at as created_at,
                    'completed' as status,
                    NULL as value,
                    sp.completed_at as sort_date
                FROM slide_progress sp
                JOIN course_slides cs ON sp.slide_id = cs.id
                WHERE sp.student_email = ? AND sp.status = 'completed'
            )
            UNION ALL
            (
                SELECT 
                    'course_enrolled' as activity_type,
                    CONCAT('Enrolled in: ', e.course_title) as description,
                    e.enrollment_date as created_at,
                    'enrolled' as status,
                    NULL as value,
                    e.enrollment_date as sort_date
                FROM enrollments e
                WHERE e.student_email = ?
            )
            ORDER BY sort_date DESC
            LIMIT 10`,
            [studentEmail, studentEmail, studentEmail]
        );

        // Format the response
        const quizStats = (quizRows as any[])[0] || {
            total_quizzes: 0,
            attempted_quizzes: 0,
            passed_quizzes: 0,
            average_score: 0,
            highest_score: 0,
            pending_quizzes: 0
        };

        const totalCourses = coursesWithProgress.length;
        const completedCourses = coursesWithProgress.filter(c => c.status === 'completed').length;
        const inProgressCourses = coursesWithProgress.filter(c => c.status === 'in_progress').length;
        
        // Calculate overall progress percentage
        const totalProgress = coursesWithProgress.reduce((sum, course) => sum + course.progressPercentage, 0);
        const overallProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;

        return NextResponse.json({
            success: true,
            data: {
                quizStats: {
                    totalQuizzes: quizStats.total_quizzes || 0,
                    attemptedQuizzes: quizStats.attempted_quizzes || 0,
                    passedQuizzes: quizStats.passed_quizzes || 0,
                    averageScore: parseFloat(quizStats.average_score) || 0,
                    highestScore: quizStats.highest_score || 0,
                    pendingQuizzes: quizStats.pending_quizzes || 0,
                    passRate: quizStats.attempted_quizzes > 0 
                        ? Math.round((quizStats.passed_quizzes / quizStats.attempted_quizzes) * 100)
                        : 0
                },
                courses: coursesWithProgress,
                recentActivity: (activityRows as any[]).map(activity => ({
                    type: activity.activity_type,
                    description: activity.description,
                    createdAt: activity.created_at,
                    status: activity.status,
                    value: activity.value
                })),
                summary: {
                    totalCourses: totalCourses,
                    completedCourses: completedCourses,
                    inProgressCourses: inProgressCourses,
                    notStartedCourses: totalCourses - completedCourses - inProgressCourses,
                    totalQuizzes: quizStats.total_quizzes || 0,
                    completedQuizzes: quizStats.attempted_quizzes || 0,
                    passRate: quizStats.attempted_quizzes > 0 
                        ? Math.round((quizStats.passed_quizzes / quizStats.attempted_quizzes) * 100)
                        : 0,
                    overallProgress: overallProgress
                }
            }
        });

    } catch (error: any) {
        console.error('❌ Error fetching dashboard data:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to fetch dashboard data',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
}