#!/bin/bash
set -e

echo "Installing dependencies in root..."
npm ci

echo "Installing dependencies in frontend..."
npm --prefix frontend ci

echo "Building frontend..."
./frontend/node_modules/.bin/vite build --outDir dist

echo "Build complete!"
