#!/bin/bash
set -ex

echo "==== Current directory ===="
pwd

echo "==== Installing dependencies in root ===="
npm ci

echo "==== Changing to frontend dir ===="
cd frontend

echo "==== Checking package.json ===="
cat package.json | head -20

echo "==== Installing dependencies in frontend ===="
npm ci

echo "==== Checking vite binary ===="
ls -la node_modules/.bin/vite

echo "==== Building frontend ===="
npm run build

echo "==== Build complete ===="
