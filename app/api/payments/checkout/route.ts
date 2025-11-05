import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createCheckout, PLANS } from '@/lib/payments/lemon-squeezy';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await request.json();
    
    if (!planId || !Object.keys(PLANS).some(k => PLANS[k as keyof typeof PLANS].id === planId)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const checkoutUrl = await createCheckout(planId, userId);

    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error('Checkout creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

