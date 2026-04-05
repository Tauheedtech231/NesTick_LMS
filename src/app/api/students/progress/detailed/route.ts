// /app/api/students/progress/detailed/route.ts
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
            console.log(`🔍 Course not found by ID: ${courseId}, searching by title: "${courseTitle}"`);
            
            // Search by title
            const [courseByTitle] = await connection.execute(
                `SELECT id FROM instructor_course WHERE title = ? OR title LIKE ? LIMIT 1`,
                [courseTitle, `%${courseTitle}%`]
            );
            
            if ((courseByTitle as any[]).length > 0) {
                const correctId = (courseByTitle as any[])[0].id;
                console.log(`✅ Found correct course ID: ${correctId} (was: ${courseId})`);
                return correctId;
            }
        }
        
        // Return original ID if nothing found (will cause 404)
        return courseId;
        
    } catch (error) {
        console.error('Error finding correct course ID:', error);
        return courseId;
    }
}

export async function GET(request: NextRequest) {
    let connection;
    try {
        const { searchParams } = new URL(request.url);
        const enrollmentId = searchParams.get('enrollmentId');
        const courseId = searchParams.get('courseId');

        console.log('📊 Fetching detailed progress:', { enrollmentId, courseId });

        if (!enrollmentId || !courseId) {
            return NextResponse.json(
                { success: false, error: 'enrollmentId and courseId are required' },
                { status: 400 }
            );
        }

        connection = await getConnection();

        // ✅ FIX: Find the correct course ID
        const actualCourseId = await findCorrectCourseId(connection, courseId, enrollmentId);
        console.log(`✅ Using actual course ID: ${actualCourseId} (original: ${courseId})`);

        // 1. Get course info with actualCourseId
        const [courseRows] = await connection.execute(
            `SELECT 
                id,
                title,
                description,
                duration,
                level,
                instructor_name as instructorName
             FROM instructor_course 
             WHERE id = ?`,
            [actualCourseId]
        );
        
        if ((courseRows as any[]).length === 0) {
            return NextResponse.json(
                { success: false, error: 'Course not found', originalCourseId: courseId, actualCourseId },
                { status: 404 }
            );
        }
        
        const course = (courseRows as any[])[0];

        // 2. Get all slides with their files count using actualCourseId
        const [slideRows] = await connection.execute(
            `SELECT 
                s.id,
                s.slide_number as slideNumber,
                s.title,
                (SELECT COUNT(*) FROM slide_files WHERE slide_id = s.id) as totalFiles
             FROM course_slides s
             WHERE s.course_id = ?
             ORDER BY s.slide_number`,
            [actualCourseId]
        );
        const slides = slideRows as any[];

        // 3. Get slide progress for this student
        let slideProgress: any[] = [];
        try {
            const [progressRows] = await connection.execute(
                `SELECT 
                    slide_id,
                    status,
                    time_spent,
                    last_accessed,
                    completed_at
                 FROM slide_progress 
                 WHERE enrollment_id = ?`,
                [enrollmentId]
            );
            slideProgress = progressRows as any[];
            console.log(`📊 Found ${slideProgress.length} slide progress records`);
        } catch (tableError) {
            console.warn('⚠️ slide_progress table error:', tableError);
        }

        // Create map for quick lookup
        const progressMap = new Map();
        slideProgress.forEach(p => {
            progressMap.set(p.slide_id, {
                status: p.status || 'not_started',
                timeSpent: p.time_spent || 0,
                lastAccessed: p.last_accessed,
                completedAt: p.completed_at
            });
        });

        // 4. Get completed files per slide
        let contentProgress: any[] = [];
        try {
            const [contentRows] = await connection.execute(
                `SELECT 
                    slide_id,
                    COUNT(*) as completedCount
                 FROM content_views 
                 WHERE enrollment_id = ? AND completed = 1
                 GROUP BY slide_id`,
                [enrollmentId]
            );
            contentProgress = contentRows as any[];
            console.log(`📊 Found completed files for ${contentProgress.length} slides`);
        } catch (tableError) {
            console.warn('⚠️ content_views table error:', tableError);
        }

        const contentMap = new Map();
        contentProgress.forEach(c => {
            contentMap.set(c.slide_id, c.completedCount);
        });

        // 5. Get overall student progress
        let overallProgress = {
            completedSlides: [] as string[],
            completedContent: [] as string[],
            progressPercentage: 0,
            studyHours: 0,
            status: 'not_started'
        };

        try {
            const [progressRows] = await connection.execute(
                `SELECT 
                    completed_slides,
                    completed_content,
                    progress_percentage as progressPercentage,
                    study_hours as studyHours,
                    status
                 FROM student_progress 
                 WHERE enrollment_id = ?`,
                [enrollmentId]
            );

            if ((progressRows as any[]).length > 0) {
                const p = (progressRows as any[])[0];
                
                try {
                    overallProgress.completedSlides = p.completed_slides ? JSON.parse(p.completed_slides) : [];
                    if (!Array.isArray(overallProgress.completedSlides)) overallProgress.completedSlides = [];
                } catch {
                    overallProgress.completedSlides = [];
                }
                
                try {
                    overallProgress.completedContent = p.completed_content ? JSON.parse(p.completed_content) : [];
                    if (!Array.isArray(overallProgress.completedContent)) overallProgress.completedContent = [];
                } catch {
                    overallProgress.completedContent = [];
                }
                
                overallProgress.progressPercentage = p.progressPercentage || 0;
                overallProgress.studyHours = p.studyHours || 0;
                overallProgress.status = p.status || 'not_started';
            }
        } catch (tableError) {
            console.warn('⚠️ student_progress table error:', tableError);
        }

        // 6. Calculate stats
        let totalTimeSpent = 0;
        let completedSlidesCount = 0;

        const slidesWithProgress = slides.map(slide => {
            const progress = progressMap.get(slide.id);
            const completedFiles = contentMap.get(slide.id) || 0;
            
            let status = progress?.status || 'not_started';
            if (status === 'not_started' && overallProgress.completedSlides.includes(slide.id)) {
                status = 'completed';
            }
            
            const isCompleted = status === 'completed';
            
            if (isCompleted) completedSlidesCount++;
            if (progress?.timeSpent) totalTimeSpent += progress.timeSpent;

            return {
                slideId: slide.id,
                slideNumber: slide.slideNumber,
                title: slide.title,
                totalFiles: slide.totalFiles || 0,
                completedFiles,
                progress: slide.totalFiles > 0 ? Math.round((completedFiles / slide.totalFiles) * 100) : 0,
                status,
                timeSpent: progress?.timeSpent || 0,
                lastAccessed: progress?.lastAccessed,
                completedAt: progress?.completedAt
            };
        });

        // Calculate course progress
        const courseProgress = slides.length > 0 
            ? Math.round((completedSlidesCount / slides.length) * 100) 
            : 0;

        // Get last active time
        let lastActive = null;
        if (slideProgress.length > 0) {
            const sorted = [...slideProgress].sort((a, b) => {
                const timeA = a.last_accessed ? new Date(a.last_accessed).getTime() : 0;
                const timeB = b.last_accessed ? new Date(b.last_accessed).getTime() : 0;
                return timeB - timeA;
            });
            lastActive = sorted[0]?.last_accessed;
        }

        console.log('✅ Detailed progress fetched successfully:', {
            totalSlides: slides.length,
            completedSlides: completedSlidesCount,
            courseProgress,
            actualCourseId
        });

        return NextResponse.json({
            success: true,
            data: {
                course: {
                    id: course.id,
                    title: course.title,
                    description: course.description,
                    duration: course.duration,
                    level: course.level,
                    instructorName: course.instructorName
                },
                slides: slidesWithProgress,
                summary: {
                    totalSlides: slides.length,
                    completedSlides: completedSlidesCount,
                    courseProgress,
                    totalTimeSpent: Math.round(totalTimeSpent / 60),
                    lastActive
                },
                overallProgress
            }
        });

    } catch (error: any) {
        console.error('❌ Error fetching detailed progress:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch progress' },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
}