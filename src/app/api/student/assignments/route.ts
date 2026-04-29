/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(request: NextRequest) {
    let connection;
    try {
        const { searchParams } = new URL(request.url);
        const studentEmail = searchParams.get('email');
        const courseId = searchParams.get('courseId');

        if (!studentEmail) {
            return NextResponse.json(
                { success: false, error: 'Student email is required' },
                { status: 400 }
            );
        }

        connection = await getConnection();

        // ✅ Get enrolled courses for this student
        const [enrolledCourses] = await connection.execute(
            `SELECT DISTINCT course_id, course_title 
             FROM enrollments 
             WHERE student_email = ? AND status = 'active' AND payment_status = 'verified'`,
            [studentEmail]
        );

        const enrolledList = enrolledCourses as any[];
        
        if (enrolledList.length === 0) {
            return NextResponse.json({
                success: true,
                data: {
                    courses: [],
                    assignments: [],
                    stats: {
                        totalSubmissions: 0,
                        gradedCount: 0,
                        pendingCount: 0,
                        avgScore: 0,
                        passedCount: 0
                    }
                }
            });
        }

        // ✅ Get course IDs for filtering
        const courseIds = enrolledList.map(c => c.course_id);
        const placeholders = courseIds.map(() => '?').join(',');

        // ✅ Build course filter
        let courseFilter = '';
        const queryParams: any[] = [studentEmail];
        
        if (courseId && courseId !== 'all') {
            courseFilter = 'AND a.course_id = ?';
            queryParams.push(courseId);
        } else if (courseIds.length > 0) {
            courseFilter = `AND a.course_id IN (${placeholders})`;
            queryParams.push(...courseIds);
        }

        // ✅ Fetch assignments only for enrolled courses
        const [rows] = await connection.execute(
            `SELECT 
                a.id as submission_id,
                a.assignment_id,
                a.student_email,
                a.student_name,
                a.course_id,
                a.course_title,
                a.slide_id,
                a.files,
                a.submitted_at,
                a.status,
                a.score,
                a.feedback,
                a.created_at,
                ca.title as assignment_title,
                ca.description as assignment_description,
                ca.due_date,
                ca.total_marks,
                ca.passing_marks,
                cs.title as slide_title,
                cs.slide_number,
                ic.title as course_title_full
            FROM assignment_submissions a
            LEFT JOIN course_assignments ca ON a.assignment_id = ca.id
            LEFT JOIN course_slides cs ON a.slide_id = cs.id
            LEFT JOIN instructor_course ic ON a.course_id = ic.id
            WHERE a.student_email = ? ${courseFilter}
            ORDER BY a.submitted_at DESC`,
            queryParams
        );

        const assignments = rows as any[];
        
        // Parse files JSON for each assignment
        const processedAssignments = assignments.map(assignment => {
            let parsedFiles = [];
            try {
                parsedFiles = typeof assignment.files === 'string' 
                    ? JSON.parse(assignment.files) 
                    : (assignment.files || []);
            } catch (e) {
                parsedFiles = [];
            }
            
            return {
                ...assignment,
                files: parsedFiles,
                submitted_at: assignment.submitted_at,
                score: assignment.score,
                feedback: assignment.feedback,
                total_marks: assignment.total_marks,
                passing_marks: assignment.passing_marks,
                percentage: assignment.total_marks && assignment.score 
                    ? Math.round((assignment.score / assignment.total_marks) * 100) 
                    : null,
                passed: assignment.total_marks && assignment.score 
                    ? assignment.score >= assignment.passing_marks 
                    : null
            };
        });

        // Calculate stats
        const totalSubmissions = processedAssignments.length;
        const gradedCount = processedAssignments.filter(a => a.status === 'graded').length;
        const pendingCount = processedAssignments.filter(a => a.status === 'submitted').length;
        const avgScore = processedAssignments
            .filter(a => a.score)
            .reduce((sum, a) => sum + (a.score || 0), 0) / (gradedCount || 1);
        const passedCount = processedAssignments.filter(a => a.passed === true).length;

        // ✅ Prepare enrolled courses list for frontend filter
        const coursesList = enrolledList.map(c => ({
            id: c.course_id,
            title: c.course_title
        }));

        return NextResponse.json({
            success: true,
            data: {
                courses: coursesList,
                assignments: processedAssignments,
                stats: {
                    totalSubmissions,
                    gradedCount,
                    pendingCount,
                    avgScore: Math.round(avgScore),
                    passedCount
                }
            }
        });

    } catch (error: any) {
        console.error('Error fetching student assignments:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
}