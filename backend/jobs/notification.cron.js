const cron = require('node-cron');
const { runNotificationBatchAllUsers } = require('../services/notification.generator.service');

let started = false;

function startNotificationCron() {
  if (started) return;
  started = true;

  cron.schedule(
    '0 */6 * * *',
    async () => {
      try {
        await runNotificationBatchAllUsers();
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log('[CRON] Notification batch completed');
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[CRON] Notification batch failed:', err.message);
      }
    },
    { timezone: 'Asia/Kolkata' }
  );

  setTimeout(() => {
    runNotificationBatchAllUsers().catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[CRON] Initial notification seed failed:', err.message);
    });
  }, 12000);
}

module.exports = { startNotificationCron };
