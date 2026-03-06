import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */
/* =====================================================
   FULL COURSE UPDATE (Transactional) - WITHOUT DELETING EXISTING QUIZZES
===================================================== */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  let connection;
  try {
    const { courseId } = await params;
    const body = await request.json();

    console.log("🔄 Full course update started for:", courseId);
    console.log("📦 Body received:", JSON.stringify(body, null, 2));

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "Course ID required" },
        { status: 400 }
      );
    }

    // Get database connection
    connection = await getConnection();
    console.log("✅ Database connected");

    // Check if course exists
    const [courseCheck] = await connection.execute(
      "SELECT id FROM instructor_course WHERE id = ?",
      [courseId]
    );

    if (!courseCheck || (courseCheck as any[]).length === 0) {
      connection.release();
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Start transaction
    await connection.beginTransaction();
    console.log("✅ Transaction started");

    /* =============================
       1. UPDATE COURSE DETAILS
    ============================== */
    if (body.course) {
      const { 
        title, 
        description, 
        studentCapacity, 
        category, 
        status, 
        duration, 
        level, 
        price 
      } = body.course;
      
      const safeTitle = title !== undefined && title !== null ? title : null;
      const safeDescription = description !== undefined && description !== null ? description : null;
      const safeStudentCapacity = studentCapacity !== undefined && studentCapacity !== null ? studentCapacity : 30;
      const safeCategory = category !== undefined && category !== null ? category : null;
      const safeStatus = status !== undefined && status !== null ? status : 'draft';
      const safeDuration = duration !== undefined && duration !== null ? duration : null;
      const safeLevel = level !== undefined && level !== null ? level : 'Beginner';
      const safePrice = price !== undefined && price !== null ? parseFloat(price) : null;

      await connection.execute(
        `UPDATE instructor_course SET
          title = ?,
          description = ?,
          student_capacity = ?,
          category = ?,
          status = ?,
          duration = ?,
          level = ?,
          price = ?,
          updated_at = NOW()
         WHERE id = ?`,
        [
          safeTitle,
          safeDescription,
          safeStudentCapacity,
          safeCategory,
          safeStatus,
          safeDuration,
          safeLevel,
          safePrice,
          courseId
        ]
      );
      console.log("✅ Course details updated");
    }

    /* =============================
       2. GET EXISTING SLIDE IDs FROM DATABASE
    ============================== */
    const [existingSlides] = await connection.execute(
      "SELECT id FROM course_slides WHERE course_id = ?",
      [courseId]
    );
    
    const existingSlideIds = (existingSlides as any[]).map(s => s.id);
    const incomingSlideIds = (body.slides || []).map((s: any) => s.id);
    
    console.log("📊 Existing slides:", existingSlideIds);
    console.log("📊 Incoming slides:", incomingSlideIds);

    /* =============================
       3. DELETE SLIDES THAT ARE NOT IN INCOMING DATA
    ============================== */
    const slidesToDelete = existingSlideIds.filter(id => !incomingSlideIds.includes(id));
    
    if (slidesToDelete.length > 0) {
      const placeholders = slidesToDelete.map(() => '?').join(',');
      
      // Delete quiz questions for these slides
      const [quizzesToDelete] = await connection.execute(
        `SELECT id FROM course_quizzes 
         WHERE slide_id IN (${placeholders})`,
        slidesToDelete
      );
      
      for (const quiz of (quizzesToDelete as any[])) {
        await connection.execute(
          "DELETE FROM quiz_questions WHERE quiz_id = ?",
          [quiz.id]
        );
      }
      
      // Delete quizzes for these slides
      await connection.execute(
        `DELETE FROM course_quizzes 
         WHERE slide_id IN (${placeholders})`,
        slidesToDelete
      );
      
      // Delete files for these slides
      await connection.execute(
        `DELETE FROM slide_files 
         WHERE slide_id IN (${placeholders})`,
        slidesToDelete
      );
      
      // Delete assignments for these slides
      await connection.execute(
        `DELETE FROM course_assignments 
         WHERE slide_id IN (${placeholders})`,
        slidesToDelete
      );
      
      // Delete slides
      await connection.execute(
        `DELETE FROM course_slides 
         WHERE id IN (${placeholders})`,
        slidesToDelete
      );
      
      console.log(`✅ Deleted ${slidesToDelete.length} slides that were removed`);
    }

    /* =============================
       4. PROCESS EACH SLIDE (UPDATE OR INSERT)
    ============================== */
    if (body.slides && Array.isArray(body.slides) && body.slides.length > 0) {
      for (const slide of body.slides) {
        const safeSlideId = slide.id || uuidv4();
        const safeSlideNumber = slide.slideNumber ?? 0;
        const safeSlideTitle = slide.title || `Slide ${safeSlideNumber}`;

        // Check if slide exists
        const [slideCheck] = await connection.execute(
          "SELECT id FROM course_slides WHERE id = ?",
          [safeSlideId]
        );

        if ((slideCheck as any[]).length === 0) {
          // Insert new slide
          await connection.execute(
            `INSERT INTO course_slides (id, course_id, slide_number, title, created_at, updated_at)
             VALUES (?, ?, ?, ?, NOW(), NOW())`,
            [safeSlideId, courseId, safeSlideNumber, safeSlideTitle]
          );
          console.log(`✅ New slide inserted: ${safeSlideId}`);
        } else {
          // Update existing slide
          await connection.execute(
            `UPDATE course_slides SET
              slide_number = ?,
              title = ?,
              updated_at = NOW()
             WHERE id = ?`,
            [safeSlideNumber, safeSlideTitle, safeSlideId]
          );
          console.log(`✅ Existing slide updated: ${safeSlideId}`);
        }

        /* =============================
           5. HANDLE FILES FOR THIS SLIDE
        ============================== */
        // Delete files that are no longer present
        if (slide.files && Array.isArray(slide.files)) {
          const existingFileIds = slide.files.map((f: any) => f.id).filter(Boolean);
          
          if (existingFileIds.length > 0) {
            const filePlaceholders = existingFileIds.map(() => '?').join(',');
            await connection.execute(
              `DELETE FROM slide_files 
               WHERE slide_id = ? AND id NOT IN (${filePlaceholders})`,
              [safeSlideId, ...existingFileIds]
            );
          } else {
            await connection.execute(
              "DELETE FROM slide_files WHERE slide_id = ?",
              [safeSlideId]
            );
          }
          
          // Insert or update files
          for (const file of slide.files) {
            const safeFileId = file.id || uuidv4();
            
            const [fileCheck] = await connection.execute(
              "SELECT id FROM slide_files WHERE id = ?",
              [safeFileId]
            );
            
            if ((fileCheck as any[]).length === 0) {
              await connection.execute(
                `INSERT INTO slide_files 
                 (id, slide_id, course_id, file_name, file_type, file_size, file_url, public_id, uploaded_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [
                  safeFileId,
                  safeSlideId,
                  courseId,
                  file.name || 'unknown',
                  file.type || 'application/octet-stream',
                  file.size || 0,
                  file.url || '',
                  file.publicId || null
                ]
              );
            }
          }
          console.log(`✅ Files processed for slide: ${safeSlideId}`);
        }

        /* =============================
           6. HANDLE QUIZ QUESTIONS - ❌ NO DELETION
        ============================== */
        if (slide.quizQuestions && Array.isArray(slide.quizQuestions)) {
          // Get existing quiz for this slide
          const [existingQuiz] = await connection.execute(
            "SELECT id FROM course_quizzes WHERE slide_id = ?",
            [safeSlideId]
          );
          
          let quizId;
          
          if ((existingQuiz as any[]).length === 0) {
            // Create new quiz
            quizId = uuidv4();
            await connection.execute(
              `INSERT INTO course_quizzes (id, slide_id, course_id, created_at, updated_at)
               VALUES (?, ?, ?, NOW(), NOW())`,
              [quizId, safeSlideId, courseId]
            );
            console.log(`✅ New quiz created for slide: ${safeSlideId}`);
          } else {
            // Use existing quiz
            quizId = (existingQuiz as any[])[0].id;
          }
          
          // Process each question - UPDATE if exists, INSERT if new
          for (const q of slide.quizQuestions) {
            const safeQuestionId = q.id || uuidv4();
            
            // Check if question exists
            const [questionCheck] = await connection.execute(
              "SELECT id FROM quiz_questions WHERE id = ?",
              [safeQuestionId]
            );
            
            if ((questionCheck as any[]).length === 0) {
              // Insert new question
              await connection.execute(
                `INSERT INTO quiz_questions (id, quiz_id, question, options, correct_answer, created_at)
                 VALUES (?, ?, ?, ?, ?, NOW())`,
                [
                  safeQuestionId,
                  quizId,
                  q.question || '',
                  JSON.stringify(q.options || ['', '', '', '']),
                  q.correctAnswer ?? 0
                ]
              );
            } else {
              // Update existing question
              await connection.execute(
                `UPDATE quiz_questions SET
                  question = ?,
                  options = ?,
                  correct_answer = ?,
                  updated_at = NOW()
                 WHERE id = ?`,
                [
                  q.question || '',
                  JSON.stringify(q.options || ['', '', '', '']),
                  q.correctAnswer ?? 0,
                  safeQuestionId
                ]
              );
            }
          }
          console.log(`✅ ${slide.quizQuestions.length} quiz questions processed for slide: ${safeSlideId}`);
        }

        /* =============================
           7. HANDLE ASSIGNMENTS
        ============================== */
        if (slide.assignments && Array.isArray(slide.assignments)) {
          for (const assignment of slide.assignments) {
            if (!assignment.slideId) {
              assignment.slideId = safeSlideId;
            }
            
            const safeAssignmentId = assignment.id || uuidv4();
            
            // Check if assignment exists
            const [assignmentCheck] = await connection.execute(
              "SELECT id FROM course_assignments WHERE id = ?",
              [safeAssignmentId]
            );
            
            if ((assignmentCheck as any[]).length === 0) {
              // Insert new assignment
              await connection.execute(
                `INSERT INTO course_assignments (
                  id, slide_id, course_id, title, description, due_date,
                  total_marks, passing_marks, file_name, file_type, file_size,
                  file_url, public_id, status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [
                  safeAssignmentId,
                  safeSlideId,
                  courseId,
                  assignment.title || 'Untitled Assignment',
                  assignment.description || '',
                  assignment.dueDate || null,
                  assignment.totalMarks || 100,
                  assignment.passingMarks || 70,
                  assignment.file?.name || null,
                  assignment.file?.type || null,
                  assignment.file?.size || null,
                  assignment.file?.url || null,
                  assignment.file?.publicId || null,
                  assignment.status || 'draft'
                ]
              );
            } else {
              // Update existing assignment
              await connection.execute(
                `UPDATE course_assignments SET
                  title = ?,
                  description = ?,
                  due_date = ?,
                  total_marks = ?,
                  passing_marks = ?,
                  file_name = ?,
                  file_type = ?,
                  file_size = ?,
                  file_url = ?,
                  public_id = ?,
                  status = ?,
                  updated_at = NOW()
                 WHERE id = ?`,
                [
                  assignment.title || 'Untitled Assignment',
                  assignment.description || '',
                  assignment.dueDate || null,
                  assignment.totalMarks || 100,
                  assignment.passingMarks || 70,
                  assignment.file?.name || null,
                  assignment.file?.type || null,
                  assignment.file?.size || null,
                  assignment.file?.url || null,
                  assignment.file?.publicId || null,
                  assignment.status || 'draft',
                  safeAssignmentId
                ]
              );
            }
          }
          console.log(`✅ Assignments processed for slide: ${safeSlideId}`);
        }
      }
    }

    // Commit transaction
    await connection.commit();
    console.log("🎉 Full course update completed successfully!");

    // Fetch and return updated course data
    const [updatedCourse] = await connection.execute(
      `SELECT * FROM instructor_course WHERE id = ?`,
      [courseId]
    );

    const [updatedSlides] = await connection.execute(
      `SELECT * FROM course_slides WHERE course_id = ? ORDER BY slide_number ASC`,
      [courseId]
    );

    return NextResponse.json({
      success: true,
      message: "Course updated successfully",
      data: {
        course: (updatedCourse as any[])[0] || null,
        slides: updatedSlides || [],
        slidesCount: body.slides?.length || 0,
        assignmentsCount: body.assignments?.length || 0
      }
    });

  } catch (error: any) {
    // Rollback on error
    if (connection) {
      await connection.rollback();
    }
    console.error("❌ Full course update error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update course",
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}