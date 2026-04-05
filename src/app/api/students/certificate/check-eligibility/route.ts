// /app/api/students/certificate/check-eligibility/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */

// Helper function to find correct course ID
async function findCorrectCourseId(connection: any, courseId: string, studentEmail: string) {
    try {
        // First, check if course exists by ID in instructor_course
        const [courseById] = await connection.execute(
            `SELECT id FROM instructor_course WHERE id = ?`,
            [courseId]
        );
        
        if ((courseById as any[]).length > 0) {
            return courseId;
        }
        
        // If not found, get course title from enrollment
        const [enrollment] = await connection.execute(
            `SELECT course_title FROM enrollments 
             WHERE student_email = ? AND course_id = ?
             LIMIT 1`,
            [studentEmail, courseId]
        );
        
        if ((enrollment as any[]).length > 0) {
            const courseTitle = (enrollment as any[])[0].course_title;
            console.log(`🔍 Eligibility - Searching for course by title: "${courseTitle}"`);
            
            // Search by title
            const [courseByTitle] = await connection.execute(
                `SELECT id FROM instructor_course WHERE title = ? OR title LIKE ? LIMIT 1`,
                [courseTitle, `%${courseTitle}%`]
            );
            
            if ((courseByTitle as any[]).length > 0) {
                const correctId = (courseByTitle as any[])[0].id;
                console.log(`✅ Eligibility - Found correct course ID: ${correctId} (was: ${courseId})`);
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
        const studentEmail = searchParams.get('studentEmail');
        const courseId = searchParams.get('courseId');

        if (!studentEmail || !courseId) {
            return NextResponse.json(
                { success: false, error: 'Student email and course ID required' },
                { status: 400 }
            );
        }

        console.log('📊 Checking certificate eligibility:', { studentEmail, courseId });

        connection = await getConnection();

        // ✅ FIX: Find correct course ID
        const actualCourseId = await findCorrectCourseId(connection, courseId, studentEmail);
        console.log(`✅ Using actual course ID: ${actualCourseId} (original: ${courseId})`);

        // Check if certificate already exists (using actualCourseId)
        const [existingCert] = await connection.execute(
            `SELECT id FROM certificates WHERE student_email = ? AND course_id = ?`,
            [studentEmail, actualCourseId]
        );

        if ((existingCert as any[]).length > 0) {
            return NextResponse.json({
                success: true,
                data: {
                    eligible: true,
                    hasCertificate: true,
                    certificateId: (existingCert as any[])[0].id,
                    completed: 0,
                    total: 0,
                    progress: 100
                }
            });
        }

        // Get enrollment ID
        const [enrollmentRows] = await connection.execute(
            `SELECT id FROM enrollments 
             WHERE student_email = ? AND course_id = ?
             LIMIT 1`,
            [studentEmail, courseId]
        );

        let enrollmentId = null;
        if ((enrollmentRows as any[]).length > 0) {
            enrollmentId = (enrollmentRows as any[])[0].id;
        }

        // Get total slides for this course using actualCourseId
        const [totalSlides] = await connection.execute(
            `SELECT COUNT(*) as total FROM course_slides WHERE course_id = ?`,
            [actualCourseId]
        );
        const total = (totalSlides as any[])[0]?.total || 0;

        // Get completed slides from slide_progress
        let completed = 0;
        if (enrollmentId) {
            const [completedSlides] = await connection.execute(
                `SELECT COUNT(*) as completed FROM slide_progress 
                 WHERE enrollment_id = ? AND status = 'completed'`,
                [enrollmentId]
            );
            completed = (completedSlides as any[])[0]?.completed || 0;
        }

        // Also check from student_progress table
        if (enrollmentId) {
            const [studentProgress] = await connection.execute(
                `SELECT progress_percentage, completed_slides FROM student_progress 
                 WHERE enrollment_id = ?`,
                [enrollmentId]
            );
            
            if ((studentProgress as any[]).length > 0) {
                const progress = (studentProgress as any[])[0];
                if (progress.progress_percentage === 100) {
                    completed = total;
                } else if (progress.completed_slides) {
                    try {
                        const completedSlidesArr = JSON.parse(progress.completed_slides);
                        if (Array.isArray(completedSlidesArr) && completedSlidesArr.length > completed) {
                            completed = completedSlidesArr.length;
                        }
                    } catch (e) {
                        // Ignore parse error
                    }
                }
            }
        }

        // Calculate progress percentage
        const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        const isEligible = progressPercentage === 100 && total > 0;

        console.log(`📊 Eligibility result: total=${total}, completed=${completed}, progress=${progressPercentage}%, eligible=${isEligible}`);

        return NextResponse.json({
            success: true,
            data: {
                eligible: isEligible,
                hasCertificate: false,
                completed: completed,
                total: total,
                progress: progressPercentage,
                actualCourseId: actualCourseId // For debugging
            }
        });

    } catch (error: any) {
        console.error('❌ Error checking eligibility:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error.message || 'Failed to check eligibility',
                data: {
                    eligible: false,
                    hasCertificate: false,
                    completed: 0,
                    total: 0,
                    progress: 0
                }
            },
            { status: 200 } // Return 200 with default data
        );
    } finally {
        if (connection) connection.release();
    }
}