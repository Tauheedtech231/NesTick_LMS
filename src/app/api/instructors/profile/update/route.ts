import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
/* eslint-disable */
export async function POST(request: NextRequest) {
  try {
    const { profileId, data } = await request.json();

    if (!profileId || !data) {
      return NextResponse.json(
        { success: false, error: 'Profile ID and data are required' },
        { status: 400 }
      );
    }

    console.log('📝 Updating profile:', profileId);

    // Update profile
    await query(
      `UPDATE instructors_profile 
       SET full_name = ?, 
           email = ?, 
           phone = ?, 
           specialization = ?, 
           department = ?, 
           bio = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [
        data.fullName,
        data.email,
        data.phone || null,
        data.specialization || null,
        data.department || null,
        data.bio || null,
        profileId
      ]
    );

    // Get updated profile
    const updatedProfile = await query<any[]>(
      'SELECT * FROM instructors_profile WHERE id = ?',
      [profileId]
    );

    return NextResponse.json({
      success: true,
      data: updatedProfile[0],
      message: 'Profile updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}