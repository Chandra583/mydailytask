import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format, differenceInDays, parseISO, subDays, isAfter, isBefore, startOfDay } from 'date-fns';

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
  const [historicalProgress, setHistoricalProgress] = useState({}); // Store progress for multiple dates
  const [stats, setStats] = useState(null);
  const [streaks, setStreaks] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userStartDate, setUserStartDate] = useState(null); // Track when user started

  // Selected date for daily view
  const [selectedDate, setSelectedDate] = useState(new Date());

  /**
   * Format date for display
   */
  const getFormattedDate = () => {
    return format(selectedDate, 'MMMM d, yyyy');
  };

  const getDayOfWeek = () => {
    return format(selectedDate, 'EEEE');
  };

  const getDateKey = () => {
    return format(selectedDate, 'yyyy-MM-dd');
  };

  /**
   * Update current time every minute
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

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
   */
  const fetchDailyProgress = useCallback(async () => {
    try {
      setLoading(true);
      const dateKey = getDateKey();
      const response = await api.get(`/progress/daily/${dateKey}`);
      
      // Convert array to object keyed by habitId
      const progressMap = {};
      if (response.data && response.data.progress) {
        response.data.progress.forEach(p => {
          progressMap[p.habitId] = {
            morning: p.morning || 0,
            afternoon: p.afternoon || 0,
            evening: p.evening || 0,
            night: p.night || 0,
          };
        });
      }
      setDailyProgress(progressMap);
      
      // Also store in historical progress
      setHistoricalProgress(prev => ({
        ...prev,
        [dateKey]: progressMap
      }));
    } catch (error) {
      // If no data exists for this date, initialize empty
      setDailyProgress({});
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  /**
   * Fetch progress for a specific date (for historical data)
   */
  const fetchProgressForDate = useCallback(async (dateKey) => {
    // If already fetched, return cached data
    if (historicalProgress[dateKey]) {
      return historicalProgress[dateKey];
    }
    
    try {
      const response = await api.get(`/progress/daily/${dateKey}`);
      const progressMap = {};
      if (response.data && response.data.progress) {
        response.data.progress.forEach(p => {
          progressMap[p.habitId] = {
            morning: p.morning || 0,
            afternoon: p.afternoon || 0,
            evening: p.evening || 0,
            night: p.night || 0,
          };
        });
      }
      
      // Store in historical progress
      setHistoricalProgress(prev => ({
        ...prev,
        [dateKey]: progressMap
      }));
      
      return progressMap;
    } catch (error) {
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
   */
  const updateHabitProgress = async (habitId, timePeriod, percentage) => {
    try {
      const dateKey = getDateKey();
      
      // Update local state immediately for responsiveness
      setDailyProgress(prev => ({
        ...prev,
        [habitId]: {
          ...(prev[habitId] || { morning: 0, afternoon: 0, evening: 0, night: 0 }),
          [timePeriod]: percentage,
        },
      }));

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
        remaining: 0,
      };
    }

    let morningTotal = 0, afternoonTotal = 0, eveningTotal = 0, nightTotal = 0;
    let completed = 0, remaining = 0;

    habits.forEach(habit => {
      const progress = dailyProgress[habit._id] || {};
      morningTotal += progress.morning || 0;
      afternoonTotal += progress.afternoon || 0;
      eveningTotal += progress.evening || 0;
      nightTotal += progress.night || 0;

      // Count 100% completions
      if (progress.morning === 100) completed++;
      if (progress.afternoon === 100) completed++;
      if (progress.evening === 100) completed++;
      if (progress.night === 100) completed++;

      // Count remaining (not 100%)
      if ((progress.morning || 0) < 100) remaining++;
      if ((progress.afternoon || 0) < 100) remaining++;
      if ((progress.evening || 0) < 100) remaining++;
      if ((progress.night || 0) < 100) remaining++;
    });

    const habitCount = habits.length;
    const overall = (morningTotal + afternoonTotal + eveningTotal + nightTotal) / (habitCount * 4);

    const result = {
      overall: Math.round(overall),
      morning: Math.round(morningTotal / habitCount),
      afternoon: Math.round(afternoonTotal / habitCount),
      evening: Math.round(eveningTotal / habitCount),
      night: Math.round(nightTotal / habitCount),
      completed,
      remaining,
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

  // Load initial data
  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  useEffect(() => {
    fetchDailyProgress();
    fetchStats();
    fetchStreaks();
  }, [selectedDate, fetchDailyProgress, fetchStats, fetchStreaks]);

  const dailyStats = calculateDailyStats();

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
    
    // Date helpers
    getFormattedDate,
    getDayOfWeek,
    getDateKey,
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
