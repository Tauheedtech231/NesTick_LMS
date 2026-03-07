import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import bcrypt from 'bcryptjs';
/* eslint-disable */

export async function POST(request: NextRequest) {
  let connection;
  try {
    const { email, password } = await request.json();

    console.log('🔐 Admin verification attempt:', { email });

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    connection = await getConnection();
    
    // Get admin from database with password
    const [rows] = await connection.execute(
      `SELECT id, email, name, role, password, last_login 
       FROM admins 
       WHERE email = ?`,
      [email]
    );

    // Check if admin exists
    if ((rows as any[]).length === 0) {
      console.log('❌ Admin not found:', email);
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const admin = (rows as any[])[0];
    
    // For existing plain text passwords (like your hardcoded one)
    let isValid = false;
    
    // Check if password is already hashed (starts with $2a$ or $2b$)
    if (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$')) {
      // Compare with bcrypt
      isValid = await bcrypt.compare(password, admin.password);
    } else {
      // Plain text comparison (for backward compatibility)
      isValid = (password === admin.password);
      
      // OPTIONAL: If using plain text, you might want to hash it now
      if (isValid) {
        // Hash the password for future use
        const hashedPassword = await bcrypt.hash(password, 10);
        await connection.execute(
          'UPDATE admins SET password = ? WHERE id = ?',
          [hashedPassword, admin.id]
        );
        console.log('✅ Password hashed for admin:', admin.email);
      }
    }

    if (!isValid) {
      console.log('❌ Invalid password for:', email);
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    await connection.execute(
      'UPDATE admins SET last_login = NOW() WHERE id = ?',
      [admin.id]
    );

    console.log('✅ Admin verified successfully:', admin.email);

    // Don't send password back
    return NextResponse.json({
      success: true,
      data: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      },
      message: 'Admin verified successfully'
    });

  } catch (error: any) {
    console.error('❌ Error verifying admin:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}