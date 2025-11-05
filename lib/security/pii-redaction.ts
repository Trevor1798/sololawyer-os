import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID!;
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us';
const processorId = process.env.DOCUMENT_AI_PROCESSOR_ID!;

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
  
  // Use Document AI if available
  if (projectId && processorId) {
    try {
      const client = new DocumentProcessorServiceClient();
      const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
      
      const [result] = await client.processDocument({
        name,
        rawDocument: {
          content: Buffer.from(text),
          mimeType: 'text/plain',
        },
      });
      
      // Extract PII entities from Document AI response
      const entities = result.document?.entities || [];
      for (const entity of entities) {
        if (entity.type?.includes('PERSON') || 
            entity.type?.includes('SSN') || 
            entity.type?.includes('DATE_OF_BIRTH') ||
            entity.type?.includes('ADDRESS')) {
          const value = entity.mentionText || '';
          if (value) {
            redactedText = redactedText.replace(value, '[REDACTED]');
            redactions.push({
              type: entity.type || 'UNKNOWN',
              original: value,
              position: entity.anchor?.textSegments?.[0]?.startIndex || 0,
            });
          }
        }
      }
    } catch (error) {
      console.error('Document AI error, falling back to regex:', error);
      // Fallback to regex
    }
  }
  
  // Fallback: Regex-based redaction
  if (redactions.length === 0) {
    for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[0]) {
          redactedText = redactedText.replace(match[0], `[REDACTED_${type.toUpperCase()}]`);
          redactions.push({
            type,
            original: match[0],
            position: match.index || 0,
          });
        }
      }
    }
  }
  
  return { redactedText, redactions };
}

export async function processWithGemini(
  redactedText: string,
  prompt: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  const systemPrompt = `You are a legal document assistant. Process the following redacted document according to the user's request. Never attempt to reconstruct or guess redacted information.`;
  
  const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}\n\nDocument:\n${redactedText}`;
  
  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  
  return response.text();
}

