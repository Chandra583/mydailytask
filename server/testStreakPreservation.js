/**
 * Test script to verify streak preservation functionality
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import models and services
const User = require('./models/User');
const Habit = require('./models/Habit');
const DailyProgress = require('./models/DailyProgress');
const StreakHistory = require('./models/StreakHistory');
const { createStreakSnapshot, archiveStreakOnHabitDeletion } = require('./services/streakSnapshotService');

// Connect to database
const connectDB = require('./config/db');
connectDB();

async function testStreakPreservation() {
  try {
    console.log('🧪 Starting streak preservation tests...\n');
    
    // Find a test user (using the one from the previous task)
    const testUser = await User.findOne({ email: 'chandrashekhargawda000@gmail.com' });
    if (!testUser) {
      console.log('❌ Test user not found. Please run the seed script first.');
      return;
    }
    
    console.log(`✅ Found test user: ${testUser.email} (${testUser._id})\n`);
    
    // Test 1: Create a test habit
    console.log('📋 Test 1: Creating a test habit...');
    const testHabit = await Habit.create({
      userId: testUser._id,
      name: 'Test Streak Preservation',
      color: '#ff6b6b',
      taskType: 'ongoing',
      startDate: new Date()
    });
    console.log(`✅ Created test habit: ${testHabit.name} (${testHabit._id})\n`);
    
    // Test 2: Create progress data to simulate a streak
    console.log('📈 Test 2: Creating progress data to simulate a streak...');
    
    // Create progress for the last 3 days to simulate a 3-day streak
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const dateStrings = [
      twoDaysAgo.toISOString().split('T')[0],
      yesterday.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    ];
    
    for (const dateStr of dateStrings) {
      // Create progress with 100% completion to maintain streak
      await DailyProgress.create({
        userId: testUser._id,
        habitId: testHabit._id,
        date: dateStr,
        morning: 100,
        afternoon: 100,
        evening: 100,
        night: 100
      });
      
      // Create corresponding snapshot
      await createStreakSnapshot(testUser._id, testHabit._id, dateStr);
      console.log(`   ✅ Created progress and snapshot for ${dateStr}`);
    }
    
    console.log('✅ Created progress data for 3 consecutive days\n');
    
    // Test 3: Verify streak history was created
    console.log('🔍 Test 3: Verifying streak history was created...');
    const streakHistory = await StreakHistory.find({ 
      userId: testUser._id, 
      habitId: testHabit._id 
    }).sort({ snapshotDate: 1 });
    
    console.log(`✅ Found ${streakHistory.length} streak history entries`);
    if (streakHistory.length > 0) {
      console.log(`   Latest snapshot shows current streak: ${streakHistory[streakHistory.length - 1].currentStreak}`);
      console.log(`   Latest snapshot shows longest streak: ${streakHistory[streakHistory.length - 1].longestStreak}`);
    }
    console.log('');
    
    // Test 4: Archive the habit and verify streak preservation
    console.log('🗂️  Test 4: Archiving habit and verifying streak preservation...');
    
    // Get streak data before archiving
    const preArchiveStreaks = await StreakHistory.find({ 
      userId: testUser._id, 
      habitId: testHabit._id 
    });
    
    console.log(`   Before archiving: ${preArchiveStreaks.length} history entries`);
    
    // Archive the habit (this should preserve the streak history)
    await archiveStreakOnHabitDeletion(testUser._id, testHabit._id);
    
    // Get streak data after archiving
    const postArchiveStreaks = await StreakHistory.find({ 
      userId: testUser._id, 
      habitId: testHabit._id 
    });
    
    console.log(`   After archiving: ${postArchiveStreaks.length} history entries`);
    
    // Verify that the streak history still exists and is marked as archived
    const archivedSnapshots = await StreakHistory.find({ 
      userId: testUser._id, 
      habitId: testHabit._id,
      isArchived: true 
    });
    
    console.log(`   Archived snapshots: ${archivedSnapshots.length}`);
    
    if (postArchiveStreaks.length > 0 && archivedSnapshots.length > 0) {
      console.log('✅ Streak history successfully preserved after habit archiving!');
    } else {
      console.log('❌ Streak history was not preserved properly');
    }
    
    // Test 5: Verify habit is archived
    console.log('\n📋 Test 5: Verifying habit is archived...');
    const archivedHabit = await Habit.findById(testHabit._id);
    if (archivedHabit) {
      console.log(`   Habit active status: ${archivedHabit.isActive ? 'Active' : 'Archived'}`);
      console.log(`   Archive date: ${archivedHabit.archivedAt ? archivedHabit.archivedAt.toISOString().split('T')[0] : 'Not set'}`);
      
      if (!archivedHabit.isActive) {
        console.log('✅ Habit was successfully archived');
      } else {
        console.log('❌ Habit was not archived properly');
      }
    }
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error(error.stack);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
}

// Run the test
testStreakPreservation();