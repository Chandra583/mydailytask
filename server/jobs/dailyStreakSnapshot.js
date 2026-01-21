const cron = require('node-cron');
const User = require('../models/User');
const { createDailySnapshotsForUser } = require('../services/streakSnapshotService');

/**
 * Schedule daily streak snapshots
 * Runs every day at 11:59 PM
 * 
 * NOTE: Requires node-cron package
 * Install with: npm install node-cron
 */
const scheduleDailySnapshots = () => {
  // Run every day at 11:59 PM
  cron.schedule('59 23 * * *', async () => {
    console.log('🔄 Running daily streak snapshots...');
    
    try {
      const users = await User.find({});
      const today = new Date().toISOString().split('T')[0];
      
      console.log(`📊 Creating snapshots for ${users.length} users...`);
      
      for (const user of users) {
        try {
          await createDailySnapshotsForUser(user._id, today);
        } catch (userError) {
          console.error(`❌ Error creating snapshots for user ${user._id}:`, userError.message);
          // Continue with other users even if one fails
        }
      }
      
      console.log(`✅ Daily snapshots completed for ${users.length} users`);
    } catch (error) {
      console.error('❌ Error in daily snapshot job:', error);
    }
  });
  
  console.log('⏰ Daily streak snapshot scheduler initialized (runs at 11:59 PM daily)');
};

module.exports = { scheduleDailySnapshots };
