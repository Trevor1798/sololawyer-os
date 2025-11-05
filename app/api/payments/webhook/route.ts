import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhook } from '@/lib/payments/lemon-squeezy';
import { createServerSupabase } from '@/lib/supabase/server';
import { logAuditEvent } from '@/lib/security/audit';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-signature') || '';
    const body = await request.text();
    
    // Verify webhook signature
    const isValid = await verifyWebhook(signature, body);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    
    // Handle subscription events
    if (event.meta?.event_name === 'subscription_created' || 
        event.meta?.event_name === 'subscription_updated') {
      const userId = event.meta?.custom_data?.user_id;
      const planId = event.meta?.custom_data?.plan_id;
      
      if (userId && planId) {
        const supabase = await createServerSupabase(userId);
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          plan_id: planId,
          status: 'active',
          updated_at: new Date().toISOString(),
        });
        
        await logAuditEvent({
          user_id: userId,
          action: 'subscription_updated',
          metadata: { planId, event: event.meta.event_name },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

