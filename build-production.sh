#!/bin/bash
# Production Build Script for PHDCC Papers
# This script ensures a secure production build with no leaked secrets

set -e  # Exit on any error

echo "🔒 Starting secure production build..."

# Stash .env file during build to prevent dev secrets from being baked into static files
if [ -f .env ]; then
  echo "📦 Stashing .env file during build (will restore after)..."
  mv .env .env.backup
  ENV_BACKED_UP=true
fi

# Verify RECAPTCHA_BYPASS is not set
if [ ! -z "$RECAPTCHA_BYPASS" ] || [ ! -z "$NUXT_PUBLIC_RECAPTCHA_BYPASS" ]; then
  echo "❌ ERROR: RECAPTCHA_BYPASS environment variable is set!"
  echo "   This must NOT be set for production builds."
  echo "   Unset it and try again."

  # Restore .env if we backed it up
  if [ "$ENV_BACKED_UP" = true ]; then
    mv .env.backup .env
  fi

  exit 1
fi

# Set Node version
echo "📦 Using Node.js 22.21.0..."
source ~/.nvm/nvm.sh
nvm use 22.21.0

# Set production environment variables
echo "🔧 Setting production environment variables..."
export NUXT_PUBLIC_API="https://ircobi-papers-api-192399026075.europe-west2.run.app"
export NUXT_PUBLIC_RECAPTCHA_SITE_KEY="6LcPQfMrAAAAALQdIBjvVytVvE3m8kCETXg0a86m"
export NUXT_PUBLIC_SITE="https://ircobi-papers-api.web.app"

# Build the application
echo "🏗️  Building application..."
npm run build-azure

# Verify build output exists
if [ ! -d ".output/public" ]; then
  echo "❌ ERROR: Build failed - .output/public directory not found!"

  # Restore .env if we backed it up
  if [ "$ENV_BACKED_UP" = true ]; then
    mv .env.backup .env
  fi

  exit 1
fi

# Restore .env file if we backed it up
if [ "$ENV_BACKED_UP" = true ]; then
  echo "♻️  Restoring .env file..."
  mv .env.backup .env
fi

echo "✅ Production build complete!"
echo "📁 Build output: .output/public"
echo ""
echo "Next steps:"
echo "  1. Review the build output to ensure no secrets are exposed"
echo "  2. Deploy with: npm run deploy:firebase"
