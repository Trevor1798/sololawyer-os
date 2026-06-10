import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  LineRuleType,
  TabStopType,
  TabStopPosition,
  convertInchesToTwip,
} from 'docx';
import {
  generateCourtCaption,
  generateMeetAndConferDeclaration,
  generateSanctionsBlock,
  generateCertificateOfService,
  CaseInfo,
} from './templates';

// Double spacing value (480 = 24pt line spacing in twips, 240 = single)
const DOUBLE_SPACE = { line: 480, lineRule: LineRuleType.AUTO };
const INDENT_FIRST_LINE = { firstLine: convertInchesToTwip(0.5) };
const INDENT_NUMBERED = { left: convertInchesToTwip(0.5) };

function parseContentToParagraphs(content: string): Paragraph[] {
  const lines = content.split('\n');
  const paragraphs: Paragraph[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      // Empty line — add spacing paragraph
      paragraphs.push(
        new Paragraph({
          spacing: DOUBLE_SPACE,
          children: [new TextRun('')],
        })
      );
      continue;
    }

    // ALL CAPS lines = section headings (centered, bold)
    if (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && !/^\d+\./.test(trimmed)) {
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: DOUBLE_SPACE,
          children: [
            new TextRun({
              text: trimmed,
              bold: true,
              size: 24, // 12pt
              font: 'Times New Roman',
            }),
          ],
        })
      );
      continue;
    }

    // Numbered paragraphs (1. 2. etc) — indented
    if (/^\d+\./.test(trimmed)) {
      paragraphs.push(
        new Paragraph({
          spacing: DOUBLE_SPACE,
          indent: INDENT_NUMBERED,
          children: [
            new TextRun({
              text: trimmed,
              size: 24,
              font: 'Times New Roman',
            }),
          ],
        })
      );
      continue;
    }

    // Signature lines (___) — right aligned
    if (trimmed.startsWith('___') || trimmed.startsWith('By:') || trimmed.startsWith('Respectfully')) {
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: DOUBLE_SPACE,
          children: [
            new TextRun({
              text: trimmed,
              size: 24,
              font: 'Times New Roman',
            }),
          ],
        })
      );
      continue;
    }

    // WHEREFORE paragraphs — indented first line
    if (trimmed.startsWith('WHEREFORE') || trimmed.startsWith('COMES NOW')) {
      paragraphs.push(
        new Paragraph({
          spacing: DOUBLE_SPACE,
          indent: INDENT_FIRST_LINE,
          children: [
            new TextRun({
              text: trimmed,
              size: 24,
              font: 'Times New Roman',
            }),
          ],
        })
      );
      continue;
    }

    // Regular paragraph — first line indented
    paragraphs.push(
      new Paragraph({
        spacing: DOUBLE_SPACE,
        indent: INDENT_FIRST_LINE,
        children: [
          new TextRun({
            text: trimmed,
            size: 24, // 12pt
            font: 'Times New Roman',
          }),
        ],
      })
    );
  }

  return paragraphs;
}

function buildCaptionParagraphs(state: string, caseInfo: CaseInfo): Paragraph[] {
  const courtName =
    state === 'FL'
      ? 'IN THE CIRCUIT COURT OF THE TENTH JUDICIAL CIRCUIT\nIN AND FOR POLK COUNTY, FLORIDA'
      : caseInfo.courtName;

  const paragraphs: Paragraph[] = [];

  // Court name — centered, bold
  for (const line of courtName.split('\n')) {
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { line: 240, lineRule: LineRuleType.AUTO },
        children: [new TextRun({ text: line, bold: true, size: 24, font: 'Times New Roman' })],
      })
    );
  }

  paragraphs.push(new Paragraph({ children: [new TextRun('')] }));

  // Plaintiff row — name left, case number right using tabs
  paragraphs.push(
    new Paragraph({
      spacing: { line: 240, lineRule: LineRuleType.AUTO },
      tabStops: [{ type: TabStopType.RIGHT, position: convertInchesToTwip(6) }],
      children: [
        new TextRun({ text: `${caseInfo.plaintiff.toUpperCase()},`, size: 24, font: 'Times New Roman' }),
        new TextRun({ text: '\t', size: 24 }),
        new TextRun({
          text: `Case No. ${caseInfo.caseNumber || '___________'}`,
          size: 24,
          font: 'Times New Roman',
        }),
      ],
    })
  );

  paragraphs.push(
    new Paragraph({
      spacing: { line: 240, lineRule: LineRuleType.AUTO },
      indent: { left: convertInchesToTwip(1) },
      children: [new TextRun({ text: 'Plaintiff,', size: 24, font: 'Times New Roman' })],
    })
  );

  paragraphs.push(
    new Paragraph({
      spacing: { line: 240, lineRule: LineRuleType.AUTO },
      children: [new TextRun({ text: 'vs.', size: 24, font: 'Times New Roman', italics: true })],
    })
  );

  paragraphs.push(
    new Paragraph({
      spacing: { line: 240, lineRule: LineRuleType.AUTO },
      children: [new TextRun({ text: `${caseInfo.defendant.toUpperCase()},`, size: 24, font: 'Times New Roman' })],
    })
  );

  paragraphs.push(
    new Paragraph({
      spacing: { line: 240, lineRule: LineRuleType.AUTO },
      indent: { left: convertInchesToTwip(1) },
      children: [new TextRun({ text: 'Defendant.', size: 24, font: 'Times New Roman' })],
    })
  );

  // Divider line
  paragraphs.push(
    new Paragraph({
      spacing: { line: 240, lineRule: LineRuleType.AUTO },
      children: [
        new TextRun({
          text: '─'.repeat(68),
          size: 24,
          font: 'Times New Roman',
        }),
      ],
    })
  );

  paragraphs.push(new Paragraph({ children: [new TextRun('')] }));

  return paragraphs;
}

export async function generateDocx(
  content: string,
  metadata: {
    title: string;
    caseInfo?: CaseInfo;
    state?: string;
  }
): Promise<Buffer> {
  const captionParagraphs = metadata.caseInfo
    ? buildCaptionParagraphs(metadata.state || 'FL', metadata.caseInfo)
    : [];

  const contentParagraphs = parseContentToParagraphs(content);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1.25),
              right: convertInchesToTwip(1),
            },
          },
        },
        children: [...captionParagraphs, ...contentParagraphs],
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
  let fullContent = `${motionContent}\n\n`;

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
    state,
  });

  
}