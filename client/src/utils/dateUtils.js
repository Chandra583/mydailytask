import { 
  format, 
  getDaysInMonth, 
  startOfMonth, 
  getDay,
  addMonths,
  subMonths 
} from 'date-fns';

/**
 * Get week number for a day in the month
 * @param {number} day - Day of the month (1-31)
 * @returns {number} Week number (1-5)
 */
export const getWeekOfMonth = (day) => {
  return Math.ceil(day / 7);
};

/**
 * Get color for a specific week
 * @param {number} week - Week number (1-5)
 * @returns {string} Hex color code
 */
export const getWeekColor = (week) => {
  const colors = {
    1: '#3b82f6', // Blue
    2: '#10b981', // Green
    3: '#a855f7', // Purple
    4: '#f59e0b', // Yellow
    5: '#ef4444', // Red/Orange
  };
  return colors[week] || colors[1];
};

/**
 * Format date for API requests
 * @param {Date} date
 * @returns {string} Formatted date
 */
export const formatDateForAPI = (date) => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Get days array for a month
 * @param {number} year
 * @param {number} month
 * @returns {Array} Array of day objects
 */
export const getDaysArray = (year, month) => {
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  return Array.from({ length: daysInMonth }, (_, i) => i + 1);
};

/**
 * Calculate completion percentage
 * @param {number} completed
 * @param {number} total
 * @returns {number} Percentage
 */
export const calculatePercentage = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

/**
 * Get month name from number
 * @param {number} month - Month number (1-12)
 * @returns {string} Month name
 */
export const getMonthName = (month) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
};

/**
 * Get current date info
 * @returns {Object} Current year, month, day
 */
export const getCurrentDateInfo = () => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
};

/**
 * Check if a date is today
 * @param {number} year
 * @param {number} month
 * @param {number} day
 * @returns {boolean}
 */
export const isToday = (year, month, day) => {
  const today = new Date();
  return (
    today.getFullYear() === year &&
    today.getMonth() + 1 === month &&
    today.getDate() === day
  );
};

/**
 * Generate calendar data
 * @param {number} year
 * @param {number} month
 * @returns {Array} Calendar grid data
 */
export const generateCalendar = (year, month) => {
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const firstDay = getDay(startOfMonth(new Date(year, month - 1)));
  
  const calendar = [];
  let week = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    week.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      calendar.push(week);
      week = [];
    }
  }
  
  // Add remaining days to complete the last week
  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    calendar.push(week);
  }
  
  return calendar;
};
