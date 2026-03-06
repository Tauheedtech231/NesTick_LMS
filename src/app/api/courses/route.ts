import { NextRequest, NextResponse } from 'next/server';
import { query, testConnection } from '@/lib/db';
/* eslint-disable */

// Interface for course from database
interface DBCourse {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  students: string;
  level: string;
  price: string;
  originalPrice: string | null;
  savings: string | null;
  icon: string | null;
  color: string | null;
  image: string | null;
  featured: boolean;
  rating: number;
  reviews: number;
  isPublished: boolean;
  created_at: string;
  updated_at: string;
}

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database connection failed' 
        },
        { status: 500 }
      );
    }

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    // Build the base query
    let sql = `
      SELECT 
        id,
        title,
        category,
        description,
        duration,
        students,
        level,
        price,
        originalPrice,
        savings,
        icon,
        color,
        image,
        featured,
        rating,
        reviews,
        isPublished,
        created_at,
        updated_at
      FROM courses 
      WHERE isPublished = TRUE
    `;
    
    const queryParams: any[] = [];

    // Add filters if provided
    if (category) {
      sql += ` AND category = ?`;
      queryParams.push(category);
    }

    if (level) {
      sql += ` AND level = ?`;
      queryParams.push(level);
    }

    if (featured === 'true') {
      sql += ` AND featured = TRUE`;
    }

    // Add ordering
    sql += ` ORDER BY 
      CASE WHEN featured = TRUE THEN 0 ELSE 1 END,
      rating DESC,
      created_at DESC`;

    // Add pagination if provided
    if (limit) {
      sql += ` LIMIT ?`;
      queryParams.push(parseInt(limit));
      
      if (offset) {
        sql += ` OFFSET ?`;
        queryParams.push(parseInt(offset));
      }
    }

    // Execute query
    const courses = await query<DBCourse[]>(sql, queryParams);

    // Get total count for pagination
    let countSql = `SELECT COUNT(*) as total FROM courses WHERE isPublished = TRUE`;
    const countParams: any[] = [];

    if (category) {
      countSql += ` AND category = ?`;
      countParams.push(category);
    }

    if (level) {
      countSql += ` AND level = ?`;
      countParams.push(level);
    }

    const countResult = await query<[{ total: number }]>(countSql, countParams);
    const total = countResult[0]?.total || 0;

    // Format courses for frontend
    const formattedCourses = courses.map(course => ({
      ...course,
      // Ensure highlights is always an array (you might need to store highlights in DB)
      highlights: [
        'Comprehensive training program',
        'Hands-on practical sessions',
        'Industry-relevant curriculum',
        'Expert instructor guidance',
        'Certificate upon completion',
        'Career support'
      ],
      // Parse price numbers if needed
      price: course.price.startsWith('PKR') ? course.price : `PKR ${course.price}`,
      originalPrice: course.originalPrice ? 
        (course.originalPrice.startsWith('PKR') ? course.originalPrice : `PKR ${course.originalPrice}`) 
        : null,
    }));

    // Return successful response
    return NextResponse.json({
      success: true,
      data: formattedCourses,
      count: formattedCourses.length,
      total
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch courses. Please try again later.' 
      },
      { status: 500 }
    );
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}