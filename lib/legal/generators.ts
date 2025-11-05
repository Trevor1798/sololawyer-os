import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import {
  generateCourtCaption,
  generateMeetAndConferDeclaration,
  generateSanctionsBlock,
  generateCertificateOfService,
  CaseInfo,
} from './templates';

export async function generateDocx(
  content: string,
  metadata: {
    title: string;
    caseInfo?: CaseInfo;
    trackChanges?: boolean;
  }
): Promise<Buffer> {
  // Split content into paragraphs
  const paragraphs = content.split('\n\n').map((text) => {
    if (text.trim().startsWith('#')) {
      // Heading
      const level = (text.match(/^#+/)?.[0]?.length || 1) as HeadingLevel;
      return new Paragraph({
        text: text.replace(/^#+\s*/, ''),
        heading: level,
      });
    }
    
    // Regular paragraph with track changes support
    const runs = text.split(/\n/).map((line, index, array) => {
      const isLast = index === array.length - 1;
      return new TextRun({
        text: line + (isLast ? '' : '\n'),
        // Track changes would be enabled here in production
      });
    });
    
    return new Paragraph({
      children: runs,
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: metadata.title,
            heading: HeadingLevel.TITLE,
          }),
          ...paragraphs,
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

export async function generateMotionDocument(
  state: 'IL' | 'NY' | 'CA' | 'TX' | 'FL',
  caseInfo: CaseInfo,
  motionContent: string,
  includeTemplates: {
    meetAndConfer?: boolean;
    sanctions?: boolean;
    certificate?: boolean;
  }
): Promise<Buffer> {
  const caption = generateCourtCaption(state, caseInfo);
  
  let fullContent = `${caption}\n\n${motionContent}\n\n`;
  
  if (includeTemplates.meetAndConfer) {
    fullContent += generateMeetAndConferDeclaration(caseInfo, {
      date: new Date().toLocaleDateString(),
      participants: ['To be completed'],
      attempts: ['To be completed'],
      outcome: 'To be completed',
    });
    fullContent += '\n\n';
  }
  
  if (includeTemplates.sanctions) {
    fullContent += generateSanctionsBlock(caseInfo, {
      fees: 0,
      adverseInference: false,
      reason: 'To be completed',
      authority: ['To be completed'],
    });
    fullContent += '\n\n';
  }
  
  if (includeTemplates.certificate) {
    fullContent += generateCertificateOfService(caseInfo, {
      documentName: 'Motion',
      method: 'email',
      date: new Date().toLocaleDateString(),
      recipients: [{ name: 'To be completed', address: 'To be completed' }],
    });
  }
  
  return generateDocx(fullContent, {
    title: `Motion - ${caseInfo.plaintiff} v. ${caseInfo.defendant}`,
    caseInfo,
    trackChanges: true,
  });
}

