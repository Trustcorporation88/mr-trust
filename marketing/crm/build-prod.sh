#!/bin/sh
set -x

echo "Installing root dependencies..."
npm ci

cd frontend

echo "Installing frontend dependencies..."
npm ci

echo "Building frontend..."
npm run build

echo "Checking build output..."
ls -la dist/ 2>/dev/null || echo "ERROR: dist directory not created"

echo "Build complete!"
