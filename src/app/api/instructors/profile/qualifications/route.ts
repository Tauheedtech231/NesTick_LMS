import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, profileId, qualification } = body;

    console.log('📚 Qualifications API called:', { action, profileId, qualification });

    if (!profileId) {
      return NextResponse.json(
        { success: false, error: 'Profile ID is required' },
        { status: 400 }
      );
    }

    if (action === 'add' || action === 'update') {
      // Validate required fields
      if (!qualification?.degree || !qualification?.institution) {
        return NextResponse.json(
          { success: false, error: 'Degree and institution are required' },
          { status: 400 }
        );
      }

      if (action === 'add') {
        // Add new qualification
        const id = uuidv4();
        console.log('➕ Adding new qualification with ID:', id);
        
        await query(
          `INSERT INTO instructor_qualifications 
           (id, profile_id, degree, institution, year, description, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            id,
            profileId,
            qualification.degree,
            qualification.institution,
            qualification.year || null,
            qualification.description || null
          ]
        );
        console.log('✅ Qualification added successfully');
      } 
      else if (action === 'update') {
        // Update existing qualification
        if (!qualification.id) {
          return NextResponse.json(
            { success: false, error: 'Qualification ID is required for update' },
            { status: 400 }
          );
        }
        
        console.log('✏️ Updating qualification:', qualification.id);
        
        await query(
          `UPDATE instructor_qualifications 
           SET degree = ?, institution = ?, year = ?, description = ?, updated_at = NOW()
           WHERE id = ? AND profile_id = ?`,
          [
            qualification.degree,
            qualification.institution,
            qualification.year || null,
            qualification.description || null,
            qualification.id,
            profileId
          ]
        );
        console.log('✅ Qualification updated successfully');
      }
    } 
    else if (action === 'delete') {
      // Delete qualification
      if (!qualification?.id) {
        return NextResponse.json(
          { success: false, error: 'Qualification ID is required for delete' },
          { status: 400 }
        );
      }
      
      console.log('🗑️ Deleting qualification:', qualification.id);
      
      await query(
        'DELETE FROM instructor_qualifications WHERE id = ? AND profile_id = ?',
        [qualification.id, profileId]
      );
      console.log('✅ Qualification deleted successfully');
    }
    else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Fetch updated qualifications
    const qualifications = await query<any[]>(
      'SELECT * FROM instructor_qualifications WHERE profile_id = ? ORDER BY created_at DESC',
      [profileId]
    );

    console.log('📊 Updated qualifications count:', qualifications?.length || 0);

    return NextResponse.json({
      success: true,
      data: qualifications || [],
      message: action === 'delete' ? 'Qualification removed' : 'Qualification saved'
    });

  } catch (error: any) {
    console.error('❌ Error in qualifications API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to manage qualifications' },
      { status: 500 }
    );
  }
}

// GET method to fetch qualifications
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

    const qualifications = await query<any[]>(
      'SELECT * FROM instructor_qualifications WHERE profile_id = ? ORDER BY created_at DESC',
      [profileId]
    );

    return NextResponse.json({
      success: true,
      data: qualifications || []
    });

  } catch (error: any) {
    console.error('Error fetching qualifications:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}