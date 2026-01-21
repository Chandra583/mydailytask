/**
 * Complete Setup Script: Register User + Generate 45 Days Data
 * 
 * Run with: node registerAndGenerateData.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Habit = require('./models/Habit');
const DailyProgress = require('./models/DailyProgress');
const Progress = require('./models/Progress');
const StreakHistory = require('./models/StreakHistory');
const { createStreakSnapshot } = require('./services/streakSnapshotService');

// Connect to database
const connectDB = require('./config/db');

// Target user details
const USER_DATA = {
  username: 'Chandrashekar',
  email: 'chandrashekhargawda2000@gmail.com',
  password: 'Test@123' // Change this to your preferred password
};

const DAYS_TO_GENERATE = 45;

// Helper: Format date as YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Realistic habit definitions with completion patterns
const HABIT_DEFINITIONS = [
  {
    name: 'Morning Exercise',
    category: 'Health',
    color: '#ef4444',
    goal: 'Daily',
    completionRate: (dayOfWeek, dayIndex) => {
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      return isWeekend ? 0.60 : 0.90;
    }
  },
  {
    name: 'Drink 8 Glasses Water',
    category: 'Health',
    color: '#06b6d4',
    goal: 'Daily',
    completionRate: () => 0.85
  },
  {
    name: 'Read 30 Minutes',
    category: 'Learning',
    color: '#3b82f6',
    goal: 'Daily',
    completionRate: (dayOfWeek, dayIndex) => {
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseRate = isWeekend ? 0.75 : 0.55;
      const improvement = dayIndex * 0.005;
      return Math.min(baseRate + improvement, 0.95);
    }
  },
  {
    name: 'Meditation',
    category: 'Wellness',
    color: '#8b5cf6',
    goal: 'Daily',
    completionRate: (dayOfWeek, dayIndex) => {
      if (dayIndex < 10) return 0.80;
      if (dayIndex < 25) return 0.40;
      return 0.70;
    }
  },
  {
    name: 'Code Practice',
    category: 'Career',
    color: '#f59e0b',
    goal: 'Daily',
    completionRate: (dayOfWeek) => {
      const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
      return isWeekday ? 0.88 : 0.10;
    }
  },
  {
    name: 'Healthy Breakfast',
    category: 'Health',
    color: '#10b981',
    goal: 'Daily',
    completionRate: () => 0.92
  },
  {
    name: 'Evening Walk',
    category: 'Health',
    color: '#84cc16',
    goal: 'Daily',
    completionRate: () => 0.65
  },
  {
    name: 'Journal Writing',
    category: 'Wellness',
    color: '#ec4899',
    goal: 'Daily',
    completionRate: (dayOfWeek) => {
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      return isWeekend ? 0.80 : 0.40;
    }
  },
  {
    name: 'Yoga Practice',
    category: 'Wellness',
    color: '#f97316',
    goal: 'Daily',
    completionRate: (dayOfWeek) => {
      return [1, 3, 5, 0].includes(dayOfWeek) ? 0.85 : 0.15;
    }
  },
  {
    name: 'No Social Media',
    category: 'Productivity',
    color: '#a855f7',
    goal: 'Daily',
    completionRate: () => 0.35
  }
];

function generateTimePeriodProgress(shouldComplete, habitName, timePeriod) {
  if (!shouldComplete) {
    const lowValues = [0, 0, 0, 10, 20];
    return lowValues[Math.floor(Math.random() * lowValues.length)];
  }

  const preferences = {
    'Morning Exercise': { morning: 0.85, afternoon: 0.10, evening: 0.05, night: 0 },
    'Drink 8 Glasses Water': { morning: 0.25, afternoon: 0.25, evening: 0.25, night: 0.25 },
    'Read 30 Minutes': { morning: 0.15, afternoon: 0.20, evening: 0.40, night: 0.25 },
    'Meditation': { morning: 0.70, afternoon: 0.15, evening: 0.10, night: 0.05 },
    'Code Practice': { morning: 0.20, afternoon: 0.40, evening: 0.30, night: 0.10 },
    'Healthy Breakfast': { morning: 0.95, afternoon: 0.05, evening: 0, night: 0 },
    'Evening Walk': { morning: 0, afternoon: 0.10, evening: 0.80, night: 0.10 },
    'Journal Writing': { morning: 0.10, afternoon: 0.15, evening: 0.35, night: 0.40 },
    'Yoga Practice': { morning: 0.60, afternoon: 0.20, evening: 0.15, night: 0.05 },
    'No Social Media': { morning: 0.25, afternoon: 0.25, evening: 0.25, night: 0.25 }
  };

  const pref = preferences[habitName] || { morning: 0.25, afternoon: 0.25, evening: 0.25, night: 0.25 };
  const periodPref = pref[timePeriod];
  const shouldBe100 = Math.random() < periodPref;

  if (shouldBe100) {
    return 100;
  } else {
    const partialValues = [0, 10, 20, 50, 80];
    return partialValues[Math.floor(Math.random() * partialValues.length)];
  }
}

async function registerAndGenerateData() {
  console.log('🚀 Complete Setup: Register User + Generate 45 Days Data\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`📧 Email: ${USER_DATA.email}`);
  console.log(`👤 Username: ${USER_DATA.username}`);
  console.log(`📅 Data Range: Last ${DAYS_TO_GENERATE} days`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    // Connect to database
    await connectDB();
    console.log('✅ Database connected\n');

    // Step 1: Register/Find User
    console.log('👤 STEP 1: Setting up user account...');
    
    let user = await User.findOne({ email: USER_DATA.email });
    
    if (user) {
      console.log(`   ✅ User already exists: ${user.username} (ID: ${user._id})`);
      console.log('   🧹 Cleaning existing data...');
      
      // Clean existing data
      await Habit.deleteMany({ userId: user._id });
      await DailyProgress.deleteMany({ userId: user._id });
      await Progress.deleteMany({ userId: user._id });
      await StreakHistory.deleteMany({ userId: user._id });
      
      console.log('   ✅ Existing data cleaned\n');
    } else {
      console.log('   📝 Creating new user...');
      
      user = await User.create({
        username: USER_DATA.username,
        email: USER_DATA.email,
        password: USER_DATA.password, // Will be hashed by pre-save hook
        authProvider: 'local'
      });
      
      console.log(`   ✅ User created: ${user.username} (ID: ${user._id})`);
      console.log(`   🔑 Password: ${USER_DATA.password}\n`);
    }

    // Step 2: Create habits
    console.log('📝 STEP 2: Creating habits...');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - DAYS_TO_GENERATE);
    startDate.setHours(0, 0, 0, 0);
    
    const createdHabits = [];
    
    for (const habitDef of HABIT_DEFINITIONS) {
      const habit = await Habit.create({
        userId: user._id,
        name: habitDef.name,
        category: habitDef.category,
        color: habitDef.color,
        goal: habitDef.goal,
        taskType: 'ongoing',
        startDate: startDate,
        createdAt: startDate,
        isActive: true
      });
      
      createdHabits.push({
        ...habit.toObject(),
        completionRate: habitDef.completionRate
      });
      
      console.log(`   ✅ ${habitDef.name}`);
    }
    
    console.log(`   📊 Total: ${createdHabits.length} habits\n`);

    // Step 3: Generate daily progress
    console.log('📊 STEP 3: Generating 45 days of realistic progress...');
    console.log('   (This will take about 30 seconds...)\n');
    
    const timePeriods = ['morning', 'afternoon', 'evening', 'night'];
    let totalProgressEntries = 0;
    let totalCompletions = 0;
    
    for (let dayOffset = DAYS_TO_GENERATE - 1; dayOffset >= 0; dayOffset--) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - dayOffset);
      currentDate.setHours(0, 0, 0, 0);
      
      const dateStr = formatDate(currentDate);
      const dayOfWeek = currentDate.getDay();
      const dayIndex = DAYS_TO_GENERATE - dayOffset - 1;
      
      for (const habit of createdHabits) {
        const completionThreshold = habit.completionRate(dayOfWeek, dayIndex);
        const shouldComplete = Math.random() < completionThreshold;
        
        const progressData = {};
        let hasCompleted = false;
        
        for (const period of timePeriods) {
          const percentage = generateTimePeriodProgress(shouldComplete, habit.name, period);
          progressData[period] = percentage;
          if (percentage === 100) hasCompleted = true;
        }
        
        if (shouldComplete && !hasCompleted) {
          const preferences = {
            'Morning Exercise': 'morning',
            'Healthy Breakfast': 'morning',
            'Meditation': 'morning',
            'Yoga Practice': 'morning',
            'Evening Walk': 'evening',
            'Read 30 Minutes': 'evening',
            'Journal Writing': 'night',
            'Code Practice': 'afternoon'
          };
          
          const preferredPeriod = preferences[habit.name] || timePeriods[Math.floor(Math.random() * 4)];
          progressData[preferredPeriod] = 100;
          hasCompleted = true;
        }
        
        await DailyProgress.create({
          userId: user._id,
          habitId: habit._id,
          date: dateStr,
          morning: progressData.morning,
          afternoon: progressData.afternoon,
          evening: progressData.evening,
          night: progressData.night
        });
        
        if (hasCompleted) {
          await Progress.create({
            userId: user._id,
            habitId: habit._id,
            date: currentDate,
            completed: true
          });
          totalCompletions++;
        }
        
        totalProgressEntries++;
      }
      
      if ((dayIndex + 1) % 10 === 0 || dayOffset === 0) {
        console.log(`   ✅ Day ${dayIndex + 1}/${DAYS_TO_GENERATE}: ${dateStr}`);
      }
    }
    
    console.log(`\n   📊 Progress entries: ${totalProgressEntries}`);
    console.log(`   ✅ Completions: ${totalCompletions}\n`);

    // Step 4: Generate streak snapshots
    console.log('🔥 STEP 4: Generating streak snapshots...\n');
    
    let snapshotCount = 0;
    
    for (let dayOffset = DAYS_TO_GENERATE - 1; dayOffset >= 0; dayOffset--) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - dayOffset);
      const dateStr = formatDate(currentDate);
      
      for (const habit of createdHabits) {
        try {
          await createStreakSnapshot(user._id, habit._id, dateStr);
          snapshotCount++;
        } catch (error) {
          // Continue on error
        }
      }
      
      if ((DAYS_TO_GENERATE - dayOffset) % 10 === 0 || dayOffset === 0) {
        console.log(`   🔥 Snapshots for: ${dateStr}`);
      }
    }
    
    console.log(`\n   📊 Total snapshots: ${snapshotCount}\n`);

    // Step 5: Archive some habits
    console.log('🗄️  STEP 5: Creating archived streak examples...\n');
    
    const habitToArchive1 = createdHabits.find(h => h.name === 'No Social Media');
    if (habitToArchive1) {
      const archiveDate = new Date();
      archiveDate.setDate(archiveDate.getDate() - 15);
      
      await Habit.findByIdAndUpdate(habitToArchive1._id, {
        isActive: false,
        archivedAt: archiveDate
      });
      
      await StreakHistory.updateMany(
        { userId: user._id, habitId: habitToArchive1._id },
        { streakType: 'archived', isArchived: true, archivedAt: archiveDate }
      );
      
      console.log(`   🗄️  Archived: No Social Media (15 days ago)`);
    }
    
    const habitToArchive2 = createdHabits.find(h => h.name === 'Yoga Practice');
    if (habitToArchive2) {
      const archiveDate = new Date();
      archiveDate.setDate(archiveDate.getDate() - 7);
      
      await Habit.findByIdAndUpdate(habitToArchive2._id, {
        isActive: false,
        archivedAt: archiveDate
      });
      
      await StreakHistory.updateMany(
        { userId: user._id, habitId: habitToArchive2._id },
        { streakType: 'archived', isArchived: true, archivedAt: archiveDate }
      );
      
      console.log(`   🗄️  Archived: Yoga Practice (7 days ago)\n`);
    }

    // Final Summary
    const activeHabits = await Habit.countDocuments({ userId: user._id, isActive: true });
    const archivedHabits = await Habit.countDocuments({ userId: user._id, isActive: false });
    const totalSnapshots = await StreakHistory.countDocuments({ userId: user._id });
    const archivedStreaks = await StreakHistory.countDocuments({ userId: user._id, isArchived: true });
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ SETUP COMPLETE!');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('📈 SUMMARY:');
    console.log(`   👤 User: ${user.username} (${user.email})`);
    console.log(`   🔑 Password: ${USER_DATA.password}`);
    console.log(`   📌 Active Habits: ${activeHabits}`);
    console.log(`   🗄️  Archived Habits: ${archivedHabits}`);
    console.log(`   📊 Progress Entries: ${totalProgressEntries}`);
    console.log(`   ✅ Task Completions: ${totalCompletions}`);
    console.log(`   🔥 Streak Snapshots: ${totalSnapshots}`);
    console.log(`   🗄️  Archived Streaks: ${archivedStreaks}`);
    console.log(`   📅 Date Range: ${DAYS_TO_GENERATE} days`);
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('\n🎯 NEXT STEPS:');
    console.log(`   1. Login: ${USER_DATA.email}`);
    console.log(`   2. Password: ${USER_DATA.password}`);
    console.log('   3. View active streaks in dashboard');
    console.log('   4. Check archived streaks section');
    console.log('   5. Navigate through dates to see historical data');
    console.log('   6. Test deleting a habit to verify streak preservation\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

registerAndGenerateData();
