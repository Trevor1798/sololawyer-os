# SoloLawyerOS FORTRESS EDITION

**Secure Legal Document Generation Platform - Zero Trust Architecture**

## 🛡️ Security Features

- **Clerk Authentication**: Bar number + MFA enforced
- **Supabase RLS**: Every row/table/policy checks `auth.uid()`
- **Secure Storage**: Signed URLs (60s expiry) + auto-delete unpinned files after 24h
- **PII Redaction**: Document AI → redact SSN/DOB/plates → THEN Gemini
- **Prompt Injection Guard**: System prompt shielding
- **Rate Limiting**: 20 motions/hr/user → 429 + audit log
- **Audit Logging**: Encrypted logs (user_id | action | ip | hash | timestamp)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in all required values:

```bash
cp .env.example .env.local
```

### 3. Set Up Supabase RLS (3 Steps)

#### Step 1: Create Tables

Run these SQL commands in your Supabase SQL editor:

```sql
-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE motions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  bar_number TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  state TEXT,
  document_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Create motions table
CREATE TABLE IF NOT EXISTS motions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  motion_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  ip_address TEXT,
  request_hash TEXT,
  encrypted_data TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create function to get user_id from Clerk
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID AS $$
  SELECT id FROM users WHERE clerk_user_id = current_setting('app.current_user_id', true);
$$ LANGUAGE sql STABLE;
```

#### Step 2: Create RLS Policies

```sql
-- Users policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Documents policies
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);

-- Files policies
CREATE POLICY "Users can view own files"
  ON files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload own files"
  ON files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own files"
  ON files FOR DELETE
  USING (auth.uid() = user_id);

-- Motions policies
CREATE POLICY "Users can view own motions"
  ON motions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own motions"
  ON motions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Audit logs policies (read-only for users)
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id);
```

#### Step 3: Set Clerk User ID in Supabase Context

This is handled automatically by the middleware. Make sure your Clerk webhook is configured to sync user data.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
sololawyer-os/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── dashboard/
│   ├── api/
│   │   ├── documents/
│   │   ├── motions/
│   │   ├── files/
│   │   ├── pii-redact/
│   │   └── audit/
│   └── layout.tsx
├── lib/
│   ├── clerk/
│   ├── supabase/
│   ├── security/
│   │   ├── pii-redaction.ts
│   │   ├── prompt-guard.ts
│   │   ├── rate-limit.ts
│   │   └── audit.ts
│   ├── legal/
│   │   ├── templates/
│   │   └── generators.ts
│   └── storage/
├── components/
│   ├── ui/
│   └── legal/
└── middleware.ts
```

## 🔒 Security Architecture

### Authentication Flow
1. User signs in with Clerk (email/password)
2. Bar number verification required
3. MFA enforced
4. Clerk user ID synced to Supabase
5. All queries use `auth.uid()` for RLS

### PII Redaction Pipeline
1. Document uploaded → Document AI processes
2. SSN, DOB, license plates detected
3. Redaction applied
4. Redacted document sent to Gemini
5. Original stored encrypted, redacted version for processing

### Rate Limiting
- 20 motions per hour per user
- Redis-based tracking
- 429 response on limit
- All attempts logged to audit table

### Audit Logging
- Every action encrypted
- Hash of request for integrity
- IP address tracking
- Immutable log table

## 📄 Legal Document Templates

Supported states: IL, NY, CA, TX, FL

Document types:
- Motion templates with exact court captions
- Meet-and-confer declarations
- Sanctions blocks (fees + adverse inference)
- Certificate of service
- Export as .docx with track-changes

## 💳 Payment Integration

- Lemon Squeezy integration
- $39/month subscription
- $299 one-time "red button" option

## 🚢 Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/sololawyer-os)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

## 📝 License

Proprietary - All Rights Reserved

## ⚠️ Security Notice

This is the FORTRESS EDITION. Every security measure is designed to prevent data leaks. Make it impossible to leak a single selfie.
