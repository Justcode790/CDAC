#!/usr/bin/env node

/**
 * SUVIDHA 2026 - Development Setup Script
 * 
 * Quick setup script for local development
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 SUVIDHA 2026 - Development Setup\n');

try {
  // Check if .env exists
  const envPath = path.join(__dirname, '../backend/.env');
  if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file from template...');
    const examplePath = path.join(__dirname, '../backend/.env.example');
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, envPath);
      console.log('✅ .env file created');
      console.log('⚠️  Please update the .env file with your configuration');
    } else {
      console.log('❌ .env.example not found');
    }
  } else {
    console.log('✅ .env file already exists');
  }

  // Install dependencies
  console.log('\n📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Seed database
  console.log('\n🌱 Seeding database with demo data...');
  execSync('npm run seed', { stdio: 'inherit' });

  console.log('\n🎉 Development setup complete!');
  console.log('\n🚀 To start development server:');
  console.log('   npm run dev');
  console.log('\n🌐 Server will be available at:');
  console.log('   http://localhost:5001/api');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}