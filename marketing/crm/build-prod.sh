#!/bin/sh
set -x

echo "==== Current directory ===="
pwd

echo "==== Installing dependencies in root ===="
npm ci

echo "==== Changing to frontend dir ===="
cd frontend

echo "==== Installing dependencies in frontend ===="
npm ci

echo "==== Building frontend ===="
npm run build

echo "==== Build complete ===="
