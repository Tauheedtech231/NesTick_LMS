// /app/api/students/track/content-view/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */

// Helper function to find correct course ID - NO AUTO-CREATE
async function findCorrectCourseId(connection: any, courseId: string, studentEmail: string) {
    try {
        // First, check if course exists in instructor_course by the ID itself
        const [courseById] = await connection.execute(
            `SELECT id FROM instructor_course WHERE id = ?`,
            [courseId]
        );
        
        if ((courseById as any[]).length > 0) {
            console.log(`✅ Course found by ID: ${courseId}`);
            return { found: true, courseId: courseId };
        }
        
        // If not found by ID, get course title from enrollment
        const [enrollment] = await connection.execute(
            `SELECT course_title FROM enrollments 
             WHERE course_id = ? AND student_email = ? 
             LIMIT 1`,
            [courseId, studentEmail]
        );
        
        if ((enrollment as any[]).length === 0) {
            console.log(`❌ No enrollment found for course_id: ${courseId}`);
            return { found: false, error: 'Enrollment not found' };
        }
        
        const courseTitle = (enrollment as any[])[0].course_title;
        console.log(`🔍 Searching for course with title: "${courseTitle}"`);
        
        // Search by title
        const [courseByTitle] = await connection.execute(
            `SELECT id FROM instructor_course 
             WHERE title = ? OR title LIKE ? 
             LIMIT 1`,
            [courseTitle, `%${courseTitle}%`]
        );
        
        if ((courseByTitle as any[]).length > 0) {
            const foundId = (courseByTitle as any[])[0].id;
            console.log(`✅ Course found by title: ${foundId}`);
            return { found: true, courseId: foundId };
        }
        
        // ❌ Course not found - return error, DO NOT CREATE
        console.log(`❌ Course not found in instructor_course: ${courseId} / ${courseTitle}`);
        return { found: false, error: `Course "${courseTitle}" not found in instructor_course table` };
        
    } catch (error) {
        console.error('Error finding course:', error);
        return { found: false, error: 'Database error' };
    }
}

