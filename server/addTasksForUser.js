const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Habit = require('./models/Habit');
const DailyProgress = require('./models/DailyProgress');

// Connect to database
const connectDB = require('./config/db');
connectDB();

// Helper function to get date string in YYYY-MM-DD format
const getDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Function to add tasks for previous days
const addTasksForPreviousDays = async (email, taskCount = 5) => {
  try {
    console.log(`🔍 Searching for user with email: ${email}`);
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      return;
    }
    
    console.log(`✅ User found: ${user.username} (${user._id})`);
    
    // Calculate dates for the previous days
    const datesToAdd = [];
    for (let i = 1; i <= taskCount; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i); // Previous i days
      datesToAdd.push(getDateString(date));
    }
    
    console.log(`📅 Dates to add tasks for: ${datesToAdd.join(', ')}`);
    
    // Create some sample tasks
    const sampleTasks = [
      { name: 'Morning Exercise', color: '#ef4444' },
      { name: 'Read Book', color: '#3b82f6' },
      { name: 'Meditation', color: '#10b981' },
      { name: 'Work Tasks', color: '#f59e0b' },
      { name: 'Evening Walk', color: '#8b5cf6' }
    ];
    
    // Add tasks for each previous day
    for (const date of datesToAdd) {
      console.log(`\n📝 Adding tasks for date: ${date}`);
      
      // Create habits for this date
      for (const task of sampleTasks) {
        const habit = await Habit.create({
          userId: user._id,
          name: task.name,
          color: task.color,
          taskType: 'daily', // Daily task type - only appears on specific date
          startDate: new Date(date), // Start date for the task
          createdAt: new Date(date) // Set creation date to match the target date
        });
        
        console.log(`✅ Created habit: "${task.name}" for ${date}`);
        
        // Create progress entries for each time period (morning, afternoon, evening, night)
        const timePeriods = ['morning', 'afternoon', 'evening', 'night'];
        
        for (const period of timePeriods) {
          // Random completion percentage for demonstration (0, 10, 20, 50, 80, or 100)
          const percentages = [0, 10, 20, 50, 80, 100];
          const randomPercentage = percentages[Math.floor(Math.random() * percentages.length)];
          
          await DailyProgress.create({
            userId: user._id,
            habitId: habit._id,
            date: date,
            [period]: randomPercentage
          });
          
          console.log(`📊 Added ${period} progress: ${randomPercentage}% for "${task.name}" on ${date}`);
        }
      }
    }
    
    console.log(`\n🎉 Successfully added tasks for ${datesToAdd.length} days`);
    console.log(`✅ Total tasks added: ${datesToAdd.length * sampleTasks.length}`);
    
  } catch (error) {
    console.error('❌ Error adding tasks for user:', error.message);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

// Main execution
const email = process.argv[2] || 'chandrashekhargawda000@gmail.com';
const taskCount = parseInt(process.argv[3]) || 5;

console.log('🚀 Adding tasks for previous days...');
console.log(`📧 Email: ${email}`);
console.log(`📅 Number of days: ${taskCount}`);

addTasksForPreviousDays(email, taskCount);