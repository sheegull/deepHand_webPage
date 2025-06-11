#!/bin/bash

# Cloudflare Pages Deployment Script
# This script handles the deployment of the React frontend with Cloudflare Pages Functions

echo "🚀 Starting Cloudflare Pages deployment..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Check Node.js version
NODE_VERSION=$(node --version)
echo "📋 Current Node.js version: $NODE_VERSION"

SUPPORTED_VERSIONS=("v14.21.3" "v16.20.2" "v18.17.1" "v20.19.0" "v22.16.0")
if [[ ! " ${SUPPORTED_VERSIONS[@]} " =~ " ${NODE_VERSION} " ]]; then
    echo "⚠️  Warning: Node.js version $NODE_VERSION may not be supported by Cloudflare Pages"
    echo "   Supported versions: ${SUPPORTED_VERSIONS[@]}"
fi

# Build the frontend
echo "🔨 Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build completed successfully!"

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ dist directory not found!"
    exit 1
fi

echo "📂 Build output directory: dist"
ls -la dist/

# Deploy to Cloudflare Pages
echo "🚀 Deploying to Cloudflare Pages..."
wrangler pages deploy dist --project-name deephand-webapp

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your site should be available at: https://deephand-webapp.pages.dev"
else
    echo "❌ Deployment failed!"
    exit 1
fi