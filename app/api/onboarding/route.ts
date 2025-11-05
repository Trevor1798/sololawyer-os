import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { getServiceSupabase } from '@/lib/supabase/server';
import { logAuditEvent, getClientIP } from '@/lib/security/audit';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { barNumber, email } = await request.json();

    if (!barNumber || typeof barNumber !== 'string') {
      return NextResponse.json(
        { error: 'Bar number is required' },
        { status: 400 }
      );
    }

    // Validate bar number format
    if (!/^[A-Z0-9]{4,20}$/i.test(barNumber.trim())) {
      return NextResponse.json(
        { error: 'Invalid bar number format' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabase(userId);
    const serviceSupabase = getServiceSupabase();

    // Check if user already exists (using service role to bypass RLS for check)
    const { data: existingUser } = await serviceSupabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (existingUser) {
      // Update existing user (using regular client - RLS will allow this)
      const { error: updateError } = await supabase
        .from('users')
        .update({
          bar_number: barNumber.trim().toUpperCase(),
          email: email || '',
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_user_id', userId);

      if (updateError) throw updateError;
    } else {
      // Create new user (using service role to bypass RLS for initial insert)
      const { error: insertError } = await serviceSupabase.from('users').insert({
        clerk_user_id: userId,
        bar_number: barNumber.trim().toUpperCase(),
        email: email || '',
      });

      if (insertError) throw insertError;
    }

    // Log audit event
    await logAuditEvent({
      user_id: userId,
      action: 'bar_number_set',
      ip_address: getClientIP(request),
      metadata: { barNumber: barNumber.trim().toUpperCase() },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Onboarding error:', error);
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

    const supabase = await createServerSupabase(userId);
    const { data: user, error } = await supabase
      .from('users')
      .select('bar_number')
      .eq('clerk_user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine
      throw error;
    }

    return NextResponse.json({
      hasBarNumber: !!user?.bar_number,
    });
  } catch (error: any) {
    console.error('Onboarding check error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

