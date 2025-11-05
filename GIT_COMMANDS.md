# Git Commands to Run

Copy and paste these commands into PowerShell or Command Prompt:

## Step 1: Navigate to Project
```powershell
cd c:\Users\tsudo\sololawyer-os
```

## Step 2: Initialize Git (if not already done)
```powershell
git init
```

## Step 3: Check Status (Verify .env.local is NOT listed)
```powershell
git status
```

You should see `.env.local` is **NOT** in the list of files to be committed.

## Step 4: Add All Files
```powershell
git add .
```

## Step 5: Create Initial Commit
```powershell
git commit -m "Initial commit: SoloLawyerOS FORTRESS EDITION"
```

## Step 6: Verify .env.local is Excluded
```powershell
git check-ignore .env.local
```

This should output: `.env.local` (confirming it's ignored)

## Step 7: Check What Files Are Committed
```powershell
git ls-files | findstr /i "env"
```

This should show `.env.example` but **NOT** `.env.local`

## Step 8: Create GitHub Repository & Push

1. Go to https://github.com/new
2. Create a new repository (name it `sololawyer-os`)
3. **Set it to Private** (important for security)
4. **DO NOT** initialize with README
5. Copy the commands GitHub shows you, or use:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/sololawyer-os.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## ✅ Security Checklist

Before pushing, verify:
- [ ] `.env.local` is NOT in `git ls-files`
- [ ] Only `.env.example` is in the commit
- [ ] Repository is set to **Private** on GitHub
- [ ] All API keys are in `.env.local` (which is excluded)

## 🚨 If You See .env.local in git status

If `.env.local` appears in `git status`, run:
```powershell
git rm --cached .env.local
git commit -m "Remove .env.local from tracking"
```

This removes it from Git tracking while keeping your local file.

