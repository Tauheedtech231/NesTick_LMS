// /app/api/students/certificate/issue/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */

export async function POST(request: NextRequest) {
    let connection;
    try {
        const body = await request.json();
        let { studentEmail, courseId } = body;

        console.log('📜 Certificate issuance requested:', { studentEmail, courseId });

        if (!studentEmail || !courseId) {
            return NextResponse.json(
                { success: false, error: 'Student email and course ID are required' },
                { status: 400 }
            );
        }

        connection = await getConnection();

        // ✅ STEP 1: Get course title from either instructor_course or enrollment
        let courseTitle = '';
        let actualCourseId = '';
        
        // Try to find in instructor_course first
        let [courseRows] = await connection.execute(
            `SELECT id, title FROM instructor_course WHERE id = ? OR title LIKE ? LIMIT 1`,
            [courseId, `%${courseId}%`]
        );
        
        if ((courseRows as any[]).length > 0) {
            actualCourseId = (courseRows as any[])[0].id;
            courseTitle = (courseRows as any[])[0].title;
            console.log('✅ Found course in instructor_course:', { actualCourseId, courseTitle });
        } else {
            // If not found, get title from enrollment using the provided ID
            const [enrollmentCourse] = await connection.execute(
                `SELECT course_title, course_id FROM enrollments 
                 WHERE (course_id = ? OR id = ?) AND student_email = ?
                 LIMIT 1`,
                [courseId, courseId, studentEmail]
            );
            
            if ((enrollmentCourse as any[]).length > 0) {
                courseTitle = (enrollmentCourse as any[])[0].course_title;
                console.log('✅ Found course title from enrollment:', courseTitle);
                
                // Now find actual course ID from instructor_course by title
                [courseRows] = await connection.execute(
                    `SELECT id, title FROM instructor_course WHERE title = ? OR title LIKE ? LIMIT 1`,
                    [courseTitle, `%${courseTitle}%`]
                );
                
                if ((courseRows as any[]).length > 0) {
                    actualCourseId = (courseRows as any[])[0].id;
                    console.log('✅ Found actual course ID by title:', actualCourseId);
                }
            }
        }
        
        if (!actualCourseId || !courseTitle) {
            console.error('❌ Course not found:', { courseId, courseTitle });
            return NextResponse.json(
                { success: false, error: 'Course not found in system' },
                { status: 404 }
            );
        }

        // ✅ STEP 2: Find enrollment using BOTH course_id AND course_title
        let [enrollmentRows] = await connection.execute(
            `SELECT id as enrollment_id, student_name, student_id, course_id, course_title
             FROM enrollments 
             WHERE student_email = ? 
             AND (course_id = ? OR course_id = ? OR course_title = ?)
             AND status = 'active' 
             AND payment_status = 'verified'
             LIMIT 1`,
            [studentEmail, actualCourseId, courseId, courseTitle]
        );

        // If still not found, try without course filter
        if ((enrollmentRows as any[]).length === 0) {
            console.log('⚠️ No enrollment with course filter, getting any active enrollment...');
            [enrollmentRows] = await connection.execute(
                `SELECT id as enrollment_id, student_name, student_id, course_id, course_title
                 FROM enrollments 
                 WHERE student_email = ? AND status = 'active' AND payment_status = 'verified'
                 LIMIT 1`,
                [studentEmail]
            );
        }

        if ((enrollmentRows as any[]).length === 0) {
            console.error('❌ No active enrollment found for student:', studentEmail);
            return NextResponse.json(
                { success: false, error: 'No active enrollment found' },
                { status: 404 }
            );
        }

        const enrollment = (enrollmentRows as any[])[0];
        const enrollmentId = enrollment.enrollment_id;
        const studentName = enrollment.student_name;
        const enrollmentCourseId = enrollment.course_id;
        const enrollmentCourseTitle = enrollment.course_title;

        console.log('✅ Found enrollment:', { 
            enrollmentId, 
            studentName, 
            enrollmentCourseId, 
            enrollmentCourseTitle 
        });

        // ✅ STEP 3: Check if certificate already exists
        const [existingCert] = await connection.execute(
            `SELECT id, certificate_number FROM certificates 
             WHERE enrollment_id = ?`,
            [enrollmentId]
        );

        if ((existingCert as any[]).length > 0) {
            return NextResponse.json({
                success: true,
                data: (existingCert as any[])[0],
                message: 'Certificate already issued'
            });
        }

        // ✅ STEP 4: Check course completion from slide_progress
        const [progressRows] = await connection.execute(
            `SELECT 
                COUNT(DISTINCT cs.id) as total_slides,
                COUNT(DISTINCT sp.slide_id) as completed_slides
             FROM course_slides cs
             LEFT JOIN slide_progress sp ON cs.id = sp.slide_id 
                 AND sp.enrollment_id = ? AND sp.status = 'completed'
             WHERE cs.course_id = ?`,
            [enrollmentId, actualCourseId]
        );

        const progress = (progressRows as any[])[0];
        const totalSlides = progress?.total_slides || 0;
        const completedSlides = progress?.completed_slides || 0;
        const progressPercentage = totalSlides > 0 ? Math.round((completedSlides / totalSlides) * 100) : 100;

        console.log('📊 Course progress:', { totalSlides, completedSlides, progressPercentage });

        if (progressPercentage < 100) {
            return NextResponse.json({
                success: false,
                error: `Course not completed yet. Progress: ${progressPercentage}%`,
                data: { progress: progressPercentage, completedSlides, totalSlides }
            }, { status: 400 });
        }

        // ✅ STEP 5: Generate certificate
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
        const courseCode = courseTitle.substring(0, 4).toUpperCase().replace(/\s/g, '');
        const certificateNumber = `CERT-${year}${month}-${courseCode}-${randomPart}`;
        
        const certificateId = uuidv4();

        // Get instructor name
        const [instructorRows] = await connection.execute(
            `SELECT instructor_name FROM instructor_course WHERE id = ?`,
            [actualCourseId]
        );
        const instructorName = (instructorRows as any[])[0]?.instructor_name || 'LMS Administrator';

        // ✅ STEP 6: Insert certificate
        await connection.execute(
            `INSERT INTO certificates (
                id, certificate_number, enrollment_id, student_id, 
                student_email, student_name, course_id, course_title, 
                course_duration, instructor_name, issue_date, status,
                download_count, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'issued', 0, NOW(), NOW())`,
            [
                certificateId,
                certificateNumber,
                enrollmentId,
                enrollment.student_id || null,
                studentEmail,
                studentName,
                actualCourseId,
                courseTitle,
                'Self-paced',
                instructorName
            ]
        );

        console.log('✅ Certificate issued successfully:', certificateNumber);

        const [newCert] = await connection.execute(
            `SELECT id, certificate_number, student_name, course_title, 
                    instructor_name, issue_date, course_duration
             FROM certificates WHERE id = ?`,
            [certificateId]
        );

        return NextResponse.json({
            success: true,
            data: (newCert as any[])[0],
            message: 'Certificate issued successfully! 🎉'
        });

    } catch (error: any) {
        console.error('❌ Error issuing certificate:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error.message || 'Failed to issue certificate'
            },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
}