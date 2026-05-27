#!/bin/sh

echo "Installing root dependencies..."
npm install

cd frontend

echo "Installing frontend dependencies..."
npm install

echo "Building frontend..."
npm run build

echo "Verifying build output..."
test -d dist && echo "SUCCESS: dist created at $(pwd)/dist" || echo "ERROR: dist not found"

cd ..

echo "Copying dist to root level..."
cp -r frontend/dist . || true

echo "Verifying final output..."
ls -la dist/ 2>/dev/null | head -10
