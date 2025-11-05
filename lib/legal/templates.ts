// Court captions for each state
export const COURT_CAPTIONS = {
  IL: {
    circuit: `IN THE CIRCUIT COURT OF COOK COUNTY, ILLINOIS
COUNTY DEPARTMENT, LAW DIVISION`,
    federal: `UNITED STATES DISTRICT COURT
NORTHERN DISTRICT OF ILLINOIS
EASTERN DIVISION`,
  },
  NY: {
    supreme: `SUPREME COURT OF THE STATE OF NEW YORK
COUNTY OF NEW YORK`,
    federal: `UNITED STATES DISTRICT COURT
SOUTHERN DISTRICT OF NEW YORK`,
  },
  CA: {
    superior: `SUPERIOR COURT OF CALIFORNIA
COUNTY OF LOS ANGELES`,
    federal: `UNITED STATES DISTRICT COURT
CENTRAL DISTRICT OF CALIFORNIA`,
  },
  TX: {
    district: `IN THE DISTRICT COURT OF HARRIS COUNTY, TEXAS
___ JUDICIAL DISTRICT`,
    federal: `UNITED STATES DISTRICT COURT
SOUTHERN DISTRICT OF TEXAS
HOUSTON DIVISION`,
  },
  FL: {
    circuit: `IN THE CIRCUIT COURT OF THE ELEVENTH JUDICIAL CIRCUIT
IN AND FOR MIAMI-DADE COUNTY, FLORIDA`,
    federal: `UNITED STATES DISTRICT COURT
SOUTHERN DISTRICT OF FLORIDA
MIAMI DIVISION`,
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
  const captions = COURT_CAPTIONS[state];
  const caption = courtType === 'federal' 
    ? captions.federal 
    : Object.values(captions)[0];
  
  return `${caption}

${caseInfo.caseNumber ? `Case No. ${caseInfo.caseNumber}` : ''}
${caseInfo.judge ? `Hon. ${caseInfo.judge}` : ''}

${caseInfo.plaintiff.toUpperCase()},
        Plaintiff,

        vs.

${caseInfo.defendant.toUpperCase()},
        Defendant.

────────────────────────────────────────────────────────────────`;
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
  const caption = generateCourtCaption('CA', caseInfo); // Default to CA, will be overridden
  
  return `${caption}

DECLARATION OF MEET AND CONFER

I, [ATTORNEY NAME], declare as follows:

1. I am an attorney licensed to practice law in the State of California and am the attorney of record for [PARTY NAME] in this action.

2. On ${details.date}, I engaged in meet and confer efforts with opposing counsel regarding [ISSUE].

3. The following individuals participated in the meet and confer:
${details.participants.map(p => `   - ${p}`).join('\n')}

4. The following attempts were made to resolve this matter:
${details.attempts.map(a => `   - ${a}`).join('\n')}

5. Despite these efforts, the parties were unable to reach an agreement. ${details.outcome}

I declare under penalty of perjury under the laws of the State of California that the foregoing is true and correct.

Executed on [DATE] at [LOCATION].

[ATTORNEY NAME]
[STATE BAR NUMBER]
[CONTACT INFORMATION]`;
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
  return `REQUEST FOR SANCTIONS

Pursuant to [RULE/STATUTE], Plaintiff respectfully requests that this Court impose sanctions against Defendant in the amount of $${sanctions.fees.toLocaleString()} and ${sanctions.adverseInference ? 'adverse inference instructions' : 'other appropriate relief'}.

GROUNDS FOR SANCTIONS

${sanctions.reason}

LEGAL AUTHORITY

${sanctions.authority.map(a => `- ${a}`).join('\n')}

PRAYER FOR RELIEF

WHEREFORE, Plaintiff respectfully requests that this Court:
1. Order Defendant to pay sanctions in the amount of $${sanctions.fees.toLocaleString()};
${sanctions.adverseInference ? '2. Issue adverse inference instructions to the jury;' : ''}
3. Grant such other and further relief as the Court deems just and proper.`;
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
  return `CERTIFICATE OF SERVICE

I hereby certify that on ${service.date}, I served the following document:
${service.documentName}

by ${service.method.toUpperCase()} on the following:

${service.recipients.map(r => `${r.name}\n${r.address}`).join('\n\n')}

I declare under penalty of perjury under the laws of [STATE] that the foregoing is true and correct.

Executed on ${new Date().toLocaleDateString()} at [LOCATION].

[ATTORNEY NAME]
[STATE BAR NUMBER]`;
}