export async function POST(request: NextRequest) {
    let connection;
    try {
        const body = await request.json();
        const { 
            enrollmentId,
            studentEmail,
            courseId,
            slideId,
            contentId,
            durationWatched,
            completed 
        } = body;

        console.log('📝 Tracking content view:', { 
            enrollmentId, 
            slideId, 
            contentId, 
            durationWatched, 
            completed,
            originalCourseId: courseId
        });

        if (!enrollmentId || !studentEmail || !courseId || !slideId || !contentId) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        connection = await getConnection();

        // ✅ Find correct course ID
        const courseMatch = await findCorrectCourseId(connection, courseId, studentEmail);
        
        if (!courseMatch.found) {
            console.log(`❌ Course not found, returning error without creating`);
            return NextResponse.json(
                { 
                    success: false, 
                    error: courseMatch.error || 'Course not found in instructor_course table',
                    originalCourseId: courseId
                },
                { status: 404 }
            );
        }
        
        const actualCourseId = courseMatch.courseId;
        console.log(`✅ Using correct course ID: ${actualCourseId} (original: ${courseId})`);

        await connection.beginTransaction();

        // 1. Insert or update content view
        const [existingView] = await connection.execute(
            `SELECT id FROM content_views 
             WHERE enrollment_id = ? AND slide_id = ? AND content_id = ?`,
            [enrollmentId, slideId, contentId]
        );

        if ((existingView as any[]).length > 0) {
            await connection.execute(
                `UPDATE content_views 
                 SET viewed_at = NOW(), 
                     duration_watched = duration_watched + ?,
                     completed = ?
                 WHERE enrollment_id = ? AND slide_id = ? AND content_id = ?`,
                [durationWatched || 0, completed ? 1 : 0, enrollmentId, slideId, contentId]
            );
            console.log(`✅ Updated content view for ${contentId}`);
        } else {
            const viewId = uuidv4();
            await connection.execute(
                `INSERT INTO content_views 
                 (id, enrollment_id, student_email, course_id, slide_id, content_id, duration_watched, completed, viewed_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [viewId, enrollmentId, studentEmail, actualCourseId, slideId, contentId, durationWatched || 0, completed ? 1 : 0]
            );
            console.log(`✅ Created content view for ${contentId}`);
        }

        // 2. Get total files for this slide
        const [totalFiles] = await connection.execute(
            `SELECT COUNT(*) as count FROM slide_files WHERE slide_id = ?`,
            [slideId]
        );
        const totalFilesCount = (totalFiles as any[])[0]?.count || 0;

        // 3. Get completed files for this slide
        const [completedFiles] = await connection.execute(
            `SELECT COUNT(*) as count FROM content_views 
             WHERE enrollment_id = ? AND slide_id = ? AND completed = 1`,
            [enrollmentId, slideId]
        );
        const completedFilesCount = (completedFiles as any[])[0]?.count || 0;

        console.log(`📊 Slide ${slideId}: ${completedFilesCount}/${totalFilesCount} files completed`);

        // 4. Determine slide status
        let slideStatus = 'not_started';
        if (totalFilesCount === 0) {
            slideStatus = 'completed';
        } else if (completedFilesCount === totalFilesCount) {
            slideStatus = 'completed';
        } else if (completedFilesCount > 0) {
            slideStatus = 'in_progress';
        }

        // 5. Update slide_progress
        const [existingProgress] = await connection.execute(
            `SELECT id FROM slide_progress WHERE enrollment_id = ? AND slide_id = ?`,
            [enrollmentId, slideId]
        );

        if ((existingProgress as any[]).length > 0) {
            await connection.execute(
                `UPDATE slide_progress 
                 SET status = ?,
                     time_spent = time_spent + ?,
                     last_accessed = NOW(),
                     completed_at = CASE WHEN ? = 'completed' AND completed_at IS NULL THEN NOW() ELSE completed_at END,
                     updated_at = NOW()
                 WHERE enrollment_id = ? AND slide_id = ?`,
                [slideStatus, durationWatched || 0, slideStatus, enrollmentId, slideId]
            );
            console.log(`✅ Updated slide_progress for ${slideId} with status: ${slideStatus}`);
        } else {
            const progressId = uuidv4();
            await connection.execute(
                `INSERT INTO slide_progress 
                 (id, enrollment_id, student_email, course_id, slide_id, status, time_spent, last_accessed, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
                [progressId, enrollmentId, studentEmail, actualCourseId, slideId, slideStatus, durationWatched || 0]
            );
            console.log(`✅ Created slide_progress for ${slideId} with status: ${slideStatus}`);
        }

        // 6. Get ALL completed slides
        const [completedRows] = await connection.execute(
            `SELECT slide_id FROM slide_progress 
             WHERE enrollment_id = ? AND status = 'completed'`,
            [enrollmentId]
        );
        
        const completedSlideIds = (completedRows as any[]).map(row => row.slide_id);
        console.log(`📊 Total completed slides: ${completedSlideIds.length}`);

        // 7. Get total slides count
        const [totalSlides] = await connection.execute(
            `SELECT COUNT(*) as count FROM course_slides WHERE course_id = ?`,
            [actualCourseId]
        );
        const totalSlidesCount = (totalSlides as any[])[0]?.count || 1;

        // 8. Calculate course progress
        const courseProgress = Math.round((completedSlideIds.length / totalSlidesCount) * 100);
        const courseStatus = courseProgress === 100 ? 'completed' : 'in_progress';

        // 9. Get current student_progress
        const [progressRows] = await connection.execute(
            `SELECT * FROM student_progress WHERE enrollment_id = ?`,
            [enrollmentId]
        );

        let completedContent: string[] = [];

        if ((progressRows as any[]).length > 0) {
            const progress = (progressRows as any[])[0];
            
            try {
                if (progress.completed_content) {
                    if (typeof progress.completed_content === 'string') {
                        const cleanStr = progress.completed_content.trim();
                        if (cleanStr.startsWith('[')) {
                            completedContent = JSON.parse(cleanStr);
                        } else if (cleanStr === '') {
                            completedContent = [];
                        } else {
                            completedContent = [];
                        }
                    } else if (Array.isArray(progress.completed_content)) {
                        completedContent = progress.completed_content;
                    } else {
                        completedContent = [];
                    }
                }
                if (!Array.isArray(completedContent)) completedContent = [];
            } catch (e) {
                console.warn('⚠️ Failed to parse completed_content, using empty array');
                completedContent = [];
            }

            // Add current content
            const contentKey = `${slideId}_${contentId}`;
            if (completed && !completedContent.includes(contentKey)) {
                completedContent.push(contentKey);
                console.log(`✅ Added to completed_content: ${contentKey}`);
            }
        }

        // 10. Update student_progress
        if ((progressRows as any[]).length > 0) {
            await connection.execute(
                `UPDATE student_progress 
                 SET completed_slides = ?,
                     completed_content = ?,
                     progress_percentage = ?,
                     status = ?,
                     last_accessed = NOW(),
                     updated_at = NOW()
                 WHERE enrollment_id = ?`,
                [
                    JSON.stringify(completedSlideIds),
                    JSON.stringify(completedContent),
                    courseProgress,
                    courseStatus,
                    enrollmentId
                ]
            );
            console.log(`✅ Updated student_progress: ${completedSlideIds.length} slides, ${completedContent.length} contents`);
        } else {
            const newProgressId = uuidv4();
            const contentKey = `${slideId}_${contentId}`;
            const initialContent = completed ? [contentKey] : [];
            
            await connection.execute(
                `INSERT INTO student_progress 
                 (id, enrollment_id, student_email, course_id, completed_slides, completed_content, progress_percentage, status, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [
                    newProgressId, 
                    enrollmentId, 
                    studentEmail, 
                    actualCourseId, 
                    JSON.stringify(completedSlideIds),
                    JSON.stringify(initialContent),
                    courseProgress,
                    courseStatus
                ]
            );
            console.log(`✅ Created new student_progress`);
        }

        await connection.commit();

        return NextResponse.json({
            success: true,
            data: {
                contentTracked: true,
                slideProgress: {
                    status: slideStatus,
                    completedFiles: completedFilesCount,
                    totalFiles: totalFilesCount,
                    progress: totalFilesCount > 0 ? Math.round((completedFilesCount / totalFilesCount) * 100) : 100
                },
                courseProgress,
                completedSlides: completedSlideIds.length,
                totalSlides: totalSlidesCount
            },
            message: completed ? 'Content marked as complete' : 'Progress updated'
        });

    } catch (error: any) {
        if (connection) await connection.rollback();
        console.error('❌ Error tracking content view:', error);
        
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to track content view' },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
}