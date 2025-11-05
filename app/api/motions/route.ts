import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { logAuditEvent, getClientIP } from '@/lib/security/audit';
import { shieldSystemPrompt } from '@/lib/security/prompt-guard';
import { createServerSupabase } from '@/lib/supabase/server';
import { generateMotionDocument } from '@/lib/legal/generators';
import { LegalDocumentSchema } from '@/lib/security/prompt-guard';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(userId, 'motion_create', request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          resetTime: rateLimit.resetTime,
        },
        { status: 429 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validated = LegalDocumentSchema.parse(body);

    // Shield system prompt
    const systemPrompt = `You are a legal document assistant. Generate a professional motion document according to legal standards.`;
    const shieldedPrompt = shieldSystemPrompt(validated.content, systemPrompt);

    // Get user's UUID from database (needed for foreign key)
    const supabase = await createServerSupabase(userId);
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (userError || !user) {
      throw new Error('User not found. Please complete onboarding first.');
    }

    // Create document in database
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id, // Use UUID, not Clerk user_id
        title: `${validated.documentType} - ${validated.caseInfo.courtName}`,
        content: shieldedPrompt,
        state: validated.state,
        document_type: validated.documentType,
      })
      .select()
      .single();

    if (docError) throw docError;

    // Create motion record
    const { data: motion, error: motionError } = await supabase
      .from('motions')
      .insert({
        user_id: user.id, // Use UUID, not Clerk user_id
        document_id: document.id,
        motion_type: validated.documentType,
      })
      .select()
      .single();

    if (motionError) throw motionError;

    // Generate DOCX
    const docxBuffer = await generateMotionDocument(
      validated.state,
      validated.caseInfo,
      shieldedPrompt,
      {
        meetAndConfer: validated.documentType === 'declaration',
        sanctions: validated.documentType === 'sanctions',
        certificate: true,
      }
    );

    // Log audit
    await logAuditEvent({
      user_id: userId,
      action: 'motion_created',
      ip_address: getClientIP(request),
      metadata: {
        motionId: motion.id,
        documentId: document.id,
        state: validated.state,
      },
    });

    return new NextResponse(docxBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="motion-${document.id}.docx"`,
      },
    });
  } catch (error: any) {
    console.error('Motion creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

