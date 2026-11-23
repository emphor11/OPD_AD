const cron = require('node-cron');
const OpdSession = require('../models/OpdSession');

const startCronJobs = () => {
  // Run daily at midnight to auto-close any lingering OPD sessions from previous dates
  cron.schedule('0 0 * * *', async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await OpdSession.updateMany(
        { date: { $lt: today }, status: 'open' },
        { status: 'closed' }
      );
      if (result.modifiedCount > 0) {
        console.log(`[Cron Job] Auto-closed ${result.modifiedCount} previous OPD sessions`);
      }
    } catch (err) {
      console.error('[Cron Job Error] Failed to auto-close previous sessions:', err.message);
    }
  });

  console.log('[Cron] Daily OPD session maintenance cron job registered');
};

module.exports = startCronJobs;
