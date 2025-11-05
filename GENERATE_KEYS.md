# Generate Encryption Keys

Run this command **twice** to generate your encryption keys:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example output:**
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678
```

## Steps:

1. **Generate first key:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the output → paste into `.env.local` as `ENCRYPTION_KEY=`

2. **Generate second key:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the output → paste into `.env.local` as `AUDIT_LOG_ENCRYPTION_KEY=`

## Alternative: Use the script

```bash
node generate-keys.js
```

This will output both keys at once.

## Important:

- **Never commit these keys to git** (`.env.local` is already in `.gitignore`)
- **Use different keys for each environment** (dev, staging, production)
- **Each key must be 64 hexadecimal characters** (32 bytes)
- **Keep these keys secret!**

