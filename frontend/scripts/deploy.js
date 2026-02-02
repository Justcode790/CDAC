#!/usr/bin/env node
/**
 * SUVIDHA 2026 Frontend - Deployment Helper Script
 * 
 * This script helps prepare the frontend for deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 SUVIDHA 2026 Frontend - Deployment Preparation');
console.log('===============================================\n');

// Check if required files exist
const requiredFiles = [
  'netlify.toml',
  'package.json',
  'vite.config.js',
  'public/_redirects',
  'public/manifest.json'
];

console.log('📋 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please ensure all files are present.');
  process.exit(1);
}

console.log('\n🔧 Environment Variables Check...');
console.log('Make sure to set these in Netlify:');
console.log('- VITE_API_BASE_URL=https://your-backend.vercel.app/api');
console.log('- VITE_APP_ENV=production');

console.log('\n📦 Building for production...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

console.log('\n📊 Build Analysis...');
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath, { recursive: true });
  console.log(`📁 Generated ${files.length} files in dist/`);
  
  // Check for critical files
  const criticalFiles = ['index.html', 'assets'];
  criticalFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} generated`);
    } else {
      console.log(`❌ ${file} missing`);
    }
  });
}

console.log('\n📦 Deployment Steps:');
console.log('1. Push code to GitHub');
console.log('2. Connect repository to Netlify');
console.log('3. Set environment variables in Netlify dashboard');
console.log('4. Deploy!');

console.log('\n✅ Frontend deployment preparation complete!');
console.log('Your frontend is ready for Netlify deployment.\n');