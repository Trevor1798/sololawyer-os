import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { uploadFile, getSignedUrl, deleteExpiredFiles } from '@/lib/storage/secure-storage';
import { logAuditEvent, getClientIP } from '@/lib/security/audit';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const pinned = formData.get('pinned') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    const result = await uploadFile(
      file,
      {
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        userId,
        pinned,
      },
      userId
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const fileId = searchParams.get('id');

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    // Clean up expired files
    await deleteExpiredFiles(userId);

    const signedUrl = await getSignedUrl(fileId, userId);

    return NextResponse.json({ url: signedUrl });
  } catch (error: any) {
    console.error('File access error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

