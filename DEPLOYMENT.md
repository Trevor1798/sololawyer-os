# Deployment Guide - SoloLawyerOS FORTRESS EDITION

## Pre-Deployment Checklist

### 1. Clerk Setup
- [ ] Create Clerk account and application
- [ ] Add custom field: `bar_number` (required, text)
- [ ] Enable MFA and set as required
- [ ] Configure redirect URLs
- [ ] Get publishable key and secret key

### 2. Supabase Setup
- [ ] Create Supabase project
- [ ] Run migration SQL from `supabase/migrations/001_initial_schema.sql`
- [ ] Create storage bucket: `documents` (private)
- [ ] Get project URL and anon key
- [ ] Get service role key (keep secret!)

### 3. Google Cloud Setup
- [ ] Create GCP project
- [ ] Enable Document AI API
- [ ] Create Document AI processor
- [ ] Enable Gemini API
- [ ] Create service account and download key
- [ ] Get API keys

### 4. Lemon Squeezy Setup
- [ ] Create Lemon Squeezy account
- [ ] Create store
- [ ] Create products ($39/month, $299 one-time)
- [ ] Get API key and webhook secret
- [ ] Configure webhook URL: `https://yourdomain.com/api/payments/webhook`

### 5. Redis Setup (Optional but Recommended)
- [ ] Create Redis instance (Upstash, Redis Cloud, etc.)
- [ ] Get connection URL

### 6. Environment Variables
Copy `.env.example` to `.env.local` and fill in all values:

```bash
# All required variables from .env.example
```

## Vercel Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Add all environment variables
   - Deploy

3. **Post-Deployment**
   - Update Clerk redirect URLs to production domain
   - Update Lemon Squeezy webhook URL
   - Test authentication flow
   - Test document generation
   - Monitor audit logs

## Security Checklist

- [ ] All environment variables set
- [ ] Encryption keys are strong and unique
- [ ] RLS policies active in Supabase
- [ ] Storage bucket is private
- [ ] MFA enforced in Clerk
- [ ] Bar number required in Clerk
- [ ] Webhook signatures verified
- [ ] Rate limiting active
- [ ] Audit logging working

## Monitoring

- Check audit logs regularly
- Monitor rate limit violations
- Review Supabase RLS logs
- Check file expiry and cleanup
- Monitor payment webhooks

## Support

For issues or questions, check:
- README.md for setup instructions
- Supabase logs for RLS issues
- Vercel logs for API errors
- Clerk dashboard for auth issues

