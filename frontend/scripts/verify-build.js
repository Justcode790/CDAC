#!/usr/bin/env node
/**
 * SUVIDHA 2026 Frontend - Build Verification Script
 * 
 * This script verifies that the build is ready for deployment
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 SUVIDHA 2026 Frontend - Build Verification');
console.log('===========================================\n');

const distPath = path.join(process.cwd(), 'dist');

// Check if dist folder exists
if (!fs.existsSync(distPath)) {
  console.log('❌ Build folder (dist/) not found');
  console.log('Run "npm run build" first');
  process.exit(1);
}

console.log('✅ Build folder found');

// Check critical files
const criticalFiles = [
  'index.html',
  '_redirects',
  'manifest.json'
];

console.log('\n📋 Checking critical files...');
let allCriticalFilesExist = true;

criticalFiles.forEach(file => {
  const filePath = path.join(distPath, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allCriticalFilesExist = false;
  }
});

// Check assets folder
const assetsPath = path.join(distPath, 'assets');
if (fs.existsSync(assetsPath)) {
  const assetFiles = fs.readdirSync(assetsPath);
  const jsFiles = assetFiles.filter(f => f.endsWith('.js'));
  const cssFiles = assetFiles.filter(f => f.endsWith('.css'));
  
  console.log(`✅ assets/ folder (${jsFiles.length} JS, ${cssFiles.length} CSS files)`);
} else {
  console.log('❌ assets/ folder - MISSING');
  allCriticalFilesExist = false;
}

// Check index.html content
const indexPath = path.join(distPath, 'index.html');
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  if (indexContent.includes('<div id="root">')) {
    console.log('✅ index.html has React root element');
  } else {
    console.log('⚠️  index.html missing React root element');
  }
  
  if (indexContent.includes('assets/')) {
    console.log('✅ index.html references assets');
  } else {
    console.log('⚠️  index.html missing asset references');
  }
}

// Check _redirects content
const redirectsPath = path.join(distPath, '_redirects');
if (fs.existsSync(redirectsPath)) {
  const redirectsContent = fs.readFileSync(redirectsPath, 'utf8');
  
  if (redirectsContent.includes('/*    /index.html   200')) {
    console.log('✅ _redirects configured for SPA');
  } else {
    console.log('⚠️  _redirects may not be configured correctly');
  }
}

// Calculate build size
const calculateSize = (dirPath) => {
  let totalSize = 0;
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(dirPath, file.name);
    if (file.isDirectory()) {
      totalSize += calculateSize(filePath);
    } else {
      totalSize += fs.statSync(filePath).size;
    }
  }
  
  return totalSize;
};

const buildSize = calculateSize(distPath);
const buildSizeMB = (buildSize / (1024 * 1024)).toFixed(2);

console.log(`\n📊 Build size: ${buildSizeMB} MB`);

if (buildSize > 10 * 1024 * 1024) { // 10MB
  console.log('⚠️  Build size is quite large (>10MB)');
} else {
  console.log('✅ Build size is reasonable');
}

// Final summary
console.log('\n📋 Build Verification Summary:');
console.log('==============================');

if (allCriticalFilesExist) {
  console.log('✅ All critical files present');
  console.log('✅ Build is ready for Netlify deployment');
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Set environment variables in Netlify');
  console.log('2. Deploy to Netlify');
  console.log('3. Test production deployment');
  
  process.exit(0);
} else {
  console.log('❌ Some critical files are missing');
  console.log('❌ Build is NOT ready for deployment');
  
  console.log('\n🔧 To fix:');
  console.log('1. Run "npm run build" again');
  console.log('2. Check for build errors');
  console.log('3. Verify all required files are generated');
  
  process.exit(1);
}