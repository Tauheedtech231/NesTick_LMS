/* eslint-disable @typescript-eslint/no-explicit-any */
// /app/api/student/cart/add/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  let connection;
  try {
    const { studentEmail, courseId } = await request.json();

    // Validation
    if (!studentEmail || !courseId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Check if course exists in instructor_course
    const [courseRows] = await connection.execute(
      'SELECT title, price FROM instructor_course WHERE id = ? AND status = "published"',
      [courseId]
    );

    const courses = courseRows as any[];
    if (courses.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Course not found or not published' },
        { status: 404 }
      );
    }

    const course = courses[0];

    // ✅ GET ALL COURSES WHERE USER IS ALREADY ENROLLED (for printing)
    const [allEnrolledCourses] = await connection.execute(
      `SELECT e.course_id, e.course_title, e.payment_status, e.status, e.id as enrollment_id
       FROM enrollments e
       WHERE e.student_email = ? 
         AND (e.payment_status = 'verified' AND e.status = 'active')
       ORDER BY e.created_at DESC`,
      [studentEmail]
    );

    const enrolledCourses = allEnrolledCourses as any[];
    const enrolledCourseIds = enrolledCourses.map(c => c.course_id);

    // ✅ CHECK: User already ACTIVE enrolled in THIS course
    if (enrolledCourseIds.includes(courseId)) {
      const enrolledCourse = enrolledCourses.find(c => c.course_id === courseId);
      
      return NextResponse.json(
        { 
          success: false, 
          error: `❌ You are already enrolled in "${course.title}". You cannot add it to cart.`,
          alreadyEnrolled: true,
          enrollmentStatus: 'active',
          enrollmentId: enrolledCourse?.enrollment_id,
          currentCourse: {
            id: courseId,
            title: course.title
          },
          allEnrolledCourses: enrolledCourses.map(c => ({
            id: c.course_id,
            title: c.course_title,
            enrollmentId: c.enrollment_id,
            paymentStatus: c.payment_status,
            status: c.status
          })),
          enrolledCoursesCount: enrolledCourses.length,
          enrolledCoursesList: enrolledCourses.map(c => c.course_title).join(', ')
        },
        { status: 400 }
      );
    }

    // ✅ CHECK: User has PENDING enrollment (payment not completed)
    const [pendingCheck] = await connection.execute(
      `SELECT id, payment_status, status, course_id, course_title
       FROM enrollments 
       WHERE student_email = ? 
         AND course_id = ? 
         AND payment_status = 'pending' 
         AND status = 'pending'`,
      [studentEmail, courseId]
    );

    const pendingEnrollments = pendingCheck as any[];
    
    if (pendingEnrollments.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `⚠️ You already have a pending enrollment for "${course.title}". Please complete your payment first.`,
          alreadyEnrolled: true,
          enrollmentStatus: 'pending',
          enrollmentId: pendingEnrollments[0].id,
          currentCourse: {
            id: courseId,
            title: course.title
          },
          allEnrolledCourses: enrolledCourses.map(c => ({
            id: c.course_id,
            title: c.course_title,
            enrollmentId: c.enrollment_id,
            paymentStatus: c.payment_status,
            status: c.status
          })),
          enrolledCoursesCount: enrolledCourses.length,
          enrolledCoursesList: enrolledCourses.map(c => c.course_title).join(', ')
        },
        { status: 400 }
      );
    }

    // Check if course already exists in cart
    const [existing] = await connection.execute(
      'SELECT id FROM cart_bucket WHERE student_email = ? AND course_id = ?',
      [studentEmail, courseId]
    );

    if ((existing as any[]).length > 0) {
      return NextResponse.json(
        { success: false, error: 'Course already in cart' },
        { status: 400 }
      );
    }

    // Insert into cart
    const cartId = uuidv4();
    await connection.execute(
      `INSERT INTO cart_bucket (id, student_email, course_id, course_title, course_price, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [cartId, studentEmail, courseId, course.title, course.price]
    );

    return NextResponse.json({
      success: true,
      message: 'Course added to cart successfully',
      data: { cartId }
    });

  } catch (error: any) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add to cart' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}