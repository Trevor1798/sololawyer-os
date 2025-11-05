import { getServiceSupabase } from '../supabase/server';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.AUDIT_LOG_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

export interface AuditLogEntry {
  user_id: string;
  action: string;
  ip_address?: string;
  metadata?: Record<string, any>;
}

export async function logAuditEvent(entry: AuditLogEntry) {
  const supabase = getServiceSupabase();
  
  // Generate request hash for integrity verification
  const requestHash = CryptoJS.SHA256(
    `${entry.user_id}-${entry.action}-${Date.now()}`
  ).toString();

  // Encrypt metadata
  const encryptedData = entry.metadata
    ? CryptoJS.AES.encrypt(
        JSON.stringify(entry.metadata),
        ENCRYPTION_KEY
      ).toString()
    : null;

  const { error } = await supabase.from('audit_logs').insert({
    user_id: entry.user_id,
    action: entry.action,
    ip_address: entry.ip_address,
    request_hash: requestHash,
    encrypted_data: encryptedData,
  });

  if (error) {
    console.error('Audit log error:', error);
    // Don't throw - audit logging should never break the app
  }
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIP || 'unknown';
}

