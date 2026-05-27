#!/bin/sh

echo "Installing root dependencies..."
npm install

cd frontend

echo "Installing frontend dependencies..."
npm install

echo "Building frontend..."
npm run build

echo "Verifying build output..."
test -d dist && echo "SUCCESS: dist directory created" || echo "ERROR: dist directory not found"

ls -la dist/ 2>/dev/null || true
