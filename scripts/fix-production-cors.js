#!/usr/bin/env node
/**
 * SUVIDHA 2026 - Production CORS Fix Script
 * 
 * This script helps configure CORS for production deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 SUVIDHA 2026 - Production CORS Fix');
console.log('===================================\n');

const args = process.argv.slice(2);
const netlifyUrl = args[0];

if (!netlifyUrl) {
  console.log('❌ Please provide your Netlify URL');
  console.log('');
  console.log('💡 Usage:');
  console.log('  node scripts/fix-production-cors.js https://your-app.netlify.app');
  console.log('');
  console.log('📝 Example:');
  console.log('  node scripts/fix-production-cors.js https://cdac-frontend.netlify.app');
  console.log('');
  process.exit(1);
}

// Validate URL format
try {
  new URL(netlifyUrl);
} catch (error) {
  console.log('❌ Invalid URL format');
  console.log('Please provide a valid HTTPS URL like: https://your-app.netlify.app');
  process.exit(1);
}

console.log(`🌐 Configuring CORS for: ${netlifyUrl}`);

// Update backend app.js CORS configuration
const appJsPath = path.join(__dirname, '..', 'backend', 'app.js');
let appJsContent = fs.readFileSync(appJsPath, 'utf8');

// Replace the placeholder URLs with the actual Netlify URL
const corsOriginRegex = /(\/\/ Add your Netlify domains here[\s\S]*?)'https:\/\/your-app\.netlify\.app',[\s\S]*?'https:\/\/cdac-frontend\.netlify\.app',/;

const newCorsOrigins = `// Add your Netlify domains here
        '${netlifyUrl}',`;

if (corsOriginRegex.test(appJsContent)) {
  appJsContent = appJsContent.replace(corsOriginRegex, `$1${newCorsOrigins}`);
} else {
  // If the pattern doesn't match, add it manually
  const productionOriginsRegex = /(process\.env\.FRONTEND_URL_WWW,[\s\S]*?)(\/\/ Add any custom domains)/;
  if (productionOriginsRegex.test(appJsContent)) {
    appJsContent = appJsContent.replace(
      productionOriginsRegex, 
      `$1        // Your Netlify URL
        '${netlifyUrl}',
        $2`
    );
  }
}

// Also update the preflight handler
const preflightRegex = /(\/\/ Handle preflight requests explicitly[\s\S]*?)'https:\/\/your-app\.netlify\.app',[\s\S]*?'https:\/\/cdac-frontend\.netlify\.app',/;
if (preflightRegex.test(appJsContent)) {
  appJsContent = appJsContent.replace(preflightRegex, `$1'${netlifyUrl}',`);
}

fs.writeFileSync(appJsPath, appJsContent);
console.log('✅ Updated backend/app.js CORS configuration');

// Create Vercel environment variables guide
const vercelEnvGuide = `
# Vercel Environment Variables Configuration
# Set these in Vercel Dashboard → Project → Settings → Environment Variables

NODE_ENV=production
FRONTEND_URL=${netlifyUrl}
FRONTEND_URL_WWW=${netlifyUrl}
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-super-secure-production-jwt-secret
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecurePassword123!
`;

fs.writeFileSync(path.join(__dirname, '..', 'VERCEL_ENV_VARS.txt'), vercelEnvGuide.trim());
console.log('✅ Created VERCEL_ENV_VARS.txt with required environment variables');

console.log('');
console.log('🎯 Next Steps:');
console.log('1. Set environment variables in Vercel Dashboard:');
console.log(`   FRONTEND_URL=${netlifyUrl}`);
console.log(`   FRONTEND_URL_WWW=${netlifyUrl}`);
console.log('   NODE_ENV=production');
console.log('   (plus other variables from VERCEL_ENV_VARS.txt)');
console.log('');
console.log('2. Redeploy your backend to Vercel');
console.log('3. Test the CORS fix');
console.log('');
console.log('🔗 Vercel Dashboard: https://vercel.com/dashboard');
console.log('');