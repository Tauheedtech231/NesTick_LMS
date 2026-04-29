// /app/api/students/assignment/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */

// Helper: Find correct course ID
async function findCorrectCourseId(connection: any, courseId: string, studentEmail: string) {
    try {
        console.log('🔍 Finding correct course ID for assignment:', { courseId, studentEmail });
        
        let [course] = await connection.execute(
            `SELECT id, title FROM instructor_course WHERE id = ?`,
            [courseId]
        );
        
        if ((course as any[]).length > 0) {
            console.log('✅ Course found by ID:', (course as any[])[0].id);
            return { found: true, courseId: (course as any[])[0].id, courseTitle: (course as any[])[0].title };
        }
        
        const [enrollment] = await connection.execute(
            `SELECT course_id, course_title FROM enrollments 
             WHERE (course_id = ? OR id = ?) AND student_email = ?
             LIMIT 1`,
            [courseId, courseId, studentEmail]
        );
        
        if ((enrollment as any[]).length > 0) {
            const enrollCourseId = (enrollment as any[])[0].course_id;
            const courseTitle = (enrollment as any[])[0].course_title;
            
            [course] = await connection.execute(
                `SELECT id, title FROM instructor_course WHERE title = ? OR title LIKE ? LIMIT 1`,
                [courseTitle, `%${courseTitle}%`]
            );
            
            if ((course as any[]).length > 0) {
                console.log('✅ Course found by title from enrollment:', (course as any[])[0].id);
                return { found: true, courseId: (course as any[])[0].id, courseTitle: (course as any[])[0].title };
            }
        }
        
        console.log('❌ Course not found:', courseId);
        return { found: false, error: 'Course not found' };
        
    } catch (error) {
        console.error('Error finding course:', error);
        return { found: false, error: 'Database error' };
    }
}

// Helper: Find correct enrollment
async function findCorrectEnrollment(connection: any, enrollmentId: string, studentEmail: string, actualCourseId: string, courseTitle: string) {
    try {
        let [enrollment] = await connection.execute(
            `SELECT id as enrollment_id, student_name, student_id, course_id, course_title
             FROM enrollments 
             WHERE id = ? AND student_email = ? AND status = 'active' AND payment_status = 'verified'
             LIMIT 1`,
            [enrollmentId, studentEmail]
        );
        
        if ((enrollment as any[]).length > 0) {
            console.log('✅ Enrollment found by ID:', (enrollment as any[])[0].enrollment_id);
            return { found: true, enrollment: (enrollment as any[])[0] };
        }
        
        [enrollment] = await connection.execute(
            `SELECT id as enrollment_id, student_name, student_id, course_id, course_title
             FROM enrollments 
             WHERE student_email = ? AND course_id = ? AND status = 'active' AND payment_status = 'verified'
             LIMIT 1`,
            [studentEmail, actualCourseId]
        );
        
        if ((enrollment as any[]).length > 0) {
            console.log('✅ Enrollment found by course ID:', (enrollment as any[])[0].enrollment_id);
            return { found: true, enrollment: (enrollment as any[])[0] };
        }
        
        [enrollment] = await connection.execute(
            `SELECT id as enrollment_id, student_name, student_id, course_id, course_title
             FROM enrollments 
             WHERE student_email = ? AND course_title = ? AND status = 'active' AND payment_status = 'verified'
             LIMIT 1`,
            [studentEmail, courseTitle]
        );
        
        if ((enrollment as any[]).length > 0) {
            console.log('✅ Enrollment found by course title:', (enrollment as any[])[0].enrollment_id);
            return { found: true, enrollment: (enrollment as any[])[0] };
        }
        
        [enrollment] = await connection.execute(
            `SELECT id as enrollment_id, student_name, student_id, course_id, course_title
             FROM enrollments 
             WHERE student_email = ? AND status = 'active' AND payment_status = 'verified'
             LIMIT 1`,
            [studentEmail]
        );
        
        if ((enrollment as any[]).length > 0) {
            console.log('⚠️ Using any active enrollment:', (enrollment as any[])[0].enrollment_id);
            return { found: true, enrollment: (enrollment as any[])[0] };
        }
        
        return { found: false, error: 'No active enrollment found' };
        
    } catch (error) {
        console.error('Error finding enrollment:', error);
        return { found: false, error: 'Database error' };
    }
}

