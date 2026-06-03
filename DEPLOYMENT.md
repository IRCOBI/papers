# Firebase Hosting Deployment Guide

This document describes how to manually deploy the PHDCC Papers frontend to Firebase Hosting on Google Cloud Platform.

## Prerequisites

1. **Node.js 22.21.0** - Required for building the application
2. **Firebase CLI** - Installed as a dev dependency (`firebase-tools`)
3. **GCP Project Access** - You need owner/editor permissions on the GCP project
4. **Firebase Enabled** - Firebase Hosting must be enabled on the GCP project

## One-Time Setup

### 1. Update Firebase Project ID

Edit `.firebaserc` and replace `YOUR_GCP_PROJECT_ID_HERE` with your actual GCP project ID:

```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

**To find your project ID:**
- Look at your API URL: `https://ircobi-papers-api-192399026075.europe-west2.run.app`
- The project ID is likely visible in the GCP Console

### 2. Install Dependencies

```bash
npm install
```

This will install `firebase-tools` as a dev dependency.

### 3. Authenticate with Firebase

```bash
npx firebase login
```

This will open a browser window to authenticate with your Google account that has access to the GCP project.

### 4. Verify Firebase Configuration

```bash
npx firebase projects:list
```

Verify your project appears in the list.

## Manual Deployment Process

### Step 1: Set Environment Variables

**⚠️ SECURITY WARNING:** Never set `RECAPTCHA_BYPASS` during production builds! This is a development-only setting.

Before building, you can set environment variables for the production build. Create a `.env.production` file or set them directly:

```bash
# Example .env.production
API=https://ircobi-papers-api-192399026075.europe-west2.run.app
RECAPTCHA_SITE_KEY=your-production-recaptcha-key
SITE=https://your-domain.web.app

# DO NOT SET RECAPTCHA_BYPASS - This is for development only!
```

### Step 2: Build the Application

```bash
npm run build-azure
```

This runs `nuxt generate` which creates static files in `.output/public`.

**Note:** The build command uses environment variables with the `NUXT_PUBLIC_` prefix. You can override them:

```bash
NUXT_PUBLIC_API=https://ircobi-papers-api-192399026075.europe-west2.run.app npm run build-azure
```

### Step 3: Preview Locally (Optional)

```bash
npx firebase serve --only hosting
```

This serves `.output/public` locally to test before deploying.

### Step 4: Deploy to Firebase Hosting

```bash
npm run deploy:firebase
```

Or directly:

```bash
npx firebase deploy --only hosting
```

### Step 5: Verify Deployment

After deployment completes, you'll see output like:

```
✔  Deploy complete!

Hosting URL: https://your-project-id.web.app
```

Visit the URL to verify the deployment.

## Build Environment Variables

The following environment variables are used during the build (in `nuxt.config.ts`):

- `API` or `NUXT_PUBLIC_API` - API endpoint URL (default: `/api`)
- `NUXT_PUBLIC_RECAPTCHA_SITE_KEY` - reCAPTCHA site key
- `NUXT_PUBLIC_RECAPTCHA_BYPASS` - **DO NOT SET IN PRODUCTION** (dev only)
- `NUXT_PUBLIC_SITE` - Site URL
- `NUXT_PUBLIC_STARTUP_EMAIL` - Startup email (optional)
- `NUXT_PUBLIC_STARTUP_SUBJECT` - Startup subject (optional)
- `NUXT_PUBLIC_STARTUP_FROM` - Startup from (optional)

## Firebase Configuration

### firebase.json

The `firebase.json` file configures:

- **Public directory:** `.output/public` (Nuxt build output)
- **SPA routing:** All routes rewrite to `/200.html` (SPA fallback)
- **CORS headers:** Configured for API access
- **Cache headers:**
  - HTML: 1 hour
  - Images: 1 year (immutable)
  - JS/CSS: 1 year (immutable)

### Security Notes

**CRITICAL - reCAPTCHA Bypass Protection:**
- `RECAPTCHA_BYPASS` is a **development-only** setting that allows bypassing reCAPTCHA verification
- **NEVER** set `RECAPTCHA_BYPASS` or `NUXT_PUBLIC_RECAPTCHA_BYPASS` when building for production
- If set during build, this value gets embedded in the static files and exposed to clients
- An exposed bypass token would allow attackers to bypass authentication protections

**Environment File Protection:**
- All `.env*` files are gitignored - never commit them to version control
- `.env*` files are excluded from Firebase deployment in `firebase.json`
- Use `.env.example` as a template (this file is safe to commit)
- For production secrets, use Firebase Hosting environment configuration if needed

**Build Process Security:**
- Always build production deployments in a clean environment without local `.env` files
- Double-check that no `RECAPTCHA_BYPASS` variable is set before building
- Review build logs to ensure sensitive values aren't being logged

## Custom Domain Setup (Optional)

To use a custom domain with Firebase Hosting:

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow the verification steps
4. Update DNS records as instructed
5. Firebase will provision SSL certificates automatically

## Rollback

To rollback to a previous deployment:

```bash
npx firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL TARGET_SITE_ID:live
```

Or use the Firebase Console to view deployment history and rollback.

## Troubleshooting

### Build fails with "Invalid comparator: latest"
- Ensure you're using Node.js 22+ with npm 10+
- Run: `nvm use 22.21.0`

### Firebase deploy fails with authentication error
- Run: `npx firebase login --reauth`

### SPA routes return 404
- Verify `firebase.json` has the rewrite rule for `**` → `/200.html`

### API calls fail from deployed site
- Check CORS headers in `firebase.json`
- Verify the API endpoint is accessible from the internet
- Check browser console for CORS errors

## Future: Automated Deployment

GitHub Actions workflow can be added later to automate deployment after CircleCI tests pass. This requires:

1. Creating a GitHub Actions workflow
2. Adding Firebase service account credentials to GitHub Secrets
3. Configuring the workflow to wait for CircleCI checks

## Additional Resources

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Nuxt Static Site Generation](https://nuxt.com/docs/getting-started/deployment#static-hosting)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
