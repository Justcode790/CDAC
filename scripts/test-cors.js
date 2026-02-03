#!/usr/bin/env node
/**
 * SUVIDHA 2026 - CORS Testing Script
 * 
 * This script tests CORS configuration between frontend and backend
 */

const https = require('https');
const http = require('http');

const args = process.argv.slice(2);
const backendUrl = args[0] || 'https://cdac-rosy.vercel.app';
const frontendUrl = args[1] || 'https://your-app.netlify.app';

console.log('🧪 SUVIDHA 2026 - CORS Testing');
console.log('=============================\n');
console.log(`Backend: ${backendUrl}`);
console.log(`Frontend: ${frontendUrl}`);
console.log('');

// Test CORS preflight request
function testCORS(backendUrl, frontendUrl) {
  const url = new URL(`${backendUrl}/api/health`);
  const isHttps = url.protocol === 'https:';
  const client = isHttps ? https : http;
  
  const options = {
    hostname: url.hostname,
    port: url.port || (isHttps ? 443 : 80),
    path: url.pathname,
    method: 'OPTIONS',
    headers: {
      'Origin': frontendUrl,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type,Authorization,X-Client-Environment'
    }
  };

  console.log('🔍 Testing CORS preflight request...');
  
  const req = client.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log('Response Headers:');
    
    const corsHeaders = [
      'access-control-allow-origin',
      'access-control-allow-methods',
      'access-control-allow-headers',
      'access-control-allow-credentials'
    ];
    
    let corsWorking = true;
    
    corsHeaders.forEach(header => {
      const value = res.headers[header];
      if (value) {
        console.log(`  ✅ ${header}: ${value}`);
      } else {
        console.log(`  ❌ ${header}: MISSING`);
        corsWorking = false;
      }
    });
    
    console.log('');
    if (corsWorking && res.statusCode === 200) {
      console.log('🎉 CORS Configuration: WORKING');
      console.log('✅ Your frontend should be able to communicate with the backend');
    } else {
      console.log('❌ CORS Configuration: NOT WORKING');
      console.log('');
      console.log('🔧 To fix:');
      console.log(`1. Run: node scripts/fix-production-cors.js ${frontendUrl}`);
      console.log('2. Set FRONTEND_URL in Vercel environment variables');
      console.log('3. Redeploy backend to Vercel');
    }
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
    console.log('');
    console.log('🔧 Possible issues:');
    console.log('- Backend is not deployed or not accessible');
    console.log('- Network connectivity issues');
    console.log('- Invalid backend URL');
  });

  req.end();
}

// Test actual API request
function testAPIRequest(backendUrl, frontendUrl) {
  const url = new URL(`${backendUrl}/api/health`);
  const isHttps = url.protocol === 'https:';
  const client = isHttps ? https : http;
  
  const options = {
    hostname: url.hostname,
    port: url.port || (isHttps ? 443 : 80),
    path: url.pathname,
    method: 'GET',
    headers: {
      'Origin': frontendUrl,
      'Content-Type': 'application/json'
    }
  };

  console.log('🔍 Testing actual API request...');
  
  const req = client.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`Status: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        try {
          const response = JSON.parse(data);
          console.log('✅ API Response:', response.message || 'Success');
        } catch (error) {
          console.log('✅ API responded successfully');
        }
      } else {
        console.log('❌ API request failed');
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ API request failed:', error.message);
  });

  req.end();
}

if (!frontendUrl.includes('your-app.netlify.app')) {
  testCORS(backendUrl, frontendUrl);
  
  setTimeout(() => {
    console.log('');
    testAPIRequest(backendUrl, frontendUrl);
  }, 1000);
} else {
  console.log('❌ Please provide your actual Netlify URL');
  console.log('');
  console.log('💡 Usage:');
  console.log('  node scripts/test-cors.js https://cdac-rosy.vercel.app https://your-app.netlify.app');
  console.log('');
}