import React, { useEffect, useCallback } from 'react';
import { useHabit, TIME_PERIODS, getCurrentTimePeriod } from '../../context/HabitContext';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  User,
  LogOut,
  Calendar,
  LayoutDashboard,
  Keyboard
} from 'lucide-react';

// Map period IDs to Lucide icons
const PERIOD_ICONS = {
  morning: Sun,
  afternoon: Sunrise,
  evening: Sunset,
  night: Moon,
};

// Time period colors matching design requirements
const PERIOD_COLORS = {
  morning: '#06b6d4',    // Cyan
  afternoon: '#fbbf24',  // Yellow
  evening: '#fb7185',    // Coral
  night: '#a855f7',      // Purple
};

/**
 * New Dashboard Header - Modern fitness app style
 * Features: Logo, Date Navigation, User Profile, Time Period Filters
 */
const NewDashboardHeader = ({ activeFilter, onFilterChange }) => {
  const { 
    selectedDate, 
    getFormattedDate, 
    goToPreviousDay, 
    goToNextDay, 
    goToToday,
    isToday,
    currentTime 
  } = useHabit();
  const { user, logout } = useAuth();
  const currentPeriod = getCurrentTimePeriod();

  const timePeriods = Object.values(TIME_PERIODS);

  // Keyboard shortcuts for date navigation
  const handleKeyDown = useCallback((e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToPreviousDay();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToNextDay();
    } else if (e.key === 't' || e.key === 'T') {
      e.preventDefault();
      goToToday();
    }
  }, [goToPreviousDay, goToNextDay, goToToday]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-40">
      {/* Top Row - Logo, Date, User */}
      <div className="max-w-[1600px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left - Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <LayoutDashboard size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-tight">Daily Task Tracker</h1>
              <p className="text-slate-400 text-xs">Track your progress</p>
            </div>
          </div>

          {/* Center - Date Navigation with Labels */}
          <div className="flex items-center gap-1">
            <button
              onClick={goToPreviousDay}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all group"
              title="Previous Day (← arrow key)"
            >
              <ChevronLeft size={18} />
              <span className="text-xs hidden sm:inline group-hover:text-white">Prev</span>
            </button>

            <button 
              onClick={goToToday}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all min-w-[240px] justify-center group"
              title="Click to go to Today (T key)"
            >
              <Calendar size={16} className="text-indigo-400" />
              <span className="text-white font-semibold">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </span>
              {isToday() ? (
                <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                  Today
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                  Past
                </span>
              )}
            </button>

            <button
              onClick={goToNextDay}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all group"
              title="Next Day (→ arrow key)"
            >
              <span className="text-xs hidden sm:inline group-hover:text-white">Next</span>
              <ChevronRight size={18} />
            </button>
            
            {/* Keyboard shortcut hint */}
            <div className="hidden md:flex items-center gap-1 ml-2 text-slate-500 text-xs">
              <Keyboard size={12} />
              <span>← → T</span>
            </div>
          </div>

          {/* Right - Time & User Profile */}
          <div className="flex items-center gap-3">
            {/* Current Time Badge */}
            <div 
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-white text-sm font-medium"
              style={{ 
                backgroundColor: `${PERIOD_COLORS[currentPeriod]}22`,
                borderColor: `${PERIOD_COLORS[currentPeriod]}44`,
                borderWidth: 1
              }}
            >
              <Clock size={14} style={{ color: PERIOD_COLORS[currentPeriod] }} />
              <span>{format(currentTime, 'h:mm a')}</span>
              <span className="text-slate-400">•</span>
              <span style={{ color: PERIOD_COLORS[currentPeriod] }}>
                {TIME_PERIODS[currentPeriod].name}
              </span>
            </div>

            {/* User Profile Dropdown */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row - Time Period Filter Pills with Clear States */}
      <div className="max-w-[1600px] mx-auto px-4 pb-3">
        <div className="flex items-center justify-center gap-2">
          {/* All Filter */}
          <button
            onClick={() => onFilterChange('all')}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-lg shadow-white/20 scale-105'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white opacity-60 hover:opacity-100'
            }`}
          >
            📅 All Periods
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-700" />

          {/* Time Period Filters with Clear Active/Inactive States */}
          {timePeriods.map((period) => {
            const Icon = PERIOD_ICONS[period.id];
            const isActive = activeFilter === period.id;
            const isCurrent = currentPeriod === period.id;
            const color = PERIOD_COLORS[period.id];
            
            return (
              <button
                key={period.id}
                onClick={() => onFilterChange(period.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'shadow-lg scale-105'
                    : isCurrent
                      ? 'opacity-80 hover:opacity-100'
                      : 'opacity-50 hover:opacity-80'
                }`}
                style={{ 
                  backgroundColor: isActive ? color : `${color}22`,
                  color: isActive ? 'white' : color,
                  boxShadow: isActive ? `0 4px 20px ${color}40` : 'none'
                }}
                title={isCurrent ? `${period.name} (Current Period)` : period.name}
              >
                <Icon size={16} />
                <span>{period.name}</span>
                {isCurrent && (
                  <span className="relative flex h-2 w-2">
                    <span 
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: isActive ? 'white' : color }}
                    />
                    <span 
                      className="relative inline-flex rounded-full h-2 w-2"
                      style={{ backgroundColor: isActive ? 'white' : color }}
                    />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Filter hint */}
        <p className="text-center text-slate-500 text-xs mt-2">
          {activeFilter === 'all' 
            ? 'Showing all time periods'
            : `Filtered to ${TIME_PERIODS[activeFilter]?.name} only`
          }
        </p>
      </div>
    </header>
  );
};

export default NewDashboardHeader;
