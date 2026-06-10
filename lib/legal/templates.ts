// Court captions for each state
export const COURT_CAPTIONS = {
  FL: {
    circuit: `IN THE CIRCUIT COURT OF THE TENTH JUDICIAL CIRCUIT\nIN AND FOR POLK COUNTY, FLORIDA`,
    federal: `UNITED STATES DISTRICT COURT\nMIDDLE DISTRICT OF FLORIDA\nTAMPA DIVISION`,
  },
};

export interface CaseInfo {
  courtName: string;
  caseNumber?: string;
  plaintiff: string;
  defendant: string;
  judge?: string;
}

export function generateCourtCaption(
  state: 'IL' | 'NY' | 'CA' | 'TX' | 'FL',
  caseInfo: CaseInfo,
  courtType: 'state' | 'federal' = 'state'
): string {
  return '';
}

export function generateMeetAndConferDeclaration(
  caseInfo: CaseInfo,
  details: {
    date: string;
    participants: string[];
    attempts: string[];
    outcome: string;
  }
): string {
  return `DECLARATION OF MEET AND CONFER\n\nI, [ATTORNEY NAME], declare as follows:\n\n1.\tI am an attorney licensed to practice law in the State of Florida.\n\n2.\tOn ${details.date}, I engaged in meet and confer efforts with opposing counsel.\n\nI declare under penalty of perjury that the foregoing is true and correct.\n\nExecuted on ${details.date}.\n\n\t\t\t\t\t\t________________________________\n\t\t\t\t\t\t[ATTORNEY NAME]\n\t\t\t\t\t\tFlorida Bar No. [BAR NUMBER]`;
}

export function generateSanctionsBlock(
  caseInfo: CaseInfo,
  sanctions: {
    fees: number;
    adverseInference: boolean;
    reason: string;
    authority: string[];
  }
): string {
  return `REQUEST FOR SANCTIONS\n\nPursuant to Rule 1.380, Florida Rules of Civil Procedure, Plaintiff requests sanctions of $${sanctions.fees.toLocaleString()}.\n\n${sanctions.reason}`;
}

export function generateCertificateOfService(
  caseInfo: CaseInfo,
  service: {
    documentName: string;
    method: 'email' | 'mail' | 'fax' | 'personal';
    date: string;
    recipients: Array<{ name: string; address: string }>;
  }
): string {
  return `CERTIFICATE OF SERVICE\n\nI HEREBY CERTIFY that on ${service.date}, a true and correct copy of the foregoing ${service.documentName} has been furnished by ${service.method.toUpperCase()} to:\n\n${service.recipients.map((r) => `${r.name}\n${r.address}`).join('\n\n')}\n\n\t\t\t\t\t\t________________________________\n\t\t\t\t\t\t[ATTORNEY NAME]\n\t\t\t\t\t\tFlorida Bar No. [BAR NUMBER]\n\t\t\t\t\t\t[FIRM NAME]\n\t\t\t\t\t\t[ADDRESS]\n\t\t\t\t\t\t[PHONE]\n\t\t\t\t\t\t[EMAIL]`;
}