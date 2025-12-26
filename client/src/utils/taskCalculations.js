/**
 * =============================================================================
 * TASK CALCULATIONS - Single Source of Truth
 * =============================================================================
 * 
 * This file contains all calculation logic for the Daily Task Tracker.
 * All components MUST use these functions to ensure consistency.
 * 
 * GLOBAL RULES (IMPORTANT):
 * 
 * A. TASK COMPLETION RULES:
 *    - A task is "Fully Completed Today" if ALL 4 time periods are 100%
 *    - A task is "In Progress" if it has any period > 0% but not all 100%
 *    - A task is "Not Started" if all periods are 0%
 * 
 * B. TASK PROGRESS CALCULATION:
 *    - Task Progress % = (morning + afternoon + evening + night) / 4
 *    - This gives the average execution across all periods
 * 
 * C. DAILY COMPLETION CALCULATION:
 *    - Daily Completion % = average of ALL task progress percentages
 *    - Formula: sum of all task averages / number of tasks
 *    - If no tasks → 0%
 * 
 * D. STREAK RULES:
 *    - A day counts toward streak if Daily Completion ≥ 50%
 *    - Consecutive days meeting this threshold form a streak
 * 
 * E. TIME PERIOD VALUES:
 *    - Valid values: 0, 10, 20, 50, 80, 100
 *    - Represents percentage of task execution for that period
 * 
 * =============================================================================
 */

/**
 * Time periods configuration
 */
export const TIME_PERIODS = ['morning', 'afternoon', 'evening', 'night'];
export const VALID_PERCENTAGES = [0, 10, 20, 50, 80, 100];

/**
 * Task status enum for consistency
 */
export const TASK_STATUS = {
  FULLY_COMPLETED: 'FULLY_COMPLETED',
  IN_PROGRESS: 'IN_PROGRESS',
  NOT_STARTED: 'NOT_STARTED',
};

/**
 * =============================================================================
 * CORE CALCULATION FUNCTIONS
 * =============================================================================
 */

/**
 * Calculate the progress percentage for a single task
 * 
 * @param {Object} taskProgress - Object with { morning, afternoon, evening, night }
 * @returns {number} - Average percentage (0-100, rounded)
 * 
 * @example
 * calculateTaskProgress({ morning: 100, afternoon: 50, evening: 0, night: 80 })
 * // Returns: 58 (Math.round((100+50+0+80)/4))
 * 
 * TOOLTIP: "Task Progress = average of all 4 time period percentages"
 */
export function calculateTaskProgress(taskProgress = {}) {
  const morning = taskProgress.morning || 0;
  const afternoon = taskProgress.afternoon || 0;
  const evening = taskProgress.evening || 0;
  const night = taskProgress.night || 0;

  const total = morning + afternoon + evening + night;
  const average = total / 4;

  return Math.round(average);
}

/**
 * Determine the completion status of a task
 * 
 * @param {Object} taskProgress - Object with { morning, afternoon, evening, night }
 * @returns {string} - One of TASK_STATUS values
 * 
 * RULES:
 * - FULLY_COMPLETED: All 4 periods are 100%
 * - IN_PROGRESS: At least one period > 0% but not all 100%
 * - NOT_STARTED: All periods are 0%
 */
export function getTaskStatus(taskProgress = {}) {
  const morning = taskProgress.morning || 0;
  const afternoon = taskProgress.afternoon || 0;
  const evening = taskProgress.evening || 0;
  const night = taskProgress.night || 0;

  // Check if fully completed (ALL periods are 100%)
  if (morning === 100 && afternoon === 100 && evening === 100 && night === 100) {
    return TASK_STATUS.FULLY_COMPLETED;
  }

  // Check if any progress exists
  if (morning > 0 || afternoon > 0 || evening > 0 || night > 0) {
    return TASK_STATUS.IN_PROGRESS;
  }

  return TASK_STATUS.NOT_STARTED;
}

