/**
 * Generate 45 Days of Realistic Test Data
 * Creates habits, daily progress, and streak snapshots for testing
 * 
 * Run with: node generate45DaysData.js
 */

const mongoose = require('mongoose');
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

// Target user email
const TARGET_EMAIL = 'chandrashekhargawda2000@gmail.com';

// Number of days to generate data for
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
    // Pattern: Very consistent on weekdays, 60% on weekends
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
    // Pattern: Very consistent, 85% overall
    completionRate: () => 0.85
  },
  {
    name: 'Read 30 Minutes',
    category: 'Learning',
    color: '#3b82f6',
    goal: 'Daily',
    // Pattern: Better on weekends, improves over time
    completionRate: (dayOfWeek, dayIndex) => {
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseRate = isWeekend ? 0.75 : 0.55;
      const improvement = dayIndex * 0.005; // Improves over time
      return Math.min(baseRate + improvement, 0.95);
    }
  },
  {
    name: 'Meditation',
    category: 'Wellness',
    color: '#8b5cf6',
    goal: 'Daily',
    // Pattern: Started strong, then dropped, then picked up again
    completionRate: (dayOfWeek, dayIndex) => {
      if (dayIndex < 10) return 0.80; // Strong start
      if (dayIndex < 25) return 0.40; // Mid-slump
      return 0.70; // Recovery
    }
  },
  {
    name: 'Code Practice',
    category: 'Career',
    color: '#f59e0b',
    goal: 'Daily',
    // Pattern: Weekdays only, very consistent
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
    // Pattern: Very consistent, 92% overall
    completionRate: () => 0.92
  },
  {
    name: 'Evening Walk',
    category: 'Health',
    color: '#84cc16',
    goal: 'Daily',
    // Pattern: Weather-dependent (simulated as random), 65% overall
    completionRate: () => 0.65
  },
  {
    name: 'Journal Writing',
    category: 'Wellness',
    color: '#ec4899',
    goal: 'Daily',
    // Pattern: Weekends and some weekdays, 50% overall
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
    // Pattern: 3-4 times per week, consistent
    completionRate: (dayOfWeek) => {
      // Prefer Mon, Wed, Fri, Sun
      return [1, 3, 5, 0].includes(dayOfWeek) ? 0.85 : 0.15;
    }
  },
  {
    name: 'No Social Media',
    category: 'Productivity',
    color: '#a855f7',
    goal: 'Daily',
    // Pattern: Struggling, around 35% success rate
    completionRate: () => 0.35
  }
];

// Generate realistic progress percentages for time periods
function generateTimePeriodProgress(shouldComplete, habitName, timePeriod) {
  if (!shouldComplete) {
    // Not completed - return random low values or 0
    const lowValues = [0, 0, 0, 10, 20];
    return lowValues[Math.floor(Math.random() * lowValues.length)];
  }

  // Completed - need at least one period at 100%
  // Distribute completion across periods based on habit type
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
  
  // Determine if this period should be 100%
  const periodPref = pref[timePeriod];
  const shouldBe100 = Math.random() < periodPref;

  if (shouldBe100) {
    return 100;
  } else {
    // Supporting period - random partial completion
    const partialValues = [0, 10, 20, 50, 80];
    return partialValues[Math.floor(Math.random() * partialValues.length)];
  }
}

