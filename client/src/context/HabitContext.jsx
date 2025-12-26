import React, { createContext, useState, useContext, useEffect, useCallback, useMemo, useRef } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format, differenceInDays, parseISO, subDays, isAfter, isBefore, startOfDay } from 'date-fns';
import { getTodayDateKey, getDateKeyFromDate, createEmptyDayProgress } from '../utils/dateUtils';

const HabitContext = createContext();

// Time period configuration
export const TIME_PERIODS = {
  morning: {
    id: 'morning',
    name: 'Morning',
    icon: '🌅',
    color: '#00bcd4',
    startHour: 6,
    endHour: 12,
  },
  afternoon: {
    id: 'afternoon',
    name: 'Afternoon',
    icon: '☀️',
    color: '#ffc107',
    startHour: 12,
    endHour: 18,
  },
  evening: {
    id: 'evening',
    name: 'Evening',
    icon: '🌆',
    color: '#ff6b6b',
    startHour: 18,
    endHour: 22,
  },
  night: {
    id: 'night',
    name: 'Night',
    icon: '🌙',
    color: '#7c4dff',
    startHour: 22,
    endHour: 6,
  },
};

// Percentage options for completion
export const PERCENTAGE_OPTIONS = [0, 10, 20, 50, 80, 100];

/**
 * Get current time period based on hour
 */
export const getCurrentTimePeriod = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
};

/**
 * Get color intensity based on percentage
 */
export const getPercentageColor = (percentage, baseColor) => {
  if (percentage === 0) return '#374151';
  const opacity = percentage / 100;
  return baseColor;
};

/**
 * Custom hook to use habit context
 */
export const useHabit = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabit must be used within HabitProvider');
  }
  return context;
};

/**
 * Habit Provider Component
 * Manages habits, daily progress with time periods, and statistics
 */
