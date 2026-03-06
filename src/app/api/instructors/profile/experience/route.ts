import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, profileId, experience } = body;

    console.log('💼 Experience API called:', { action, profileId, experience });

    if (!profileId) {
      return NextResponse.json(
        { success: false, error: 'Profile ID is required' },
        { status: 400 }
      );
    }

    if (action === 'add' || action === 'update') {
      // Validate required fields
      if (!experience?.position || !experience?.company) {
        return NextResponse.json(
          { success: false, error: 'Position and company are required' },
          { status: 400 }
        );
      }

      if (action === 'add') {
        // Add new experience
        const id = uuidv4();
        console.log('➕ Adding new experience with ID:', id);
        
        await query(
          `INSERT INTO instructor_experience 
           (id, profile_id, position, company, duration, description, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            id,
            profileId,
            experience.position,
            experience.company,
            experience.duration || null,
            experience.description || null
          ]
        );
        console.log('✅ Experience added successfully');
      } 
      else if (action === 'update') {
        // Update existing experience
        if (!experience.id) {
          return NextResponse.json(
            { success: false, error: 'Experience ID is required for update' },
            { status: 400 }
          );
        }
        
        console.log('✏️ Updating experience:', experience.id);
        
        await query(
          `UPDATE instructor_experience 
           SET position = ?, company = ?, duration = ?, description = ?, updated_at = NOW()
           WHERE id = ? AND profile_id = ?`,
          [
            experience.position,
            experience.company,
            experience.duration || null,
            experience.description || null,
            experience.id,
            profileId
          ]
        );
        console.log('✅ Experience updated successfully');
      }
    } 
    else if (action === 'delete') {
      // Delete experience
      if (!experience?.id) {
        return NextResponse.json(
          { success: false, error: 'Experience ID is required for delete' },
          { status: 400 }
        );
      }
      
      console.log('🗑️ Deleting experience:', experience.id);
      
      await query(
        'DELETE FROM instructor_experience WHERE id = ? AND profile_id = ?',
        [experience.id, profileId]
      );
      console.log('✅ Experience deleted successfully');
    }
    else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Fetch updated experience
    const experienceList = await query<any[]>(
      'SELECT * FROM instructor_experience WHERE profile_id = ? ORDER BY created_at DESC',
      [profileId]
    );

    console.log('📊 Updated experience count:', experienceList?.length || 0);

    return NextResponse.json({
      success: true,
      data: experienceList || [],
      message: action === 'delete' ? 'Experience removed' : 'Experience saved'
    });

  } catch (error: any) {
    console.error('❌ Error in experience API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to manage experience' },
      { status: 500 }
    );
  }
}

// GET method to fetch experience
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json(
        { success: false, error: 'Profile ID is required' },
        { status: 400 }
      );
    }

    const experience = await query<any[]>(
      'SELECT * FROM instructor_experience WHERE profile_id = ? ORDER BY created_at DESC',
      [profileId]
    );

    return NextResponse.json({
      success: true,
      data: experience || []
    });

  } catch (error: any) {
    console.error('Error fetching experience:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}