/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }  // ✅ params is Promise
) {
    let connection;
    try {
        // ✅ MUST await params before accessing
        const { id: fileId } = await params;
        
        console.log('📁 File download requested for ID:', fileId);
        
        if (!fileId || fileId === 'undefined' || fileId === 'null') {
            console.error('❌ Invalid file ID:', fileId);
            return new NextResponse('Invalid file ID', { status: 400 });
        }
        
        connection = await getConnection();
        
        console.log('🔍 Querying database for file ID:', fileId);
        
        const [rows] = await connection.execute(
            `SELECT file_name, file_type, file_data FROM assignment_files WHERE id = ?`,
            [fileId]
        );
        
        const files = rows as any[];
        
        if (files.length === 0) {
            console.error('❌ File not found in database for ID:', fileId);
            return new NextResponse(JSON.stringify({ 
                error: 'File not found',
                fileId: fileId,
                message: 'The requested file does not exist in the database'
            }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const file = files[0];
        
        console.log('✅ File found:', {
            name: file.file_name,
            type: file.file_type,
            size: file.file_data?.length || 0,
            id: fileId
        });
        
        if (!file.file_data) {
            console.error('❌ File data is empty for ID:', fileId);
            return new NextResponse(JSON.stringify({ 
                error: 'File data is empty',
                fileId: fileId
            }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        return new NextResponse(file.file_data, {
            headers: {
                'Content-Type': file.file_type || 'application/octet-stream',
                'Content-Disposition': `inline; filename="${encodeURIComponent(file.file_name)}"`,
                'Content-Length': file.file_data.length.toString(),
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        });
        
    } catch (error: any) {
        console.error('❌ Error in file download API:', {
            message: error.message,
            stack: error.stack,
        });
        
        return new NextResponse(JSON.stringify({ 
            error: 'Internal server error',
            message: error.message,
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    } finally {
        if (connection) {
            connection.release();
            console.log('🔌 Database connection released');
        }
    }
}