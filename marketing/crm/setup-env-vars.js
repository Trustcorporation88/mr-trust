#!/usr/bin/env node

const fs = require('fs');
const https = require('https');

const PROJECT_ID = 'prj_OOlYIglT4cUy9ngKEydAoCqC3FO1';
const TEAM_ID = 'team_A8uatAO8BKF7uUf9SsU6xC6R';

// Get token from environment
const TOKEN = process.env.VERCEL_TOKEN;

if (!TOKEN) {
  console.error('❌ VERCEL_TOKEN not set in environment');
  process.exit(1);
}

const envVars = [
  { key: 'JWT_SECRET', value: 'your-super-secret-jwt-key-2026-flavio-crm-production', sensitive: true },
  { key: 'JWT_EXPIRE', value: '7d', sensitive: false },
  { key: 'NODE_ENV', value: 'production', sensitive: false }
];

async function addEnvVar(varData) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      key: varData.key,
      value: varData.value,
      target: ['production']
    });

    const options = {
      hostname: 'api.vercel.com',
      path: `/v8/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log(`✅ Added ${varData.key}`);
          resolve();
        } else {
          console.error(`❌ Failed to add ${varData.key}: ${res.statusCode}`);
          console.error(data);
          reject(new Error(`Status ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

(async () => {
  try {
    console.log('📝 Adding environment variables to Vercel...\n');
    for (const envVar of envVars) {
      await addEnvVar(envVar);
    }
    console.log('\n✨ All environment variables added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