// ✅ NEW: Helper to save file to database
async function saveFileToDatabase(connection: any, file: File, assignmentId: string, studentEmail: string, studentName: string) {
    const fileId = uuidv4();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await connection.execute(
        `INSERT INTO assignment_files 
         (id, assignment_id, student_email, student_name, file_name, file_type, file_size, file_data, uploaded_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [fileId, assignmentId, studentEmail, studentName, file.name, file.type, file.size, buffer]
    );
    
    return {
        id: fileId,
        name: file.name,
        type: file.type,
        size: file.size,
        url: `/api/students/assignment/file/${fileId}`
    };
}

export async function POST(request: NextRequest) {
    let connection;
    try {
        const formData = await request.formData();
        console.log('📥Rece',formData)
        
        let enrollmentId = formData.get('enrollmentId') as string;
        const studentEmail = formData.get('studentEmail') as string;
        const studentName = formData.get('studentName') as string;
        let courseId = formData.get('courseId') as string;
        const slideId = formData.get('slideId') as string;
        const assignmentId = formData.get('assignmentId') as string;
        
        // ✅ NEW: Get files directly (not JSON string)
        const files = formData.getAll('files') as File[];

        console.log('📝 Assignment submission received:', { 
            enrollmentId, 
            studentEmail, 
            courseId, 
            slideId,
            assignmentId,
            filesCount: files.length
        });

        // Validate required fields
        if (!studentEmail) {
            return NextResponse.json(
                { success: false, error: 'studentEmail is required' },
                { status: 400 }
            );
        }
        
        if (!courseId) {
            return NextResponse.json(
                { success: false, error: 'courseId is required' },
                { status: 400 }
            );
        }
        
        if (!assignmentId) {
            return NextResponse.json(
                { success: false, error: 'assignmentId is required' },
                { status: 400 }
            );
        }

        if (files.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No files uploaded' },
                { status: 400 }
            );
        }

        // ✅ Validate file sizes (max 64MB each)
        for (const file of files) {
            if (file.size > 64 * 1024 * 1024) {
                return NextResponse.json(
                    { success: false, error: `File ${file.name} exceeds 64MB limit` },
                    { status: 400 }
                );
            }
        }

        connection = await getConnection();

        // Find correct course ID
        const courseMatch = await findCorrectCourseId(connection, courseId, studentEmail);
        
        if (!courseMatch.found) {
            return NextResponse.json(
                { success: false, error: courseMatch.error || 'Course not found' },
                { status: 404 }
            );
        }
        
        const actualCourseId = courseMatch.courseId;
        const courseTitle = courseMatch.courseTitle;
        
        console.log('✅ Using actual course ID:', actualCourseId);

        // Start transaction
        await connection.beginTransaction();

        // Find correct enrollment
        const enrollmentMatch = await findCorrectEnrollment(connection, enrollmentId, studentEmail, actualCourseId, courseTitle);
        
        if (!enrollmentMatch.found) {
            await connection.rollback();
            return NextResponse.json(
                { success: false, error: enrollmentMatch.error || 'No active enrollment found' },
                { status: 404 }
            );
        }
        
        const actualEnrollment = enrollmentMatch.enrollment;
        const actualEnrollmentId = actualEnrollment.enrollment_id;
        const actualStudentName = actualEnrollment.student_name || studentName || 'Student';

        console.log('✅ Using enrollment:', { 
            actualEnrollmentId, 
            actualStudentName,
        });

        // Check if assignment exists
        const [assignmentRows] = await connection.execute(
            `SELECT id, title FROM course_assignments WHERE id = ? AND course_id = ?`,
            [assignmentId, actualCourseId]
        );

        if ((assignmentRows as any[]).length === 0) {
            await connection.rollback();
            return NextResponse.json(
                { success: false, error: 'Assignment not found for this course' },
                { status: 404 }
            );
        }

        // ✅ NEW: Save each file to database and collect file info
        const savedFiles = [];
        for (const file of files) {
            const savedFile = await saveFileToDatabase(connection, file, assignmentId, studentEmail, actualStudentName);
            savedFiles.push(savedFile);
        }
        
        const filesJson = JSON.stringify(savedFiles);

        // Check if already submitted
        const [existing] = await connection.execute(
            `SELECT id FROM assignment_submissions WHERE enrollment_id = ? AND assignment_id = ?`,
            [actualEnrollmentId, assignmentId]
        );

        if ((existing as any[]).length > 0) {
            // Update existing
            await connection.execute(
                `UPDATE assignment_submissions 
                 SET files = ?, 
                     submitted_at = NOW(), 
                     status = 'submitted', 
                     updated_at = NOW()
                 WHERE enrollment_id = ? AND assignment_id = ?`,
                [filesJson, actualEnrollmentId, assignmentId]
            );
            console.log('✅ Assignment submission updated');
        } else {
            // Insert new
            const submissionId = uuidv4();
            await connection.execute(
                `INSERT INTO assignment_submissions 
                 (id, enrollment_id, student_email, student_name, course_id, slide_id, assignment_id, files, submitted_at, status, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'submitted', NOW(), NOW())`,
                [submissionId, actualEnrollmentId, studentEmail, actualStudentName, actualCourseId, slideId || null, assignmentId, filesJson]
            );
            console.log('✅ New assignment submission created:', submissionId);
        }

        // Update progress
        try {
            const [slideRows] = await connection.execute(
                `SELECT COUNT(*) as count FROM course_slides WHERE course_id = ?`,
                [actualCourseId]
            );
            const totalSlides = (slideRows as any[])[0]?.count || 0;

            const [progressRows] = await connection.execute(
                `SELECT * FROM student_progress WHERE enrollment_id = ?`,
                [actualEnrollmentId]
            );

            let completedSlides: string[] = [];
            let completedContent: string[] = [];

            if ((progressRows as any[]).length > 0) {
                const progress = (progressRows as any[])[0];
                
                try {
                    completedSlides = progress.completed_slides ? JSON.parse(progress.completed_slides) : [];
                } catch (e) {
                    completedSlides = [];
                }
                
                try {
                    completedContent = progress.completed_content ? JSON.parse(progress.completed_content) : [];
                } catch (e) {
                    completedContent = [];
                }
            }

            // Add assignment to completed content
            const contentKey = `${slideId || 'assignment'}_${assignmentId}`;
            if (!completedContent.includes(contentKey)) {
                completedContent.push(contentKey);
                console.log(`✅ Assignment ${assignmentId} marked as complete`);
            }

            const progressPercentage = totalSlides > 0 
                ? Math.round((completedSlides.length / totalSlides) * 100) 
                : 0;

            const status = progressPercentage === 100 ? 'completed' : 
                          progressPercentage > 0 ? 'in_progress' : 'not_started';

            if ((progressRows as any[]).length > 0) {
                await connection.execute(
                    `UPDATE student_progress 
                     SET completed_content = ?,
                         progress_percentage = ?,
                         status = ?,
                         last_accessed = NOW(),
                         updated_at = NOW()
                     WHERE enrollment_id = ?`,
                    [
                        JSON.stringify(completedContent),
                        progressPercentage,
                        status,
                        actualEnrollmentId
                    ]
                );
            } else {
                const progressId = uuidv4();
                await connection.execute(
                    `INSERT INTO student_progress 
                     (id, enrollment_id, student_email, course_id, completed_slides, completed_content, progress_percentage, status, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                    [progressId, actualEnrollmentId, studentEmail, actualCourseId, JSON.stringify(completedSlides), JSON.stringify(completedContent), progressPercentage, status]
                );
            }

            console.log('✅ Progress updated:', { progressPercentage, status });

        } catch (progressError: any) {
            console.error('❌ Error updating progress:', progressError);
        }

        await connection.commit();

        return NextResponse.json({
            success: true,
            message: 'Assignment submitted successfully',
            data: {
                assignmentId,
                submittedAt: new Date().toISOString(),
                files: savedFiles,
                usedCourseId: actualCourseId,
                usedEnrollmentId: actualEnrollmentId
            }
        });

    } catch (error: any) {
        if (connection) await connection.rollback();
        console.error('❌ Error submitting assignment:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to submit assignment' },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
}