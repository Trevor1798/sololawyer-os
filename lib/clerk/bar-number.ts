import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabase } from '../supabase/server';

export async function requireBarNumber(userId: string): Promise<string> {
  const user = await currentUser();
  
  // Check if bar number is set in Clerk metadata
  const barNumber = user?.publicMetadata?.barNumber as string | undefined;
  
  if (!barNumber) {
    // Check Supabase
    const supabase = await createServerSupabase(userId);
    const { data: userData } = await supabase
      .from('users')
      .select('bar_number')
      .eq('clerk_user_id', userId)
      .single();
    
    if (userData?.bar_number) {
      return userData.bar_number;
    }
    
    throw new Error('Bar number required. Please update your profile.');
  }
  
  return barNumber;
}

export async function requireMFA(userId: string): Promise<boolean> {
  const user = await currentUser();
  
  // Clerk automatically enforces MFA if configured
  // This is a verification check
  const mfaEnabled = user?.twoFactorEnabled || false;
  
  if (!mfaEnabled) {
    throw new Error('Multi-factor authentication required. Please enable MFA in your account settings.');
  }
  
  return true;
}

