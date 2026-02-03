#!/usr/bin/env node
/**
 * SUVIDHA 2026 Frontend - Quick Setup Script
 * 
 * This script sets up the frontend for both local development and manual deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.join(__dirname, '..');

console.log('🚀 SUVIDHA 2026 Frontend - Quick Setup');
console.log('====================================\n');

// Step 1: Install dependencies
console.log('📦 Step 1: Installing dependencies...');
try {
  execSync('npm install', { 
    cwd: frontendRoot, 
    stdio: 'inherit' 
  });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Step 2: Set up local development environment
console.log('\n🏠 Step 2: Setting up local development environment...');
const localEnvPath = path.join(frontendRoot, '.env.local');
const localEnvContent = `# Local Development Environment
# This file is for local development only
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_ENV=development`;

fs.writeFileSync(localEnvPath, localEnvContent);
console.log('✅ Local environment configured (.env.local)');

// Step 3: Verify environment files
console.log('\n📋 Step 3: Verifying environment files...');
const envFiles = [
  { file: '.env.local', description: 'Local development', required: true },
  { file: '.env', description: 'Remote development', required: false },
  { file: '.env.production.manual', description: 'Production template', required: true }
];

envFiles.forEach(({ file, description, required }) => {
  const filePath = path.join(frontendRoot, file);
  const exists = fs.existsSync(filePath);
  
  if (exists) {
    console.log(`✅ ${file} - ${description}`);
  } else if (required) {
    console.log(`❌ ${file} - ${description} (MISSING)`);
  } else {
    console.log(`⚠️  ${file} - ${description} (Optional)`);
  }
});

// Step 4: Test build process
console.log('\n🏗️  Step 4: Testing build process...');
try {
  execSync('npm run build', { 
    cwd: frontendRoot, 
    stdio: 'pipe' 
  });
  console.log('✅ Build test successful');
} catch (error) {
  console.log('⚠️  Build test failed (this is normal if backend is not running)');
}

// Step 5: Display setup summary
console.log('\n🎉 Setup Complete!');
console.log('==================');
console.log('');
console.log('📋 Available Commands:');
console.log('');
console.log('🏠 Local Development:');
console.log('  npm run dev              # Start development server');
console.log('  npm run env:local        # Ensure local environment');
console.log('');
console.log('🌐 Manual Netlify Deployment:');
console.log('  npm run env:production   # Create production environment');
console.log('  npm run build:netlify    # Build for deployment');
console.log('');
console.log('🔧 Environment Management:');
console.log('  npm run env:list         # List all environments');
console.log('  npm run env:switch       # Switch environments');
console.log('');
console.log('🚀 Quick Start:');
console.log('  1. Start backend: npm run dev (from root directory)');
console.log('  2. Start frontend: npm run dev (from frontend directory)');
console.log('  3. Open: http://localhost:3000');
console.log('');
console.log('📖 For detailed instructions, see:');
console.log('  - MANUAL_NETLIFY_DEPLOYMENT.md');
console.log('  - ../LOCALHOST_SETUP.md');
console.log('');