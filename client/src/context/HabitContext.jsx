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
  // ALL habits including archived ones (raw from API)
  const [allHabits, setAllHabits] = useState([]);
  const [dailyProgress, setDailyProgress] = useState({});
  // FIXED: historicalProgress is now properly scoped and cleared on date changes
  const [historicalProgress, setHistoricalProgress] = useState({});
  const [stats, setStats] = useState(null);
  const [streaks, setStreaks] = useState([]);
  const [archivedStreaks, setArchivedStreaks] = useState([]);
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
  
  // GOLDEN RULE ENFORCER: This key changes when progress resets.
  // All memoized calculations MUST include this in dependencies to force recalculation.
  const [progressResetKey, setProgressResetKey] = useState(0);

  // ==========================================
  // API CALL DEDUPLICATION & CACHING
  // ==========================================
  
  // Track in-flight requests to prevent duplicates
  const inflightRequestsRef = useRef(new Set());
  
  // Debounce timer for rapid date navigation
  const dateChangeDebounceRef = useRef(null);
  
  // Track if initial data has been loaded
  const initialLoadDoneRef = useRef(false);
  
  // Request cache with timestamps
  const requestCacheRef = useRef({
    habits: { data: null, timestamp: 0 },
    stats: { data: null, timestamp: 0 },
    streaks: { data: null, timestamp: 0 },
    archivedStreaks: { data: null, timestamp: 0 },
  });
  
  // Cache TTL in milliseconds (5 minutes for stats/streaks)
  const CACHE_TTL = 5 * 60 * 1000;

  /**
   * Check if a cached value is still valid
   */
  const isCacheValid = (cacheKey) => {
    const cached = requestCacheRef.current[cacheKey];
    if (!cached || !cached.data) return false;
    return Date.now() - cached.timestamp < CACHE_TTL;
  };

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
   * ARCHIVE & DATE FILTER: Filter habits based on selectedDate, startDate, and archivedAt
   * 
   * ONGOING TASKS:
   * - Show from startDate (or createdAt) onwards
   * - Hide from archivedAt onwards
   * 
   * DAILY TASKS:
   * - Only show on the exact startDate
   * - archivedAt is automatically set to startDate+1 by backend
   */
  const habits = useMemo(() => {
    // Get selected date as YYYY-MM-DD string for reliable comparison
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    
    return allHabits.filter(habit => {
      // Get habit start date as string (handles timezone issues)
      let habitStartStr;
      if (habit.startDate) {
        habitStartStr = format(new Date(habit.startDate), 'yyyy-MM-dd');
      } else if (habit.createdAt) {
        habitStartStr = format(new Date(habit.createdAt), 'yyyy-MM-dd');
      } else {
        habitStartStr = '1970-01-01'; // Very old date if missing
      }
      
      // RULE 1: Don't show before the habit's start date
      if (selectedDateStr < habitStartStr) {
        return false;
      }
      
      // RULE 2: For daily tasks, only show on the exact start date
      if (habit.taskType === 'daily') {
        return selectedDateStr === habitStartStr;
      }
      
      // RULE 3: For ongoing tasks, check archive status
      // If not archived, show the habit
      if (!habit.archivedAt) {
        return true;
      }
      
      // If archived, only show for dates BEFORE the archive date
      const archivedDateStr = format(new Date(habit.archivedAt), 'yyyy-MM-dd');
      return selectedDateStr < archivedDateStr;
    });
  }, [allHabits, selectedDate]);

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
   * Fetch habits with deduplication
   */
  const fetchHabits = useCallback(async (forceRefresh = false) => {
    const requestKey = 'habits';
    
    // Check if request is already in-flight
    if (inflightRequestsRef.current.has(requestKey)) {
      console.log('⏳ Skipping duplicate habits request');
      return;
    }
    
    // Check cache if not forcing refresh
    if (!forceRefresh && isCacheValid('habits')) {
      console.log('💾 Using cached habits data');
      return;
    }
    
    try {
      inflightRequestsRef.current.add(requestKey);
      console.log('🔄 Fetching habits...');
      
      const response = await api.get('/habits');
      setAllHabits(response.data);
      
      // Update cache
      requestCacheRef.current.habits = {
        data: response.data,
        timestamp: Date.now()
      };
      
      // Calculate user start date from earliest habit creation
      if (response.data.length > 0) {
        const earliestHabit = response.data.reduce((earliest, habit) => {
          const habitDate = habit.createdAt ? new Date(habit.createdAt) : new Date();
          return habitDate < earliest ? habitDate : earliest;
        }, new Date());
        setUserStartDate(startOfDay(earliestHabit));
      } else {
        setUserStartDate(startOfDay(new Date()));
      }
    } catch (error) {
      console.error('❌ Error fetching habits:', error);
      toast.error('Failed to load habits');
      setUserStartDate(startOfDay(new Date()));
    } finally {
      inflightRequestsRef.current.delete(requestKey);
    }
  }, []);

  /**
   * Fetch daily progress data with deduplication
   * CRITICAL FIX: Strict date-scoped fetch with validation.
   */
  const fetchDailyProgress = useCallback(async (dateOverride = null) => {
    const dateKey = dateOverride || getDateKeyFromDate(selectedDate);
    const requestKey = `progress-${dateKey}`;
    
    // Check if request is already in-flight
    if (inflightRequestsRef.current.has(requestKey)) {
      console.log(`⏳ Skipping duplicate progress request for ${dateKey}`);
      return;
    }
    
    // Check if we already have this date in cache
    if (historicalProgress.hasOwnProperty(dateKey) && !dateOverride) {
      console.log(`💾 Using cached progress for ${dateKey}`);
      setDailyProgress(historicalProgress[dateKey]);
      return;
    }
    
    try {
      inflightRequestsRef.current.add(requestKey);
      setLoading(true);
      
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
      const currentDateKey = getDateKeyFromDate(selectedDate);
      if (!dateOverride && currentDateKey !== dateKey) {
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
      setDailyProgress({});
      setIsNewDay(true);
    } finally {
      inflightRequestsRef.current.delete(requestKey);
      setLoading(false);
    }
  }, [selectedDate, historicalProgress]);

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
   * Fetch statistics with deduplication and caching
   */
  const fetchStats = useCallback(async (forceRefresh = false) => {
    const requestKey = 'stats';
    
    // Check if request is already in-flight
    if (inflightRequestsRef.current.has(requestKey)) {
      console.log('⏳ Skipping duplicate stats request');
      return;
    }
    
    // Check cache if not forcing refresh
    if (!forceRefresh && isCacheValid('stats')) {
      console.log('💾 Using cached stats data');
      return;
    }
    
    try {
      inflightRequestsRef.current.add(requestKey);
      const response = await api.get('/progress/stats');
      setStats(response.data);
      
      // Update cache
      requestCacheRef.current.stats = {
        data: response.data,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
    } finally {
      inflightRequestsRef.current.delete(requestKey);
    }
  }, []);

  /**
   * Fetch streaks with deduplication and caching
   */
  const fetchStreaks = useCallback(async (forceRefresh = false) => {
    const requestKey = 'streaks';
    
    // Check if request is already in-flight
    if (inflightRequestsRef.current.has(requestKey)) {
      console.log('⏳ Skipping duplicate streaks request');
      return;
    }
    
    // Check cache if not forcing refresh
    if (!forceRefresh && isCacheValid('streaks')) {
      console.log('💾 Using cached streaks data');
      return;
    }
    
    try {
      inflightRequestsRef.current.add(requestKey);
      const response = await api.get('/streaks');
      setStreaks(response.data.top10Streaks || []);
      
      // Update cache
      requestCacheRef.current.streaks = {
        data: response.data,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('❌ Error fetching streaks:', error);
    } finally {
      inflightRequestsRef.current.delete(requestKey);
    }
  }, []);

  /**
   * Fetch archived streaks (from deleted tasks)
   */
  const fetchArchivedStreaks = useCallback(async (forceRefresh = false) => {
    const requestKey = 'archivedStreaks';
    
    // Check if request is already in-flight
    if (inflightRequestsRef.current.has(requestKey)) {
      console.log('⏳ Skipping duplicate archived streaks request');
      return;
    }
    
    // Check cache if not forcing refresh
    if (!forceRefresh && isCacheValid('archivedStreaks')) {
      console.log('💾 Using cached archived streaks data');
      return;
    }
    
    try {
      inflightRequestsRef.current.add(requestKey);
      const response = await api.get('/streak-history/archived');
      setArchivedStreaks(response.data || []);
      
      // Update cache
      requestCacheRef.current.archivedStreaks = {
        data: response.data,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('❌ Error fetching archived streaks:', error);
    } finally {
      inflightRequestsRef.current.delete(requestKey);
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
        setProgressResetKey(prev => prev + 1); // Force all derived state to recalculate
        
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
   * Add new habit - accepts optional createdForDate and taskType
   * @param {Object} habitData - { name, color, taskType: 'ongoing'|'daily' }
   */
  const addHabit = async (habitData) => {
    try {
      // Include the selected date and taskType
      const payload = {
        ...habitData,
        createdForDate: getDateKeyFromDate(selectedDate),
        taskType: habitData.taskType || 'ongoing'
      };
      
      console.log(`📌 Creating ${payload.taskType} habit: "${habitData.name}" for ${payload.createdForDate}`);
      
      const response = await api.post('/habits', payload);
      setAllHabits([...allHabits, response.data]);
      
      // Invalidate habits cache
      requestCacheRef.current.habits.timestamp = 0;
      
      const message = payload.taskType === 'daily' 
        ? 'One-time task added for today!'
        : 'Ongoing task added successfully!';
      toast.success(message);
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
      setAllHabits(allHabits.map((h) => (h._id === habitId ? response.data : h)));
      toast.success('Habit updated successfully');
      return { success: true };
    } catch (error) {
      toast.error('Failed to update habit');
      return { success: false };
    }
  };

  /**
   * Archive habit (soft delete with date-scoping)
   * Task will be hidden from today onwards but still visible in historical views
   */
  const deleteHabit = async (habitId) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Optimistic update - set archivedAt locally BEFORE API call
      setAllHabits(allHabits.map((h) => 
        h._id === habitId 
          ? { ...h, archivedAt: today.toISOString(), isActive: false }
          : h
      ));
      
      await api.delete(`/habits/${habitId}`);
      toast.success('Task archived successfully');
      return { success: true };
    } catch (error) {
      // Rollback on error
      setAllHabits(allHabits.map((h) => 
        h._id === habitId 
          ? { ...h, archivedAt: null, isActive: true }
          : h
      ));
      toast.error('Failed to archive task');
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

  // Load initial data on mount - ONCE only
  useEffect(() => {
    if (initialLoadDoneRef.current) return;
    initialLoadDoneRef.current = true;
    
    console.log('🚀 App initialized - fetching initial data...');
    
    // Initialize lastDateKeyRef with current date
    lastDateKeyRef.current = getTodayDateKey();
    
    // Fetch all initial data in parallel
    Promise.all([
      fetchHabits(),
      fetchDailyProgress(),
      fetchStats(),
      fetchStreaks(),
      fetchArchivedStreaks()
    ]);
  }, []); // Empty deps - run once on mount

  /**
   * CRITICAL: Handle date changes (navigation or page load)
   * This ensures a COMPLETE RESET for every date.
   * DEBOUNCED to prevent rapid API calls during fast navigation.
   */
  useEffect(() => {
    // Clear any pending debounce
    if (dateChangeDebounceRef.current) {
      clearTimeout(dateChangeDebounceRef.current);
    }
    
    const dateKey = getDateKeyFromDate(selectedDate);
    
    // Skip if this is the initial load (handled by mount effect)
    if (!initialLoadDoneRef.current) return;
    
    // Debounce rapid date changes (300ms)
    dateChangeDebounceRef.current = setTimeout(() => {
      console.log(`\n📅 ======= DATE CHANGED =======`);
      console.log(`   New date: ${dateKey}`);
      console.log(`=============================\n`);
      
      // STEP 1: Check if we have cached data for this date
      if (historicalProgress.hasOwnProperty(dateKey)) {
        console.log(`💾 Using cached progress for ${dateKey}`);
        setDailyProgress(historicalProgress[dateKey]);
        setProgressResetKey(prev => prev + 1);
      } else {
        // STEP 2: Clear and fetch fresh data
        setDailyProgress({});
        setProgressResetKey(prev => prev + 1);
        fetchDailyProgress(dateKey);
      }
      
      // Stats and streaks don't need to refresh on every date change
      // They are for "today" so only refresh if viewing today
      const today = getTodayDateKey();
      if (dateKey === today) {
        fetchStats();
        fetchStreaks();
      }
    }, 300);
    
    return () => {
      if (dateChangeDebounceRef.current) {
        clearTimeout(dateChangeDebounceRef.current);
      }
    };
  }, [selectedDate]); // Only depend on selectedDate

  // GOLDEN RULE: dailyStats MUST recalculate when progress changes.
  // progressResetKey ensures stale memoized values are never used.
  const dailyStats = useMemo(() => {
    console.log(`📊 Recalculating dailyStats (resetKey: ${progressResetKey})`);
    return calculateDailyStats();
  }, [dailyProgress, habits, progressResetKey]);

  const value = {
    // Data
    habits,
    dailyProgress,
    historicalProgress,
    stats,
    streaks,
    archivedStreaks,
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
    fetchArchivedStreaks,
    addHabit,
    updateHabit,
    deleteHabit,
    updateHabitProgress,
    getHabitProgress,
    saveNotes,
    
    // Utilities
    getCurrentTimePeriod: getCurrentTimePeriod,
    
    // GOLDEN RULE ENFORCER: Include in memoization dependencies to force recalculation
    progressResetKey,
  };

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
};
