// /app/api/students/profile/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function PUT(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const { 
      email,
      name,
      phone,
      address,
      education,
      experience
    } = body;

    console.log('📝 Updating profile for:', email);

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();
    
    // Set timeout
    await connection.execute('SET SESSION wait_timeout = 28800');

    // Check if student exists
    const [checkRows] = await connection.execute(
      `SELECT id FROM enrollments WHERE student_email = ?`,
      [email]
    );

    if ((checkRows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('student_name = ?');
      updateValues.push(name);
    }

    if (phone !== undefined) {
      updateFields.push('student_phone = ?');
      updateValues.push(phone);
    }

    if (address !== undefined) {
      updateFields.push('student_address = ?');
      updateValues.push(address);
    }

    if (education !== undefined) {
      updateFields.push('student_education = ?');
      updateValues.push(education);
    }

    if (experience !== undefined) {
      updateFields.push('student_experience = ?');
      updateValues.push(experience);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    updateValues.push(email);

    await connection.execute(
      `UPDATE enrollments 
       SET ${updateFields.join(', ')} 
       WHERE student_email = ?`,
      updateValues
    );

    // Fetch updated profile
    const [rows] = await connection.execute(
      `SELECT 
        student_name as name,
        student_phone as phone,
        student_address as address,
        student_education as education,
        student_experience as experience,
        profile_image as profileImage
       FROM enrollments 
       WHERE student_email = ?`,
      [email]
    );

    console.log('✅ Profile updated successfully');

    return NextResponse.json({
      success: true,
      data: (rows as any[])[0],
      message: 'Profile updated successfully'
    });

  } catch (error: any) {
    console.error('❌ Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile. Please try again.' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (error) {
        console.error('Error releasing connection:', error);
      }
    }
  }
}