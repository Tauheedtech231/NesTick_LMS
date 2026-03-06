import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
/* eslint-disable */
/* =====================================================
   GET SINGLE COURSE WITH FULL STRUCTURE
===================================================== */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "Course ID required" },
        { status: 400 }
      );
    }

    // Course
    const courses = await query<any[]>(
      "SELECT * FROM instructor_course WHERE id = ?",
      [courseId]
    );

    if (!courses || courses.length === 0) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const course = courses[0];

    // Slides
    const slides = await query<any[]>(
      "SELECT * FROM course_slides WHERE course_id = ? ORDER BY slide_number",
      [courseId]
    );

    // Slide Files
    const files = await query<any[]>(
      "SELECT * FROM slide_files WHERE course_id = ?",
      [courseId]
    );

    // Quizzes + Questions
    const quizzes = await query<any[]>(
      `SELECT q.*, qq.* 
       FROM course_quizzes q
       LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
       WHERE q.course_id = ?`,
      [courseId]
    );

    // Assignments
    const assignments = await query<any[]>(
      "SELECT * FROM course_assignments WHERE course_id = ?",
      [courseId]
    );

    // Structured Slides
    const slidesWithContent = slides.map((slide) => ({
      ...slide,
      files: files.filter((f) => f.slide_id === slide.id),
      quiz: quizzes.filter((q) => q.slide_id === slide.id),
      assignments: assignments.filter((a) => a.slide_id === slide.id),
    }));

    return NextResponse.json({
      success: true,
      data: {
        course,
        slides: slidesWithContent,
      },
    });
  } catch (error: any) {
    console.error("GET Course Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch course",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/* =====================================================
   UPDATE COURSE DETAILS (PUT)
===================================================== */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const body = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "Course ID required" },
        { status: 400 }
      );
    }

    // Check if course exists
    const courseCheck = await query<any[]>(
      "SELECT id FROM instructor_course WHERE id = ?",
      [courseId]
    );

    if (!courseCheck || courseCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    console.log("📝 Updating course:", courseId);
    console.log("📦 Update data:", body);

    // Validate required fields
    if (!body.title?.trim()) {
      return NextResponse.json(
        { success: false, error: "Course title is required" },
        { status: 400 }
      );
    }

    // Update course details
    await query(
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
        body.title,
        body.description || null,
        body.studentCapacity || 30,
        body.category || null,
        body.status || 'draft',
        body.duration || null,
        body.level || 'Beginner',
        body.price ? parseFloat(body.price) : null,
        courseId
      ]
    );

    // Fetch updated course
    const updatedCourse = await query<any[]>(
      "SELECT * FROM instructor_course WHERE id = ?",
      [courseId]
    );

    return NextResponse.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse[0]
    });

  } catch (error: any) {
    console.error("PUT Course Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update course",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/* =====================================================
   DELETE COURSE (Safe Order Deletion)
===================================================== */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "Course ID required" },
        { status: 400 }
      );
    }

    // Check course exists
    const courseCheck = await query<any[]>(
      "SELECT id FROM instructor_course WHERE id = ?",
      [courseId]
    );

    if (!courseCheck || courseCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    console.log("🗑️ Deleting course:", courseId);

    /* =============================
       DELETE DEPENDENCIES FIRST
    ============================== */

    // Slide files
    await query("DELETE FROM slide_files WHERE course_id = ?", [courseId]);

    // Quiz questions (child of quizzes)
    await query(
      `DELETE FROM quiz_questions 
       WHERE quiz_id IN (
         SELECT id FROM course_quizzes WHERE course_id = ?
       )`,
      [courseId]
    );

    // Quizzes
    await query("DELETE FROM course_quizzes WHERE course_id = ?", [
      courseId,
    ]);

    // Assignments
    await query("DELETE FROM course_assignments WHERE course_id = ?", [
      courseId,
    ]);

    // Slides
    await query("DELETE FROM course_slides WHERE course_id = ?", [
      courseId,
    ]);

    // Finally delete course
    await query("DELETE FROM instructor_course WHERE id = ?", [
      courseId,
    ]);

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE Course Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete course",
        details: error.message,
      },
      { status: 500 }
    );
  }
}