/**
 * Calculate daily completion percentage across all tasks
 * 
 * @param {Array} tasks - Array of task objects
 * @param {Object} dailyProgress - Object mapping taskId to progress
 * @returns {number} - Daily completion percentage (0-100, rounded)
 * 
 * FORMULA: sum of all task averages / number of tasks
 * 
 * TOOLTIP: "Daily Completion = average progress across all your tasks"
 */
export function calculateDailyCompletion(tasks = [], dailyProgress = {}) {
  if (tasks.length === 0) return 0;

  let totalProgress = 0;

  tasks.forEach(task => {
    const progress = dailyProgress[task._id] || {};
    totalProgress += calculateTaskProgress(progress);
  });

  return Math.round(totalProgress / tasks.length);
}

/**
 * Calculate completion for a specific time period across all tasks
 * 
 * @param {Array} tasks - Array of task objects
 * @param {Object} dailyProgress - Object mapping taskId to progress
 * @param {string} period - 'morning' | 'afternoon' | 'evening' | 'night'
 * @returns {number} - Period completion percentage (0-100, rounded)
 * 
 * TOOLTIP: "Period Completion = average of all task percentages for this time period"
 */
export function calculatePeriodCompletion(tasks = [], dailyProgress = {}, period) {
  if (tasks.length === 0) return 0;

  let total = 0;
  tasks.forEach(task => {
    const progress = dailyProgress[task._id] || {};
    total += progress[period] || 0;
  });

  return Math.round(total / tasks.length);
}

/**
 * Count tasks by status
 * 
 * @param {Array} tasks - Array of task objects
 * @param {Object} dailyProgress - Object mapping taskId to progress
 * @returns {Object} - { fullyCompleted, inProgress, notStarted }
 */
export function countTasksByStatus(tasks = [], dailyProgress = {}) {
  const counts = {
    fullyCompleted: 0,
    inProgress: 0,
    notStarted: 0,
  };

  tasks.forEach(task => {
    const progress = dailyProgress[task._id] || {};
    const status = getTaskStatus(progress);

    switch (status) {
      case TASK_STATUS.FULLY_COMPLETED:
        counts.fullyCompleted++;
        break;
      case TASK_STATUS.IN_PROGRESS:
        counts.inProgress++;
        break;
      case TASK_STATUS.NOT_STARTED:
        counts.notStarted++;
        break;
    }
  });

  return counts;
}

/**
 * Get tasks ranked by progress (Most Progressed Tasks)
 * 
 * @param {Array} tasks - Array of task objects
 * @param {Object} dailyProgress - Object mapping taskId to progress
 * @param {number} limit - Maximum number of tasks to return
 * @returns {Array} - Sorted array of tasks with progress data
 */
export function getMostProgressedTasks(tasks = [], dailyProgress = {}, limit = 5) {
  const tasksWithProgress = tasks.map(task => {
    const progress = dailyProgress[task._id] || {};
    return {
      ...task,
      progress: {
        morning: progress.morning || 0,
        afternoon: progress.afternoon || 0,
        evening: progress.evening || 0,
        night: progress.night || 0,
      },
      averageProgress: calculateTaskProgress(progress),
      status: getTaskStatus(progress),
    };
  });

  // Sort by average progress (descending), then by name (alphabetically)
  return tasksWithProgress
    .sort((a, b) => {
      if (b.averageProgress !== a.averageProgress) {
        return b.averageProgress - a.averageProgress;
      }
      return a.name.localeCompare(b.name);
    })
    .slice(0, limit);
}

/**
 * =============================================================================
 * HISTORICAL CALCULATIONS
 * =============================================================================
 */

/**
 * Calculate streak from daily snapshots
 * 
 * @param {Array} dailySnapshots - Array of { date, completion } objects
 * @param {number} threshold - Minimum completion % to count as active day (default: 50)
 * @returns {Object} - { currentStreak, longestStreak, activeDays }
 * 
 * STREAK RULE: A day counts if completion >= threshold (default 50%)
 */