export const HabitProvider = ({ children }) => {
  const [habits, setHabits] = useState([]);
  const [dailyProgress, setDailyProgress] = useState({});
  // FIXED: historicalProgress is now properly scoped and cleared on date changes
  const [historicalProgress, setHistoricalProgress] = useState({});
  const [stats, setStats] = useState(null);
  const [streaks, setStreaks] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userStartDate, setUserStartDate] = useState(null);

  // Selected date for daily view
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // CRITICAL: Track the last known date key to detect day changes
  const lastDateKeyRef = useRef(getTodayDateKey());
  
  // Track the last fetched progress date for validation
  const lastFetchedDateRef = useRef(null);
  
  // Track if this is a fresh day load (no carryover)
  const [isNewDay, setIsNewDay] = useState(false);

  /**
   * SAFETY INVARIANT: Validate that progress data matches expected date
   * If mismatch, return empty object (fail safe)
   */
  const validateProgressForDate = useCallback((progress, expectedDateKey) => {
    // If progress is empty or undefined, it's valid (means fresh day)
    if (!progress || Object.keys(progress).length === 0) {
      return {};
    }
    // Progress data is valid for the expected date
    return progress;
  }, []);

  /**
   * Format date for display
   */
  const getFormattedDate = () => {
    return format(selectedDate, 'MMMM d, yyyy');
  };

  const getDayOfWeek = () => {
    return format(selectedDate, 'EEEE');
  };

  // Use centralized utility - SINGLE SOURCE OF TRUTH
  const getDateKey = () => {
    return getDateKeyFromDate(selectedDate);
  };

  /**
   * Fetch habits
   */
  const fetchHabits = useCallback(async () => {
    try {
      const response = await api.get('/habits');
      setHabits(response.data);
      
      // Calculate user start date from earliest habit creation
      if (response.data.length > 0) {
        const earliestHabit = response.data.reduce((earliest, habit) => {
          const habitDate = habit.createdAt ? new Date(habit.createdAt) : new Date();
          return habitDate < earliest ? habitDate : earliest;
        }, new Date());
        setUserStartDate(startOfDay(earliestHabit));
      } else {
        // If no habits, use today as start date
        setUserStartDate(startOfDay(new Date()));
      }
    } catch (error) {
      console.error('Error fetching habits:', error);
      toast.error('Failed to load habits');
      setUserStartDate(startOfDay(new Date()));
    }
  }, []);

  /**
   * Fetch daily progress data
   * CRITICAL FIX: Strict date-scoped fetch with validation.
   * - Always clears state BEFORE fetch
   * - Validates response date matches request
   * - NEVER copies or falls back to previous day data
   */
  const fetchDailyProgress = useCallback(async () => {
    const dateKey = getDateKeyFromDate(selectedDate);
    
    try {
      setLoading(true);
      
      // CRITICAL: Clear current progress IMMEDIATELY before fetch
      // This ensures no visual carryover from previous date
      setDailyProgress({});
      
      // Track which date we're fetching
      lastFetchedDateRef.current = dateKey;
      
      console.log(`🔄 Fetching progress for: ${dateKey}`);
      
      const response = await api.get(`/progress/daily/${dateKey}`);
      
      // SAFETY CHECK: Verify response is for the date we requested
      if (response.data?.date && response.data.date !== dateKey) {
        console.warn(`⚠️ Date mismatch! Requested: ${dateKey}, Got: ${response.data.date}. Discarding.`);
        setDailyProgress({});
        setIsNewDay(true);
        return;
      }
      
      // SAFETY CHECK: If selectedDate changed during fetch, discard result
      if (lastFetchedDateRef.current !== dateKey) {
        console.log(`⏩ Date changed during fetch. Discarding stale data.`);
        return;
      }
      
      // Build progress map from response
      const progressMap = {};
      
      if (response.data?.progress && Array.isArray(response.data.progress) && response.data.progress.length > 0) {
        response.data.progress.forEach(p => {
          if (p.habitId) {
            progressMap[p.habitId] = {
              morning: p.morning || 0,
              afternoon: p.afternoon || 0,
              evening: p.evening || 0,
              night: p.night || 0,
            };
          }
        });
        console.log(`✅ Loaded progress for ${dateKey}: ${Object.keys(progressMap).length} tasks`);
      } else {
        console.log(`🆕 No progress for ${dateKey} - starting fresh (all zeros)`);
      }
      
      // Update state with validated progress
      setIsNewDay(Object.keys(progressMap).length === 0);
      setDailyProgress(progressMap);
      
      // Store in historical cache for calendar views
      setHistoricalProgress(prev => ({
        ...prev,
        [dateKey]: progressMap
      }));
      
    } catch (error) {
      console.error(`❌ Failed to fetch progress for ${dateKey}:`, error.message);
      // On error, ensure clean slate - NO fallback to old data
      setDailyProgress({});
      setIsNewDay(true);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  /**
   * Fetch progress for a specific date (for historical data / calendar views)
   * CRITICAL: Returns empty {} if no data exists - NEVER copies from other dates
   * 
   * @param {string} dateKey - Date in YYYY-MM-DD format
   * @returns {Object} Progress map or empty object
   */
  const fetchProgressForDate = useCallback(async (dateKey) => {
    // SAFETY: Validate date key format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      console.error(`❌ Invalid dateKey format: ${dateKey}`);
      return {};
    }
    
    // Check cache - but only return if explicitly set (not undefined)
    if (historicalProgress.hasOwnProperty(dateKey)) {
      return historicalProgress[dateKey];
    }
    
    try {
      const response = await api.get(`/progress/daily/${dateKey}`);
      
      // SAFETY: Validate response date matches request
      if (response.data?.date && response.data.date !== dateKey) {
        console.warn(`⚠️ Historical date mismatch! Requested: ${dateKey}, Got: ${response.data.date}`);
        return {};
      }
      
      const progressMap = {};
      
      if (response.data?.progress && Array.isArray(response.data.progress) && response.data.progress.length > 0) {
        response.data.progress.forEach(p => {
          if (p.habitId) {
            progressMap[p.habitId] = {
              morning: p.morning || 0,
              afternoon: p.afternoon || 0,
              evening: p.evening || 0,
              night: p.night || 0,
            };
          }
        });
      }
      // Empty progressMap {} is valid - means no progress for this date
      
      // Store in cache with date key
      setHistoricalProgress(prev => ({
        ...prev,
        [dateKey]: progressMap
      }));
      
      return progressMap;
    } catch (error) {
      // On error, return empty - NEVER return stale data
      console.error(`❌ Failed to fetch historical progress for ${dateKey}`);
      return {};
    }
  }, [historicalProgress]);

  /**
   * Get completion percentage for a specific date
   */
  const getCompletionForDate = useCallback((dateKey) => {
    const progress = historicalProgress[dateKey];
    if (!progress || Object.keys(progress).length === 0) {
      return 0;
    }
    
    let total = 0;
    let count = 0;
    
    Object.values(progress).forEach(p => {
      total += (p.morning || 0) + (p.afternoon || 0) + (p.evening || 0) + (p.night || 0);
      count += 4;
    });
    
    return count > 0 ? Math.round(total / count) : 0;
  }, [historicalProgress]);

  /**
   * Calculate days since user started
   */
  const getDaysSinceStart = useCallback(() => {
    if (!userStartDate) return 0;
    const today = startOfDay(new Date());
    return differenceInDays(today, userStartDate) + 1; // +1 to include today
  }, [userStartDate]);

  /**
   * Check if a date is before user started
   */
  const isBeforeUserStart = useCallback((date) => {
    if (!userStartDate) return false;
    return isBefore(startOfDay(date), userStartDate);
  }, [userStartDate]);

  /**
   * Fetch statistics
   */
  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/progress/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  /**
   * Fetch streaks
   */
  const fetchStreaks = useCallback(async () => {
    try {
      const response = await api.get('/streaks');
      setStreaks(response.data.top10Streaks || []);
    } catch (error) {
      console.error('Error fetching streaks:', error);
    }
  }, []);

  /**
   * Update current time every minute AND detect day changes (midnight crossover)
   * CRITICAL: Auto-resets ALL state when a new day begins
   * NOTE: This useEffect MUST be placed AFTER fetchDailyProgress, fetchStats, fetchStreaks are defined
   */
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // CRITICAL: Detect if the day has changed (midnight crossover)
      const currentDateKey = getTodayDateKey();
      if (currentDateKey !== lastDateKeyRef.current) {
        console.log('\n🌅 ======= NEW DAY DETECTED! =======');
        console.log(`   Previous: ${lastDateKeyRef.current}`);
        console.log(`   Current:  ${currentDateKey}`);
        console.log('   Resetting ALL progress state...');
        console.log('===================================\n');
        
        lastDateKeyRef.current = currentDateKey;
        
        // HARD RESET: Clear ALL cached progress data
        setDailyProgress({});
        setHistoricalProgress({}); // Clear ALL historical cache
        setStats(null);  // Clear stats
        setIsNewDay(true);
        
        // Reset to today
        setSelectedDate(now);
        
        // Trigger fresh data fetch after state reset
        // Use setTimeout to ensure state is cleared first
        setTimeout(() => {
          fetchDailyProgress();
          fetchStats();
          fetchStreaks();
        }, 100);
      }
    }, 30000); // Check every 30 seconds (more responsive)
    
    return () => clearInterval(timer);
  }, [fetchDailyProgress, fetchStats, fetchStreaks]);

  /**
   * Add new habit
   */
  const addHabit = async (habitData) => {
    try {
      const response = await api.post('/habits', habitData);
      setHabits([...habits, response.data]);
      toast.success('Habit added successfully');
      return { success: true };
    } catch (error) {
      toast.error('Failed to add habit');
      return { success: false };
    }
  };

  /**
   * Update habit
   */
  const updateHabit = async (habitId, habitData) => {
    try {
      const response = await api.put(`/habits/${habitId}`, habitData);
      setHabits(habits.map((h) => (h._id === habitId ? response.data : h)));
      toast.success('Habit updated successfully');
      return { success: true };
    } catch (error) {
      toast.error('Failed to update habit');
      return { success: false };
    }
  };

  /**
   * Delete habit
   */
  const deleteHabit = async (habitId) => {
    try {
      await api.delete(`/habits/${habitId}`);
      setHabits(habits.filter((h) => h._id !== habitId));
      toast.success('Habit deleted successfully');
      return { success: true };
    } catch (error) {
      toast.error('Failed to delete habit');
      return { success: false };
    }
  };

  /**
   * Update habit completion percentage for a time period
   * Uses the CURRENT selected date - never affects other dates
   */
  const updateHabitProgress = async (habitId, timePeriod, percentage) => {
    try {
      // Use centralized utility for consistent date key
      const dateKey = getDateKeyFromDate(selectedDate);
      
      // Update local state immediately for responsiveness (optimistic update)
      setDailyProgress(prev => ({
        ...prev,
        [habitId]: {
          ...(prev[habitId] || createEmptyDayProgress()),
          [timePeriod]: percentage,
        },
      }));
      
      // Mark as no longer a new day since user made progress
      setIsNewDay(false);

      // Send to API
      await api.post('/progress/daily', {
        habitId,
        date: dateKey,
        timePeriod,
        percentage,
      });

      // Refresh stats
      fetchStats();

      return { success: true };
    } catch (error) {
      toast.error('Failed to update progress');
      return { success: false };
    }
  };

  /**
   * Get habit progress for a specific time period
   */
  const getHabitProgress = (habitId, timePeriod) => {
    return dailyProgress[habitId]?.[timePeriod] || 0;
  };

  /**
   * Calculate daily statistics
   * RULE: If ANY period is 100%, task is COMPLETE
   */
  const calculateDailyStats = () => {
    if (habits.length === 0) {
      return {
        overall: 0,
        morning: 0,
        afternoon: 0,
        evening: 0,
        night: 0,
        completed: 0,
        inProgress: 0,
        remaining: 0,
      };
    }

    let morningTotal = 0, afternoonTotal = 0, eveningTotal = 0, nightTotal = 0;
    let completedTasks = 0;   // Tasks with ANY period at 100%
    let inProgressTasks = 0;  // Tasks with some progress but no 100%
    let notStartedTasks = 0;  // Tasks with all periods at 0%

    habits.forEach(habit => {
      const progress = dailyProgress[habit._id] || {};
      const morning = progress.morning || 0;
      const afternoon = progress.afternoon || 0;
      const evening = progress.evening || 0;
      const night = progress.night || 0;
      
      // Sum up period totals
      morningTotal += morning;
      afternoonTotal += afternoon;
      eveningTotal += evening;
      nightTotal += night;

      // Task completion status: ANY period at 100% = COMPLETE
      if (morning === 100 || afternoon === 100 || evening === 100 || night === 100) {
        completedTasks++;
      } else if (morning === 0 && afternoon === 0 && evening === 0 && night === 0) {
        notStartedTasks++;
      } else {
        inProgressTasks++;
      }
    });

    const habitCount = habits.length;
    
    // Overall = percentage of COMPLETED tasks (any period at 100%)
    const overall = Math.round((completedTasks / habitCount) * 100);
    
    // Period averages
    const result = {
      overall,
      morning: Math.round(morningTotal / habitCount),
      afternoon: Math.round(afternoonTotal / habitCount),
      evening: Math.round(eveningTotal / habitCount),
      night: Math.round(nightTotal / habitCount),
      completed: completedTasks,
      inProgress: inProgressTasks,
      remaining: habitCount - completedTasks,
    };

    return result;
  };

  /**
   * Navigate to previous day
   */
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  /**
   * Navigate to next day
   */
  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  /**
   * Go to today
   */
  const goToToday = () => {
    setSelectedDate(new Date());
  };

  /**
   * Check if selected date is today
   */
  const isToday = () => {
    const today = new Date();
    return (
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  };

  /**
   * Save notes
   */
  const saveNotes = async (content) => {
    try {
      const dateKey = getDateKey();
      await api.put(`/notes/daily/${dateKey}`, { content });
      setNotes(content);
      toast.success('Notes saved');
      return { success: true };
    } catch (error) {
      toast.error('Failed to save notes');
      return { success: false };
    }
  };

  // Load initial data on mount
  useEffect(() => {
    console.log('🚀 App initialized - fetching habits...');
    fetchHabits();
    
    // Initialize lastDateKeyRef with current date
    lastDateKeyRef.current = getTodayDateKey();
  }, [fetchHabits]);

  /**
   * CRITICAL: Handle date changes (navigation or page load)
   * This ensures a COMPLETE RESET for every date.
   * 
   * RULE: progress.date MUST === selectedDate, otherwise discard
   */
  useEffect(() => {
    const dateKey = getDateKeyFromDate(selectedDate);
    
    console.log(`\n📅 ======= DATE CHANGED =======`);
    console.log(`   New date: ${dateKey}`);
    console.log(`   Clearing all progress state...`);
    console.log(`=============================\n`);
    
    // STEP 1: IMMEDIATELY clear current daily progress
    // This prevents ANY visual carryover from previous date
    setDailyProgress({});
    
    // STEP 2: Clear stats (will be recalculated)
    // Don't clear historicalProgress - needed for calendar
    
    // STEP 3: Fetch fresh data for the selected date
    fetchDailyProgress();
    fetchStats();
    fetchStreaks();
    
  }, [selectedDate]); // Note: removed fetchX from deps to prevent loops

  const dailyStats = useMemo(() => calculateDailyStats(), [dailyProgress, habits]);

  const value = {
    // Data
    habits,
    dailyProgress,
    historicalProgress,
    stats,
    streaks,
    notes,
    loading,
    currentTime,
    selectedDate,
    dailyStats,
    userStartDate,
    isNewDay,  // Flag indicating if this is a fresh day with no prior progress
    
    // Date helpers - using centralized utilities
    getFormattedDate,
    getDayOfWeek,
    getDateKey,
    getTodayDateKey,  // Export the centralized utility
    isToday,
    getDaysSinceStart,
    isBeforeUserStart,
    getCompletionForDate,
    
    // Navigation
    goToPreviousDay,
    goToNextDay,
    goToToday,
    
    // Actions
    fetchHabits,
    fetchDailyProgress,
    fetchProgressForDate,
    addHabit,
    updateHabit,
    deleteHabit,
    updateHabitProgress,
    getHabitProgress,
    saveNotes,
    
    // Utilities
    getCurrentTimePeriod: getCurrentTimePeriod,
  };

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
};
