import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Trophy, Flame, Loader2 } from 'lucide-react';
import api from '../../utils/api';

/**
 * Monthly Progress Chart
 * Shows calendar heatmap for entire month with navigation
 * Fetches data from /api/progress/monthly-overview/:year/:month
 */
const MonthlyProgressChart = () => {
  const [monthData, setMonthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Format month for display
  function formatMonth(year, month) {
    return `${monthNames[month - 1]} ${year}`;
  }

  // Fetch monthly data
  const fetchMonthlyData = useCallback(async (year, month) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/progress/monthly-overview/${year}/${month}`);
      setMonthData(response.data);
    } catch (err) {
      console.error('Failed to fetch monthly progress:', err);
      setError('Failed to load monthly data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonthlyData(currentMonth.year, currentMonth.month);
  }, [currentMonth, fetchMonthlyData]);

  // Navigation handlers
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 1) {
        return { year: prev.year - 1, month: 12 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const goToNextMonth = () => {
    const now = new Date();
    const isCurrentMonth = currentMonth.year === now.getFullYear() && 
                           currentMonth.month === now.getMonth() + 1;
    if (!isCurrentMonth) {
      setCurrentMonth(prev => {
        if (prev.month === 12) {
          return { year: prev.year + 1, month: 1 };
        }
        return { year: prev.year, month: prev.month + 1 };
      });
    }
  };

  const goToCurrentMonth = () => {
    const now = new Date();
    setCurrentMonth({ year: now.getFullYear(), month: now.getMonth() + 1 });
  };

  const now = new Date();
  const isCurrentMonth = currentMonth.year === now.getFullYear() && 
                         currentMonth.month === now.getMonth() + 1;
  const canGoNext = !isCurrentMonth;

  // Get heatmap color based on progress
  const getHeatmapColor = (progress, hasData) => {
    if (!hasData) return '#1e293b'; // No data - very dark
    if (progress >= 90) return '#22c55e'; // Bright green
    if (progress >= 70) return '#84cc16'; // Lime
    if (progress >= 50) return '#fbbf24'; // Yellow
    if (progress >= 30) return '#f97316'; // Orange
    if (progress > 0) return '#ef4444'; // Red
    return '#374151'; // Zero progress gray
  };

  // Get text color based on background
  const getTextColor = (progress, hasData) => {
    if (!hasData) return '#4b5563';
    if (progress >= 50) return '#000'; // Dark text on bright backgrounds
    return '#fff';
  };

  if (loading) {
    return (
      <div className="glass-card p-6 flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 h-96 flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!monthData) return null;

  // Build calendar grid
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Create empty cells for days before the 1st
  const emptyDays = Array(monthData.firstDayOfWeek).fill(null);
  
  // Combine empty days with actual days
  const calendarDays = [...emptyDays, ...monthData.dailyProgress];
  
  // Calculate number of weeks
  const totalCells = calendarDays.length;
  const numRows = Math.ceil(totalCells / 7);

  return (
    <div className="glass-card p-5 hover-lift">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-5 h-5 text-gray-300" />
          </button>
          
          <div className="text-center">
            <h3 className="section-title flex items-center gap-2 justify-center">
              <Calendar size={18} className="text-purple-400" />
              MONTHLY OVERVIEW
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              {formatMonth(currentMonth.year, currentMonth.month)}
            </p>
          </div>
          
          <button 
            onClick={goToNextMonth}
            disabled={!canGoNext}
            className={`p-2 rounded-lg transition-colors ${
              canGoNext 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-800 cursor-not-allowed opacity-50'
            }`}
            title="Next Month"
          >
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        <div className="text-right">
          {!isCurrentMonth && (
            <button 
              onClick={goToCurrentMonth}
              className="text-xs text-purple-400 hover:text-purple-300 mb-1 block"
            >
              Go to Current Month →
            </button>
          )}
          <div className="text-gray-400 text-xs uppercase">Monthly Average</div>
          <div className="text-2xl font-bold text-white">{monthData.monthlyAverage}%</div>
        </div>
      </div>

      {/* Calendar Heatmap */}
      <div className="mb-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs text-gray-500 font-medium py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }
            
            const bgColor = getHeatmapColor(day.progress, day.hasData);
            const textColor = getTextColor(day.progress, day.hasData);
            
            return (
              <div
                key={day.date}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all hover:scale-105 cursor-pointer ${
                  day.isToday ? 'ring-2 ring-pink-400 ring-offset-2 ring-offset-gray-900' : ''
                }`}
                style={{ backgroundColor: bgColor }}
                title={`${day.date}: ${day.progress}%`}
              >
                <span 
                  className="text-xs font-medium"
                  style={{ color: textColor }}
                >
                  {day.day}
                </span>
                {day.hasData && (
                  <span 
                    className="text-[10px] font-bold"
                    style={{ color: textColor }}
                  >
                    {day.progress}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-gray-700">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-gray-400 text-xs uppercase mb-1">Monthly Average</div>
          <div className="text-2xl font-bold text-green-400">{monthData.monthlyAverage}%</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-gray-400 text-xs uppercase mb-1">
            <Flame size={14} className="text-orange-400" />
            Longest Streak
          </div>
          <div className="text-2xl font-bold text-orange-400">
            {monthData.longestStreak.streakDays} days
          </div>
          <div className="text-gray-500 text-xs truncate">
            {monthData.longestStreak.habitName}
          </div>
        </div>
      </div>

      {/* Top 5 Habits This Month */}
      {monthData.topHabitsMonthly && monthData.topHabitsMonthly.length > 0 && (
        <div className="pt-4 border-t border-gray-700">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
            <Trophy size={16} className="text-yellow-400" />
            TOP HABITS THIS MONTH
          </h4>
          <div className="space-y-2">
            {monthData.topHabitsMonthly.map((habit, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-2 rounded-lg bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${
                    idx === 0 ? 'text-yellow-400' : 
                    idx === 1 ? 'text-gray-300' : 
                    idx === 2 ? 'text-amber-600' : 'text-gray-500'
                  }`}>
                    #{idx + 1}
                  </span>
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: habit.color || '#3b82f6' }}
                  />
                  <span className="text-gray-200 text-sm">{habit.name}</span>
                </div>
                <div className="text-right">
                  <span 
                    className="font-bold text-sm"
                    style={{ color: getHeatmapColor(habit.completion, true) }}
                  >
                    {habit.completion}%
                  </span>
                  <span className="text-gray-500 text-xs ml-2">
                    ({habit.daysCompleted} days)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Heatmap Legend */}
      <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-gray-700">
        <span className="text-gray-500 text-xs">Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#1e293b' }} title="No data" />
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#374151' }} title="0%" />
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }} title="1-29%" />
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f97316' }} title="30-49%" />
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fbbf24' }} title="50-69%" />
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#84cc16' }} title="70-89%" />
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }} title="90%+" />
        </div>
        <span className="text-gray-500 text-xs">More</span>
      </div>
    </div>
  );
};

export default MonthlyProgressChart;
