/**
 * SUVIDHA 2026 - Universal Server Entry
 * Works on: Localhost + Vercel
 */

const app = require('./app.js');
const connectDB = require('./config/database.js');
const { initializeSystem } = require('./bootstrap/superAdminBootstrap.js');
const { config } = require('dotenv');

config();

const PORT = process.env.PORT || 5000;
let initialized = false;

const initSystem = async () => {
  if (initialized) return;

  console.log('🔌 Connecting to MongoDB...');
  await connectDB();
  console.log('✅ MongoDB connected');

  console.log('🏛️  Bootstrapping Government System...');
  const result = await initializeSystem();

  if (!result.success) {
    throw new Error('Super Admin bootstrap failed');
  }

  console.log('👑 Super Admin ready:', result.superAdmin.email);
  initialized = true;
};

/**
 * LOCALHOST MODE
 */
if (process.env.VERCEL !== '1') {
  (async () => {
    try {
      await initSystem();
      app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
      });
    } catch (err) {
      console.error('❌ Startup failed:', err.message);
      process.exit(1);
    }
  })();
}

/**
 * VERCEL MODE (Serverless)
 */
module.exports = async (req, res) => {
  try {
    await initSystem();
    return app(req, res);
  } catch (err) {
    console.error('❌ Vercel init error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server initialization failed'
    });
  }
};
