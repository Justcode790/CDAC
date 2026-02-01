#!/usr/bin/env node

/**
 * SUVIDHA 2026 - Production Readiness Check
 * 
 * Validates that the application is ready for production deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 SUVIDHA 2026 - Production Readiness Check\n');

const checks = [];

// Check 1: Required files exist
const requiredFiles = [
  'vercel.json',
  'backend/index.js',
  'backend/app.js',
  'backend/.env.production.example',
  'DEPLOYMENT.md'
];

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, '..', file));
  checks.push({ name: `File: ${file}`, status: exists });
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

// Check 2: Package.json configuration
console.log('\n📦 Checking package.json...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));

const packageChecks = [
  { name: 'Main entry point', check: packageJson.main === 'backend/index.js' },
  { name: 'Start script', check: packageJson.scripts.start === 'node backend/index.js' },
  { name: 'Node.js version', check: !!packageJson.engines?.node },
  { name: 'Vercel build script', check: !!packageJson.scripts['vercel-build'] }
];

packageChecks.forEach(check => {
  checks.push({ name: check.name, status: check.check });
  console.log(`   ${check.check ? '✅' : '❌'} ${check.name}`);
});

// Check 3: Vercel configuration
console.log('\n⚡ Checking Vercel configuration...');
try {
  const vercelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../vercel.json'), 'utf8'));
  const vercelChecks = [
    { name: 'Entry point', check: vercelConfig.builds?.[0]?.src === 'backend/index.js' },
    { name: 'API routes', check: vercelConfig.routes?.[0]?.src === '/api/(.*)' },
    { name: 'Node environment', check: vercelConfig.env?.NODE_ENV === 'production' }
  ];

  vercelChecks.forEach(check => {
    checks.push({ name: `Vercel: ${check.name}`, status: check.check });
    console.log(`   ${check.check ? '✅' : '❌'} ${check.name}`);
  });
} catch (error) {
  checks.push({ name: 'Vercel config', status: false });
  console.log('   ❌ vercel.json parsing failed');
}

// Check 4: Environment template
console.log('\n🔐 Checking environment configuration...');
const envTemplate = fs.existsSync(path.join(__dirname, '../backend/.env.production.example'));
checks.push({ name: 'Production env template', status: envTemplate });
console.log(`   ${envTemplate ? '✅' : '❌'} Production environment template`);

// Summary
console.log('\n📊 Production Readiness Summary:');
const passed = checks.filter(c => c.status).length;
const total = checks.length;
console.log(`   ${passed}/${total} checks passed`);

if (passed === total) {
  console.log('\n🎉 ✅ PRODUCTION READY!');
  console.log('\n🚀 Deployment Instructions:');
  console.log('   1. Push to GitHub: git push origin main');
  console.log('   2. Connect to Vercel: Import GitHub repository');
  console.log('   3. Set environment variables in Vercel dashboard');
  console.log('   4. Deploy and test!');
  console.log('\n📖 See DEPLOYMENT.md for detailed instructions');
} else {
  console.log('\n⚠️  NOT READY FOR PRODUCTION');
  console.log('\nFailed checks:');
  checks.filter(c => !c.status).forEach(check => {
    console.log(`   ❌ ${check.name}`);
  });
}

console.log('\n📋 Environment Variables Needed for Vercel:');
console.log('   NODE_ENV=production');
console.log('   MONGODB_URI=<your-production-database-url>');
console.log('   JWT_SECRET=<your-secure-jwt-secret>');
console.log('   ADMIN_EMAIL=<your-admin-email>');
console.log('   ADMIN_PASSWORD=<your-admin-password>');
console.log('   FRONTEND_URL=<your-netlify-url>');
console.log('\n📖 See backend/.env.production.example for complete list');
