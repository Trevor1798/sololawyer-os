# Git & GitHub Setup Guide

## ✅ Security Checklist

Before pushing to GitHub, verify these files are **NOT** in your commit:

- [ ] `.env.local` - Contains all your API keys
- [ ] Any files with API keys or secrets
- [ ] `generate-keys.js` or similar key generation scripts

## 📋 Steps to Push to GitHub

### 1. Verify Sensitive Files Are Excluded

```bash
# Check if .env.local is ignored
git check-ignore .env.local
# Should output: .env.local

# Check what will be committed
git status
```

### 2. Create Initial Commit

```bash
cd c:\Users\tsudo\sololawyer-os
git add .
git commit -m "Initial commit: SoloLawyerOS FORTRESS EDITION"
```

### 3. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `sololawyer-os` (or your preferred name)
3. Description: "Secure Legal Document Generation Platform - FORTRESS EDITION"
4. Choose **Private** (recommended for security)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

### 4. Push to GitHub

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/sololawyer-os.git

# Or if using SSH:
# git remote add origin git@github.com:YOUR_USERNAME/sololawyer-os.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🔒 Security Reminders

**NEVER commit:**
- `.env.local`
- `.env.production`
- API keys
- Service account keys
- Encryption keys

**Safe to commit:**
- `.env.example` (has placeholder values)
- All source code
- Configuration files
- Documentation

## 🚨 If You Accidentally Committed Secrets

If you accidentally pushed secrets:

1. **Immediately rotate all API keys:**
   - Generate new Clerk keys
   - Generate new Supabase keys
   - Generate new Gemini key
   - Update encryption keys

2. **Remove from Git history:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env.local" \
     --prune-empty --tag-name-filter cat -- --all
   git push origin --force --all
   ```

3. **Consider the repository compromised** and create new keys

## 📝 Next Steps After Push

1. Add environment variables to your deployment platform (Vercel, etc.)
2. Update README with setup instructions
3. Consider adding a LICENSE file
4. Set up GitHub Actions for CI/CD (optional)

