#!/usr/bin/env node
/**
 * SUVIDHA 2026 Frontend - Environment Switching Script
 * 
 * This script helps switch between different environment configurations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.join(__dirname, '..');

const environments = {
  local: {
    file: '.env.local',
    description: 'Local development (localhost:5000)',
    content: `# Local Development Environment
# This file is for local development only
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_ENV=development`
  },
  remote: {
    file: '.env',
    description: 'Remote development/testing',
    content: `# Frontend Configuration
# This file is used for remote development/testing
VITE_API_BASE_URL=http://13.60.195.81:5000/api
VITE_APP_ENV=development`
  },
  production: {
    file: '.env.production',
    description: 'Production deployment',
    template: '.env.production.manual'
  }
};

const args = process.argv.slice(2);
const command = args[0];
const envType = args[1];

console.log('🔧 SUVIDHA 2026 - Environment Switcher');
console.log('=====================================\n');

if (command === 'list' || !command) {
  console.log('📋 Available environments:');
  Object.entries(environments).forEach(([key, env]) => {
    const filePath = path.join(frontendRoot, env.file);
    const exists = fs.existsSync(filePath);
    console.log(`  ${key.padEnd(12)} - ${env.description} ${exists ? '✅' : '❌'}`);
  });
  
  console.log('\n💡 Usage:');
  console.log('  npm run env:switch <environment>');
  console.log('  npm run env:list');
  console.log('\n📝 Examples:');
  console.log('  npm run env:switch local      # Switch to localhost development');
  console.log('  npm run env:switch remote     # Switch to remote development');
  console.log('  npm run env:switch production # Create production environment');
  
  process.exit(0);
}

if (command === 'switch') {
  if (!envType || !environments[envType]) {
    console.log('❌ Invalid environment type');
    console.log('Available: local, remote, production');
    process.exit(1);
  }
  
  const env = environments[envType];
  const targetFile = path.join(frontendRoot, env.file);
  
  if (envType === 'production') {
    // Handle production environment creation
    const templateFile = path.join(frontendRoot, env.template);
    
    if (!fs.existsSync(templateFile)) {
      console.log('❌ Production template not found');
      process.exit(1);
    }
    
    if (fs.existsSync(targetFile)) {
      console.log('⚠️  .env.production already exists');
      console.log('📝 Please update it manually with your backend URL');
    } else {
      fs.copyFileSync(templateFile, targetFile);
      console.log('✅ Created .env.production from template');
      console.log('📝 Please update VITE_API_BASE_URL with your backend URL');
    }
  } else {
    // Handle local/remote environment switching
    fs.writeFileSync(targetFile, env.content);
    console.log(`✅ Switched to ${envType} environment`);
    console.log(`📁 Updated: ${env.file}`);
    console.log(`🔗 API URL: ${env.content.match(/VITE_API_BASE_URL=(.+)/)[1]}`);
  }
  
  console.log('\n🔄 Restart your development server to apply changes');
  
} else {
  console.log('❌ Unknown command:', command);
  console.log('Available commands: list, switch');
  process.exit(1);
}