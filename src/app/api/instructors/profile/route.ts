import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get('instructorId');
    const email = searchParams.get('email');

    console.log('🔍 Profile API called with:', { instructorId, email });

    if (!instructorId && !email) {
      return NextResponse.json(
        { success: false, error: 'Instructor ID or email is required' },
        { status: 400 }
      );
    }

    let instructorData;
    
    // Get instructor basic info
    try {
      if (instructorId) {
        instructorData = await query<any[]>(
          'SELECT id, name, email, course_id FROM instructors WHERE id = ?',
          [instructorId]
        );
      } else {
        instructorData = await query<any[]>(
          'SELECT id, name, email, course_id FROM instructors WHERE email = ?',
          [email]
        );
      }
    } catch (dbError) {
      console.error('❌ Database error fetching instructor:', dbError);
      return NextResponse.json(
        { success: false, error: 'Database connection failed. Please try again.' },
        { status: 500 }
      );
    }

    if (!instructorData || instructorData.length === 0) {
      console.log('❌ Instructor not found for:', { instructorId, email });
      return NextResponse.json(
        { success: false, error: 'Instructor not found' },
        { status: 404 }
      );
    }

    const instructor = instructorData[0];
    console.log('✅ Instructor found:', instructor);

    // Get or create profile
    let profiles;
    try {
      profiles = await query<any[]>(
        'SELECT * FROM instructors_profile WHERE instructor_id = ?',
        [instructor.id]
      );
    } catch (dbError) {
      console.error('❌ Database error fetching profile:', dbError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    let profile;
    
    if (!profiles || profiles.length === 0) {
      // Create default profile
      const profileId = uuidv4();
      try {
        await query(
          `INSERT INTO instructors_profile (id, instructor_id, full_name, email, created_at, updated_at)
           VALUES (?, ?, ?, ?, NOW(), NOW())`,
          [profileId, instructor.id, instructor.name, instructor.email]
        );
        
        profile = {
          id: profileId,
          instructor_id: instructor.id,
          full_name: instructor.name,
          email: instructor.email,
          phone: '',
          specialization: '',
          department: '',
          bio: 'No biography available.',
          profile_picture: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        console.log('✅ Created default profile for instructor');
      } catch (dbError) {
        console.error('❌ Database error creating profile:', dbError);
        return NextResponse.json(
          { success: false, error: 'Failed to create profile' },
          { status: 500 }
        );
      }
    } else {
      profile = profiles[0];
      console.log('✅ Found existing profile:', profile.id);
    }

    // Get qualifications
    let qualifications = [];
    try {
      qualifications = await query<any[]>(
        'SELECT * FROM instructor_qualifications WHERE profile_id = ? ORDER BY created_at DESC',
        [profile.id]
      );
    } catch (dbError) {
      console.error('❌ Database error fetching qualifications:', dbError);
      // Continue without qualifications
    }

    // Get experience
    let experience = [];
    try {
      experience = await query<any[]>(
        'SELECT * FROM instructor_experience WHERE profile_id = ? ORDER BY created_at DESC',
        [profile.id]
      );
    } catch (dbError) {
      console.error('❌ Database error fetching experience:', dbError);
      // Continue without experience
    }

    // Get assigned course
    let assignedCourse = null;
    if (instructor.course_id) {
      try {
        const courses = await query<any[]>(
          'SELECT id, title, category, duration, student_capacity, description FROM courses WHERE id = ?',
          [instructor.course_id]
        );
        if (courses && courses.length > 0) {
          assignedCourse = courses[0];
        }
      } catch (dbError) {
        console.error('❌ Database error fetching course:', dbError);
        // Continue without course
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        profile,
        qualifications: qualifications || [],
        experience: experience || [],
        assignedCourse,
        instructor: {
          id: instructor.id,
          name: instructor.name,
          email: instructor.email
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Fatal error in profile API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}