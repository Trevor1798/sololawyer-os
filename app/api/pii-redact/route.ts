import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { redactPII, processWithGemini } from '@/lib/security/pii-redaction';
import { logAuditEvent, getClientIP } from '@/lib/security/audit';
import { shieldSystemPrompt } from '@/lib/security/prompt-guard';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, prompt } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Step 1: Redact PII
    const { redactedText, redactions } = await redactPII(text);

    // Step 2: Shield prompt
    const systemPrompt = `You are a legal document assistant. Process this redacted document. Never attempt to reconstruct redacted information.`;
    const shieldedPrompt = shieldSystemPrompt(prompt || '', systemPrompt);

    // Step 3: Process with Gemini
    const processed = await processWithGemini(redactedText, shieldedPrompt);

    // Log audit
    await logAuditEvent({
      user_id: userId,
      action: 'pii_redaction',
      ip_address: getClientIP(request),
      metadata: {
        redactionCount: redactions.length,
        redactionTypes: [...new Set(redactions.map(r => r.type))],
      },
    });

    return NextResponse.json({
      processed,
      redactions: redactions.map(r => ({
        type: r.type,
        position: r.position,
      })),
      redactedTextLength: redactedText.length,
    });
  } catch (error: any) {
    console.error('PII redaction error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

