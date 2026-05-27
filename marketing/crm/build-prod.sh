#!/bin/bash
set -ex

echo "==== Current directory ===="
pwd

echo "==== Listing files ===="
ls -la

echo "==== Installing dependencies in root ===="
npm ci

echo "==== Checking frontend dir ===="
ls -la frontend

echo "==== Installing dependencies in frontend ===="
npm --prefix frontend ci

echo "==== Checking vite binary ===="
ls -la frontend/node_modules/.bin/vite

echo "==== Building frontend ===="
./frontend/node_modules/.bin/vite build --outDir dist

echo "==== Build complete ===="
