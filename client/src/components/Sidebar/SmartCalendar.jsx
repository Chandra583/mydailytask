import React, { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, isAfter, startOfDay } from 'date-fns';
import { useHabit } from '../../context/HabitContext';
import { Calendar, Clock, Sun, Sunrise, Sunset, Moon } from 'lucide-react';

// Period icons mapping
const PERIOD_ICONS = {
  morning: Sun,
  afternoon: Sunrise,
  evening: Sunset,
  night: Moon,
};

/**
 * Smart Calendar Component
 * Modern 2025 design with glassmorphism and Lucide icons
 */
const SmartCalendar = () => {
  const { 
    selectedDate, 
    goToToday, 
    historicalProgress, 
    dailyStats,
    fetchProgressForDate,
    isBeforeUserStart,
    userStartDate
  } = useHabit();

  const [hoveredDate, setHoveredDate] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day of week for first day to add empty cells
  const startDayOfWeek = monthStart.getDay();
  const emptyDays = Array(startDayOfWeek).fill(null);

  // Fetch progress data for all visible days
  useEffect(() => {
    const fetchMonthData = async () => {
      for (const day of days) {
        if (!isAfter(day, new Date()) && !isBeforeUserStart(day)) {
          const dateKey = format(day, 'yyyy-MM-dd');
          await fetchProgressForDate(dateKey);
        }
      }
    };
    fetchMonthData();
  }, [days, fetchProgressForDate, isBeforeUserStart]);

  // Calculate completion for a specific date
  const getCompletionForDay = useCallback((date) => {
    const today = startOfDay(new Date());
    const dateKey = format(date, 'yyyy-MM-dd');
    
    // Future dates - no data
    if (isAfter(startOfDay(date), today)) {
      return { completion: 0, isFuture: true };
    }
    
    // Before user started
    if (isBeforeUserStart(date)) {
      return { completion: 0, isBeforeStart: true };
    }
    
    // Today - use current dailyStats
    if (isToday(date)) {
      return { completion: dailyStats?.overall || 0, isToday: true };
    }
    
    // Past dates - use historical progress
    const progress = historicalProgress[dateKey];
    if (!progress || Object.keys(progress).length === 0) {
      return { completion: 0 };
    }
    
    let total = 0;
    let count = 0;
    let periodCompletion = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    let periodCount = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    
    Object.values(progress).forEach(p => {
      total += (p.morning || 0) + (p.afternoon || 0) + (p.evening || 0) + (p.night || 0);
      count += 4;
      periodCompletion.morning += p.morning || 0;
      periodCompletion.afternoon += p.afternoon || 0;
      periodCompletion.evening += p.evening || 0;
      periodCompletion.night += p.night || 0;
      periodCount.morning += 1;
      periodCount.afternoon += 1;
      periodCount.evening += 1;
      periodCount.night += 1;
    });
    
    const overallCompletion = count > 0 ? Math.round(total / count) : 0;
    
    return {
      completion: overallCompletion,
      taskCount: Object.keys(progress).length,
      periods: {
        morning: periodCount.morning > 0 ? Math.round(periodCompletion.morning / periodCount.morning) : 0,
        afternoon: periodCount.afternoon > 0 ? Math.round(periodCompletion.afternoon / periodCount.afternoon) : 0,
        evening: periodCount.evening > 0 ? Math.round(periodCompletion.evening / periodCount.evening) : 0,
        night: periodCount.night > 0 ? Math.round(periodCompletion.night / periodCount.night) : 0,
      }
    };
  }, [historicalProgress, dailyStats, isBeforeUserStart]);

  // Get color based on completion percentage
  const getColorByCompletion = (percentage, isBeforeStart = false, isFuture = false) => {
    if (isBeforeStart || isFuture) return { bg: '#1e293b', text: 'text-gray-600' }; // Dark gray
    if (percentage === 0) return { bg: '#374151', text: 'text-gray-500' }; // No tasks/data
    if (percentage < 25) return { bg: '#ef4444', text: 'text-white' }; // Red - poor
    if (percentage < 50) return { bg: '#f97316', text: 'text-white' }; // Orange - below average
    if (percentage < 75) return { bg: '#fbbf24', text: 'text-gray-900' }; // Yellow - good
    if (percentage < 90) return { bg: '#4ade80', text: 'text-gray-900' }; // Light green - very good
    return { bg: '#10b981', text: 'text-white' }; // Bright green - excellent
  };

  // Handle hover for tooltip
  const handleMouseEnter = (e, date, data) => {
    const rect = e.target.getBoundingClientRect();
    setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top });
    setHoveredDate({ date, data });
  };

  const handleMouseLeave = () => {
    setHoveredDate(null);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="glass-card p-5 relative hover-lift">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title flex items-center gap-2">
          <Calendar size={18} className="text-cyan-400" />
          {format(selectedDate, 'MMMM yyyy')}
        </h3>
        <button
          onClick={goToToday}
          className="btn-ghost text-xs flex items-center gap-1"
        >
          <Clock size={12} />
          Today
        </button>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-gray-500 text-xs font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month starts */}
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square"></div>
        ))}

        {/* Actual days */}
        {days.map((day) => {
          const data = getCompletionForDay(day);
          const colorStyle = getColorByCompletion(data.completion, data.isBeforeStart, data.isFuture);
          const isCurrentDay = isToday(day);
          const isSelected = isSameDay(day, selectedDate);

          return (
            <div
              key={day.toISOString()}
              className={`aspect-square flex items-center justify-center rounded text-xs font-medium transition-all cursor-pointer hover:scale-110 relative ${
                isCurrentDay ? 'ring-2 ring-cyan-400' : ''
              } ${
                isSelected ? 'ring-2 ring-accent-pink' : ''
              } ${
                data.isBeforeStart || data.isFuture ? 'opacity-40' : ''
              }`}
              style={{ backgroundColor: colorStyle.bg }}
              onMouseEnter={(e) => handleMouseEnter(e, day, data)}
              onMouseLeave={handleMouseLeave}
            >
              <span className={`${colorStyle.text} ${isCurrentDay ? 'font-bold' : ''}`}>
                {format(day, 'd')}
              </span>
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      {hoveredDate && (
        <div 
          className="fixed z-50 bg-primary-slate p-3 rounded-lg shadow-xl border border-gray-600 min-w-48 transform -translate-x-1/2 -translate-y-full -mt-2"
          style={{ 
            left: tooltipPosition.x, 
            top: tooltipPosition.y 
          }}
        >
          <div className="text-white font-bold text-sm mb-1">
            {format(hoveredDate.date, 'MMMM d, yyyy')}
          </div>
          <div className="text-gray-400 text-xs mb-2">
            {format(hoveredDate.date, 'EEEE')}
          </div>
          
          {hoveredDate.data.isBeforeStart ? (
            <div className="text-gray-500 text-xs">Before you started - no data</div>
          ) : hoveredDate.data.isFuture ? (
            <div className="text-gray-500 text-xs">Future date - no data yet</div>
          ) : (
            <>
              <div className="border-t border-gray-600 pt-2 mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400 text-xs">Task Completion:</span>
                  <span 
                    className="font-bold text-sm"
                    style={{ color: getColorByCompletion(hoveredDate.data.completion).bg }}
                  >
                    {hoveredDate.data.completion}%
                  </span>
                </div>
                
                {hoveredDate.data.taskCount && (
                  <div className="text-gray-400 text-xs mb-2">
                    Tracking {hoveredDate.data.taskCount} task{hoveredDate.data.taskCount !== 1 ? 's' : ''}
                  </div>
                )}
                
                {hoveredDate.data.periods && (
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className="flex items-center gap-1">
                      <span>🌅</span>
                      <span className="text-gray-400">Morning:</span>
                      <span className="text-white">{hoveredDate.data.periods.morning}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>☀️</span>
                      <span className="text-gray-400">Afternoon:</span>
                      <span className="text-white">{hoveredDate.data.periods.afternoon}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>🌆</span>
                      <span className="text-gray-400">Evening:</span>
                      <span className="text-white">{hoveredDate.data.periods.evening}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>🌙</span>
                      <span className="text-gray-400">Night:</span>
                      <span className="text-white">{hoveredDate.data.periods.night}%</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="text-gray-400 text-xs">Less</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#374151' }} title="0%"></div>
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }} title="1-24%"></div>
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f97316' }} title="25-49%"></div>
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fbbf24' }} title="50-74%"></div>
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4ade80' }} title="75-89%"></div>
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }} title="90-100%"></div>
          </div>
          <span className="text-gray-400 text-xs">More</span>
        </div>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded ring-2 ring-cyan-400"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded opacity-40" style={{ backgroundColor: '#1e293b' }}></div>
            <span>No data</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartCalendar;
