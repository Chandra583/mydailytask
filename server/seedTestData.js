/**
 * Test Data Seeder Script
 * Injects dummy data for testing Weekly/Monthly charts
 * 
 * Run with: node seedTestData.js
 */

const axios = require('axios');

// API Configuration
const API_URL = 'https://mydailytask.vercel.app/api';

// Login credentials
const EMAIL = 'chandrashekhargawda2000@gmail.com';
const PASSWORD = 'Ammaappa@1836';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Test Habits to Create
const testHabits = [
  { name: 'Morning Jog', category: 'Health', color: '#10b981', goal: 'Daily' },
  { name: 'Read 30 mins', category: 'Learning', color: '#3b82f6', goal: 'Daily' },
  { name: 'Meditation', category: 'Wellness', color: '#8b5cf6', goal: 'Daily' },
  { name: 'Drink 8 glasses water', category: 'Health', color: '#06b6d4', goal: 'Daily' },
  { name: 'Code Practice', category: 'Career', color: '#f59e0b', goal: 'Daily' },
  { name: 'Healthy Breakfast', category: 'Health', color: '#ec4899', goal: 'Daily' },
  { name: 'Evening Walk', category: 'Health', color: '#84cc16', goal: 'Daily' },
  { name: 'Journal Writing', category: 'Wellness', color: '#f97316', goal: 'Daily' }
];

// Helper: Format date as YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper: Get random progress value
function getRandomProgress() {
  const values = [0, 0, 10, 20, 50, 80, 100, 100, 100];
  return values[Math.floor(Math.random() * values.length)];
}

// Helper: Get weighted random (higher chance of completion for some habits)
function getWeightedProgress(habitIndex, dayOfWeek) {
  // Higher completion on weekdays, lower on weekends
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const baseChance = isWeekend ? 0.5 : 0.8;
  
  // First few habits have higher completion rates
  const habitBonus = habitIndex < 3 ? 0.2 : 0;
  
  if (Math.random() < (baseChance + habitBonus)) {
    const highValues = [80, 100, 100, 100];
    return highValues[Math.floor(Math.random() * highValues.length)];
  } else {
    const lowValues = [0, 10, 20, 50];
    return lowValues[Math.floor(Math.random() * lowValues.length)];
  }
}

async function seedData() {
  console.log('🚀 Starting Test Data Seeder...\n');
  
  try {
    // Step 0: Login to get fresh token
    console.log('🔐 Logging in...');
    const loginResponse = await api.post('/auth/login', {
      email: EMAIL,
      password: PASSWORD
    });
    
    const token = loginResponse.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('   ✅ Login successful!\n');
    // Step 1: Create Habits
    console.log('📝 Creating test habits...');
    const createdHabits = [];
    
    for (const habit of testHabits) {
      try {
        const response = await api.post('/habits', habit);
        createdHabits.push(response.data);
        console.log(`   ✅ Created: ${habit.name}`);
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || error.message;
        console.log(`   ❌ Failed: ${habit.name} - ${errorMsg}`);
        if (error.response?.data) {
          console.log(`      Debug: ${JSON.stringify(error.response.data)}`);
        }
      }
    }
    
    // If no habits were created, try to fetch existing ones
    if (createdHabits.length === 0) {
      console.log('\n📥 Fetching existing habits...');
      const habitsResponse = await api.get('/habits');
      createdHabits.push(...habitsResponse.data);
      console.log(`   Found ${createdHabits.length} existing habits`);
    }
    
    if (createdHabits.length === 0) {
      console.log('❌ No habits available. Exiting.');
      return;
    }
    
    // Step 2: Generate Progress Data for last 45 days
    console.log('\n📊 Generating progress data for last 45 days...');
    
    const today = new Date();
    const timePeriods = ['morning', 'afternoon', 'evening', 'night'];
    let progressCount = 0;
    let errorCount = 0;
    
    for (let daysAgo = 0; daysAgo < 45; daysAgo++) {
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);
      const dateStr = formatDate(date);
      const dayOfWeek = date.getDay();
      
      // Skip some days randomly (simulate missed days)
      if (daysAgo > 0 && Math.random() < 0.1) {
        continue;
      }
      
      for (let habitIndex = 0; habitIndex < createdHabits.length; habitIndex++) {
        const habit = createdHabits[habitIndex];
        
        // For each time period
        for (const period of timePeriods) {
          // Skip some periods randomly
          if (Math.random() < 0.2) continue;
          
          const percentage = getWeightedProgress(habitIndex, dayOfWeek);
          
          if (percentage > 0) {
            try {
              await api.post('/progress/daily', {
                habitId: habit._id,
                date: dateStr,
                timePeriod: period,
                percentage: percentage
              });
              progressCount++;
            } catch (error) {
              errorCount++;
            }
          }
        }
      }
      
      // Progress indicator
      if (daysAgo % 7 === 0) {
        console.log(`   📅 Processed: ${dateStr} (${45 - daysAgo} days remaining)`);
      }
    }
    
    console.log(`\n✅ Created ${progressCount} progress entries`);
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} entries skipped (duplicates or errors)`);
    }
    
    // Step 3: Summary
    console.log('\n🎉 Test Data Seeding Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Habits: ${createdHabits.length}`);
    console.log(`   Progress Entries: ${progressCount}`);
    console.log(`   Date Range: Last 45 days`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('You can now test the Weekly and Monthly views!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

// Run the seeder
seedData();
