// Clerk configuration for bar number and MFA enforcement
// This should be configured in Clerk Dashboard:
// 1. Go to User & Authentication > Custom Fields
// 2. Add a field: "bar_number" (required, text)
// 3. Go to User & Authentication > Multi-factor authentication
// 4. Enable MFA and set it as required

export const CLERK_CONFIG = {
  // Custom fields
  customFields: {
    barNumber: {
      name: 'bar_number',
      required: true,
      type: 'text',
      label: 'Bar Number',
      description: 'Your state bar number (required for legal document generation)',
    },
  },
  
  // MFA settings (configure in Clerk Dashboard)
  mfa: {
    required: true,
    methods: ['totp', 'sms'], // TOTP and SMS enabled
  },
  
  // Sign-in/Sign-up configuration
  signIn: {
    redirectUrl: '/dashboard',
  },
  signUp: {
    redirectUrl: '/dashboard',
    requiredFields: ['bar_number'],
  },
};

// Validation function for bar number
export function validateBarNumber(barNumber: string): boolean {
  // Basic validation - adjust based on state requirements
  return /^[A-Z0-9]{4,20}$/i.test(barNumber);
}

