import { createServerSupabase } from '../supabase/server';
import { logAuditEvent, getClientIP } from '../security/audit';

const SIGNED_URL_EXPIRY = 60; // 60 seconds

export interface FileMetadata {
  filename: string;
  mimeType: string;
  size: number;
  userId: string;
  pinned?: boolean;
}

export async function uploadFile(
  file: File,
  metadata: FileMetadata,
  clerkUserId: string
): Promise<{ id: string; path: string }> {
  const supabase = await createServerSupabase(clerkUserId);
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${clerkUserId}/${fileName}`;
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(filePath, file, {
      contentType: metadata.mimeType,
      upsert: false,
    });
  
  if (error) throw error;
  
  // Save metadata to database
  const expiresAt = metadata.pinned 
    ? null 
    : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  
  const { data: dbData, error: dbError } = await supabase
    .from('files')
    .insert({
      user_id: metadata.userId,
      filename: metadata.filename,
      storage_path: filePath,
      mime_type: metadata.mimeType,
      pinned: metadata.pinned || false,
      expires_at: expiresAt,
    })
    .select()
    .single();
  
  if (dbError) throw dbError;
  
  // Log audit event
  await logAuditEvent({
    user_id: clerkUserId,
    action: 'file_upload',
    metadata: { filename: metadata.filename, fileId: dbData.id },
  });
  
  return { id: dbData.id, path: filePath };
}

export async function getSignedUrl(
  fileId: string,
  clerkUserId: string
): Promise<string> {
  const supabase = await createServerSupabase(clerkUserId);
  
  // Get file metadata
  const { data: file, error: fileError } = await supabase
    .from('files')
    .select('storage_path, user_id')
    .eq('id', fileId)
    .single();
  
  if (fileError || !file) throw new Error('File not found');
  
  // Verify ownership via RLS
  if (file.user_id !== clerkUserId) {
    throw new Error('Unauthorized');
  }
  
  // Generate signed URL (60s expiry)
  const { data: urlData, error: urlError } = await supabase.storage
    .from('documents')
    .createSignedUrl(file.storage_path, SIGNED_URL_EXPIRY);
  
  if (urlError) throw urlError;
  
  // Log access
  await logAuditEvent({
    user_id: clerkUserId,
    action: 'file_access',
    metadata: { fileId, path: file.storage_path },
  });
  
  return urlData.signedUrl;
}

export async function deleteExpiredFiles(clerkUserId: string) {
  const supabase = await createServerSupabase(clerkUserId);
  
  // Find expired, unpinned files
  const { data: expiredFiles, error } = await supabase
    .from('files')
    .select('id, storage_path')
    .eq('pinned', false)
    .lt('expires_at', new Date().toISOString());
  
  if (error) throw error;
  
  // Delete from storage
  for (const file of expiredFiles || []) {
    await supabase.storage.from('documents').remove([file.storage_path]);
    await supabase.from('files').delete().eq('id', file.id);
    
    await logAuditEvent({
      user_id: clerkUserId,
      action: 'file_auto_delete',
      metadata: { fileId: file.id },
    });
  }
}

