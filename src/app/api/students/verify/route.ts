import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function POST(request: NextRequest) {
  let connection;
  try {
    const { email, password } = await request.json();

    console.log('========== STUDENT LOGIN DEBUG ==========');
    console.log('1️⃣ Input received:', email);
    console.log('2️⃣ Raw password length:', password?.length);
    
    // ✅ FIX: Trim the password to remove spaces
    const trimmedPassword = password?.trim() || '';
    console.log('3️⃣ Trimmed password length:', trimmedPassword.length);
    console.log('4️⃣ Trimmed password:', `"${trimmedPassword}"`);

    if (!email || !trimmedPassword) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Check if student exists with EITHER email OR username
    console.log('\n5️⃣ Checking if student exists with email/username:', email);
    const [existing] = await connection.execute(
      `SELECT * FROM enrollments 
       WHERE student_email = ? OR username = ?`,
      [email, email]
    );

    const existingList = existing as any[];
    console.log('6️⃣ Records found:', existingList.length);

    if (existingList.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid email/username or password' },
        { status: 401 }
      );
    }

    const studentRecord = existingList[0];
    console.log('✅ Student found:', {
      email: studentRecord.student_email,
      username: studentRecord.username,
      name: studentRecord.student_name
    });

    // ✅ FIX: Trim both passwords for comparison
    const storedPassword = studentRecord.password?.trim() || '';
    console.log('7️⃣ Stored password:', `"${storedPassword}"`);
    console.log('8️⃣ Provided password:', `"${trimmedPassword}"`);

    if (storedPassword !== trimmedPassword) {
      console.log('❌ Password mismatch!');
      console.log('Stored password length:', storedPassword.length);
      console.log('Provided password length:', trimmedPassword.length);
      
      return NextResponse.json(
        { success: false, error: 'Invalid email/username or password' },
        { status: 401 }
      );
    }

    console.log('✅ Password matched!');

    // Check payment status
    if (studentRecord.payment_status !== 'verified') {
      return NextResponse.json(
        { success: false, error: 'Your payment is not verified yet. Please wait for admin verification.' },
        { status: 403 }
      );
    }

    // Check account status
    if (studentRecord.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Your account is not active. Please contact admin.' },
        { status: 403 }
      );
    }

    console.log('\n✅ Student authenticated successfully!');

    // Update last login
    try {
      await connection.execute(
        `UPDATE enrollments 
         SET last_login = NOW(), 
             login_count = IFNULL(login_count, 0) + 1 
         WHERE id = ?`,
        [studentRecord.id]
      );
    } catch (updateError) {
      // Ignore update errors
    }

    // Prepare student data
    const studentData = {
      id: studentRecord.student_id,
      enrollmentId: studentRecord.id,
      name: studentRecord.student_name,
      email: studentRecord.student_email,
      username: studentRecord.username,
      courseId: studentRecord.course_id,
      courseTitle: studentRecord.course_title,
      role: 'student',
      isAuthenticated: true,
      loginTime: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: studentData,
      message: 'Login successful'
    });

  } catch (error: any) {
    console.error('❌ Student login error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Login failed' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}