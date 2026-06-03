# PHDCC Papers Frontend - Deployment Guide

This guide explains how to deploy the PHDCC Papers frontend to Firebase Hosting on Google Cloud Platform.

## Architecture Overview

```
Frontend (This Repo)                     Backend API
┌─────────────────────────┐             ┌──────────────────────────┐
│ Firebase Hosting (GCP)  │   API       │ Cloud Run (GCP)          │
│ Static Nuxt SPA         │─ Calls ────▶│ Node.js API              │
│ ircobi-papers-api.web   │             │ ircobi-papers-api        │
│   .app                  │             │   -192399026075...       │
└─────────────────────────┘             └──────────────────────────┘
         │
         └─ Project: ircobi-papers-api
            Region: europe-west2
```

## Prerequisites

- **Node.js 22.21.0** (use `nvm use 22.21.0`)
- **Firebase CLI** (included as dev dependency)
- **GCP Project Access** (Owner/Editor on `ircobi-papers-api`)
- **Firebase authenticated** (run `npx firebase login`)

## Production Deployment

### Quick Deploy

```bash
# 1. Build with production configuration
./build-production.sh

# 2. Deploy to Firebase Hosting
npm run deploy:firebase
```

### What the Build Script Does

The `build-production.sh` script:
1. ✅ Stashes your `.env` file (to prevent dev secrets from being baked into static files)
2. ✅ Sets production environment variables
3. ✅ Runs `nuxt generate` to create static files
4. ✅ Restores your `.env` file for local development

### Build Configuration

Production builds use these environment variables (set in `build-production.sh`):

```bash
NUXT_PUBLIC_API=https://ircobi-papers-api-192399026075.europe-west2.run.app
NUXT_PUBLIC_RECAPTCHA_SITE_KEY=6LcPQfMrAAAAALQdIBjvVytVvE3m8kCETXg0a86m
NUXT_PUBLIC_SITE=https://ircobi-papers-api.web.app
```

**🔒 Security Note:** `RECAPTCHA_BYPASS` is NEVER set in production builds.

## Development Setup

### Local Development

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit .env and set:
PORT=9898
API=https://ircobi-papers-api-192399026075.europe-west2.run.app
RECAPTCHA_BYPASS=<your-dev-bypass-token>

# 3. Start dev server
npm run dev
```

The dev server will run on `http://localhost:9898` (or your configured PORT).

### Environment Files

- `.env` - Local development (gitignored, contains RECAPTCHA_BYPASS)
- `.env.example` - Template (safe to commit)
- `.env.backup` - Temporary stash during production builds

**All `.env*` files are gitignored** to protect secrets.

## Firebase Configuration

### Project Configuration

- **GCP Project ID:** `ircobi-papers-api`
- **Firebase Hosting Site:** `ircobi-papers-api`
- **Live URL:** https://ircobi-papers-api.web.app
- **Region:** europe-west2

### Firebase Files

**firebase.json** - Hosting configuration:
- Public directory: `.output/public`
- SPA routing: All routes rewrite to `/200.html`
- CORS headers configured
- Cache headers optimized

**.firebaserc** - Project mapping:
```json
{
  "projects": {
    "default": "ircobi-papers-api"
  }
}
```

## reCAPTCHA Configuration

### Site Key (Public)
- Used in frontend JavaScript
- Value: `6LcPQfMrAAAAALQdIBjvVytVvE3m8kCETXg0a86m`
- Safe to expose (embedded in static files)

### Secret Key (Private)
- Used in backend API to verify tokens
- Stored in GCP Secret Manager: `RECAPTCHA_SECRET_KEY`
- Never exposed to frontend

### Allowed Domains
- `ircobi-papers-api.web.app`
- `ircobi-papers-api.firebaseapp.com`
- `localhost` (for development)

## Security Best Practices