async function generate45DaysData() {
  console.log('🚀 Starting 45-Day Data Generation for Streak Testing...\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`📧 Target Email: ${TARGET_EMAIL}`);
  console.log(`📅 Date Range: Last ${DAYS_TO_GENERATE} days`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    // Connect to database
    await connectDB();
    console.log('✅ Database connected\n');

    // Find user
    console.log(`🔍 Finding user: ${TARGET_EMAIL}...`);
    const user = await User.findOne({ email: TARGET_EMAIL });
    
    if (!user) {
      console.log(`❌ User with email ${TARGET_EMAIL} not found`);
      console.log('💡 Please register this user first');
      process.exit(1);
    }
    
    console.log(`✅ User found: ${user.username} (ID: ${user._id})\n`);

    // Step 1: Delete existing data for clean slate
    console.log('🧹 STEP 1: Cleaning existing data...');
    
    const deletedHabits = await Habit.deleteMany({ userId: user._id });
    const deletedDailyProgress = await DailyProgress.deleteMany({ userId: user._id });
    const deletedProgress = await Progress.deleteMany({ userId: user._id });
    const deletedStreakHistory = await StreakHistory.deleteMany({ userId: user._id });
    
    console.log(`   🗑️  Deleted ${deletedHabits.deletedCount} habits`);
    console.log(`   🗑️  Deleted ${deletedDailyProgress.deletedCount} daily progress entries`);
    console.log(`   🗑️  Deleted ${deletedProgress.deletedCount} progress entries`);
    console.log(`   🗑️  Deleted ${deletedStreakHistory.deletedCount} streak history entries`);
    console.log('   ✅ Clean slate ready\n');

    // Step 2: Create habits (starting 45 days ago)
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
      
      console.log(`   ✅ Created: ${habitDef.name} (${habitDef.color})`);
    }
    
    console.log(`   📊 Total habits created: ${createdHabits.length}\n`);

    // Step 3: Generate daily progress for last 45 days
    console.log('📊 STEP 3: Generating 45 days of progress data...');
    console.log('   (This may take a minute...)\n');
    
    const timePeriods = ['morning', 'afternoon', 'evening', 'night'];
    let totalProgressEntries = 0;
    let totalCompletions = 0;
    
    // Generate data for each day
    for (let dayOffset = DAYS_TO_GENERATE - 1; dayOffset >= 0; dayOffset--) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - dayOffset);
      currentDate.setHours(0, 0, 0, 0);
      
      const dateStr = formatDate(currentDate);
      const dayOfWeek = currentDate.getDay();
      const dayIndex = DAYS_TO_GENERATE - dayOffset - 1;
      
      // Process each habit
      for (const habit of createdHabits) {
        // Determine if this habit should be completed today
        const completionThreshold = habit.completionRate(dayOfWeek, dayIndex);
        const shouldComplete = Math.random() < completionThreshold;
        
        // Generate progress for each time period
        const progressData = {};
        let hasCompleted = false;
        
        for (const period of timePeriods) {
          const percentage = generateTimePeriodProgress(shouldComplete, habit.name, period);
          progressData[period] = percentage;
          
          if (percentage === 100) {
            hasCompleted = true;
          }
        }
        
        // Ensure at least one period is 100% if shouldComplete is true
        if (shouldComplete && !hasCompleted) {
          // Pick a random period based on habit preferences
          const preferences = {
            'Morning Exercise': 'morning',
            'Healthy Breakfast': 'morning',
            'Meditation': 'morning',
            'Yoga Practice': 'morning',
            'Evening Walk': 'evening',
            'Read 30 Minutes': 'evening',
            'Journal Writing': 'night',
            'Code Practice': 'afternoon',
            'Drink 8 Glasses Water': timePeriods[Math.floor(Math.random() * 4)],
            'No Social Media': timePeriods[Math.floor(Math.random() * 4)]
          };
          
          const preferredPeriod = preferences[habit.name] || timePeriods[Math.floor(Math.random() * 4)];
          progressData[preferredPeriod] = 100;
          hasCompleted = true;
        }
        
        // Create DailyProgress entry
        await DailyProgress.create({
          userId: user._id,
          habitId: habit._id,
          date: dateStr,
          morning: progressData.morning,
          afternoon: progressData.afternoon,
          evening: progressData.evening,
          night: progressData.night
        });
        
        // Create legacy Progress entry for streak calculation
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
      
      // Progress indicator every 5 days
      if ((dayIndex + 1) % 5 === 0 || dayOffset === 0) {
        console.log(`   ✅ Generated progress for: ${dateStr} (Day ${dayIndex + 1}/${DAYS_TO_GENERATE})`);
      }
    }
    
    console.log(`\n   📊 Total progress entries created: ${totalProgressEntries}`);
    console.log(`   ✅ Total task completions: ${totalCompletions}\n`);

    // Step 4: Generate streak snapshots for each day
    console.log('🔥 STEP 4: Generating streak snapshots...');
    console.log('   (Creating historical streak records...)\n');
    
    let snapshotCount = 0;
    
    // Generate snapshots for each day (simulate daily snapshots)
    for (let dayOffset = DAYS_TO_GENERATE - 1; dayOffset >= 0; dayOffset--) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - dayOffset);
      const dateStr = formatDate(currentDate);
      
      // Create snapshot for each habit
      for (const habit of createdHabits) {
        try {
          await createStreakSnapshot(user._id, habit._id, dateStr);
          snapshotCount++;
        } catch (error) {
          // Silently continue on error
        }
      }
      
      // Progress indicator every 7 days
      if ((DAYS_TO_GENERATE - dayOffset) % 7 === 0 || dayOffset === 0) {
        console.log(`   ✅ Snapshots created for: ${dateStr}`);
      }
    }
    
    console.log(`\n   🔥 Total streak snapshots created: ${snapshotCount}\n`);

    // Step 5: Archive 2 habits to test archived streaks
    console.log('🗄️  STEP 5: Creating archived streak examples...');
    
    // Archive "No Social Media" (low success rate - gave up)
    const habitToArchive1 = createdHabits.find(h => h.name === 'No Social Media');
    if (habitToArchive1) {
      const archiveDate1 = new Date();
      archiveDate1.setDate(archiveDate1.getDate() - 15); // Archived 15 days ago
      archiveDate1.setHours(0, 0, 0, 0);
      
      await Habit.findByIdAndUpdate(habitToArchive1._id, {
        isActive: false,
        archivedAt: archiveDate1
      });
      
      // Mark streak history as archived
      await StreakHistory.updateMany(
        { userId: user._id, habitId: habitToArchive1._id },
        {
          streakType: 'archived',
          isArchived: true,
          archivedAt: archiveDate1
        }
      );
      
      console.log(`   🗄️  Archived: ${habitToArchive1.name} (15 days ago)`);
    }
    
    // Archive "Yoga Practice" (was going well, then stopped)
    const habitToArchive2 = createdHabits.find(h => h.name === 'Yoga Practice');
    if (habitToArchive2) {
      const archiveDate2 = new Date();
      archiveDate2.setDate(archiveDate2.getDate() - 7); // Archived 7 days ago
      archiveDate2.setHours(0, 0, 0, 0);
      
      await Habit.findByIdAndUpdate(habitToArchive2._id, {
        isActive: false,
        archivedAt: archiveDate2
      });
      
      // Mark streak history as archived
      await StreakHistory.updateMany(
        { userId: user._id, habitId: habitToArchive2._id },
        {
          streakType: 'archived',
          isArchived: true,
          archivedAt: archiveDate2
        }
      );
      
      console.log(`   🗄️  Archived: ${habitToArchive2.name} (7 days ago)\n`);
    }

    // Step 6: Generate summary statistics
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📈 SUMMARY STATISTICS');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    const activeHabits = await Habit.countDocuments({ userId: user._id, isActive: true });
    const archivedHabits = await Habit.countDocuments({ userId: user._id, isActive: false });
    const totalDailyProgress = await DailyProgress.countDocuments({ userId: user._id });
    const totalStreakSnapshots = await StreakHistory.countDocuments({ userId: user._id });
    const archivedStreaks = await StreakHistory.countDocuments({ 
      userId: user._id, 
      isArchived: true 
    });
    
    console.log(`   📌 Active Habits: ${activeHabits}`);
    console.log(`   🗄️  Archived Habits: ${archivedHabits}`);
    console.log(`   📊 Daily Progress Entries: ${totalDailyProgress}`);
    console.log(`   ✅ Task Completions: ${totalCompletions}`);
    console.log(`   🔥 Streak Snapshots: ${totalStreakSnapshots}`);
    console.log(`   🗄️  Archived Streak Records: ${archivedStreaks}`);
    console.log(`\n   📅 Date Range: Last ${DAYS_TO_GENERATE} days`);
    console.log(`   📧 User: ${TARGET_EMAIL}`);
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ DATA GENERATION COMPLETE!');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    console.log('🎯 Next Steps:');
    console.log('   1. Login with: chandrashekhargawda2000@gmail.com');
    console.log('   2. View active streaks in the dashboard');
    console.log('   3. Check archived streaks section');
    console.log('   4. Navigate through different dates to see historical data');
    console.log('   5. Test deleting a habit to verify streak preservation\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the generator
generate45DaysData();