export function calculateStreak(dailySnapshots = [], threshold = 50) {
  if (dailySnapshots.length === 0) {
    return { currentStreak: 0, longestStreak: 0, activeDays: 0 };
  }

  // Sort by date descending (most recent first)
  const sorted = [...dailySnapshots].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let activeDays = 0;
  let tempStreak = 0;

  sorted.forEach((snapshot, index) => {
    const isActive = snapshot.completion >= threshold;

    if (isActive) {
      activeDays++;
      tempStreak++;

      // Current streak counts consecutive days from today
      if (index === currentStreak) {
        currentStreak++;
      }

      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  });

  return { currentStreak, longestStreak, activeDays };
}

/**
 * Calculate best time period using rolling average over last N days
 * 
 * @param {Array} historicalData - Array of { date, progress: { periodId: { morning, afternoon, evening, night } } }
 * @param {number} days - Number of days to consider (default: 7)
 * @returns {Object|null} - { period, name, averageCompletion } or null if not enough data
 * 
 * TOOLTIP: "Highest Output Window = your most productive time period over the last 7 days"
 */
export function calculateBestTimePeriod(historicalData = [], days = 7) {
  if (historicalData.length < 3) {
    return null; // Not enough data
  }

  const recentData = historicalData.slice(0, days);
  
  const periodTotals = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  };

  const periodCounts = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  };

  recentData.forEach(day => {
    if (day.periodAverages) {
      TIME_PERIODS.forEach(period => {
        if (day.periodAverages[period] !== undefined) {
          periodTotals[period] += day.periodAverages[period];
          periodCounts[period]++;
        }
      });
    }
  });

  // Calculate averages
  const periodAverages = {};
  TIME_PERIODS.forEach(period => {
    periodAverages[period] = periodCounts[period] > 0 
      ? Math.round(periodTotals[period] / periodCounts[period])
      : 0;
  });

  // Find best period
  let bestPeriod = 'morning';
  let bestValue = periodAverages.morning;

  TIME_PERIODS.forEach(period => {
    if (periodAverages[period] > bestValue) {
      bestValue = periodAverages[period];
      bestPeriod = period;
    }
  });

  const periodNames = {
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    night: 'Night',
  };

  return {
    period: bestPeriod,
    name: periodNames[bestPeriod],
    averageCompletion: bestValue,
    allAverages: periodAverages,
  };
}

/**
 * Calculate weakest time period (for insights)
 * 
 * @param {Array} historicalData - Same as calculateBestTimePeriod
 * @param {number} days - Number of days to consider
 * @returns {Object|null} - { period, name, averageCompletion } or null
 */
export function calculateWeakestTimePeriod(historicalData = [], days = 7) {
  const result = calculateBestTimePeriod(historicalData, days);
  if (!result) return null;

  const { allAverages } = result;
  
  let worstPeriod = 'morning';
  let worstValue = allAverages.morning;

  TIME_PERIODS.forEach(period => {
    if (allAverages[period] < worstValue) {
      worstValue = allAverages[period];
      worstPeriod = period;
    }
  });

  const periodNames = {
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    night: 'Night',
  };

  return {
    period: worstPeriod,
    name: periodNames[worstPeriod],
    averageCompletion: worstValue,
  };
}

/**
 * =============================================================================
 * COLOR CODING UTILITIES
 * =============================================================================
 */

/**
 * Get color for a percentage value
 * Used for badges, progress bars, and visual indicators
 * 
 * @param {number} percentage - 0-100
 * @returns {Object} - { color, bgColor, textColor, label }
 */
export function getPercentageColor(percentage) {
  if (percentage === 100) {
    return {
      color: '#10b981', // Emerald
      bgColor: 'rgba(16, 185, 129, 0.15)',
      textColor: '#10b981',
      label: 'Complete',
    };
  }
  if (percentage >= 80) {
    return {
      color: '#8b5cf6', // Purple
      bgColor: 'rgba(139, 92, 246, 0.15)',
      textColor: '#8b5cf6',
      label: 'Almost There',
    };
  }
  if (percentage >= 50) {
    return {
      color: '#fbbf24', // Amber
      bgColor: 'rgba(251, 191, 36, 0.15)',
      textColor: '#fbbf24',
      label: 'Good Progress',
    };
  }
  if (percentage >= 20) {
    return {
      color: '#f97316', // Orange
      bgColor: 'rgba(249, 115, 22, 0.15)',
      textColor: '#f97316',
      label: 'Getting Started',
    };
  }
  return {
    color: '#6b7280', // Gray
    bgColor: 'rgba(107, 114, 128, 0.15)',
    textColor: '#6b7280',
    label: 'Not Started',
  };
}

