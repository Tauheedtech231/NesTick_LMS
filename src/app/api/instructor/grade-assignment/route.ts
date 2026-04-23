import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
/* eslint-disable */

export async function POST(request: NextRequest) {
  let connection;
  try {
    const { submissionId, score, feedback, totalMarks } = await request.json();

    if (!submissionId) {
      return NextResponse.json(
        { success: false, error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    if (score === undefined || score === null) {
      return NextResponse.json(
        { success: false, error: 'Score is required' },
        { status: 400 }
      );
    }

    if (score < 0 || score > totalMarks) {
      return NextResponse.json(
        { success: false, error: `Score must be between 0 and ${totalMarks}` },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // Update assignment submission with grade and feedback
    await connection.execute(
      `UPDATE assignment_submissions 
       SET score = ?, 
           feedback = ?, 
           status = 'graded',
           graded_at = NOW()
       WHERE id = ?`,
      [score, feedback || null, submissionId]
    );

    return NextResponse.json({
      success: true,
      message: 'Assignment graded successfully'
    });

  } catch (error: any) {
    console.error('Error grading assignment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to grade assignment' },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}