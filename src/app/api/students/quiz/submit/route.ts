// /app/api/students/quiz/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */

// Define types
enum QuestionType {
  MCQ = 'mcq',
  TEXT = 'text'
}

interface QuizAnswer {
  questionIndex: number;
  selectedOption?: number;
  textAnswer?: string;
}

// Helper: Find correct course ID
async function findCorrectCourseId(connection: any, courseId: string, studentEmail: string) {
    try {
        console.log('🔍 Finding correct course ID for quiz:', { courseId, studentEmail });
        
        // First, try to find by exact ID in instructor_course
        let [course] = await connection.execute(
            `SELECT id, title FROM instructor_course WHERE id = ?`,
            [courseId]
        );
        
        if ((course as any[]).length > 0) {
            console.log('✅ Course found by ID:', (course as any[])[0].id);
            return { found: true, courseId: (course as any[])[0].id, courseTitle: (course as any[])[0].title };
        }
        
        // If not found, try to get from enrollment
        const [enrollment] = await connection.execute(
            `SELECT course_id, course_title FROM enrollments 
             WHERE (course_id = ? OR id = ?) AND student_email = ?
             LIMIT 1`,
            [courseId, courseId, studentEmail]
        );
        
        if ((enrollment as any[]).length > 0) {
            const enrollCourseId = (enrollment as any[])[0].course_id;
            const courseTitle = (enrollment as any[])[0].course_title;
            
            // Now find in instructor_course by title
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

// Helper: Safe JSON parse
function safeJsonParse(value: any, defaultValue: any = []) {
    if (!value) return defaultValue;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try {
            if (value.startsWith('[') || value.startsWith('{')) {
                return JSON.parse(value);
            }
            if (value.includes(',')) {
                return value.split(',').map(s => s.trim());
            }
            return [value];
        } catch (e) {
            return [value];
        }
    }
    return defaultValue;
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
            quizId,
            answers,
            score,
            passed 
        } = body;

        console.log('\n========== 📝 QUIZ SUBMISSION ==========');
        console.log('📍 Original Course ID:', courseId);
        console.log('📍 Student Email:', studentEmail);
        console.log('📍 Slide ID:', slideId);
        console.log('📍 Quiz ID:', quizId);

        // Validate required fields
        if (!enrollmentId || !studentEmail || !courseId || !slideId || !quizId) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        connection = await getConnection();

        // ✅ FIX 1: Find correct course ID
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

        // ✅ FIX 2: Find correct enrollment using actual course ID
        let [enrollmentRows] = await connection.execute(
            `SELECT id as enrollment_id, student_name FROM enrollments 
             WHERE student_email = ? AND (course_id = ? OR course_title = ?)
             AND status = 'active' AND payment_status = 'verified'
             LIMIT 1`,
            [studentEmail, actualCourseId, courseTitle]
        );

        let actualEnrollmentId = enrollmentId;
        
        if ((enrollmentRows as any[]).length > 0) {
            actualEnrollmentId = (enrollmentRows as any[])[0].enrollment_id;
            console.log('✅ Found enrollment:', actualEnrollmentId);
        } else {
            console.log('⚠️ Using provided enrollment ID:', enrollmentId);
        }

        // Check if quiz already attempted
        const [existing] = await connection.execute(
            `SELECT id FROM quiz_attempts WHERE enrollment_id = ? AND quiz_id = ? AND slide_id = ?`,
            [actualEnrollmentId, quizId, slideId]
        );

        if ((existing as any[]).length > 0) {
            await connection.rollback();
            return NextResponse.json(
                { success: false, error: 'Quiz already attempted' },
                { status: 400 }
            );
        }

        // Get quiz questions from database
        const [quizRows] = await connection.execute(
            `SELECT id FROM course_quizzes WHERE slide_id = ? AND course_id = ?`,
            [slideId, actualCourseId]
        );

        if ((quizRows as any[]).length === 0) {
            await connection.rollback();
            return NextResponse.json(
                { success: false, error: 'Quiz not found for this course' },
                { status: 404 }
            );
        }

        const dbQuizId = (quizRows as any[])[0].id;

        // Fetch questions
        const [questionRows] = await connection.execute(
            `SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY created_at ASC`,
            [dbQuizId]
        );

        const questions = (questionRows as any[]).map(q => {
            let options: string[] = [];
            try {
                options = safeJsonParse(q.options, []);
            } catch (e) {
                options = [];
            }
            return {
                id: q.id,
                question: q.question || '',
                options,
                correctAnswer: q.correct_answer !== null && q.correct_answer !== undefined ? q.correct_answer : -1,
                questionType: options.length > 0 ? QuestionType.MCQ : QuestionType.TEXT
            };
        });

        console.log(`📊 Found ${questions.length} questions`);

        // Calculate score
        let mcqCorrectCount = 0;
        let mcqTotalCount = 0;
        let textQuestionCount = 0;

        const processedAnswers = [];
        for (let i = 0; i < Math.min(questions.length, answers?.length || 0); i++) {
            const question = questions[i];
            const answer = answers[i] || { questionIndex: i };
            
            if (question.questionType === QuestionType.MCQ) {
                mcqTotalCount++;
                const selectedOption = answer.selectedOption !== undefined ? answer.selectedOption : -1;
                const isCorrect = selectedOption === question.correctAnswer;
                if (isCorrect) mcqCorrectCount++;
                
                processedAnswers.push({
                    questionIndex: i,
                    selectedOption,
                    isCorrect
                });
            } else {
                textQuestionCount++;
                processedAnswers.push({
                    questionIndex: i,
                    textAnswer: answer.textAnswer || '',
                    needsGrading: true
                });
            }
        }

        const mcqScore = mcqTotalCount > 0 ? Math.round((mcqCorrectCount / mcqTotalCount) * 100) : 0;
        const calculatedScore = mcqScore;
        const calculatedPassed = calculatedScore >= 70;

        console.log(`📊 Score: ${calculatedScore}% (${mcqCorrectCount}/${mcqTotalCount} MCQ correct)`);

        // Save quiz attempt
        const attemptId = uuidv4();
        const answersForStorage = {
            submitted: answers,
            processed: processedAnswers,
            summary: {
                mcqCorrect: mcqCorrectCount,
                mcqTotal: mcqTotalCount,
                textQuestions: textQuestionCount
            }
        };

        await connection.execute(
            `INSERT INTO quiz_attempts 
             (id, enrollment_id, student_email, course_id, slide_id, quiz_id, answers, score, passed, attempted_at, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                attemptId, actualEnrollmentId, studentEmail, actualCourseId, 
                slideId, quizId, JSON.stringify(answersForStorage), 
                calculatedScore, calculatedPassed ? 1 : 0
            ]
        );

        console.log('✅ Quiz attempt saved:', { attemptId, score: calculatedScore, passed: calculatedPassed });

        // Update slide progress if passed
        if (calculatedPassed) {
            const [existingSlideProgress] = await connection.execute(
                `SELECT id FROM slide_progress WHERE enrollment_id = ? AND slide_id = ?`,
                [actualEnrollmentId, slideId]
            );

            if ((existingSlideProgress as any[]).length > 0) {
                await connection.execute(
                    `UPDATE slide_progress 
                     SET status = 'completed', completed_at = NOW(), updated_at = NOW()
                     WHERE enrollment_id = ? AND slide_id = ?`,
                    [actualEnrollmentId, slideId]
                );
            } else {
                const progressId = uuidv4();
                await connection.execute(
                    `INSERT INTO slide_progress 
                     (id, enrollment_id, student_email, course_id, slide_id, status, completed_at, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, 'completed', NOW(), NOW(), NOW())`,
                    [progressId, actualEnrollmentId, studentEmail, actualCourseId, slideId]
                );
            }
            console.log('✅ Slide progress updated to completed');
        }

        await connection.commit();

        let message = calculatedPassed 
            ? `🎉 Quiz passed! Score: ${calculatedScore}%` 
            : `Quiz submitted. Score: ${calculatedScore}%`;

        if (textQuestionCount > 0) {
            message += ` ${textQuestionCount} text answer(s) will be graded by instructor.`;
        }

        return NextResponse.json({
            success: true,
            data: { 
                attemptId,
                score: calculatedScore,
                passed: calculatedPassed,
                usedCourseId: actualCourseId,
                originalCourseId: courseId
            },
            message
        });

    } catch (error: any) {
        if (connection) await connection.rollback();
        console.error('❌ Quiz submission error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to submit quiz' },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
        console.log('========== QUIZ SUBMISSION COMPLETE ==========\n');
    }
}