/**
 * Get status badge styling
 * 
 * @param {string} status - TASK_STATUS value
 * @returns {Object} - { color, bgColor, text }
 */
export function getStatusBadge(status) {
  switch (status) {
    case TASK_STATUS.FULLY_COMPLETED:
      return {
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.15)',
        text: 'Completed',
        icon: '✓',
      };
    case TASK_STATUS.IN_PROGRESS:
      return {
        color: '#fbbf24',
        bgColor: 'rgba(251, 191, 36, 0.15)',
        text: 'In Progress',
        icon: '○',
      };
    case TASK_STATUS.NOT_STARTED:
    default:
      return {
        color: '#6b7280',
        bgColor: 'rgba(107, 114, 128, 0.15)',
        text: 'Not Started',
        icon: '—',
      };
  }
}

/**
 * =============================================================================
 * TOOLTIP TEXT CONSTANTS
 * =============================================================================
 */

export const TOOLTIPS = {
  DAILY_COMPLETION: 'Daily Completion = average progress across all your tasks. Each task\'s progress is the average of its 4 time periods.',
  TASK_PROGRESS: 'Task Progress = average of Morning, Afternoon, Evening, and Night percentages.',
  FULLY_COMPLETED: 'A task is fully completed when all 4 time periods are at 100%.',
  IN_PROGRESS: 'A task is in progress when at least one time period has been started.',
  PERIOD_COMPLETION: 'Period Completion = average of all task percentages for this time period.',
  HIGHEST_OUTPUT: 'Your most productive time period based on the last 7 days of data.',
  ACTIVE_DAYS: 'Days where your overall completion was 50% or higher.',
  EXECUTION_PATTERN: 'Shows your task completion consistency over the past week.',
};

/**
 * =============================================================================
 * INSIGHT GENERATION
 * =============================================================================
 */

/**
 * Generate a single primary insight for the day
 * 
 * @param {Object} data - { dailyCompletion, bestPeriod, worstPeriod, taskCounts }
 * @returns {Object} - { message, type: 'success'|'warning'|'info', icon }
 */
export function generateDailyInsight(data) {
  const { dailyCompletion, worstPeriod, taskCounts } = data;

  // Celebration for 100%
  if (dailyCompletion === 100) {
    return {
      message: 'Perfect day! You completed all tasks at 100%.',
      type: 'success',
      icon: '🎉',
    };
  }

  // All tasks fully completed
  if (taskCounts && taskCounts.fullyCompleted === taskCounts.total) {
    return {
      message: 'Amazing! All your tasks are fully completed today.',
      type: 'success',
      icon: '🌟',
    };
  }

  // Good progress overall
  if (dailyCompletion >= 80) {
    return {
      message: 'Excellent progress today! Keep up the momentum.',
      type: 'success',
      icon: '💪',
    };
  }

  // Actionable insight about worst period
  if (worstPeriod && dailyCompletion >= 30 && dailyCompletion < 80) {
    return {
      message: `Your ${worstPeriod.name.toLowerCase()}s are weakest (${worstPeriod.averageCompletion}%) — focus there tomorrow.`,
      type: 'warning',
      icon: '💡',
    };
  }

  // Low completion
  if (dailyCompletion < 30 && dailyCompletion > 0) {
    return {
      message: 'You\'ve started today. Keep building momentum!',
      type: 'info',
      icon: '📈',
    };
  }

  // No progress yet
  return {
    message: 'Ready to start? Pick your most important task.',
    type: 'info',
    icon: '🚀',
  };
}
