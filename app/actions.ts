'use server';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';

export async function afterSignIn() {
  const { userId } = await auth();
  if (!userId) return;

  // Check if user has bar number
  const supabase = await createServerSupabase(userId);
  const { data: user } = await supabase
    .from('users')
    .select('bar_number')
    .eq('clerk_user_id', userId)
    .single();

  if (!user?.bar_number) {
    redirect('/onboarding');
  } else {
    redirect('/dashboard');
  }
}

export async function afterSignUp() {
  // New users always go to onboarding
  redirect('/onboarding');
}

