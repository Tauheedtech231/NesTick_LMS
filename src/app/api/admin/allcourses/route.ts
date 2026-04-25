/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(request: NextRequest) {
  let connection;
  try {
    connection = await getConnection();

    const [courses] = await connection.execute(
      `SELECT 
        id,
        title,
        CAST(price AS DECIMAL(10,2)) as price,  -- ✅ Convert to number
        image,
        status,
        category,
        duration,
        level,
        description
      FROM instructor_course 
      WHERE status = 'published'
      ORDER BY title ASC`
    );

    return NextResponse.json({
      success: true,
      data: courses
    });

  } catch (error: any) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}