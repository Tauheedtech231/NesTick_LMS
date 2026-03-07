import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
/* eslint-disable */
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ==================== GET ====================
export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('id');
    const email = searchParams.get('email');

    if (!adminId && !email) {
      return NextResponse.json(
        { success: false, error: 'Admin ID or email is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    let query = 'SELECT id, email, name, role, profile_image, last_login, created_at FROM admins WHERE';
    const params: any[] = [];

    if (adminId) {
      query += ' id = ?';
      params.push(adminId);
    } else {
      query += ' email = ?';
      params.push(email);
    }

    const [admins] = await connection.execute(query, params);

    if ((admins as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      );
    }

    const admin = (admins as any[])[0];

    return NextResponse.json({
      success: true,
      data: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        profileImage: admin.profile_image || null,
        lastLogin: admin.last_login,
        createdAt: admin.created_at
      }
    });

  } catch (error: any) {
    console.error('Error fetching admin profile:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

// ==================== PUT (Update Profile) ====================
export async function PUT(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const { id, name, email, currentPassword, newPassword, profileImage } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Admin ID is required' },
        { status: 400 }
      );
    }

    connection = await getConnection();
    await connection.beginTransaction();

    // Check if email already exists for another admin
    if (email) {
      const [existing] = await connection.execute(
        'SELECT id FROM admins WHERE email = ? AND id != ?',
        [email, id]
      );
      if ((existing as any[]).length > 0) {
        return NextResponse.json(
          { success: false, error: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    // Build update query dynamically
    let updateQuery = 'UPDATE admins SET ';
    const updateParams: any[] = [];
    const updates: string[] = [];

    if (name) {
      updates.push('name = ?');
      updateParams.push(name);
    }

    if (email) {
      updates.push('email = ?');
      updateParams.push(email);
    }

    if (profileImage !== undefined) {
      updates.push('profile_image = ?');
      updateParams.push(profileImage);
    }

    // Handle password change
    if (newPassword && currentPassword) {
      // Verify current password
      const [admins] = await connection.execute(
        'SELECT password FROM admins WHERE id = ?',
        [id]
      );
      
      if ((admins as any[]).length === 0) {
        throw new Error('Admin not found');
      }

      const admin = (admins as any[])[0];
      const isValid = await bcrypt.compare(currentPassword, admin.password);
      
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect' },
          { status: 401 }
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updates.push('password = ?');
      updateParams.push(hashedPassword);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    updateQuery += updates.join(', ') + ', updated_at = NOW() WHERE id = ?';
    updateParams.push(id);

    await connection.execute(updateQuery, updateParams);
    await connection.commit();

    // Fetch updated admin data
    const [updated] = await connection.execute(
      'SELECT id, email, name, role, profile_image, last_login, created_at FROM admins WHERE id = ?',
      [id]
    );

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: (updated as any[])[0]
    });

  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error('Error updating admin profile:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

// ==================== POST (Image Upload) ====================
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const adminId = formData.get('adminId') as string;

    if (!file || !adminId) {
      return NextResponse.json(
        { success: false, error: 'File and admin ID are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Please upload an image file' },
        { status: 400 }
      );
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Image size should be less than 2MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'admin_profiles',
          public_id: `admin_${adminId}_${Date.now()}`,
          transformation: [
            { width: 400, height: 400, crop: 'fill' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({
      success: true,
      data: {
        url: (result as any).secure_url,
        publicId: (result as any).public_id
      }
    });

  } catch (error: any) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}