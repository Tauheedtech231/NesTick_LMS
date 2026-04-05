// /app/api/students/slide/auto-complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */

// Helper function to find correct course ID
async function findCorrectCourseId(connection: any, courseId: string, studentEmail: string) {
    try {
        // Get course title from enrollment
        const [enrollment] = await connection.execute(
            `SELECT course_title FROM enrollments 
             WHERE course_id = ? AND student_email = ? 
             LIMIT 1`,
            [courseId, studentEmail]
        );
        
        if ((enrollment as any[]).length === 0) {
            return { found: false, error: 'Enrollment not found', originalId: courseId };
        }
        
        const courseTitle = (enrollment as any[])[0].course_title;
        console.log(`🔍 Searching for course with title: "${courseTitle}"`);
        
        // Find course in instructor_course by title
        const [course] = await connection.execute(
            `SELECT id, title FROM instructor_course 
             WHERE title = ? OR title LIKE ? 
             LIMIT 1`,
            [courseTitle, `%${courseTitle}%`]
        );
        
        if ((course as any[]).length > 0) {
            const correctId = (course as any[])[0].id;
            console.log(`✅ Found correct course ID: ${correctId} (original: ${courseId})`);
            return { found: true, correctId, originalId: courseId, title: courseTitle };
        }
        
        return { found: false, error: `No course found with title: ${courseTitle}`, originalId: courseId };
    } catch (error: any) {
        console.error('Error finding course:', error);
        return { found: false, error: error.message, originalId: courseId };
    }
}