### What's Protected
✅ `RECAPTCHA_BYPASS` - Development-only token (never in production builds)
✅ `.env` files - Gitignored and excluded from Firebase deployment
✅ API Secret Key - Stored in GCP Secret Manager

### What's Public
✅ `RECAPTCHA_SITE_KEY` - Intentionally exposed (client-side key)
✅ API endpoint URL - Public Cloud Run service
✅ Firebase Hosting URL - Public website

### Build Script Protection

The `build-production.sh` script ensures:
- No `.env` file is loaded during production builds
- `RECAPTCHA_BYPASS` cannot be set in environment
- Only production variables are baked into static files
- Dev `.env` is automatically restored after build

## Deployment Workflow

### Typical Deployment

```bash
# 1. Pull latest code
git pull origin new-hosting

# 2. Install dependencies (if needed)
npm install

# 3. Build and deploy
./build-production.sh
npm run deploy:firebase
```

### Build Output

After `build-production.sh` runs:
- **Output:** `.output/public` (79 static files)
- **Size:** ~700KB total (gzipped)
- **Routes:** 12 pre-rendered pages

### Deployment Output

After `npm run deploy:firebase`:
```
✔ Deploy complete!
Hosting URL: https://ircobi-papers-api.web.app
```

Deployment typically takes 30-60 seconds.

## Troubleshooting

### Build fails with "Invalid comparator: latest"
**Solution:** Use Node.js 22+
```bash
nvm use 22.21.0
npm install
```

### Firebase deploy fails with "authentication error"
**Solution:** Re-authenticate
```bash
npx firebase login
```

### "Captcha not set" error on live site
**Problem:** Build didn't include reCAPTCHA site key
**Solution:** Verify `build-production.sh` sets `NUXT_PUBLIC_RECAPTCHA_SITE_KEY`

### "Failed captcha verification" error
**Problem:** API backend secret key is incorrect
**Solution:** Update secret in Cloud Run (see API deployment guide)

### SPA routes return 404
**Problem:** Firebase rewrites not configured
**Solution:** Verify `firebase.json` has `** -> /200.html` rewrite

### API calls fail with CORS errors
**Problem:** API doesn't allow Firebase domain
**Solution:** Update API CORS configuration to include `ircobi-papers-api.web.app`

## Monitoring & Logs

### Firebase Hosting Logs
- Console: https://console.firebase.google.com/project/ircobi-papers-api/hosting
- View deployment history
- Rollback to previous versions

### Cloud Run API Logs
- Console: https://console.cloud.google.com/run/detail/europe-west2/ircobi-papers-api/logs
- View API errors and requests
- Monitor performance

## Custom Domain (Optional)

To use a custom domain (e.g., `papers.ircobi.com`):

1. **Firebase Console:**
   - Go to Hosting → Add custom domain
   - Enter your domain name

2. **Verify Ownership:**
   - Add TXT record to DNS (provided by Firebase)

3. **Configure DNS:**
   - Add A records (provided by Firebase)

4. **SSL Certificates:**
   - Automatically provisioned by Firebase (free)

5. **Update Build Script:**
   - Change `NUXT_PUBLIC_SITE` to your custom domain

## Rolling Back

### Rollback to Previous Version

1. **Firebase Console:**
   - Go to Hosting → Releases
   - Find previous working version
   - Click "Rollback"

2. **Or via CLI:**
   ```bash
   npx firebase hosting:clone SOURCE:VERSION TARGET:live
   ```

## CI/CD (Future)

Currently using manual deployment. Future GitHub Actions integration planned after CircleCI migration.

## Related Documentation

- **API Deployment:** See `../phdcc-papers-api/DEPLOYMENT-GUIDE.md`
- **Architecture:** See `CLAUDE-architecture.md`
- **Code Style:** See `CLAUDE.md`

## Support

- **Firebase Issues:** https://console.firebase.google.com/project/ircobi-papers-api/support
- **GCP Support:** https://console.cloud.google.com/support
- **Build Scripts:** Contact repository maintainers
