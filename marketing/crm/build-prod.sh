#!/bin/bash
set -e

echo "Installing dependencies in root..."
npm ci

echo "Installing dependencies in frontend..."
npm --prefix frontend ci

echo "Building frontend..."
npx --prefix frontend vite build

echo "Build complete!"
