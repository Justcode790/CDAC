#!/usr/bin/env node

/**
 * SUVIDHA 2026 - Development Startup Script
 * 
 * Starts both backend (port 5000) and frontend (port 3000) for local development
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 SUVIDHA 2026 - Starting Development Environment');
console.log('================================================');
console.log('Backend: http://localhost:5000/api');
console.log('Frontend: http://localhost:3000');
console.log('================================================\n');

// Start backend server
console.log('🔧 Starting Backend Server (Port 5000)...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  shell: true
});

// Wait a moment for backend to start
setTimeout(() => {
  console.log('\n🎨 Starting Frontend Server (Port 3000)...');
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, '..', 'frontend'),
    stdio: 'inherit',
    shell: true
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development servers...');
    backend.kill('SIGINT');
    frontend.kill('SIGINT');
    process.exit(0);
  });

  frontend.on('close', (code) => {
    console.log(`Frontend server exited with code ${code}`);
    backend.kill('SIGINT');
    process.exit(code);
  });

}, 3000);

backend.on('close', (code) => {
  console.log(`Backend server exited with code ${code}`);
  process.exit(code);
});