#!/usr/bin/env node
/**
 * SUVIDHA 2026 Frontend - Manual Netlify Build Script
 * 
 * This script prepares the frontend for manual Netlify deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.join(__dirname, '..');

console.log('🚀 SUVIDHA 2026 - Manual Netlify Build');
console.log('=====================================\n');

// Step 1: Check if production environment file exists
const prodEnvTemplate = path.join(frontendRoot, '.env.production.manual');
const prodEnvFile = path.join(frontendRoot, '.env.production');

console.log('📋 Step 1: Environment Configuration');
if (!fs.existsSync(prodEnvFile)) {
  if (fs.existsSync(prodEnvTemplate)) {
    console.log('⚠️  .env.production not found');
    console.log('📝 Please create .env.production with your backend URL:');
    console.log('');
    console.log('VITE_API_BASE_URL=https://your-backend.vercel.app/api');
    console.log('VITE_APP_ENV=production');
    console.log('');
    console.log('💡 You can copy from .env.production.manual template');
    process.exit(1);
  } else {
    console.log('❌ Production environment template not found');
    process.exit(1);
  }
} else {
  console.log('✅ .env.production found');
  
  // Validate production environment
  const prodEnvContent = fs.readFileSync(prodEnvFile, 'utf8');
  if (prodEnvContent.includes('your-backend.vercel.app')) {
    console.log('⚠️  Please update VITE_API_BASE_URL in .env.production with your actual backend URL');
    process.exit(1);
  }
}

// Step 2: Clean previous build
console.log('\n🧹 Step 2: Cleaning previous build');
const distPath = path.join(frontendRoot, 'dist');
if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
  console.log('✅ Previous build cleaned');
} else {
  console.log('✅ No previous build to clean');
}

// Step 3: Install dependencies
console.log('\n📦 Step 3: Installing dependencies');
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

// Step 4: Build for production
console.log('\n🏗️  Step 4: Building for production');
try {
  execSync('npm run build', { 
    cwd: frontendRoot, 
    stdio: 'inherit' 
  });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 5: Verify build
console.log('\n🔍 Step 5: Verifying build');
const requiredFiles = ['index.html', '_redirects', 'assets'];
let buildValid = true;

requiredFiles.forEach(file => {
  const filePath = path.join(distPath, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    buildValid = false;
  }
});

if (!buildValid) {
  console.log('\n❌ Build verification failed');
  process.exit(1);
}

// Step 6: Calculate build size
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

// Step 7: Create deployment package info
const deploymentInfo = {
  buildTime: new Date().toISOString(),
  buildSize: `${buildSizeMB} MB`,
  environment: 'production',
  deploymentType: 'manual-netlify',
  files: fs.readdirSync(distPath, { recursive: true }).length
};

fs.writeFileSync(
  path.join(distPath, 'deployment-info.json'), 
  JSON.stringify(deploymentInfo, null, 2)
);

console.log('\n🎉 Build Ready for Manual Netlify Deployment!');
console.log('==============================================');
console.log(`📁 Build location: ${distPath}`);
console.log(`📊 Total files: ${deploymentInfo.files}`);
console.log(`💾 Build size: ${buildSizeMB} MB`);
console.log('');
console.log('📋 Next Steps:');
console.log('1. Go to Netlify Dashboard (https://app.netlify.com)');
console.log('2. Click "Add new site" → "Deploy manually"');
console.log('3. Drag and drop the entire "dist" folder');
console.log('4. Configure custom domain if needed');
console.log('5. Test the deployed application');
console.log('');
console.log('🔗 Dist folder path for drag & drop:');
console.log(`   ${distPath}`);
console.log('');