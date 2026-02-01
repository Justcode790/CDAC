const app = require('../app');
const connectDB = require('../config/database');
const { initializeSystem } = require('../bootstrap/superAdminBootstrap');

let isInitialized = false;

module.exports = async (req, res) => {
  try {
    if (!isInitialized) {
      await connectDB();
      await initializeSystem();
      isInitialized = true;
    }

    return app(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};
