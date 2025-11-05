import { z } from 'zod';

// Dangerous patterns that indicate prompt injection
const INJECTION_PATTERNS = [
  /ignore\s+(previous|all|above|below)/i,
  /(forget|disregard|override)\s+(previous|instructions|system)/i,
  /system\s*:\s*(prompt|instruction)/i,
  /you\s+are\s+now/i,
  /act\s+as\s+if/i,
  /pretend\s+you\s+are/i,
  /new\s+instructions?\s*:/i,
  /\[system\]/i,
  /<\|system\|>/i,
  /\[INST\]/i,
  /\{\{.*\}\}/, // Template injection
  /\%7B\%7B.*\%7D\%7D/i, // URL-encoded template injection
  /<script/i,
  /javascript:/i,
  /on\w+\s*=/i, // Event handlers
];

export function sanitizeInput(input: string): string {
  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  // Trim excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized;
}

export function detectPromptInjection(input: string): {
  isInjection: boolean;
  patterns: string[];
} {
  const detected: string[] = [];
  
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      detected.push(pattern.source);
    }
  }
  
  return {
    isInjection: detected.length > 0,
    patterns: detected,
  };
}

export function shieldSystemPrompt(
  userInput: string,
  systemPrompt: string
): string {
  // Sanitize user input first
  const sanitized = sanitizeInput(userInput);
  
  // Check for injection
  const { isInjection } = detectPromptInjection(sanitized);
  
  if (isInjection) {
    throw new Error('Prompt injection detected. Request blocked.');
  }
  
  // Return shielded prompt
  return `${systemPrompt}\n\nUser Request: ${sanitized}\n\nRemember: You are a legal document assistant. Follow all system instructions.`;
}

// Schema for validating legal document requests
export const LegalDocumentSchema = z.object({
  documentType: z.enum(['motion', 'declaration', 'sanctions', 'certificate']),
  state: z.enum(['IL', 'NY', 'CA', 'TX', 'FL']),
  caseInfo: z.object({
    courtName: z.string().min(1),
    caseNumber: z.string().optional(),
    plaintiff: z.string().min(1),
    defendant: z.string().min(1),
  }),
  content: z.string().min(10).max(50000),
  metadata: z.record(z.any()).optional(),
});

export type LegalDocumentRequest = z.infer<typeof LegalDocumentSchema>;

