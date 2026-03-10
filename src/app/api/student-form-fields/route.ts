import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */
export async function GET(request: NextRequest) {
  let connection;
  try {
    connection = await getConnection();
    
    const [rows] = await connection.execute(
      `SELECT * FROM student_form_fields 
       WHERE status = 'active' 
       ORDER BY \`order\` ASC`
    );

    // Parse options JSON for each field
    const fields = (rows as any[]).map(row => ({
      id: row.id,
      label: row.label,
      name: row.name,
      type: row.type,
      placeholder: row.placeholder || '',
      required: row.required === 1,
      order: row.order,
      options: row.options ? JSON.parse(row.options) : null,
      status: row.status
    }));

    return NextResponse.json({
      success: true,
      data: fields
    });

  } catch (error: any) {
    console.error('Error fetching form fields:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

// Admin endpoints for managing fields
export async function POST(request: NextRequest) {
  // For admin to add new fields
  return NextResponse.json(
    { success: false, error: 'Method not implemented' },
    { status: 501 }
  );
}

export async function PUT(request: NextRequest) {
  // For admin to update fields
  return NextResponse.json(
    { success: false, error: 'Method not implemented' },
    { status: 501 }
  );
}

export async function DELETE(request: NextRequest) {
  // For admin to delete fields
  return NextResponse.json(
    { success: false, error: 'Method not implemented' },
    { status: 501 }
  );
}