// /app/api/admin/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
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

    // Hardcoded admin check
    if (email === 'mansol@gmail.com' && password === '232rxtrxtyzp') {
      return NextResponse.json({
        success: true,
        data: {
          id: 'admin_1',
          email: 'mansol@gmail.com',
          name: 'Mansol Admin',
          role: 'super_admin'
        },
        message: 'Admin verified successfully'
      });
    }

    // Optional: Check from database if you want multiple admins
    connection = await getConnection();
    
    const [rows] = await connection.execute(
      `SELECT id, email, name, role FROM admins 
       WHERE email = ? AND password = ?`,
      [email, password]
    );

    if ((rows as any[]).length > 0) {
      const admin = (rows as any[])[0];
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
    }

    return NextResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    );

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