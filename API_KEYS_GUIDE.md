# API Keys Setup Guide - Free Tier Options

This guide shows you how to get each API key and which services offer free tiers.

## 📋 Quick Summary: Free vs Paid

| Service | Free Tier | Cost After Free Tier |
|---------|-----------|---------------------|
| **Clerk** | ✅ 10,000 MAU/month | $0.025/MAU |
| **Supabase** | ✅ 500MB database, 1GB storage | $25/month (Pro) |
| **Google Gemini** | ✅ 15 requests/minute | Pay-as-you-go |
| **Google Document AI** | ⚠️ Limited free tier | $1.50/1,000 pages |
| **Lemon Squeezy** | ✅ Free (pay fees only) | 3.5% + $0.30 per transaction |
| **Redis** | ✅ Free options available | Varies by provider |

---

## 1. 🔐 Clerk Authentication (FREE TIER ✅)

**Free Tier:** 10,000 Monthly Active Users (MAU)

### Steps:
1. Go to [clerk.com](https://clerk.com)
2. Click **"Sign Up"** (free account)
3. Create a new application
4. Choose **"Next.js"** as framework
5. Get your keys from the dashboard:
   - **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY** (starts with `pk_test_`)
   - **CLERK_SECRET_KEY** (starts with `sk_test_`)

### Configure Bar Number & MFA:
1. Go to **User & Authentication** → **Custom Fields**
2. Click **"Add Field"**
   - Name: `bar_number`
   - Type: Text
   - Required: ✅ Yes
3. Go to **Multi-factor Authentication**
   - Enable MFA
   - Set as **Required**

**Cost:** Free for up to 10,000 users/month

---

## 2. 🗄️ Supabase (FREE TIER ✅)

**Free Tier:** 500MB database, 1GB file storage, 2GB bandwidth

### Steps:
1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** (free)
3. Sign up with GitHub
4. Create a new project
   - Choose a name
   - Set a database password (save this!)
   - Select a region
5. Wait 2-3 minutes for setup
6. Go to **Project Settings** → **API**
7. Copy:
   - **NEXT_PUBLIC_SUPABASE_URL** (your project URL)
   - **NEXT_PUBLIC_SUPABASE_ANON_KEY** (anon/public key)
   - **SUPABASE_SERVICE_ROLE_KEY** (service_role key - keep secret!)

### Run Migration:
1. Go to **SQL Editor** in Supabase dashboard
2. Copy contents from `supabase/migrations/001_initial_schema.sql`
3. Paste and run

**Cost:** Free tier generous for development. $25/month for production (Pro plan)

---

## 3. 🤖 Google Gemini AI (FREE TIER ✅)

**Free Tier:** 15 requests/minute, 1,500 requests/day

### Steps:
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with Google account
3. Click **"Create API Key"**
4. Select or create a Google Cloud project
5. Copy the **GOOGLE_GEMINI_API_KEY**

**Cost:** Free tier is generous. After that, $0.00025 per 1K characters

---

## 4. 📄 Google Document AI (LIMITED FREE ⚠️)

**Free Tier:** First 1,000 pages/month free (may vary)

### Steps:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Enable **Document AI API**:
   - Search "Document AI API"
   - Click **Enable**
4. Create a processor:
   - Go to [Document AI](https://console.cloud.google.com/ai/document-ai)
   - Click **"Create Processor"**
   - Choose **"Form Parser"** or **"OCR Processor"**
   - Select region (e.g., `us`)
   - Copy the **DOCUMENT_AI_PROCESSOR_ID**
5. Get **GOOGLE_CLOUD_PROJECT_ID** from project settings
6. Create service account:
   - Go to **IAM & Admin** → **Service Accounts**
   - Click **Create Service Account**
   - Grant **Document AI User** role
   - Create key (JSON) → Download
   - Set **GOOGLE_APPLICATION_CREDENTIALS** to path of this JSON file

**Cost:** First 1,000 pages/month free, then $1.50 per 1,000 pages

**Alternative:** You can skip Document AI and use regex-based PII redaction (built into the code as fallback)

---

## 5. 💳 Lemon Squeezy (FREE TO SETUP ✅)

**Free:** No monthly fees, only transaction fees

### Steps:
1. Go to [lemonsqueezy.com](https://lemonsqueezy.com)
2. Sign up for free account
3. Create a store
4. Create products:
   - **Monthly Subscription:** $39/month
   - **Red Button (One-time):** $299
5. Get API key:
   - Go to **Settings** → **API**
   - Generate new API key → **LEMON_SQUEEZY_API_KEY**
6. Get **LEMON_SQUEEZY_STORE_ID** from store settings
7. Set up webhook:
   - Go to **Settings** → **Webhooks**
   - Add webhook URL: `https://yourdomain.com/api/payments/webhook`
   - Copy webhook secret → **NEXT_PUBLIC_LEMON_SQUEEZY_WEBHOOK_SECRET**

**Cost:** Free to use. 3.5% + $0.30 per transaction (you pay this)

---

## 6. ⚡ Redis (OPTIONAL - FREE OPTIONS ✅)

**Free Options:**
- **Upstash:** 10,000 commands/day free
- **Redis Cloud:** 30MB free
- **Local:** Free (install locally)

### Option A: Upstash (Recommended - Easiest)
1. Go to [upstash.com](https://upstash.com)
2. Sign up (free)
3. Create Redis database
4. Copy **REDIS_URL** (starts with `redis://`)

### Option B: Local Redis (Free)
1. Install Redis locally
2. Run: `redis-server`
3. Set **REDIS_URL** = `redis://localhost:6379`

**Note:** Rate limiting works without Redis (uses memory fallback). Redis is only needed for production scaling.

**Cost:** Free tiers available from Upstash/Redis Cloud

---

## 7. 🔒 Encryption Keys (GENERATE YOURSELF - FREE ✅)

Generate strong encryption keys:

### Option A: Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this twice to generate:
- **ENCRYPTION_KEY**
- **AUDIT_LOG_ENCRYPTION_KEY**

### Option B: Online Generator
Use [randomkeygen.com](https://randomkeygen.com) - generate 256-bit keys

**Cost:** Free (just random strings)

---

## 📝 Quick Setup Checklist

- [ ] Clerk account + API keys
- [ ] Supabase project + API keys + migration run
- [ ] Google Gemini API key
- [ ] Google Cloud project + Document AI (optional - can skip)
- [ ] Lemon Squeezy store + API key
- [ ] Redis (optional - can skip for dev)
- [ ] Generate encryption keys (2x)

---

## 💰 Estimated Monthly Costs (Free Tier)

**Development/Testing:**
- Clerk: $0 (free tier)
- Supabase: $0 (free tier)
- Gemini: $0 (free tier)
- Document AI: $0 (skip or use free tier)
- Lemon Squeezy: $0 (only pay on transactions)
- Redis: $0 (Upstash free tier)

**Total: $0/month** ✅

**Production (low volume):**
- Clerk: $0-25/month
- Supabase: $25/month
- Gemini: ~$5-10/month
- Document AI: ~$5/month (optional)
- Lemon Squeezy: Transaction fees only
- Redis: $0-10/month

**Total: ~$35-65/month** (excluding transaction fees)

---

## 🚀 Getting Started (Free Setup)

1. **Start with these (all free):**
   - Clerk
   - Supabase
   - Gemini
   - Generate encryption keys

2. **Skip for now (can add later):**
   - Document AI (code has regex fallback)
   - Redis (code has memory fallback)
   - Lemon Squeezy (add when ready to accept payments)

3. **Minimal `.env.local` for testing:**
```env
# Required
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GOOGLE_GEMINI_API_KEY=...
ENCRYPTION_KEY=... (generate)
AUDIT_LOG_ENCRYPTION_KEY=... (generate)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Optional (can leave as placeholders)
GOOGLE_CLOUD_PROJECT_ID=
DOCUMENT_AI_PROCESSOR_ID=
REDIS_URL=
LEMON_SQUEEZY_API_KEY=
```

---

## 🆘 Need Help?

- **Clerk:** [docs.clerk.com](https://clerk.com/docs)
- **Supabase:** [supabase.com/docs](https://supabase.com/docs)
- **Gemini:** [ai.google.dev/docs](https://ai.google.dev/docs)
- **Document AI:** [cloud.google.com/document-ai](https://cloud.google.com/document-ai)