export async function POST(request: NextRequest) {
    let connection;
    try {
        const { enrollmentId, studentEmail, courseId, slideId } = await request.json();

        console.log('🤖 Auto-complete slide:', { enrollmentId, slideId, courseId });

        if (!enrollmentId || !studentEmail || !courseId || !slideId) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        connection = await getConnection();
        
        // ✅ FIX: Find correct course ID first
        const courseMatch = await findCorrectCourseId(connection, courseId, studentEmail);
        
        if (!courseMatch.found) {
            console.error('❌ Course not found error:', courseMatch);
            return NextResponse.json(
                { 
                    success: false, 
                    error: courseMatch.error,
                    details: {
                        originalCourseId: courseMatch.originalId,
                        studentEmail,
                        enrollmentId
                    }
                },
                { status: 404 }
            );
        }
        
        const actualCourseId = courseMatch.correctId;
        console.log(`✅ Using correct course ID: ${actualCourseId} (original: ${courseId})`);
        
        await connection.beginTransaction();

        // 1. Check if slide exists with actual course ID
        const [slideCheck] = await connection.execute(
            `SELECT id FROM course_slides WHERE id = ? AND course_id = ?`,
            [slideId, actualCourseId]
        );

        if ((slideCheck as any[]).length === 0) {
            await connection.rollback();
            console.error('❌ Slide not found:', { slideId, actualCourseId });
            return NextResponse.json(
                { success: false, error: 'Slide not found for this course' },
                { status: 404 }
            );
        }

        // 2. Get all files for this slide
        const [slideFiles] = await connection.execute(
            `SELECT id FROM slide_files WHERE slide_id = ?`,
            [slideId]
        );
        console.log(`📁 Found ${(slideFiles as any[]).length} files for slide ${slideId}`);

        // 3. Mark all files as viewed in content_views
        for (const file of (slideFiles as any[])) {
            const [existingView] = await connection.execute(
                `SELECT id FROM content_views 
                 WHERE enrollment_id = ? AND slide_id = ? AND content_id = ?`,
                [enrollmentId, slideId, file.id]
            );

            if ((existingView as any[]).length === 0) {
                const viewId = uuidv4();
                await connection.execute(
                    `INSERT INTO content_views 
                     (id, enrollment_id, student_email, course_id, slide_id, content_id, completed, viewed_at, duration_watched)
                     VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), 0)`,
                    [viewId, enrollmentId, studentEmail, actualCourseId, slideId, file.id]
                );
                console.log(`✅ Marked file ${file.id} as viewed`);
            } else {
                await connection.execute(
                    `UPDATE content_views 
                     SET completed = 1, viewed_at = NOW()
                     WHERE enrollment_id = ? AND slide_id = ? AND content_id = ?`,
                    [enrollmentId, slideId, file.id]
                );
                console.log(`✅ Updated file ${file.id} to completed`);
            }
        }

        // 4. Update or insert slide_progress
        const [existingProgress] = await connection.execute(
            `SELECT id FROM slide_progress WHERE enrollment_id = ? AND slide_id = ?`,
            [enrollmentId, slideId]
        );

        if ((existingProgress as any[]).length > 0) {
            await connection.execute(
                `UPDATE slide_progress 
                 SET status = 'completed',
                     completed_at = NOW(),
                     updated_at = NOW()
                 WHERE enrollment_id = ? AND slide_id = ?`,
                [enrollmentId, slideId]
            );
            console.log(`✅ Updated slide_progress for ${slideId}`);
        } else {
            const progressId = uuidv4();
            await connection.execute(
                `INSERT INTO slide_progress 
                 (id, enrollment_id, student_email, course_id, slide_id, status, completed_at, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, 'completed', NOW(), NOW(), NOW())`,
                [progressId, enrollmentId, studentEmail, actualCourseId, slideId]
            );
            console.log(`✅ Created slide_progress for ${slideId}`);
        }

        // 5. Get ALL completed slides from slide_progress
        const [completedRows] = await connection.execute(
            `SELECT slide_id FROM slide_progress 
             WHERE enrollment_id = ? AND status = 'completed'`,
            [enrollmentId]
        );
        
        const completedSlideIds = (completedRows as any[]).map(row => row.slide_id);
        console.log(`📊 Total completed slides: ${completedSlideIds.length}`);

        // 6. Get total slides count
        const [totalRows] = await connection.execute(
            `SELECT COUNT(*) as count FROM course_slides WHERE course_id = ?`,
            [actualCourseId]
        );
        const totalSlides = (totalRows as any[])[0]?.count || 1;

        // 7. Calculate progress
        const progressPercentage = Math.round((completedSlideIds.length / totalSlides) * 100);
        const status = progressPercentage === 100 ? 'completed' : 'in_progress';

        // 8. Get content keys for all files
        const contentKeys = (slideFiles as any[]).map(f => `${slideId}_${f.id}`);
        
        // 9. Update student_progress
        const [studentProgress] = await connection.execute(
            `SELECT id, completed_content FROM student_progress WHERE enrollment_id = ?`,
            [enrollmentId]
        );

        const slidesJson = JSON.stringify(completedSlideIds);
        
        let existingContent: string[] = [];
        if ((studentProgress as any[]).length > 0) {
            const existing = (studentProgress as any[])[0];
            try {
                if (existing.completed_content) {
                    existingContent = JSON.parse(existing.completed_content);
                    if (!Array.isArray(existingContent)) existingContent = [];
                }
            } catch (e) {
                console.log('⚠️ Failed to parse completed_content, using empty array');
                existingContent = [];
            }
        }
        
        const mergedContent = [...new Set([...existingContent, ...contentKeys])];
        const contentJson = JSON.stringify(mergedContent);

        if ((studentProgress as any[]).length > 0) {
            await connection.execute(
                `UPDATE student_progress 
                 SET completed_slides = ?,
                     completed_content = ?,
                     progress_percentage = ?,
                     status = ?,
                     last_accessed = NOW(),
                     updated_at = NOW()
                 WHERE enrollment_id = ?`,
                [slidesJson, contentJson, progressPercentage, status, enrollmentId]
            );
            console.log(`✅ Updated student_progress: ${completedSlideIds.length}/${totalSlides} slides, ${mergedContent.length} content items`);
        } else {
            const progressId = uuidv4();
            await connection.execute(
                `INSERT INTO student_progress 
                 (id, enrollment_id, student_email, course_id, completed_slides, completed_content, progress_percentage, status, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [progressId, enrollmentId, studentEmail, actualCourseId, slidesJson, contentJson, progressPercentage, status]
            );
            console.log(`✅ Created student_progress record`);
        }

        await connection.commit();

        return NextResponse.json({
            success: true,
            data: {
                slideCompleted: true,
                completedSlides: completedSlideIds.length,
                totalSlides,
                progressPercentage,
                status,
                contentItemsCompleted: mergedContent.length,
                usedCourseId: actualCourseId,
                originalCourseId: courseId
            },
            message: 'Slide completed successfully!'
        });

    } catch (error: any) {
        if (connection) await connection.rollback();
        console.error('❌ Error in auto-complete:', error);
        
        // Print detailed error
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sql: error.sql,
            sqlMessage: error.sqlMessage
        });
        
        return NextResponse.json(
            { 
                success: false, 
                error: error.message || 'Failed to complete slide',
                details: process.env.NODE_ENV === 'development' ? {
                    message: error.message,
                    code: error.code,
                    sqlMessage: error.sqlMessage
                } : undefined
            },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
}