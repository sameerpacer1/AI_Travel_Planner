import { app } from './app.js';
import { env } from './config/env.js';
import { checkDbConnection } from './lib/prisma.js';

const PORT = env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`===============================================`);
  console.log(`🚀 TripWise Backend running on port ${PORT}`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${env.FRONTEND_URL}`);
  
  // Database check
  const dbHealth = await checkDbConnection();
  if (dbHealth.connected) {
    console.log(`✅ Database: Connected to PostgreSQL/Neon`);
  } else {
    console.log(`ℹ️  Database: Using resilient in-memory fallback store`);
    console.log(`   (To connect to PostgreSQL, set DATABASE_URL in .env)`);
  }

  console.log(`🤖 Gemini AI: ${env.GEMINI_API_KEY ? 'Configured ✅' : 'Not configured (add GEMINI_API_KEY to .env) ⚠️'}`);
  console.log(`🗺️  Google Maps: ${env.GOOGLE_MAPS_API_KEY ? 'Configured ✅' : 'Not configured ⚠️'}`);
  console.log(`⛅ Weather API: ${env.WEATHER_API_KEY ? 'Configured ✅' : 'Not configured ⚠️'}`);
  console.log(`===============================================`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
