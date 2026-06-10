import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// PII patterns for redaction
const PII_PATTERNS = {
  ssn: /\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b/g,
  dob: /\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/g,
  plate: /\b[A-Z]{1,3}\s?\d{1,4}[A-Z]{0,2}\b/g,
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
};

export interface RedactionResult {
  redactedText: string;
  redactions: Array<{
    type: string;
    original: string;
    position: number;
  }>;
}

export async function redactPII(text: string): Promise<RedactionResult> {
  const redactions: RedactionResult['redactions'] = [];
  let redactedText = text;

  // Regex-based redaction
  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[0]) {
        redactedText = redactedText.replace(
          match[0],
          `[REDACTED_${type.toUpperCase()}]`
        );
        redactions.push({
          type,
          original: match[0],
          position: match.index || 0,
        });
      }
    }
  }

  return { redactedText, redactions };
}

export async function processWithClaude(
  redactedText: string,
  prompt: string
): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system:
      'You are a legal document assistant. Process the following redacted document according to the user request. Never attempt to reconstruct or guess redacted information. Always include a disclaimer that outputs must be reviewed by a licensed attorney before filing.',
    messages: [
      {
        role: 'user',
        content: `User Request: ${prompt}\n\nDocument:\n${redactedText}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return content.text;
}