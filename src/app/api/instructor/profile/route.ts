import { NextRequest, NextResponse } from 'next/server';
import { query, getConnection } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';

/* eslint-disable */

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dfp9qc0gu',
  api_key: process.env.CLOUDINARY_API_KEY || '256561399931126',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'IDsMlP2lOykGLgLWKGgrhxiy01w',
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const instructorId = searchParams.get('instructorId');

    if (!instructorId) {
      return NextResponse.json(
        { success: false, error: 'Instructor ID required' },
        { status: 400 }
      );
    }

    console.log("Fetching profile for instructor:", instructorId);

    // Get main instructor data
    const instructor = await query<any[]>(
      `SELECT i.*, c.title as course_title 
       FROM instructors i
       LEFT JOIN courses c ON i.course_id = c.id
       WHERE i.id = ?`,
      [instructorId]
    );

    if (!instructor || instructor.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Instructor not found' },
        { status: 404 }
      );
    }

    console.log("Instructor found:", instructor[0].name);

    // Get profile data
    const profile = await query<any[]>(
      `SELECT * FROM instructors_profile WHERE instructor_id = ?`,
      [instructorId]
    );

    console.log("Profile found:", profile.length > 0 ? "Yes" : "No");

    // Get qualifications
    let qualifications = [];
    if (profile.length > 0) {
      qualifications = await query<any[]>(
        `SELECT * FROM instructor_qualifications WHERE profile_id = ? ORDER BY year DESC`,
        [profile[0].id]
      );
    }

    // Get experience
    let experiences = [];
    if (profile.length > 0) {
      experiences = await query<any[]>(
        `SELECT * FROM instructor_experience WHERE profile_id = ? ORDER BY created_at DESC`,
        [profile[0].id]
      );
    }

    // Get credentials for last login
    const credentials = await query<any[]>(
      `SELECT last_login FROM instructor_credentials WHERE instructor_id = ?`,
      [instructorId]
    );

    return NextResponse.json({
      success: true,
      data: {
        instructor: {
          id: instructor[0].id,
          name: instructor[0].name,
          email: instructor[0].email,
          status: instructor[0].status,
          rating: instructor[0].rating,
          totalStudents: instructor[0].total_students,
          lastLogin: credentials[0]?.last_login || null,
          course: instructor[0].course_id ? {
            id: instructor[0].course_id,
            title: instructor[0].course_title
          } : null
        },
        profile: profile[0] || null,
        qualifications: qualifications,
        experiences: experiences
      }
    });

  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const connection = await getConnection();
  
  try {
    const formData = await request.formData();
    const action = formData.get('action') as string;

    // ========== IMAGE UPLOAD ==========
    if (action === 'upload_image') {
      const file = formData.get('file') as File;
      const instructorId = formData.get('instructorId') as string;

      if (!file || !instructorId) {
        return NextResponse.json(
          { success: false, error: 'File and instructor ID required' },
          { status: 400 }
        );
      }

      console.log("Uploading image for instructor:", instructorId);

      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'lms/instructors',
            public_id: `instructor_${instructorId}`,
            overwrite: true,
            transformation: [
              { width: 500, height: 500, crop: 'limit' },
              { quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      console.log("Image uploaded to Cloudinary:", (result as any).secure_url);

      // Update or insert profile
      await connection.beginTransaction();

      // Check if profile exists
      const existingProfile = await connection.execute(
        `SELECT id FROM instructors_profile WHERE instructor_id = ?`,
        [instructorId]
      );

      if ((existingProfile[0] as any[]).length > 0) {
        // Update existing profile
        await connection.execute(
          `UPDATE instructors_profile 
           SET profile_picture = ?, updated_at = NOW() 
           WHERE instructor_id = ?`,
          [(result as any).secure_url, instructorId]
        );
        console.log("Updated existing profile with image");
      } else {
        // Get instructor details
        const instructor = await connection.execute(
          `SELECT name, email FROM instructors WHERE id = ?`,
          [instructorId]
        );

        const instructorData = (instructor[0] as any[])[0];

        // Create new profile
        await connection.execute(
          `INSERT INTO instructors_profile (id, instructor_id, full_name, email, profile_picture) 
           VALUES (?, ?, ?, ?, ?)`,
          [uuidv4(), instructorId, instructorData.name, instructorData.email, (result as any).secure_url]
        );
        console.log("Created new profile with image");
      }

      await connection.commit();

      return NextResponse.json({
        success: true,
        data: { url: (result as any).secure_url },
        message: 'Image uploaded successfully'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error: any) {
    await connection.rollback();
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

export async function PUT(request: NextRequest) {
  const connection = await getConnection();
  
  try {
    const body = await request.json();
    const { 
      instructorId,
      fullName,
      phone,
      specialization,
      department,
      bio,
      profilePicture,
      qualifications,
      experiences,
      currentPassword,
      newPassword
    } = body;

    if (!instructorId) {
      return NextResponse.json(
        { success: false, error: 'Instructor ID required' },
        { status: 400 }
      );
    }

    console.log("Updating profile for instructor:", instructorId);
    console.log("Full Name received:", fullName);

    await connection.beginTransaction();

    // ========== 1. UPDATE INSTRUCTORS TABLE (name) ==========
    if (fullName) {
      await connection.execute(
        `UPDATE instructors SET name = ?, updated_at = NOW() WHERE id = ?`,
        [fullName, instructorId]
      );
      console.log("Updated instructor name in instructors table");
    }

    // ========== 2. UPDATE PROFILE ==========
    if (fullName !== undefined || phone !== undefined || specialization !== undefined || 
        department !== undefined || bio !== undefined || profilePicture !== undefined) {

      // Check if profile exists
      const existingProfile = await connection.execute(
        `SELECT id FROM instructors_profile WHERE instructor_id = ?`,
        [instructorId]
      );

      if ((existingProfile[0] as any[]).length > 0) {
        // Update existing profile
        const updateFields = [];
        const updateValues = [];

        if (fullName !== undefined) {
          updateFields.push('full_name = ?');
          updateValues.push(fullName);
        }
        if (phone !== undefined) {
          updateFields.push('phone = ?');
          updateValues.push(phone);
        }
        if (specialization !== undefined) {
          updateFields.push('specialization = ?');
          updateValues.push(specialization);
        }
        if (department !== undefined) {
          updateFields.push('department = ?');
          updateValues.push(department);
        }
        if (bio !== undefined) {
          updateFields.push('bio = ?');
          updateValues.push(bio);
        }
        if (profilePicture !== undefined) {
          updateFields.push('profile_picture = ?');
          updateValues.push(profilePicture);
        }

        if (updateFields.length > 0) {
          updateFields.push('updated_at = NOW()');
          await connection.execute(
            `UPDATE instructors_profile SET ${updateFields.join(', ')} WHERE instructor_id = ?`,
            [...updateValues, instructorId]
          );
          console.log("Updated profile in instructors_profile table");
        }
      } else {
        // Get instructor details
        const instructor = await connection.execute(
          `SELECT name, email FROM instructors WHERE id = ?`,
          [instructorId]
        );

        const instructorData = (instructor[0] as any[])[0];

        // Create new profile
        await connection.execute(
          `INSERT INTO instructors_profile 
           (id, instructor_id, full_name, email, phone, specialization, department, bio, profile_picture) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(), 
            instructorId, 
            fullName || instructorData.name, 
            instructorData.email,
            phone || null,
            specialization || null,
            department || null,
            bio || null,
            profilePicture || null
          ]
        );
        console.log("Created new profile in instructors_profile table");
      }
    }

    // ========== 3. UPDATE QUALIFICATIONS ==========
    if (qualifications && Array.isArray(qualifications)) {
      // Get profile ID
      const profile = await connection.execute(
        `SELECT id FROM instructors_profile WHERE instructor_id = ?`,
        [instructorId]
      );

      if ((profile[0] as any[]).length > 0) {
        const profileId = (profile[0] as any[])[0].id;

        // Delete existing qualifications
        await connection.execute(
          `DELETE FROM instructor_qualifications WHERE profile_id = ?`,
          [profileId]
        );

        // Insert new qualifications
        for (const qual of qualifications) {
          if (qual.degree && qual.institution) {
            await connection.execute(
              `INSERT INTO instructor_qualifications (id, profile_id, degree, institution, year, description) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [uuidv4(), profileId, qual.degree, qual.institution, qual.year || null, qual.description || null]
            );
          }
        }
        console.log("Updated qualifications");
      }
    }

    // ========== 4. UPDATE EXPERIENCE ==========
    if (experiences && Array.isArray(experiences)) {
      // Get profile ID
      const profile = await connection.execute(
        `SELECT id FROM instructors_profile WHERE instructor_id = ?`,
        [instructorId]
      );

      if ((profile[0] as any[]).length > 0) {
        const profileId = (profile[0] as any[])[0].id;

        // Delete existing experience
        await connection.execute(
          `DELETE FROM instructor_experience WHERE profile_id = ?`,
          [profileId]
        );

        // Insert new experience
        for (const exp of experiences) {
          if (exp.position && exp.company) {
            await connection.execute(
              `INSERT INTO instructor_experience (id, profile_id, position, company, duration, description) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [uuidv4(), profileId, exp.position, exp.company, exp.duration || null, exp.description || null]
            );
          }
        }
        console.log("Updated experiences");
      }
    }

    // ========== 5. CHANGE PASSWORD ==========
    if (currentPassword && newPassword) {
      // Get current password hash
      const credentials = await connection.execute(
        `SELECT password_hash FROM instructor_credentials WHERE instructor_id = ?`,
        [instructorId]
      );

      if ((credentials[0] as any[]).length === 0) {
        throw new Error('Credentials not found');
      }

      const currentHash = (credentials[0] as any[])[0].password_hash;

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, currentHash);
      if (!isValid) {
        throw new Error('Current password is incorrect');
      }

      // Validate new password
      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await connection.execute(
        `UPDATE instructor_credentials SET password_hash = ?, updated_at = NOW() WHERE instructor_id = ?`,
        [hashedPassword, instructorId]
      );
      console.log("Updated password");
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error: any) {
    await connection.rollback();
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

export async function PATCH(request: NextRequest) {
  // Alias for PUT (for password changes)
  return PUT(request);
}