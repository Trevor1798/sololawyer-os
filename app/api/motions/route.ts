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
    // Shield and sanitize input
const systemPrompt = `You are an expert legal document assistant specializing in Florida court motions. 
Generate a complete, professional, properly formatted motion document for the Tenth Judicial Circuit, Polk County, Florida.
Output ONLY the motion document text itself — no meta-commentary, no instructions, no system messages.
Always end with a signature block placeholder and certificate of service.
IMPORTANT: This is a draft for attorney review only. Include a disclaimer at the bottom.`;

const shieldedPrompt = shieldSystemPrompt(validated.content, systemPrompt);

// Call Claude to generate the actual motion content
const Anthropic = (await import('@anthropic-ai/sdk')).default;
const client = new Anthropic();
const message = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 4096,
  system: systemPrompt,
  messages: [
    {
      role: 'user',
      content: `Generate a Motion to Compel Discovery for the following case:
Court: ${validated.caseInfo.courtName}
Case Number: ${validated.caseInfo.caseNumber || 'To be assigned'}
Plaintiff: ${validated.caseInfo.plaintiff}
Defendant: ${validated.caseInfo.defendant}
State: ${validated.state}

Motion Details: ${validated.content}`,
    },
  ],
});

const generatedContent = message.content[0].type === 'text' 
  ? message.content[0].text 
  : '';

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
      generatedContent,
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

